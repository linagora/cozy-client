import DatabaseQueryEngine from '../dbInterface'

// @ts-ignore
import { open } from '@op-engineering/op-sqlite'

import {
  createMangoIndex,
  makeSQLCreateDeletedIndex,
  deleteIndex,
  executeSQL,
  makeSQLCreateDocIDIndex,
  makeSQLQueryAll,
  makeSQLQueryForId,
  makeSQLQueryForIds,
  makeSQLQueryFromMango,
  parseResults
} from './sql'
import { getIndexFields, getIndexName } from '../../mango'
import { isMissingSQLiteIndexError } from '../../errors'
import logger from '../../logger'

export default class SQLiteQueryEngine extends DatabaseQueryEngine {
  constructor(pouchManager, doctype) {
    super()
    this.db = null
    this.client = pouchManager?.client
    this.doctype = doctype
  }

  openDB(dbName) {
    const fileDbName = `${dbName}.sqlite`
    // Resolve the DB handle lazily on first use, opening our OWN op-sqlite
    // connection on the same file the adapter uses. WAL mode + a busy timeout
    // let this connection coexist with the adapter's writer without "database
    // is locked" — the two-connection setup in rollback mode was what made this
    // engine unusable. Lazy so the adapter has created the schema by the time
    // the first query runs.
    let resolved = null
    Object.defineProperty(this, 'db', {
      configurable: true,
      set: value => {
        resolved = value
      },
      get: () => {
        if (resolved) return resolved
        resolved = open({ name: fileDbName })
        try {
          executeSQL(resolved, 'PRAGMA journal_mode=WAL')
          executeSQL(resolved, 'PRAGMA busy_timeout=5000')
          executeSQL(resolved, makeSQLCreateDocIDIndex())
          executeSQL(resolved, makeSQLCreateDeletedIndex())
        } catch (err) {
          logger.error(err)
        }
        return resolved
      }
    })
  }

  async allDocs({ limit = -1, skip = 0 } = {}) {
    try {
      const sql = makeSQLQueryAll({ limit, skip })
      const result = await executeSQL(this.db, sql)
      const docs = parseResults(this.client, result, this.doctype, {
        limit,
        skip
      })
      return docs
    } catch (err) {
      logger.error(err)
      return null
    }
  }

  async getById(id) {
    try {
      const sql = makeSQLQueryForId(id)
      const result = await executeSQL(this.db, sql)
      const doc = parseResults(this.client, result, this.doctype, {
        isSingleDoc: true
      })
      return doc
    } catch (err) {
      logger.error(err)
      return null
    }
  }

  async getByIds(ids) {
    try {
      const sql = makeSQLQueryForIds(ids)
      const result = await executeSQL(this.db, sql)
      const docs = parseResults(this.client, result, this.doctype)
      return docs
    } catch (err) {
      logger.error(err)
      return null
    }
  }

  async find(options) {
    const {
      selector,
      sort,
      partialFilter,
      limit,
      recreateIndex,
      skip
    } = options
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
    const sql = makeSQLQueryFromMango({
      selector,
      sort,
      indexName,
      partialFilter,
      limit,
      skip
    })
    let result
    if (recreateIndex) {
      await deleteIndex(this.db, indexName)
    }
    try {
      result = await executeSQL(this.db, sql)
    } catch (err) {
      if (isMissingSQLiteIndexError(err)) {
        await createMangoIndex(this.db, indexName, indexedFields, {
          partialFilter
        })
        result = await executeSQL(this.db, sql)
      } else {
        logger.error(err)
        return null
      }
    }

    const docs = parseResults(this.client, result, this.doctype, {
      skip,
      limit
    })
    return docs
  }
}
