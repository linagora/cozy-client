# cozy-client benchmarks

Micro-benchmarks for the hot paths of the redux store, plus a CI job that compares
a pull request against its base branch on the same runner.

## What is measured

The benchmarks exercise the real `packages/cozy-client/src/store/queries.js` reducer
(via the built `dist/`), not mocks.

- **`store-queries:receiveQueryResult-getById-heavy`** — the `queries()` reducer
  handling a `RECEIVE_QUERY_RESULT` that carries 10k `io.cozy.files` documents against
  a store of 1000 `getById` queries and 200 selector queries. This is the key metric:
  it guards the store update cost when a large `setData` lands. It is the only metric
  with a regression gate.
- **`store-queries:selector-eval-folder-listing`** — `updateData()` evaluating a
  `{ dir_id, type, name: { $gt: null } }` folder-listing selector over 10k documents.
  Exercises `sift` and the custom `$gtnull` operator. Informational.
- **`store-queries:sift-compiled-exec-10k`** — a pure `sift` canary: run a pre-compiled
  selector over 10k documents. Catches a raw `sift` slowdown (e.g. a version bump).
  Informational.
- **`pouch-normalize:files-cold-cache`** — `cozy-pouch-link`'s `normalizeDocs` over 200
  directories + 10k `io.cozy.files` with a cold path cache (via the built
  `packages/cozy-pouch-link/dist`). Guards the per-file parent-path resolution done on
  every sync: without directory-path seeding each file falls through to a `getById` per
  file. Gated on a regression threshold.

## Running locally

The packages read from `dist/`, so a build is required first. `yarn bench` does both:

```sh
yarn bench                                  # build + run, writes benchmarks/results/latest.json
yarn bench --out=/path/to/report.json       # choose the output file
```

Direct run without rebuilding (dist must already exist):

```sh
node packages/cozy-client/benchmarks/run.js --out=pr.json
```

Each report is JSON: `{ schemaVersion, generatedAt, node, platform, benchmarks: [...] }`,
one entry per benchmark with `medianMs`, `minMs`, `meanMs` and `opsPerSec`.

## Harness

`harness.js` is a dependency-free `process.hrtime.bigint()` timer: it warms up each
benchmark, runs it N times and reports the **median** (robust to outliers). Sizes and
iteration counts live in `store-queries.bench.js`.

## Comparing two reports

`compare.js` compares a base report against a PR report and prints a Markdown table:

```sh
node packages/cozy-client/benchmarks/compare.js base.json pr.json --md=comment.md
```

- Delta is `(pr - base) / base` per benchmark; positive means the PR is **slower**.
- The comparison is **same-runner, back-to-back** (PR and base measured on the same
  machine in the same job), so absolute ms vary but the ratio is meaningful.
- A benchmark carrying `regressionThresholdPct` is **guarded**: the script exits
  non-zero when its delta exceeds the threshold (25% by default, override with
  `--threshold=`). Other benchmarks are informational.
- If the base report is missing (the base branch does not have the benchmarks yet),
  `compare.js` prints the PR numbers as a baseline and exits 0.

## CI

The `perf` job in `.github/workflows/ci-cd.yml` runs on pull requests: it benches the
PR, checks out the base branch and benches it on the same runner, then posts the table
as a PR comment and fails on a guarded regression.
