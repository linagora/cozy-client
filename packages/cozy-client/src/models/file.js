import { isFlagshipApp } from 'cozy-device-helper'

import get from 'lodash/get'
import isString from 'lodash/isString'
import has from 'lodash/has'
import trimEnd from 'lodash/trimEnd'

import { setQualification } from './document/qualification'
import { Q } from '../queries/dsl'
import { DOCTYPE_FILES, DOCTYPE_FILES_ENCRYPTION } from '../const'
import CozyClient from '../CozyClient'
import logger from '../logger'

const FILE_TYPE = 'file'
const DIR_TYPE = 'directory'
export const ALBUMS_DOCTYPE = 'io.cozy.photos.albums'

const FILENAME_WITH_EXTENSION_REGEX = /(.+)(\..*)$/

/**
 * Returns base filename and extension
 *
 * @param {import("../types").IOCozyFile} file An io.cozy.files
 * @returns {{filename: string, extension: string}}
 */
export const splitFilename = file => {
  if (!isString(file.name)) throw new Error('file should have a name property')

  if (file.type === 'file') {
    const match = file.name.match(FILENAME_WITH_EXTENSION_REGEX)
    if (match) {
      return { filename: match[1], extension: match[2] }
    }
  }
  return { filename: file.name, extension: '' }
}

/**
 *
 * @param {import("../types").IOCozyFile} file io.cozy.files
 */
export const isFile = file => file && file.type === FILE_TYPE

/**
 *
 * @param {import("../types").IOCozyFile} file io.cozy.files
 */
export const isDirectory = file => file && file.type === DIR_TYPE

/**
 * Is file param a correct note
 *
 * @param {import("../types").IOCozyFile} file io.cozy.files
 * @returns {boolean}
 */
export const isNote = file => {
  if (
    file &&
    file.name &&
    file.name.endsWith('.cozy-note') &&
    file.type === FILE_TYPE &&
    file.metadata &&
    file.metadata.title !== undefined &&
    file.metadata.version !== undefined
  )
    return true
  return false
}

/**
 * Is the given file a Docs note
 *
 * @param {import("../types").IOCozyFile} file The io.cozy.files
 * @returns {boolean}
 */
export const isDocs = file => {
  return file?.name?.endsWith('.docs-note') && !!file?.metadata?.externalId
}

/**
 * Whether the file is client-side encrypted
 *
 * @param {import("../types").IOCozyFile} file - io.cozy.files document
 * @returns {boolean}
 */
export const isEncrypted = file => {
  return !!file.encrypted
}

/**
 * Returns folder encryption reference
 *
 * @param {import("../types").IOCozyFile} dir  - io.cozy.files document
 * @returns {boolean}
 */
export const getEncryptiondRef = dir => {
  const refs = get(dir, 'referenced_by', [])
  return refs.find(ref => ref.type === DOCTYPE_FILES_ENCRYPTION)
}

/**
 * Whether the folder is client-side encrypted
 *
 * @param {import("../types").IOCozyFile} dir  - io.cozy.files document
 * @returns {boolean}
 */
export const isEncryptedFolder = dir => {
  return !!getEncryptiondRef(dir)
}

/**
 * Whether the file or folder is client-side encrypted
 *
 * @param {import("../types").IOCozyFile} fileOrdir  - io.cozy.files document
 * @returns {boolean}
 */
export const isEncryptedFileOrFolder = fileOrdir => {
  return isEncryptedFolder(fileOrdir) || isEncrypted(fileOrdir)
}

/**
 * Whether the file is supported by Only Office
 *
 * @param {import("../types").IOCozyFile} file - io.cozy.file document
 * @returns {boolean}
 */
export const isOnlyOfficeFile = file =>
  isFile(file) &&
  !isNote(file) &&
  (file.class === 'text' ||
    file.class === 'spreadsheet' ||
    file.class === 'slide')

/**
 * Whether the file should be opened by only office
 * We want to be consistent with the stack so we check the class attributes
 * But we want to exclude .txt and .md because the CozyUI Viewer can already show them
 *
 * @param {import("../types").IOCozyFile} file - io.cozy.file document
 * @returns {boolean}
 */
export const shouldBeOpenedByOnlyOffice = file =>
  isOnlyOfficeFile(file) &&
  !file.name.endsWith('.txt') &&
  !file.name.endsWith('.md')

/**
 *
 * @param {import("../types").IOCozyFile} file - io.cozy.files document
 * @returns {boolean} true if the file is a shortcut
 */
export const isShortcut = file => {
  return file && file.class === 'shortcut'
}

/**
 *
 * @param {import("../types").IOCozyFile} file - io.cozy.files document
 * @returns {string | undefined} image src that can be used in an <img> tag
 */
export const getShortcutImgSrc = file => {
  /**
   * If we don't have iconMimeType, we consider that the icon is a binary svg.
   * Otherwise we consider that the icon comes from Iconizer api so it is in base64 directly.
   */
  const icon = file?.metadata?.icon
  const iconMimeType = file?.metadata?.iconMimeType

  if (!icon) {
    return undefined
  }

  return iconMimeType
    ? `data:${iconMimeType};base64,${icon}`
    : `data:image/svg+xml;base64,${window.btoa(icon)}`
}

/**
 * Normalizes an object representing a io.cozy.files object
 *
 * Ensures existence of `_id` and `_type`
 *
 * @public
 * @param {object} file - object representing the file
 * @returns {object} full normalized object
 */
export function normalize(file) {
  const id = file._id || file.id
  const doctype = file._type || DOCTYPE_FILES
  return { _id: id, id, _type: doctype, ...file }
}

/**
 * Ensure the file has a `path` attribute, or build it
 *
 * @public
 * @param {object} file - object representing the file
 * @param {object} parent - parent directory for the file
 * @returns {object} file object with path attribute
 */
export function ensureFilePath(file, parent) {
  if (file.path) return file
  if (!parent || !parent.path)
    throw new Error(`Could not define a file path for ${file._id || file.id}`)
  const path = parent.path + '/' + file.name
  return { path: path, ...file }
}

/**
 * Get the id of the parent folder (`null` for the root folder)
 *
 * @param {object} file  - io.cozy.files document
 * @returns {string|null} id of the parent folder, if any
 */
export function getParentFolderId(file) {
  const parentId = get(file, 'attributes.dir_id')
  return parentId === '' ? null : parentId
}

/**
 * Returns the status of a sharing shortcut.
 *
 * @param {import("../types").IOCozyFile} file - io.cozy.files document
 *
 * @returns {string} A description of the status
 */
export const getSharingShortcutStatus = file =>
  get(file, 'metadata.sharing.status')

/**
 * Returns the mime type of the target of the sharing shortcut, if it is a file.
 *
 * @param {import("../types").IOCozyFile} file  - io.cozy.files document
 *
 * @returns {string} The mime-type of the target file, or an empty string is the target is not a file.
 */
export const getSharingShortcutTargetMime = file =>
  get(file, 'metadata.target.mime')

/**
 * Returns the doctype of the target of the sharing shortcut.
 *
 * @param {import("../types").IOCozyFile} file - io.cozy.files document
 *
 * @returns {string} A doctype
 */
export const getSharingShortcutTargetDoctype = file =>
  get(file, 'metadata.target._type')

/**
 * Returns whether the file is a shortcut to a sharing
 *
 * @param {import("../types").IOCozyFile} file - io.cozy.files document
 *
 * @returns {boolean}
 */
export const isSharingShortcut = file => Boolean(getSharingShortcutStatus(file))

/**
 * Returns whether the file is a shortcut to a sharing
 *
 * @deprecated Prefer to use isSharingShortcut.
 * @param {import("../types").IOCozyFile} file - io.cozy.files document
 *
 * @returns {boolean}
 */
export const isSharingShorcut = file => {
  logger.warn(
    'Deprecation: `isSharingShorcut` is deprecated, please use `isSharingShortcut` instead'
  )
  return isSharingShortcut(file)
}

/**
 * Returns whether the sharing shortcut is new
 *
 * @param {import("../types").IOCozyFile} file - io.cozy.files document
 *
 * @returns {boolean}
 */
export const isSharingShortcutNew = file =>
  getSharingShortcutStatus(file) === 'new'

/**
 * Returns whether the sharing shortcut is new
 *
 * @deprecated Prefer to use isSharingShortcutNew.
 * @param {object} file - io.cozy.files document
 *
 * @returns {boolean}
 */
export const isSharingShorcutNew = file => {
  logger.warn(
    'Deprecation: `isSharingShorcutNew` is deprecated, please use `isSharingShortcutNew` instead'
  )
  return isSharingShortcutNew(file)
}

/**
 * Save the file with the given qualification
 *
 * @param {CozyClient} client - The CozyClient instance
 * @param {import("../types").IOCozyFile} file - The file to qualify
 * @param {object} qualification - The file qualification
 * @param {object} [params] - Parameters
 * @param {string} [params.driveId] - ID of the shared drive in which the file should be saved
 * @returns {Promise<import("../types").IOCozyFile>} The saved file
 */
export const saveFileQualification = async (
  client,
  file,
  qualification,
  { driveId } = {}
) => {
  const qualifiedFile = setQualification(file, qualification)
  return client
    .collection(DOCTYPE_FILES, { driveId })
    .updateMetadataAttribute(file._id, qualifiedFile.metadata)
}

/**
 * Helper to query files based on qualification rules
 *
 * @param {object} client - The CozyClient instance
 * @param {object} docRules - the rules containing the searched qualification and the count
 * @returns {Promise<import("../types").QueryResult>} The files found by the rules
 */
export const fetchFilesByQualificationRules = async (client, docRules) => {
  const { rules, count } = docRules
  const query = Q(DOCTYPE_FILES)
    .where({
      ...rules
    })
    .partialIndex({
      trashed: false
    })
    .indexFields(['cozyMetadata.updatedAt', 'metadata.qualification'])
    .sortBy([{ 'cozyMetadata.updatedAt': 'desc' }])
    .limitBy(count ? count : 1)
  const result = await client.query(query)
  return result
}

/**
 * Whether the file's metadata attribute exists
 *
 * @param {object} params - Param
 * @param {import("../types").IOCozyFile} params.file - An io.cozy.files document
 * @param {string} params.attribute - Metadata attribute to check
 * @returns {boolean}
 */
export const hasMetadataAttribute = ({ file, attribute }) =>
  has(file, `metadata.${attribute}`)

/**
 * async getFullpath - Gets a file's path
 *
 * @param {CozyClient} client - The CozyClient instance
 * @param {string} dirId  - The id of the parent directory
 * @param {string} name  - The file's name
 * @returns {Promise<string>} The full path of the file in the cozy
 **/
export const getFullpath = async (client, dirId, name, driveId = undefined) => {
  if (!dirId) {
    throw new Error('You must provide a dirId')
  }

  let query = Q(DOCTYPE_FILES).getById(dirId)

  if (driveId) {
    query = query.sharingById(driveId)
  }

  const { data: parentDir } = await client.query(query)

  const parentDirectoryPath = trimEnd(parentDir.path, '/')
  return `${parentDirectoryPath}/${name}`
}

/**
 * Move file to destination.
 * Manage 4 cases :
 * - Move inside a Cozy server
 * - Move inside a Nextcloud server
 * - Move from a Nextcloud server to Cozy
 * - Move from Cozy to a Nextcloud server
 *
 * @param {CozyClient} client                                                                    - The CozyClient instance
 * @param {import('../types').IOCozyFile | import('../types').NextcloudFile} file                - The file to move (required)
 * @param {import('../types').IOCozyFolder | import('../types').NextcloudFile} destination       - The destination folder (required)
 * @param {object} [options]                                                                     - The options
 * @param {boolean} [options.force]                                                              - Whether we should overwrite,
 * @param {string} [options.driveId]                                                             - The ID of the shared drive in which the file should be moved
 * i.e. put to trash, the destination in case of conflict (defaults to false).
 * @returns {Promise<{moved: undefined|import('../types').IOCozyFile, deleted: null|string[] }>} - A promise that returns the move action response (if any)
 * and the deleted file id (if any) if resolved or an Error if rejected
 */
export const move = async (
  client,
  file,
  destination,
  { force = false, driveId } = {}
) => {
  try {
    if (file._type === 'io.cozy.remote.nextcloud.files') {
      // Move inside a Nextcloud server
      if (destination._type === 'io.cozy.remote.nextcloud.files') {
        await client
          .collection('io.cozy.remote.nextcloud.files')
          .move(file, destination)

        return {
          moved: undefined,
          deleted: null
        }
      }

      // Move from a Nextcloud server to Cozy
      await client
        .collection('io.cozy.remote.nextcloud.files')
        .moveToCozy(file, destination)

      return {
        moved: undefined,
        deleted: null
      }
    }

    // Move from a Cozy to a Nextcloud server
    if (destination._type === 'io.cozy.remote.nextcloud.files') {
      await client
        .collection('io.cozy.remote.nextcloud.files')
        .moveFromCozy(destination, file)

      return {
        moved: undefined,
        deleted: null
      }
    }
  } catch (e) {
    throw e
  }

  // Move inside a Cozy server
  const filesCollection = client.collection(DOCTYPE_FILES, { driveId })
  try {
    const resp = await filesCollection.updateFileMetadata(file._id, {
      dir_id: destination._id
    })

    return {
      moved: resp.data,
      deleted: null
    }
  } catch (e) {
    if (e.status === 409 && force) {
      const destinationPath = await getFullpath(
        client,
        destination._id,
        file.name
      )
      const conflictResp = await filesCollection.statByPath(destinationPath)
      await filesCollection.destroy(conflictResp.data)
      const resp = await filesCollection.updateFileMetadata(file._id, {
        dir_id: destination._id
      })

      return {
        moved: resp.data,
        deleted: conflictResp.data.id
      }
    } else {
      throw e
    }
  }
}

/**
 * Move or copy a file or a directory between locations (personal drive and/or shared drives).
 * Manage 3 cases :
 * - From a shared drive to another shared drive (same stack or cross-stack)
 * - From a shared drive to a personal drive
 * - From a personal drive to a shared drive
 *
 * @param {CozyClient} client - The CozyClient instance.
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
 * @returns {Promise<{moved: undefined|import('../types').IOCozyFile, deleted: null|string[] }>} - A promise that returns the move/copy action response (if any)
 */
export const moveRelateToSharedDrive = async (client, source, dest, isCopy) => {
  const filesCollection = client.collection(DOCTYPE_FILES, { driveId: 'move' })
  try {
    const resp = await filesCollection.moveRelateToSharedDrive(
      source,
      dest,
      isCopy
    )

    return {
      moved: resp.data,
      deleted: null
    }
  } catch (e) {
    throw e
  }
}

/**
 *
 * Method to upload a file even if a file with the same name already exists.
 *
 * @param {CozyClient} client       - The CozyClient instance
 * @param {string} dirPath          - Fullpath of directory to upload to ex: path/to/
 * @param {object} file             - HTML Object file
 * @param {object} metadata         - An object containing the wanted metadata to attach
 * @param {object} [params]         - Parameters
 * @param {string} [params.driveId] - ID of the shared drive in which the file should be saved
 * @returns {Promise<import("../types").IOCozyFile>} The overrided file
 */
export const overrideFileForPath = async (
  client,
  dirPath,
  file,
  metadata,
  { driveId } = {}
) => {
  let path = dirPath
  if (!path.endsWith('/')) path = path + '/'

  const filesCollection = client.collection(DOCTYPE_FILES, { driveId })
  try {
    const existingFile = await filesCollection.statByPath(path + file.name)

    const { id: fileId, dir_id: dirId } = existingFile.data
    const resp = await filesCollection.updateFile(file, {
      dirId,
      fileId,
      metadata
    })
    return resp
  } catch (error) {
    if (/Not Found/.test(error)) {
      const dirId = await filesCollection.ensureDirectoryExists(path)
      const createdFile = await filesCollection.createFile(file, {
        dirId,
        metadata
      })
      return createdFile
    }
    throw error
  }
}
/**
 * Method to generate a new filename if there is a conflict
 *
 * @param {string} filenameWithoutExtension - A filename without the extension
 * @param {import('../types').ConflictOptions} [conflictOptions] - Conflict options
 * @returns {string} A filename with the right suffix
 */
export const generateNewFileNameOnConflict = (
  filenameWithoutExtension,
  conflictOptions
) => {
  const delimiter = conflictOptions?.delimiter || '_'

  //Check if the string ends by _1
  const regex = new RegExp(`(${delimiter})([0-9]+)$`)
  const matches = filenameWithoutExtension.match(regex)
  if (matches) {
    let versionNumber = parseInt(matches[2])
    //increment versionNumber
    versionNumber++
    const newFilenameWithoutExtension = filenameWithoutExtension.replace(
      new RegExp(`(${delimiter})([0-9]+)$`),
      `${delimiter}${versionNumber}`
    )
    return newFilenameWithoutExtension
  } else {
    return `${filenameWithoutExtension}${delimiter}1`
  }
}

/**
 * Generate a file name for a revision
 *
 * @param {import("../types").IOCozyFile} file - io.cozy.files document
 * @param {object} revision - The revision containing the updated_at
 * @param {function} f      - A function taking a a date and a format as arguments to generate the name.
 */
export const generateFileNameForRevision = (file, revision, f) => {
  const { filename, extension } = splitFilename(file)
  return `${filename}_${f(
    revision.updated_at,
    'DD MMMM - HH[h]mm'
  )}${extension}`
}

/**
 * @typedef FileUploadOptions
 * @property {string} [name]              - The file name to upload
 * @property {string} [dirId]             - The dirId to upload the file to
 * @property {object} [metadata]          - An object containing the metadata to attach
 * @property {string} [contentType]       - The file Content-Type
 * @property {string} [conflictStrategy]  - Erase / rename
 * @property {import('../types').ConflictOptions} [conflictOptions] - Conflict options
 * @property {string} [driveId]           - ID of the shared drive in which the file should be saved
 */

/**
 * The goal of this method is to upload a file based on a conflict strategy.
 * Be careful: We need to check if the file exists by doing a statByPath query
 * before trying to upload the file since if we post and the stack return a
 * 409 conflict, we will get a SPDY_ERROR_PROTOCOL on Chrome. This is the only
 * viable workaround
 * If there is no conflict, then we upload the file.
 * If there is a conflict, then we apply the conflict strategy : `erase` or `rename`:
 *   - The `erase` strategy means an upload with a new version
 *   - The `rename` strategy means a new upload with a new name
 *
 * @param {CozyClient} client         - The CozyClient instance
 * @param {string|ArrayBuffer} file   - Can be the file path (file://) or the binary itself
 * @param {FileUploadOptions} options - The upload options
 */
export const uploadFileWithConflictStrategy = async (client, file, options) => {
  const { name, dirId, conflictStrategy, conflictOptions, driveId } = options

  const filesCollection = client.collection(DOCTYPE_FILES, { driveId })
  try {
    const path = await getFullpath(client, dirId, name, driveId)
    const existingFile = await filesCollection.statByPath(path)
    const { id: fileId } = existingFile.data
    if (conflictStrategy === 'erase') {
      //!TODO Bug Fix. Seems we have to pass a name attribute ?!
      const resp = await filesCollection.updateFile(file, {
        ...options,
        fileId
      })
      return resp
    } else {
      // @ts-ignore
      const { filename, extension } = splitFilename({
        name,
        type: 'file'
      })
      const newFileName =
        generateNewFileNameOnConflict(filename, conflictOptions) + extension
      //recall itself with the newFilename.
      return uploadFileWithConflictStrategy(client, file, {
        ...options,
        name: newFileName
      })
    }
  } catch (error) {
    if (/Not Found/.test(error.message)) {
      return filesCollection.createFile(file, options)
    }
    throw error
  }
}

/**
 * @param {string} [mimeType=''] - Mime type of file
 * @param {string} [fileName=''] - Name of file
 * @returns {boolean}
 */
export const isPlainText = (mimeType = '', fileName = '') => {
  return mimeType ? /^text\//.test(mimeType) : /\.(txt|md)$/.test(fileName)
}

/**
 * @param {import("../types").IOCozyFile} file - io.cozy.files document
 * @returns {boolean}
 */
export const hasQualifications = file => {
  return !!get(file, 'metadata.qualification')
}

/**
 * @param {import("../types").IOCozyFile} file - io.cozy.files document
 * @returns {boolean}
 */
export const hasCertifications = file => {
  return (
    get(file, 'metadata.carbonCopy', false) ||
    get(file, 'metadata.electronicSafe', false)
  )
}

/**
 * @param {import("../types").IOCozyFile} file - io.cozy.files document
 * @returns {boolean}
 */
export const isFromKonnector = file => {
  return has(file, 'cozyMetadata.sourceAccount')
}

/**
 * @param {CozyClient} client - Instance of CozyClient
 * @param {string} fileId - Id of io.cozy.files document
 * @param {object} [params] - Parameters
 * @param {string} [params.driveId] - ID of the shared drive in which the file should be saved
 * @returns {Promise<Blob>}
 */
export const fetchBlobFileById = async (client, fileId, { driveId } = {}) => {
  const fileColl = client.collection(DOCTYPE_FILES, { driveId })
  const fileBin = await fileColl.fetchFileContentById(fileId)
  const fileBlob = await fileBin.blob()

  return fileBlob
}

/**
 * Copies a file to a specified destination.
 *
 * @param {object} client - The client object used for making API requests.
 * @param {object} file - The file object to be copied.
 * @param {object} destination - The destination object where the file will be copied to.
 * @param {object} [params] - Parameters
 * @param {string} [params.driveId] - ID of the shared drive in which the file should be saved
 * @returns {Promise} - A promise that resolves with the response from the API.
 * @throws {Error} - If an error occurs during the API request.
 */
export const copy = async (client, file, destination, { driveId } = {}) => {
  try {
    if (
      file._type === 'io.cozy.remote.nextcloud.files' &&
      destination._type === 'io.cozy.remote.nextcloud.files'
    ) {
      const resp = await client
        .collection('io.cozy.remote.nextcloud.files')
        .copy(file, destination)
      return resp
    }

    if (
      file._type === 'io.cozy.remote.nextcloud.files' &&
      destination._type === 'io.cozy.files'
    ) {
      const resp = await client
        .collection('io.cozy.remote.nextcloud.files')
        .moveToCozy(file, destination, { copy: true })
      return resp
    }

    if (destination._type === 'io.cozy.remote.nextcloud.files') {
      const resp = await client
        .collection('io.cozy.remote.nextcloud.files')
        .moveFromCozy(destination, file, { copy: true })
      return resp
    }

    const resp = await client
      .collection(DOCTYPE_FILES, { driveId })
      .copy(file._id, file.name, destination._id)
    return resp
  } catch (e) {
    throw e
  }
}

/**
 * Download the requested file
 *
 * This method can be used in a web page context or in a WebView hosted by a Flagship app
 *
 * When used in a FlagshipApp WebView context, then the action is redirected to the host app
 * that will process the download
 *
 * @param {object} params - The download parameters
 * @param {CozyClient} params.client - Instance of CozyClient
 * @param {import("../types").IOCozyFile} params.file - io.cozy.files metadata of the document to downloaded
 * @param {string} [params.url] - Blob url that should be used to download encrypted files
 * @param {string} [params.driveId] - ID of the shared drive in which the file can be found
 * @param {import('cozy-intent').WebviewService} [params.webviewIntent] - webviewIntent that can be used to redirect the download to host Flagship app
 *
 * @returns {Promise<any>}
 */
export const downloadFile = async ({
  client,
  file,
  url,
  webviewIntent,
  driveId
}) => {
  const filesCollection = client.collection(DOCTYPE_FILES, { driveId })

  if (isFlagshipApp() && webviewIntent && !isEncrypted(file)) {
    const isFlagshipDownloadAvailable =
      (await webviewIntent?.call('isAvailable', 'downloadFile')) ?? false

    if (isFlagshipDownloadAvailable) {
      return await webviewIntent.call('downloadFile', file)
    }
  }

  if (isEncrypted(file)) {
    return filesCollection.forceFileDownload(url, file.name)
  }
  return filesCollection.download(file)
}
