const now = () => process.hrtime.bigint()

const toMs = ns => Number(ns) / 1e6

const median = values => {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid]
}

const runBench = spec => {
  const { name, description, warmup = 2, runs = 10, run } = spec

  for (let i = 0; i < warmup; i++) {
    run()
  }

  const samples = []
  for (let i = 0; i < runs; i++) {
    const start = now()
    run()
    samples.push(toMs(now() - start))
  }

  const medianMs = median(samples)
  const minMs = Math.min(...samples)
  const meanMs = samples.reduce((acc, value) => acc + value, 0) / samples.length

  return {
    name,
    description,
    unit: 'ms',
    higherIsBetter: false,
    value: medianMs,
    medianMs,
    minMs,
    meanMs,
    opsPerSec: 1000 / medianMs,
    warmup,
    runs,
    ...(spec.regressionThresholdPct != null
      ? { regressionThresholdPct: spec.regressionThresholdPct }
      : {})
  }
}

const runSuite = specs => specs.map(runBench)

module.exports = { runBench, runSuite, median }
