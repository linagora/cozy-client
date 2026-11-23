import { useState, useEffect } from 'react'
import get from 'lodash/get'
import { Q } from '../queries/dsl'

const useCapabilities = client => {
  const [capabilities, setCapabilities] = useState()
  const [fetchStatus, setFetchStatus] = useState('idle')
  useEffect(() => {
    const fetchData = async () => {
      setFetchStatus('loading')
      try {
        const capabilitiesResult = await client.query(
          Q('io.cozy.settings').getById('io.cozy.settings.capabilities')
        )

        setCapabilities(get(capabilitiesResult, 'data', {}))
        setFetchStatus('loaded')
      } catch {
        setFetchStatus('failed')
      }
    }

    if (client.capabilities) {
      setCapabilities(client.capabilities)
      setFetchStatus('loaded')
    } else {
      fetchData()
    }
  }, [client])

  return {
    capabilities,
    fetchStatus
  }
}

export default useCapabilities
