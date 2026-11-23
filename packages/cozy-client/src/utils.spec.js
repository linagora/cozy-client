import { cancelable } from './utils'

describe('cancelable', () => {
  const setup = () => {
    let original, resolve, reject
    original = new Promise((_resolve, _reject) => {
      resolve = _resolve
      reject = _reject
    })
    const wrapped = cancelable(original)
    return { resolve, reject, wrapped }
  }

  it('should resolve with the result of the promise', async () => {
    const { resolve, wrapped } = setup()
    expect.assertions(1)
    resolve(5)
    await expect(wrapped).resolves.toBe(5)
  })

  it('should reject with the rejection of the promise', async () => {
    jest.spyOn(console, 'log').mockImplementation()
    const error = 'normal-rejection-from-cancelable-test'
    const { reject, wrapped } = setup()
    expect.assertions(1)
    reject(error)
    await expect(wrapped).rejects.toBe(error)
  })

  it('should reject with canceled: true if canceled', async () => {
    const { wrapped } = setup()
    expect.assertions(1)
    wrapped.cancel()
    await expect(wrapped).rejects.toEqual({ canceled: true })
  })
})
