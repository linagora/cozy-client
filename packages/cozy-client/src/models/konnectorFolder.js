//@ts-check
import { ensureMagicFolder, MAGIC_FOLDERS } from './folder'

import CozyClient from '../CozyClient'
import { getAccountName } from './account'

import { getLocalizer } from './document/locales'

import { Q } from '../queries/dsl'

const FILES_DOCTYPE = 'io.cozy.files'
const PERMISSIONS_DOCTYPE = 'io.cozy.permissions'
const ROOT_DIR_ID = 'io.cozy.files.root-dir'

// Default name for base directory
const DEFAULT_LOCALIZED_BASE_DIR = 'Administrative'

/**
 * Ensures the destination folder of a konnector exists and is initiated with proper permissions and references
 *
 * @param {CozyClient} client - CozyClient instance
 * @param {Object} options - options object
 * @param {import('../types').IOCozyKonnector} options.konnector - io.cozy.konnectors document
 * @param {import('../types').IOCozyAccount} options.account - io.cozy.accounts document
 * @param {string} options.lang - instance current language. ex: 'fr'
 * @returns {Promise<import('../types').IOCozyFolder>}
 */
export const ensureKonnectorFolder = async (
  client,
  { konnector, account, lang }
) => {
  const permissions = client.collection(PERMISSIONS_DOCTYPE)
  const t = getLocalizer(lang)
  const [adminFolder, photosFolder] = await Promise.all([
    ensureMagicFolder(
      client,
      MAGIC_FOLDERS.ADMINISTRATIVE,
      t('MagicFolders.administrative')
    ),
    ensureMagicFolder(client, MAGIC_FOLDERS.PHOTOS, t('MagicFolders.photos'))
  ])
  const reservedFolderIds = [ROOT_DIR_ID, adminFolder._id, photosFolder._id]

  const sourceAccountIdentifier = getAccountName(account)

  const alreadyExistingAccountFolder = await findKonnectorAccountFolderByReference(
    { client, slug: konnector.slug, sourceAccountIdentifier }
  )
  if (alreadyExistingAccountFolder) {
    return alreadyExistingAccountFolder
  }

  const alreadyExistingKonnectorMainFolder = await findKonnectorMainFolderByReference(
    { client, slug: konnector.slug }
  )

  if (alreadyExistingKonnectorMainFolder) {
    // save account folder as a child of main konnector account folder
    return await saveKonnectorAccountFolder({
      client,
      mainFolder: alreadyExistingKonnectorMainFolder,
      konnector,
      sourceAccountIdentifier,
      reservedFolderIds
    })
  }

  const mainPath = buildMainFolderPath(konnector, {
    administrative: adminFolder.path,
    photos: photosFolder.path
  })
  const mainFolder =
    (await statDirectoryByPath(client, mainPath)) ||
    (await createDirectoryByPath(client, mainPath))
  assertNotReservedFolder(mainFolder, reservedFolderIds)

  ensureKonnectorReference({
    client,
    folder: mainFolder,
    konnector
  })
  // if the previous shortcuts did not work, create the folders like we did before but with proper references
  const path = buildFolderPath(konnector, account, {
    administrative: adminFolder.path,
    photos: photosFolder.path
  })
  const folder =
    (await statDirectoryByPath(client, path)) ||
    (await createDirectoryByPath(client, path))
  assertNotReservedFolder(folder, reservedFolderIds)

  await Promise.all([
    permissions.add(konnector, buildFolderPermission(folder)),
    ensureKonnectorReference({ client, folder, konnector }),
    ensureSourceAccountIdentifierReference({
      client,
      folder,
      sourceAccountIdentifier
    })
  ])

  return folder
}

/**
 * Creates a directory from a given path
 *
 * @param  {CozyClient}  client CozyClient
 * @param  {string}  path   Directory path
 * @returns {Promise<import('../types').IOCozyFolder>}         Directory attributes
 */
export const createDirectoryByPath = async (client, path) => {
  const { data } = await client
    .collection(FILES_DOCTYPE)
    .createDirectoryByPath(path)
  return data
}

/**
 * Throws if a konnector destination resolved to the root or a magic folder
 *
 * @param {import('../types').IOCozyFolder} folder - folder to test
 * @param {Array<string>} reservedFolderIds - ids of the root and magic folders
 */
const assertNotReservedFolder = (folder, reservedFolderIds) => {
  if (reservedFolderIds.includes(folder._id)) {
    throw new Error(`Konnector folder cannot be ${folder.path}`)
  }
}

/**
 * Retrieves a directory from its path
 *
 * @param  {CozyClient}  client CozyClient
 * @param  {string}  path   Directory path
 * @returns {Promise<import('../types').IOCozyFolder|null>}        Created io.cozy.files document
 * @throws will throw an error on any error without status === 404
 */
export const statDirectoryByPath = async (client, path) => {
  try {
    const response = await client.collection(FILES_DOCTYPE).statByPath(path)
    if (response.data.trashed) {
      return null
    }
    return response.data
  } catch (error) {
    if (error && error.status === 404) return null
    throw new Error(error.message)
  }
}

/**
 * Build folder path for a given konnector and a given account.
 *
 * If konnector.folders[0].defaultDir exists, it is used as default directory.
 *
 * Occurrences of following strings in base directory are replaced by:
 * * `$administrative`: Administrative folder
 * * `$photos`: Photos folder
 *
 * Occurrences of following strings in path are replaced by:
 * * `$account: Account label (id or name)`
 * * `$konnector`: Konnector name
 *
 * If no konnectors.folders[0].defaultDir is set, the default dir used is
 * *  `$administrative/$konnector/$account`
 *
 * @param  {import('../types').IOCozyKonnector} konnector Konnector document
 * @param  {import('../types').IOCozyAccount} account   Account document
 * @param  {Object<string, string>} magicFolders   Object containing a mapping from folder
 * identifiers (ex: $administrative) to their localized values (ex:
 * Administratif).
 * @returns {string}           The result path
 */
export const buildFolderPath = (konnector, account, magicFolders = {}) => {
  const fullPath =
    konnector?.folders?.[0]?.defaultDir || '$administrative/$konnector/$account'
  // Trim `/` and avoid multiple `/` characters with regexp
  let sanitizedPath = trim(fullPath.replace(/(\/+)/g, '/'), '/')
  // If the konnector doesn't have any of our base dir, we set it to $administrative
  if (!hasBaseDir(sanitizedPath)) {
    sanitizedPath = '$administrative/' + sanitizedPath
  }
  /**
   * Now that we have our sanitizedPath, we can split it in two strings
   * * `baseDir` containing the baseDir path
   * * `buildedSubDir` containing the rest of the path (ie the path without baseDir)
   */
  const baseDir = sanitizedPath.split('/', 1)
  const buildedSubDir = buildSubDir(
    sanitizedPath,
    baseDir[0],
    '$konnector/$account'
  )

  const renderedBaseDir = renderBaseDir(baseDir[0], magicFolders)
  const renderedPath = renderSubDir(buildedSubDir, {
    // When adding a new allowed variable here, please keep documentation
    // of `renderSubDir` function up to date.
    konnector: konnector.name,
    account: getAccountName(account).replace(sanitizeAccountIdentifierRx, '-')
  })
  return `/${renderedBaseDir}/${renderedPath}`
}

/**
 * Build konnector main folder path for a given konnector.
 *
 * If konnector.folders[0].defaultDir exists, it is used as default directory.
 *
 * Occurrences of following strings in base directory are replaced by:
 * * `$administrative`: Administrative folder
 * * `$photos`: Photos folder
 *
 * Occurrences of following strings in path are replaced by:
 * * `$konnector`: Konnector name
 *
 * If no konnectors.folders[0].defaultDir is set, the default dir used is
 * *  `$administrative/$konnector`
 *
 * @param  {import('../types').IOCozyKonnector} konnector - Konnector document
 * @param  {Object<string, string>} magicFolders - Object containing a mapping from folder identifiers (ex: $administrative) to their localized values (ex: Administratif).
 * @returns {string}           The result path
 */
export const buildMainFolderPath = (konnector, magicFolders = {}) => {
  const fullPath =
    konnector?.folders?.[0]?.defaultDir
      ?.split('/')
      ?.slice(0, -1)
      ?.join('/') || '$administrative/$konnector'
  let sanitizedPath = trim(fullPath.replace(/(\/+)/g, '/'), '/')
  if (!hasBaseDir(sanitizedPath)) {
    sanitizedPath = '$administrative/' + sanitizedPath
  }
  /**
   * Now that we have our sanitizedPath, we can split it in two strings
   * * `baseDir` containing the baseDir path
   * * `buildedSubDir` containing the rest of the path (ie the path without baseDir)
   */
  const baseDir = sanitizedPath.split('/', 1)
  const buildedSubDir = buildSubDir(sanitizedPath, baseDir[0], '$konnector')

  const renderedBaseDir = renderBaseDir(baseDir[0], magicFolders)
  const renderedPath = renderSubDir(buildedSubDir, {
    konnector: konnector.name
  })
  return `/${renderedBaseDir}/${renderedPath}`
}

/**
 * Check if the provided Path start withs our allowedBaseDirPath to see
 *
 * @param {string} path - path to test
 * @returns {Boolean}
 */
const hasBaseDir = path => {
  return allowedBaseDirVariables.some(baseDirVar => {
    return path.startsWith(baseDirVar)
  })
}
/**
 * Base directories are directory where konnector may copy their data.
 * They are expressed as variables which then need to be localized.
 * Default is `$administrative`.
 */
const allowedBaseDirVariables = ['$administrative', '$photos']

/**
 * This method creates the subDir. We can't have an empty subDir, so we set
 * it to the given fallback
 *
 * @param {string} fullPath String containing potentially the defaultDir
 * @param {string} defaultDir String to remove from the fullPath
 * @param {string} fallback Sub dir used when the rest of the path is empty
 * @returns {string}
 */
const buildSubDir = (fullPath, defaultDir, fallback) => {
  const buildedSubDir = fullPath.substring(defaultDir.length)
  return trim(buildedSubDir, '/') === '' ? fallback : buildedSubDir
}

/**
 * Render base directory, based on given magicFolders object.
 * For example, it will render `$administrative` with the given value passed in
 * folders object. We expect to find in folders a localized value.
 *
 * @param  {string} baseDir base directory variable, expects `$administrative`
 * or `$photos`
 * @param  {Object<string, string>} magicFolders Object indexing base directory variable with
 * corresponding localized name.
 * @returns {string}         Localized directory
 */
const renderBaseDir = (baseDir, magicFolders = {}) => {
  // Look for variable name into folders but without $ prefix
  const renderedBaseDir =
    magicFolders[baseDir.slice(1)] || DEFAULT_LOCALIZED_BASE_DIR
  // Trim `/` and avoid multiple `/` characters with regexp
  return trim(renderedBaseDir.replace(/(\/+)/g, '/'), '/')
}

/**
 * Render the given folder path using the given `variables` object.
 * Available variable are `$konnector` (konnector name) and `$account`
 * (account label, i.e. id or name)
 *
 * @param  {string} path      Path to render : ex '/Administratif/$konnector/$account'
 * @param  {Object} variables Object mapping variable to actual values
 * @param  {import('../types').IOCozyKonnector['name']} variables.konnector - konnector name
 * @param  {string} [variables.account] - account name
 * @returns {string}           Rendered path
 */
const renderSubDir = (path, variables) => {
  // Trim `/` and avoid multiple `/` characters with regexp
  const sanitizedPath = trim(path.replace(/(\/+)/g, '/'), '/')

  // Let's get only full variable name limited by '/'. We want to avoid false
  // positive like parsing `$variableInString` to `valueInString`
  const segments = sanitizedPath.split('/')
  return segments
    .map(segment => variables?.[segment.slice(1)] || segment)
    .join('/')
}

const sanitizeAccountIdentifierRx = /\//g

/**
 * Returns a permission ready to be passed to
 * client.collection('io.cozy.permissions').add().
 *
 * @param  {import('../types').IOCozyFolder} folder    The folder which the konnector should have access
 * @returns {Object}           Permission object
 */
export const buildFolderPermission = folder => {
  return {
    // Legacy name
    saveFolder: {
      type: FILES_DOCTYPE,
      values: [folder._id],
      verbs: ['GET', 'PATCH', 'POST']
    }
  }
}

/**
 * Replacer of the lodash/trim function
 *
 * @param {string} str - Input string
 * @param {string} c - String to trim from the input string
 * @returns {string}
 */
const trim = (str, c = '\\s') =>
  str.replace(new RegExp(`^([${c}]*)(.*?)([${c}]*)$`), '$2')

/**
 * Test if a given folder has a given konnector reference
 *
 * @param {import('../types').IOCozyFolder} folder - folder to test
 * @param {string} slug -  konnector slug
 * @returns {boolean}
 */
const hasKonnectorReference = (folder, slug) =>
  Boolean(
    folder.referenced_by?.find(
      ref =>
        ref.type === 'io.cozy.konnectors' &&
        ref.id === 'io.cozy.konnectors/' + slug
    )
  )

/**
 * Test if a given folder has a given source account identifier reference
 *
 * @param {import('../types').IOCozyFolder} folder - folder to test
 * @param {string} [sourceAccountIdentifier] - source account identifier
 * @returns {boolean}
 */
const hasSourceAccountIdentifierReference = (
  folder,
  sourceAccountIdentifier
) => {
  return Boolean(
    folder.referenced_by?.find(
      ref =>
        ref.type === 'io.cozy.accounts.sourceAccountIdentifier' &&
        (sourceAccountIdentifier ? ref.id === sourceAccountIdentifier : true)
    )
  )
}

/**
 * Ensure that a given folder has the given konnector reference
 *
 * @param {object} options - options object
 * @param {CozyClient} options.client - CozyClient instance
 * @param {import('../types').IOCozyFolder} options.folder - folder to test
 * @param {import('../types').IOCozyKonnector} options.konnector - konnector to which we want the reference
 * @returns {Promise<void>}
 */
const ensureKonnectorReference = async ({ client, folder, konnector }) => {
  const fileCollection = client.collection(FILES_DOCTYPE)
  if (!hasKonnectorReference(folder, konnector.slug)) {
    await fileCollection.addReferencesTo(konnector, [folder])
  }
}

/**
 * Ensure that a given folder has the given source account identifier reference
 *
 * @param {object} options - options object
 * @param {CozyClient} options.client - CozyClient instance
 * @param {import('../types').IOCozyFolder} options.folder - folder to test
 * @param {string} options.sourceAccountIdentifier - source account identifier to which we want the reference
 * @returns {Promise<void>}
 */
const ensureSourceAccountIdentifierReference = async ({
  client,
  folder,
  sourceAccountIdentifier
}) => {
  const fileCollection = client.collection(FILES_DOCTYPE)
  if (!hasSourceAccountIdentifierReference(folder, sourceAccountIdentifier)) {
    await fileCollection.addReferencesTo(
      {
        _id: sourceAccountIdentifier,
        _type: 'io.cozy.accounts.sourceAccountIdentifier'
      },
      [folder]
    )
  }
}

/**
 * try to find a konnector account folder using file references
 *
 * @param {object} options - options object
 * @param {CozyClient} options.client - CozyClient instance
 * @param {string} options.slug - konnector slug
 * @param {string} options.sourceAccountIdentifier - source account identifier
 * @returns {Promise<import('../types').IOCozyFolder>}
 */
export const findKonnectorAccountFolderByReference = async ({
  client,
  slug,
  sourceAccountIdentifier
}) => {
  const { included: folders } = await client.query(
    Q(FILES_DOCTYPE)
      .partialIndex({ type: 'directory', trashed: false })
      .referencedBy({
        _type: 'io.cozy.konnectors',
        _id: `io.cozy.konnectors/${slug}`
      })
  )
  return folders.find(folder =>
    hasSourceAccountIdentifierReference(folder, sourceAccountIdentifier)
  )
}

/**
 * try to find a konnector main folder using file references
 *
 * @param {object} options - options object
 * @param {CozyClient} options.client - CozyClient instance
 * @param {string} options.slug - konnector slug
 * @returns {Promise<import('../types').IOCozyFolder>}
 */
const findKonnectorMainFolderByReference = async ({ client, slug }) => {
  const { included: files } = await client.query(
    Q(FILES_DOCTYPE)
      .partialIndex({ type: 'directory', trashed: false })
      .referencedBy({
        _type: 'io.cozy.konnectors',
        _id: `io.cozy.konnectors/${slug}`
      })
  )
  return files.find(file => !hasSourceAccountIdentifierReference(file))
}

/**
 * Will create or update an account folder with proper references
 *
 * @param {object} options - options object
 * @param {CozyClient} options.client - CozyClient instance
 * @param {import('../types').IOCozyFolder} options.mainFolder - Main konnector folder where the account folder may be created
 * @param {import('../types').IOCozyKonnector} options.konnector - Konnector associated to the main folder
 * @param {string} options.sourceAccountIdentifier - source account identifier
 * @param {Array<string>} options.reservedFolderIds - ids of the root and magic folders
 * @returns {Promise<import('../types').IOCozyFolder>}
 */
async function saveKonnectorAccountFolder({
  client,
  mainFolder,
  konnector,
  sourceAccountIdentifier,
  reservedFolderIds
}) {
  const path = mainFolder.path + '/' + sourceAccountIdentifier
  const folder =
    (await statDirectoryByPath(client, path)) ||
    (await createDirectoryByPath(client, path))
  assertNotReservedFolder(folder, reservedFolderIds)
  await ensureKonnectorReference({ client, folder, konnector })
  await ensureSourceAccountIdentifierReference({
    client,
    folder,
    sourceAccountIdentifier
  })
  return folder
}
