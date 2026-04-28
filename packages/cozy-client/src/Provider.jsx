import React, { Component } from 'react'
import PropTypes from 'prop-types'
import clientContext from './context'

const storePropType = PropTypes.shape({
  subscribe: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
  getState: PropTypes.func.isRequired
})

export default class CozyProvider extends Component {
  static propTypes = {
    store: storePropType,
    client: PropTypes.object.isRequired,
    children: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.arrayOf(PropTypes.element)
    ]).isRequired
  }

  constructor(props, context) {
    super(props, context)
    if (!props.client) {
      throw new Error('CozyProvider was not passed a client instance.')
    }
    if (props.store && props.client.store !== props.store) {
      props.client.setStore(props.store)
    }
  }

  static childContextTypes = {
    store: PropTypes.object,
    client: PropTypes.object.isRequired
  }

  static contextTypes = {
    store: PropTypes.object
  }

  getChildContext() {
    return {
      store: this.props.store || this.context.store || this.props.client.store,
      client: this.props.client
    }
  }

  render() {
    return (
      <clientContext.Provider value={this.getChildContext()}>
        {this.props.children}
      </clientContext.Provider>
    )
  }
}
