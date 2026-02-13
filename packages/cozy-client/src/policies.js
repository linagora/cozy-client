/**
 * Use those fetch policies with `<Query />` to limit the number of re-fetch.
 *
 * @example
 * ```
 * import { fetchPolicies } from 'cozy-client'
 * const olderThan30s = fetchPolicies.olderThan(30 * 1000)
 * <Query fetchPolicy={olderThan30s} />
 * ```
 */
const fetchPolicies = {
  /**
   * Returns a fetchPolicy that will only re-fetch queries that are older
   * than `<delay>` ms.
   *
   * @param  {number} delay - Milliseconds since the query has been fetched
   * @returns {Function} Fetch policy to be used with `<Query />`
   */
  olderThan: delay => queryState => {
    const lastCheck = queryState.lastUpdate || queryState.lastErrorUpdate

    if (!queryState || !lastCheck) {
      return true
    } else {
      const elapsed = Date.now() - lastCheck
      return elapsed > delay
    }
  },

  /**
   * Fetch policy that deactivates any fetching.
   */
  noFetch: () => false
}

export default fetchPolicies
