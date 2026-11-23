import omit from 'lodash/omit'
import { createStore, combineReducers } from 'redux'

import { Q } from 'cozy-client'

import CozyClient from './CozyClient'
import ObservableQuery from './ObservableQuery'
import { SCHEMA, TODO_1, TODO_2 } from './__tests__/fixtures'
import { queryResultFromData } from './__tests__/utils'
import CozyLink from './links/CozyLink'
import { initQuery, receiveQueryResult } from './store'

const AUTHORS = [
  {
    _id: 1234,
    _type: 'io.cozy.todos.authors',
    name: 'John Doe'
  }
]

describe('ObservableQuery', () => {
  let store
  const requestHandler = jest.fn()
  const link = new CozyLink(requestHandler)
  const client = new CozyClient({
    links: [link],
    schema: {
      todos: omit(SCHEMA.todos, 'relationships')
    }
  })

  beforeEach(() => {
    store = createStore(combineReducers({ cozy: client.reducer() }))
    client.setStore(store, { force: true })
  })

  describe('notifications', () => {
    const setup = async () => {
      const def = Q('io.cozy.todos')
      const observer = jest.fn()
      const query = new ObservableQuery('allTodos', def, client)
      jest.spyOn(query, 'subscribeToStore')
      jest.spyOn(query, 'unsubscribeFromStore')
      const unsubscribe = query.subscribe(observer)
      await store.dispatch(initQuery('allTodos', def))
      return { observer, query, unsubscribe }
    }

    it('should notify observers when the fetchStatus change', async () => {
      const { observer } = await setup()
      await store.dispatch(
        receiveQueryResult('allTodos', queryResultFromData([TODO_1]))
      )
      expect(observer).toHaveBeenCalledTimes(2)
    })

    it('should not notify observers when other queries changed', async () => {
      const { observer } = await setup()
      await store.dispatch(
        receiveQueryResult('allTodos', queryResultFromData([TODO_1, TODO_2]))
      )

      await store.dispatch(
        receiveQueryResult('allAuthors', queryResultFromData(AUTHORS))
      )
      expect(observer).toHaveBeenCalledTimes(2)
    })

    it('should automatically subscribe/unsubscribe from store', async () => {
      const { unsubscribe, query } = await setup()
      unsubscribe()
      expect(query.unsubscribeFromStore).toHaveBeenCalledTimes(1)
      query.subscribe()
      expect(query.subscribeToStore).toHaveBeenCalledTimes(2)
    })
  })

  describe('fetch', () => {
    let query
    const def = Q('io.cozy.todos')
    const observer = jest.fn()

    beforeEach(async () => {
      observer.mockReset()
      query = new ObservableQuery('allTodos', def, client)
      jest.spyOn(client, 'query').mockImplementation(() => {})
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('should be able to tell the client to fetch', () => {
      query.fetch()
      expect(client.query).toHaveBeenCalledWith(
        expect.objectContaining({
          doctype: 'io.cozy.todos'
        }),
        { as: 'allTodos' }
      )
    })
  })

  describe('current result', () => {
    let query

    it('should be able to return its results', async () => {
      const def = Q('io.cozy.todos')
      await store.dispatch(initQuery('allTodos', def))
      query = new ObservableQuery('allTodos', def, client)
      await store.dispatch(
        receiveQueryResult('allTodos', queryResultFromData([TODO_1, TODO_2]))
      )
      expect(query.currentResult().data).toEqual([TODO_1, TODO_2])
    })

    it('should be able to return its results', async () => {
      const def = Q('io.cozy.todos').getById(TODO_1._id)
      await store.dispatch(initQuery('oneTodo', def))
      query = new ObservableQuery('oneTodo', def, client)
      await store.dispatch(
        receiveQueryResult('oneTodo', queryResultFromData([TODO_1]))
      )
      expect(query.currentResult().data).toEqual(TODO_1)
    })

    it('should return hydrated results even if fetch status != loaded', async () => {
      jest.spyOn(client, 'hydrateDocuments')
      const def = Q('io.cozy.todos').getById(TODO_1._id)
      await store.dispatch(initQuery('oneTodo', def))
      query = new ObservableQuery('oneTodo', def, client)
      await store.dispatch(
        receiveQueryResult('oneTodo', queryResultFromData([TODO_1]))
      )
      await store.dispatch(initQuery('oneTodo', def))
      expect(query.currentResult().data).toEqual(TODO_1)
      expect(client.hydrateDocuments).toHaveBeenCalled()
    })
  })

  it('should return an unsubscribe function', () => {})
  it('should notify observers when a mutation updates the observed query', () => {})
  it('should not notify observers when a mutation updates another query', () => {})
  it('should notify observers when a mutation is executed in the context of the query', () => {})
})
