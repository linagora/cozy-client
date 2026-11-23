class ErrorReturned extends String {
  /**
   * We need to catch the error and return a special object in
   * order to be able to delete the memoization if needed
   */
}
/**
 * Delete outdated results from cache
 */
const garbageCollect = (cache, maxDuration) => {
  const now = Date.now()
  for (const key of Object.keys(cache)) {
    const delta = now - cache[key].date
    if (delta > maxDuration) {
      delete cache[key]
    }
  }
}

const isPromise = maybePromise => {
  return (
    typeof maybePromise === 'object' && typeof maybePromise.then === 'function'
  )
}

/**
 * Memoize with maxDuration and custom key
 */
const memoize = (fn, options) => {
  const cache = {}

  return function() {
    const key = options.key.apply(null, arguments)
    garbageCollect(cache, options.maxDuration)
    const existing = cache[key]
    if (existing) {
      return existing.result
    } else {
      const result = fn.apply(this, arguments)
      cache[key] = {
        result,
        date: Date.now()
      }

      /**
       * If the result is a promise and this promise
       * failed or resolved with a specific error (aka ErrorReturned),
       * let's remove the result from the cache since we don't want to
       * memoize error
       */
      if (isPromise(result)) {
        result
          .then(v => {
            if (v instanceof ErrorReturned) {
              delete cache[key]
            }
            return v
          })
          .catch(e => {
            delete cache[key]
          })
      }
      return result
    }
  }
}

export default memoize
export { ErrorReturned }
