import get from 'lodash/get'

import { dontThrowNotFoundError } from './Collection'
import DocumentCollection from './DocumentCollection'
import { FetchError } from './errors'
import { normalizeDoctypeJsonApi } from './normalize'
import * as querystring from './querystring'
import { uri } from './utils'

export const OAUTH_CLIENTS_DOCTYPE = 'io.cozy.oauth.clients'

const normalizeOAuthClient = normalizeDoctypeJsonApi(OAUTH_CLIENTS_DOCTYPE)

/**
 * Implements `DocumentCollection` API to interact with the /settings/clients endpoint of the stack
 */
class OAuthClientsCollection extends DocumentCollection {
  constructor(stackClient) {
    super(OAUTH_CLIENTS_DOCTYPE, stackClient)
  }

  /**
   * Fetches all OAuth clients
   *
   * @param  {object}         options             Query options
   * @param  {number}         [options.limit]     For pagination, the number of results to return.
   * @param  {string}         [options.bookmark]  For bookmark-based pagination, the document _id to start from
   * @param  {Array<string>}  [options.keys]      Ids of specific clients to return (within the current page),
   *
   * @returns {object} The JSON API conformant response.
   */
  async all(options = {}) {
    const { limit = 100, bookmark, keys } = options

    const params = {
      'page[limit]': limit,
      'page[cursor]': bookmark
    }
    const url = uri`/settings/clients`
    const path = querystring.buildURL(url, params)
    let resp
    try {
      resp = await this.stackClient.fetchJSON('GET', path)
    } catch (error) {
      return dontThrowNotFoundError(error)
    }
    const nextLink = get(resp, 'links.next', '')
    const nextLinkURL = new URL(`${this.stackClient.uri}${nextLink}`)
    const nextBookmark =
      nextLinkURL.searchParams.get('page[cursor]') || undefined
    const hasBookmark = nextBookmark !== undefined

    if (keys) {
      const data = resp.data
        .filter(c => keys.includes(c.id))
        .map(c => normalizeOAuthClient(c))
      const meta = { ...resp.meta, count: data.length }

      return {
        data,
        meta,
        next: keys.length > data.length && hasBookmark,
        bookmark: nextBookmark
      }
    } else {
      return {
        data: resp.data.map(c => normalizeOAuthClient(c)),
        meta: resp.meta,
        next: hasBookmark,
        bookmark: nextBookmark
      }
    }
  }

  /**
   * Get an OAuth client by id
   *
   * @param  {string} id The client id.
   * @returns {object}  JsonAPI response containing normalized client as data attribute
   */
  async get(id) {
    let resp = await this.all({ keys: [id] })

    while (resp.next) {
      resp = await this.all({ keys: [id], bookmark: resp.bookmark })
    }

    if (resp.data.length) {
      return {
        data: normalizeOAuthClient(resp.data[0])
      }
    } else {
      resp.url = uri`/settings/clients/${id}`
      resp.status = '404'
      throw new FetchError(resp, 'Not Found')
    }
  }

  /**
   * Destroys the OAuth client on the server
   *
   * @param {object} oauthClient The io.cozy.oauth.clients document to destroy
   *
   * @returns {{ data }} The deleted client
   */
  async destroy(oauthClient) {
    const { _id } = oauthClient
    await this.stackClient.fetchJSON('DELETE', uri`/settings/clients/${_id}`)
    return {
      data: { ...normalizeOAuthClient(oauthClient), _deleted: true }
    }
  }
}

OAuthClientsCollection.normalizeDoctype = normalizeDoctypeJsonApi

export default OAuthClientsCollection
