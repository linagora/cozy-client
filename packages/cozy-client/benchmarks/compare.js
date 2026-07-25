const fs = require('fs')
const path = require('path')

const DEFAULT_THRESHOLD_PCT = 25

const parseArgs = argv => {
  const positional = argv.filter(arg => !arg.startsWith('--'))
  const mdFlag = argv.find(arg => arg.startsWith('--md='))
  const thresholdFlag = argv.find(arg => arg.startsWith('--threshold='))
  return {
    basePath: positional[0],
    prPath: positional[1],
    mdPath: mdFlag ? path.resolve(mdFlag.slice('--md='.length)) : null,
    threshold: thresholdFlag
      ? Number(thresholdFlag.slice('--threshold='.length))
      : DEFAULT_THRESHOLD_PCT
  }
}

const readJson = filePath => {
  if (!filePath || !fs.existsSync(filePath)) {
    return null
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch (err) {
    return null
  }
}

const indexByName = report => {
  const map = {}
  if (report && Array.isArray(report.benchmarks)) {
    for (const bench of report.benchmarks) {
      map[bench.name] = bench
    }
  }
  return map
}

const formatMs = value => (value == null ? 'n/a' : value.toFixed(3))

const formatDelta = pct => {
  if (pct == null) return 'n/a'
  const sign = pct > 0 ? '+' : ''
  return `${sign}${pct.toFixed(1)}%`
}

const computeDeltaPct = (baseBench, prBench) => {
  if (!baseBench || baseBench.value === 0) return null
  const raw = ((prBench.value - baseBench.value) / baseBench.value) * 100
  return prBench.higherIsBetter ? -raw : raw
}

const buildBaselineReport = prReport => {
  const lines = []
  lines.push('### cozy-client benchmarks')
  lines.push('')
  lines.push(
    'No baseline found on the base branch (benchmarks are new here). ' +
      'Publishing PR numbers as the future baseline.'
  )
  lines.push('')
  lines.push('| Benchmark | PR (ms, median) | ops/s |')
  lines.push('| --- | ---: | ---: |')
  for (const bench of prReport.benchmarks) {
    lines.push(
      `| ${bench.name} | ${formatMs(bench.medianMs)} | ${bench.opsPerSec.toFixed(1)} |`
    )
  }
  return { markdown: lines.join('\n'), failed: false }
}

const buildComparison = (baseReport, prReport, threshold) => {
  const baseMap = indexByName(baseReport)
  const rows = []
  let failed = false

  for (const prBench of prReport.benchmarks) {
    const baseBench = baseMap[prBench.name]
    const deltaPct = computeDeltaPct(baseBench, prBench)
    const guardThreshold =
      prBench.regressionThresholdPct != null
        ? prBench.regressionThresholdPct
        : null

    let status = 'informational'
    if (deltaPct == null) {
      status = 'no baseline'
    } else if (guardThreshold != null && deltaPct > guardThreshold) {
      status = `REGRESSION (> ${guardThreshold}%)`
      failed = true
    } else if (guardThreshold != null && deltaPct < -guardThreshold) {
      status = 'improvement'
    } else if (guardThreshold != null) {
      status = 'ok'
    }

    rows.push({
      name: prBench.name,
      base: baseBench ? baseBench.medianMs : null,
      pr: prBench.medianMs,
      deltaPct,
      status
    })
  }

  const lines = []
  lines.push('### cozy-client benchmarks')
  lines.push('')
  lines.push(
    `Same-runner comparison (PR vs base), regression threshold ${threshold}% on guarded metrics.`
  )
  lines.push('')
  lines.push('| Benchmark | master (ms) | PR (ms) | Δ% | Status |')
  lines.push('| --- | ---: | ---: | ---: | --- |')
  for (const row of rows) {
    lines.push(
      `| ${row.name} | ${formatMs(row.base)} | ${formatMs(row.pr)} | ${formatDelta(
        row.deltaPct
      )} | ${row.status} |`
    )
  }
  lines.push('')
  lines.push('Lower ms is better. Δ% > 0 means the PR is slower than master.')

  return { markdown: lines.join('\n'), failed }
}

const main = () => {
  const { basePath, prPath, mdPath, threshold } = parseArgs(process.argv.slice(2))

  const prReport = readJson(prPath)
  if (!prReport) {
    console.error(`Cannot read PR benchmark report at ${prPath}`)
    process.exit(2)
  }

  const baseReport = readJson(basePath)
  const result = baseReport
    ? buildComparison(baseReport, prReport, threshold)
    : buildBaselineReport(prReport)

  console.log(result.markdown)
  if (mdPath) {
    fs.mkdirSync(path.dirname(mdPath), { recursive: true })
    fs.writeFileSync(mdPath, result.markdown)
  }

  process.exit(result.failed ? 1 : 0)
}

main()
