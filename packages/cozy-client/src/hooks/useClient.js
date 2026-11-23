import { useContext } from 'react'

import CozyClient from '../CozyClient'
import clientContext from '../context'

/**
 * Returns the cozy client from the context
 *
 * @returns {CozyClient|null} - Current cozy client
 */
const useClient = () => {
  const { client } = useContext(clientContext)
  return client
}

export default useClient
