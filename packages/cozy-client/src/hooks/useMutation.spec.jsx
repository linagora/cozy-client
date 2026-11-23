import { renderHook, act } from '@testing-library/react-hooks'

import useClient from './useClient'
import { useMutation } from './useMutation'

jest.mock('./useClient')

describe('useMutation', () => {
  const setup = ({ onSuccess, onError, saveSpy = jest.fn() } = {}) => {
    useClient.mockReturnValue({
      save: saveSpy
    })

    return renderHook(() =>
      useMutation({
        onSuccess,
        onError
      })
    )
  }

  it('should be in pending status', () => {
    const {
      result: { current }
    } = setup()
    expect(current.mutationStatus).toBe('pending')
  })

  it('should be in loading status after mutate', async () => {
    const saveSpy = jest.fn().mockImplementation(() => new Promise(() => {}))

    const { result } = setup({ saveSpy })

    await act(async () => {
      result.current.mutate({
        doctype: 'io.cozy.simpsons'
      })
    })

    expect(result.current.mutationStatus).toBe('loading')
  })

  it('should be in loaded status after mutate', async () => {
    const successSpy = jest.fn()
    const saveSpy = jest.fn().mockResolvedValue({ data: 'test' })
    const { result } = setup({
      onSuccess: successSpy,
      saveSpy
    })

    await act(async () => {
      result.current.mutate({
        doctype: 'io.cozy.simpsons'
      })
    })

    expect(result.current.mutationStatus).toBe('loaded')
    expect(saveSpy).toBeCalledTimes(1)
    expect(successSpy).toBeCalledTimes(1)
    expect(result.current.data).toBe('test')
  })

  it('should be in failed status after mutate', async () => {
    const errorSpy = jest.fn()
    const saveSpy = jest.fn().mockRejectedValue({ error: 'test' })
    const { result } = setup({
      onError: errorSpy,
      saveSpy
    })

    await act(async () => {
      result.current.mutate({
        doctype: 'io.cozy.simpsons'
      })
    })

    expect(result.current.mutationStatus).toBe('failed')
    expect(errorSpy).toBeCalledTimes(1)
    expect(result.current.error).toStrictEqual({ error: 'test' })
  })
})
