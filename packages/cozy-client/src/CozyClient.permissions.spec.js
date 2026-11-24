/** @jest-environment node */

import http from 'http'
import vm from 'vm'

import CozyClient from './CozyClient'

jest.unmock('cozy-stack-client')

// Jest's sandbox uses a fetch polyfill; use Node's fetch for the real HTTP test.
global.fetch = vm.runInThisContext('fetch')

const token = 'link-report-test-token'
const csv =
  'occurred_at,IP,identity,action\r\n2000-01-01T00:00:00Z,,Élodie,download\r\n'

function startServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      if (req.headers.authorization !== `Bearer ${token}`) {
        res.writeHead(403, { 'Content-Type': 'application/json' })
        res.end('{"message":"Forbidden"}')
      } else if (
        req.method === 'GET' &&
        req.url === '/permissions/permission%2Fid%3F%23/statistics'
      ) {
        res.writeHead(200, { 'Content-Type': 'text/csv; charset=utf-8' })
        res.end(csv)
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' })
        res.end('{"message":"Not found"}')
      }
    })
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => resolve(server))
  })
}

describe('public link statistics', () => {
  let server, uri

  beforeAll(async () => {
    server = await startServer()
    uri = `http://127.0.0.1:${server.address().port}`
  })

  afterAll(() => {
    if (!server) return
    server.closeAllConnections()
    return new Promise((resolve, reject) => {
      server.close(err => (err ? reject(err) : resolve()))
    })
  })

  it('returns the CSV response through the authenticated permission collection', async () => {
    const client = new CozyClient({ uri, token })
    const response = await client
      .collection('io.cozy.permissions')
      .fetchStatistics('permission/id?#')

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('text/csv; charset=utf-8')
    await expect(response.text()).resolves.toBe(csv)
  })

  it.each([
    [403, 'Forbidden', 'wrong-token', 'permission/id?#'],
    [404, 'Not found', token, 'unknown-id']
  ])(
    'rejects a failed export with status %i',
    async (status, message, appToken, permissionId) => {
      const client = new CozyClient({ uri, token: appToken })

      await expect(
        client.collection('io.cozy.permissions').fetchStatistics(permissionId)
      ).rejects.toMatchObject({ name: 'FetchError', status, message })
    }
  )
})
