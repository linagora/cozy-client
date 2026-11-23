import { useEffect, useState } from 'react'
import { Q } from '../queries/dsl'
import {
  isInstalled as checkIfAppIsInstalled,
  getStoreURL,
  getUrl
} from '../models/applications'

const useAppLinkWithStoreFallback = (slug, client, path = '') => {
  const [fetchStatus, setFetchStatus] = useState('loading')
  const [isInstalled, setIsInstalled] = useState(true)
  const [url, setURL] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const apps = await client.query(Q('io.cozy.apps'))
        const appDocument = { slug }
        const appInstalled = checkIfAppIsInstalled(apps.data, appDocument)
        setIsInstalled(!!appInstalled)
        if (appInstalled) {
          setURL(getUrl(appInstalled) + path)
        } else {
          setURL(getStoreURL(apps.data, appDocument))
        }
        setFetchStatus('loaded')
      } catch {
        setFetchStatus('errored')
      }
    }
    load()
  }, [client, slug, path])

  return {
    fetchStatus,
    isInstalled,
    url
  }
}

export default useAppLinkWithStoreFallback
