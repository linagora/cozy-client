import startsWith from 'lodash/startsWith'

import CozyClient from 'cozy-client'

import { default as helpers } from './helpers'
import logger from './logger'
import { fetchRemoteInstance } from './remote'

const { isDesignDocument, isDeletedDocument } = helpers

const BATCH_SIZE = 1000 // we have mostly small documents

const humanTimeDelta = timeMs => {
  let cur = timeMs
  let unitIndex = 0
  let str = ''
  while (cur >= TIME_UNITS[unitIndex][1]) {
    let unit = TIME_UNITS[unitIndex]
    const int = Math.round(cur / unit[1])
    const rest = cur % unit[1]
    str = `${rest}${unit[0]}` + str
    cur = int
    unitIndex++
  }
  const lastUnit = TIME_UNITS[unitIndex]
  str = `${cur}${lastUnit[0]}` + str
  return str
}
/** @type {[string, number][]} */
const TIME_UNITS = [
  ['ms', 1000],
  ['s', 60],
  ['m', 60],
  ['h', 24]
]

/**
 * startReplication - Create a cancellable promise for replication with default options
 *
 * @private
 * @param {object} pouch                 Pouch database instance
 * @param {object} replicationOptions Any option supported by the Pouch replication API (https://pouchdb.com/api.html#replication)
 * @param {string} replicationOptions.strategy The direction of the replication. Can be "fromRemote",  "toRemote" or "sync"
 * @param {boolean} replicationOptions.initialReplication Whether or not this is an initial replication
 * @param {string} [replicationOptions.driveId] - ID of the shared drive to replicate (enables shared drive mode)
 * @param {string} replicationOptions.doctype The doctype to replicate
 * @param {import('cozy-client/types/types').Query[]} replicationOptions.warmupQueries The queries to warmup
 * @param {Function} getReplicationURL A function that should return the remote replication URL
 * @param {import('./localStorage').PouchLocalStorage} storage Methods to access local storage
 * @param {CozyClient} client - Cozy client instance (required for shared drive replication)
 *
 * @returns {import('./types').CancelablePromise} A cancelable promise that resolves at the end of the replication
 */
export const startReplication = (
  pouch,
  replicationOptions,
  getReplicationURL,
  storage,
  client
) => {
  let replication
  let docs = {}
  const start = new Date()
  /** @type {import('./types').CancelablePromise} */
  const promise = new Promise((resolve, reject) => {
    const url = getReplicationURL()
    const {
      strategy,
      initialReplication,
      warmupQueries,
      doctype,
      ...customReplicationOptions
    } = replicationOptions
    const options = {
      batch_size: BATCH_SIZE,
      ...customReplicationOptions,
      selector: {
        cozyLocalOnly: {
          $exists: false
        }
      }
    }
    if (replicationOptions.driveId) {
      ;(async () => {
        try {
          const docs = await sharedDriveReplicateAllDocs({
            pouch,
            storage,
            doctype,
            client,
            initialReplication,
            driveId: replicationOptions.driveId
          })
          resolve(docs)
        } catch (error) {
          reject(error)
        }
      })()
      return
    } else {
      if (initialReplication && strategy !== 'toRemote') {
        ;(async () => {
          try {
            // For the first remote->local replication, we manually replicate all docs
            // as it avoids to replicate all revs history, which can lead to
            // performances issues
            logger.info(`PouchManager: Start first replication for ${doctype}`)
            docs = await replicateAllDocs({
              db: pouch,
              baseUrl: url,
              doctype,
              storage
            })
            logger.info(`PouchManager: End first replication for ${doctype}`)
            const end = new Date()
            if (process.env.NODE_ENV !== 'production') {
              logger.info(
                `PouchManager: initial replication with all_docs for ${url} took ${humanTimeDelta(
                  end.getTime() - start.getTime()
                )}`
              )
            }
            return resolve(docs)
          } catch (error) {
            return reject(error)
          }
        })()
        return
      }

      if (strategy === 'fromRemote') {
        replication = pouch.replicate.from(url, options)
      } else if (strategy === 'toRemote') {
        replication = pouch.replicate.to(url, options)
      } else {
        replication = pouch.sync(url, options)
      }

      replication.on('change', infos => {
        //! Since we introduced the concept of strategy we can use
        // PouchDB.replicate or PouchDB.sync. But both don't share the
        // same API for the change's event.
        // See https://pouchdb.com/api.html#replication
        // and https://pouchdb.com/api.html#sync (see example response)
        const change = infos.change ? infos.change : infos
        if (change.docs) {
          change.docs.forEach(doc => {
            if (!isDesignDocument(doc) && !isDeletedDocument(doc)) {
              docs[doc._id] = doc
            }
          })
        }
      })
      replication.on('error', reject).on('complete', () => {
        const end = new Date()
        if (process.env.NODE_ENV !== 'production') {
          logger.info(
            `PouchManager: replication for ${url} took ${humanTimeDelta(
              end.getTime() - start.getTime()
            )}`
          )
        }
        resolve(Object.values(docs))
      })
    }
  })

  const cancel = () => {
    if (replication) {
      replication.cancel()
    }
  }

  promise.cancel = cancel
  return promise
}
const filterDocs = docs => {
  return docs
    .map(doc => doc.doc)
    .filter(doc => !doc._deleted && !startsWith(doc._id, '_design'))
}

/**
 * Replicate all docs locally from a remote URL.
 *
 * It uses the _all_docs view, and bulk insert the docs.
 * Note it saves the last replicated _id for each run and
 * starts from there in case the process stops before the end.
 *
 * @param {object} params - The replications parameters
 * @param {object} params.db - Pouch instance
 * @param {string} params.baseUrl - The remote instance
 * @param {string} params.doctype - The doctype to replicate
 * @param {import('./localStorage').PouchLocalStorage} params.storage - Methods to access local storage
 * @returns {Promise<Array>} The retrieved documents
 */
export const replicateAllDocs = async ({ db, baseUrl, doctype, storage }) => {
  const remoteUrlAllDocs = new URL(`${baseUrl}/_all_docs`)
  const batchSize = BATCH_SIZE
  let hasMore = true
  let startDocId = await storage.getLastReplicatedDocID(doctype) // Get last replicated _id in localStorage
  let docs = []

  while (hasMore) {
    if (!startDocId) {
      // No startDocId set: this is the first time we replicate
      const res = await fetchRemoteInstance(remoteUrlAllDocs, {
        limit: batchSize,
        include_docs: true
      })
      docs = filterDocs(res.rows)
      if (docs.length === 0) {
        hasMore = false
      } else {
        startDocId = docs[docs.length - 1]._id
        if (docs.length < batchSize) {
          hasMore = false
        }
        await helpers.insertBulkDocs(db, docs)
        await storage.persistLastReplicatedDocID(doctype, startDocId)
      }
    } else {
      const res = await fetchRemoteInstance(remoteUrlAllDocs, {
        include_docs: true,
        limit: batchSize,
        startkey_docid: startDocId
      })
      const filteredDocs = filterDocs(res.rows)
      if (filteredDocs.length < 2) {
        return docs
      }
      filteredDocs.shift() // Remove first element, already included in previous request
      startDocId = filteredDocs[filteredDocs.length - 1]._id
      await helpers.insertBulkDocs(db, filteredDocs)
      await storage.persistLastReplicatedDocID(doctype, startDocId)
      docs = docs.concat(filteredDocs)

      if (res.rows.length < batchSize) {
        hasMore = false
      }
    }
  }
  return docs
}

/**
 * Replicates all documents from a shared drive to a local PouchDB instance.
 * This function fetches documents in batches from a twake drive shared drive
 * and replicates them to the local database, maintaining replication state
 * to allow for incremental updates.
 * We do not have an _all_docs view for shared drives, so we use the fetchChanges method.
 *
 * @param {Object} params - The parameters object
 * @param {string} params.driveId - The unique identifier of the shared drive to replicate from
 * @param {Object} params.pouch - The local PouchDB instance to replicate documents to
 * @param {Object} params.storage - Storage interface for persisting replication state
 * @param {string} params.doctype - The document type being replicated (e.g., 'io.cozy.files')
 * @param {boolean} params.initialReplication - Whether this is an initial replication
 * @param {CozyClient} params.client - CozyClient instance for fetching remote documents
 * @returns {Promise<Array>} A promise that resolves to an array of all replicated documents
 * @throws {Error} Throws an error if driveId is not provided
 */
export const sharedDriveReplicateAllDocs = async ({
  driveId,
  pouch,
  storage,
  initialReplication = false,
  doctype,
  client
}) => {
  if (!driveId) {
    throw new Error('sharedDriveReplicateAllDocs: driveId is required')
  }
  let docs = []
  let hasMore = true

  let doctypeLastSequence = await storage.getDoctypeLastSequence(doctype)
  while (hasMore) {
    const { newLastSeq, results, pending } = await client
      .collection('io.cozy.files', { driveId })
      .fetchChanges(
        {
          include_docs: true,
          ...(doctypeLastSequence ? { since: doctypeLastSequence } : {})
        },
        {
          includeFilePath: false,
          ...(initialReplication
            ? { skipDeleted: true, skipTrashed: true }
            : { skipDeleted: false, skipTrashed: false }),
          limit: BATCH_SIZE
        }
      )

    const toDelete = []
    const toInsert = []
    const allDocsWithDriveId = []
    for (const doc of results) {
      const docWithDriveId = doc.doc
      docWithDriveId.driveId = driveId
      allDocsWithDriveId.push(docWithDriveId)
      if (doc.doc._deleted) {
        toDelete.push(doc.doc)
      } else {
        toInsert.push(docWithDriveId)
      }
    }
    // FIXME this is a workaround to allow to delete documents from the shared drive
    // changes
    // PouchDB.bulkDocs ignores _deleted documents with revision newer than the existing
    // document
    // The workaround is to get documents from PouchDB with correct revision and delete them
    // see https://github.com/pouchdb/pouchdb/issues/7841
    if (toDelete.length > 0) {
      // lets try to find a document with the same _id in allDocsWithDriveId
      const updatedToDeleteDocs = await pouch.bulkGet({
        docs: toDelete.map(d => ({ id: d._id }))
      })
      const toBulkDelete = updatedToDeleteDocs.results
        .map(doc => ({
          ...doc?.docs?.[0]?.ok,
          _deleted: true
        }))
        .filter(doc => doc._id)
      if (toBulkDelete.length > 0) {
        await pouch.bulkDocs(toBulkDelete)
        if (toBulkDelete.length !== toDelete.length) {
          logger.error(
            `sharedDriveReplicateAllDocs: Error deleting documents ${toDelete
              .map(d => d._id)
              .join(', ')}`
          )
        }
      }
    }

    doctypeLastSequence = newLastSeq
    await helpers.insertBulkDocs(pouch, toInsert)
    await storage.persistDoctypeLastSequence(doctype, doctypeLastSequence)
    docs = docs.concat(allDocsWithDriveId)
    hasMore = !!pending
  }
  return docs
}
