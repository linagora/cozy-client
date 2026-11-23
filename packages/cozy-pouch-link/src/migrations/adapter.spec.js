import PouchDB from 'pouchdb-browser'

import { migratePouch } from './adapter'

describe('adapter', () => {
  PouchDB.plugin(require('pouchdb-adapter-memory'))

  it('should migrate', async () => {
    const oldPouch = new PouchDB('test', { adapter: 'memory' })
    await oldPouch.put({
      _id: 'hellodoc',
      name: 'bugs'
    })
    const migrated = await migratePouch({
      dbName: 'test',
      fromAdapter: 'memory',
      toAdapter: 'memory'
    })
    expect(migrated.adapter).toEqual('memory')
    const doc = await migrated.get('hellodoc')
    expect(doc._id).toEqual('hellodoc')
    expect(doc.name).toEqual('bugs')
  })
})
