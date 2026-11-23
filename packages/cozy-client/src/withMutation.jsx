import React, { Component } from 'react'
import PropTypes from 'prop-types'

/**
 * @typedef {Component} Wrapper
 * @returns {Function}
 */
const withMutation =
  (mutation, options = {}) =>
  WrappedComponent => {
    const wrappedDisplayName =
      WrappedComponent.displayName || WrappedComponent.name || 'Component'

    class Wrapper extends Component {
      static contextTypes = {
        client: PropTypes.object
      }

      constructor(props, context) {
        super(props, context)
        this.client = props.client || context.client
        if (!this.client) {
          throw new Error(
            `Could not find "client" in either the context or props of ${wrappedDisplayName}`
          )
        }
      }

      mutate = (...args) => {
        return this.client.mutate(mutation.apply(null, args), options)
      }

      render() {
        const mutationProps = {
          [options.name || 'mutate']: this.mutate
        }
        return <WrappedComponent {...mutationProps} {...this.props} />
      }
    }

    Wrapper.displayName = `WithMutation(${wrappedDisplayName})`
    return Wrapper
  }

export default withMutation
