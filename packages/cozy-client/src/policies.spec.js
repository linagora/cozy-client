import fetchPolicies from './policies'

describe('fetchPolicies.olderThan', () => {
  const NOW = 1600000000000
  const delay = 30 * 1000
  const policy = fetchPolicies.olderThan(delay)

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(NOW)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('refetches when there is no query state', () => {
    expect(policy(undefined)).toBe(true)
  })

  it('refetches when the query has never been fetched nor errored', () => {
    expect(policy({ lastUpdate: null, lastErrorUpdate: null })).toBe(true)
  })

  it('does not refetch a recent successful query', () => {
    expect(policy({ lastUpdate: NOW - 1000, lastErrorUpdate: null })).toBe(
      false
    )
  })

  it('refetches a stale successful query', () => {
    expect(policy({ lastUpdate: NOW - delay - 1, lastErrorUpdate: null })).toBe(
      true
    )
  })

  it('does not refetch right after a recent error (prevents infinite refetch loop on 500)', () => {
    expect(policy({ lastUpdate: null, lastErrorUpdate: NOW - 1000 })).toBe(
      false
    )
  })

  it('refetches again once the error is older than the delay', () => {
    expect(policy({ lastUpdate: null, lastErrorUpdate: NOW - delay - 1 })).toBe(
      true
    )
  })

  it('backs off on a recent error even when the last success is stale', () => {
    expect(
      policy({ lastUpdate: NOW - delay - 1, lastErrorUpdate: NOW - 1000 })
    ).toBe(false)
  })

  it('stays fresh from a recent success even when the last error is stale', () => {
    expect(
      policy({ lastUpdate: NOW - 1000, lastErrorUpdate: NOW - delay - 1 })
    ).toBe(false)
  })
})

describe('fetchPolicies.noFetch', () => {
  it('never fetches', () => {
    expect(fetchPolicies.noFetch()).toBe(false)
  })
})
