import { act, renderHook } from '@testing-library/react-hooks'

import useFetchShortcut from './useFetchShortcut'
import { createMockClient } from '../../dist/mock'

describe('useFetchShortcut', () => {
  const mockClient = createMockClient({
    queries: {
      'io.cozy.files.shortcuts/123': {
        doctype: 'io.cozy.files.shortcuts',
        definition: {
          doctype: 'io.cozy.files.shortcuts',
          id: 'io.cozy.files.shortcuts/123'
        },
        data: [
          {
            type: 'io.cozy.files.shortcuts',
            id: 'b7470059d40c88e4bd30031d5e0109d3',
            _id: 'b7470059d40c88e4bd30031d5e0109d3',
            name: 'cozy.url',
            dir_id: '8034db0016d0548ded99b9627e003270',
            url: 'https://cozy.io',
            metadata: { extractor_version: 2 },
            meta: { rev: '1-60e1359e63fa7fa9fa000a2726d5d4c7' }
          }
        ]
      },
      'io.cozy.files.shortcuts/linkToCozyApp': {
        doctype: 'io.cozy.files.shortcuts',
        definition: {
          doctype: 'io.cozy.files.shortcuts',
          id: 'io.cozy.files.shortcuts/linkToCozyApp'
        },
        data: [
          {
            type: 'io.cozy.files.shortcuts',
            id: 'linkToCozyApp',
            _id: '',
            name: 'cozy.url',
            dir_id: '8034db0016d0548ded99b9627e003270',
            url: 'https://cozy.io',
            metadata: {
              extractor_version: 2,
              target: {
                app: 'notes'
              }
            },
            meta: { rev: '1-60e1359e63fa7fa9fa000a2726d5d4c7' }
          }
        ]
      },
      'io.cozy.files.shortcuts/no-found': {
        doctype: 'io.cozy.files.shortcuts',
        queryError: new Error('not found')
      }
    },
    clientOptions: {
      uri: 'https://test.mycozy.cloud'
    }
  })

  it('should change loading status', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useFetchShortcut(mockClient, '123')
    )
    expect(result.current.fetchStatus).toEqual('loading')
    await waitForNextUpdate()
    expect(result.current.fetchStatus).toEqual('loaded')
  })

  it('should inform when an error occurs', async () => {
    mockClient.stackClient.fetchJSON.mockRejectedValue('error')

    const { result, waitForNextUpdate } = renderHook(() =>
      useFetchShortcut(mockClient, 'no-found')
    )
    expect(result.current.fetchStatus).toEqual('loading')
    await waitForNextUpdate()
    expect(result.current.fetchStatus).toEqual('failed')
  })

  it('should return the data of a shortcut and change the display value', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useFetchShortcut(mockClient, '123')
    )

    await waitForNextUpdate()
    expect(result.current.shortcutInfos).toEqual({
      data: {
        _id: 'b7470059d40c88e4bd30031d5e0109d3',
        _type: 'io.cozy.files.shortcuts',
        id: 'b7470059d40c88e4bd30031d5e0109d3',
        type: 'io.cozy.files.shortcuts',
        name: 'cozy.url',
        dir_id: '8034db0016d0548ded99b9627e003270',
        url: 'https://cozy.io',
        metadata: { extractor_version: 2 },
        meta: { rev: '1-60e1359e63fa7fa9fa000a2726d5d4c7' }
      }
    })
    expect(result.current.shortcutImg).toEqual(
      `${mockClient.getStackClient().uri}/bitwarden/icons/cozy.io/icon.png`
    )
  })

  it('should ignore a drive answer resolving after a newer one', async () => {
    const makeDeferred = () => {
      let resolve
      const promise = new Promise(r => {
        resolve = r
      })
      return { promise, resolve }
    }
    const deferred = { driveA: makeDeferred(), driveB: makeDeferred() }
    const spy = jest
      .spyOn(mockClient, 'fetchQueryAndGetFromState')
      .mockImplementation(
        ({ definition }) => deferred[definition.sharingId].promise
      )

    const { result, rerender } = renderHook(
      ({ driveId }) => useFetchShortcut(mockClient, '123', driveId),
      { initialProps: { driveId: 'driveA' } }
    )
    rerender({ driveId: 'driveB' })

    await act(async () => {
      deferred.driveB.resolve({ data: { _id: '123', url: 'https://b.test' } })
      deferred.driveA.resolve({ data: { _id: '123', url: 'https://a.test' } })
    })

    expect(result.current.shortcutInfos.data.url).toEqual('https://b.test')
    spy.mockRestore()
  })

  it('should return shortcutImg for the targeted application icon when available', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useFetchShortcut(mockClient, 'linkToCozyApp')
    )

    await waitForNextUpdate()
    expect(result.current.shortcutImg).toEqual(
      `${mockClient.getStackClient().uri}/registry/notes/icon`
    )
  })
})
