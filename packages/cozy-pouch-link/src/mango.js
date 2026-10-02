import head from 'lodash/head'

const indexes = {}

/**
 * Process a partial filter to generate a string key
 *
 * /!\ Warning: this method is similar to cozy-stack-client mangoIndex.makeKeyFromPartialFilter()
 * If you edit this method, please check if the change is also needed in mangoIndex file
 *
 * @param {object} condition - An object representing the partial filter or a sub-condition of the partial filter
 * @returns {string} - The string key of the processed partial filter
 */
export const makeKeyFromPartialFilter = condition => {
  if (typeof condition !== 'object' || condition === null) {
    return String(condition)
  }

  const conditions = Object.entries(condition).map(([key, value]) => {
    if (
      Array.isArray(value) &&
      value.every(subObj => typeof subObj === 'string')
    ) {
      return `${key}_(${value.join('_')})`
    } else if (Array.isArray(value)) {
      return `(${value
        .map(subCondition => `${makeKeyFromPartialFilter(subCondition)}`)
        .join(`)_${key}_(`)})`
    } else if (typeof value === 'object') {
      return `${key}_${makeKeyFromPartialFilter(value)}`
    } else {
      return `${key}_${value}`
    }
  })

  return conditions.join(')_and_(')
}

/**
 * Name an index, based on its indexed fields and partial filter.
 *
 * It follows this naming convention:
 * `by_{indexed_field1}_and_{indexed_field2}_filter_({partial_filter.key1}_{partial_filter.value1})_and_({partial_filter.key2}_{partial_filter.value2})`
 *
 * /!\ Warning: this method is similar to cozy-stack-client mangoIndex.getIndexNameFromFields()
 * If you edit this method, please check if the change is also needed in mangoIndex file
 *
 * @param {Array<string>} fields - The indexed fields
 * @param {object} [partialFilter] - The partial filter
 * @returns {string} The index name, built from the fields
 */
export const getIndexNameFromFields = (fields, partialFilter) => {
  const indexName = `by_${fields.join('_and_')}`

  if (partialFilter) {
    const filterKey = makeKeyFromPartialFilter(partialFilter)
    return sanitizeIndexName(`${indexName}_filter_(${filterKey})`)
  }

  return indexName
}

/**
 * Sanitize an index name to remove characters that are not compatible with
 * CouchDB design document naming conventions (e.g. "/" breaks CouchDB > 3.3.3)
 * https://github.com/linagora/cozy-client/issues/1667
 *
 * @param {string} name - The index name to sanitize
 * @returns {string} The sanitized index name
 */
const sanitizeIndexName = name => {
  return name.replace(/%/g, '%25').replace(/\//g, '%2F')
}

/**
 * @function
 * @description Compute fields that should be indexed for a mango
 * query to work
 *
 * @private
 * @param  {import('./types').MangoQueryOptions} options - Mango query options
 * @returns {Array} - Fields to index
 */
const defaultSelector = { _id: { $gt: null } }
export const getIndexFieldsFromFind = (
  /** @type {import('./types').MangoQueryOptions} */ {
    selector = defaultSelector,
    sort = [],
    partialFilter
  }
) => {
  return Array.from(
    new Set([
      ...sort.map(sortOption => head(Object.keys(sortOption))),
      ...(selector ? Object.keys(selector) : []),
      ...(partialFilter ? Object.keys(partialFilter) : [])
    ])
  )
}

/**
 * Create the PouchDB index if not existing
 *
 * @param {object} db - The pouch db
 * @param {Array} fields - Fields to index
 * @param {object} indexOption - Options for the index
 * @param {object} [indexOption.partialFilter] - partialFilter
 * @param {string} [indexOption.indexName] - indexName
 * @param {string} [indexOption.doctype] - doctype
 * @returns {Promise<import('./types').PouchDbIndex>}
 */
export const createIndex = async (
  db,
  fields,
  { partialFilter, indexName, doctype } = {}
) => {
  const absName = `${doctype}/${indexName}`

  const index = await db.createIndex({
    index: {
      fields,
      ddoc: indexName,
      indexName,
      partial_filter_selector: partialFilter
    }
  })
  indexes[absName] = index
  return index
}

/**
 * Retrieve the PouchDB index if exist, undefined otherwise
 *
 * @param {string} doctype - The query's doctype
 * @param {import('./types').MangoQueryOptions} options - The find options
 * @param {string} indexName - The index name
 * @returns {import('./types').PouchDbIndex | undefined}
 */
export const findExistingIndex = (doctype, options, indexName) => {
  const absName = `${doctype}/${indexName}`
  return indexes[absName]
}

export const getIndexFields = ({
  selector,
  sort,
  partialFilter,
  indexedFields
}) => {
  let fieldsToIndex = indexedFields
  if (!indexedFields) {
    fieldsToIndex = getIndexFieldsFromFind({ selector, sort, partialFilter })
  } else if (partialFilter) {
    // Some pouch adapters does not support partialIndex, e.g. with websql in react-native
    // Therefore, we need to force the indexing the partialIndex fields to ensure they will be
    // included in the actual index. Thanks to this, docs with missing fields will be excluded
    // from the index.
    // Note the $exists: false case should be handled in-memory.
    fieldsToIndex = Array.from(
      new Set([...indexedFields, ...Object.keys(partialFilter)])
    )
    // FIXME: should properly handle n-level attributes
    fieldsToIndex = indexedFields.filter(
      field => field !== '$and' && field !== '$or'
    )
  }
  return fieldsToIndex
}

export const getIndexName = ({
  selector,
  sort,
  indexedFields,
  partialFilter
}) => {
  let fieldsToIndex = indexedFields
  if (!indexedFields) {
    fieldsToIndex = getIndexFieldsFromFind({ selector, sort, partialFilter })
  } else if (partialFilter) {
    // Some pouch adapters does not support partialIndex, e.g. with websql in react-native
    // Therefore, we need to force the indexing the partialIndex fields to ensure they will be
    // included in the actual index. Thanks to this, docs with missing fields will be excluded
    // from the index.
    // Note the $exists: false case should be handled in-memory.
    fieldsToIndex = Array.from(
      new Set([...indexedFields, ...Object.keys(partialFilter)])
    )
    // FIXME: should properly handle n-level attributes
    fieldsToIndex = indexedFields.filter(
      field => field !== '$and' && field !== '$or'
    )
  }
  const indexName = getIndexNameFromFields(fieldsToIndex, partialFilter)
  return indexName
}
