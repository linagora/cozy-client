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
import {
  isMissingSQLiteIndexError,
  isUnsupportedMangoSelectorError
} from '../../errors'
import PouchDBQueryEngine from '../pouchdb/pouchdb'
import logger from '../../logger'

// busy_timeout is per-connection, not per-database, and applies to the
// statements issued after it. Two values are needed because the statements it
// covers here do not run on the same thread:
//
//   - journal_mode=WAL runs through executeSync, ON the JS thread, and needs the
//     write lock to switch. Under a replication batch it would wait for the
//     whole timeout, freezing the UI, hence the short value. Losing that race is
//     harmless: the mode is persistent, so the next open retries it, and it is a
//     no-op once the database is already in WAL.
//   - queries run through executeAsync, OFF the JS thread, so waiting costs
//     latency rather than responsiveness. A short value there would make them
//     fail during a bulk insert and fall back to pouch-find for no reason.
const SETUP_BUSY_TIMEOUT_MS = 250
const QUERY_BUSY_TIMEOUT_MS = 5000

export default class SQLiteQueryEngine extends DatabaseQueryEngine {
  constructor(pouchManager, doctype) {
    super()
    this.db = null
    this.pouchManager = pouchManager
    this.client = pouchManager?.client
    this.doctype = doctype
    /**
     * Lazily built by getPouchFallback, and dropped whenever openDB points this
     * engine at another database.
     *
     * @type {PouchDBQueryEngine | null}
     */
    this.pouchFallback = null
  }

  openDB(dbName) {
    this.dbName = dbName
    // The fallback caches a connection to the PREVIOUS dbName; reopening on a
    // different database has to drop it, or queries would keep being answered
    // from the database this engine no longer points at.
    this.pouchFallback = null
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
        const handle = open({ name: fileDbName })
        // Each pragma is independent and best-effort: journal_mode can lose the
        // race for the write lock, and sharing one try/catch would then skip the
        // query timeout and strand the connection on the setup one.
        const applyPragma = sql => {
          try {
            handle.executeSync(sql)
          } catch (err) {
            logger.error(err)
          }
        }
        applyPragma(`PRAGMA busy_timeout=${SETUP_BUSY_TIMEOUT_MS}`)
        applyPragma('PRAGMA journal_mode=WAL')
        applyPragma(`PRAGMA busy_timeout=${QUERY_BUSY_TIMEOUT_MS}`)
        resolved = handle
        Promise.resolve()
          .then(() => executeSQL(handle, makeSQLCreateDocIDIndex()))
          .then(() => executeSQL(handle, makeSQLCreateDeletedIndex()))
          .catch(err => logger.error(err))
        return resolved
      }
    })
  }

  // pouch-find can answer every mango selector, at the cost of the mapreduce view
  // this engine exists to avoid. Built lazily so the PouchDB handle is only
  // resolved by queries that actually need it.
  getPouchFallback() {
    if (!this.pouchFallback) {
      this.pouchFallback = new PouchDBQueryEngine(
        this.pouchManager,
        this.doctype
      )
      this.pouchFallback.openDB(this.dbName)
    }
    return this.pouchFallback
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
    let sql
    try {
      sql = makeSQLQueryFromMango({
        selector,
        sort,
        indexName,
        partialFilter,
        limit,
        skip
      })
    } catch (err) {
      if (!isUnsupportedMangoSelectorError(err)) {
        throw err
      }
      // The selector uses mango features SQL cannot express here ($regex, ...).
      // Answering it with an empty result would be indistinguishable from "no
      // match", so let pouch-find handle it instead.
      logger.warn(`${err.message} - falling back to the PouchDB query engine`)
      return this.getPouchFallback().find(options)
    }

    try {
      if (recreateIndex) {
        await deleteIndex(this.db, indexName)
      }
      let result
      try {
        result = await executeSQL(this.db, sql)
      } catch (err) {
        if (!isMissingSQLiteIndexError(err)) {
          throw err
        }
        await createMangoIndex(this.db, indexName, indexedFields, {
          partialFilter
        })
        result = await executeSQL(this.db, sql)
      }
      return parseResults(this.client, result, this.doctype, {
        skip,
        limit
      })
    } catch (err) {
      // Returning null here would surface as an empty - but successful - result.
      // Falling back makes a SQLite failure cost performance, not correctness.
      logger.error(err)
      return this.getPouchFallback().find(options)
    }
  }
}
