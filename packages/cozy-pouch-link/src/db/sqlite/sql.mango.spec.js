import { makeWhereClause, makeSortClause, makeSQLQueryForIds } from './sql'

// Compatibility of the native SQLite engine with the mango selector language
// (cozy-client / pouchdb-find).
//
// - "correctness fixes" lock the behaviour of selectors the engine DOES accept
//   but used to mistranslate (quoting, $or precedence, empty $in, sort order).
// - "gaps" document selectors mango accepts that the engine cannot translate
//   yet; they are `.skip` and assert the SQL we want, so each unskips the day
//   the gap is closed. See the tracking issue for the full matrix.

describe('native SQLite mango — correctness fixes', () => {
  it('escapes single quotes in string values (no SQL break / injection)', () => {
    expect(makeWhereClause({ name: { $eq: "l'ete.txt" } })).toBe(
      "DELETED = 0 AND (json_extract(data, '$.name') = 'l''ete.txt')"
    )
  })

  it('parenthesises the mango expression so a top-level $or keeps the DELETED guard', () => {
    expect(
      makeWhereClause({ $or: [{ type: 'file' }, { type: 'directory' }] })
    ).toBe(
      "DELETED = 0 AND ((json_extract(data, '$.type') = 'file') OR (json_extract(data, '$.type') = 'directory'))"
    )
  })

  it('turns an empty $in into a false constant instead of "IN ()"', () => {
    expect(makeWhereClause({ type: { $in: [] } })).toBe('DELETED = 0 AND (0)')
  })

  it('turns an empty $nin into a true constant', () => {
    expect(makeWhereClause({ type: { $nin: [] } })).toBe('DELETED = 0 AND (1)')
  })

  it('applies per-field sort direction for mixed asc/desc', () => {
    expect(makeSortClause([{ name: 'asc' }, { size: 'desc' }])).toBe(
      "json_extract(data, '$.name') ASC, json_extract(data, '$.size') DESC"
    )
  })

  it('quotes each id separately in getByIds', () => {
    expect(makeSQLQueryForIds(['a', 'b'])).toContain('IN ("a", "b")')
  })
})

describe('native SQLite mango — gaps (mango accepts, engine does not yet)', () => {
  // $not / $nor are currently read as field names -> "json_extract('$.$not') undefined"
  it.skip('translates $not', () => {
    expect(makeWhereClause({ $not: { type: 'file' } })).not.toContain(
      'undefined'
    )
  })

  // No mapping in MANGO_TO_SQL_OP -> literal "undefined" in the SQL
  it.skip('translates $regex', () => {
    expect(makeWhereClause({ name: { $regex: '^foo' } })).not.toContain(
      'undefined'
    )
  })

  // Array operators are entirely absent
  it.skip('translates $elemMatch on an array field', () => {
    expect(
      makeWhereClause({ referenced_by: { $elemMatch: { type: 'album' } } })
    ).not.toContain('undefined')
  })
  it.skip('translates $all', () => {
    expect(makeWhereClause({ tags: { $all: ['a', 'b'] } })).not.toContain(
      'undefined'
    )
  })
  it.skip('translates $size', () => {
    expect(makeWhereClause({ tags: { $size: 3 } })).not.toContain('undefined')
  })

  // A nested object means subfield equality; the sub-keys are currently iterated
  // as operators -> "json_extract('$.cozyMetadata') undefined 'drive'"
  it.skip('treats a nested object as subfield equality', () => {
    expect(makeWhereClause({ cozyMetadata: { createdByApp: 'drive' } })).toBe(
      "DELETED = 0 AND (json_extract(data, '$.cozyMetadata.createdByApp') = 'drive')"
    )
  })

  // "= NULL" never matches; mango $eq null should match null / missing
  it.skip('translates $eq null to an IS NULL check', () => {
    expect(makeWhereClause({ trashed: { $eq: null } })).toBe(
      "DELETED = 0 AND (json_extract(data, '$.trashed') IS NULL)"
    )
  })
})
