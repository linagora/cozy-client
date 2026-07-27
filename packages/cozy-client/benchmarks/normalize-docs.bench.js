const path = require('path')

const pouchDist = path.join(__dirname, '..', '..', 'cozy-pouch-link', 'dist')
const jsonapi = require(path.join(pouchDist, 'jsonapi.js'))

const { normalizeDocs, resetAllPaths } = jsonapi

const DOCTYPE = 'io.cozy.files'
const N_FILES = 10000
const N_DIRS = 200

// queryFileById (hit when a file's parent path is not cached) calls
// client.fetchQueryAndGetFromState. Resolve it trivially so the benchmark
// never touches the network and the fire-and-forget promise is harmless.
const client = {
  fetchQueryAndGetFromState: () => Promise.resolve({ data: undefined })
}

const buildTemplate = () => {
  const dirs = []
  for (let d = 0; d < N_DIRS; d++) {
    dirs.push({
      _id: `dir_${d}`,
      _rev: `1-${d}`,
      _type: DOCTYPE,
      type: 'directory',
      dir_id: 'io.cozy.files.root-dir',
      name: `folder-${d}`,
      path: `/folder-${d}`
    })
  }
  const files = []
  for (let i = 0; i < N_FILES; i++) {
    files.push({
      _id: `file_${i}`,
      _rev: `1-${i}`,
      _type: DOCTYPE,
      type: 'file',
      dir_id: `dir_${i % N_DIRS}`,
      name: `document-${i}.txt`
    })
  }
  // Directories land in the middle: replication order is not tree-ordered.
  const half = Math.floor(N_FILES / 2)
  return [...files.slice(0, half), ...dirs, ...files.slice(half)]
}

const template = buildTemplate()

const freshBatch = () => template.map(doc => ({ ...doc }))

const getSpecs = () => [
  {
    name: 'pouch-normalize:files-cold-cache',
    description:
      'normalizeDocs over 200 dirs + 10k io.cozy.files with a cold path ' +
      'cache: guards the per-file parent-path resolution done on a first sync',
    warmup: 1,
    runs: 5,
    regressionThresholdPct: 25,
    run: () => {
      resetAllPaths()
      normalizeDocs(client, DOCTYPE, freshBatch())
    }
  }
]

module.exports = { getSpecs }
