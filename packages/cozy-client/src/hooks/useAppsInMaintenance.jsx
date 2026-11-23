import CozyClient from '../CozyClient'
import { Q } from '../queries/dsl'
import useQuery from './useQuery'

const DEFAULT_CACHE_TIMEOUT_QUERIES = 10 * 60 * 1000 // 10 minutes

/**
 * Returns all apps in maintenance
 *
 * @returns {import("../types").AppsDoctype[]} An array with all apps in maintenance
 */
const useAppsInMaintenance = () => {
  const { data: appsInMaintenance } = useQuery(
    Q('io.cozy.apps_registry').getById('maintenance'),
    {
      as: 'io.cozy.apps_registry/maintenance',
      fetchPolicy: CozyClient.fetchPolicies.olderThan(
        DEFAULT_CACHE_TIMEOUT_QUERIES
      ),
      singleDocData: false
    }
  )

  return appsInMaintenance || []
}

export default useAppsInMaintenance
