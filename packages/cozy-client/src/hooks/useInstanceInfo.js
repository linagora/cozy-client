import CozyClient from '../CozyClient'
import { Q } from '../queries/dsl'
import { hasQueryBeenLoaded } from '../utils'
import useQuery from './useQuery'

/**
 * Retrieve intance info like context, uuid, disk usage etc
 *
 * @returns {import("../types").InstanceInfo}
 */
export const useInstanceInfo = () => {
  const instanceQuery = buildSettingsByIdQuery('io.cozy.settings.instance')
  const instanceResult = useQuery(
    instanceQuery.definition,
    instanceQuery.options
  )

  const contextQuery = buildSettingsByIdQuery('io.cozy.settings.context')
  const contextResult = useQuery(contextQuery.definition, contextQuery.options)

  const diskUsageQuery = buildSettingsByIdQuery('io.cozy.settings.disk-usage')
  const diskUsageResult = useQuery(
    diskUsageQuery.definition,
    diskUsageQuery.options
  )

  return {
    isLoaded:
      hasQueryBeenLoaded(instanceResult) !== null &&
      hasQueryBeenLoaded(contextResult) !== null &&
      hasQueryBeenLoaded(diskUsageResult) !== null,
    instance: { data: instanceResult.data },
    context: { data: contextResult.data },
    diskUsage: { data: diskUsageResult.data }
  }
}

const DEFAULT_CACHE_TIMEOUT_QUERIES = 9 * 60 * 1000

const buildSettingsByIdQuery = id => ({
  definition: Q('io.cozy.settings').getById(id),
  options: {
    as: `io.cozy.settings/${id}`,
    fetchPolicy: CozyClient.fetchPolicies.olderThan(
      DEFAULT_CACHE_TIMEOUT_QUERIES
    ),
    singleDocData: true
  }
})
