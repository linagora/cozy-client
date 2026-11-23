import { getOldDatabaseName } from '../utils'

export const destroyOldDatabases = (PouchDB, doctypes, prefix) => {
  if (doctypes) {
    doctypes.forEach(doctype => {
      // Check an old version of the db exist for this doctype
      const db = new PouchDB(getOldDatabaseName(prefix, doctype), {
        skip_setup: true // Skip the db creation
      })
      if (db && db.info) {
        db.info()
          .then(() => {
            // The database exists: destroy it
            return db.destroy()
          })
          .catch(err => {
            // No database found, nothing to do
            return
          })
      }
    })
  }
}
