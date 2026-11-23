import React from 'react'
import useClient from './hooks/useClient'

const withMutation = (mutation, options = {}) => WrappedComponent => {
  const wrappedDisplayName =
    WrappedComponent.displayName || WrappedComponent.name || 'Component'

  const Wrapper = props => {
    const contextClient = useClient()
    const client = props.client || contextClient
    if (!client) {
      throw new Error(
        `Could not find "client" in either the context or props of ${wrappedDisplayName}`
      )
    }

    const mutate = (...args) => client.mutate(mutation.apply(null, args), options)

    const mutationProps = {
      [options.name || 'mutate']: mutate
    }
    return <WrappedComponent {...mutationProps} {...props} />
  }

  Wrapper.displayName = `WithMutation(${wrappedDisplayName})`
  return Wrapper
}

export default withMutation
