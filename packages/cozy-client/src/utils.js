import flag from 'cozy-flags'
import logger from './logger'

/**
 * @typedef {Promise} CancelablePromise
 * @property {Function} cancel - Cancel the promise
 */

/**
 * Wraps a promise so that it can be canceled
 *
 * Rejects with canceled: true as soon as cancel is called
 *
 * @param  {Promise} promise  - Promise
 * @returns {CancelablePromise} - Promise with .cancel method
 */
const cancelable = promise => {
  let _reject

  const wrapped = new Promise((resolve, reject) => {
    _reject = reject
    promise.then(resolve).catch(reject)
  })

  // @ts-ignore
  wrapped.cancel = () => {
    _reject({ canceled: true })
  }

  return wrapped
}

export { cancelable }

/**
 * Returns whether the result of a query (given via queryConnect or Query)
 * is loading.
 */
export const isQueryLoading = col => {
  if (!col) {
    logger.warn('isQueryLoading called on falsy value.')
    return false
  }
  return col.fetchStatus === 'loading' || col.fetchStatus === 'pending'
}

/**
 * Returns whether a query has been loaded at least once
 */
export const hasQueryBeenLoaded = col => {
  return col.lastFetch
}

/**
 * Returns whether the result of queries are loading
 */
export const isQueriesLoading = queriesResults => {
  return Object.values(queriesResults).some(queryResult =>
    isQueryLoading(queryResult)
  )
}

/**
 * Returns whether queries have been loaded at least once
 */
export const hasQueriesBeenLoaded = queriesResults => {
  return Object.values(queriesResults).some(queryResult =>
    hasQueryBeenLoaded(queryResult)
  )
}

/**
 * Check is the error is about ReactNative not having access to internet
 *
 * @param {Error} err - The error to check
 * @returns {boolean} True if the error is a network error, otherwise false
 */
export const isReactNativeOfflineError = err => {
  // This error message is specific to ReactNative
  // Network errors on a browser would produce another error.message
  return err.message === 'Network request failed'
}

/**
 * Check if the instance has a debug flag set to true
 *
 * @returns {boolean} Whether or not the instance is in debug mode
 */
export const isDebug = () => {
  return Boolean(flag('debug'))
}
