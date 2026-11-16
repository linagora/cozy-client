import DocumentCollection from './DocumentCollection'
import { normalizeFile } from './FileCollection'
import { normalizeDoctypeJsonApi } from './normalize'
import * as querystring from './querystring'

/**
 * Doctype of the personal recents of the user: the files and folders they
 * edited or opened, sorted by their last activity.
 *
 * @type {string}
 */
export const FILE_RECENTS_DOCTYPE = 'io.cozy.files.recents'

const normalizeRecentJsonApi = normalizeDoctypeJsonApi(FILE_RECENTS_DOCTYPE)

/**
 * Normalize a recent. Its `file` relationship is rewritten with `_id` and
 * `_type`, so that a has-one association finds the included file in the store.
 * It stays `null` for an item the user can no longer read.
 *
 * @param {object} recent - A resource of the JSON:API response
 * @returns {object} The normalized recent
 * @private
 */
const normalizeRecent = recent => {
  const file = recent.relationships?.file?.data
  return {
    ...normalizeRecentJsonApi(recent),
    _rev: recent.meta?.rev,
    relationships: {
      ...recent.relationships,
      file: { data: file ? { _id: file.id, _type: file.type } : null }
    }
  }
}

/**
 * Extract the cursor of the next page from the `next` link of a response.
 *
 * @param {object} [links] - The `links` of the JSON:API response
 * @returns {string|null} The cursor, or null when there is no next page
 * @private
 */
const getNextCursor = links => {
  if (!links?.next) return null
  const [, query = ''] = links.next.split('?')
  return new URLSearchParams(query).get('page[cursor]')
}

/**
 * Lists the personal recents of the user through `GET /files/recents`.
 *
 * Each recent points to its `io.cozy.files` document through a `file`
 * relationship, and the documents come in `included`.
 */
class FileRecentsCollection extends DocumentCollection {
  /**
   * @param {object} stackClient - The client used to make requests to the server
   * @param {object} [options] - The collection options
   */
  constructor(stackClient, options = {}) {
    super(FILE_RECENTS_DOCTYPE, stackClient, options)
  }

  /**
   * Fetch a page of recents, the most recent activity first.
   *
   * A page can hold fewer recents than the limit, or none, and still have a
   * next page: only `next` tells whether there is one.
   *
   * @param {object} [options] - The options
   * @param {number} [options.limit] - Size of the page (50 by default on the stack, 100 at most)
   * @param {string} [options.bookmark] - Cursor of the page, returned by the previous one
   * @returns {Promise<{data: object[], included: object[], meta: object, next: boolean, bookmark: string|null}>} The page
   * @throws {Error} A 404 when the recents are disabled on the stack
   */
  async all({ limit, bookmark } = {}) {
    const url = querystring.buildURL('/files/recents', {
      'page[limit]': limit,
      'page[cursor]': bookmark
    })
    const resp = await this.stackClient.fetchJSON('GET', url)
    const nextCursor = getNextCursor(resp.links)
    return {
      data: resp.data.map(normalizeRecent),
      included: (resp.included || []).map(normalizeFile),
      meta: resp.meta,
      next: nextCursor !== null,
      bookmark: nextCursor
    }
  }

  async get() {
    throw new Error(`${FILE_RECENTS_DOCTYPE} can only be listed`)
  }

  async getAll() {
    throw new Error(`${FILE_RECENTS_DOCTYPE} can only be listed`)
  }

  async find() {
    throw new Error(`${FILE_RECENTS_DOCTYPE} can only be listed`)
  }
}

FileRecentsCollection.normalizeDoctype = normalizeDoctypeJsonApi

export default FileRecentsCollection
