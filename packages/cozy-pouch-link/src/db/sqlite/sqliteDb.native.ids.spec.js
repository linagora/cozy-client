import { DatabaseSync } from 'node:sqlite'

import SQLiteQueryEngine from './sqliteDb.native'

jest.mock('@op-engineering/op-sqlite', () => ({ open: jest.fn() }))

const SCHEMA = `
  CREATE TABLE 'document-store' (id unique, json, winningseq, max_seq INTEGER UNIQUE);
  CREATE TABLE 'by-sequence' (seq INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, json, deleted TINYINT(1), doc_id, rev);`

// Double-quoted tokens fall back to string literals, as in op-sqlite's default build.
const makeEngine = ids => {
  const db = new DatabaseSync(':memory:', {
    enableDoubleQuotedStringLiterals: true
  })
  db.exec(SCHEMA)
  const insertSeq = db.prepare(
    `INSERT INTO 'by-sequence' (json, deleted, doc_id, rev) VALUES (?, 0, ?, ?)`
  )
  const insertDoc = db.prepare(
    `INSERT INTO 'document-store' (id, json, winningseq, max_seq) VALUES (?, '{}', ?, ?)`
  )
  ids.forEach((id, i) => {
    insertSeq.run(JSON.stringify({ n: i }), id, `${i + 1}-a`)
    insertDoc.run(id, i + 1, i + 1)
  })
  const engine = new SQLiteQueryEngine({ client: {} }, 'io.cozy.files')
  const executeAsync = jest.fn(async (sql, params) => {
    const rows = db.prepare(sql).all(...(params || []))
    return { rows: { length: rows.length, item: i => rows[i] } }
  })
  Object.defineProperty(engine, 'db', { value: { executeAsync } })
  return { engine, db, executeAsync }
}

const TRICKY_IDS = [
  '"',
  'data',
  'json',
  'id',
  'doc_id',
  'winningseq',
  "it's",
  '"ab"',
  'a"b',
  'a;b',
  'a--b',
  'a) b'
]

describe('SQLiteQueryEngine#getById with unusual ids', () => {
  it.each(TRICKY_IDS)(
    'returns exactly the document whose id is %j',
    async id => {
      const { engine } = makeEngine([id, 'other'])

      const res = await engine.getById(id)

      expect(res.data._id).toBe(id)
      expect((await engine.getById('missing')).data).toEqual([])
    }
  )
})

describe('SQLiteQueryEngine#getByIds with unusual ids', () => {
  it.each(TRICKY_IDS)(
    'returns only the requested documents for id %j',
    async id => {
      const { engine } = makeEngine([id, 'other'])

      const res = await engine.getByIds([id, 'missing'])

      expect(res.data.map(d => d._id)).toEqual([id])
    }
  )

  it('answers long lists of ids', async () => {
    const ids = Array.from({ length: 2500 }, (_, i) => `doc-${i}`)
    const { engine, executeAsync } = makeEngine(ids)

    const res = await engine.getByIds(ids)

    expect(res.data.map(d => d._id).sort()).toEqual([...ids].sort())
    executeAsync.mock.calls.forEach(([, params]) =>
      expect(params.length).toBeLessThanOrEqual(999)
    )
  })

  it('answers an empty list of ids', async () => {
    const { engine } = makeEngine(['a'])

    expect((await engine.getByIds([])).data).toEqual([])
  })
})
