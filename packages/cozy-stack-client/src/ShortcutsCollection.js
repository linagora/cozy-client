import DocumentCollection from './DocumentCollection'
import { normalizeDoctypeJsonApi } from './normalize'
import { sharedDriveApiPrefix, uri } from './utils'
import { getIllegalCharacters } from './getIllegalCharacter'

/**
 * Doctype for shortcuts documents.
 *
 * @type {string}
 */
export const SHORTCUTS_DOCTYPE = 'io.cozy.files.shortcuts'

const normalizeShortcutsJsonApi = normalizeDoctypeJsonApi(SHORTCUTS_DOCTYPE)

/**
 * Provides helpers to interact with shortcuts documents on the Cozy stack.
 */
class ShortcutsCollection extends DocumentCollection {
  /**
   * @param {object} stackClient - The client used to make requests to the server
   * @param {object} [options] - The collection options
   * @param {string} [options.driveId] - Scopes the collection to a shared drive
   */
  constructor(stackClient, options = {}) {
    super(SHORTCUTS_DOCTYPE, stackClient, options)
    this.driveId = options.driveId
    this.prefix = this.driveId
      ? `${sharedDriveApiPrefix(this.driveId)}/shortcuts`
      : '/shortcuts'
  }

  /**
   * Create a shortcut
   *
   * @param {object} attributes shortcut's attributes
   * @param {string} attributes.name Filename
   * @param {string} attributes.url Shortcut's URL
   * @param {string} attributes.dir_id dir_id where to create the shortcut
   * @param {string|undefined} attributes.type shortcut's type
   * @throws {Error} - explaining reason why creation failed
   */
  async create(attributes) {
    if (this.driveId) {
      throw new Error('Creating shortcuts in a shared drive is not supported')
    }
    if (!attributes.type) {
      attributes.type = SHORTCUTS_DOCTYPE
    }
    if (
      !attributes.name ||
      !attributes.name.trim() ||
      !attributes.url ||
      !attributes.dir_id
    ) {
      throw new Error(
        'you need at least a name, an url and a dir_id attributes to create a shortcut'
      )
    }
    const name = attributes.name.trim()
    if (name === '.' || name === '..') {
      throw new Error(`Invalid filename: ${name}`)
    }
    const illegalCharacters = getIllegalCharacters(name)
    if (illegalCharacters.length) {
      throw new Error(
        `Invalid filename containing illegal character(s): ${illegalCharacters}`
      )
    }
    const path = uri`/shortcuts`
    const resp = await this.stackClient.fetchJSON('POST', path, {
      data: {
        attributes,
        type: 'io.cozy.files.shortcuts'
      }
    })
    return {
      data: normalizeShortcutsJsonApi(resp.data)
    }
  }

  /**
   * Fetches a shortcut by its ID.
   *
   * @param {string} id - The ID of the shortcut to retrieve.
   * @returns {Promise<{data: object}>} The shortcut data, normalized.
   * @throws {Error} If the fetch fails for any reason.
   */
  async get(id) {
    const path = this.prefix + uri`/${id}`
    const resp = await this.stackClient.fetchJSON('GET', path)
    return {
      data: normalizeShortcutsJsonApi(resp.data)
    }
  }
}

ShortcutsCollection.normalizeDoctype = normalizeDoctypeJsonApi

export default ShortcutsCollection
