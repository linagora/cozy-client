export default class CozyLink {
  constructor(requestHandler, persistHandler) {
    if (typeof requestHandler === 'function') {
      this.request = requestHandler
    }

    if (typeof persistHandler === 'function') {
      this.persistCozyData = persistHandler
    }
  }

  /**
   * Request the given operation from the link
   *
   * @param {any} operation - The operation to request
   * @param {any} options - The request options
   * @param {any} result - The result from the previous request of the chain
   * @param {any} forward - The next request of the chain
   * @returns {Promise<any>}
   */
  async request(operation, options, result, forward) {
    throw new Error('request is not implemented')
  }

  /**
   * Persist the given data into the links storage
   *
   * @param {any} data - The document to persist
   * @param {any} forward - The next persistCozyData of the chain
   * @returns {Promise<any>}
   */
  async persistCozyData(data, forward) {
    throw new Error('persistCozyData is not implemented')
  }

  /**
   * Reset the link data
   *
   * @returns {Promise<any>}
   */
  async reset() {
    throw new Error('reset is not implemented')
  }

  /**
   * Stable name used to target this link via the `forceLink` query option.
   *
   * @returns {string|undefined}
   */
  get name() {
    return undefined
  }
}

const toLink = handler =>
  typeof handler === 'function' ? new CozyLink(handler) : handler

const defaultLinkRequestHandler = (operation, options, result) => {
  if (result) return result
  else if (operation.execute) return operation.execute()
  else
    throw new Error(
      `No link could handle operation ${JSON.stringify(operation)}`
    )
}

const defaultLinkPersistHandler = (operation, result) => {
  // Do nothing
}

const defaultLinkHandler = new CozyLink(
  defaultLinkRequestHandler,
  defaultLinkPersistHandler
)

export const chain = links =>
  [...links, defaultLinkHandler].map(toLink).reduce(concat)

const concat = (firstLink, nextLink) => {
  const requestHandler = (operation, options, result, forward) => {
    const nextForward = (op, opts, res) => {
      return nextLink.request(op, opts, res, forward)
    }
    return firstLink.request(operation, options, result, nextForward)
  }

  const persistHandler = (data, forward) => {
    const nextForward = d => {
      return nextLink.persistCozyData(d, forward)
    }
    return firstLink.persistCozyData(data, nextForward)
  }

  return new CozyLink(requestHandler, persistHandler)
}
