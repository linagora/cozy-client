import { Q, fetchPolicies } from 'cozy-client'

const defaultFetchPolicy = fetchPolicies.olderThan(5 * 60 * 1000) // 5 min

export const TYPE_DIRECTORY = 'directory'
export const TYPE_FILE = 'file'

export const queryFileById = async (client, id) => {
  const definition = Q('io.cozy.files').getById(id)
  const options = {
    as: `io.cozy.files/${id}`,
    fetchPolicy: defaultFetchPolicy,
    singleDocData: true
  }
  return client.fetchQueryAndGetFromState({ definition, options })
}
