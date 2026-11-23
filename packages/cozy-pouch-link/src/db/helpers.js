import fastEqual from 'fast-deep-equal'

import DatabaseQueryEngine from './dbInterface'

/**
 * Retrieve the existing document from Pouch
 *
 * @param {DatabaseQueryEngine} queryEngine - The query engine
 * @param {string} id - ID of the document to retrieve
 * @param {boolean} throwIfNotFound - If true the method will throw when the document is not found. Otherwise it will return null
 * @returns {Promise<import('./dbInterface').QueryResponseSingleDoc>}
 */
export const getExistingDocument = async (
  queryEngine,
  id,
  throwIfNotFound = false
) => {
  try {
    const existingDoc = await queryEngine.getById(id)
    return existingDoc
  } catch (err) {
    if (err.name === 'not_found' && !throwIfNotFound) {
      return null
    } else {
      throw err
    }
  }
}

export const areDocsEqual = async (oldDoc, newDoc) => {
  // Do not rely on revisions as they can be missing or wrong
  newDoc._rev = undefined
  oldDoc._rev = undefined

  if (fastEqual(oldDoc, newDoc)) {
    return true
  }
  return false
}

/**
 * Get cozyPouchData from a document
 *
 * Sometimes, queries are transformed by Collections and they call a dedicated
 * cozy-stack route. When this is the case, we want to be able to replicate the same
 * query from cozy-pouch-link. It is not possible as-is because the received data
 * is not the same as the one stored in the Couch database
 * To handle this, we store the received data in the Pouch with a dedicated id and
 * we store the query result in a `cozyPouchData` attribute
 * So when `cozyPouchData` attribute exists, we know that we want to return its content
 * as the result of the query
 *
 * @param {import('../CozyPouchLink').CozyPouchDocument} doc - The PouchDB doc
 * @returns { Array<import('cozy-client/types/types').CozyClientDocument>} The formatted docs
 */
export const getCozyPouchData = doc => {
  return doc.cozyPouchData
}
