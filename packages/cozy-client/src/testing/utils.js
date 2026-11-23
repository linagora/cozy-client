import React from 'react'

import CozyClient from '../CozyClient'
import ClientProvider from '../Provider'
import { createMockClient } from '../mock'
import simpsonsFixture from '../testing/simpsons.json'

/**
 * Setups a client suitable for testing
 *
 * @typedef {object} MockQueryOptions
 *
 * @param  {object} options - Options
 * @param  {MockQueryOptions} [options.queries] - Additional queries to insert in the client
 * @returns {CozyClient}
 */
const setupClient = ({ queries } = {}) => {
  const client = createMockClient({
    queries: {
      simpsons: {
        data: simpsonsFixture,
        doctype: 'io.cozy.simpsons'
      },
      'simpsons/marge': {
        data: simpsonsFixture.filter(x => x.name === 'Marge'),
        doctype: 'io.cozy.simpsons',
        definition: {
          id: 'marge',
          doctype: 'io.cozy.simpsons'
        }
      },
      upperSimpsons: {
        data: simpsonsFixture.map(x => ({ ...x, name: x.name.toUpperCase() })),
        doctype: 'io.cozy.simpsons-upper'
      },
      ...queries
    }
  })
  client.ensureStore()
  return client
}

/**
 * @private
 * @param  {CozyClient} client - A client
 * @returns {any}
 */
const makeWrapper = client => {
  const Wrapper = ({ children }) => (
    <ClientProvider client={client}>{children}</ClientProvider>
  )
  return Wrapper
}

export { setupClient, makeWrapper }
