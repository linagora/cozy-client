import sortBy from 'lodash/sortBy'
import CozyClient from '../CozyClient'
import { DOCTYPE_FILES } from '../const'

import { Q } from '../queries/dsl'

const APP_DOCTYPE = 'io.cozy.apps'
const administrative = 'administrative'
const photos = 'photos'

export const MAGIC_FOLDERS = {
  ADMINISTRATIVE: `${APP_DOCTYPE}/${administrative}`,
  PHOTOS: `${APP_DOCTYPE}/${photos}`,
  PHOTOS_BACKUP: `${APP_DOCTYPE}/${photos}/mobile`,
  PHOTOS_UPLOAD: `${APP_DOCTYPE}/${photos}/upload`,
  NOTES: `${APP_DOCTYPE}/notes`,
  MAIL: `${APP_DOCTYPE}/mail`,
  HOME: `${APP_DOCTYPE}/home`,
  PAPERS: `${APP_DOCTYPE}/${administrative}/papers`,
  COACH_CO2: `${APP_DOCTYPE}/${administrative}/coachco2`
}

/**
 * Returns a "Magic Folder", given its id. See https://docs.cozy.io/en/cozy-doctypes/docs/io.cozy.apps/#special-iocozyapps-doctypes
 *
 * @param  {CozyClient} client    cozy-client instance
 * @param  {string} id Magic Folder id. `CozyFolder.magicFolders` contains the
 * ids of folders that can be magic folders.
 * @param {string} path Default path to use if magic folder does not exist
 * @returns {Promise<import("../types").IOCozyFolder>} Folder document
 */
export const ensureMagicFolder = async (client, id, path) => {
  const magicFolderDocument = {
    _type: APP_DOCTYPE,
    _id: id
  }
  const existingMagicFolder = await getReferencedFolder(
    client,
    magicFolderDocument
  )

  if (existingMagicFolder) return existingMagicFolder

  const magicFoldersValues = Object.values(MAGIC_FOLDERS)
  if (!magicFoldersValues.includes(id)) {
    throw new Error(
      `Cannot create Magic folder with id ${id}. Allowed values are ${magicFoldersValues.join(
        ', '
      )}.`
    )
  }

  if (!path) {
    throw new Error('Magic folder default path must be defined')
  }

  return createFolderWithReference(client, path, magicFolderDocument)
}

/**
 * The next functions are considered private and only exported for unit tests
 */

/**
 * Create a folder with a reference to the given document
 *
 * @param  {CozyClient}  client - cozy-client instance
 * @param  {string}  path - Folder path
 * @param  {import("../types").CozyClientDocument}  document - Document to make reference to. Any doctype.
 * @returns {Promise<import("../types").IOCozyFolder>}  Folder document
 */
export const createFolderWithReference = async (client, path, document) => {
  const collection = client.collection(DOCTYPE_FILES)
  const dirId = await collection.ensureDirectoryExists(path)
  await collection.addReferencesTo(document, [
    {
      _id: dirId
    }
  ])

  const { data: dirInfos } = await collection.get(dirId)

  return dirInfos
}

/**
 * Returns the most recent folder referenced by the given document
 *
 * @param  {CozyClient}  client    cozy-client instance
 * @param  {import("../types").CozyClientDocument}  document  Document to get references from
 * @returns {Promise<import("../types").IOCozyFolder>} Folder referenced by the given document
 */
export const getReferencedFolder = async (client, document) => {
  const { included: folders } = await client.query(
    Q(DOCTYPE_FILES)
      .partialIndex({ type: 'directory', trashed: false })
      .referencedBy(document)
  )

  // there can be multiple folders with the same reference in some edge cases
  // when this happens we return the most recent one
  return folders.length > 0 ? sortBy(folders, 'created_at').pop() : null
}
