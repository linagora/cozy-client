import { useState, useEffect } from 'react'

import useClient from './useClient'

const HOME_MAGIC_FOLDER_PATH = '/Settings/Home'

const useFetchHomeShortcuts = () => {
  const client = useClient()
  const [shortcuts, setShortcuts] = useState([])

  useEffect(() => {
    const fetchShortcuts = async () => {
      try {
        const { included } = await client
          .collection('io.cozy.files')
          .statByPath(HOME_MAGIC_FOLDER_PATH)

        setShortcuts((included || []).filter(file => file.class === 'shortcut'))
      } catch (e) {
        setShortcuts([])
      }
    }
    fetchShortcuts()
  }, [client])

  return shortcuts
}

export default useFetchHomeShortcuts
