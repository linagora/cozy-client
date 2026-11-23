import PropTypes from 'prop-types'
import { useState, useCallback } from 'react'

import useClient from './useClient'

/**
 * This hook manages the state during the saving of a document
 *
 * @returns {import("../types").UseMutationReturnValue}
 */
const useMutation = ({ onSuccess = undefined, onError = undefined } = {}) => {
  const client = useClient()

  /** @type {import("../types").useState<import("../types").QueryFetchStatus>} */
  const [mutationStatus, setMutationStatus] = useState('pending')
  const [error, setError] = useState()
  const [data, setData] = useState()

  const mutate = useCallback(
    async doc => {
      setError(undefined)
      setMutationStatus('loading')
      try {
        const resp = await client.save(doc)
        setData(resp.data)
        if (typeof onSuccess === 'function') {
          await onSuccess(resp.data)
        }
        setMutationStatus('loaded')
      } catch (e) {
        setMutationStatus('failed')
        setError(e)
        if (typeof onError === 'function') {
          await onError(e)
        }
      }
    },
    [client, onError, onSuccess]
  )

  return {
    mutate,
    mutationStatus,
    error,
    data
  }
}

useMutation.propTypes = {
  /** This function is triggered when the save is successful */
  onSuccess: PropTypes.func,
  /** This function is triggered when the save has failed */
  onError: PropTypes.func
}

export { useMutation }
