const path = require('path')

const distDir = path.join(__dirname, '..', 'dist')
const queriesModule = require(path.join(distDir, 'store', 'queries.js'))
const dsl = require(path.join(distDir, 'queries', 'dsl.js'))
const {
  defaultPerformanceApi
} = require(path.join(distDir, 'performances', 'defaultPerformanceApi.js'))

const siftPath = require.resolve('sift', { paths: [path.join(__dirname, '..')] })
const siftModule = require(siftPath)
const sift = siftModule.default || siftModule

const queries = queriesModule.default
const { receiveQueryResult, updateData } = queriesModule
const { Q } = dsl

const DOCTYPE = 'io.cozy.files'
const N_DOCS = 10000
const N_GET_BY_ID = 1000
const N_SELECTOR = 200
const N_DIRS = 50

const makeFilesFixture = nDocs => {
  const docs = []
  const slice = {}
  for (let i = 0; i < nDocs; i++) {
    const _id = `file_${i}`
    const doc = {
      _id,
      id: _id,
      _type: DOCTYPE,
      _rev: `1-${i}`,
      type: 'file',
      name: `document-${i}.txt`,
      dir_id: `dir_${i % N_DIRS}`,
      class: 'text',
      size: 1024 + i,
      updated_at: '2024-01-01T00:00:00Z'
    }
    docs.push(doc)
    slice[_id] = doc
  }
  return { docs, documents: { [DOCTYPE]: slice } }
}

const makeQueryState = (id, definition, data) => ({
  id,
  definition,
  fetchStatus: 'loaded',
  isFetching: null,
  lastFetch: 1,
  lastUpdate: 1,
  hasMore: false,
  count: data.length,
  fetchedPagesCount: 1,
  data,
  options: null
})

const makeGetByIdHeavyState = () => {
  const state = {}
  for (let i = 0; i < N_GET_BY_ID; i++) {
    const docId = `file_${i}`
    const definition = Q(DOCTYPE).getById(docId)
    const queryId = `${DOCTYPE}/${docId}`
    state[queryId] = makeQueryState(queryId, definition, [docId])
  }
  for (let i = 0; i < N_SELECTOR; i++) {
    const definition = Q(DOCTYPE).where({
      dir_id: `dir_${i % N_DIRS}`,
      type: 'file',
      name: { $gt: null }
    })
    const queryId = `selector_${i}`
    state[queryId] = makeQueryState(queryId, definition, [])
  }
  return state
}

const getSpecs = () => {
  const { docs, documents } = makeFilesFixture(N_DOCS)

  const heavyState = makeGetByIdHeavyState()
  const receiveAction = receiveQueryResult(null, { data: docs })

  const selectorDefinition = Q(DOCTYPE).where({
    dir_id: 'dir_7',
    type: 'file',
    name: { $gt: null }
  })
  const selectorQuery = makeQueryState('selector_bench', selectorDefinition, [])

  const siftSelector = sift({
    class: 'text',
    dir_id: 'dir_7',
    name: { $exists: true }
  })

  return [
    {
      name: 'store-queries:receiveQueryResult-getById-heavy',
      description:
        'queries() reducer applying a RECEIVE_QUERY_RESULT of 10k io.cozy.files ' +
        'against 1000 getById queries + 200 selector queries',
      warmup: 1,
      runs: 5,
      regressionThresholdPct: 25,
      run: () => {
        queries(defaultPerformanceApi, heavyState, receiveAction, documents, true)
      }
    },
    {
      name: 'store-queries:selector-eval-folder-listing',
      description:
        'updateData() evaluating a { dir_id, type, name: { $gt: null } } ' +
        'folder-listing selector over 10k documents (sift + $gtnull)',
      warmup: 3,
      runs: 15,
      run: () => {
        updateData(selectorQuery, docs, documents)
      }
    },
    {
      name: 'store-queries:sift-compiled-exec-10k',
      description:
        'Pure sift canary: execute a pre-compiled selector over 10k documents',
      warmup: 3,
      runs: 15,
      run: () => {
        let matched = 0
        for (let i = 0; i < docs.length; i++) {
          if (siftSelector(docs[i])) {
            matched++
          }
        }
        return matched
      }
    }
  ]
}

module.exports = { getSpecs }
