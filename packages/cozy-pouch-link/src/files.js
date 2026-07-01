import { Q, fetchPolicies } from 'cozy-client'

const defaultFetchPolicy = fetchPolicies.olderThan(5 * 60 * 1000) // 5 min

export const TYPE_DIRECTORY = 'directory'
export const TYPE_FILE = 'file'

/**
 * @param {object} client - The cozy client
 * @param {string} id - The file id
 * @param {string} [driveId] - Optional shared-drive id to read the file from the drive scope
 */
export const queryFileById = async (client, id, driveId) => {
  const definition = Q('io.cozy.files').getById(id)
  const options = {
    as: driveId
      ? `io.cozy.files/drive/${driveId}/${id}`
      : `io.cozy.files/${id}`,
    fetchPolicy: defaultFetchPolicy,
    singleDocData: true,
    ...(driveId ? { driveId } : {})
  }
  return client.fetchQueryAndGetFromState({ definition, options })
}
