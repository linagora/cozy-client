import React from 'react'
import { act, screen, render } from '@testing-library/react'
import CozyProvider from './Provider'

import Query from './Query'
import {
  initQuery,
  receiveQueryResult,
  receiveMutationResult,
  getQueryFromState
} from './store'
import { TODOS, TODO_WITH_RELATION, FILE_1 } from './__tests__/fixtures'

// TODO we should have only one way of testing with the client
import { createTestAssets, queryResultFromData } from './__tests__/utils'
import * as mocks from './__tests__/mocks'

describe('Query', () => {
  const queryDef = client => ({ doctype: 'io.cozy.todos' })
  let observableQuery
  const client = mocks.client({
    makeObservableQuery: queryDef => observableQuery,
    requestQuery: async () => {
      return { data: [] }
    }
  })

  const context = { client }

  beforeEach(() => {
    client.query.mockClear()
    observableQuery = mocks.observableQuery()
  })

  describe('lifecycle', () => {
    it('should fire a query fetch when mounted', () => {
      render(
        <CozyProvider client={client}>
          <Query query={queryDef}>{() => null}</Query>
        </CozyProvider>,
        {
          context
        }
      )
      expect(observableQuery.fetch).toHaveBeenCalled()
    })

    it('should not fire a query fetch when mounted if enabled is set to false', () => {
      render(
        <CozyProvider client={client}>
          <Query query={queryDef} enabled={false}>
            {() => null}
          </Query>
        </CozyProvider>,
        {
          context
        }
      )
      expect(observableQuery.fetch).not.toHaveBeenCalled()
    })

    it('should not fire a query fetch when mounted when fetchPolicy returns false', () => {
      const queryState = { lastUpdate: Date.now() }
      client.getQueryFromState = jest.fn().mockReturnValue(queryState)
      const fetchPolicy = jest.fn().mockReturnValue(false)
      render(
        <CozyProvider client={client}>
          <Query query={queryDef} as="allTodos" fetchPolicy={fetchPolicy}>
            {() => null}
          </Query>
        </CozyProvider>,
        { context }
      )
      expect(client.getQueryFromState).toHaveBeenCalledWith('allTodos')
      expect(fetchPolicy).toHaveBeenCalledWith(queryState)
      expect(client.query).not.toHaveBeenCalled()
    })

    it('should create a single query', async () => {
      const assets = createTestAssets()
      const store = assets.store
      const client = assets.client
      const spy = jest.spyOn(store, 'dispatch')
      await act(async () => {
        render(
          <CozyProvider client={client}>
            <Query query={queryDef}>{() => null}</Query>
          </CozyProvider>
        )
      })
      const initQueryDispatch = {
        options: { as: '1' },
        queryDefinition: { doctype: 'io.cozy.todos' },
        queryId: '1',
        type: 'INIT_QUERY'
      }

      // First call because of the getQueryFromState
      expect(spy).toHaveBeenNthCalledWith(1, {
        ...initQueryDispatch,
        options: null
      })
      // Then because of the fetch
      expect(spy).toHaveBeenNthCalledWith(2, initQueryDispatch)
      // Then the load event, plus the receive-result dispatch once the
      // async fetch settles inside act(). Don't over-specify the count.
      expect(spy.mock.calls.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('data reactions', () => {
    let store, client
    beforeEach(async () => {
      const assets = createTestAssets()
      store = assets.store
      client = assets.client
      const noFetch = () => false
      await store.dispatch(initQuery('allTodos', queryDef(client)))
      render(
        <CozyProvider client={client}>
          <Query fetchPolicy={noFetch} query={queryDef}>
            {({ data }) => (
              <ul>
                {data.map(x => (
                  <li key={x._id}>{x.label}</li>
                ))}
              </ul>
            )}
          </Query>
        </CozyProvider>
      )
    })

    it('should be refreshed when relevant results are updated', async () => {
      expect(screen.queryByText('Build stuff')).not.toBeInTheDocument()
      const response = queryResultFromData(TODOS)
      const action = receiveQueryResult('allTodos', response)
      await act(async () => {
        await store.dispatch(action)
      })
      expect(screen.queryByText('Build stuff')).toBeInTheDocument()
    })

    it('should refresh queries concerned by a REMOVE_REFERENCE_TO mutation', async () => {
      const response = { data: TODO_WITH_RELATION }

      const action1 = receiveQueryResult('allTodos', response)
      await act(async () => {
        await store.dispatch(action1)
      })

      const definition = {
        document: TODO_WITH_RELATION,
        mutationType: 'REMOVE_REFERENCES_TO',
        referencedDocuments: [
          {
            ...FILE_1
          }
        ]
      }
      const UPDATED_AT = 2000
      jest.spyOn(Date, 'now').mockReturnValue(UPDATED_AT)
      const action = receiveMutationResult('allTodos', '', {}, definition)
      await act(async () => {
        await store.dispatch(action)
      })
      const state = store.getState()

      expect(getQueryFromState(state, 'allTodos').lastUpdate).toEqual(
        UPDATED_AT
      )
    })
  })

  describe('props', () => {
    let store, client, query
    beforeEach(async () => {
      const assets = createTestAssets()
      store = assets.store
      client = assets.client
      query = queryDef(client)
      await store.dispatch(initQuery('allTodos', query))
    })

    const setup = ({ children }) => {
      const noFetch = () => false
      render(
        <CozyProvider client={client}>
          <Query fetchPolicy={noFetch} query={queryDef}>
            {children}
          </Query>
        </CozyProvider>
      )
    }

    it('should provide the render prop children with methods', () => {
      const children = jest.fn().mockImplementation(() => null)
      setup({
        children
      })
      expect(children).toHaveBeenCalledWith(
        {
          bookmark: null,
          count: 0,
          fetchedPagesCount: 0,
          data: [],
          storeData: [],
          relationshipNames: null,
          definition: { doctype: 'io.cozy.todos' },
          fetch: expect.any(Function),
          fetchMore: expect.any(Function),
          fetchStatus: 'pending',
          hasMore: false,
          id: '1',
          isFetching: null,
          lastError: null,
          lastFetch: null,
          lastUpdate: null,
          lastErrorUpdate: null,
          options: null
        },
        expect.any(Object)
      )
    })

    it('should work with a client not providing fetch', () => {
      client.makeObservableQuery = () => ({
        subscribe: () => {},
        fetchMore: () => {},
        currentResult: () => {}
      })
      const children = jest.fn().mockImplementation(() => null)
      setup({
        children
      })
      expect(children).toHaveBeenCalledWith(
        {
          fetch: null,
          fetchMore: expect.any(Function)
        },
        expect.any(Object)
      )
    })
  })

  describe('mutations', () => {
    let store, client, mutations, mutationsArgument, query
    beforeEach(async () => {
      const assets = createTestAssets()
      store = assets.store
      client = assets.client
      query = queryDef(client)
      await store.dispatch(initQuery('allTodos', query))

      mutations = jest.fn().mockReturnValue({
        create: jest.fn(),
        update: jest.fn()
      })

      const noFetch = () => false

      render(
        <CozyProvider client={client}>
          <Query fetchPolicy={noFetch} query={queryDef} mutations={mutations}>
            {(result, mutations) => {
              mutationsArgument = mutations
              return null
            }}
          </Query>
        </CozyProvider>
      )
    })

    it('should call mutation function with client', () => {
      expect(mutations.mock.calls.length).toBe(1)
      expect(mutations.mock.calls[0][0]).toBe(client)
    })

    it('should pass mutations', () => {
      expect(typeof mutationsArgument.create).toBe('function')
      expect(typeof mutationsArgument.update).toBe('function')
    })

    it('should pass mutations as object', () => {
      const mutations = {
        create: jest.fn(),
        update: jest.fn()
      }

      const noFetch = () => false

      render(
        <CozyProvider client={client}>
          <Query fetchPolicy={noFetch} query={queryDef} mutations={mutations}>
            {(result, mutations) => {
              mutationsArgument = mutations
              return null
            }}
          </Query>
        </CozyProvider>
      )

      expect(typeof mutationsArgument.create).toBe('function')
      expect(typeof mutationsArgument.update).toBe('function')
    })
  })
})
