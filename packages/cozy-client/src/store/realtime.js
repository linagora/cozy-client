import { DOCTYPE_FILES } from '../const'
import { Mutations } from '../queries/dsl'
import { receiveMutationResult } from './mutations'

/**
 * Normalizes an object representing a CouchDB document
 *
 * Ensures existence of `_type`
 *
 * @public
 * @param {import("../types").CouchDBDocument} couchDBDoc - object representing the document
 * @param {string} doctype - Doctype of the document
 * @param {string} [driveId] - Shared drive that emitted this event
 * @returns {import("../types").CozyClientDocument} full normalized document
 */
const normalizeDoc = (couchDBDoc, doctype, driveId) => {
  return {
    id: couchDBDoc._id,
    _type: doctype,
    ...(doctype === DOCTYPE_FILES && driveId ? { driveId } : {}),
    ...couchDBDoc
  }
}

/**
 * Enhances a document with additional attributes
 *
 * @async
 * @param {import("../types").CozyClientDocument} doc - The document to enhance
 * @param {Object} options - Options for enhancing the document
 * @param {Function} [options.enhanceDocFn] - Function to enhance document attributes
 * @param {object} options.client - CozyClient instance
 * @returns {Promise<import("../types").CozyClientDocument>} Enhanced document
 */
const enhanceDoc = async (doc, options) => {
  if (typeof options.enhanceDocFn === 'function') {
    return await options.enhanceDocFn(doc, {
      client: options.client
    })
  }
  return doc
}

/**
 * DispatchChange
 *
 * @param {object} client CozyClient instance
 * @param {import("../types").CozyClientDocument} document Document to update
 * @param {import("../types").Mutation} mutationDefinitionCreator Mutation to apply
 *
 */
const dispatchChange = (client, document, mutationDefinitionCreator) => {
  const response = { data: document }

  const options = {}
  client.dispatch(
    receiveMutationResult(
      client.generateRandomId(),
      response,
      options,
      mutationDefinitionCreator(document)
    )
  )
}

/**
 * @typedef {Object} DispatchOptions
 * @property {function} [enhanceDocFn] Optional function to enhance the document attributes before dispatch
 * @property {string} [driveId] Shared drive that emitted this event
 */

/**
 * Dispatches a create action for a document to update CozyClient store from realtime callbacks.
 *
 * @param {object} client - CozyClient instance
 * @param {import("../types").Doctype} doctype - Doctype of the document to create
 * @param {import("../types").CouchDBDocument} couchDBDoc - Document to create
 * @param {DispatchOptions} [options] Options
 */
export const dispatchCreate = async (
  client,
  doctype,
  couchDBDoc,
  options = {}
) => {
  const normalizedDoc = normalizeDoc(couchDBDoc, doctype, options.driveId)
  const enhancedDoc = await enhanceDoc(normalizedDoc, {
    client,
    enhanceDocFn: options?.enhanceDocFn
  })
  dispatchChange(client, enhancedDoc, Mutations.createDocument)
}

/**
 * Dispatches a update action for a document to update CozyClient store from realtime callbacks.
 *
 * @param {object} client - CozyClient instance
 * @param {import("../types").Doctype} doctype - Doctype of the document to create
 * @param {import("../types").CouchDBDocument} couchDBDoc - Document to create
 * @param {DispatchOptions} [options] Options
 */
export const dispatchUpdate = async (
  client,
  doctype,
  couchDBDoc,
  options = {}
) => {
  const normalizedDoc = normalizeDoc(couchDBDoc, doctype, options.driveId)
  const enhancedDoc = await enhanceDoc(normalizedDoc, {
    client,
    enhanceDocFn: options?.enhanceDocFn
  })
  dispatchChange(client, enhancedDoc, Mutations.updateDocument)
}

/**
 * Dispatches a delete action for a document to update CozyClient store from realtime callbacks.
 *
 * @param {object} client - CozyClient instance
 * @param {import("../types").Doctype} doctype - Doctype of the document to create
 * @param {import("../types").CouchDBDocument} couchDBDoc - Document to create
 * @param {DispatchOptions} [options] Options
 */
export const dispatchDelete = async (
  client,
  doctype,
  couchDBDoc,
  options = {}
) => {
  const normalizedDoc = normalizeDoc(
    { ...couchDBDoc, _deleted: true },
    doctype,
    options.driveId
  )
  const enhancedDoc = await enhanceDoc(normalizedDoc, {
    client,
    enhanceDocFn: options?.enhanceDocFn
  })
  dispatchChange(client, enhancedDoc, Mutations.deleteDocument)
}
