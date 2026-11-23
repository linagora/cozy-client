import merge from 'lodash/merge'

import { normalizeDoc } from 'cozy-stack-client'

import CozyClient from './CozyClient'
import { Q } from './queries/dsl'
import { receiveQueryResult, receiveQueryError, initQuery } from './store'

const fillQueryInsideClient = (client, queryName, queryOptions) => {
  const { definition, doctype, data, queryError, ...queryResult } = queryOptions
  client.store.dispatch(initQuery(queryName, definition || Q(doctype)))
  if (queryError) {
    client.store.dispatch(receiveQueryError(queryName, queryError))
  } else {
    client.store.dispatch(
      receiveQueryResult(queryName, {
        data: data ? data.map(doc => normalizeDoc(doc, doctype)) : data,
        ...queryResult
      })
    )
  }
}

const mockedQueryFromMockedRemoteData = remoteData => async qdef => {
  if (!remoteData) {
    return { data: null }
  }
  if (remoteData[qdef.doctype]) {
    return { data: remoteData[qdef.doctype] }
  } else {
    return { data: [] }
  }
}

/**
 * Creates a client suitable for use in tests
 *
 * - client.{query,save} are mocked
 * - client.stackClient.fetchJSON is mocked
 *
 * @param  {object} options Options
 * @param  {object} [options.queries] Prefill queries inside the store
 * @param  {object} [options.remote] Mock data from the server
 * @param  {object} [options.clientOptions] Options passed to the client
 * @param  {object} [options.clientFunctions] Functions to overide client functions
 * @returns {CozyClient}
 */
const createMockClient = ({
  queries,
  remote,
  clientOptions,
  clientFunctions
} = {}) => {
  const mockedQuery = jest
    .fn()
    .mockImplementation(mockedQueryFromMockedRemoteData(remote))

  const clientFunctionsMerge = merge(
    {
      query: mockedQuery,
      save: jest.fn(),
      saveAll: jest.fn(),
      stackClient: {
        fetchJSON: jest.fn()
      }
    },
    clientFunctions
  )

  return createFakeClient({
    queries,
    remote,
    clientOptions,
    clientFunctions: clientFunctionsMerge
  })
}

/**
 * Creates a client with pre-filled store
 * This can be useful for demo in documentation (e.g. storybook)
 *
 * - client.{query,save} are replaced with empty functions
 * - client.stackClient.fetchJSON is replaced with empty functions
 *
 * @param  {object} options Options
 * @param  {object} [options.queries] Prefill queries inside the store
 * @param  {object} [options.remote] Mock data from the server
 * @param  {object} [options.clientOptions] Options passed to the client
 * @param  {object} [options.clientFunctions] Functions to overide client functions useful for testing
 * @returns {CozyClient}
 */
const createFakeClient = ({
  queries,
  remote,
  clientOptions,
  clientFunctions
} = {}) => {
  const client = new CozyClient(clientOptions || {})
  client.ensureStore()

  for (let [queryName, queryOptions] of Object.entries(queries || {})) {
    fillQueryInsideClient(client, queryName, queryOptions)
  }

  client.query = mockedQueryFromMockedRemoteData(remote)

  merge(client, clientFunctions)

  return client
}

export { createMockClient, createFakeClient }
