import zipWith from 'lodash/zipWith'

import { MutationTypes, QueryDefinition } from '../queries/dsl'
import CozyLink from './CozyLink'
import { DOCTYPE_FILES } from '../const'
import { BulkEditError } from '../errors'
import logger from '../logger'
import { isReactNativeOfflineError } from '../utils'
import { defaultPerformanceApi } from '../performances/defaultPerformanceApi'
import { resolveForceLink } from './forceLink'

/**
 *
 * To know if cozy-client should use Document.find()
 * or Document.all()
 * Similar to what is done in CozyPouchLink executeQuery()
 *
 * @param {QueryDefinition} queryDefinition - QueryDefinition to check
 * @returns {boolean} If has find options
 *
 */
const hasFindOptions = queryDefinition => {
  const { selector, partialFilter, sort, fields } = queryDefinition
  if (selector || partialFilter || sort || fields) return true
  return false
}

/**
 * Returns full documents after a bulk update
 *
 * @private
 *
 * @param  {import("../types").CouchDBBulkResult[]} bulkResponse - Response from bulk docs
 * @param  {import("../types").CozyClientDocument[]} originalDocuments - Documents that were updated
 * @returns {{ data: import("../types").CozyClientDocument[] }} - Full documents with updated _id and _rev
 */
export const transformBulkDocsResponse = (bulkResponse, originalDocuments) => {
  const updatedDocs = zipWith(bulkResponse, originalDocuments, (result, od) =>
    result.ok
      ? {
          ...od,
          _id: result.id,
          _rev: result.rev
        }
      : od
  )

  if (bulkResponse.find(x => !x.ok)) {
    throw new BulkEditError(bulkResponse, updatedDocs)
  }
  return {
    data: updatedDocs
  }
}

/**
 * @typedef {object} StackLinkOptions
 * @property {object} [stackClient] - A StackClient
 * @property {object} [client] - A StackClient (deprecated)
 * @property {import('cozy-pouch-link/dist/types').LinkPlatform} [platform] - Platform specific adapters and methods
 * @property {import('../performances/types').PerformanceAPI} [performanceApi] - The performance API that can be used to measure performances
 */

/**
 * Transfers queries and mutations to a remote stack
 */
export default class StackLink extends CozyLink {
  /**
   * @param {StackLinkOptions} [options] - Options
   */
  constructor({ client, stackClient, platform, performanceApi } = {}) {
    super()
    if (client) {
      logger.warn(
        'Using options.client is deprecated, prefer options.stackClient'
      )
    }
    this.stackClient = stackClient || client
    this.isOnline = platform?.isOnline

    /** @type {import('../performances/types').PerformanceAPI} */
    this.performanceApi = performanceApi || defaultPerformanceApi
  }

  get name() {
    return 'stack'
  }

  registerClient(client) {
    this.stackClient = client.stackClient || client.client
  }

  async reset() {
    this.stackClient = null
  }

  async request(operation, options, result, forward) {
    const forceLink = resolveForceLink(options)
    if (forceLink && forceLink !== this.name) {
      return forward(operation, options)
    }
    if (forceLink !== 'stack' && this.isOnline && !(await this.isOnline())) {
      return forward(operation, options)
    }
    try {
      if (operation.mutationType) {
        return await this.executeMutation(operation, options, result, forward)
      }
      return await this.executeQuery(operation)
    } catch (err) {
      if (forceLink !== 'stack' && isReactNativeOfflineError(err)) {
        return forward(operation, options)
      }
      throw err
    }
  }

  async persistCozyData(data, forward) {
    return forward(data)
  }
  /**
   *
   * @param {QueryDefinition} query - Query to execute
   * @returns {Promise<import("../types").ClientResponse>}
   */
  executeQuery(query) {
    const {
      doctype,
      selector,
      id,
      ids,
      referenced,
      sharingId,
      ...rawOptions
    } = query
    let options = { ...rawOptions, driveId: undefined }
    if (!doctype) {
      logger.warn('Bad query', query)
      throw new Error('No doctype found in a query definition')
    }
    if (doctype === DOCTYPE_FILES && sharingId) {
      options = { ...options, driveId: sharingId }
    }
    const collection = this.stackClient.collection(doctype, options)
    if (id) {
      return collection.get(id, query)
    }
    if (ids) {
      return collection.getAll(ids)
    }
    if (referenced) {
      return collection.findReferencedBy(referenced, options)
    }
    if (hasFindOptions(query)) {
      return collection.find(selector, options)
    } else {
      return collection.all(options)
    }
  }

  async executeMutation(mutation, options, result, forward) {
    const { mutationType, document: doc, documents: docs, ...props } = mutation
    switch (mutationType) {
      case MutationTypes.CREATE_DOCUMENT:
        return this.stackClient.collection(doc._type).create(doc)
      case MutationTypes.UPDATE_DOCUMENTS: {
        const updateAllResp = await this.stackClient
          .collection(docs[0]._type)
          .updateAll(docs)
        return transformBulkDocsResponse(updateAllResp, docs)
      }
      case MutationTypes.UPDATE_DOCUMENT:
        return this.stackClient.collection(doc._type).update(doc)
      case MutationTypes.DELETE_DOCUMENT:
        return this.stackClient.collection(doc._type).destroy(doc)
      case MutationTypes.DELETE_DOCUMENTS:
        return this.stackClient.collection(doc._type).destroyAll(docs)
      case MutationTypes.ADD_REFERENCES_TO:
        return this.stackClient
          .collection(props.referencedDocuments[0]._type)
          .addReferencesTo(doc, props.referencedDocuments)
      case MutationTypes.REMOVE_REFERENCES_TO:
        return this.stackClient
          .collection(props.referencedDocuments[0]._type)
          .removeReferencesTo(doc, props.referencedDocuments)
      case MutationTypes.ADD_REFERENCED_BY:
        if (doc._type === DOCTYPE_FILES) {
          return this.stackClient
            .collection(DOCTYPE_FILES)
            .addReferencedBy(doc, props.referencedDocuments)
        } else {
          throw new Error('The document type should be io.cozy.files')
        }
      case MutationTypes.REMOVE_REFERENCED_BY:
        if (doc._type === DOCTYPE_FILES) {
          return this.stackClient
            .collection(DOCTYPE_FILES)
            .removeReferencedBy(doc, props.referencedDocuments)
        } else {
          throw new Error('The document type should be io.cozy.files')
        }
      case MutationTypes.UPLOAD_FILE:
        return this.stackClient
          .collection(DOCTYPE_FILES)
          .upload(props.file, props.dirPath)
      default:
        return forward(mutation, options, result)
    }
  }
}
