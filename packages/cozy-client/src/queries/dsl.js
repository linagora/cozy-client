import findKey from 'lodash/findKey'

import { DOCTYPE_SHARING_RECIPIENTS } from '../const'
import logger from '../logger'

/**
 * @typedef PartialQueryDefinition
 *
 * @property {Array} [indexedFields]
 * @property {Array} [sort]
 * @property {object} [selector]
 * @property {object} [partialFilter]
 * @property {Array} [fields]
 */

/**
 * @typedef {object} MangoSelector
 */

/**
 * @typedef {object} MangoPartialFilter
 */

/**
 * Chainable API to create query definitions to retrieve documents
 * from a Cozy. `QueryDefinition`s are sent to links.
 *
 * @augments {object}
 */

class QueryDefinition {
  /**
   * @class
   *
   * @param {object} options Initial options for the query definition
   * @param  {import('../types').Doctype} [options.doctype] - The doctype of the doc.
   * @param {import('../types').DocId|null} [options.id] - The id of the doc.
   * @param {Array<import('../types').DocId>} [options.ids] - The ids of the docs.
   * @param {MangoSelector} [options.selector] - The selector to query the docs.
   * @param {Array<string>} [options.fields] - The fields to return.
   * @param {Array<string>} [options.indexedFields] - The fields to index.
   * @param {MangoPartialFilter} [options.partialFilter] - The partial index definition to filter docs.
   * @param {Array<object>} [options.sort] - The sorting params.
   * @param {Array<string>} [options.includes] - The docs to include.
   * @param {string|null} [options.referenced] - The referenced document.
   * @param {number|null} [options.limit] - The document's limit to return.
   * @param {number|null} [options.skip] - The number of docs to skip.
   * @param {import('../types').CouchDBViewCursor} [options.cursor] - The cursor to paginate views.
   * @param {string} [options.bookmark] - The bookmark to paginate mango queries.
   * @param {string} [options.sharingId] - The id of the sharing
   */
  constructor(options = {}) {
    this.doctype = options.doctype
    this.id = options.id
    this.ids = options.ids
    this.selector = options.selector
    this.fields = options.fields
    this.indexedFields = options.indexedFields
    this.partialFilter = options.partialFilter
    this.sort = options.sort
    this.includes = options.includes
    this.referenced = options.referenced
    this.limit = options.limit
    this.skip = options.skip
    this.cursor = options.cursor
    this.bookmark = options.bookmark
    this.sharingId = options.sharingId
  }

  /**
   * Checks if the sort order matches the index' fields order.
   *
   * When sorting with CouchDB, it is required to:
   * - use indexed fields
   * - keep the same order than the indexed fields.
   *
   * See https://docs.cozy.io/en/tutorials/data/queries/#sort-data-with-mango
   *
   * @param {PartialQueryDefinition} obj - A partial QueryDefinition to check
   */
  checkSortOrder({ sort, selector, indexedFields }) {
    const _sort = this.sort || sort
    const _selector = this.selector || selector || {}
    const _indexedFields = this.indexedFields || indexedFields
    if (!_sort) {
      return
    }
    const fieldsToIndex = _indexedFields || Object.keys(_selector)
    if (!fieldsToIndex || fieldsToIndex.length < 1) {
      return
    }
    if (_sort.length > fieldsToIndex.length) {
      logger.warn(
        `You should not sort on non-indexed fields.\n
        Sort: ${JSON.stringify(_sort)}\n
        Indexed fields: ${fieldsToIndex}`
      )
      return
    }
    for (let i = 0; i < _sort.length; i++) {
      if (Object.keys(_sort[i])[0] !== fieldsToIndex[i]) {
        logger.warn(
          `The sort order should be the same than the indexed fields.\n
          Sort: ${JSON.stringify(_sort)}\n
          Indexed fields: ${fieldsToIndex}\n`
        )
        return
      }
    }
  }

  /**
   * Checks the selector predicates.
   *
   * It is useful to warn the developer when a partial index might be used.
   *
   * @param {MangoSelector} selector - The selector definition
   * @returns {void}
   */
  checkSelector(selector) {
    const hasExistsFalse = findKey(selector, ['$exists', false])
    if (hasExistsFalse) {
      logger.warn(
        `The "$exists: false" predicate should be defined as a partial index for better performance.\n
        Selector: ${JSON.stringify(selector)}`
      )
    }
    const hasNe = findKey(selector, '$ne')
    if (hasNe) {
      logger.info(
        `The use of the $ne operator is more efficient with a partial index.\n
        Selector: ${JSON.stringify(selector)}`
      )
    }

    const nestedArrayKey = findKey(selector, value => Array.isArray(value))
    const hasNestedArrayWithoutOperator =
      nestedArrayKey && !nestedArrayKey.startsWith('$')
    if (hasNestedArrayWithoutOperator) {
      throw new Error(
        `You pass ${JSON.stringify(
          selector
        )}, this is a valid mango operation, \n
        but sift doesn't support it so CozyClient can not evaluate \n
        the request in memory. You must use a MongoDB operator \n
        like $in or $or operator instead, preferably in a partial index, \n
        to avoid costly full-scan`
      )
    }
  }

  /**
   * Check if the selected fields are all included in the selectors
   *
   * @param {PartialQueryDefinition} obj - A partial QueryDefinition to check
   */
  checkSelectFields({ fields, selector, partialFilter }) {
    const _fields = this.fields || fields
    const _selector = this.selector || selector
    const _partialFilter = this.partialFilter || partialFilter
    if (!_fields || (!_selector && !_partialFilter)) {
      return
    }
    const mergedSelector = { ..._selector, ..._partialFilter }
    const selectorAttributes = Object.keys(mergedSelector)
    const hasEveryFieldsInSelector = selectorAttributes.every(attribute =>
      _fields.includes(attribute)
    )
    if (!hasEveryFieldsInSelector) {
      throw new Error(
        `The .select should includes all the fields used in where or partialIndex.
        Please fix this query: fields: ${JSON.stringify(this.toDefinition())}`
      )
    }
    return
  }

  /**
   * Query a single document on its id.
   *
   * @param {string} id   The document id.
   * @returns {QueryDefinition}  The QueryDefinition object.
   */
  getById(id) {
    if (!id) {
      throw new Error('getById called with undefined id')
    }
    return new QueryDefinition({ ...this.toDefinition(), id })
  }

  /**
   * Query several documents on their ids.
   *
   * @param {Array} ids   The documents ids.
   * @returns {QueryDefinition}  The QueryDefinition object.
   */
  getByIds(ids) {
    return new QueryDefinition({ ...this.toDefinition(), ids })
  }

  /**
   * Query documents with a [mango selector](http://docs.couchdb.org/en/latest/api/database/find.html#find-selectors).
   * Each field passed in the selector will be indexed, except if the indexField option is used.
   *
   * @param {MangoSelector} selector   The Mango selector.
   * @returns {QueryDefinition}  The QueryDefinition object.
   */
  where(selector) {
    this.checkSortOrder({ selector })
    this.checkSelector(selector)
    this.checkSelectFields({ selector })
    return new QueryDefinition({ ...this.toDefinition(), selector })
  }

  /**
   * Specify which fields of each object should be returned. If it is omitted, the entire object is returned.
   *
   * @param {Array} fields The fields to return.
   * @returns {QueryDefinition}  The QueryDefinition object.
   */
  select(fields) {
    this.checkSelectFields({ fields })

    return new QueryDefinition({ ...this.toDefinition(), fields })
  }

  /**
   * Specify which fields should be indexed. This prevent the automatic indexing of the mango fields.
   *
   * @param {Array} indexedFields The fields to index.
   * @returns {QueryDefinition}  The QueryDefinition object.
   */
  indexFields(indexedFields) {
    this.checkSortOrder({ indexedFields })
    return new QueryDefinition({ ...this.toDefinition(), indexedFields })
  }

  /**
   * Specify a [partial index](https://docs.couchdb.org/en/stable/api/database/find.html#find-partial-indexes).
   * The filter must follow the same syntax than the selector.
   *
   * A partial index includes a filter, used to select documents before the indexing.
   * You can find more information about partial indexes [here](https://docs.cozy.io/en/tutorials/data/advanced/#partial-indexes)
   *
   * @param {object} partialFilter - The filter definition.
   */
  partialIndex(partialFilter) {
    this.checkSelectFields({ partialFilter })
    return new QueryDefinition({ ...this.toDefinition(), partialFilter })
  }

  /**
   * Specify how to sort documents, following the [sort syntax](http://docs.couchdb.org/en/latest/api/database/find.html#find-sort)
   *
   * @param {Array} sort The list of field name and direction pairs.
   * @returns {QueryDefinition}  The QueryDefinition object.
   */
  sortBy(sort) {
    if (!Array.isArray(sort)) {
      throw new Error(
        `Invalid sort, should be an array ([{ label: "desc"}, { name: "asc"}]), you passed ${JSON.stringify(
          sort
        )}.`
      )
    }
    this.checkSortOrder({ sort })
    return new QueryDefinition({ ...this.toDefinition(), sort })
  }

  /**
   * Includes documents having a relationships with the ones queried.
   * For example, query albums including the photos.
   *
   * @param {Array} includes The documents to include.
   * @returns {QueryDefinition}  The QueryDefinition object.
   */
  include(includes) {
    if (!Array.isArray(includes)) {
      throw new Error('include() takes an array of relationship names')
    }
    return new QueryDefinition({ ...this.toDefinition(), includes })
  }

  /**
   * Maximum number of documents returned, useful for pagination. Default is 100.
   *
   * @param {number|null} limit The document's limit.
   * @returns {QueryDefinition}  The QueryDefinition object.
   */
  limitBy(limit) {
    return new QueryDefinition({ ...this.toDefinition(), limit })
  }

  UNSAFE_noLimit() {
    return new QueryDefinition({ ...this.toDefinition(), limit: null })
  }

  /**
   * Skip the first ‘n’ documents, where ‘n’ is the value specified.
   *
   * Beware, this [performs badly](http://docs.couchdb.org/en/stable/ddocs/views/pagination.html#paging-alternate-method) on view's index.
   *  Prefer cursor-based pagination in such situation.
   *
   * @param {number} skip The number of documents to skip.
   * @returns {QueryDefinition}  The QueryDefinition object.
   */
  offset(skip) {
    return new QueryDefinition({
      ...this.toDefinition(),
      bookmark: undefined,
      cursor: undefined,
      skip
    })
  }

  /**
   * Use [cursor-based](https://docs.cozy.io/en/cozy-stack/jsonapi/#pagination) pagination.
   * *Warning*: this is only useful for views.
   * The cursor is a [startkey, startkey_docid] array, where startkey is the view's key,
   * e.g. ["io.cozy.photos.albums", "album-id"] and startkey_docid is the id of
   * the starting document of the query, e.g. "file-id".
   * Use the last docid of each query as startkey_docid to paginate or leave blank for the first query.
   *
   * @param {import('../types').CouchDBViewCursor} cursor The cursor for pagination.
   * @returns {QueryDefinition}  The QueryDefinition object.
   */
  offsetCursor(cursor) {
    return new QueryDefinition({
      ...this.toDefinition(),
      bookmark: undefined,
      skip: undefined,
      cursor
    })
  }

  /**
   * Use [bookmark](https://docs.couchdb.org/en/2.2.0/api/database/find.html#pagination) pagination.
   * Note this only applies for mango-queries (not views) and is way more efficient than skip pagination.
   * The bookmark is a string returned by the _find response and can be seen as a pointer in
   * the index for the next query.
   *
   * @param {string} bookmark The bookmark to continue a previous paginated query.
   * @returns {QueryDefinition}  The QueryDefinition object.
   */
  offsetBookmark(bookmark) {
    return new QueryDefinition({
      ...this.toDefinition(),
      skip: undefined,
      cursor: undefined,
      bookmark
    })
  }

  /**
   * Use the [file reference system](https://docs.cozy.io/en/cozy-stack/references-docs-in-vfs/)
   *
   * @param {object} document The reference document
   * @returns {QueryDefinition}  The QueryDefinition object.
   */
  referencedBy(document) {
    return new QueryDefinition({ ...this.toDefinition(), referenced: document })
  }

  /**
   * Use a sharingId to query documents coming from a sharing
   *
   * @param {string} id - The sharing doc id
   * @returns {QueryDefinition}  The QueryDefinition object.
   */
  sharingById(id) {
    return new QueryDefinition({ ...this.toDefinition(), sharingId: id })
  }

  /**
   * Query all recipients who can access a file or folder, either through a
   * direct sharing on the target or through a sharing inherited from an ancestor.
   *
   * @param {string} fileId - The target file or folder id
   * @param {{driveId?: string|null}} [options] - Query options; driveId scopes a shared drive and defaults to null
   * @returns {QueryDefinition} The QueryDefinition object.
   */
  effectiveRecipients(fileId, options = {}) {
    if (this.doctype !== DOCTYPE_SHARING_RECIPIENTS) {
      throw new Error(
        `effectiveRecipients must be called on ${DOCTYPE_SHARING_RECIPIENTS}`
      )
    }
    if (!fileId) {
      throw new Error('effectiveRecipients called with undefined fileId')
    }
    const driveId = options.driveId ?? null

    return new QueryDefinition({
      ...this.toDefinition(),
      selector: { file_id: fileId, drive_id: driveId }
    })
  }

  toDefinition() {
    return {
      doctype: this.doctype,
      id: this.id,
      ids: this.ids,
      selector: this.selector,
      fields: this.fields,
      indexedFields: this.indexedFields,
      partialFilter: this.partialFilter,
      sort: this.sort,
      includes: this.includes,
      referenced: this.referenced,
      limit: this.limit,
      skip: this.skip,
      cursor: this.cursor,
      bookmark: this.bookmark,
      sharingId: this.sharingId
    }
  }
}

/**
 * Helper to create a QueryDefinition. Recommended way to create
 * query definitions.
 *
 * @param {import('../types').Doctype} doctype - Doctype of the query definition
 *
 * @example
 * ```
 * import { Q } from 'cozy-client'
 *
 * const qDef = Q('io.cozy.todos').where({ _id: '1234' })
 * ```
 */
export const Q = doctype => new QueryDefinition({ doctype })

/**
 * Check if the query is a getById() query
 *
 * @param {QueryDefinition} queryDefinition The query definition
 *
 * @returns {boolean}
 */
export const isAGetByIdQuery = queryDefinition => {
  if (!queryDefinition) return false
  const attributes = Object.values(queryDefinition)
  if (attributes.length === 0) return false
  // 2 attrs because we check if id and doctype are not undefined
  return (
    attributes.filter(attr => attr !== undefined).length === 2 &&
    queryDefinition.id !== undefined
  )
}
// Mutations
const CREATE_DOCUMENT = 'CREATE_DOCUMENT'
const CREATE_DOCUMENTS = 'CREATE_DOCUMENTS'
const UPDATE_DOCUMENT = 'UPDATE_DOCUMENT'
const UPDATE_DOCUMENTS = 'UPDATE_DOCUMENTS'
const DELETE_DOCUMENT = 'DELETE_DOCUMENT'
const DELETE_DOCUMENTS = 'DELETE_DOCUMENTS'
const ADD_REFERENCES_TO = 'ADD_REFERENCES_TO'
const REMOVE_REFERENCES_TO = 'REMOVE_REFERENCES_TO'
const ADD_REFERENCED_BY = 'ADD_REFERENCED_BY'
const REMOVE_REFERENCED_BY = 'REMOVE_REFERENCED_BY'
const UPLOAD_FILE = 'UPLOAD_FILE'

export const createDocument = document => ({
  mutationType: MutationTypes.CREATE_DOCUMENT,
  document
})

export const createDocuments = documents => ({
  mutationType: MutationTypes.CREATE_DOCUMENTS,
  documents
})

export const updateDocument = document => ({
  mutationType: MutationTypes.UPDATE_DOCUMENT,
  document
})

export const updateDocuments = documents => ({
  mutationType: MutationTypes.UPDATE_DOCUMENTS,
  documents
})

export const deleteDocument = document => ({
  mutationType: MutationTypes.DELETE_DOCUMENT,
  document
})

export const deleteDocuments = documents => ({
  mutationType: MutationTypes.DELETE_DOCUMENTS,
  documents
})

export const addReferencesTo = (document, referencedDocuments) => ({
  mutationType: MutationTypes.ADD_REFERENCES_TO,
  referencedDocuments,
  document
})

export const removeReferencesTo = (document, referencedDocuments) => ({
  mutationType: MutationTypes.REMOVE_REFERENCES_TO,
  referencedDocuments,
  document
})

export const addReferencedBy = (document, referencedDocuments) => ({
  mutationType: MutationTypes.ADD_REFERENCED_BY,
  referencedDocuments,
  document
})

export const removeReferencedBy = (document, referencedDocuments) => ({
  mutationType: MutationTypes.REMOVE_REFERENCED_BY,
  referencedDocuments,
  document
})

export const uploadFile = (file, dirPath) => ({
  mutationType: MutationTypes.UPLOAD_FILE,
  file,
  dirPath
})

export const getDoctypeFromOperation = operation => {
  if (operation.mutationType) {
    const type = operation.mutationType
    switch (type) {
      case CREATE_DOCUMENT:
        return operation.document._type
      case CREATE_DOCUMENTS:
        return operation.documents[0]._type
      case UPDATE_DOCUMENT:
        return operation.document._type
      case UPDATE_DOCUMENTS:
        return operation.documents[0]._type
      case DELETE_DOCUMENT:
        return operation.document._type
      case DELETE_DOCUMENTS:
        return operation.documents[0]._type
      case ADD_REFERENCES_TO:
        throw new Error('Not implemented')
      case UPLOAD_FILE:
        throw new Error('Not implemented')
      default:
        throw new Error(`Unknown mutationType ${type}`)
    }
  } else {
    return operation.doctype
  }
}

export const Mutations = {
  createDocument,
  createDocuments,
  updateDocument,
  updateDocuments,
  deleteDocument,
  deleteDocuments,
  addReferencesTo,
  removeReferencesTo,
  addReferencedBy,
  removeReferencedBy,
  uploadFile
}

export const MutationTypes = {
  CREATE_DOCUMENT,
  CREATE_DOCUMENTS,
  UPDATE_DOCUMENT,
  UPDATE_DOCUMENTS,
  DELETE_DOCUMENT,
  DELETE_DOCUMENTS,
  ADD_REFERENCES_TO,
  REMOVE_REFERENCES_TO,
  ADD_REFERENCED_BY,
  REMOVE_REFERENCED_BY,
  UPLOAD_FILE
}

export { QueryDefinition }
