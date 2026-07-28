import {
  mangoSelectorToSQL,
  makeWhereClause,
  makeSortClause,
  makeSQLQueryFromMango,
  makeSQLQueryForId,
  makeSQLQueryForIds,
  keepDocWitHighestRev,
  makeSQLQueryAll,
  parseResults,
  makeSQLCreateMangoIndex,
  toWebSQLResult
} from './sql'

describe('mangoSelectorToSQL', () => {
  it('should return empty string for empty selector', () => {
    const selector = {}
    expect(mangoSelectorToSQL(selector)).toBe('')
  })

  it('should handle implicit equality selector', () => {
    const selector = { status: 'active' }
    expect(mangoSelectorToSQL(selector)).toBe(
      "json_extract(data, '$.status') = 'active'"
    )
  })

  it('should handle explicit $eq operator', () => {
    const selector = { status: { $eq: 'active' } }
    expect(mangoSelectorToSQL(selector)).toBe(
      "json_extract(data, '$.status') = 'active'"
    )
  })

  it('should handle $neq operator', () => {
    const selector = { status: { $ne: 'active' } }
    expect(mangoSelectorToSQL(selector)).toBe(
      "json_extract(data, '$.status') != 'active'"
    )
  })

  it('should handle $in and $nin operator', () => {
    const selector = {
      status: { $in: ['active', 'pending'] },
      other_status: { $nin: ['maintenance', 'failing'] }
    }
    expect(mangoSelectorToSQL(selector)).toBe(
      "json_extract(data, '$.status') IN ('active', 'pending') AND json_extract(data, '$.other_status') NOT IN ('maintenance', 'failing')"
    )
  })

  it('should handle $exists operator', () => {
    const selector1 = { status: { $exists: true } }
    expect(mangoSelectorToSQL(selector1)).toBe(
      "json_extract(data, '$.status') IS NOT NULL"
    )

    const selector2 = { status: { $exists: false } }
    expect(mangoSelectorToSQL(selector2)).toBe(
      "json_extract(data, '$.status') IS NULL"
    )
  })

  it('should handle implicit $and operator', () => {
    const selector = {
      age: 18,
      status: 'active',
      date: '2025-01-01'
    }
    expect(mangoSelectorToSQL(selector)).toBe(
      "json_extract(data, '$.age') = 18 AND json_extract(data, '$.status') = 'active' AND json_extract(data, '$.date') = '2025-01-01'"
    )
  })

  it('should handle range operators', () => {
    const selector1 = { date: { $gt: '2025-01-01', $lt: '2026-01-01' } }
    expect(mangoSelectorToSQL(selector1)).toBe(
      "json_extract(data, '$.date') > '2025-01-01' AND json_extract(data, '$.date') < '2026-01-01'"
    )

    const selector2 = {
      startDate: { $gte: '2025-01-01' },
      endDate: { $lte: '2026-01-01' }
    }
    expect(mangoSelectorToSQL(selector2)).toBe(
      "json_extract(data, '$.startDate') >= '2025-01-01' AND json_extract(data, '$.endDate') <= '2026-01-01'"
    )
  })

  it('should handle $gt: null cases', () => {
    const selector = { date: { $gt: null } }
    expect(mangoSelectorToSQL(selector)).toBe(
      "json_extract(data, '$.date') IS NOT NULL"
    )
  })

  it('should handle explicit $and operator', () => {
    const selector = { $and: [{ age: { $gte: 18 } }, { status: 'active' }] }
    expect(mangoSelectorToSQL(selector)).toBe(
      "(json_extract(data, '$.age') >= 18) AND (json_extract(data, '$.status') = 'active')"
    )
  })

  it('should handle explicit $or operator', () => {
    const selector = { $or: [{ status: 'active' }, { status: 'pending' }] }
    expect(mangoSelectorToSQL(selector)).toBe(
      "(json_extract(data, '$.status') = 'active') OR (json_extract(data, '$.status') = 'pending')"
    )
  })
})

describe('makeWhereClause', () => {
  it('should return only deleted clause when no mango selector', () => {
    expect(makeWhereClause(undefined)).toEqual('DELETED = 0')
  })

  it('should return deleted and mango clauses when there is a mango selector', () => {
    const selector = { status: 'active' }
    expect(makeWhereClause(selector)).toEqual(
      "DELETED = 0 AND (json_extract(data, '$.status') = 'active')"
    )
  })
})

describe('makeSortClause', () => {
  it('should return null when no mango sort', () => {
    const sortBy = undefined
    expect(makeSortClause(sortBy)).toBe(null)
  })

  it('should return correct order by, with one sorting attribute', () => {
    const sortBy = [{ date: 'asc' }]
    expect(makeSortClause(sortBy)).toEqual("json_extract(data, '$.date') ASC")
  })

  it('should return correct order by, with multiple sorting attribute', () => {
    const sortBy = [{ date: 'asc' }, { name: 'asc' }, { type: 'asc' }]
    expect(makeSortClause(sortBy)).toEqual(
      "json_extract(data, '$.date') ASC, json_extract(data, '$.name') ASC, json_extract(data, '$.type') ASC"
    )
  })

  it('should deal with ascending and descending order', () => {
    const sortBy1 = [{ date: 'asc' }]
    expect(makeSortClause(sortBy1)).toEqual("json_extract(data, '$.date') ASC")
    const sortBy2 = [{ date: 'desc' }]
    expect(makeSortClause(sortBy2)).toEqual("json_extract(data, '$.date') DESC")
  })
})

describe('makeSQLQueryFromMango', () => {
  it('should return a correct SQL query with no sort', () => {
    const selector = { date: { $gt: '2025-01-01' } }
    const indexName = 'by_name'
    const limit = 100
    const sql = makeSQLQueryFromMango({ selector, indexName, limit })

    const expectedSql = [
      `SELECT 'by-sequence'.json AS data, 'by-sequence'.doc_id, 'by-sequence'.rev`,
      `FROM 'by-sequence' INDEXED BY by_name, 'document-store'`,
      `WHERE 'by-sequence'.seq = 'document-store'.winningseq AND DELETED = 0 AND (json_extract(data, '$.date') > '2025-01-01')`,
      `LIMIT 100;`
    ].join(' ')
    expect(sql).toEqual(expectedSql)
  })

  it('should return a correct SQL query with sort', () => {
    const selector = { date: { $gt: '2025-01-01' } }
    const sort = [{ date: 'asc' }]
    const indexName = 'by_name'
    const limit = 100
    const sql = makeSQLQueryFromMango({ selector, sort, indexName, limit })

    const expectedSql = [
      `SELECT 'by-sequence'.json AS data, 'by-sequence'.doc_id, 'by-sequence'.rev`,
      `FROM 'by-sequence' INDEXED BY by_name, 'document-store'`,
      `WHERE 'by-sequence'.seq = 'document-store'.winningseq AND DELETED = 0 AND (json_extract(data, '$.date') > '2025-01-01')`,
      `ORDER BY json_extract(data, '$.date') ASC`,
      `LIMIT 100;`
    ].join(' ')
    expect(sql).toEqual(expectedSql)
  })

  it('should handle the skip and limit', () => {
    const selector = { date: { $gt: '2025-01-01' } }
    const indexName = 'by_name'
    const limit = 200
    const skip = 100
    const sql = makeSQLQueryFromMango({
      selector,
      indexName,
      limit,
      skip
    })

    const expectedSql = [
      `SELECT 'by-sequence'.json AS data, 'by-sequence'.doc_id, 'by-sequence'.rev`,
      `FROM 'by-sequence' INDEXED BY by_name, 'document-store'`,
      `WHERE 'by-sequence'.seq = 'document-store'.winningseq AND DELETED = 0 AND (json_extract(data, '$.date') > '2025-01-01')`,
      `LIMIT 200 OFFSET 100;`
    ].join(' ')
    expect(sql).toEqual(expectedSql)
  })

  it('should not emit an OFFSET without a LIMIT', () => {
    const sql = makeSQLQueryFromMango({
      selector: { name: { $gt: null } },
      indexName: 'by_name',
      skip: 10
    })

    expect(sql).toContain('LIMIT -1 OFFSET 10;')
  })

  it('should fall back to an unbounded LIMIT when limit is null', () => {
    const sql = makeSQLQueryFromMango({
      selector: { name: { $gt: null } },
      indexName: 'by_name',
      limit: null,
      skip: 10
    })

    // `LIMIT null` parses but throws a datatype mismatch when stepped.
    expect(sql).not.toContain('LIMIT null')
    expect(sql).toContain('LIMIT -1 OFFSET 10;')
  })
})

describe('makeSQLQueryAll', () => {
  it('should fall back to an unbounded LIMIT when limit is null', () => {
    expect(makeSQLQueryAll({ limit: null })).toContain('LIMIT -1;')
  })

  it('should return a correct sql query to get all docs', () => {
    const sql = makeSQLQueryAll()
    const expectedSql = [
      `SELECT 'by-sequence'.json AS data, 'by-sequence'.doc_id, 'by-sequence'.rev`,
      `FROM 'document-store', 'by-sequence'`,
      `WHERE 'by-sequence'.seq = 'document-store'.winningseq AND 'by-sequence'.deleted=0`,
      `LIMIT -1;`
    ].join(' ')
    expect(sql).toEqual(expectedSql)
  })

  it('should handle limit and skip', () => {
    const sql = makeSQLQueryAll({ limit: 10, skip: 100 })
    const expectedSql = [
      `SELECT 'by-sequence'.json AS data, 'by-sequence'.doc_id, 'by-sequence'.rev`,
      `FROM 'document-store', 'by-sequence'`,
      `WHERE 'by-sequence'.seq = 'document-store'.winningseq AND 'by-sequence'.deleted=0`,
      `LIMIT 10`,
      `OFFSET 100;`
    ].join(' ')
    expect(sql).toEqual(expectedSql)
  })
})

describe('makeSQLQueryForId', () => {
  it('joins document-store on winningseq to return the winning revision', () => {
    const sql = makeSQLQueryForId('abc')
    expect(sql).toContain(`'by-sequence'.seq = 'document-store'.winningseq`)
    expect(sql).toContain(`'document-store'.id = "abc"`)
  })
})

describe('makeSQLQueryForIds', () => {
  it('emits one quoted value per id in the IN clause', () => {
    const sql = makeSQLQueryForIds(['a', 'b'])
    expect(sql).toContain(`'document-store'.id IN ("a", "b")`)
    expect(sql).toContain(`'by-sequence'.seq = 'document-store'.winningseq`)
  })
})

describe('keepDocWitHighestRev', () => {
  it('should return null if no docs', () => {
    expect(keepDocWitHighestRev([])).toBeNull()
    expect(keepDocWitHighestRev(undefined)).toBeNull()
  })

  it('should return the single document when only one is provided', () => {
    const doc = { _rev: '1-a', name: 'Single Doc' }
    const docs = [doc]
    expect(keepDocWitHighestRev(docs)).toBe(doc)
  })

  it('should return the document with the highest revision prefix', () => {
    const docs = [
      { _rev: '1-a', name: 'Doc 1' },
      { _rev: '3-c', name: 'Doc 3' },
      { _rev: '2-b', name: 'Doc 2' }
    ]
    expect(keepDocWitHighestRev(docs)).toEqual(docs[1])
  })

  it('should work correctly even if the documents are unsorted', () => {
    const docs = [
      { _rev: '5-zzz', name: 'Doc 5' },
      { _rev: '2-aaa', name: 'Doc 2' },
      { _rev: '10-xxx', name: 'Doc 10' },
      { _rev: '7-bbb', name: 'Doc 7' }
    ]
    expect(keepDocWitHighestRev(docs)).toEqual(docs[2])
  })
})

describe('parseResults', () => {
  const client = {}
  const doctype = 'testdoctype'

  it('should parse results correctly for multiple documents', () => {
    const result = {
      rows: {
        length: 2,
        item: jest.fn().mockImplementation(i => ({
          data: JSON.stringify({ name: `doc${i}` }),
          doc_id: `id${i}`,
          rev: `rev${i}`
        }))
      }
    }

    const parsed = parseResults(client, result, doctype)

    expect(parsed.data.length).toBe(2)
    expect(parsed.meta.count).toBe(2)
    expect(parsed.skip).toBe(0)
    expect(parsed.next).toBe(false)

    expect(parsed.data[0]).toEqual({
      _id: 'id0',
      id: 'id0',
      _rev: 'rev0',
      _type: doctype,
      name: 'doc0'
    })
  })

  it('should handle isSingleDoc correctly with multiple docs', () => {
    const result = {
      rows: {
        length: 2,
        item: jest.fn().mockImplementation(i => ({
          data: JSON.stringify({ name: `doc${i}` }),
          doc_id: `id${i}`,
          rev: `rev${i}`
        }))
      }
    }

    const parsed = parseResults(client, result, doctype, { isSingleDoc: true })

    expect(parsed.data).toEqual({
      _id: 'id0',
      id: 'id0',
      _rev: 'rev0',
      _type: doctype,
      name: 'doc0'
    })
  })

  it('should return empty data array when no rows are present', () => {
    const result = { rows: { length: 0, item: jest.fn() } }

    const parsed = parseResults(client, result, doctype)

    expect(parsed).toEqual({ data: [] })
  })

  it('should set next=true when limit matches parsed length', () => {
    const result = {
      rows: {
        length: 3,
        item: jest.fn().mockImplementation(i => ({
          data: JSON.stringify({ name: `doc${i}` }),
          doc_id: `id${i}`,
          rev: `rev${i}`
        }))
      }
    }

    const parsed = parseResults(client, result, doctype, { limit: 3 })

    expect(parsed.next).toBe(true)
    expect(parsed.data.length).toBe(3)
  })

  it('should set next=true when there is as much docs as specified limit ', () => {
    const result = {
      rows: {
        length: 3,
        item: jest.fn().mockImplementation(i => ({
          data: JSON.stringify({ name: `doc${i}` }),
          doc_id: `id${i}`,
          rev: `rev${i}`
        }))
      }
    }

    const parsed = parseResults(client, result, doctype, { limit: 3 })

    expect(parsed.next).toBe(true)
    expect(parsed.data.length).toBe(3)
  })

  it('should set next=false when there are less docs than specified limit', () => {
    const result = {
      rows: {
        length: 3,
        item: jest.fn().mockImplementation(i => ({
          data: JSON.stringify({ name: `doc${i}` }),
          doc_id: `id${i}`,
          rev: `rev${i}`
        }))
      }
    }

    const parsed = parseResults(client, result, doctype, { limit: 4 })

    expect(parsed.next).toBe(false)
    expect(parsed.data.length).toBe(3)
  })

  it('should set next=false when there is no limit', () => {
    const result = {
      rows: {
        length: 3,
        item: jest.fn().mockImplementation(i => ({
          data: JSON.stringify({ name: `doc${i}` }),
          doc_id: `id${i}`,
          rev: `rev${i}`
        }))
      }
    }

    const parsed1 = parseResults(client, result, doctype, { limit: -1 })
    expect(parsed1.next).toBe(false)
    expect(parsed1.data.length).toBe(3)
    const parsed2 = parseResults(client, result, doctype)
    expect(parsed2.next).toBe(false)
    expect(parsed2.data.length).toBe(3)
  })

  it('should handle single document correctly', () => {
    const result = {
      rows: {
        length: 1,
        item: jest.fn().mockReturnValue({
          data: JSON.stringify({ name: 'single_doc' }),
          doc_id: 'single_id',
          rev: 'single_rev'
        })
      }
    }

    const parsed = parseResults(client, result, doctype, { isSingleDoc: true })

    expect(parsed.data).toEqual({
      _id: 'single_id',
      id: 'single_id',
      _rev: 'single_rev',
      _type: doctype,
      name: 'single_doc'
    })
  })
})

describe('partialFilter', () => {
  it('should build the index filter against the json column', () => {
    const sql = makeSQLCreateMangoIndex('by_name', ['name'], {
      partialFilter: { trashed: false }
    })

    // `data` is only a SELECT alias, CREATE INDEX would reject it.
    expect(sql).toContain(`json_extract(json, '$.trashed') = false`)
    expect(sql).not.toContain(`json_extract(data`)
  })

  it('should restate the partial filter in the query', () => {
    const sql = makeSQLQueryFromMango({
      selector: { dir_id: 'root' },
      indexName: 'by_dir_id',
      partialFilter: { trashed: false }
    })

    expect(sql).toContain(`json_extract(data, '$.trashed') = false`)
  })
})

describe('_id and _rev selectors', () => {
  it('should resolve _id to the by-sequence column in a query', () => {
    // PouchDB strips _id from the stored JSON, so json_extract would be NULL.
    expect(mangoSelectorToSQL({ _id: 'abc' })).toEqual(
      `'by-sequence'.doc_id = 'abc'`
    )
  })

  it('should resolve _rev to the by-sequence column in a query', () => {
    expect(mangoSelectorToSQL({ _rev: '1-abc' })).toEqual(
      `'by-sequence'.rev = '1-abc'`
    )
  })

  it('should leave the column unqualified in an index context', () => {
    expect(mangoSelectorToSQL({ _id: 'abc' }, 'json')).toEqual(`doc_id = 'abc'`)
  })

  it('should keep filtering hidden ids out of a partial index', () => {
    const sql = makeSQLCreateMangoIndex('by_name', ['name'], {
      partialFilter: { _id: { $nin: ['io.cozy.files.trash-dir'] } }
    })

    expect(sql).toContain(`doc_id NOT IN ('io.cozy.files.trash-dir')`)
  })
})

describe('toWebSQLResult', () => {
  it('should rebuild a rows accessor from rawRows and columnNames', () => {
    const result = toWebSQLResult({
      rowsAffected: 0,
      rawRows: [['{"a":1}', 'id1', '1-abc'], ['{"a":2}', 'id2', '2-def']],
      columnNames: ['data', 'doc_id', 'rev']
    })

    expect(result.rows.length).toBe(2)
    expect(result.rows.item(0)).toEqual({
      data: '{"a":1}',
      doc_id: 'id1',
      rev: '1-abc'
    })
    expect(result.rows.item(1).doc_id).toBe('id2')
  })

  it('should wrap a plain rows array', () => {
    const result = toWebSQLResult({ rows: [{ doc_id: 'id1' }] })

    expect(result.rows.length).toBe(1)
    expect(result.rows.item(0).doc_id).toBe('id1')
  })

  it('should leave a WebSQL-style result untouched', () => {
    const rows = { length: 0, item: () => undefined }
    expect(toWebSQLResult({ rows }).rows).toBe(rows)
  })
})
