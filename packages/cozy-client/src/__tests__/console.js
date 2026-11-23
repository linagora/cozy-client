/**
 * Calls callback while ignoring console[type] calls
 *
 * Useful for tests that we know will use console[type] but we do not
 * want to them to trigger an exception during tests.
 */
const withIgnoreConsole = type => async callback => {
  let original = console[type]
  console[type] = () => {}
  try {
    const res = callback()
    if (res.then) {
      await res
    }
  } finally {
    console[type] = original
  }
}

export const withIgnoreConsoleWarn = withIgnoreConsole('warn')
export const withIgnoreConsoleError = withIgnoreConsole('error')

/**
 * Override console.warn and error to throw
 */
export const setupConsoleToThrow = () => {
  let originalWarn = console.warn
  console.warn = function () {
    originalWarn.apply(this, arguments)
    throw new Error('console.warn should not be called during tests')
  }

  let originalError = console.error
  console.error = function () {
    originalError.apply(this, arguments)
    throw new Error('console.error should not be called during tests')
  }
}
