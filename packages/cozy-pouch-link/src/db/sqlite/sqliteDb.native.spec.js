import PouchDBQueryEngine from '../pouchdb/pouchdb'

import SQLiteQueryEngine from './sqliteDb.native'

jest.mock('@op-engineering/op-sqlite', () => ({ open: jest.fn() }))

import { open } from '@op-engineering/op-sqlite'
jest.mock('../pouchdb/pouchdb')

// The engine answers a query it cannot translate - or one SQLite rejects - by
// delegating to pouch-find. Returning an empty result instead would be
// indistinguishable from "no document matches".
describe('SQLiteQueryEngine find fallback', () => {
  const pouchManager = { client: {}, getPouch: jest.fn() }
  const fallbackResult = { data: [{ _id: 'found-by-pouch' }] }
  let engine

  beforeEach(() => {
    jest.clearAllMocks()
    PouchDBQueryEngine.mockImplementation(() => ({
      openDB: jest.fn(),
      find: jest.fn().mockResolvedValue(fallbackResult)
    }))
    engine = new SQLiteQueryEngine(pouchManager, 'io.cozy.files')
    engine.dbName = 'cozy-files'
    // Bypass the lazy op-sqlite getter: these tests are about routing, not I/O.
    Object.defineProperty(engine, 'db', {
      configurable: true,
      value: { executeAsync: jest.fn() }
    })
  })

  it('routes an untranslatable selector to pouch-find without touching SQLite', async () => {
    const options = { selector: { name: { $regex: '^foo' } } }

    const result = await engine.find(options)

    expect(result).toBe(fallbackResult)
    expect(engine.db.executeAsync).not.toHaveBeenCalled()
    expect(engine.getPouchFallback().find).toHaveBeenCalledWith(options)
  })

  it('routes to pouch-find when SQLite rejects the query', async () => {
    engine.db.executeAsync.mockRejectedValue(new Error('malformed SQL'))

    const result = await engine.find({ selector: { type: 'file' } })

    expect(result).toBe(fallbackResult)
  })

  it('opens the fallback engine once, on the same database', async () => {
    await engine.find({ selector: { name: { $regex: '^foo' } } })
    await engine.find({ selector: { name: { $regex: '^bar' } } })

    expect(PouchDBQueryEngine).toHaveBeenCalledTimes(1)
    expect(PouchDBQueryEngine).toHaveBeenCalledWith(
      pouchManager,
      'io.cozy.files'
    )
    expect(engine.getPouchFallback().openDB).toHaveBeenCalledWith('cozy-files')
  })

  it('does not build a fallback engine for a selector it can translate', async () => {
    engine.db.executeAsync.mockResolvedValue({
      rows: { length: 0, item: () => undefined }
    })

    await engine.find({ selector: { type: 'file' } })

    expect(PouchDBQueryEngine).not.toHaveBeenCalled()
  })
})

describe('SQLiteQueryEngine openDB setup', () => {
  const setup = ({ createIndexFails = false } = {}) => {
    const executeSync = jest.fn()
    const executeAsync = jest.fn(() =>
      createIndexFails
        ? Promise.reject(new Error('database is locked'))
        : Promise.resolve({ rows: { length: 0, item: () => undefined } })
    )
    open.mockReturnValue({ executeSync, executeAsync })
    const engine = new SQLiteQueryEngine({ client: {} }, 'io.cozy.files')
    engine.openDB('cozy-files')
    return { engine, executeSync, executeAsync }
  }

  it('applies the pragmas synchronously so a query cannot outrun them', () => {
    const { engine, executeSync } = setup()

    expect(engine.db).toBeDefined()
    expect(executeSync).toHaveBeenCalled()
  })

  it('sets busy_timeout before switching the journal mode', () => {
    const { engine, executeSync } = setup()
    void engine.db

    const statements = executeSync.mock.calls.map(([sql]) => sql)
    const firstTimeout = statements.findIndex(sql =>
      sql.includes('busy_timeout')
    )
    const journalMode = statements.findIndex(sql =>
      sql.includes('journal_mode')
    )

    expect(firstTimeout).toBeGreaterThanOrEqual(0)
    expect(journalMode).toBeGreaterThan(firstTimeout)
  })

  it('keeps a locked CREATE INDEX from becoming an unhandled rejection', async () => {
    const { engine } = setup({ createIndexFails: true })
    const unhandled = jest.fn()
    process.on('unhandledRejection', unhandled)

    void engine.db
    await new Promise(resolve => setImmediate(resolve))
    await new Promise(resolve => setImmediate(resolve))

    process.off('unhandledRejection', unhandled)
    expect(unhandled).not.toHaveBeenCalled()
  })

  it('still returns a usable handle when the pragmas throw', () => {
    open.mockReturnValue({
      executeSync: jest.fn(() => {
        throw new Error('database is locked')
      }),
      executeAsync: jest.fn().mockResolvedValue({})
    })
    const engine = new SQLiteQueryEngine({ client: {} }, 'io.cozy.files')
    engine.openDB('cozy-files')

    expect(engine.db).toBeDefined()
  })
})
