import { isMissingPouchDBIndexError } from '../../errors'
import { createIndex, getIndexFields, getIndexName } from '../../mango'
import DatabaseQueryEngine from '../dbInterface'
import { getDocsAndNormalize } from './getDocs'

export default class PouchDBQueryEngine extends DatabaseQueryEngine {
  constructor(pouchManager, doctype) {
    super()
    this.pouchManager = pouchManager
    this.client = pouchManager?.client
    this.doctype = doctype
    this.db = null
  }

  openDB(dbName) {
    this.db = this.pouchManager.getPouch(dbName)
    return this.db
  }

  async allDocs(options) {
    return getDocsAndNormalize({
      client: this.client,
      db: this.db,
      doctype: this.doctype,
      queryFunc: 'allDocs',
      queryParams: { include_docs: true, ...options }
    })
  }

  async getById(id) {
    return getDocsAndNormalize({
      client: this.client,
      db: this.db,
      doctype: this.doctype,
      queryFunc: 'get',
      queryParams: { id },
      withRows: false
    })
  }

  async getByIds(ids) {
    return getDocsAndNormalize({
      client: this.client,
      db: this.db,
      doctype: this.doctype,
      queryFunc: 'allDocs',
      queryParams: { include_docs: true, keys: ids }
    })
  }

  async find(options) {
    const { selector, sort, partialFilter, doctype } = options
    let { indexedFields } = options

    indexedFields = getIndexFields({
      indexedFields,
      selector,
      sort,
      partialFilter
    })
    const indexName = getIndexName({
      selector,
      sort,
      partialFilter,
      indexedFields
    })
    const findOpts = {
      selector,
      sort,
      partialFilter,
      doctype,
      use_index: indexName,
      ...options
    }
    findOpts.indexedFields = indexedFields

    let res
    try {
      res = await getDocsAndNormalize({
        client: this.client,
        db: this.db,
        doctype: this.doctype,
        queryFunc: 'find',
        queryParams: findOpts
      })
    } catch (err) {
      if (isMissingPouchDBIndexError(err)) {
        await createIndex(this.db, indexedFields, {
          indexName,
          doctype,
          partialFilter
        })
        res = await getDocsAndNormalize({
          client: this.client,
          db: this.db,
          doctype: this.doctype,
          queryFunc: 'find',
          queryParams: findOpts
        })
      } else {
        throw err
      }
    }
    return res
  }
}
