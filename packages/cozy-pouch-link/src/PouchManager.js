import forEach from 'lodash/forEach'
import { isMobileApp } from 'cozy-device-helper'

import { PouchLocalStorage } from './localStorage'
import Loop from './loop'
import logger from './logger'
import { platformWeb } from './platformWeb'
import { replicateOnce } from './replicateOnce'
import {
  allSettled,
  formatAggregatedError,
  getDatabaseName,
  getDoctypeFromDatabaseName
} from './utils'
import { destroyOldDatabases } from './migrations/pouchdb'
import PouchDBQueryEngine from './db/pouchdb/pouchdb'

const DEFAULT_DELAY = 30 * 1000
const ENSURE_DATABASES_RETRIES = 3
const DEFAULT_ENSURE_DATABASES_RETRY_DELAY = 1000

// See view_update_changes_batch_size in https://pouchdb.com/api.html#create_database
// PouchDB default is 50, which badly hurt performances for large databases
const DEFAULT_VIEW_UPDATE_BATCH = 1000

/**
 * @param {import('cozy-client/types/types').Query} query The query definition whose name we're getting
 *
 * @returns {string} alias
 */
const getQueryAlias = query => {
  return query.options.as
}

/**
 * Handles the lifecycle of several pouches
 *
 * - Creates/Destroys the pouches
 * - Replicates periodically
 */
class PouchManager {
  constructor(doctypes, options) {
    this.options = options
    this.doctypes = doctypes

    this.storage = new PouchLocalStorage(
      options.platform?.storage || platformWeb.storage
    )
    this.queryEngine = options.queryEngine || PouchDBQueryEngine
    this.client = options.client
    this.PouchDB = options.platform?.pouchAdapter || platformWeb.pouchAdapter
    this.isOnline = options.platform?.isOnline || platformWeb.isOnline
    this.events = options.platform?.events || platformWeb.events
    this.dbQueryEngines = new Map()
  }

  async init() {
    const pouchPlugins = this.options?.pouch?.plugins ?? []
    const pouchOptions = this.options?.pouch?.options ?? {}
    if (!pouchOptions.view_update_changes_batch_size) {
      pouchOptions.view_update_changes_batch_size = DEFAULT_VIEW_UPDATE_BATCH
    }

    forEach(pouchPlugins, plugin => this.PouchDB.plugin(plugin))
    this.pouches = {}
    this.doctypesReplicationOptions =
      this.options.doctypesReplicationOptions || {}
    for (const doctype of this.doctypes) {
      this.addDoctype(doctype, this.doctypesReplicationOptions[doctype])
    }

    await this.persistDatabasesNames()

    /** @type {Record<string, import('./types').SyncInfo>} - Stores synchronization info per doctype */
    this.syncedDoctypes = await this.storage.getPersistedSyncedDoctypes()
    this.warmedUpQueries = await this.storage.getPersistedWarmedUpQueries()
    this.getReplicationURL = this.options.getReplicationURL
    this.listenerLaunched = false

    // We must ensure databases exist on the remote before
    // starting replications
    this.ensureDatabasesExistDone = false

    this.startReplicationLoop = this.startReplicationLoop.bind(this)
    this.stopReplicationLoop = this.stopReplicationLoop.bind(this)
    this.replicateOnce = this.replicateOnce.bind(this)
    this.executeQuery = this.options.executeQuery

    /** @type {import('./types').CancelablePromise[]} - Stores replication promises */
    this.replications = undefined

    destroyOldDatabases()
  }

  addListeners() {
    if (!this.listenerLaunched) {
      if (isMobileApp()) {
        this.events.addEventListener('pause', this.stopReplicationLoop)
        this.events.addEventListener('resume', this.startReplicationLoop)
      }
      this.events.addEventListener('online', this.startReplicationLoop)
      this.events.addEventListener('offline', this.stopReplicationLoop)
      this.listenerLaunched = true
    }
  }

  removeListeners() {
    if (this.listenerLaunched) {
      if (isMobileApp()) {
        this.events.removeEventListener('pause', this.stopReplicationLoop)
        this.events.removeEventListener('resume', this.startReplicationLoop)
      }
      this.events.removeEventListener('online', this.startReplicationLoop)
      this.events.removeEventListener('offline', this.stopReplicationLoop)
      this.listenerLaunched = false
    }
  }

  async destroy() {
    this.stopReplicationLoop()
    this.removeListeners()
    await this.clearSyncedDoctypes()
    await this.clearWarmedUpQueries()
    await this.storage.destroy()

    return allSettled(Object.values(this.pouches).map(pouch => pouch.destroy()))
  }

  /**
   * Via a call to info() we ensure the database exist on the
   * remote side. This is done only once since after the first
   * call, we are sure that the databases have been created.
   *
   * A database can be busy for an instant, typically while another
   * connection holds a lock on it: the call is tried again a few times
   * before the error is thrown.
   */
  async ensureDatabasesExist() {
    if (this.ensureDatabasesExistDone) {
      return Promise.resolve()
    }
    const retryDelay =
      this.options.ensureDatabasesRetryDelay ??
      DEFAULT_ENSURE_DATABASES_RETRY_DELAY
    for (let attempt = 0; ; attempt++) {
      try {
        await Promise.all(
          Object.values(this.pouches).map(pouch => pouch.info())
        )
        break
      } catch (err) {
        if (attempt >= ENSURE_DATABASES_RETRIES) {
          throw err
        }
        logger.warn(
          `PouchManager: a database did not answer, trying again - ${err.message}`
        )
        await new Promise(resolve => setTimeout(resolve, retryDelay))
      }
    }
    logger.info('PouchManager: ensure databases exist done')
    this.ensureDatabasesExistDone = true
  }

  /**
   * Starts periodic syncing of the pouches
   *
   * When the databases cannot be reached, the loop is not started and the
   * error goes through `onError`, like an error during a replication: it
   * needs to be started again by the owner of PouchManager.
   *
   * @returns {Promise<Loop | void>}
   */
  async startReplicationLoop() {
    try {
      await this.ensureDatabasesExist()
    } catch (err) {
      this.handleReplicationError(err)
      return
    }

    if (this.replicationLoop) {
      logger.warn('Replication loop already started')
      return
    }

    if (process.env.NODE_ENV !== 'production') {
      logger.info('PouchManager: Start replication loop')
    }
    const delay = this.options.replicationDelay || DEFAULT_DELAY
    this.replicationLoop = new Loop(this.replicateOnce, delay)
    this.replicationLoop.start()
    this.addListeners()
    return this.replicationLoop
  }

  /** Stop periodic syncing of the pouches */
  stopReplicationLoop() {
    if (this.replicationLoop) {
      logger.info('PouchManager: Stop replication loop')
      this.replicationLoop.stop()
      this.replicationLoop = null
    }
  }

  /**
   * If a replication is currently ongoing, will start a replication
   * just after it has finished. Otherwise it will start a replication
   * immediately
   */
  syncImmediately() {
    if (!this.replicationLoop) {
      logger.warn('No replication loop, cannot syncImmediately')
      return
    }
    this.replicationLoop.scheduleImmediateTask()
  }

  /**
   * Starts replication
   *
   * @param {object} options - The options
   * @param {boolean|null} [options.waitForReplications=true] - Whether the others replication process should be waited
   * @returns {Promise<any>} the replication result
   */
  async replicateOnce({ waitForReplications = true } = {}) {
    // XXX - Waiting for the current replications is useful to ensure there is no parallel replications.
    // We allow this mechanism to be bypassed, but one should be aware that it can be risky
    if (waitForReplications) {
      await this.waitForCurrentReplications()
    }
    return replicateOnce(this)
  }

  handleReplicationError(err) {
    let aggregatedMessage = ''
    // @ts-ignore
    // eslint-disable-next-line no-undef
    if (err instanceof AggregateError) {
      aggregatedMessage = formatAggregatedError(err)
    }
    logger.warn(
      `PouchManager: Error during replication - ${err.message}${aggregatedMessage}`
    )
    // On error, replication stops, it needs to be started
    // again manually by the owner of PouchManager
    this.stopReplicationLoop()
    if (this.options.onError) {
      this.options.onError(err)
    }
  }

  cancelCurrentReplications() {
    if (!this.replications) {
      logger.warn('PouchManager: No current replications')
      return
    }
    Object.values(this.replications).forEach(replication => {
      return replication.cancel && replication.cancel()
    })
  }

  waitForCurrentReplications() {
    if (!this.replications) {
      return Promise.resolve()
    }
    return allSettled(Object.values(this.replications))
  }

  getPouch(dbName) {
    return this.pouches[dbName]
  }

  setQueryEngine(name, doctype) {
    const engine = new this.queryEngine(this, doctype)
    engine.openDB(name)
    this.dbQueryEngines.set(name, engine)
    return engine
  }

  getQueryEngine(name, doctype) {
    let engine = this.dbQueryEngines.get(name)
    if (!engine) {
      engine = this.setQueryEngine(name, doctype)
    }
    return engine
  }

  /**
   * Update the Sync info for the specifed doctype
   *
   * @param {string} doctype - The doctype to update
   * @param {import('./types').SyncStatus} status - The new Sync status for the doctype
   */
  async updateSyncInfo(doctype, status = 'synced') {
    this.syncedDoctypes[doctype] = { date: new Date().toISOString(), status }
    await this.storage.persistSyncedDoctypes(this.syncedDoctypes)
  }

  /**
   * Get the Sync info for the specified doctype
   *
   * @param {string} doctype - The doctype to check
   * @returns {import('./types').SyncInfo}
   */
  getSyncInfo(doctype) {
    return this.syncedDoctypes && this.syncedDoctypes[doctype]
  }

  /**
   * Get the Sync status for the specified doctype
   *
   * @param {string} doctype - The doctype to check
   * @returns {import('./types').SyncStatus}
   */
  getSyncStatus(doctype) {
    const info = this.getSyncInfo(doctype)
    return info?.status || 'not_synced'
  }

  async clearSyncedDoctypes() {
    this.syncedDoctypes = {}
    await this.storage.destroySyncedDoctypes()
  }

  async warmupQueries(doctype, queries) {
    if (!this.warmedUpQueries[doctype]) this.warmedUpQueries[doctype] = []
    try {
      await Promise.all(
        queries.map(async query => {
          const def = getQueryAlias(query)
          if (!this.warmedUpQueries[doctype].includes(def)) {
            await this.executeQuery(query.definition().toDefinition())
            this.warmedUpQueries[doctype].push(def)
          }
        })
      )
      await this.storage.persistWarmedUpQueries(this.warmedUpQueries)
      logger.log('PouchManager: warmupQueries for ' + doctype + ' are done')
    } catch (err) {
      logger.error(
        'PouchManager: Could not warm up queries for ' + doctype,
        err
      )
      delete this.warmedUpQueries[doctype]
    }
  }

  // Queries are warmed up only once per instantiation of the PouchManager. Since
  // the PouchManager lives during the complete lifecycle of the app, warm up
  // happens only on app start / restart.
  checkToWarmupDoctype(doctype, replicationOptions) {
    if (!this.warmedUpQueries[doctype] && replicationOptions.warmupQueries) {
      this.warmupQueries(doctype, replicationOptions.warmupQueries)
    }
  }

  async areQueriesWarmedUp(doctype, queries) {
    const persistWarmedUpQueries = await this.storage.getPersistedWarmedUpQueries()
    return queries.every(
      query =>
        persistWarmedUpQueries[doctype] &&
        persistWarmedUpQueries[doctype].includes(getQueryAlias(query))
    )
  }

  async clearWarmedUpQueries() {
    this.warmedUpQueries = {}
    await this.storage.destroyWarmedUpQueries()
  }

  /**
   * Adds a new doctype to the list of managed doctypes, sets its replication options,
   * creates a new PouchDB instance for it, and sets up the query engine.
   *
   * @param {string} doctype - The name of the doctype to add.
   * @param {Object} replicationOptions - The replication options for the doctype.
   */
  async addDoctype(doctype, replicationOptions) {
    if (!this.options?.doctypesReplicationOptions) {
      this.options.doctypesReplicationOptions = {}
    }
    this.options.doctypesReplicationOptions[doctype] = replicationOptions
    const pouchOptions = this.options?.pouch?.options ?? {}
    if (!pouchOptions.view_update_changes_batch_size) {
      pouchOptions.view_update_changes_batch_size = DEFAULT_VIEW_UPDATE_BATCH
    }

    const dbName = getDatabaseName(this.options.prefix, doctype)
    this.pouches[dbName] = new this.PouchDB(
      getDatabaseName(this.options.prefix, doctype),
      pouchOptions
    )
    await this.persistDatabasesNames()

    this.setQueryEngine(dbName, getDoctypeFromDatabaseName(dbName))
  }

  /**
   * Removes a doctype from the list of managed doctypes, deletes its replication options,
   * destroys its PouchDB instance, and removes it from the pouches.
   *
   * @param {string} doctype - The name of the doctype to remove.
   */
  async removeDoctype(doctype) {
    this.doctypes = this.doctypes.filter(d => d !== doctype)
    delete this.options?.doctypesReplicationOptions?.[doctype]

    const dbName = getDatabaseName(this.options.prefix, doctype)
    this.pouches[dbName].destroy()
    delete this.pouches[dbName]
    await this.persistDatabasesNames()
  }

  /**
   * Persists the names of the PouchDB databases.
   *
   * This method is primarily used to ensure that database names are saved for
   * old browsers that do not support `indexeddb.databases()`. This persistence
   * facilitates cleanup processes. Note that PouchDB automatically adds the
   * `_pouch_` prefix to database names.
   *
   * @returns {Promise<void>}
   */
  async persistDatabasesNames() {
    const dbNames = Object.keys(this.pouches)
    const pouchDbNames = dbNames.map(dbName => `_pouch_${dbName}`)
    await this.storage.persistDatabasesNames(pouchDbNames)
  }
}

export default PouchManager
