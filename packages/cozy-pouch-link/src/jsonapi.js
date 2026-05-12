import CozyClient, { generateWebLink } from 'cozy-client'
import omit from 'lodash/omit'
import startsWith from 'lodash/startsWith'
import { getCozyPouchData } from './db/helpers'
import { queryFileById, TYPE_DIRECTORY } from './files'
import logger from './logger'

/**
 * The paths are not stored in CouchDB for files, thus there are not in PouchDB neither.
 * So we keep all the file paths in memory to be able to quickly retrieve them
 * at search time.
 */
const allPaths = new Map()

export const getFilePath = id => {
  return id ? allPaths.get(id) : undefined
}

const setFilePath = (id, path) => {
  allPaths.set(id, path)
}

export const resetAllPaths = () => {
  allPaths.clear()
}

/**
 * Normalize several PouchDB document
 *
 * @param {CozyClient} client - The CozyClient instance
 * @param {string} doctype - The document's doctype
 * @param {Array<import('./CozyPouchLink').CozyPouchDocument>} docs - The documents to normalize
 */
export const normalizeDocs = (client, doctype, docs) => {
  for (let i = docs.length; i >= 0; i--) {
    const doc = docs[i]
    if (!doc) {
      docs.splice(i, 1)
      continue
    }
    if (startsWith(doc._id, '_design/')) {
      docs.splice(i, 1)
      continue
    }
    normalizeDoc(client, doctype, doc)
  }
}

/**
 * Normalize a PouchDB document
 * Note we directly modify the objet rather than creating a new one, as it is
 * much more performant. See commit description for details.
 *
 * @param {CozyClient} client - The CozyClient instance
 * @param {string} doctype - The document's doctype
 * @param {import('./CozyPouchLink').CozyPouchDocument} doc - The document to normalize
 */
export const normalizeDoc = (client, doctype, doc) => {
  const id = doc._id || doc.id
  doc.id = id
  doc._id = id
  doc._rev = doc._rev || doc.rev
  doc._type = doctype

  if (doc.referenced_by) {
    // TODO: should we remove referenced_by at the doc root?
    // For now, we keep it for safety
    doc.relationships = {
      ...doc.relationships,
      referenced_by: {
        links: undefined,
        data: doc.referenced_by
      }
    }
  }
  if (doc.rev) {
    doc.rev = undefined
  }

  if (doctype === 'io.cozy.apps') {
    normalizeAppsLinks(client, doctype, doc)
  }
  if (doctype === 'io.cozy.files') {
    computeFileFullpath(client, doc)
  }
}

const normalizeAppsLinks = (client, doctype, docRef) => {
  if (doctype !== 'io.cozy.apps') {
    return
  }

  const webLink = generateWebLink({
    cozyUrl: client.getStackClient().uri,
    slug: docRef.slug,
    subDomainType: client.capabilities.flat_subdomains ? 'flat' : 'nested',
    pathname: '',
    hash: '',
    searchParams: []
  })

  docRef.links = {
    self: `/apps/${docRef.slug}`,
    related: webLink,
    icon: `/apps/${docRef.slug}/icon/${docRef.version}`
  }
}

const buildPathWithName = (parentPath, fileName) => {
  const hasTrailingSlash = parentPath.substr(-1) === '/'
  const path = hasTrailingSlash
    ? `${parentPath}${fileName}`
    : `${parentPath}/${fileName}`
  return path
}

/**
 * Compute paths for files
 *
 * There are several ways to get a path:
 *   - It is already defined in the file
 *   - The file path exists in memory
 *   - The directory path exists in memory
 *   - The directory path is retrieved from db
 *
 * @param { CozyClient} client - The cozy client instance
 * @param { import('cozy-client/types/types').IOCozyFile} file - The file to compute path
 * @returns {Promise<import('cozy-client/types/types').IOCozyFile>} the completed file with path
 */
export const computeFileFullpath = async (client, file) => {
  if (file.type === TYPE_DIRECTORY) {
    // No need to compute directory path: it is always here
    return file
  }
  if (file.path) {
    // If a file path exists, check it is complete, i.e. it includes the name.
    // The stack typically does not include the name in the path, which is useful to search on it
    if (file.path?.includes(file.name)) {
      setFilePath(file._id, file.path)
      return file
    }
    const newPath = buildPathWithName(file.path, file.name)
    setFilePath(file._id, newPath)
    file.path = newPath
    return file
  }
  const filePath = getFilePath(file._id)
  const parentPath = getFilePath(file.dir_id)
  if (parentPath && filePath) {
    // Check if file path is up to date
    const builtPath = buildPathWithName(parentPath, file.name)
    if (filePath !== builtPath) {
      setFilePath(file._id, builtPath)
    }
    file.path = builtPath
    return file
  }
  if (parentPath) {
    // Parent path exists in memory: use it to compute file path and save in memory
    const path = buildPathWithName(parentPath, file.name)
    setFilePath(file._id, path)
    file.path = path
    return file
  }

  // If there is no path found at all, let's compute it from the parent path in database
  if (!file.dir_id) {
    logger.warn(`Missing dir_id for file ${file._id}`)
    return file
  }
  // queryFileById can resolve to undefined when offline (no parent dir
  // found in the link chain), so we must guard before destructuring.
  const result = await queryFileById(client, file.dir_id)
  const parentDir = result?.data

  if (parentDir?.path) {
    const path = buildPathWithName(parentDir.path, file.name)
    file.path = path
    // Add the computed paths in memory
    setFilePath(file.dir_id, parentDir.path)
    setFilePath(file._id, path)
  }
  return file
}

export const fromPouchResult = ({ res, withRows, doctype, client }) => {
  if (!res) {
    return null
  }

  // Handle special case for docs with `cozyPouchData`
  const cozyPouchData = getCozyPouchData(res)
  if (cozyPouchData) {
    return { data: cozyPouchData }
  }
  if (withRows) {
    const docs = res.rows ? res.rows.map(row => row.doc) : res.docs
    const offset = res.offset || 0
    const next =
      offset + docs.length < res.total_rows || docs.length >= res.limit
    normalizeDocs(client, doctype, docs)

    const result = {
      data: docs,
      meta: { count: docs.length },
      skip: offset,
      next
    }

    return result
  } else {
    Array.isArray(res)
      ? normalizeDocs(client, doctype, res)
      : normalizeDoc(client, doctype, res)
    return {
      data: res
    }
  }
}

export const sanitized = doc => omit(doc, '_type')

export const sanitizeJsonApi = doc => {
  const docWithoutType = sanitized(doc)
  const sanitizedDoc = omit(docWithoutType, ['attributes', 'meta'])
  return sanitizedDoc
}
