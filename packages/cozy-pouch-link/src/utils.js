export const DATABASE_NAME_SEPARATOR = '__doctype__'

/**
 * Get the database name based on prefix and doctype
 *
 * @param {string} prefix - The URL prefix
 * @param {string} doctype - The database doctype
 *
 * @returns {string} The database name
 */
export const getDatabaseName = (prefix, doctype) => {
  return `${prefix}${DATABASE_NAME_SEPARATOR}${doctype}`
}

/**
 * Get the old database name, based on prefix and doctype
 * Used for migration purposes
 *
 * @param {string} prefix - The URL prefix
 * @param {string} doctype - The database doctype
 *
 * @returns {string} The database name
 */
export const getOldDatabaseName = (prefix, doctype) => {
  return `${prefix}_${doctype}`
}

export const getDoctypeFromDatabaseName = dbName => {
  if (!dbName) {
    return null
  }
  const tokens = dbName.split(DATABASE_NAME_SEPARATOR)
  return tokens[tokens.length - 1]
}

/**
 * Get the URI prefix
 *
 * @param {string} uri - The Cozy URI
 * @returns {string} The URI prefix
 */
export const getPrefix = uri => {
  return uri.replace(/^https?:\/\//, '')
}

export const formatAggregatedError = aggregatedError => {
  const strings = aggregatedError.errors.map((e, index) => {
    return '\n[' + index + ']: ' + e.name + ' - ' + e.message + '\n' + e.stack
  })

  return strings.join('\n')
}

/**
 * @typedef {object} FulfilledPromise
 * @property {'fulfilled'} status - The status of the promise
 * @property {undefined} reason - The Error rejected by the promise (undefined when fulfilled)
 * @property {any} value - The resolved value of the promise
 */

/**
 * @typedef {object} RejectedPromise
 * @property {'rejected'} status - The status of the promise
 * @property {Error} reason - The Error rejected by the promise
 * @property {undefined} value - The resolved value of the promise (undefined when rejected)
 */

/**
 * Takes an iterable of promises as input and returns a single Promise.
 * This returned promise fulfills when all of the input's promises settle (including
 * when an empty iterable is passed), with an array of objects that describe the
 * outcome of each promise.
 * This implementation is useful for env with no support of the native Promise.allSettled,
 * typically react-native 0.66
 *
 * @param {Promise[]} promises - Promise to be awaited
 * @returns {Promise<(FulfilledPromise|RejectedPromise)[]>}
 */
export const allSettled = promises => {
  const proms = promises.filter(p => !!p)
  return Promise.all(
    proms.map(promise =>
      promise
        .then(
          value =>
            /** @type {FulfilledPromise} */ ({
              status: 'fulfilled',
              value
            })
        )
        .catch(
          (/** @type {Error} */ reason) =>
            /** @type {RejectedPromise} */ ({
              status: 'rejected',
              reason
            })
        )
    )
  )
}
