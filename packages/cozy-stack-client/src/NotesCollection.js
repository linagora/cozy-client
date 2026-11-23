import DocumentCollection from './DocumentCollection'
import { normalizeDoctypeJsonApi } from './normalize'
import { uri, sharedDriveApiPrefix } from './utils'
import { getDefaultSchema as modelDefaultSchema } from './NotesSchema'
export const NOTES_DOCTYPE = 'io.cozy.notes'
export const NOTES_URL_DOCTYPE = 'io.cozy.notes.url'

const normalizeNote = normalizeDoctypeJsonApi(NOTES_DOCTYPE)
const normalizeNoteUrl = normalizeDoctypeJsonApi(NOTES_URL_DOCTYPE)

/**
 * Options that can be passed to NotesCollection's constructor
 *
 * @typedef {object} NotesCollectionOptions
 * @property {string} [driveId] - ID of the shared drive targeted by the collection
 */

/**
 * Implements `DocumentCollection` API to interact with the /notes endpoint of the stack
 */
class NotesCollection extends DocumentCollection {
  /**
   * @param {CozyStackClient} stackClient -The client used to make requests to the server
   * @param {NotesCollectionOptions} [options] - The collection options
   */
  constructor(stackClient, options = {}) {
    super(NOTES_DOCTYPE, stackClient, options)
    this.prefix = options.driveId ? sharedDriveApiPrefix(options.driveId) : ''
  }

  /**
   * Fetches the note data
   *
   * @param {string} id Note id
   * @returns {{data}} Information about the note
   */
  async get(id) {
    const resp = await this.stackClient.fetchJSON('GET', `/notes/${id}`)

    return {
      data: normalizeNote(resp.data)
    }
  }

  /**
   * Fetches all notes
   *
   * @returns {{data, links, meta}} The JSON API conformant response.
   */
  async all() {
    //TODO: add support for pagination
    const resp = await this.stackClient.fetchJSON('GET', '/notes')

    return {
      ...resp,
      data: resp.data.map(normalizeNote)
    }
  }

  /**
   * Destroys the note on the server
   *
   * @param {object} note       The io.cozy.notes document to destroy
   * @param {string} [note._id] The note's id
   *
   * @returns {{ data }} The deleted note
   */
  async destroy({ _id }) {
    // io.cozy.notes are in fact io.cozy.files, but with a special endpoint. However there is no dedicated route to delete a note, so we use the /files endpoint.
    const resp = await this.stackClient.fetchJSON(
      'DELETE',
      this.prefix + uri`/files/${_id}`
    )
    return {
      data: { ...normalizeNote(resp.data), _deleted: true }
    }
  }
  /**
   * Create a note
   *
   * @param {object} options - Options
   * @param {string} [options.dir_id] dir_id where to create the note
   *
   * @returns {{data, links, meta}} The JSON API conformant response.
   */
  async create({ dir_id }) {
    const resp = await this.stackClient.fetchJSON(
      'POST',
      this.prefix + '/notes',
      {
        data: {
          type: 'io.cozy.notes.documents',
          attributes: {
            title: '',
            schema: modelDefaultSchema(),
            dir_id
          }
        }
      }
    )
    return {
      ...resp,
      data: normalizeNote(resp.data)
    }
  }

  /**
   * Returns the details to build the note's url
   *
   * @see https://github.com/cozy/cozy-stack/blob/master/docs/notes.md#get-notesidopen
   *
   * @param {object} note       The io.cozy.notes document to open
   * @param {string} [note._id] The note's id
   *
   * @returns {{ data }} The note's url details
   */
  async fetchURL({ _id }) {
    const resp = await this.stackClient.fetchJSON(
      'GET',
      this.prefix + uri`/notes/${_id}/open`
    )
    return {
      data: normalizeNoteUrl(resp.data)
    }
  }
  /**
   * Returns promise mirror schema for a note
   *
   * @returns {object} schema
   */
  getDefaultSchema() {
    return modelDefaultSchema()
  }
}

NotesCollection.normalizeDoctype = normalizeDoctypeJsonApi

export default NotesCollection
