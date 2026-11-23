import deepmerge from '@fastify/deepmerge'
import fastEqual from 'fast-deep-equal'
import get from 'lodash/get'
import omit from 'lodash/omit'

import logger from '../logger'
import { MutationTypes } from '../queries/dsl'
import { properId } from './helpers'
import { isReceivingMutationResult } from './mutations'
import { isReceivingData } from './queries'

// By default, deepmerge concatenate array values.
// We do not want concatenation and we do not know how to do partial updates
// so we decide to keep the array of the new data.

// In deepmerge semantics, source object is applied on target object
const replaceByClonedSource = options => {
  const clone = options.clone
  return function (target, source) {
    return clone(source)
  }
}

const deepmergeFn = deepmerge({ mergeArray: replaceByClonedSource })

const storeDocument = (state, document) => {
  const type = document._type
  if (!type) {
    if (process.env.NODE_ENV !== 'production') {
      logger.info('Document without _type', document)
    }
    throw new Error('Document without _type')
  }
  if (!properId(document)) {
    if (process.env.NODE_ENV !== 'production') {
      logger.info('Document without id', document)
    }
    throw new Error('Document without id')
  }

  const existingDoc = get(state, [type, properId(document)])

  if (fastEqual(existingDoc, document)) {
    return state
  } else {
    return {
      ...state,
      [type]: {
        ...state[type],
        [properId(document)]: mergeDocumentsWithRelationships(
          existingDoc,
          document
        )
      }
    }
  }
}

export const mergeDocumentsWithRelationships = (
  prevDocument = {},
  nextDocument = {}
) => {
  /**
   * @type {import("../types").CozyClientDocument}
   */
  const merged = {
    ...prevDocument,
    ...nextDocument
  }

  if (prevDocument.relationships || nextDocument.relationships)
    merged.relationships = {
      ...prevDocument.relationships,
      ...nextDocument.relationships
    }

  return merged
}

// reducer
const documents = (state = {}, action) => {
  if (!isReceivingData(action) && !isReceivingMutationResult(action)) {
    return state
  }

  if (action && action.definition) {
    if (action.definition.mutationType === MutationTypes.DELETE_DOCUMENT) {
      const docId = action.definition.document._id
      const _type = action.definition.document._type
      return {
        ...state,
        [_type]: omit(state[_type], docId)
      }
    } else if (
      action.definition.mutationType === MutationTypes.DELETE_DOCUMENTS
    ) {
      const docIds = action.definition.documents.map(doc => doc._id)
      const _type = action.definition.documents[0]._type
      return {
        ...state,
        [_type]: omit(state[_type], docIds)
      }
    }
  }

  const { data, included } = action.response
  if (!data || (Array.isArray(data) && data.length === 0)) return state

  const updatedStateWithIncluded = included
    ? included.reduce(storeDocument, state)
    : state
  if (!Array.isArray(data)) {
    return storeDocument(updatedStateWithIncluded, data)
  }
  return extractAndMergeDocument(data, updatedStateWithIncluded)
}

export default documents

/**
 * Get document from state, by its id
 *
 * @param {import('../types').DocumentsStateSlice} state The documents' slice
 * @param {string} doctype The doctype to target
 * @param {string} id The document id to get
 * @returns {import('../types').CozyClientDocument} the document found by its id
 */
export const getDocumentFromSlice = (state = {}, doctype, id) => {
  if (!doctype) {
    throw new Error(
      'getDocumentFromSlice: Cannot retrieve document with undefined doctype'
    )
  }
  if (!id) {
    throw new Error(
      'getDocumentFromSlice: Cannot retrieve document with undefined id'
    )
  }
  if (!state[doctype]) {
    if (process.env.NODE_ENV !== 'production') {
      logger.info(
        `getDocumentFromSlice: ${doctype} is absent from the store's documents. State is`,
        state
      )
    }
    return null
  } else if (!state[doctype][id]) {
    if (process.env.NODE_ENV !== 'production') {
      logger.info(
        `getDocumentFromSlice: ${doctype}:${id} is absent from the store documents. State is`,
        state
      )
    }
    return null
  }
  return state[doctype][id]
}

/**
 * Get documents from state, by their ids
 *
 * @param {import('../types').DocumentsStateSlice} state The documents' slice
 * @param {string} doctype The doctype to target
 * @param {Array<string>} ids The list of document ids to get
 * @returns {Array<import('../types').CozyClientDocument>} the list of documents found by their ids
 */
export const getDocumentsFromSlice = (state = {}, doctype, ids) => {
  if (!doctype) {
    throw new Error(
      'getDocumentsFromSlice: Cannot retrieve documents with undefined doctype'
    )
  }
  if (!ids || ids.length < 1) {
    throw new Error(
      'getDocumentsFromSlice: Cannot retrieve documents with undefined ids'
    )
  }
  if (!state[doctype]) {
    if (process.env.NODE_ENV !== 'production') {
      logger.info(
        `getDocumentsFromSlice: ${doctype} is absent from the store's documents. State is`,
        state
      )
    }
    return []
  }
  return ids.map(id => state[doctype][id]).filter(Boolean)
}

export const getCollectionFromSlice = (state = {}, doctype) => {
  if (!doctype) {
    throw new Error(
      'getDocumentFromSlice: Cannot retrieve document with undefined doctype'
    )
  }
  if (!state[doctype]) {
    if (process.env.NODE_ENV !== 'production') {
      logger.info(
        `getCollectionFromSlice: ${doctype} is absent from the store documents. State is`,
        state
      )
    }
    return null
  }

  return Object.values(state[doctype])
}

/**
 * 
 * This method has been created in order to get a returned object
   in `data` with the full set on information coming potentially from
  `included`
 
  This method should be somewhere else. The `document` shall not be
  dealt with included / data and so on.
 
  This method takes `data` and `included` and merge both sources
  together. It should be always up-to-date. The returned object
  will be as full of information as it can be.
 
 * @param {Array<import('../types').CozyClientDocument>} newData - Queries documents 
 * @param {import("../types").DocumentsStateSlice} updatedStateWithIncluded documents' state 
 * @returns {import("../types").DocumentsStateSlice} the merged documents state
 */
export const extractAndMergeDocument = (newData, updatedStateWithIncluded) => {
  const doctype = newData[0]._type

  if (!doctype) {
    logger.info('Document without _type', newData[0])
    throw new Error('Document without _type')
  }

  // Index docs by id, for faster retrieval
  const newDocsMap = new Map(newData.map(doc => [properId(doc), doc]))

  const mergedState = Object.assign({}, updatedStateWithIncluded)
  // FIXME: this was introduced for a bug in banks, but it does not look useful
  mergedState[doctype] = Object.assign({}, updatedStateWithIncluded[doctype])
  if (!mergedState[doctype]) {
    mergedState[doctype] = {}
  }

  let haveDocumentsChanged = false

  newDocsMap.forEach((newDoc, key) => {
    const id = key
    const currentDoc = mergedState[doctype][id]
    if (!currentDoc) {
      mergedState[doctype][id] = newDoc
      haveDocumentsChanged = true
    } else if (!fastEqual(currentDoc, newDoc)) {
      // XXX Here we check if the doc has changed. Note this would be way faster
      // by just relying on revision change, but:
      //  - it does not work if the new doc is partial (i.e. retrieved with a .select query)
      //  - some documents might change without a rev change: typically the thumbnails links
      //    in io.cozy.files, and the io.cozy.settings.instance doc, with additional
      //    fields added by the stack
      //  - some documents don't have any revision
      mergedState[doctype][id] = deepmergeFn(mergedState[doctype][id], newDoc)
      haveDocumentsChanged = true
    }
  })
  // XXX If there is any state change, the updated state should have a new reference,
  // as we heavily rely on referential equality.
  // Conversely, if there is no change, the same reference should be kept
  if (haveDocumentsChanged) {
    return mergedState
  }
  return updatedStateWithIncluded
}
