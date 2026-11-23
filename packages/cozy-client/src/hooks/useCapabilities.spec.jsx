import { renderHook } from '@testing-library/react-hooks'

import useCapabilities from './useCapabilities'
describe('useCapabilities', () => {
  const mockClient = { query: jest.fn(), get: jest.fn() }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should change loading status', async () => {
    mockClient.query.mockResolvedValue({ data: [] })
    const { result, waitForNextUpdate } = renderHook(() =>
      useCapabilities(mockClient)
    )
    expect(result.current.fetchStatus).toEqual('loading')
    await waitForNextUpdate()
    expect(result.current.fetchStatus).toEqual('loaded')
  })

  it('should inform when an error occurs', async () => {
    mockClient.query.mockRejectedValue('error')

    const { result, waitForNextUpdate } = renderHook(() =>
      useCapabilities(mockClient)
    )
    expect(result.current.fetchStatus).toEqual('loading')
    await waitForNextUpdate()
    expect(result.current.fetchStatus).toEqual('failed')
  })

  it('should return capabilities for a cozy', async () => {
    mockClient.query.mockResolvedValue({
      data: {
        type: 'io.cozy.settings',
        id: 'io.cozy.settings.capabilities',
        file_versioning: true,
        flat_subdomains: true,
        meta: {},
        links: { self: '/settings/capabilities' }
      }
    })
    const { result, waitForNextUpdate } = renderHook(() =>
      useCapabilities(mockClient)
    )

    await waitForNextUpdate()
    expect(result.current.capabilities).toEqual({
      type: 'io.cozy.settings',
      id: 'io.cozy.settings.capabilities',
      file_versioning: true,
      flat_subdomains: true,
      meta: {},
      links: { self: '/settings/capabilities' }
    })
  })

  it(`should return client's capabilities if defined`, async () => {
    mockClient.capabilities = {
      file_versioning: false,
      flat_subdomains: false
    }
    const { result } = renderHook(() => useCapabilities(mockClient))

    expect(result.current.capabilities).toEqual({
      file_versioning: false,
      flat_subdomains: false
    })
    expect(mockClient.query).not.toHaveBeenCalled()
  })
})
