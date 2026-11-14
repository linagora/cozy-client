import { useEffect } from 'react'

import logger from '../logger'
import { QueryDefinition } from '../queries/dsl'
import { equalityCheckForQuery } from '../store/selector'
import useClient from './useClient'
import { useQueryWithEqualityCheck } from './useQuery'
import useSafeState from './helpers/useSafeState'

const equalityCheckForQueryAll = (previous, next) =>
  previous.isFetching === next.isFetching &&
  equalityCheckForQuery(previous, next)

/**
 * Fetches a queryDefinition and run fetchMore on the query until the query is fully loaded
 *
 * @param {QueryDefinition} queryDefinition - Definition created with Q()
 * @param {import("../types").QueryOptions} options - Options created with Q()
 * @returns {import("../types").UseQueryReturnValue}
 */
const useQueryAll = (queryDefinition, options) => {
  const { as, enabled } = options
  const client = useClient()
  const [fetching, setFetching] = useSafeState(false)
  const res = useQueryWithEqualityCheck(
    queryDefinition,
    options,
    equalityCheckForQueryAll
  )

  useEffect(() => {
    const checkToFetchMore = async () => {
      // useQuery may have started a refresh since this render.
      const queryState = client.getQueryFromState(as)
      if (
        enabled !== false &&
        queryState.fetchStatus === 'loaded' &&
        !queryState.isFetching &&
        queryState.hasMore &&
        !fetching
      ) {
        setFetching(true)
        try {
          await res.fetchMore()
        } finally {
          setFetching(false)
        }
      }
    }
    checkToFetchMore().catch(error => logger.warn(error))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    client,
    res.hasMore,
    res.fetchStatus,
    res.isFetching,
    fetching,
    as,
    enabled
  ])

  return res
}

export default useQueryAll
