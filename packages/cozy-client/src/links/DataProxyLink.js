import CozyLink from './CozyLink'
import logger from 'cozy-logger'
import { resolveForceLink } from './forceLink'

export default class DataProxyLink extends CozyLink {
  /**
   * @param {object} [options] - Options
   * @param  {object} [options.dataproxy] - The dataproxy reference
   */
  constructor({ dataproxy } = {}) {
    super()
    this.dataproxy = dataproxy || null
    this._queue = []
    this._drainingRequests = false

    if (window) {
      window.addEventListener('message', this._onReceiveMessage)
    }
  }

  get name() {
    return 'dataproxy'
  }

  registerClient(client) {
    // does nothing, we don't need any client for this kind of link
  }

  /**
   * When the link is given to a cozy-client instance, the dataproxy might not be ready yet.
   * Thus, this method will be typically called afterwards by the DataProxyProvider once
   * the dataproxy is ready and set
   *
   * @param {object} dataproxy - The dataproxy instance
   */
  registerDataProxy(dataproxy) {
    this.dataproxy = dataproxy
    this._flushQueue()
  }

  async reset() {
    // does nothing, we don't need any client for this kind of link
  }

  async request(operation, options, result, forward) {
    const forceLink = resolveForceLink(options)
    if (forceLink && forceLink !== this.name) {
      return forward(operation, options)
    }
    if (this.dataproxy?.requestLink) {
      return this.doRequest(operation, options)
    }
    // Here we assume the DataProxy is not ready yet for querying, but we'll be eventually.
    // So, we put the request in a queue that will be later flushed
    return new Promise((resolve, reject) => {
      this._queue.push({ operation, options, resolve, reject })
    })
  }

  async doRequest(operation, options) {
    const opts = options || {}
    const startQuery = performance.now()
    // Send the request to the DataProxy, that will handle both web and mobile environments
    const resp = await this.dataproxy.requestLink(operation, opts)
    const endQuery = performance.now()
    logger.info(`Request query took ${endQuery - startQuery} ms`)
    return resp
  }

  async persistCozyData(data, forward) {
    // Persist data should do nothing here as data is already persisted on DataProxy side
    return
  }

  async _flushQueue() {
    if (!this.dataproxy?.requestLink || this._queue.length < 1) {
      return
    }
    logger.info(`Execute ${this._queue.length} delayed requests`)

    this._drainingRequests = true

    try {
      while (this._queue.length > 0) {
        const { operation, options, resolve, reject } = this._queue.shift()
        try {
          const resp = await this.doRequest(operation, options)
          resolve(resp)
        } catch (err) {
          reject(err)
        }
      }
    } finally {
      this._drainingRequests = false
      // Run it again in case queue has filled again during the flush
      if (this._queue.length > 0) {
        this._flushQueue()
      }
    }
  }

  _onReceiveMessage = event => {
    // See https://github.com/cozy/cozy-web-data-proxy/blob/1fc3deef767536aa264074c8a377f422b588409d/src/dataproxy/parent/ParentWindowProvider.tsx#L27
    if (!event.origin.includes('dataproxy')) {
      return
    }
    const eventData = event?.data
    if (eventData && typeof eventData === 'object') {
      if (
        eventData.type === 'DATAPROXYMESSAGE' &&
        eventData.payload === 'READY'
      ) {
        logger.info(`Received message: DataProxy is ready`)
        this._flushQueue()
      }
    }
  }
}
