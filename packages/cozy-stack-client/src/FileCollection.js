import mime from 'mime/lite'
import has from 'lodash/has'
import get from 'lodash/get'
import omit from 'lodash/omit'
import pick from 'lodash/pick'
import { MangoQueryOptions } from './mangoIndex'

import DocumentCollection from './DocumentCollection'
import { normalizeDoctypeJsonApi } from './normalize'
import {
  uri,
  slugify,
  formatBytes,
  forceDownload,
  sharedDriveApiPrefix
} from './utils'
import { FetchError } from './errors'
import { dontThrowNotFoundError } from './Collection'
import { getIllegalCharacters } from './getIllegalCharacter'
import * as querystring from './querystring'
import logger from './logger'

/**
 * @typedef {module:"./CozyStackClient.js"} CozyStackClient
 */

/**
 * @typedef {object} IOCozyFolder Folder
 */

/**
 * @typedef {object} SpecificFileAttributesForKonnector Specific file attributes for creation for konnector
 * @property {string} sourceAccount the id of the source account used by a konnector
 * @property {string} sourceAccountIdentifier the unique identifier of the account targeted by the connector
 */

/**
 * Cursor used for Mango queries pagination
 *
 * @typedef {Array<string>|string} ViewKey
 * @typedef {string} DocId
 * @typedef {Array<*> & {0: ViewKey, 1: DocId}} CouchDBViewCursor
 */

/**
 * Attributes used for directory creation
 *
 * @typedef {object} DirectoryAttributes
 * @property {string} dirId - Id of the parent directory.
 * @property {boolean} name - Name of the created directory.
 * @property {boolean} executable - Indicates whether the file will be executable.
 * @property {object} [metadata] io.cozy.files.metadata to attach to the directory
 */

/**
 * Attributes used for file creation
 *
 * @typedef {object} FileAttributes
 * @property {string} id - Id of the document
 * @property {string} _id - Id of the document
 * @property {string} dirId - Id of the parent directory.
 * @property {string} name - Name of the created file.
 * @property {Date} lastModifiedDate - Can be used to set the last modified date of a file.
 * @property {boolean} executable - Whether or not the file is executable
 * @property {boolean} encrypted - Whether or not the file is client-side encrypted
 * @property {object} metadata io.cozy.files.metadata to attach to the file
 */

/**
 * Document representing a io.cozy.files
 *
 * @typedef {object} FileDocument
 * @property {string} _id - Id of the file
 * @property {string} _rev - Rev of the file
 * @property {FileAttributes} attributes - Attributes of the file
 * @property {object} meta - Meta
 * @property {object} relationships - Relationships
 * @property {object} referenced_by - Referenced by
 */

/**
 * Stream is not defined in a browser, but is on NodeJS environment
 *
 * @typedef {object} Stream
 */

/**
 * Document representing a io.cozy.oauth.clients
 *
 * @typedef {object} OAuthClient
 * @property {string} _id - Id of the client
 * @property {string} _type - Doctype of the client (i.e. io.cozy.oauth.clients)
 */

/**
 * Options that can be passed to FileCollection's constructor
 *
 * @typedef {object} FileCollectionOptions
 * @property {string} [driveId] - ID of the shared drive targeted by the collection
 */

const ROOT_DIR_ID = 'io.cozy.files.root-dir'
const CONTENT_TYPE_OCTET_STREAM = 'application/octet-stream'

const normalizeFileJsonApi = normalizeDoctypeJsonApi('io.cozy.files')

/**
 * Normalize a file, adding document's doctype if needed
 *
 * @param  {FileDocument} file - File to normalize
 * @returns {FileDocument} normalized file
 * @private
 */
const normalizeFile = file => ({
  ...normalizeFileJsonApi(file),
  _rev: file?.meta?.rev // Beware of JSON-API
})

/**
 * Normalize references, expliciting _type and _id — see https://docs.cozy.io/en/cozy-stack/references-docs-in-vfs/
 *
 * @param  {Array<object>} references - The list of files referenced by a document to normalize
 * @returns {Array<object>} the data attribute of the normalized references
 * @private
 */
const normalizeReferences = references => {
  return references
    ? references.map(ref => ({ _type: ref.type, _id: ref.id }))
    : []
}

/**
 * Sanitize the file name by trimming spaces
 *
 * @param {string} name - The file name to trim
 * @returns {string} the trimmed file name
 * @private
 */
const sanitizeFileName = name => name && name.trim()

/**
 * Sanitize and validate the file name - throw errors according to case
 *
 * @param {string} name - The file name
 * @returns {string} the trimmed safe file name
 * @throws {Error} - explaining reason why file name is not valid
 * @private
 */
const sanitizeAndValidateFileName = name => {
  let safeName = sanitizeFileName(name)
  if (typeof safeName !== 'string' || safeName === '') {
    throw new Error('Missing name argument')
  }

  if (name === '.' || name === '..') {
    throw new Error(`Invalid filename: ${name}`)
  }

  const illegalCharacters = getIllegalCharacters(safeName)
  if (illegalCharacters.length) {
    throw new Error(
      `Invalid filename containing illegal character(s): ${illegalCharacters}`
    )
  }

  return safeName
}

/**
 * Returns true when parameter has type directory, file or has _type io.cozy.files
 *
 * @param {object} doc - The document whose type is checked
 * @param {string} [doc._type] - The document's doctype
 * @param {'directory'|'file'} [doc.type] - The io.cozy-files document type
 *
 * @returns {boolean} true when objects has type directory, file or has _type io.cozy.files or false
 */
export const isFile = ({ _type, type }) =>
  _type === 'io.cozy.files' || type === 'directory' || type === 'file'

/**
 * Returns true when parameters has type directory
 *
 * @param {object} args File
 * @param {string} args.type - The type of the file
 * @returns {boolean} true when parameters has type directory or false
 */
export const isDirectory = ({ type }) => type === 'directory'

const raceWithCondition = (promises, predicate) => {
  return new Promise(resolve => {
    promises.forEach(p =>
      p.then(res => {
        if (predicate(res)) {
          resolve(true)
        }
      })
    )
    Promise.all(promises).then(() => resolve(false))
  })
}

const dirName = path => {
  const lastIndex = path.lastIndexOf('/')
  return path.substring(0, lastIndex)
}

/**
 * Implements `DocumentCollection` API along with specific methods for
 * `io.cozy.files`.
 *
 * Files are a special type of documents and are handled differently by the stack:
 * special routes are to be used, and there is a notion of referenced files, aka
 * files associated to a specific document
 */
class FileCollection extends DocumentCollection {
  /**
   * @param {string} doctype - Doctype of the collection (should be `io.cozy.files`)
   * @param {CozyStackClient} stackClient -The client used to make requests to the server
   * @param {FileCollectionOptions} [options] - The collection options
   */
  constructor(doctype, stackClient, options = {}) {
    super(doctype, stackClient, options)
    this.specialDirectories = {}
    this.prefix = options.driveId
      ? sharedDriveApiPrefix(options.driveId)
      : '/files'
  }

  /**
   * Fetches the file's data
   *
   * @param {string} id File id
   * @returns {{data, included}} Information about the file or folder and it's descendents
   */
  get(id) {
    return this.statById(id)
  }

  /**
   * Get all files by their ids
   *
   * @param {Array<string>} ids - files ids
   * @returns {Promise<{data, meta, execution_stats}>} JSON API response
   */
  async getAll(ids) {
    let resp
    try {
      resp = await this.stackClient.fetchJSON(
        'POST',
        this.prefix + uri`/_all_docs?include_docs=true`,
        {
          keys: ids
        }
      )
    } catch (error) {
      return dontThrowNotFoundError(error)
    }
    return {
      data: resp.data.map(f => normalizeFile(f)),
      meta: {
        count: resp.data.length
      },
      execution_stats: resp.execution_stats
    }
  }

  async fetchFindFiles(selector, options) {
    return this.stackClient.fetchJSON(
      'POST',
      this.prefix + `/_find`,
      this.toMangoOptions(selector, options)
    )
  }

  /**
   * Returns a filtered list of documents using a Mango selector.
   *
   * The returned documents are paginated by the stack.
   *
   * @param {object}            selector  The Mango selector.
   * @param {MangoQueryOptions} options   The query options
   * @returns {Promise<{data, meta, skip, next, bookmark, execution_stats}>} The JSON API conformant response.
   * @throws {FetchError}
   */
  async find(selector, options = {}) {
    const { skip = 0 } = options
    let resp
    try {
      const path = this.prefix + `/_find`
      resp = await this.findWithMango(path, selector, options)
    } catch (error) {
      return dontThrowNotFoundError(error)
    }

    const nextLink = get(resp, 'links.next', '')
    const nextLinkURL = new URL(`${this.stackClient.uri}${nextLink}`)
    const nextBookmark = nextLinkURL.searchParams.get('page[cursor]')
    return {
      data: resp.data.map(f => normalizeFile(f)),
      meta: resp.meta,
      next: resp.meta.count > skip + resp.data.length,
      skip,
      bookmark: nextBookmark || undefined,
      execution_stats: resp.meta.execution_stats
    }
  }

  /**
   * async findReferencedBy - Returns the list of files referenced by a document — see https://docs.cozy.io/en/cozy-stack/references-docs-in-vfs/
   *
   * @param  {object}       document          A JSON representing a document, with at least a `_type` and `_id` field.
   * @param  {object}       options           Additional options
   * @param  {number|null}  [options.skip]    For skip-based pagination, the number of referenced files to skip.
   * @param  {number|null}  [options.limit]   For pagination, the number of results to return.
   * @param  {CouchDBViewCursor|null}  [options.cursor]  For cursor-based pagination, the index cursor.
   * @returns {Promise<{data, included, meta, skip, next}>} The JSON API conformant response.
   */
  async findReferencedBy(document, { skip = 0, limit, cursor } = {}) {
    const params = {
      include: 'files',
      'page[limit]': limit,
      'page[cursor]': cursor,
      sort: 'datetime'
    }
    const path = uri`/data/${document._type}/${document._id}/relationships/references`
    const url = querystring.buildURL(path, params)
    const resp = await this.stackClient.fetchJSON('GET', url)
    return {
      data: normalizeReferences(resp.data),
      included: resp.included ? resp.included.map(f => normalizeFile(f)) : [],
      next: has(resp, 'links.next'),
      meta: resp.meta,
      skip
    }
  }

  /**
   *  Add referenced_by documents to a file — see https://docs.cozy.io/en/cozy-stack/references-docs-in-vfs/#post-filesfile-idrelationshipsreferenced_by
   *
   *  For example, to have an album referenced by a file:
   * ```
   * addReferencedBy({_id: 123, _type: "io.cozy.files", name: "cozy.jpg"}, [{_id: 456, _type: "io.cozy.photos.albums", name: "Happy Cloud"}])
   * ```
   *
   * @param  {FileDocument} document  A JSON representing the file
   * @param  {Array}  documents       An array of JSON documents having a `_type` and `_id` field.
   * @returns {Promise<{data, meta}>}          The JSON API conformant response.
   */
  async addReferencedBy(document, documents) {
    const refs = documents.map(d => ({ id: d._id, type: d._type }))
    const resp = await this.stackClient.fetchJSON(
      'POST',
      this.prefix + uri`/${document._id}/relationships/referenced_by`,
      { data: refs }
    )
    return {
      data: normalizeReferences(resp.data),
      meta: resp.meta
    }
  }

  /**
   *  Remove referenced_by documents from a file — see https://docs.cozy.io/en/cozy-stack/references-docs-in-vfs/#delete-filesfile-idrelationshipsreferenced_by
   *
   *  For example, to remove an album reference from a file:
   * ```
   *  removeReferencedBy({_id: 123, _type: "io.cozy.files", name: "cozy.jpg"}, [{_id: 456, _type: "io.cozy.photos.albums", name: "Happy Cloud"}])
   * ```
   *
   * @param  {object} document        A JSON representing the file
   * @param  {Array}  documents       An array of JSON documents having a `_type` and `_id` field.
   * @returns {Promise<{data, meta}>}          The JSON API conformant response.
   */
  async removeReferencedBy(document, documents) {
    const refs = documents.map(d => ({
      id: d._id || d.id,
      type: d._type || d.type
    }))
    const resp = await this.stackClient.fetchJSON(
      'DELETE',
      this.prefix +
        uri`/${document._id || document.id}/relationships/referenced_by`,
      { data: refs }
    )
    return {
      data: normalizeReferences(resp.data),
      meta: resp.meta
    }
  }

  /**
   *  Add files references to a document — see https://docs.cozy.io/en/cozy-stack/references-docs-in-vfs/#post-datatypedoc-idrelationshipsreferences
   *
   *  For example, to add a photo to an album:
   * ```
   *  addReferencesTo({_id: 456, _type: "io.cozy.photos.albums", name: "Happy Cloud"}, [{_id: 123, _type: "io.cozy.files", name: "cozy.jpg"}])
   * ```
   *
   * @param  {object} document        A JSON representing a document, with at least a `_type` and `_id` field.
   * @param  {Array}  documents       An array of JSON files having an `_id` field.
   *
   * Returns 204 No Content
   */
  async addReferencesTo(document, documents) {
    const refs = documents.map(d => ({ id: d._id, type: 'io.cozy.files' }))
    return this.stackClient.fetchJSON(
      'POST',
      uri`/data/${document._type}/${document._id}/relationships/references`,
      { data: refs }
    )
  }

  /**
   *  Remove files references to a document — see https://docs.cozy.io/en/cozy-stack/references-docs-in-vfs/#delete-datatypedoc-idrelationshipsreferences
   *
   *  For example, to remove a photo from an album:
   * ```
   *  removeReferencesTo({_id: 456, _type: "io.cozy.photos.albums", name: "Happy Cloud"}, [{_id: 123, _type: "io.cozy.files", name: "cozy.jpg"}])
   * ```
   *
   * @param  {object} document        A JSON representing a document, with at least a `_type` and `_id` field.
   * @param  {Array}  documents       An array of JSON files having an `_id` field.
   *
   * Returns 204 No Content
   */
  async removeReferencesTo(document, documents) {
    const refs = documents.map(d => ({ id: d._id, type: 'io.cozy.files' }))
    return this.stackClient.fetchJSON(
      'DELETE',
      uri`/data/${document._type}/${document._id}/relationships/references`,
      { data: refs }
    )
  }

  /**
   * Sends file to trash and removes references to it
   *
   * @param  {FileDocument} file - File that will be sent to trash
   * @param  {object} [options] - Optionnal request options
   * @returns {Promise<{data}>} The JSON API conformant response.
   */
  async destroy(file, { ifMatch = '' } = {}) {
    const { _id, relationships, referenced_by } = file

    const resp = await this.stackClient.fetchJSON(
      'DELETE',
      this.prefix + uri`/${_id}`,
      undefined,
      {
        headers: {
          'If-Match': ifMatch
        }
      }
    )
    // needed because we had a bug in cozy-stack https://github.com/cozy/cozy-stack/pull/3566
    // FIXME: to remove once the code is deployed everywhere
    const references = get(relationships, 'referenced_by.data', referenced_by)
    if (Array.isArray(references)) {
      await this.removeReferencedBy(file, references)
    }
    return {
      data: normalizeFile(resp.data)
    }
  }

  /**
   * Empty the Trash
   *
   * @returns {Promise<{data}>} The JSON API conformant response.
   * @throws {FetchError}
   *
   */
  async emptyTrash() {
    const resp = await this.stackClient.fetchJSON(
      'DELETE',
      this.prefix + `/trash`
    )
    return {
      data: normalizeFile(resp.data)
    }
  }

  /**
   * Restores a trashed file.
   *
   * @param {string} id   - The file's id
   * @returns {Promise<{data}>} The JSON API conformant response.
   * @throws {FetchError}
   *
   */
  async restore(id) {
    const resp = await this.stackClient.fetchJSON(
      'POST',
      this.prefix + uri`/trash/${id}`
    )
    return {
      data: normalizeFile(resp.data)
    }
  }

  /**
   * Copy a file.
   *
   * @param {string} id   - The file's id
   * @param {string} [name]   - The file copy name
   * @param {string} [dirId]   - The destination directory id
   * @param {object} [options] - Optionnal request options
   * @returns {Promise<object>}   - A promise that returns the copied file if resolved.
   * @throws {FetchError}
   *
   */
  async copy(id, name, dirId, { sanitizeName = true } = {}) {
    let sanitizedName = name
    if (sanitizedName != null && sanitizeName) {
      sanitizedName = sanitizeAndValidateFileName(sanitizedName)
    }
    const params = {
      Name: sanitizedName,
      DirID: dirId
    }
    const path = this.prefix + uri`/${id}/copy`
    const url = querystring.buildURL(path, params)

    const resp = await this.stackClient.fetchJSON('POST', url)

    return {
      data: normalizeFile(resp.data)
    }
  }

  /**
   * async deleteFilePermanently - Definitely delete a file
   *
   * @param  {string} id - The id of the file to delete
   * @param  {object} [options] - Optionnal request options
   * @returns {Promise<{data}>} The JSON API conformant response.
   */
  async deleteFilePermanently(id, { ifMatch = '' } = {}) {
    const resp = await this.stackClient.fetchJSON(
      'PATCH',
      this.prefix + uri`/${id}`,
      {
        data: {
          type: 'io.cozy.files',
          id,
          attributes: {
            permanent_delete: true
          }
        }
      },
      {
        headers: {
          'If-Match': ifMatch
        }
      }
    )

    return {
      data: normalizeFile(resp.data)
    }
  }
  /**
   * @param {File|Blob|Stream|string|ArrayBuffer} data file to be uploaded
   * @param {string} dirPath Path to upload the file to. ie : /Administative/XXX/
   * @param {object} [options] Optionnal request options
   * @returns {Promise<object>} Created io.cozy.files
   */
  async upload(data, dirPath, { sanitizeName = true } = {}) {
    const dirId = await this.ensureDirectoryExists(dirPath, { sanitizeName })
    return this.createFile(data, { dirId }, { sanitizeName })
  }

  /**
   * Creates directory or file.
   * - Used by StackLink to support CozyClient.create('io.cozy.files', options)
   *
   * @param {FileAttributes|DirectoryAttributes} attributes - Attributes of the created file/directory
   * @param {File|Blob|string|ArrayBuffer} attributes.data Will be used as content of the created file
   * @param {object} [options] Optionnal request options
   * @throws {Error} - explaining reason why creation failed
   */
  async create(attributes, { sanitizeName = true } = {}) {
    if (attributes.type === 'directory') {
      return this.createDirectory(attributes, { sanitizeName })
    } else {
      const { data, ...createFileOptions } = attributes
      return this.createFile(data, createFileOptions, { sanitizeName })
    }
  }

  /***
   * Updates an existing file or directory
   *
   * Used by StackLink to support CozyClient.save({file}).
   * Update the binary file if a `data` param is passed. Only updates
   * attributes otherwise.
   * @param {object} attributes
   * @param {FileAttributes} attributes.file - The file with its new content
   * @param {File|Blob|string|ArrayBuffer} attributes.data Will be used as content of the updated file
   * @param {object} [options] Optionnal request options
   * @returns {Promise<FileAttributes>} Updated document
   * @throws {Error} - explaining reason why update failed
   */
  async update(attributes, { ifMatch = '', sanitizeName = true } = {}) {
    const { data, ...updateFileOptions } = attributes
    const fileId = attributes.id || attributes._id
    if (data) {
      if (attributes.type === 'directory') {
        throw new Error('You cannot pass a data object for a directory')
      }
      updateFileOptions.fileId = fileId
      return this.updateFile(data, updateFileOptions, { ifMatch, sanitizeName })
    }
    return this.updateAttributes(fileId, attributes, { ifMatch, sanitizeName })
  }

  /**
   * Creates a file
   *
   *
   * @private
   * @param {File|Blob|Stream|string|ArrayBuffer} data file to be uploaded
   * @param {FileAttributes & SpecificFileAttributesForKonnector} params Additional parameters
   * @param {object} params.options Options to pass to doUpload method (additional headers)
   * @param {object} [options] Optionnal request options
   * @throws {Error} - explaining reason why creation failed
   */
  async createFile(
    data,
    {
      name: nameOption,
      dirId = '',
      executable = false,
      encrypted = false,
      metadata,
      sourceAccount = '',
      sourceAccountIdentifier = '',
      ...options
    } = {},
    { sanitizeName = true } = {}
  ) {
    let name = nameOption
    // handle case where data is a file and contains the name
    if (!name && typeof data.name === 'string') {
      name = data.name
    }

    if (sanitizeName) {
      name = sanitizeAndValidateFileName(name)
    }

    let metadataId = ''
    if (metadata) {
      const meta = await this.createFileMetadata(metadata)
      metadataId = meta.data.id
    }
    let size = ''
    if (options.contentLength) {
      size = String(options.contentLength)
    }
    const path =
      this.prefix +
      uri`/${dirId}?Name=${name}&Type=file&Executable=${executable}&Encrypted=${encrypted}&MetadataID=${metadataId}&Size=${size}&SourceAccount=${sourceAccount}&SourceAccountIdentifier=${sourceAccountIdentifier}`
    return this.doUpload(data, path, options)
  }

  /**
   * updateFile - Updates a file's data
   *
   * @param {File|Blob|Stream|string|ArrayBuffer} data file to be uploaded
   * @param {FileAttributes} params       File attributes to update and doUpload options (additional headers)
   * @param  {object}  options            Request Options
   * @returns {Promise<FileAttributes>}   Updated document
   * @throws {Error} - explaining reason why update failed
   */
  async updateFile(
    data,
    {
      executable = false,
      encrypted = false,
      fileId,
      name = '',
      metadata,
      ...options
    } = {},
    { ifMatch = '', sanitizeName = true } = {}
  ) {
    if (!fileId || typeof fileId !== 'string') {
      throw new Error('missing fileId argument')
    }
    // name might be set in a File object
    const fileName = name || data.name
    if (!fileName || typeof fileName !== 'string') {
      throw new Error('missing name in data argument')
    }
    const sanitizedName = sanitizeName
      ? sanitizeAndValidateFileName(fileName)
      : fileName
    /**
     * We already use the body to send the content of the file. So we have 2
     * choices to pass updated metadata :
     * - use an object in a query string to send the metadata
     * - create a new http header
     * In both case, we have a size limitation depending of the browser.
     *
     * So we had this current workaround where we create the metadata before
     * (no size limit since we can use the body for that) and after we use the ID.
     */
    let metadataId
    let path =
      this.prefix +
      uri`/${fileId}?Name=${sanitizedName}&Type=file&Executable=${executable}&Encrypted=${encrypted}`
    if (metadata) {
      const meta = await this.createFileMetadata(metadata)
      metadataId = meta.data.id
      path = path + `&MetadataID=${metadataId}`
    }
    let size = ''
    if (options.contentLength) {
      size = String(options.contentLength)
      path = path + `&Size=${size}`
    }
    if (ifMatch !== '') options.ifMatch = ifMatch

    return this.doUpload(data, path, options, 'PUT')
  }

  getDownloadLinkById(id, filename) {
    return this.stackClient
      .fetchJSON(
        'POST',
        this.prefix +
          uri`/downloads?Id=${id}&Filename=${encodeURIComponent(filename)}`
      )
      .then(this.extractResponseLinkRelated)
  }

  getDownloadLinkByRevision(versionId, filename) {
    return this.stackClient
      .fetchJSON(
        'POST',
        this.prefix +
          uri`/downloads?VersionId=${versionId}&Filename=${encodeURIComponent(
            filename
          )}`
      )
      .then(this.extractResponseLinkRelated)
  }
  getDownloadLinkByPath(path) {
    return this.stackClient
      .fetchJSON('POST', this.prefix + uri`/downloads?Path=${path}`)
      .then(this.extractResponseLinkRelated)
  }

  extractResponseLinkRelated = res => {
    let href = res.links && res.links.related
    if (!href) throw new Error('No related link in server response')
    return this.stackClient.fullpath(href)
  }

  /**
   * Force a file download from the given href
   *
   * @param {string} href - The link to download
   * @param {string} filename - The file name to download
   */
  forceFileDownload = (href, filename) => {
    forceDownload(href, filename)
  }

  /**
   * Download a file or a specific version of the file
   *
   * @param {object} file io.cozy.files object
   * @param {string} versionId Id of the io.cozy.files.version
   * @param {string} filename The name you want for the downloaded file
   *                            (by default the same as the file)
   */
  async download(file, versionId = null, filename = undefined) {
    let href
    const filenameToUse = filename ? filename : file.name
    /**
     * Passing a filename to forceFileDownload is not enough
     * for a few browsers since the stack's response header will
     * not contain that name. Passing the filename to
     * getDownloadLinkBy{Id,Revision} will ask the stack to
     * return this filename in its content-disposition
     * header response
     */
    if (!versionId) {
      href = await this.getDownloadLinkById(file._id, filenameToUse)
    } else {
      href = await this.getDownloadLinkByRevision(versionId, filenameToUse)
    }
    this.forceFileDownload(`${href}?Dl=1`, filenameToUse)
  }

  async fetchFileContent(id) {
    logger.warn(
      'FileCollection.fetchFileContent() is deprecated. Use FileCollection.fetchFileContentById() instead'
    )
    return this.fetchFileContentById(id)
  }

  /**
   * Fetch the binary of a file or a specific version of a file
   * Useful for instance when you can't download the file directly
   * (via a content-disposition attachement header) and need to store
   * it before doing an operation.
   *
   * @param {string} id Id of the io.cozy.files or io.cozy.files.version
   *
   */
  async fetchFileContentById(id) {
    return this.stackClient.fetch('GET', this.prefix + uri`/download/${id}`)
  }

  /**
   * Get a beautified size for a given file
   * 1024B => 1KB
   * 102404500404B => 95.37 GB
   *
   * @param {object} file io.cozy.files object
   * @param {number} decimal number of decimal
   */
  getBeautifulSize(file, decimal) {
    return formatBytes(parseInt(file.size), decimal)
  }

  /**
   * Attributes used for create archive link by ids
   *
   * @typedef {object} ArchivePages
   * @property {string} id - Id of the file
   * @property {number} page - The page number. PDF files only (1 is the first page)
   */

  /**
   * Download an archive of the files
   *
   * @param {string[]} fileIds - List of file ids
   * @param {string} [notSecureFilename] - Name of the archive (default: 'files')
   * @param {object} [options] - Additional options
   * @param {ArchivePages[]} [options.pages] - Array of objects, with `id` the file identifier, and `page` the page number (1 is the first page)
   */
  async downloadArchive(fileIds, notSecureFilename, { pages } = {}) {
    const filename = notSecureFilename ? slugify(notSecureFilename) : 'files'
    const href = await this.createArchiveLinkByIds({
      ids: fileIds,
      name: filename,
      pages
    })
    const fullpath = this.stackClient.fullpath(href)
    this.forceFileDownload(fullpath, filename + '.zip')
  }

  /**
   * @deprecated Use createArchiveLinkByIds instead
   */
  async getArchiveLinkByIds(ids, name = 'files') {
    logger.warn(
      'CozyClient FileCollection getArchiveLinkByIds method is deprecated. Use createArchiveLinkByIds instead'
    )
    const resp = await this.stackClient.fetchJSON(
      'POST',
      this.prefix + `/archive`,
      {
        data: {
          type: 'io.cozy.archives',
          attributes: {
            name,
            ids
          }
        }
      }
    )
    return resp.links.related
  }

  /**
   * Create the archive link for a list of files
   * The generated archive is temporary and is not persisted
   *
   * @param {object} params - Parameters
   * @param {string[]} params.ids - List of file ids
   * @param {string} [params.name] - Name of the archive (default: 'files')
   * @param {ArchivePages[]} [params.pages] - Array of objects, with `id` the file identifier, and `page` the page number (1 is the first page)
   * @returns {Promise<string>} - The archive link
   */
  async createArchiveLinkByIds({ ids, name = 'files', pages }) {
    const resp = await this.stackClient.fetchJSON(
      'POST',
      this.prefix + `/archive`,
      {
        data: {
          type: 'io.cozy.archives',
          attributes: {
            name,
            ids,
            ...(pages && { pages })
          }
        }
      }
    )
    return resp.links.related
  }

  /**
   * Checks if the file belongs to the parent's hierarchy.
   *
   * @param  {string|object}  child    The file which can either be an id or an object
   * @param  {string|object}  parent   The parent target which can either be an id or an object
   * @returns {boolean}                 Whether the file is a parent's child
   */
  async isChildOf(child, parent) {
    let { _id: childID, dirID: childDirID, path: childPath } =
      typeof child === 'object' ? child : { _id: child }
    let { _id: parentID } =
      typeof parent === 'object' ? parent : { _id: parent }
    if (childID === parentID || childDirID === parentID) {
      return true
    }
    if (!childPath) {
      const childDoc = await this.statById(childID)
      childPath = childDoc.data.path
      childDirID = childDoc.data.dirID
    }

    // Build hierarchy paths
    let currPath = childPath
    const targetsPath = [childPath]
    while (currPath != '') {
      const newPath = dirName(currPath)
      if (newPath != '') {
        targetsPath.push(newPath)
      }
      currPath = newPath
    }
    targetsPath.reverse()

    // Look for all hierarchy in parallel and return true as soon as a dir is the searched parent
    return raceWithCondition(
      targetsPath.map(path => this.statByPath(path)),
      stat => stat.data._id == parentID
    )
  }

  /**
   * statById - Fetches the metadata about a document. For folders, the results include the list of child files and folders.
   *
   * @param {string}      id                      ID of the document
   * @param {object|null} options                 Pagination options
   * @param {number|null} [options.page[limit]]   For pagination, the number of results to return.
   * @param {number|null} [options.page[skip]]    For skip-based pagination, the number of referenced files to skip.
   * @param {CouchDBViewCursor|null} [options.page[cursor]]  For cursor-based pagination, the index cursor.
   *
   * @returns {object} A promise resolving to an object containing "data" (the document metadata), "included" (the child documents) and "links" (pagination informations)
   */

  async statById(id, options = {}) {
    const params = pick(options, ['page[limit]', 'page[skip]', 'page[cursor]'])
    const path = this.prefix + uri`/${id}`
    const url = querystring.buildURL(path, params)
    const resp = await this.stackClient.fetchJSON('GET', url)
    return {
      data: normalizeFile(resp.data),
      included: resp.included && resp.included.map(f => normalizeFile(f)),
      links: resp.links
    }
  }

  async statByPath(path) {
    const resp = await this.stackClient.fetchJSON(
      'GET',
      this.prefix + uri`/metadata?Path=${path}`
    )
    return {
      data: normalizeFile(resp.data),
      included: resp.included && resp.included.map(f => normalizeFile(f))
    }
  }

  /**
   * Create directory
   *
   * @private
   * @param  {DirectoryAttributes} attributes - Attributes of the directory
   * @param {object} [options] - Optionnal request options
   * @returns {Promise}
   * @throws {Error} - explaining reason why creation failed
   */
  async createDirectory(attributes = {}, { sanitizeName = true } = {}) {
    const { name, dirId, lastModifiedDate, metadata } = attributes

    let metadataId = ''
    if (metadata) {
      const meta = await this.createFileMetadata(metadata)
      metadataId = meta.data.id
    }

    const safeName = sanitizeName ? sanitizeAndValidateFileName(name) : name

    const lastModified =
      lastModifiedDate &&
      (typeof lastModifiedDate === 'string'
        ? new Date(lastModifiedDate)
        : lastModifiedDate)

    const resp = await this.stackClient.fetchJSON(
      'POST',
      this.prefix +
        uri`/${dirId}?Name=${safeName}&Type=directory&MetadataID=${metadataId}`,
      undefined,
      {
        headers: {
          Date: lastModified ? lastModified.toGMTString() : ''
        }
      }
    )
    return {
      data: normalizeFile(resp.data)
    }
  }

  async ensureDirectoryExists(path, { sanitizeName = true } = {}) {
    if (!this.specialDirectories[path]) {
      const resp = await this.createDirectoryByPath(path, { sanitizeName })
      this.specialDirectories[path] = resp.data._id
    }
    return this.specialDirectories[path]
  }

  /**
   * Get a directory or create it
   *
   * @private
   * @param  {string} name - Name of the directory we want to get or create
   * @param  {FileDocument} parentDirectory - Parent directory of the directory we want to get or create
   * @param  {object} [options] - Optionnal request options
   * @returns {Promise}
   * @throws {Error} - explaining reason why creation failed
   */
  async getDirectoryOrCreate(
    name,
    parentDirectory,
    { sanitizeName = true } = {}
  ) {
    if (parentDirectory && !parentDirectory.attributes)
      throw new Error('Malformed parent directory')

    const safeName = sanitizeName ? sanitizeFileName(name) : name
    const path = `${
      parentDirectory._id === ROOT_DIR_ID ? '' : parentDirectory.attributes.path
    }/${safeName}`

    try {
      const stat = await this.statByPath(path || '/')
      return stat
    } catch (error) {
      const parsedError = JSON.parse(error.message)
      const errors = parsedError.errors
      if (errors && errors.length && errors[0].status === '404') {
        return this.createDirectory(
          {
            name: safeName,
            dirId: parentDirectory && parentDirectory._id
          },
          {
            sanitizeName
          }
        )
      }
      throw errors
    }
  }

  /**
   * async createDirectoryByPath - Creates one or more folders until the given path exists
   *
   * @param  {string} path - Path of the created directory
   * @param  {object} [options] - Optionnal request options
   * @returns {object} The document corresponding to the last segment of the path
   */
  async createDirectoryByPath(path, { sanitizeName = true } = {}) {
    const parts = path.split('/').filter(part => part !== '')
    const root = await this.statById(ROOT_DIR_ID)
    if (!parts.length) return root
    let parentDir = root
    for (const part of parts) {
      parentDir = await this.getDirectoryOrCreate(part, parentDir.data, {
        sanitizeName
      })
    }
    return parentDir
  }

  /**
   *
   * async updateAttributes - Updates a file / folder's attributes except
   * the metadata attribute. If you want to update its metadata attribute,
   * then use `updateFileMetadataAttribute` since `metadata` is a specific
   * doctype.
   *
   * For instance, if you want to update the name of a file, you can pass
   * attributes = { name: 'newName'}
   *
   * You can see the attributes for both Folder and File (as they share the
   * same doctype they have a few in common) here :
   * https://docs.cozy.io/en/cozy-doctypes/docs/io.cozy.files/#iocozyfiles
   *
   * @private You shoud use update() directly.
   * @param  {string} id         File id
   * @param  {object} attributes New file attributes
   * @param  {object} [options]  Optionnal request options
   * @returns {object}           Updated document
   * @throws {Error} - explaining reason why update failed
   */
  async updateAttributes(
    id,
    attributes,
    { ifMatch = '', sanitizeName = true } = {}
  ) {
    const sanitizedAttributes = { ...attributes }

    if (attributes.name && sanitizeName) {
      sanitizedAttributes.name = sanitizeAndValidateFileName(attributes.name)
    }

    const resp = await this.stackClient.fetchJSON(
      'PATCH',
      this.prefix + uri`/${id}`,
      {
        data: {
          type: 'io.cozy.files',
          id,
          attributes: sanitizedAttributes
        }
      },
      {
        headers: {
          'If-Match': ifMatch
        }
      }
    )
    return {
      data: normalizeFile(resp.data)
    }
  }

  async updateFileMetadata(id, attributes) {
    logger.warn(
      'CozyClient FileCollection updateFileMetadata method is deprecated. Use updateAttributes instead'
    )
    return this.updateAttributes(id, attributes)
  }

  /**
   * Send a metadata object that can be associated to a file uploaded after that,
   * via the MetadataID query parameter.
   * See https://github.com/cozy/cozy-stack/blob/master/docs/files.md#post-filesuploadmetadata
   *
   * @param {object} attributes The file's metadata
   * @returns {Promise<object>}          The Metadata object
   */
  async createFileMetadata(attributes) {
    const resp = await this.stackClient.fetchJSON(
      'POST',
      this.prefix + uri`/upload/metadata`,
      {
        data: {
          type: 'io.cozy.files.metadata',
          attributes
        }
      }
    )
    return {
      data: resp.data
    }
  }

  /**
   *
   * Updates the metadata attribute of a io.cozy.files
   * Creates a new version of the file without having
   * to upload again the file's content
   *
   * To see available content of the metadata attribute
   * see : https://docs.cozy.io/en/cozy-doctypes/docs/io.cozy.files_metadata/
   *
   * @param {string} id File id
   * @param {object} metadata io.cozy.files.metadata attributes
   * @returns {Promise<object>} io.cozy.files updated
   */
  async updateMetadataAttribute(id, metadata) {
    const resp = await this.stackClient.fetchJSON(
      'POST',
      this.prefix + uri`/${id}/versions`,
      {
        data: {
          type: 'io.cozy.files.metadata',
          attributes: metadata
        }
      }
    )
    return {
      data: resp.data
    }
  }

  /**
   * Get the file mime-type based on its name
   *
   * @param {string} name - The file name
   * @returns {string} the inferred file mime-type
   */
  getFileTypeFromName(name) {
    return mime.getType(name) || CONTENT_TYPE_OCTET_STREAM
  }

  /**
   *
   * This method should not be called directly to upload a file.
   * You should use `createFile`
   *
   * @param {File|Blob|Stream|string|ArrayBuffer} dataArg file to be uploaded
   * @param {string} path Uri to call the stack from. Something like
   * `/files/${dirId}?Name=${name}&Type=file&Executable=${executable}&MetadataID=${metadataId}`
   * @param {object} options Additional headers
   * @param {string} [method] POST / PUT / PATCH
   */
  async doUpload(dataArg, path, options, method = 'POST') {
    let correctPath = path
    let data = dataArg
    if (data === undefined) {
      throw new Error('missing data argument')
    }

    // transform any ArrayBufferView to ArrayBuffer
    if (data.buffer && data.buffer instanceof ArrayBuffer) {
      data = data.buffer
    }

    const isBuffer =
      typeof ArrayBuffer !== 'undefined' && data instanceof ArrayBuffer
    const isFile = typeof File !== 'undefined' && data instanceof File
    const isBlob = typeof Blob !== 'undefined' && data instanceof Blob
    const isStream = data.readable === true && typeof data.pipe === 'function'
    const isString = typeof data === 'string'

    if (!isBuffer && !isFile && !isBlob && !isStream && !isString) {
      throw new Error('invalid data type')
    }

    let { contentType, contentLength, checksum, lastModifiedDate, ifMatch } =
      options || {}

    if (!contentType) {
      if (typeof data === 'string') {
        contentType = 'text/plain'
      } else {
        if (data.type) {
          // The type is specified in the file object
          contentType = data.type
        } else {
          // Extract the name from the correctPath and infer the type
          const sPath = correctPath.split('?')
          const params = sPath.length > 1 ? sPath[1] : ''
          const name = new URLSearchParams(params).get('Name')
          contentType = this.getFileTypeFromName(name.toLowerCase())
        }
      }
    }

    lastModifiedDate = lastModifiedDate || data.lastModified
    if (lastModifiedDate) {
      lastModifiedDate = new Date(lastModifiedDate)
    }
    const headers = {
      'Content-Type': contentType
    }
    if (contentLength) headers['Content-Length'] = String(contentLength)
    if (checksum) headers['Content-MD5'] = checksum
    if (lastModifiedDate) {
      const date = lastModifiedDate.toISOString()
      correctPath = `${correctPath}&UpdatedAt=${date}&CreatedAt=${date}`
    }
    if (ifMatch) headers['If-Match'] = ifMatch

    const resp = await this.stackClient.fetchJSON(method, correctPath, data, {
      headers,
      onUploadProgress: options.onUploadProgress
    })
    return {
      data: normalizeFile(resp.data)
    }
  }

  /**
   * async findNotSynchronizedDirectories - Returns the list of directories not synchronized on the given OAuth client (mainly Cozy Desktop clients) — see https://docs.cozy.io/en/cozy-stack/not-synchronized-vfs/#get-datatypedoc-idrelationshipsnot_synchronizing
   *
   * @param  {OAuthClient}  oauthClient           A JSON representing an OAuth client, with at least a `_type` and `_id` field.
   * @param  {object|null}  options               Pagination options
   * @param  {number|null}  options.skip          For skip-based pagination, the number of referenced files to skip.
   * @param  {number|null}  options.limit         For pagination, the number of results to return.
   * @param  {CouchDBViewCursor|null}  options.cursor        For cursor-based pagination, the index cursor.
   * @param  {boolean}      options.includeFiles  Include the whole file documents in the results list
   *
   * @returns {Array<object|IOCozyFolder>}    The JSON API conformant response.
   */
  async findNotSynchronizedDirectories(
    oauthClient,
    { skip = 0, limit, cursor, includeFiles = false } = {}
  ) {
    const params = {
      include: includeFiles ? 'files' : undefined,
      'page[limit]': limit,
      'page[cursor]': cursor,
      sort: 'id'
    }
    const path = uri`/data/${oauthClient._type}/${oauthClient._id}/relationships/not_synchronizing`
    const url = querystring.buildURL(path, params)
    const resp = await this.stackClient.fetchJSON('GET', url)
    return {
      data: resp.data.map(f => normalizeFile(f)),
      included: resp.included ? resp.included.map(f => normalizeFile(f)) : [],
      next: has(resp, 'links.next'),
      meta: resp.meta,
      skip
    }
  }

  /**
   *  Add directory synchronization exclusions to an OAuth client — see https://docs.cozy.io/en/cozy-stack/not-synchronized-vfs/#post-datatypedoc-idrelationshipsnot_synchronizing
   *
   *  For example, to exclude directory `/Photos` from `My Computer`'s desktop synchronization:
   * ```
   * addNotSynchronizedDirectories({_id: 123, _type: "io.cozy.oauth.clients", clientName: "Cozy Drive (My Computer)", clientKind: "desktop"}, [{_id: 456, _type: "io.cozy.files", name: "Photos", path: "/Photos"}])
   * ```
   *
   * @param  {OAuthClient} oauthClient  A JSON representing the OAuth client
   * @param  {Array}  directories       An array of JSON documents having a `_type` and `_id` fields and representing directories.
   *
   * Returns 204 No Content
   */
  addNotSynchronizedDirectories(oauthClient, directories) {
    const refs = directories.map(d => ({ id: d._id, type: d._type }))
    return this.stackClient.fetchJSON(
      'POST',
      uri`/data/${oauthClient._type}/${oauthClient._id}/relationships/not_synchronizing`,
      { data: refs }
    )
  }

  /**
   *  Remove directory synchronization exclusions from an OAuth client — see https://docs.cozy.io/en/cozy-stack/not-synchronized-vfs/#delete-datatypedoc-idrelationshipsnot_synchronizing
   *
   *  For example, to re-include directory `/Photos` into `My Computer`'s desktop synchronization:
   * ```
   *  removeNotSynchronizedDirectories({_id: 123, _type: "io.cozy.oauth.clients", clientName: "Cozy Drive (My Computer)", clientKind: "desktop"}, [{_id: 456, _type: "io.cozy.files", name: "Photos", path: "/Photos"}])
   * ```
   *
   * @param  {OAuthClient} oauthClient  A JSON representing the OAuth client
   * @param  {Array}  directories       An array of JSON documents having a `_type` and `_id` field and representing directories.
   *
   * Returns 204 No Content
   */
  removeNotSynchronizedDirectories(oauthClient, directories) {
    const refs = directories.map(d => ({ id: d._id, type: d._type }))
    return this.stackClient.fetchJSON(
      'DELETE',
      uri`/data/${oauthClient._type}/${oauthClient._id}/relationships/not_synchronizing`,
      { data: refs }
    )
  }

  /**
   * Use cozy-stack's _changes API for io.cozy.files
   * Design docs are filtered by default, thus documents are retrieved in the
   * response (includeDocs is set to true in the parameters of _changes).
   * Deleted and trashed documents can be filtered on demand and files' paths
   * can be requested as well.
   *
   * Since deleted and trashed documents are skipped by cozy-stack rather than
   * CouchDB, when either option is set to true, the response can contain less
   * documents than the defined limit. Thus one should rely solely on the
   * `pending` result attribute to determine if more documents can be fetched or
   * not.
   *
   * You should use fetchChangesRaw to call CouchDB's _changes API.
   *
   * @typedef {object} CouchOptions
   * @property {string} since - Bookmark telling CouchDB from which point in time should changes be returned
   * @property {number} limit - The maximum number of returned documents for one call
   * @property {boolean} includeDocs - Whether or not complete documents should be returned
   *
   * @typedef {object} FetchChangesOptions
   * @property {Array<string>} fields - The list of fields that should be returned for each document
   * @property {boolean} includeFilePath - Whether to include the path of file changes (needs includeDocs to be true)
   * @property {boolean} skipDeleted - Whether to skip changes for deleted documents
   * @property {boolean} skipTrashed - Whether to skip changes for trashed documents (needs includeDocs to be true)
   *
   * @param  {CouchOptions} couchOptions - Couch options for changes
   * @param  {FetchChangesOptions} options - Further options on the returned documents. By default, it is set to
   *                                        { includeFilePath: false, skipDeleted: false, skipTrashed: false }
   *
   * @typedef {object} FetchChangesReturnValue
   * @property {string} newLastSeq
   * @property {boolean} pending
   * @property {Array<object>} documents
   * @returns {FetchChangesReturnValue}
   */
  async fetchChanges(couchOptions = {}, options = {}) {
    let opts = {}
    if (typeof couchOptions !== 'object') {
      opts.since = couchOptions
      logger.warn(
        `fetchChanges use couchOptions as Object not a string, since is deprecated, please use fetchChanges({since: "${couchOptions}"}).`
      )
    } else if (Object.keys(couchOptions).length > 0) {
      Object.assign(opts, couchOptions)
    }
    if (Object.keys(options).length > 0) {
      Object.assign(opts, options)

      if (options.skipTrashed || options.includeFilePath) {
        opts.includeDocs = true
      }
    }

    const params = {
      ...omit(opts, [
        'fields',
        'includeDocs',
        'includeFilePath',
        'skipDeleted',
        'skipTrashed'
      ]),
      fields: opts.fields ? opts.fields.join(',') : null,
      include_docs: opts.includeDocs,
      include_file_path: opts.includeFilePath,
      skip_deleted: opts.skipDeleted,
      skip_trashed: opts.skipTrashed
    }
    const path = this.prefix + `/_changes`
    const url = querystring.buildURL(path, params)
    const {
      last_seq: newLastSeq,
      pending,
      results
    } = await this.stackClient.fetchJSON('GET', url)

    return { newLastSeq, pending, results }
  }

  /**
   * Get or create the Shared Drives directory it if it does not exist.
   *
   * The Shared Drives directory is a special directory :
   * - its _id is io.cozy.files.shared-drives-dir
   * - it can contains Nextcloud shortcuts
   * - it can contains shared drives
   *
   * @returns {IOCozyFolder} Shared Drives directory
   */
  getOrCreateSharedDrivesDirectory() {
    return this.stackClient.fetchJSON('POST', this.prefix + `/shared-drives`)
  }

  /**
   * Move or copy a file or a directory between locations (personal drive and/or shared drives).
   * Manage 3 cases :
   * - From a shared drive to another shared drive (same stack or cross-stack)
   * - From a shared drive to a personal drive
   * - From a personal drive to a shared drive
   *
   * @param {object} source - The source file/folder to move/copy (required)
   * At least one side (source or destination) must be a shared drive.
   * @param {string} [source.instance] - omit for personal drive
   * If `source.instance` is provided, `source.sharing_id` is required.
   * @param {string} [source.sharing_id] - required when instance is set
   * @param {string} [source.file_id] - file needs to move
   * @param {string} [source.dir_id] - folder needs to move
   * Exactly one of `source.file_id` or `source.dir_id` must be provided.
   * @param {object} dest - The destination folder (required)
   * @param {string} [dest.instance] - omit for personal drive
   * If `dest.instance` is provided, `dest.sharing_id` is required.
   * @param {string} [dest.sharing_id] - required when instance is set
   * @param {string} dest.dir_id - destination directory id (required)
   * @param {boolean} isCopy - controls whether the operation is a move (default) or copy.
   * When `copy: false` (default): The source file/directory is moved to the destination and deleted from the source.
   * When `copy: true`: The source file/directory is copied to the destination but remains in the source location.
   * @returns {Promise<{data: undefined|object}>} - A promise that returns the move/copy action response (if any)
   */
  async moveRelateToSharedDrive(source, dest, isCopy) {
    const resp = await this.stackClient.fetchJSON('POST', this.prefix, {
      source,
      dest,
      copy: isCopy
    })
    return {
      data: normalizeFile(resp.data)
    }
  }
}

export default FileCollection
