import { normalizeDoc } from '../../jsonapi'
import { getCozyPouchData } from '../helpers'
import { UnsupportedMangoSelectorError } from '../../errors'

// Binary operators with a direct SQL equivalent. Everything else needs its own
// SQL shape and is handled explicitly in parseCondition.
const MANGO_TO_SQL_OP = {
  $eq: '=',
  $gt: '>',
  $gte: '>=',
  $lt: '<',
  $lte: '<='
}

// Mango and SQLite do not spell types the same way: json_type() reports integers
// and reals separately, and booleans as 'true'/'false'.
const MANGO_TYPE_TO_JSON_TYPES = {
  null: ['null'],
  boolean: ['true', 'false'],
  number: ['integer', 'real'],
  string: ['text'],
  array: ['array'],
  object: ['object']
}

const extractRevPrefix = rev => {
  if (!rev) {
    return 0
  }
  const prefixStr = rev.split('-')[0]
  return prefixStr ? parseInt(prefixStr) : 0
}

export const keepDocWitHighestRev = docs => {
  if (!docs || docs.length < 1) {
    return null
  }
  let highestDocRev = {
    doc: docs[0],
    revPrefix: extractRevPrefix(docs[0]._rev)
  }
  for (let i = 0; i < docs.length; i++) {
    const revPrefix = extractRevPrefix(docs[i]._rev)
    if (revPrefix > highestDocRev.revPrefix) {
      highestDocRev = { doc: docs[i], revPrefix }
    }
  }
  return highestDocRev.doc
}

export const parseResults = (
  client,
  result,
  doctype,
  { isSingleDoc = false, skip = 0, limit = -1 } = {}
) => {
  let parsedResults = []
  for (let i = 0; i < result.rows.length; i++) {
    const item = result.rows.item(i)
    const doc = JSON.parse(item['data'])

    // Handle special case for docs with `cozyPouchData`
    const cozyPouchData = getCozyPouchData(doc)
    if (cozyPouchData) {
      return { data: cozyPouchData }
    }
    doc._id = item.doc_id
    doc._rev = item.rev
    doc._type = doctype
    normalizeDoc(client, doctype, doc)
    parsedResults.push(doc)
  }
  if (parsedResults.length === 0) {
    return { data: [] }
  }
  if (isSingleDoc) {
    if (parsedResults.length > 1) {
      const doc = keepDocWitHighestRev(parsedResults)
      return { data: doc }
    }
    return { data: parsedResults[0] }
  }
  // XXX - Ideally we should have the total number of rows in the database to have a reliable
  // next parameter, but we prefer to avoid this computation for performances.
  // So let's rely on the total number of returned rows - if next is true, the last paginated
  // query should have less results than the limit, thanks to the offset
  let next = false
  if (limit !== -1 && parsedResults.length >= limit) {
    next = true
  }
  return {
    data: parsedResults,
    meta: { count: parsedResults.length },
    skip,
    next
  }
}

// Single quotes are doubled ('') so a value like "l'ete.txt" cannot break out of
// the literal (SQL error) or inject.
const escapeSQLString = str => str.replace(/'/g, "''")

// Quote a value for inline SQL.
// $in, $nin and $all are the operators whose operand is a list. A non-array
// operand would reach .map / .length and either throw a TypeError or, worse,
// silently iterate a string's characters.
const requireArrayOperand = (operator, field, value) => {
  if (!Array.isArray(value)) {
    throw new UnsupportedMangoSelectorError(
      `${operator} on "${field}" expects an array, got ${JSON.stringify(value)}`
    )
  }
  return value
}

const joinTests = (tests, operator) =>
  tests.length > 1 ? `(${tests.join(` ${operator} `)})` : tests[0]

const quoteSQLValue = value => {
  if (typeof value === 'string') {
    return `'${escapeSQLString(value)}'`
  }
  if (typeof value === 'number' && !Number.isFinite(value)) {
    // NaN and +/-Infinity have no SQL literal: they would be interpolated as the
    // bare words "NaN" / "Infinity", which SQLite reads as column names.
    throw new UnsupportedMangoSelectorError(
      `Cannot express ${String(value)} as a SQL value`
    )
  }
  if (value === undefined || (typeof value === 'object' && value !== null)) {
    // undefined, objects and arrays have no SQL literal form. A template
    // literal would stringify undefined to the word "undefined" - the very
    // failure this translator exists to make impossible - and an object to
    // "[object Object]".
    throw new UnsupportedMangoSelectorError(
      `Cannot express ${JSON.stringify(value)} as a SQL value`
    )
  }
  return value
}

// Mango forbids mixing operators and field names in the same object, so a single
// $-prefixed key is enough to tell an operator object ({ $gt: 1 }) from a nested
// document selector ({ b: 'x' }).
const isOperatorObject = obj =>
  Object.keys(obj).some(key => key.startsWith('$'))

const isPlainObject = value =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

// json_extract yields SQL NULL for a missing path, and NOT NULL is NULL rather
// than true. CouchDB's $not / $nor match documents where the inner condition
// merely fails to hold, missing field included, so resolve the unknown to false
// before negating.
const negate = sql => `NOT IFNULL((${sql}), 0)`

// json_each / json_type / json_array_length take (column, path) rather than a
// pre-extracted value: json_extract unwraps a JSON string into bare SQL text,
// which those functions then fail to re-parse as JSON.
const makeJSONFunctionArgs = (field, columnName) =>
  field ? `${columnName}, '$.${escapeSQLString(field)}'` : columnName

// "at least one element of the array satisfies elementWhere", where the element
// is bound to `elem.value`.
const makeArrayElementExists = (field, columnName, elementWhere) =>
  `EXISTS (SELECT 1 FROM json_each(${makeJSONFunctionArgs(
    field,
    columnName
  )}) AS elem WHERE ${elementWhere})`

// A sub-selector made of operators applies to the array element itself
// ({ tags: { $elemMatch: { $eq: 'a' } } }); one made of field names applies to
// the element's subfields ({ referenced_by: { $elemMatch: { type: 'album' } } }).
const parseElemMatch = (field, subSelector, columnName) => {
  if (!isPlainObject(subSelector)) {
    throw new UnsupportedMangoSelectorError(
      `$elemMatch on "${field}" expects a selector`
    )
  }
  const elementColumn = 'elem.value'
  const where = isOperatorObject(subSelector)
    ? parseCondition('', subSelector, elementColumn)
    : mangoSelectorToSQL(subSelector, elementColumn)
  return makeArrayElementExists(field, columnName, where)
}

const parseCondition = (field, condition, columnName = 'data') => {
  const conditions = []
  const sqlField = transformMangoFieldInJSONSQL(field, columnName)

  if (!isPlainObject(condition)) {
    // Implicit equality. Routed through $eq so `null` gets the same IS NULL
    // treatment as its explicit form.
    return parseCondition(field, { $eq: condition }, columnName)
  }

  if (!isOperatorObject(condition)) {
    // A nested document means subfield equality: { a: { b: 'x' } } selects the
    // same documents as { 'a.b': 'x' }.
    for (const subField in condition) {
      conditions.push(
        parseCondition(`${field}.${subField}`, condition[subField], columnName)
      )
    }
    return conditions.join(' AND ')
  }

  for (const operator in condition) {
    const value = condition[operator]
    const sqlOp = MANGO_TO_SQL_OP[operator]

    // json_extract returns SQL NULL both for a JSON null and for a missing path,
    // so every null comparison needs an IS [NOT] NULL form: `= NULL` and
    // `!= NULL` are NULL, never true.
    if (operator === '$eq' && value === null) {
      conditions.push(`${sqlField} IS NULL`)
    } else if ((operator === '$gt' || operator === '$ne') && value === null) {
      conditions.push(`${sqlField} IS NOT NULL`)
    } else if (value === null && sqlOp) {
      // The remaining range operators have no meaningful null form here: `x >=
      // NULL` is NULL for every row, so the query would silently match nothing.
      // CouchDB orders null against every other type, which SQL comparison does
      // not, so hand these to pouch-find rather than approximate them.
      throw new UnsupportedMangoSelectorError(
        `Cannot compare "${field}" to null with "${operator}"`
      )
    } else if (operator === '$ne') {
      // CouchDB matches a missing field: `x != v` is NULL, not true, when
      // json_extract finds nothing, so the absent case needs its own branch.
      conditions.push(
        `(${sqlField} IS NULL OR ${sqlField} != ${quoteSQLValue(value)})`
      )
    } else if (operator === '$in' || operator === '$nin') {
      const list = requireArrayOperand(operator, field, value)
      if (list.length === 0) {
        // "IN ()" is a syntax error. $in [] matches nothing (0 = false),
        // $nin [] matches everything (1 = true).
        conditions.push(operator === '$in' ? '0' : '1')
      } else {
        // SQL never matches NULL through IN / NOT IN, so a null member has to
        // become an explicit IS NULL test rather than sit in the list.
        const hasNull = list.some(item => item === null)
        const values = list.filter(item => item !== null).map(quoteSQLValue)
        const tests = []
        if (operator === '$in') {
          if (values.length > 0) {
            tests.push(`${sqlField} IN (${values.join(', ')})`)
          }
          if (hasNull) {
            tests.push(`${sqlField} IS NULL`)
          }
          conditions.push(joinTests(tests, 'OR'))
        } else {
          if (values.length > 0) {
            tests.push(`${sqlField} NOT IN (${values.join(', ')})`)
          }
          // $nin keeps documents missing the field, matching CouchDB - unless
          // null is itself excluded, which is exactly what those rows hold.
          tests.push(
            hasNull ? `${sqlField} IS NOT NULL` : `${sqlField} IS NULL`
          )
          conditions.push(
            hasNull ? joinTests(tests, 'AND') : joinTests(tests.reverse(), 'OR')
          )
        }
      }
    } else if (operator === '$exists') {
      conditions.push(`${sqlField} IS ${value ? 'NOT NULL' : 'NULL'}`)
    } else if (operator === '$not') {
      conditions.push(negate(parseCondition(field, value, columnName)))
    } else if (operator === '$elemMatch') {
      conditions.push(parseElemMatch(field, value, columnName))
    } else if (operator === '$all') {
      const list = requireArrayOperand(operator, field, value)
      // One scan per value: SQLite has no "contains all of" primitive, and the
      // values may sit at any positions in the array.
      conditions.push(
        list.length === 0
          ? '1'
          : list
              .map(item =>
                makeArrayElementExists(
                  field,
                  columnName,
                  `elem.value = ${quoteSQLValue(item)}`
                )
              )
              .join(' AND ')
      )
    } else if (operator === '$size') {
      conditions.push(
        `json_array_length(${makeJSONFunctionArgs(
          field,
          columnName
        )}) = ${quoteSQLValue(value)}`
      )
    } else if (operator === '$mod') {
      if (!Array.isArray(value) || value.length !== 2) {
        throw new UnsupportedMangoSelectorError(
          `$mod on "${field}" expects a [divisor, remainder] pair`
        )
      }
      // The numeric guard is not decoration: SQLite coerces a non-numeric
      // operand of % to 0, so a text field would match any {$mod: [d, 0]}.
      conditions.push(
        `(json_type(${makeJSONFunctionArgs(
          field,
          columnName
        )}) IN (${MANGO_TYPE_TO_JSON_TYPES.number
          .map(quoteSQLValue)
          .join(', ')}) AND ${sqlField} % ${quoteSQLValue(
          value[0]
        )} = ${quoteSQLValue(value[1])})`
      )
    } else if (operator === '$type') {
      const jsonTypes = MANGO_TYPE_TO_JSON_TYPES[value]
      if (!jsonTypes) {
        throw new UnsupportedMangoSelectorError(
          `Unsupported mango $type "${value}" on field "${field}"`
        )
      }
      conditions.push(
        `json_type(${makeJSONFunctionArgs(
          field,
          columnName
        )}) IN (${jsonTypes.map(quoteSQLValue).join(', ')})`
      )
    } else if (sqlOp) {
      conditions.push(`${sqlField} ${sqlOp} ${quoteSQLValue(value)}`)
    } else {
      // The single point where an untranslatable selector is caught. $regex ends
      // up here - op-sqlite exposes no way to register a REGEXP function - along
      // with any operator this translator does not know. Throwing rather than
      // interpolating an undefined operator is what guarantees the generated SQL
      // never contains "undefined"; SQLiteQueryEngine turns it into a pouch-find
      // fallback.
      throw new UnsupportedMangoSelectorError(
        `Unsupported mango operator "${operator}" on field "${field}"`
      )
    }
  }

  return conditions.join(' AND ')
}

const parseLogicalOperator = (operator, conditionsArray, columnName) => {
  if (!Array.isArray(conditionsArray) || conditionsArray.length === 0) {
    throw new UnsupportedMangoSelectorError(
      `${operator} expects a non-empty array of selectors`
    )
  }
  const sqlOperator = operator === '$and' ? 'AND' : 'OR'
  // An empty sub-selector translates to an empty string; wrapping it would emit
  // "()" and break the statement.
  const parsedConditions = conditionsArray
    .map(cond => mangoSelectorToSQL(cond, columnName))
    .filter(Boolean)
    .map(sql => `(${sql})`)
  if (parsedConditions.length === 0) {
    throw new UnsupportedMangoSelectorError(
      `${operator} expects at least one translatable selector`
    )
  }
  return parsedConditions.join(` ${sqlOperator} `)
}

// PouchDB keeps a document's id and rev in by-sequence COLUMNS and strips them
// from the stored JSON, so json_extract(json, '$._id') is NULL on every row. A
// selector on `_id` would therefore match nothing it is meant to match, and a
// `$nin` on it would filter nothing at all.
const PHYSICAL_COLUMNS = { _id: 'doc_id', _rev: 'rev' }

const transformMangoFieldInJSONSQL = (field, columnName = 'data') => {
  const physicalColumn = PHYSICAL_COLUMNS[field]
  // Only at document level: inside a json_each element (`elem.value`) the row
  // is an array item, which has no doc_id / rev of its own.
  if (physicalColumn && (columnName === 'data' || columnName === 'json')) {
    // `data` is the query alias, where by-sequence is joined with
    // document-store and the column needs qualifying; `json` is the CREATE
    // INDEX context, scoped to by-sequence alone, which must stay unqualified.
    return columnName === 'json'
      ? physicalColumn
      : `'by-sequence'.${physicalColumn}`
  }
  if (!field) {
    // No path: the value IS the column (a json_each element, for $elemMatch on
    // an array of scalars). json_extract would re-parse it as JSON and fail on a
    // bare string.
    return columnName
  }
  return `json_extract(${columnName}, '$.${escapeSQLString(field)}')`
}

/**
 * Translate a mango selector into a SQL boolean expression.
 *
 * @param {object} selector - The mango selector
 * @param {string} [columnName] - The JSON column the paths are resolved against
 * @returns {string} The SQL expression, never containing "undefined"
 * @throws {UnsupportedMangoSelectorError} When the selector uses a mango feature
 * this translator cannot express in SQL
 */
export const mangoSelectorToSQL = (selector, columnName = 'data') => {
  if (!isPlainObject(selector)) {
    throw new UnsupportedMangoSelectorError(
      `Expected a selector, got ${JSON.stringify(selector)}`
    )
  }
  const conditions = []

  for (const key in selector) {
    if (key === '$and' || key === '$or') {
      conditions.push(parseLogicalOperator(key, selector[key], columnName))
    } else if (key === '$nor') {
      // "none of these match" is the negation of the $or.
      conditions.push(
        negate(parseLogicalOperator('$or', selector[key], columnName))
      )
    } else if (key === '$not') {
      conditions.push(negate(mangoSelectorToSQL(selector[key], columnName)))
    } else {
      conditions.push(parseCondition(key, selector[key], columnName))
    }
  }

  return conditions.length > 0 ? `${conditions.join(' AND ')}` : ''
}

export const makeWhereClause = (selector, columnName) => {
  let baseWhere = 'DELETED = 0'
  if (!selector) {
    return baseWhere
  }
  const mangoWhere = mangoSelectorToSQL(selector, columnName)
  if (!mangoWhere) {
    return baseWhere
  }
  // Parenthesise the mango expression: SQL binds AND tighter than OR, so a
  // top-level $or would otherwise read as "(DELETED = 0 AND a) OR b" and leak
  // deleted docs matching b.
  baseWhere += ` AND (${mangoWhere})`
  return baseWhere
}

export const makeSortClause = mangoSortBy => {
  if (!mangoSortBy || !Array.isArray(mangoSortBy) || mangoSortBy.length < 1) {
    return null
  }
  // Each field carries its own direction; a shared trailing ASC/DESC would sort
  // every field the first entry's way and silently ignore mixed asc/desc sorts.
  return mangoSortBy
    .map(sort => {
      // A bare string is the shorthand for ascending on that field; Object.keys
      // would otherwise read its first index and sort on the JSON path "$.0".
      const entry = typeof sort === 'string' ? { [sort]: 'asc' } : sort
      if (!isPlainObject(entry)) {
        throw new UnsupportedMangoSelectorError(
          `Cannot sort on ${JSON.stringify(sort)}`
        )
      }
      const attribute = Object.keys(entry)[0]
      // ASC/DESC are bare SQL keywords, so the direction cannot be quoted the
      // way a value would be - it has to be whitelisted instead.
      const order =
        String(entry[attribute]).toUpperCase() === 'DESC' ? 'DESC' : 'ASC'
      return `${transformMangoFieldInJSONSQL(attribute)} ${order}`
    })
    .join(', ')
}

export const makeSQLQueryFromMango = ({
  selector,
  sort,
  indexName,
  partialFilter,
  limit = -1,
  skip = 0
}) => {
  let whereClause = makeWhereClause(selector)
  // Restate the partial filter in the query itself. Relying on the partial index
  // alone is unsafe: CREATE INDEX IF NOT EXISTS never rewrites an index built
  // under an older definition, so a stale unfiltered index would silently return
  // the rows the filter is meant to hide.
  if (partialFilter) {
    const partialWhere = mangoSelectorToSQL(partialFilter)
    if (partialWhere) {
      whereClause += ` AND (${partialWhere})`
    }
  }
  const sortClause = makeSortClause(sort)

  // Scan by-sequence via the mango index, then join document-store on its
  // winningseq so only WINNING revisions survive (matches CouchDB mango, which
  // queries the winning rev). `data` aliases 'by-sequence'.json; `deleted` lives
  // only on by-sequence, so the where clause stays unambiguous.
  let sql = [
    `SELECT 'by-sequence'.json AS data, 'by-sequence'.doc_id, 'by-sequence'.rev`,
    `FROM 'by-sequence' INDEXED BY ${indexName}, 'document-store'`,
    `WHERE 'by-sequence'.seq = 'document-store'.winningseq AND ${whereClause}`
  ].join(' ')

  if (skip > 0) {
    sql += ` OFFSET ${skip}`
  }
  if (sortClause) {
    sql += ` ORDER BY ${sortClause}`
  }
  sql += ` LIMIT ${limit}`

  sql += ';'
  return sql
}

export const makeSQLQueryForId = id => {
  // Join document-store on its winningseq so we return the WINNING revision
  // (PouchDB keeps every rev in by-sequence; document-store.winningseq points at
  // the winning one). Both sides are indexed: by-sequence.seq is the PK and the
  // adapter indexes document-store.winningseq.
  const sql = [
    `SELECT 'by-sequence'.json AS data, 'by-sequence'.doc_id, 'by-sequence'.rev`,
    `FROM 'document-store', 'by-sequence'`,
    `WHERE 'by-sequence'.seq = 'document-store'.winningseq`,
    `AND 'document-store'.id = "${id}" AND 'by-sequence'.deleted = 0`,
    `;`
  ].join(' ')
  return sql
}

export const makeSQLQueryForIds = ids => {
  const doc_ids = ids.map(id => `"${id}"`).join(', ')
  const sql = `
    SELECT 'by-sequence'.json AS data, 'by-sequence'.doc_id, 'by-sequence'.rev
    FROM 'document-store', 'by-sequence'
    WHERE 'by-sequence'.seq = 'document-store'.winningseq
    AND 'document-store'.id IN (${doc_ids}) AND 'by-sequence'.deleted = 0;
  `
  return sql
}

export const makeSQLQueryAll = ({ limit = -1, skip = 0 } = {}) => {
  let sql = [
    `SELECT 'by-sequence'.json AS data, 'by-sequence'.doc_id, 'by-sequence'.rev`,
    `FROM 'document-store', 'by-sequence'`,
    `WHERE 'by-sequence'.seq = 'document-store'.winningseq AND 'by-sequence'.deleted=0`,
    `LIMIT ${limit}`
  ].join(' ')
  if (skip > 0) {
    sql += ` OFFSET ${skip}`
  }
  sql += ';'
  return sql
}

export const makeSQLDropIndex = indexName => {
  return `DROP INDEX IF EXISTS '${indexName}';`
}

export const makeSQLCreateMangoIndex = (
  indexName,
  fieldsToIndex,
  { partialFilter }
) => {
  // Escaped like the where clause's paths, so an index covers exactly the
  // expression makeWhereClause emits for the same field.
  // XXX - indexName itself is still interpolated raw here, in makeSQLDropIndex
  // and in makeSQLQueryFromMango's INDEXED BY. The three must agree, so they are
  // left alone together: a field name containing a quote would break index
  // resolution rather than the where clause.
  const jsonAttributes = fieldsToIndex.map(
    field => `json_extract(json, '$.${escapeSQLString(field)}')`
  )
  const jsonIndex = jsonAttributes.join(',')

  let sql = `
    CREATE INDEX IF NOT EXISTS '${indexName}'
    ON 'by-sequence'
    (${jsonIndex})
  `
  if (partialFilter) {
    // `data` only exists as a SELECT alias of 'by-sequence'.json; inside CREATE
    // INDEX the column is `json`. Emitting the alias made every partial index
    // fail with "no such column: data", so the filter was never enforced.
    const whereClause = makeWhereClause(partialFilter, 'json')
    sql += ` WHERE ${whereClause}`
  }
  sql += ';'
  return sql
}

export const makeSQLCreateDocIDIndex = () => {
  // This index is useful for docid queries. It is NOT unique: PouchDB's
  // by-sequence keeps a doc's whole rev history, so several rows can share the
  // same (doc_id, deleted) — the winning rev is picked in JS by
  // keepDocWitHighestRev(). A UNIQUE index here throws on any multi-rev doc.
  const sql = `
    CREATE INDEX IF NOT EXISTS 'by_docid_and_deleted'
    ON 'by-sequence'
    (doc_id, deleted);
  `
  return sql
}

export const makeSQLCreateDeletedIndex = () => {
  // This index is useful for allDocs queries
  const sql = `
    CREATE INDEX IF NOT EXISTS 'by_deleted'
    ON 'by-sequence'
    (deleted);
  `
  return sql
}

export const createMangoIndex = async (
  db,
  indexName,
  fieldsToIndex,
  { partialFilter }
) => {
  const sql = makeSQLCreateMangoIndex(indexName, fieldsToIndex, {
    partialFilter
  })
  const result = await executeSQL(db, sql)
  return result
}

export const deleteIndex = async (db, indexName) => {
  const sql = makeSQLDropIndex(indexName)
  await executeSQL(db, sql)
}

export const executeSQL = async (db, sql) => {
  return db.executeAsync(sql).catch(err => {
    const message = (err && err.message) || String(err)
    // Before the adapter has created the by-sequence table, the earliest
    // queries hit a missing table. That is transient (the table appears once
    // replication first writes), so return empty instead of rejecting uncaught.
    // Lock timeouts are NOT swallowed: WAL + busy_timeout handle contention, and
    // a genuine lock error must surface rather than look like "no documents".
    if (/no such table/i.test(message)) {
      return { rows: { length: 0, item: () => undefined } }
    }
    throw err
  })
}
