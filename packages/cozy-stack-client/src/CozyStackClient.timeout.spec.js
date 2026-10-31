/** @jest-environment node */
/* eslint-env jest */

import http from 'http'
import vm from 'vm'

import CozyStackClient from './CozyStackClient'

// The sandbox of this Jest version leaves out these globals of Node: the tests run against the real ones.
Object.assign(
  global,
  vm.runInThisContext('({ fetch, AbortController, AbortSignal, DOMException })')
)

const TIMEOUT = 100

const startServer = () =>
  new Promise(resolve => {
    const server = http.createServer((req, res) => {
      if (req.url === '/mute') return
      if (req.url === '/stalled') {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.write('{')
        return
      }
      if (req.url.startsWith('/files/download/')) {
        res.writeHead(200, { 'Content-Type': 'text/plain' })
        res.write('partial')
        return
      }
      if (req.url === '/slow') {
        setTimeout(() => {
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end('{"ok":true}')
        }, TIMEOUT * 2)
        return
      }
      if (req.url === '/refused') {
        res.writeHead(403, { 'Content-Type': 'application/json' })
        res.end('{"error":"refused"}')
        return
      }
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end('{"ok":true}')
    })
    server.listen(0, '127.0.0.1', () => resolve(server))
  })

describe('CozyStackClient timeout', () => {
  let server, uri, client

  beforeAll(async () => {
    server = await startServer()
    uri = `http://127.0.0.1:${server.address().port}`
  })

  afterAll(() => {
    server.closeAllConnections()
    server.close()
  })

  beforeEach(() => {
    client = new CozyStackClient({ uri, token: 'tok', timeout: TIMEOUT })
  })

  afterEach(() => {
    jest.restoreAllMocks()
    delete global.XMLHttpRequest
  })

  const timeoutError = expect.objectContaining({ name: 'TimeoutError' })

  it('cuts a server that sends no headers, through fetch and fetchJSON', async () => {
    await expect(client.fetch('GET', '/mute')).rejects.toEqual(timeoutError)
    await expect(client.fetchJSON('GET', '/mute')).rejects.toEqual(timeoutError)
  })

  it('cuts a body that stalls, through fetch and fetchJSON', async () => {
    const response = await client.fetch('GET', '/stalled')
    await expect(response.text()).rejects.toEqual(timeoutError)
    await expect(client.fetchJSON('GET', '/stalled')).rejects.toEqual(
      timeoutError
    )
  })

  it('cuts a download that stalls', async () => {
    const response = await client
      .collection('io.cozy.files')
      .fetchFileContentById('file-id')
    await expect(response.blob()).rejects.toEqual(timeoutError)
  })

  it('leaves a request within the time alone, and a stack error as it is', async () => {
    await expect(client.fetchJSON('GET', '/ok')).resolves.toEqual({ ok: true })
    await expect(client.fetchJSON('GET', '/refused')).rejects.toMatchObject({
      name: 'FetchError',
      status: 403
    })
  })

  it('keeps the signal of the caller', async () => {
    const controller = new AbortController()
    const request = client.fetch('GET', '/mute', undefined, {
      signal: controller.signal
    })
    controller.abort(new Error('stopped by the caller'))
    await expect(request).rejects.toThrow('stopped by the caller')
  })

  it('bounds the token refresh', async () => {
    const fetchSpy = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue({ ok: false, statusCode: 500 })
    await expect(client.refreshToken()).rejects.toThrow()
    expect(fetchSpy.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal)
  })

  it('applies to the XMLHttpRequest used for upload progress', async () => {
    let xhr
    global.XMLHttpRequest = class {
      onload = null
      onprogress = null
      upload = { addEventListener: () => {} }
      open() {}
      setRequestHeader() {}
      send() {
        xhr = this
        setTimeout(() => this.ontimeout())
      }
    }
    await expect(
      client.fetchJSON('POST', '/files', 'data', {
        headers: { 'Content-Type': 'text/plain' },
        onUploadProgress: () => {}
      })
    ).rejects.toEqual(timeoutError)
    expect(xhr.timeout).toBe(TIMEOUT)
  })

  describe('without the option', () => {
    beforeEach(() => {
      client = new CozyStackClient({ uri, token: 'tok' })
    })

    it('waits for a slow answer and passes no signal', async () => {
      const fetchSpy = jest.spyOn(global, 'fetch')
      await expect(client.fetchJSON('GET', '/slow')).resolves.toEqual({
        ok: true
      })
      expect(fetchSpy.mock.calls[0][1].signal).toBeUndefined()
      expect(fetchSpy.mock.calls[0][1].timeout).toBeUndefined()
    })
  })
})
