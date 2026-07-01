/** @jest-environment jsdom */
import DataProxyLink from './DataProxyLink'

describe('DataProxyLink name', () => {
  it('should expose a stable name', () => {
    expect(new DataProxyLink().name).toBe('dataproxy')
  })
})

describe('DataProxyLink forceLink', () => {
  it('forwards a forceStack:true query (routes away from dataproxy)', async () => {
    const link = new DataProxyLink()
    const forwardFn = jest.fn().mockResolvedValue(null)
    await link.request(
      { doctype: 'io.cozy.files' },
      { forceStack: true },
      null,
      forwardFn
    )
    expect(forwardFn).toHaveBeenCalled()
  })

  it('handles when forceLink targets it', async () => {
    const link = new DataProxyLink()
    link.registerDataProxy({
      requestLink: jest.fn().mockResolvedValue({ data: [{ _id: '1' }] })
    })
    const forward = jest.fn()
    const res = await link.request(
      { doctype: 'io.cozy.files' },
      { forceLink: 'dataproxy' },
      undefined,
      forward
    )
    expect(forward).not.toHaveBeenCalled()
    expect(res).toEqual({ data: [{ _id: '1' }] })
  })
  it('forwards when forceLink targets another link', async () => {
    const link = new DataProxyLink()
    const forward = jest.fn().mockResolvedValue('forwarded')
    expect(
      await link.request(
        { doctype: 'io.cozy.files' },
        { forceLink: 'stack' },
        undefined,
        forward
      )
    ).toBe('forwarded')
  })
})

describe('DataProxyLink queueing', () => {
  it('should directly call dataproxy requestLink if available', async () => {
    const requestLink = jest.fn().mockResolvedValue('OK')
    const dataproxy = { requestLink }
    const link = new DataProxyLink({ dataproxy })

    const res = await link.request({ op: 'op1' }, {}, undefined, undefined)

    expect(res).toBe('OK')
    expect(requestLink).toHaveBeenCalledTimes(1)
    expect(requestLink).toHaveBeenCalledWith({ op: 'op1' }, {})
  })

  it('should fill the event queue as long as dataproxy is not ready and run all of them once it registers', async () => {
    const link = new DataProxyLink() // no dataproxy

    const p1 = link.request({ op: 'op1' }, {}, undefined, undefined)
    const p2 = link.request({ op: 'op2' }, {}, undefined, undefined)

    expect(link._queue.length).toEqual(2)

    const requestLink = jest
      .fn()
      .mockResolvedValueOnce('Res1')
      .mockResolvedValueOnce('Res2')

    link.registerDataProxy({ requestLink })

    await expect(p1).resolves.toBe('Res1')
    await expect(p2).resolves.toBe('Res2')

    expect(requestLink.mock.calls.map(c => c[0].op)).toEqual(['op1', 'op2'])
    expect(link._queue.length).toEqual(0)
  })

  it('should correctly deal with rejected promises ', async () => {
    const link = new DataProxyLink()

    const pOk1 = link.request({ op: 'op1' }, {})
    const pFail = link.request({ op: 'op2' }, {})
    const pOk2 = link.request({ op: 'op3' }, {})

    const requestLink = jest
      .fn()
      .mockResolvedValueOnce('Res1')
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce('Res3')

    link.registerDataProxy({ requestLink })

    await expect(pOk1).resolves.toBe('Res1')
    await expect(pFail).rejects.toThrow('boom')
    await expect(pOk2).resolves.toBe('Res3')

    expect(requestLink.mock.calls.map(c => c[0].op)).toEqual([
      'op1',
      'op2',
      'op3'
    ])
  })

  it('should flush events when ready message is received', async () => {
    const link = new DataProxyLink()

    const p1 = link.request({ op: 'op1' }, {})
    const p2 = link.request({ op: 'op2' }, {})

    const requestLink = jest
      .fn()
      .mockResolvedValueOnce('Res1')
      .mockResolvedValueOnce('Res2')
    link.dataproxy = { requestLink }

    const ev = new MessageEvent('message', {
      data: { type: 'DATAPROXYMESSAGE', payload: 'READY' },
      origin: 'http://dataproxy.cozy.localhost:8080'
    })
    window.dispatchEvent(ev)

    await expect(p1).resolves.toBe('Res1')
    await expect(p2).resolves.toBe('Res2')
  })
})
