import { memo, useEffect } from 'react'

import { ensureFilePath } from './helpers/realtime'
import useClient from './hooks/useClient'
import {
  dispatchCreate,
  dispatchDelete,
  dispatchUpdate
} from './store/realtime'

/**
 * Component that subscribes to a doctype changes and keep the
 * internal store updated.
 *
 * @param {object} options - Options
 * @param {import("./types").Doctype} options.doctype - The doctype to watch
 * @returns {null} The component does not display anything.
 */
const RealTimeQueries = ({ doctype }) => {
  const client = useClient()

  useEffect(() => {
    const realtime = client.plugins.realtime

    if (!realtime) {
      throw new Error(
        'You must include the realtime plugin to use RealTimeQueries'
      )
    }

    let options = {}
    if (doctype === 'io.cozy.files') {
      options.enhanceDocFn = ensureFilePath
    }

    const handleCreated = data => {
      dispatchCreate(client, doctype, data, options)
    }

    const handleUpdated = data => {
      dispatchUpdate(client, doctype, data, options)
    }

    const handleDeleted = data => {
      dispatchDelete(client, doctype, data, options)
    }

    const subscribe = async () => {
      await realtime.subscribe('created', doctype, handleCreated)
      await realtime.subscribe('updated', doctype, handleUpdated)
      await realtime.subscribe('deleted', doctype, handleDeleted)
    }
    subscribe()

    return () => {
      realtime.unsubscribe('created', doctype, handleCreated)
      realtime.unsubscribe('updated', doctype, handleUpdated)
      realtime.unsubscribe('deleted', doctype, handleDeleted)
    }
  }, [client, doctype])

  return null
}

export default memo(RealTimeQueries)
