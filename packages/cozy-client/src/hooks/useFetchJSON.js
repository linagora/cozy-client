import { useState, useEffect } from 'react'

import useClient from './useClient'

/**
 * Hook to use the generic fetchJSON method
 *
 * Takes the same arguments as fetchJSON
 *
 * Returns an object with the same keys { data, fetchStatus, error } as useQuery
 */
const useFetchJSON = (method, path, body, options, dependencies) => {
  const client = useClient()
  const [fetchStatus, setFetchStatus] = useState('pending')
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  useEffect(() => {
    const fetch = async () => {
      setFetchStatus('loading')
      try {
        const doc = await client.stackClient.fetchJSON(
          method,
          path,
          body,
          options
        )
        setData(doc)
        setError(null)
        setFetchStatus('loaded')
      } catch (e) {
        setError(e)
        setFetchStatus('error')
      }
    }
    fetch()
  }, [client.stackClient, method, path, body, options, dependencies])

  return { fetchStatus, error, data }
}

export default useFetchJSON
