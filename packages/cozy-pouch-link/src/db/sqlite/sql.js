import { normalizeDoc } from '../../jsonapi'
import { getCozyPouchData } from '../helpers'

const MANGO_TO_SQL_OP = {
  $eq: '=',
  $ne: '!=',
  $gt: '>',
  $gte: '>=',
  $lt: '<',
  $lte: '<=',
  $in: 'IN',
  $nin: 'NOT IN',
  $exists: 'IS'
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

// Quote a value for inline SQL. String single quotes are doubled ('' ) so a
// value like "l'ete.txt" cannot break out of the literal (SQL error) or inject.
const quoteSQLValue = value => {
  if (typeof value === 'string') {
    return `'${value.replace(/'/g, "''")}'`
  }
  return value
}

const parseCondition = (field, condition, columnName) => {
  const conditions = []

  const sqlField = transformMangoFieldInJSONSQL(field, columnName)
  if (typeof condition === 'object' && !Array.isArray(condition)) {
    for (const operator in condition) {
      let sqlOp = MANGO_TO_SQL_OP[operator]

      if (operator === '$in' || operator === '$nin') {
        const list = condition[operator] || []
        if (list.length === 0) {
          // "IN ()" is a syntax error. $in [] matches nothing (0 = false),
          // $nin [] matches everything (1 = true).
          conditions.push(operator === '$in' ? '0' : '1')
        } else {
          const values = list.map(quoteSQLValue).join(', ')
          conditions.push(`${sqlField} ${sqlOp} (${values})`)
        }
      } else if (operator === '$exists') {
        const value = condition[operator]
        if (value) {
          sqlOp += ' NOT NULL'
        } else {
          sqlOp += ' NULL'
        }
        conditions.push(`${sqlField} ${sqlOp}`)
      } else {
        if (operator === '$gt' && condition[operator] === null) {
          // Special case for $gt: null conditions
          conditions.push(`${sqlField} IS NOT NULL`)
        } else {
          conditions.push(
            `${sqlField} ${sqlOp} ${quoteSQLValue(condition[operator])}`
          )
        }
      }
    }
  } else {
    conditions.push(`${sqlField} = ${quoteSQLValue(condition)}`)
  }

  return conditions.join(' AND ')
}

const parseLogicalOperator = (operator, conditionsArray, columnName) => {
  const sqlOperator = operator === '$and' ? 'AND' : 'OR'
  const parsedConditions = conditionsArray.map(
    cond => `(${mangoSelectorToSQL(cond, columnName).replace(/^WHERE /, '')})`
  )
  return parsedConditions.join(` ${sqlOperator} `)
}

// PouchDB keeps a document's id and rev in by-sequence COLUMNS and strips them
// from the stored JSON, so json_extract(json, '$._id') is NULL on every row. A
// selector on `_id` would therefore match nothing it is meant to match, and a
// `$nin` on it would filter nothing at all.
const PHYSICAL_COLUMNS = { _id: 'doc_id', _rev: 'rev' }

const transformMangoFieldInJSONSQL = (field, columnName = 'data') => {
  const physicalColumn = PHYSICAL_COLUMNS[field]
  if (physicalColumn) {
    // `data` is the query alias, where by-sequence is joined with document-store
    // and the column needs qualifying; `json` is the CREATE INDEX context, which
    // is scoped to by-sequence alone and must stay unqualified.
    return columnName === 'json'
      ? physicalColumn
      : `'by-sequence'.${physicalColumn}`
  }
  return `json_extract(${columnName}, '$.${field}')`
}

export const mangoSelectorToSQL = (selector, columnName) => {
  const conditions = []

  for (const key in selector) {
    if (key === '$and' || key === '$or') {
      conditions.push(parseLogicalOperator(key, selector[key], columnName))
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
      const attribute = Object.keys(sort)[0]
      const order = String(sort[attribute]).toUpperCase()
      return `json_extract(data, '$.${attribute}') ${order}`
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
  const jsonAttributes = fieldsToIndex.map(
    field => `json_extract(json, '$.${field}')`
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
