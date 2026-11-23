import flatten from 'lodash/flatten'
import groupBy from 'lodash/groupBy'
import isEqual from 'lodash/isEqual'
import mapValues from 'lodash/mapValues'
import uniq from 'lodash/uniq'
import uniqWith from 'lodash/uniqWith'

import { QueryDefinition } from './dsl'

const isIdQuery = query => query.id || query.ids

/**
 * Optimize queries on a single doctype
 *
 * @param  {QueryDefinition[]} queries - Queries of a same doctype
 * @returns {QueryDefinition[]} Optimized queries
 * @private
 */
const optimizeDoctypeQueries = queries => {
  const { idQueries = [], others = [] } = groupBy(queries, q =>
    isIdQuery(q) ? 'idQueries' : 'others'
  )
  const groupedIdQueries =
    idQueries.length > 0
      ? new QueryDefinition({
          doctype: queries[0].doctype,
          ids: uniq(flatten(idQueries.map(q => q.id || q.ids)))
        })
      : []

  // Deduplicate before concataining
  return uniqWith(others, isEqual).concat(groupedIdQueries)
}

/**
 * Reduce the number of queries used to fetch documents.
 *
 * - Deduplication of queries
 * - Groups id queries
 *
 * @param  {QueryDefinition[]} queries - Queries to optimized
 * @returns {QueryDefinition[]} Optimized queries
 * @private
 */
const optimizeQueries = queries => {
  const byDoctype = groupBy(queries, q => q.doctype)
  return flatten(Object.values(mapValues(byDoctype, optimizeDoctypeQueries)))
}

export default optimizeQueries
