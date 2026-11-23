import { renderHook } from '@testing-library/react-hooks'
import React from 'react'

import Provider from '../Provider'
import useFetchJSON from './useFetchJSON'

const makeWrapper = client => {
  const Wrapper = ({ children }) => (
    <Provider client={client}>{children}</Provider>
  )
  return Wrapper
}

describe('use fetch json', () => {
  const setup = ({ fetchJSON }) => {
    const mockClient = {
      stackClient: {
        fetchJSON
      }
    }
    const hook = renderHook(() => useFetchJSON('GET', '/my-route'), {
      wrapper: makeWrapper(mockClient)
    })

    return { hook, client: mockClient }
  }

  it('should execute a request through client', async () => {
    const data = { label: 'Doctor appointment' }
    const fetchJSON = jest.fn().mockResolvedValue(data)
    const {
      client,
      hook: { result, waitForNextUpdate }
    } = setup({ fetchJSON })
    expect(result.current).toEqual({
      fetchStatus: 'loading',
      data: null,
      error: null
    })
    await waitForNextUpdate()
    expect(client.stackClient.fetchJSON).toHaveBeenCalledWith(
      'GET',
      '/my-route',
      undefined,
      undefined
    )
    expect(result.current).toEqual({ fetchStatus: 'loaded', data, error: null })
  })

  it('should handle errors', async () => {
    const error = new Error('Error')
    const fetchJSON = jest.fn().mockRejectedValue(error)
    const {
      hook: { result, waitForNextUpdate }
    } = setup({ fetchJSON })
    expect(result.current).toEqual({
      fetchStatus: 'loading',
      data: null,
      error: null
    })
    await waitForNextUpdate()
    expect(result.current).toEqual({ fetchStatus: 'error', data: null, error })
  })
})
