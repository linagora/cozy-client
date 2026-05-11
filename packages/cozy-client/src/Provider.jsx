import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import clientContext from './context'

const storePropType = PropTypes.shape({
  subscribe: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
  getState: PropTypes.func.isRequired
})

const CozyProvider = ({ store, client, children }) => {
  if (!client) {
    throw new Error('CozyProvider was not passed a client instance.')
  }
  if (store && client.store !== store) {
    client.setStore(store)
  }

  const value = useMemo(
    () => ({
      store: store || client.store,
      client
    }),
    [store, client]
  )

  return (
    <clientContext.Provider value={value}>{children}</clientContext.Provider>
  )
}

CozyProvider.propTypes = {
  store: storePropType,
  client: PropTypes.object.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element)
  ]).isRequired
}

export default CozyProvider
