const fs = require('fs')
const path = require('path')

const { runSuite } = require('./harness')
const { getSpecs: getStoreQueriesSpecs } = require('./store-queries.bench')
const { getSpecs: getNormalizeDocsSpecs } = require('./normalize-docs.bench')

const getSpecs = () => [...getStoreQueriesSpecs(), ...getNormalizeDocsSpecs()]

const parseOut = argv => {
  const flag = argv.find(arg => arg.startsWith('--out='))
  if (flag) {
    return path.resolve(flag.slice('--out='.length))
  }
  return path.join(__dirname, 'results', 'latest.json')
}

const main = () => {
  const outPath = parseOut(process.argv.slice(2))

  const benchmarks = runSuite(getSpecs())

  const output = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    node: process.version,
    platform: `${process.platform}-${process.arch}`,
    benchmarks
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2))

  for (const bench of benchmarks) {
    const ops =
      bench.opsPerSec >= 1
        ? bench.opsPerSec.toFixed(1)
        : bench.opsPerSec.toFixed(3)
    console.log(
      `${bench.name}: ${bench.medianMs.toFixed(3)} ms (median), ${ops} ops/s`
    )
  }
  console.log(`\nWrote ${outPath}`)
}

main()
