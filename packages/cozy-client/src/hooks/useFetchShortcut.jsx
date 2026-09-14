import { useState, useEffect } from 'react'

import { Q } from '../queries/dsl'
import CozyClient from '../CozyClient'
import { DOCTYPE_FILES_SHORTCUTS } from '../const'

const DEFAULT_CACHE_TIMEOUT_QUERIES = 10 * 60 * 1000 // 10 minutes

/**
 * Fetch a shortcut and the icon to display for it.
 *
 * @param {import('../CozyClient').default} client - A CozyClient instance
 * @param {string} id - The shortcut file id
 * @param {string} [driveId] - Id of the shared drive the shortcut belongs to
 */
const useFetchShortcut = (client, id, driveId) => {
  const [shortcutInfos, setShortcutInfos] = useState(null)
  const [shortcutImg, setShortcutImg] = useState(null)
  const [fetchStatus, setFetchStatus] = useState('idle')
  useEffect(() => {
    let isCancelled = false

    const fetchData = async () => {
      setFetchStatus('loading')
      try {
        const baseDefinition = Q(DOCTYPE_FILES_SHORTCUTS).getById(id)
        const shortcutInfosResult = await client.fetchQueryAndGetFromState({
          definition: driveId
            ? baseDefinition.sharingById(driveId)
            : baseDefinition,
          options: {
            as: driveId
              ? `${DOCTYPE_FILES_SHORTCUTS}/${driveId}/${id}`
              : `${DOCTYPE_FILES_SHORTCUTS}/${id}`,
            fetchPolicy: CozyClient.fetchPolicies.olderThan(
              DEFAULT_CACHE_TIMEOUT_QUERIES
            ),
            singleDocData: true
          }
        })
        if (isCancelled) return

        const targetApp = shortcutInfosResult?.data?.metadata?.target?.app
        if (targetApp) {
          const targetAppIconUrl = await client.getStackClient().getIconURL({
            type: 'app',
            slug: targetApp,
            priority: 'stack'
          })
          if (isCancelled) return

          setShortcutImg(targetAppIconUrl)
        } else {
          const shortcutRemoteUrl = new URL(shortcutInfosResult.data.url)

          const imgUrl = `${client.getStackClient().uri}/bitwarden/icons/${
            shortcutRemoteUrl.host
          }/icon.png`

          setShortcutImg(imgUrl)
        }
        setShortcutInfos({ data: shortcutInfosResult.data })
        setFetchStatus('loaded')
      } catch (e) {
        if (isCancelled) return

        setFetchStatus('failed')
      }
    }
    fetchData()

    return () => {
      isCancelled = true
    }
  }, [client, id, driveId])

  return {
    shortcutInfos,
    shortcutImg,
    fetchStatus
  }
}

export default useFetchShortcut
