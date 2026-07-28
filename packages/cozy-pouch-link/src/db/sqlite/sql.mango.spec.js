import { UnsupportedMangoSelectorError } from '../../errors'

import { makeWhereClause, makeSortClause, makeSQLQueryForIds } from './sql'

// Compatibility of the native SQLite engine with the mango selector language
// (cozy-client / pouchdb-find).
//
// - "correctness fixes" lock the behaviour of selectors the engine DOES accept
//   but used to mistranslate (quoting, $or precedence, empty $in, sort order).
// - "operator coverage" locks the operators the translator now expresses in SQL.
// - "unsupported selectors" locks the other half of the contract: anything the
//   translator cannot express throws, so SQLiteQueryEngine can route the query
//   to pouch-find. No selector may ever produce "undefined" in the SQL.

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

  it('whitelists the sort direction instead of interpolating it', () => {
    // ASC/DESC are bare keywords, so an unrecognised direction cannot simply be
    // quoted - it has to be rejected.
    expect(makeSortClause([{ name: 'asc; DROP TABLE docs' }])).toBe(
      "json_extract(data, '$.name') ASC"
    )
  })

  it('escapes single quotes in sorted field names too', () => {
    expect(makeSortClause([{ "l'ete": 'asc' }])).toBe(
      "json_extract(data, '$.l''ete') ASC"
    )
  })

  it('quotes each id separately in getByIds', () => {
    expect(makeSQLQueryForIds(['a', 'b'])).toContain('IN ("a", "b")')
  })
})

describe('native SQLite mango — operator coverage', () => {
  it('translates $not', () => {
    // IFNULL, not a bare NOT: NOT NULL is NULL, so a document missing the field
    // would be dropped where CouchDB keeps it.
    expect(makeWhereClause({ $not: { type: 'file' } })).toBe(
      "DELETED = 0 AND (NOT IFNULL((json_extract(data, '$.type') = 'file'), 0))"
    )
  })

  it('translates a field-level $not', () => {
    expect(makeWhereClause({ type: { $not: { $eq: 'file' } } })).toBe(
      "DELETED = 0 AND (NOT IFNULL((json_extract(data, '$.type') = 'file'), 0))"
    )
  })

  it('translates $nor as the negation of the $or', () => {
    expect(
      makeWhereClause({ $nor: [{ type: 'file' }, { type: 'directory' }] })
    ).toBe(
      "DELETED = 0 AND (NOT IFNULL(((json_extract(data, '$.type') = 'file') OR (json_extract(data, '$.type') = 'directory')), 0))"
    )
  })

  it('translates $elemMatch on an array of objects', () => {
    expect(
      makeWhereClause({ referenced_by: { $elemMatch: { type: 'album' } } })
    ).toBe(
      "DELETED = 0 AND (EXISTS (SELECT 1 FROM json_each(data, '$.referenced_by') AS elem WHERE json_extract(elem.value, '$.type') = 'album'))"
    )
  })

  it('translates $elemMatch on an array of scalars against the element itself', () => {
    expect(makeWhereClause({ tags: { $elemMatch: { $eq: 'a' } } })).toBe(
      "DELETED = 0 AND (EXISTS (SELECT 1 FROM json_each(data, '$.tags') AS elem WHERE elem.value = 'a'))"
    )
  })

  it('translates $all', () => {
    expect(makeWhereClause({ tags: { $all: ['a', 'b'] } })).toBe(
      "DELETED = 0 AND (EXISTS (SELECT 1 FROM json_each(data, '$.tags') AS elem WHERE elem.value = 'a') AND EXISTS (SELECT 1 FROM json_each(data, '$.tags') AS elem WHERE elem.value = 'b'))"
    )
  })

  it('translates $size', () => {
    expect(makeWhereClause({ tags: { $size: 3 } })).toBe(
      "DELETED = 0 AND (json_array_length(data, '$.tags') = 3)"
    )
  })

  it('translates $mod, guarding against SQLite coercing text to 0', () => {
    expect(makeWhereClause({ count: { $mod: [4, 0] } })).toBe(
      "DELETED = 0 AND ((json_type(data, '$.count') IN ('integer', 'real') AND json_extract(data, '$.count') % 4 = 0))"
    )
  })

  it('maps mango $type onto the json_type vocabulary', () => {
    expect(makeWhereClause({ size: { $type: 'number' } })).toBe(
      "DELETED = 0 AND (json_type(data, '$.size') IN ('integer', 'real'))"
    )
    expect(makeWhereClause({ trashed: { $type: 'boolean' } })).toBe(
      "DELETED = 0 AND (json_type(data, '$.trashed') IN ('true', 'false'))"
    )
  })

  it('treats a nested object as subfield equality', () => {
    expect(makeWhereClause({ cozyMetadata: { createdByApp: 'drive' } })).toBe(
      "DELETED = 0 AND (json_extract(data, '$.cozyMetadata.createdByApp') = 'drive')"
    )
  })

  it('recurses through several levels of nested objects', () => {
    expect(makeWhereClause({ a: { b: { c: 'x' } } })).toBe(
      "DELETED = 0 AND (json_extract(data, '$.a.b.c') = 'x')"
    )
  })

  it('translates $eq null to an IS NULL check', () => {
    expect(makeWhereClause({ trashed: { $eq: null } })).toBe(
      "DELETED = 0 AND (json_extract(data, '$.trashed') IS NULL)"
    )
  })

  it('translates an implicit null equality the same way', () => {
    expect(makeWhereClause({ trashed: null })).toBe(
      "DELETED = 0 AND (json_extract(data, '$.trashed') IS NULL)"
    )
  })

  it('matches missing fields on $ne and $nin, as CouchDB does', () => {
    expect(makeWhereClause({ type: { $ne: 'file' } })).toBe(
      "DELETED = 0 AND ((json_extract(data, '$.type') IS NULL OR json_extract(data, '$.type') != 'file'))"
    )
    expect(makeWhereClause({ type: { $nin: ['file'] } })).toBe(
      "DELETED = 0 AND ((json_extract(data, '$.type') IS NULL OR json_extract(data, '$.type') NOT IN ('file')))"
    )
  })

  it('translates $ne null to an IS NOT NULL check', () => {
    expect(makeWhereClause({ trashed: { $ne: null } })).toBe(
      "DELETED = 0 AND (json_extract(data, '$.trashed') IS NOT NULL)"
    )
  })

  it('escapes single quotes in field names as well as values', () => {
    expect(makeWhereClause({ "l'ete": 'x' })).toBe(
      "DELETED = 0 AND (json_extract(data, '$.l''ete') = 'x')"
    )
  })
})

describe('native SQLite mango — unsupported selectors are routed, never mistranslated', () => {
  // op-sqlite exposes no way to register a REGEXP function, so $regex cannot be
  // expressed here at all. It must be detected, not approximated.
  it('rejects $regex', () => {
    expect(() => makeWhereClause({ name: { $regex: '^foo' } })).toThrow(
      UnsupportedMangoSelectorError
    )
  })

  it('rejects any unknown operator', () => {
    expect(() => makeWhereClause({ name: { $whatever: 1 } })).toThrow(
      UnsupportedMangoSelectorError
    )
  })

  it('rejects a $type mango does accept but json_type does not name', () => {
    expect(() => makeWhereClause({ size: { $type: 'decimal' } })).toThrow(
      UnsupportedMangoSelectorError
    )
  })

  it('rejects a malformed $mod instead of emitting a half-built expression', () => {
    expect(() => makeWhereClause({ count: { $mod: [4] } })).toThrow(
      UnsupportedMangoSelectorError
    )
  })

  it('rejects a value with no SQL literal form', () => {
    expect(() => makeWhereClause({ meta: { $gt: { a: 1 } } })).toThrow(
      UnsupportedMangoSelectorError
    )
  })

  // A template literal stringifies undefined to the word "undefined", so an
  // unresolved variable in a selector - Q().where({ dir_id: someVar }) - is the
  // shortest path back to the bug this whole change is about.
  it('rejects an undefined value rather than stringifying it', () => {
    expect(() => makeWhereClause({ dir_id: undefined })).toThrow(
      UnsupportedMangoSelectorError
    )
  })

  // $gt: null is the "field exists" idiom normalizeFindSelector injects, so it
  // stays supported; the other range operators have no sound null form here.
  it('rejects range operators compared to null, except $gt', () => {
    expect(makeWhereClause({ date: { $gt: null } })).toBe(
      "DELETED = 0 AND (json_extract(data, '$.date') IS NOT NULL)"
    )
    for (const operator of ['$gte', '$lt', '$lte']) {
      expect(() => makeWhereClause({ date: { [operator]: null } })).toThrow(
        UnsupportedMangoSelectorError
      )
    }
  })

  it('detects an unsupported operator nested inside a logical operator', () => {
    expect(() =>
      makeWhereClause({
        $and: [{ type: 'file' }, { name: { $regex: '^foo' } }]
      })
    ).toThrow(UnsupportedMangoSelectorError)
  })

  it('rejects a list operator whose operand is not an array', () => {
    for (const operator of ['$in', '$nin', '$all']) {
      expect(() => makeWhereClause({ tags: { [operator]: 'a' } })).toThrow(
        UnsupportedMangoSelectorError
      )
    }
  })

  it('rejects a non-finite number', () => {
    for (const value of [NaN, Infinity, -Infinity]) {
      expect(() => makeWhereClause({ size: { $gt: value } })).toThrow(
        UnsupportedMangoSelectorError
      )
    }
  })

  it('rejects a logical operator whose sub-selectors are all empty', () => {
    expect(() => makeWhereClause({ $or: [{}, {}] })).toThrow(
      UnsupportedMangoSelectorError
    )
  })

  // SQL never matches NULL through IN / NOT IN, so a null member has to become
  // an explicit IS NULL test.
  it('tests null members of $in explicitly', () => {
    expect(makeWhereClause({ name: { $in: [null] } })).toBe(
      "DELETED = 0 AND (json_extract(data, '$.name') IS NULL)"
    )
    expect(makeWhereClause({ name: { $in: ['a', null] } })).toBe(
      "DELETED = 0 AND ((json_extract(data, '$.name') IN ('a') OR json_extract(data, '$.name') IS NULL))"
    )
  })

  it('excludes documents missing the field when $nin excludes null', () => {
    expect(makeWhereClause({ name: { $nin: ['a', null] } })).toBe(
      "DELETED = 0 AND ((json_extract(data, '$.name') NOT IN ('a') AND json_extract(data, '$.name') IS NOT NULL))"
    )
  })

  it('keeps documents missing the field when $nin does not mention null', () => {
    expect(makeWhereClause({ name: { $nin: ['a'] } })).toBe(
      "DELETED = 0 AND ((json_extract(data, '$.name') IS NULL OR json_extract(data, '$.name') NOT IN ('a')))"
    )
  })

  it('reads a bare string sort entry as ascending on that field', () => {
    expect(makeSortClause(['name'])).toBe("json_extract(data, '$.name') ASC")
  })

  it('drops an empty sub-selector from a logical operator', () => {
    expect(makeWhereClause({ $or: [{}, { type: 'file' }] })).toBe(
      "DELETED = 0 AND ((json_extract(data, '$.type') = 'file'))"
    )
  })
})
