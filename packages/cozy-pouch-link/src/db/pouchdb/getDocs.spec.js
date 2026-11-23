import adapter from 'pouchdb-adapter-memory'
import PouchDB from 'pouchdb-browser'
import PouchDBFind from 'pouchdb-find'

import { getDocs } from './getDocs'

PouchDB.plugin(PouchDBFind)
PouchDB.plugin(adapter)

const insertData = async (db, number) => {
  const docs = []
  for (let i = 0; i < number; i++) {
    docs.push({ _id: `doc${i}`, status: true })
  }
  await db.bulkDocs(docs)
}

describe('getDocs', () => {
  let db, options

  beforeEach(async () => {
    db = new PouchDB('test', { adapter: 'memory' })
    options = { selector: { status: { $eq: true } } }
    await db.createIndex({ index: { fields: ['status'] } })
    await insertData(db, 105)
  })

  afterEach(async () => {
    await db.destroy()
  })

  it('should get all docs', async () => {
    const resp = await getDocs(db, 'allDocs', options)
    expect(resp.rows).toHaveLength(106) // include design doc
  })

  it('should get 20 docs with allDocs', async () => {
    const resp = await getDocs(db, 'allDocs', { limit: 20 })
    expect(resp.rows).toHaveLength(20)
  })

  it('should find docs with default limit', async () => {
    const resp = await getDocs(db, 'find', options)
    expect(resp.docs).toHaveLength(105) // does not include design doc
  })

  it('should get 20 docs with find', async () => {
    const resp = await getDocs(db, 'find', { ...options, limit: 20 })
    expect(resp.docs).toHaveLength(20)
  })

  it('should get a single doc by id', async () => {
    const resp = await getDocs(db, 'get', { ...options, id: 'doc0' })
    expect(resp._id).toEqual('doc0')
  })

  it('should get a multiple docs by ids', async () => {
    const resp = await getDocs(db, 'allDocs', {
      ...options,
      keys: ['doc0', 'doc1', 'doc2']
    })
    expect(resp.rows).toHaveLength(3)
  })
})
