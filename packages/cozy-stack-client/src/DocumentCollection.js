import flag from 'cozy-flags'
import { uri, attempt, sleep } from './utils'
import uniq from 'lodash/uniq'
import omit from 'lodash/omit'
import head from 'lodash/head'
import merge from 'lodash/merge'
import startsWith from 'lodash/startsWith'
import qs from 'qs'
import {
  MangoQueryOptions,
  MangoSelector,
  MangoPartialFilter,
  DesignDoc
} from './mangoIndex'
import { normalizeDoc, normalizeDoctypeRawApi } from './normalize'

import Collection, {
  dontThrowNotFoundError,
  isIndexNotFoundError,
  isIndexConflictError,
  isNoUsableIndexError,
  isDocumentUpdateConflict,
  isIndexNotUsedWarning,
  isTimeoutError
} from './Collection'
import {
  getIndexNameFromFields,
  transformSort,
  getIndexFields,
  isMatchingIndex,
  normalizeDesignDoc
} from './mangoIndex'
import * as querystring from './querystring'

import logger from './logger'

const DATABASE_DOES_NOT_EXIST = 'Database does not exist.'

const prepareForDeletion = x =>
  Object.assign({}, omit(x, '_type'), { _deleted: true })

class IndexAlreadyExistsError extends Error {
  constructor(message) {
    super(message)
    this.name = 'IndexAlreadyExistsError'
  }
}
/**
 * Abstracts a collection of documents of the same doctype, providing CRUD methods and other helpers.
 */
class DocumentCollection {
  constructor(doctype, stackClient, _options) {
    this.doctype = doctype
    this.stackClient = stackClient
    this.indexes = {}
    this.endpoint = `/data/${this.doctype}/`
  }

  /**
   * Provides a callback for `Collection.get`
   *
   * @param {string} doctype - Document doctype
   * @returns {Function} (data, response) => normalizedDocument
   *                                        using `normalizeDoc`
   */
  static normalizeDoctype(doctype) {
    return normalizeDoctypeRawApi(doctype)
  }

  /**
   * Lists all documents of the collection, without filters.
   *
   * The returned documents are paginated by the stack.
   *
   * @param {object} options The fetch options: pagination & fetch of specific docs.
   * @param {number|null} [options.limit=100] - Pagination limit
   * @param {number} [options.skip=0] - Pagination Skip
   * @param {string} [options.bookmark] - Pagination bookmark
   * @param {Array<string>} [options.keys] - Keys to query
   * @returns {Promise<{data, meta, skip, bookmark, next}>} The JSON API conformant response.
   * @throws {FetchError}
   */
  async all({ limit = 100, skip = 0, bookmark, keys } = {}) {
    // If the limit is intentionnally null, we need to use _all_docs, since
    // _normal_docs uses _find and has a hard limit of 1000
    const isUsingAllDocsRoute = !!keys || limit === null
    const route = isUsingAllDocsRoute ? '_all_docs' : '_normal_docs'
    const url = uri`/data/${this.doctype}/${route}`
    const params = {
      include_docs: true,
      limit,
      skip,
      keys,
      bookmark
    }
    const path = querystring.buildURL(url, params)

    // If no document of this doctype exist, this route will return a 404,
    // so we need to try/catch and return an empty response object in case of a 404
    let resp
    try {
      resp = await this.stackClient.fetchJSON('GET', path)
    } catch (error) {
      return dontThrowNotFoundError(error)
    }
    let data
    /* If using `all_docs` we need to filter our design documents and check if
    the document is not null. If we use `normal_doc` we can't have any design doc
     */
    if (isUsingAllDocsRoute) {
      data = resp.rows
        .filter(doc => {
          return (
            doc &&
            doc.doc !== null &&
            !doc.error &&
            !startsWith(doc.id, '_design')
          )
        })
        .map(row => {
          return normalizeDoc(row.doc, this.doctype)
        })
    } else {
      data = resp.rows.map(row => {
        return normalizeDoc(row, this.doctype)
      })
    }

    // The presence of a bookmark doesn’t guarantee that there are more results.
    // See https://docs.couchdb.org/en/2.2.0/api/database/find.html#pagination
    const next = bookmark
      ? resp.rows.length >= limit
      : skip + resp.rows.length < resp.total_rows

    return {
      data,
      meta: { count: isUsingAllDocsRoute ? data.length : resp.total_rows },
      skip: skip,
      bookmark: resp.bookmark,
      next
    }
  }

  /**
   * Fetch Documents with Mango
   *
   * @param {string} path - path to fetch
   * @param {MangoSelector} selector - selector
   * @param {MangoQueryOptions} options - request options
   */
  async fetchDocumentsWithMango(path, selector, options = {}) {
    return this.stackClient.fetchJSON(
      'POST',
      path,
      this.toMangoOptions(selector, options)
    )
  }

  /**
   * Migrate an existing index to a new one with a different name.
   *
   * Index migration became necessary for optimistic index, because
   * we started to use named index while we used to have unamed index,
   * i.e. indexes with CouchDB-generated ID. This can also be used to
   * migrate an index to a new name.
   *
   * @param {object} sourceIndex - The index to migrate
   * @param {string} targetIndexName - The new index name
   * @private
   */
  async migrateIndex(sourceIndex, targetIndexName) {
    try {
      await this.copyIndex(sourceIndex, targetIndexName)
      await this.destroyIndex(sourceIndex)
    } catch (error) {
      // A conflict might occur for parallel queries on same index:
      // we retry once
      if (!isDocumentUpdateConflict(error)) {
        throw error
      }
      sleep(1000)
      await this.copyIndex(sourceIndex, targetIndexName)
      await this.destroyIndex(sourceIndex)
    }
  }

  /**
   * Handle index creation if it is missing.
   *
   * When an index is missing, we first check if there is one with a different
   * name but the same definition. If yes, it means we found an old unamed
   * index, so we migrate it. If there is none, we create the new index.
   *
   * /!\ Warning: this method is similar to CozyPouchLink.ensureIndex()
   * If you edit this method, please check if the change is also needed in CozyPouchLink
   *
   * @param {object} selector The mango selector
   * @param {MangoQueryOptions} options The find options
   * @private
   */
  async handleMissingIndex(selector, options) {
    let { indexedFields, partialFilter } = options

    if (!indexedFields) {
      indexedFields = getIndexFields({ sort: options.sort, selector })
    }

    const indexName = getIndexNameFromFields(indexedFields, partialFilter)
    const existingIndex = await this.findExistingIndex(selector, options)
    if (!existingIndex) {
      await this.createIndex(indexedFields, {
        partialFilter,
        indexName
      })
    } else if (existingIndex._id !== `_design/${indexName}`) {
      await this.migrateIndex(existingIndex, indexName)
    } else if (existingIndex) {
      throw new IndexAlreadyExistsError(`Index already exists: ${indexName}`)
    } else {
      throw new Error(`Index unusable for query, index used: ${indexName}`)
    }
  }

  /**
   * Find documents with the mango selector and create index
   * if missing.
   *
   * We adopt an optimistic approach for index creation:
   * we run the query first, and only if an index missing
   * error is returned, the index is created and
   * the query run again.
   *
   * @param {string} path The route path
   * @param {MangoSelector} selector The mango selector
   * @param {MangoQueryOptions} options The find options
   *
   * @returns {Promise<object>} - The find response
   * @protected
   */
  async findWithMango(path, selector, options = {}) {
    let resp
    try {
      resp = await this.fetchDocumentsWithMango(path, selector, options)
      const warning = resp.warning || resp.meta?.warning
      if (warning && isIndexNotUsedWarning(warning)) {
        // This warning might happen when an index is not created yet.
        throw new Error('no_index')
      }
    } catch (error) {
      if (
        isIndexNotFoundError(error) ||
        isNoUsableIndexError(error) ||
        isTimeoutError(error)
      ) {
        // An error specifying an index not found or not usable is probably because the index
        // is not yet created.
        // Likewise, a timeout error might occur when couchdb does not find the index
        // but tries to run the query anyway, which might result in a timeout.
        // We do not know how to prevent this behavior, so we handle it like a missing index.
        try {
          await this.handleMissingIndex(selector, options)
          resp = await this.fetchDocumentsWithMango(path, selector, options)
          return resp
        } catch (error) {
          if (error instanceof IndexAlreadyExistsError) {
            resp = await this.fetchDocumentsWithMango(path, selector, options)
            return resp
          }
          throw error
        }
      }
      throw error
    }
    return resp
  }
  /**
   * Returns a filtered list of documents using a Mango selector.
   
The returned documents are paginated by the stack.
   *
   * @param {MangoSelector} selector The Mango selector.
   * @param {MangoQueryOptions} options MangoQueryOptions
   * @returns {Promise<{data, skip, bookmark, next, execution_stats}>} The JSON API conformant response.
   * @throws {FetchError}
   */
  async find(selector, options = {}) {
    const { skip = 0 } = options
    let resp
    try {
      const path = uri`/data/${this.doctype}/_find`
      resp = await this.findWithMango(path, selector, options)
    } catch (error) {
      return dontThrowNotFoundError(error)
    }
    return {
      data: resp.docs.map(doc => normalizeDoc(doc, this.doctype)),
      next: resp.next,
      skip,
      bookmark: resp.bookmark,
      execution_stats: resp.execution_stats
    }
  }

  /**
   * Returns a filtered list with all documents using a Mango selector,
   * automatically fetching more documents if the total of documents is
   * superior to the pagination limit.
   * Can result in a lot of network requests.
   *
   The returned documents are paginated by the stack.
   *
   * @param {MangoSelector} selector The Mango selector.
   * @param {MangoQueryOptions} options MangoQueryOptions
   * @returns {Promise<Array<{data}>>} Documents fetched
   * @throws {FetchError}
   */
  async findAll(selector, options = {}) {
    let next = true
    let documents = []
    let bookmark = options.bookmark || undefined
    while (next) {
      const resp = await this.find(selector, { ...options, bookmark })
      documents.push(...resp.data)
      bookmark = resp.bookmark
      next = resp.next
    }
    return documents
  }

  /**
   * Get a document by id
   *
   * @param  {string} id The document id.
   * @returns {Promise<object>}  JsonAPI response containing normalized document as data attribute
   */
  async get(id) {
    return Collection.get(
      this.stackClient,
      `${this.endpoint}${encodeURIComponent(id)}`,
      {
        normalize: this.constructor.normalizeDoctype(this.doctype)
      }
    )
  }

  /**
   * Get many documents by id
   */
  async getAll(ids) {
    let resp
    try {
      resp = await this.stackClient.fetchJSON(
        'POST',
        uri`/data/${this.doctype}/_all_docs?include_docs=true`,
        {
          keys: ids
        }
      )
    } catch (error) {
      return dontThrowNotFoundError(error)
    }
    const rows = resp.rows.filter(row => row.doc)
    return {
      data: rows.map(row => normalizeDoc(row.doc, this.doctype)),
      meta: {
        count: rows.length
      }
    }
  }

  /**
   * Creates a document
   *
   * @param {object} doc - Document to create. Optional: you can force the id with the _id attribute
   */
  async create({ _id, _type, ...document }) {
    // In case of a fixed id, let's use the dedicated creation endpoint
    // https://github.com/cozy/cozy-stack/blob/master/docs/data-system.md#create-a-document-with-a-fixed-id
    const hasFixedId = !!_id
    const method = hasFixedId ? 'PUT' : 'POST'
    const endpoint = uri`/data/${this.doctype}/${hasFixedId ? _id : ''}`
    const resp = await this.stackClient.fetchJSON(method, endpoint, document)
    return {
      data: normalizeDoc(resp.data, this.doctype)
    }
  }

  /**
   * Updates a document
   *
   * @param {object} document - Document to update. Do not forget the _id attribute
   */
  async update(document) {
    const resp = await this.stackClient.fetchJSON(
      'PUT',
      uri`/data/${this.doctype}/${document._id}`,
      document
    )
    return {
      data: normalizeDoc(resp.data, this.doctype)
    }
  }

  /**
   * Destroys a document
   *
   * @param {object} doc - Document to destroy. Do not forget _id and _rev attributes
   */
  async destroy({ _id, _rev, ...document }) {
    const resp = await this.stackClient.fetchJSON(
      'DELETE',
      uri`/data/${this.doctype}/${_id}?rev=${_rev}`
    )
    return {
      data: normalizeDoc(
        { ...document, _id, _rev: resp.rev, _deleted: true },
        this.doctype
      )
    }
  }

  /**
   * Updates several documents in one batch
   *
   * @param  {Document[]} rawDocs Documents to be updated
   */
  async updateAll(rawDocs) {
    const stackClient = this.stackClient
    const docs = rawDocs ? rawDocs.map(d => omit(d, '_type')) : rawDocs

    if (!docs || !docs.length) {
      return Promise.resolve([])
    }
    try {
      const update = await stackClient.fetchJSON(
        'POST',
        `/data/${this.doctype}/_bulk_docs`,
        {
          docs
        }
      )
      return update
    } catch (e) {
      if (
        e.reason &&
        e.reason.reason &&
        e.reason.reason === DATABASE_DOES_NOT_EXIST
      ) {
        const firstDoc = await this.create(docs[0])
        const resp = await this.updateAll(docs.slice(1))
        resp.unshift({ ok: true, id: firstDoc._id, rev: firstDoc._rev })
        return resp
      } else {
        throw e
      }
    }
  }

  /**
   * Deletes several documents in one batch
   *
   * @param  {Document[]} docs - Documents to delete
   */
  destroyAll(docs) {
    return this.updateAll(docs.map(prepareForDeletion))
  }

  /**
   * Returns Mango Options from Selector and Options
   *
   * @param {MangoSelector} selector - Mango selector
   * @param {MangoQueryOptions} options - Mango Options
   * @returns {MangoQueryOptions} Mango options
   */
  toMangoOptions(selector, options = {}) {
    let { sort, indexedFields, partialFilter } = options
    const { fields, skip = 0, limit, bookmark } = options

    sort = transformSort(sort)

    if (!indexedFields && selector) {
      logger.warn(
        'Selector fields should be manually indexed to prevent unexpected behaviour'
      )
    }

    indexedFields = indexedFields
      ? indexedFields
      : getIndexFields({ sort, selector })

    const indexName =
      options.indexId ||
      `_design/${getIndexNameFromFields(indexedFields, partialFilter)}`

    if (sort) {
      const sortOrders = uniq(
        sort.map(sortOption => head(Object.values(sortOption)))
      )
      if (sortOrders.length > 1)
        throw new Error('Mango sort can only use a single order (asc or desc).')
      const sortOrder = sortOrders.length > 0 ? head(sortOrders) : 'asc'

      for (const field of indexedFields) {
        if (!sort.find(sortOption => head(Object.keys(sortOption)) === field))
          sort.push({ [field]: sortOrder })
      }
    }
    // We need to pass the partialFilter in the selector, otherwise CouchDB might
    // fallback on another index if it does not exist yet
    const mergedSelector = partialFilter
      ? merge({ ...selector }, partialFilter)
      : selector

    return {
      selector: mergedSelector,
      use_index: indexName,
      // _id is necessary for the store, and _rev is required for offline. See https://github.com/cozy/cozy-client/blob/95978d39546023920b0c01d689fed5dd41577a02/packages/cozy-client/src/CozyClient.js#L1153
      fields: fields ? [...fields, '_id', '_rev'] : undefined,
      limit,
      skip,
      bookmark: options.bookmark || bookmark,
      sort,
      execution_stats: flag('debug') ? true : undefined
    }
  }

  async checkUniquenessOf(property, value) {
    const indexId = await this.getUniqueIndexId(property)
    const existingDocs = await this.find(
      { [property]: value },
      { indexId, fields: ['_id'] }
    )
    return existingDocs.data.length === 0
  }

  getUniqueIndexId(property) {
    return this.getIndexId([property], {
      indexName: `${this.doctype}/${property}`
    })
  }

  async getIndexId(
    fields,
    { partialFilter = '', indexName = getIndexNameFromFields(fields) }
  ) {
    if (!this.indexes[indexName]) {
      let index
      try {
        index = await this.createIndex(fields, {
          partialFilter
        })
      } catch (error) {
        if (!isIndexConflictError(error)) {
          throw error
        } else {
          // This error much probably comes from 2 parallel index creation.
          // So we wait & retry
          await sleep(1000)
          index = await this.createIndex(fields, {
            partialFilter
          })
        }
      }
      this.indexes[indexName] = index
    }
    return this.indexes[indexName].id
  }
  /**
   *
   * @param {Array} fields - Fields to index
   * @param {object} indexOption - Options for the index
   * @param {MangoPartialFilter} [indexOption.partialFilter] - partialFilter
   * @param {string} [indexOption.indexName] - indexName
   * @returns {Promise<{id, fields}>}
   */
  async createIndex(fields, { partialFilter, indexName } = {}) {
    const indexDef = {
      index: {
        fields
      }
    }
    if (indexName) {
      indexDef.ddoc = indexName
    }
    if (partialFilter) {
      indexDef.index.partial_filter_selector = partialFilter
    }
    let resp
    try {
      resp = await this.stackClient.fetchJSON(
        'POST',
        uri`/data/${this.doctype}/_index`,
        indexDef
      )
    } catch (error) {
      if (!isIndexConflictError(error)) {
        throw error
      } else {
        // This error much probably comes from 2 parallel index creation, so
        // there is nothing to do here as the index will eventually be created
        return
      }
    }
    const indexResp = {
      id: resp.id,
      fields
    }
    if (resp.result === 'exists') return indexResp

    // indexes might not be usable right after being created; so we delay the resolving until they are
    const selector = {}
    fields.forEach(f => (selector[f] = { $gt: null }))
    const options = {
      indexId: indexResp.id,
      limit: 1,
      partialFilterFields: partialFilter
        ? getIndexFields({ partialFilter })
        : null
    }

    if (await attempt(this.find(selector, options))) return indexResp
    // one retry
    await sleep(1000)
    if (await attempt(this.find(selector, options))) return indexResp
    await sleep(500)
    return indexResp
  }

  /**
   * Retrieve all design docs of mango indexes
   *
   * @returns {Promise<DesignDoc[]>} The design docs
   */
  async fetchAllMangoIndexes() {
    const path = uri`/data/${this.doctype}/_design_docs?include_docs=true`
    const indexes = await this.stackClient.fetchJSON('GET', path)
    // Filter out views index
    return indexes.rows
      .filter(index => index.doc.language === 'query')
      .map(doc => normalizeDesignDoc(doc))
  }

  /**
   * Delete the specified design doc
   *
   * @param {DesignDoc} index - The design doc to remove
   * @returns {Promise<object>} The delete response
   */
  async destroyIndex(index) {
    const ddoc = index._id.split('/')[1]
    const rev = index._rev
    const path = uri`/data/${this.doctype}/_design/${ddoc}?rev=${rev}`
    return this.stackClient.fetchJSON('DELETE', path)
  }

  /**
   * Copy an existing design doc.
   *
   * This is useful to create a new design doc without
   * having to recompute the existing index.
   *
   * @param {DesignDoc} existingIndex - The design doc to copy
   * @param {string} newIndexName - The name of the copy
   * @returns {Promise<DesignDoc>} The copy response
   */
  async copyIndex(existingIndex, newIndexName) {
    const ddoc = existingIndex._id.split('/')[1]
    const rev = existingIndex._rev
    const path = uri`/data/${this.doctype}/_design/${ddoc}/copy?rev=${rev}`
    const options = {
      headers: {
        Destination: `_design/${newIndexName}`
      }
    }
    return this.stackClient.fetchJSON('POST', path, null, options)
  }

  /**
   * Find an existing mango index based on the query definition
   *
   * This is useful to avoid creating new indexes having the
   * same definition of an existing one.
   *
   * @param {MangoSelector}     selector  The query selector
   * @param {MangoQueryOptions} options   The find options
   *
   * @returns {Promise<DesignDoc>} A matching index if it exists
   * @private
   */
  async findExistingIndex(selector, options) {
    let { sort, indexedFields, partialFilter } = options
    const indexes = await this.fetchAllMangoIndexes()
    if (indexes.length < 1) {
      return null
    }
    sort = transformSort(sort)
    const fieldsToIndex = indexedFields
      ? indexedFields
      : getIndexFields({ sort, selector })

    const existingIndex = indexes.find(index => {
      return isMatchingIndex(index, fieldsToIndex, partialFilter)
    })
    return existingIndex
  }

  /**
   * Calls _changes route from CouchDB
   * No further treatment is done contrary to fetchchanges
   *
   * @param {object} couchOptions - Couch options for changes https://kutt.it/5r7MNQ
   * @param {string} [couchOptions.since] - Bookmark telling CouchDB from which point in time should changes be returned
   * @param {Array<string>} [couchOptions.doc_ids] - Only return changes for a subset of documents
   * @param {boolean} [couchOptions.includeDocs] - Includes full documents as part of results
   * @param {string} [couchOptions.filter] - Filter
   * @see https://docs.couchdb.org/en/stable/api/database/changes.html
   */
  async fetchChangesRaw(couchOptions) {
    const hasDocIds = couchOptions.doc_ids && couchOptions.doc_ids.length > 0
    const urlParams = `?${[
      qs.stringify({
        ...omit(couchOptions, ['doc_ids', 'includeDocs']),
        include_docs: couchOptions.includeDocs
      }),
      hasDocIds && couchOptions.filter === undefined
        ? 'filter=_doc_ids'
        : undefined
    ]
      .filter(Boolean)
      .join('&')}`

    const method = hasDocIds ? 'POST' : 'GET'
    const endpoint = `/data/${this.doctype}/_changes${urlParams}`
    const params = hasDocIds ? { doc_ids: couchOptions.doc_ids } : undefined
    const result = await this.stackClient.fetchJSON(method, endpoint, params)
    return result
  }

  /**
   * Use Couch _changes API
   * Deleted and design docs are filtered by default, thus documents are retrieved in the response
   * (include_docs is set to true in the parameters of _changes).
   *
   * You should use fetchChangesRaw to have low level control on _changes parameters.
   *
   * @param {object} couchOptions - Couch options for changes
   * @param {string} [couchOptions.since] - Bookmark telling CouchDB from which point in time should changes be returned
   * @param {Array<string>} [couchOptions.doc_ids] - Only return changes for a subset of documents
   *
   * @param {object} options - Further options on the returned documents. By default, it is set to { includeDesign: false, includeDeleted: false }
   * @param {boolean} [options.includeDesign] - Whether to include changes from design docs (needs include_docs to be true)
   * @param {boolean} [options.includeDeleted] - Whether to include changes for deleted documents (needs include_docs to be true)
   *
   * @typedef {object} FetchChangesReturnValue
   * @property {string} newLastSeq
   * @property {Array<object>} documents
   * @returns {Promise<FetchChangesReturnValue>}
   */
  async fetchChanges(couchOptions = {}, options = {}) {
    let opts = {
      // Necessary since we deal with deleted and design docs later
      includeDocs: true
    }
    if (typeof couchOptions !== 'object') {
      opts.since = couchOptions
      logger.warn(
        `fetchChanges use couchOptions as Object not a string, since is deprecated, please use fetchChanges({since: "${couchOptions}"}).`
      )
    } else if (Object.keys(couchOptions).length > 0) {
      Object.assign(opts, couchOptions)
    }
    const result = await this.fetchChangesRaw(opts)
    const newLastSeq = result.last_seq

    let docs = result.results.map(x => x.doc).filter(Boolean)
    if (!options.includeDesign) {
      docs = docs.filter(doc => doc._id.indexOf('_design') !== 0)
    }
    if (!options.includeDeleted) {
      docs = docs.filter(doc => !doc._deleted)
    }
    return {
      newLastSeq,
      documents: docs.map(doc => normalizeDoc(doc, this.doctype))
    }
  }
}

export default DocumentCollection
