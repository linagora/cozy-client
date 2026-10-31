import cloneDeep from 'lodash/cloneDeep'
import AppCollection, { APPS_DOCTYPE } from './AppCollection'
import AppToken from './AppToken'
import AccessToken from './AccessToken'
import DocumentCollection from './DocumentCollection'
import FileCollection from './FileCollection'
import JobCollection, { JOBS_DOCTYPE } from './JobCollection'
import KonnectorCollection, { KONNECTORS_DOCTYPE } from './KonnectorCollection'
import SharingCollection from './SharingCollection'
import PermissionCollection from './PermissionCollection'
import TriggerCollection, { TRIGGERS_DOCTYPE } from './TriggerCollection'
import SettingsCollection, { SETTINGS_DOCTYPE } from './SettingsCollection'
import NotesCollection, { NOTES_DOCTYPE } from './NotesCollection'
import OAuthClientsCollection, {
  OAUTH_CLIENTS_DOCTYPE
} from './OAuthClientsCollection'
import ShortcutsCollection, { SHORTCUTS_DOCTYPE } from './ShortcutsCollection'
import ContactsCollection, { CONTACTS_DOCTYPE } from './ContactsCollection'
import AppsRegistryCollection, {
  APPS_REGISTRY_DOCTYPE
} from './AppsRegistryCollection'
import getIconURL from './getIconURL'
import logDeprecate from './logDeprecate'
import { fetchWithXMLHttpRequest, shouldXMLHTTPRequestBeUsed } from './xhrFetch'
import MicroEE from 'microee'
import errors, { FetchError } from './errors'
import logger from './logger'
import PromiseCache from './promise-cache'
import {
  NEXTCLOUD_FILES_DOCTYPE,
  NextcloudFilesCollection
} from './NextcloudFilesCollection'

const normalizeUri = uriArg => {
  let uri = uriArg
  if (uri === null) return null
  while (uri[uri.length - 1] === '/') {
    uri = uri.slice(0, -1)
  }
  return uri
}

const getResponseData = async response => {
  const contentType = response.headers.get('content-type')
  const isJson =
    contentType && /\bapplication\/(vnd\.api\+)?json\b/.test(contentType)
  return isJson ? response.json() : response.text()
}

// The signal stays attached to the response, so it also cuts a body that stalls.
const withTimeout = (options, timeout) => {
  if (!timeout) return options
  const signal = AbortSignal.timeout(timeout)
  return {
    ...options,
    timeout,
    signal: options.signal ? AbortSignal.any([options.signal, signal]) : signal
  }
}

/**
 * Main API against the `cozy-stack` server.
 */
class CozyStackClient {
  /**
   * @param {object} [options] - Client options
   * @param {number} [options.timeout] - Time in milliseconds given to each request, from sending it to the end of its response body, large transfers included. A request over it rejects with an error named `TimeoutError`. Without it, requests have no time limit.
   */
  constructor(options) {
    const opts = { ...options }
    const { token, uri = '' } = opts
    this.options = opts
    this.setUri(uri)
    this.setToken(token)

    this.konnectors = new KonnectorCollection(this)
    this.jobs = new JobCollection(this)
    this._promiseCache = new PromiseCache()
  }
  isRevocationError(err) {
    const message = err?.message

    if (!message) return false

    if (
      errors.CLIENT_NOT_FOUND.test(err.message) ||
      errors.UNREGISTERED_CLIENT.test(err.message)
    )
      return true
  }
  /**
   * Creates a {@link DocumentCollection} instance.
   *
   * @param  {string} doctype The collection doctype.
   * @param  {object} options Options to pass to the collection.
   * @returns {DocumentCollection}
   */
  collection(doctype, options = {}) {
    if (!doctype) {
      throw new Error('CozyStackClient.collection() called without a doctype')
    }

    switch (doctype) {
      case APPS_DOCTYPE:
        return new AppCollection(this, options)
      case KONNECTORS_DOCTYPE:
        return new KonnectorCollection(this, options)
      case 'io.cozy.files':
        return new FileCollection(doctype, this, options)
      case 'io.cozy.sharings':
        return new SharingCollection(doctype, this, options)
      case 'io.cozy.permissions':
        return new PermissionCollection(doctype, this, options)
      case CONTACTS_DOCTYPE:
        return new ContactsCollection(doctype, this, options)
      case TRIGGERS_DOCTYPE:
        return new TriggerCollection(this, options)
      case JOBS_DOCTYPE:
        return new JobCollection(this, options)
      case SETTINGS_DOCTYPE:
        return new SettingsCollection(this, options)
      case NOTES_DOCTYPE:
        return new NotesCollection(this, options)
      case OAUTH_CLIENTS_DOCTYPE:
        return new OAuthClientsCollection(this, options)
      case SHORTCUTS_DOCTYPE:
        return new ShortcutsCollection(this, options)
      case APPS_REGISTRY_DOCTYPE:
        return new AppsRegistryCollection(this, options)
      case NEXTCLOUD_FILES_DOCTYPE:
        return new NextcloudFilesCollection(this, options)
      default:
        return new DocumentCollection(doctype, this, options)
    }
  }

  /**
   * Fetches an endpoint in an authorized way.
   *
   * @param  {string} method The HTTP method.
   * @param  {string} path The URI.
   * @param  {object} [body] The payload.
   * @param  {object} [opts={}] Options for fetch
   * @returns {object}
   * @throws {FetchError}
   */
  async fetch(method, path, body, opts = {}) {
    const { throwFetchErrors = this.options.throwFetchErrors, ...options } = {
      ...opts
    }
    options.method = method
    const headers = (options.headers = { ...opts.headers })

    if (method !== 'GET' && method !== 'HEAD' && body !== undefined) {
      if (headers['Content-Type']) {
        options.body = body
      }
    }

    if (!headers.Authorization) {
      headers.Authorization = this.getAuthorizationHeader()
    }

    // the option credentials:include tells fetch to include the cookies in the
    // request even for cross-origin requests
    // it is still prossible to enforce `credentials` value by providing one in the `opts` prop
    options.credentials = options.credentials || 'include'

    const fullPath = this.fullpath(path)

    const fetcher = shouldXMLHTTPRequestBeUsed(method, path, options)
      ? fetchWithXMLHttpRequest
      : fetch

    try {
      const response = await fetcher(
        fullPath,
        withTimeout(options, this.options.timeout)
      )
      if (!response.ok) {
        const reason = await getResponseData(response)
        const err = new FetchError(response, reason)

        // XXX: This was introduced so apps could display errors (e.g. quota
        // errors) via cozy-ui's `useClientErrors()` hook. At the time of
        // writing these lines, this is the only use case of this `error`
        // event.
        this.emit('error', err)

        // XXX: we introduced `throwFetchErrors` because we've seen some direct
        // calls to `this.fetch()` and we're not sure how these callers would
        // react to errors being thrown but it would be best to spend some time
        // to look at these and, in case they're not prepared, change them to
        // handle thrown errors.
        // We could then get rid of `throwFetchErrors`.
        if (throwFetchErrors) throw err
      }
      return response
    } catch (err) {
      if (this.isRevocationError(err)) {
        this.onRevocationChange(true)
      }
      throw err
    }
  }

  onTokenRefresh(token) {
    if (this.options && this.options.onTokenRefresh) {
      this.options.onTokenRefresh(token)
    }
  }

  onRevocationChange(state) {
    if (this.options && this.options.onRevocationChange) {
      this.options.onRevocationChange(state)
    }
  }

  /**
   * Retrieves a new app token by refreshing the currently used token.
   *
   * @throws {Error} The client should already have an access token to use this function
   * @throws {Error} The client couldn't fetch a new token
   * @returns {Promise} A promise that resolves with a new AccessToken object
   */
  async refreshToken() {
    if (!this.token) throw new Error('Cannot refresh an empty token')

    const options = {
      method: 'GET',
      credentials: 'include'
    }

    const response = await fetch(
      '/?refreshToken',
      withTimeout(options, this.options.timeout)
    )

    if (!response.ok) {
      throw new Error(
        "Couldn't fetch a new token - response " + response.statusCode
      )
    }
    const html = await response.text()
    const match = html.match(/data-cozy="([^"]+)"/)
    if (!match || match.length < 2) {
      throw new Error(
        "Couldn't fetch a new token - no data-cozy element found in HTML"
      )
    }
    const htmlCozyData = match[1].replace(/&#34;/g, '"')
    const cozyData = JSON.parse(htmlCozyData)

    const token = cozyData.token
    if (!token) {
      throw Error("Couldn't fetch a new token - missing in data-cozy attribute")
    }
    const newToken = new AppToken(token)
    this.setToken(newToken)
    this.onTokenRefresh(newToken)
    logger.info('Token successfully refreshed')

    return newToken
  }

  /**
   * Fetches JSON in an authorized way.
   *
   * @param  {string} method The HTTP method.
   * @param  {string} path The URI.
   * @param  {object} body The payload.
   * @param  {object} options Options
   * @returns {object}
   * @throws {FetchError}
   */
  async fetchJSON(method, path, body, options = {}) {
    try {
      return await this.fetchJSONWithCurrentToken(method, path, body, options)
    } catch (e) {
      if (
        errors.EXPIRED_TOKEN.test(e.message) ||
        errors.INVALID_TOKEN.test(e.message) ||
        errors.INVALID_TOKEN_ALT.test(e.message)
      ) {
        try {
          await this._promiseCache.exec(
            () => this.refreshToken(),
            () => 'refreshToken'
          )
        } catch (refreshError) {
          throw e
        }
        return await this.fetchJSONWithCurrentToken(method, path, body, options)
      } else {
        throw e
      }
    }
  }

  async fetchJSONWithCurrentToken(method, path, bodyArg, options = {}) {
    //Since we modify the object later by adding in some case a
    //content-type, let's clone this object to scope the modification
    const clonedOptions = cloneDeep(options)
    const headers = (clonedOptions.headers = clonedOptions.headers || {})
    headers['Accept'] = 'application/json'

    let body = bodyArg
    if (method !== 'GET' && method !== 'HEAD' && body !== undefined) {
      if (!headers['Content-Type']) {
        headers['Content-Type'] = 'application/json'
        body = JSON.stringify(body)
      }
    }
    clonedOptions.throwFetchErrors = true
    const resp = await this.fetch(method, path, body, clonedOptions)
    return getResponseData(resp)
  }

  fullpath(path) {
    if (path.startsWith('http')) {
      return path
    } else {
      return this.uri + path
    }
  }

  getAuthorizationHeader() {
    return this.token ? this.token.toAuthHeader() : null
  }

  setCredentials(token) {
    logDeprecate(
      'CozyStackClient::setCredentials is deprecated, use CozyStackClient::setToken'
    )
    return this.setToken(token)
  }

  getCredentials() {
    logDeprecate(
      'CozyStackClient::getCredentials is deprecated, use CozyStackClient::getAuthorizationHeader'
    )
    return this.getAuthorizationHeader()
  }

  /**
   * Change or set the API token
   *
   * @param {string|AppToken|AccessToken} token - Stack API token
   */
  setToken(token) {
    if (!token) {
      this.token = null
    } else {
      if (token.toAuthHeader) {
        // AppToken or AccessToken
        this.token = token
      } else if (typeof token === 'string') {
        // jwt string
        this.token = new AppToken(token)
      } else {
        logger.warn('Cozy-Client: Unknown token format', token)
        throw new Error('Cozy-Client: Unknown token format')
      }
      this.onRevocationChange(false)
    }
  }

  /**
   * Get the access token string, being an oauth token or an app token
   *
   * @returns {string} token
   */
  getAccessToken() {
    return this.token && this.token.getAccessToken()
  }

  setUri(uri) {
    this.uri = normalizeUri(uri)
  }

  getIconURL(opts) {
    return getIconURL(this, opts)
  }
}

MicroEE.mixin(CozyStackClient)
export default CozyStackClient
