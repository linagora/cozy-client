import { useEffect } from 'react'

import { QueryDefinition } from '../queries/dsl'
import useQuery from './useQuery'
import useSafeState from './helpers/useSafeState'

/**
 * Fetches a queryDefinition and run fetchMore on the query until the query is fully loaded
 *
 * @param {QueryDefinition} queryDefinition - Definition created with Q()
 * @param {import("../types").QueryOptions} options - Options created with Q()
 * @returns {import("../types").UseQueryReturnValue}
 */
const useQueryAll = (queryDefinition, options) => {
  const [fetching, setFetching] = useSafeState(false)
  const res = useQuery(queryDefinition, options)

  useEffect(() => {
    const checkToFetchMore = async () => {
      if (
        options?.enabled !== false &&
        res.fetchStatus === 'loaded' &&
        res.hasMore &&
        !fetching
      ) {
        setFetching(true)
        await res.fetchMore()
        setFetching(false)
      }
    }
    checkToFetchMore()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [res.hasMore, res.fetchStatus, fetching, options?.enabled])

  return res
}

export default useQueryAll
