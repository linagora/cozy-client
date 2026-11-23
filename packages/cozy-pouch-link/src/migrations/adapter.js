import PouchDB from 'pouchdb-browser'

const getNewIndexedDBDatabaseName = dbName => {
  return `${dbName}_indexeddb`
}

/**
 * Migrate a PouchDB database to a new adapter.
 *
 * @typedef {object} MigrationParams
 * @property {string} [dbName] - The database name
 * @property {string} [fromAdapter] - The current adapter type, e.g. 'idb'
 * @property {string} [toAdapter] - The new adapter type, e.g. 'indexeddb'
 *
 * @param {MigrationParams} params - The migration params
 * @returns {Promise<object>} - The migrated pouch
 */
export const migratePouch = async ({ dbName, fromAdapter, toAdapter }) => {
  const oldPouch = new PouchDB(dbName, {
    adapter: fromAdapter,
    location: 'default'
  })
  const newdbName = getNewIndexedDBDatabaseName(dbName)
  const newPouch = new PouchDB(newdbName, {
    adapter: toAdapter,
    location: 'default'
  })
  await oldPouch.replicate.to(newPouch, { batch_size: 1000 })

  await oldPouch.destroy()

  return newPouch
}
