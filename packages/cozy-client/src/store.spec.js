import { createStore, combineReducers } from 'redux'
import sortBy from 'lodash/sortBy'

import { defaultPerformanceApi } from './performances/defaultPerformanceApi'
import reducer, {
  initQuery,
  getCollectionFromState,
  getDocumentFromState,
  getQueryFromStore,
  receiveQueryResult,
  receiveQueryError,
  receiveMutationResult,
  StoreProxy
} from './store'
import { QueryDefinition as Q } from './queries/dsl'
import {
  TODO_1,
  TODO_2,
  TODO_3,
  TODO_4,
  TODO_WITH_RELATION,
  FILE_1,
  FILE_2
} from './__tests__/fixtures'

describe('Store', () => {
  let store
  beforeEach(() => {
    store = createStore(
      combineReducers({ cozy: reducer(defaultPerformanceApi) })
    )
  })

  describe('documents state', () => {
    it('should not update the state when receiving an identical doc', () => {
      store.dispatch(
        receiveQueryResult('allTodos', {
          data: TODO_1,
          meta: { count: 1 },
          skip: 0,
          next: false
        })
      )
      const stateBefore = store.getState().cozy.documents
      store.dispatch(
        receiveQueryResult('allTodos', {
          data: TODO_1,
          meta: { count: 1 },
          skip: 0,
          next: false
        })
      )
      const stateAfter = store.getState().cozy.documents
      expect(stateBefore).toBe(stateAfter)
    })

    it('should update the state when receiving an updated document', () => {
      const TODO_WITH_REV_1 = { ...TODO_1, meta: { rev: 1 } }
      const TODO_WITH_REV_2 = { ...TODO_1, meta: { rev: 2 } }
      store.dispatch(
        receiveQueryResult('allTodos', {
          data: TODO_WITH_REV_1,
          meta: { count: 1 },
          skip: 0,
          next: false
        })
      )
      const stateBefore = store.getState().cozy.documents
      store.dispatch(
        receiveQueryResult('allTodos', {
          data: TODO_WITH_REV_2,
          meta: { count: 1 },
          skip: 0,
          next: false
        })
      )
      const stateAfter = store.getState().cozy.documents
      expect(stateBefore).not.toBe(stateAfter)
      expect(
        getDocumentFromState(store.getState(), 'io.cozy.todos', TODO_1._id)
      ).toEqual(TODO_WITH_REV_2)
    })

    it('should update the state when receiving a doc with more fields', () => {
      const UPDATED_TODO = { ...TODO_1, assigned: false }
      store.dispatch(
        receiveQueryResult('allTodos', {
          data: TODO_1,
          meta: { count: 1 },
          skip: 0,
          next: false
        })
      )
      const stateBefore = store.getState().cozy.documents
      store.dispatch(
        receiveQueryResult('allTodos', {
          data: UPDATED_TODO,
          meta: { count: 1 },
          skip: 0,
          next: false
        })
      )
      const stateAfter = store.getState().cozy.documents
      expect(stateBefore).not.toBe(stateAfter)
      expect(
        getDocumentFromState(
          store.getState(),
          'io.cozy.todos',
          UPDATED_TODO._id
        )
      ).toEqual(UPDATED_TODO)
    })

    it('should correctly update a query with sort', () => {
      const query = new Q({
        doctype: 'io.cozy.todos'
      })
      let queryResult
      store.dispatch(
        initQuery('my-query-name', query.sortBy([{ label: 'desc' }]))
      )
      store.dispatch(initQuery('other-query', query.sortBy([{ label: 'asc' }])))
      store.dispatch(
        receiveQueryResult('my-query-name', {
          data: [TODO_1, TODO_2]
        })
      )
      queryResult = getQueryFromStore(store, 'my-query-name')
      expect(queryResult.data.map(x => x._id)).toEqual(['todo_2', 'todo_1'])

      store.dispatch(
        receiveQueryResult('my-query-name', {
          data: [TODO_4]
        })
      )
      queryResult = getQueryFromStore(store, 'my-query-name')
      expect(queryResult.data.map(x => x._id)).toEqual([
        'todo_4',
        'todo_2',
        'todo_1'
      ])

      store.dispatch(
        receiveQueryResult('my-query-name', {
          data: [TODO_3]
        })
      )
      queryResult = getQueryFromStore(store, 'my-query-name')
      expect(queryResult.data.map(x => x._id)).toEqual([
        'todo_4',
        'todo_2',
        'todo_1',
        'todo_3'
      ])

      const otherQueryResult = getQueryFromStore(store, 'other-query')
      expect(otherQueryResult.data.map(x => x._id)).toEqual([
        'todo_3',
        'todo_1',
        'todo_2',
        'todo_4'
      ])
    })
  })

  describe('getDocumentFromState', () => {
    it('should return null when the store is empty', () => {
      const spy = jest.spyOn(global.console, 'warn').mockReturnValue(jest.fn())
      expect(
        getDocumentFromState(store.getState(), 'io.cozy.todos', TODO_1._id)
      ).toBe(null)
      spy.mockRestore()
    })

    it('should return the document if in store', () => {
      store.dispatch(
        receiveQueryResult('allTodos', {
          data: [TODO_1, TODO_2],
          meta: { count: 2 },
          skip: 0,
          next: false
        })
      )
      expect(
        getDocumentFromState(store.getState(), 'io.cozy.todos', TODO_1._id)
      ).toEqual(TODO_1)
      const spy = jest.spyOn(global.console, 'warn').mockReturnValue(jest.fn())
      expect(
        getDocumentFromState(store.getState(), 'io.cozy.todos', 'WXYZ')
      ).toBe(null)
      spy.mockRestore()
    })

    it('should respect the query limit', () => {
      const query = new Q({
        doctype: 'io.cozy.todos',
        limit: 2
      })
      let queryResult
      store.dispatch(initQuery('Q1', query))
      store.dispatch(initQuery('Q2', query.offset(2)))
      store.dispatch(
        receiveQueryResult('Q1', {
          data: [TODO_1, TODO_2]
        })
      )
      store.dispatch(
        receiveQueryResult('Q2', {
          data: [TODO_3, TODO_4]
        })
      )
      // There are now 4 docs in the store
      expect(
        Object.keys(store.getState().cozy.documents['io.cozy.todos']).length
      ).toBe(4)
      // Q1 and Q2 only returns 2 todos because of the limit
      queryResult = getQueryFromStore(store, 'Q1')
      expect(queryResult.data.length).toBe(2)
      expect(queryResult.data.map(x => x._id)).toEqual(['todo_1', 'todo_2'])
      queryResult = getQueryFromStore(store, 'Q2')
      expect(queryResult.data.length).toBe(2)
      expect(queryResult.data.map(x => x._id)).toEqual(['todo_3', 'todo_4'])
    })

    it('should respect the query limit with sort', () => {
      const query = new Q({
        doctype: 'io.cozy.todos',
        limit: 2
      })
      let queryResult
      store.dispatch(initQuery('Q1', query.sortBy([{ label: 'asc' }])))
      store.dispatch(initQuery('Q2', query.sortBy([{ label: 'desc' }])))

      // Labels' ascending order, as defined in fixtures: TODO_3, TODO_1, TODO_4, TODO_2
      store.dispatch(
        receiveQueryResult('Q2', {
          data: [TODO_2, TODO_4]
        })
      )
      store.dispatch(
        receiveQueryResult('Q1', {
          data: [TODO_3, TODO_1]
        })
      )

      // There are now 4 docs in the store, ordered by their query arrival
      const todosInStore = store.getState().cozy.documents['io.cozy.todos']
      expect(Object.values(todosInStore)).toEqual([
        TODO_2,
        TODO_4,
        TODO_3,
        TODO_1
      ])
      // Q1 and Q2 retrieves the todos sorted by label, thanks to the sort in the store
      queryResult = getQueryFromStore(store, 'Q1')
      expect(
        queryResult.data.map(x => ({ _id: x._id, label: x.label }))
      ).toEqual([
        { _id: 'todo_3', label: 'Build stuff' },
        { _id: 'todo_1', label: 'Buy bread' }
      ])
      queryResult = getQueryFromStore(store, 'Q2')
      expect(
        queryResult.data.map(x => ({ _id: x._id, label: x.label }))
      ).toEqual([
        { _id: 'todo_4', label: 'Run a semi-marathon' },
        { _id: 'todo_2', label: 'Check email' }
      ])
    })

    it('should store a new doc received in a mutation result', () => {
      store.dispatch(
        receiveMutationResult('foo', {
          data: [TODO_1]
        })
      )
      expect(
        getDocumentFromState(store.getState(), 'io.cozy.todos', TODO_1._id)
      ).toEqual(TODO_1)
    })

    it('should store an updated doc received in a mutation result', () => {
      store.dispatch(
        receiveMutationResult('foo', {
          data: [TODO_1]
        })
      )
      store.dispatch(
        receiveMutationResult('bar', {
          data: [{ ...TODO_1, label: 'Buy croissants' }]
        })
      )
      expect(
        getDocumentFromState(store.getState(), 'io.cozy.todos', TODO_1._id)
          .label
      ).toBe('Buy croissants')
    })

    it('it should store documents with included from a mutation result', () => {
      store.dispatch(
        receiveMutationResult('foo', {
          data: [...TODO_WITH_RELATION.relationships.attachments.files],
          included: [FILE_1, FILE_2]
        })
      )

      expect(
        getDocumentFromState(store.getState(), 'io.cozy.files', FILE_1._id)
          .label
      ).toBe(FILE_1.label)
    })

    describe('deletion', () => {
      let originalWarn
      beforeEach(() => {
        originalWarn = console.warn
        console.warn = function (message) {
          if (
            message.includes(
              'getDocumentFromSlice: io.cozy.todos:todo_1 is absent'
            )
          ) {
            return
          } else {
            return originalWarn.apply(this, arguments)
          }
        }
      })

      afterEach(() => {
        console.warn = originalWarn
      })

      it('should remove a deleted doc received in a mutation result', () => {
        store.dispatch(
          receiveQueryResult('allTodos', {
            data: [TODO_1, TODO_2],
            meta: { count: 2 },
            skip: 0,
            next: false
          })
        )
        store.dispatch(
          receiveMutationResult(
            'foo',
            {
              data: [TODO_1]
            },
            {},
            {
              document: TODO_1,
              mutationType: 'DELETE_DOCUMENT'
            }
          )
        )
        expect(
          getDocumentFromState(store.getState(), 'io.cozy.todos', TODO_1._id)
        ).toBe(null)
        expect(store.getState().cozy.documents['io.cozy.todos']).toEqual({
          todo_2: {
            _id: 'todo_2',
            _rev: '2-4e015d830d3246e5a83b3466f437bf1f',
            _type: 'io.cozy.todos',
            done: false,
            label: 'Check email'
          }
        })
      })
    })
  })

  describe('getCollectionFromState', () => {
    it('should return null when the store is empty', () => {
      const spy = jest.spyOn(global.console, 'warn').mockReturnValue(jest.fn())
      expect(getCollectionFromState(store.getState(), 'io.cozy.todos')).toBe(
        null
      )
      spy.mockRestore()
    })

    it('should return all documents for the given doctype', () => {
      store.dispatch(
        receiveQueryResult('allTodos', {
          data: [TODO_1, TODO_2],
          meta: { count: 2 },
          skip: 0,
          next: false
        })
      )
      expect(getCollectionFromState(store.getState(), 'io.cozy.todos')).toEqual(
        [TODO_1, TODO_2]
      )
    })
  })

  describe('getQueryFromStore', () => {
    it('should return a default state when the store is empty', () => {
      expect(getQueryFromStore(store, 'allTodos')).toEqual({
        bookmark: null,
        definition: null,
        id: 'allTodos',
        fetchStatus: 'pending',
        isFetching: null,
        lastFetch: null,
        lastUpdate: null,
        lastError: null,
        lastErrorUpdate: null,
        hasMore: false,
        count: 0,
        fetchedPagesCount: 0,
        data: null,
        storeData: [],
        relationshipNames: []
      })
    })

    it('should have a `pending` status when the query has been initiated', async () => {
      const queryDef = { doctype: 'io.cozy.todos' }
      await store.dispatch(initQuery('allTodos', queryDef))
      const query = getQueryFromStore(store, 'allTodos')
      expect(query.fetchStatus).toBe('pending')
    })

    it('should have a `failed` status when an error occur', async () => {
      const queryDef = { doctype: 'io.cozy.todos' }
      await store.dispatch(initQuery('allTodos', queryDef))
      await store.dispatch(
        receiveQueryError('allTodos', new Error('fake error'))
      )
      const query = getQueryFromStore(store, 'allTodos')
      expect(query.fetchStatus).toBe('failed')
    })

    describe('when query results are received', () => {
      const INIT_DATE = 1000
      const FETCH_DATE = 2000

      beforeEach(async () => {
        jest.spyOn(Date, 'now').mockReturnValue(INIT_DATE)
        await store.dispatch(
          initQuery('allTodos', {
            doctype: 'io.cozy.todos'
          })
        )
        jest.spyOn(Date, 'now').mockReturnValue(FETCH_DATE)
        await store.dispatch(
          receiveQueryResult('allTodos', {
            data: [TODO_1, TODO_2],
            meta: { count: 2 },
            skip: 0,
            next: true
          })
        )
      })

      afterEach(() => {
        Date.now.mockRestore()
      })

      it('should have a `loaded` status', () => {
        const query = getQueryFromStore(store, 'allTodos')
        expect(query.fetchStatus).toBe('loaded')
      })

      it('should have a `count` that reflect the `meta.count` in the response', () => {
        const query = getQueryFromStore(store, 'allTodos')
        expect(query.count).toBe(2)
      })

      it('should have a `hasMore` that reflect the `next` in the response', () => {
        const query = getQueryFromStore(store, 'allTodos')
        expect(query.hasMore).toBe(true)
      })

      it('should have a `data` property containing the actual documents', () => {
        const query = getQueryFromStore(store, 'allTodos')
        expect(query.data).toEqual([TODO_1, TODO_2])
      })

      describe('when more query results are received', () => {
        beforeEach(async () => {
          await store.dispatch(
            receiveQueryResult('allTodos', {
              data: [TODO_3],
              meta: { count: 3 },
              skip: 2,
              next: false
            })
          )
        })

        it('should have a `hasMore` that reflect the `next` in the response', () => {
          const query = getQueryFromStore(store, 'allTodos')
          expect(query.hasMore).toBe(false)
        })

        it('should have a `data` property containing all received documents', () => {
          const query = getQueryFromStore(store, 'allTodos')
          expect(query.data).toEqual([TODO_1, TODO_2, TODO_3])
        })
      })

      describe('when a `update` option is given', () => {
        it('should be applied instead of the regular update', async () => {
          const spy = jest.fn()
          await store.dispatch(
            receiveQueryResult(
              'allTodos',
              {
                data: [TODO_3],
                meta: { count: 3 },
                skip: 2,
                next: false
              },
              {
                update: spy
              }
            )
          )
          expect(spy).toHaveBeenCalled()
        })
      })

      describe('when the query result have a `included` property', () => {
        beforeEach(async () => {
          await store.dispatch(
            receiveQueryResult('allTodos', {
              data: [
                {
                  ...TODO_1,
                  relationships: {
                    attachments: {
                      data: [
                        { _id: 'abc', _type: 'io.cozy.files' },
                        { _id: 'def', _type: 'io.cozy.files' }
                      ]
                    }
                  }
                },
                {
                  ...TODO_2,
                  relationships: {
                    attachments: {
                      data: [{ _id: 'xyz', _type: 'io.cozy.files' }]
                    }
                  }
                }
              ],
              included: [
                { _id: 'abc', _type: 'io.cozy.files', name: 'abc.png' },
                { _id: 'def', _type: 'io.cozy.files', name: 'def.png' },
                { _id: 'xyz', _type: 'io.cozy.files', name: 'xyz.png' }
              ],
              meta: { count: 2 },
              skip: 0,
              next: false
            })
          )
        })

        it('should persist `included` docs into the store', () => {
          expect(
            getDocumentFromState(store.getState(), 'io.cozy.files', 'abc')
          ).toEqual({ _id: 'abc', _type: 'io.cozy.files', name: 'abc.png' })
        })
      })

      it('should not update queries when the documents have not changed', async () => {
        const TODO_WITH_REV = { ...TODO_1, meta: { rev: 1 } }

        await store.dispatch(
          receiveQueryResult('allTodos', {
            data: TODO_WITH_REV,
            meta: { count: 1 },
            skip: 0
          })
        )
        const queryBefore = getQueryFromStore(store, 'allTodos')

        await store.dispatch(
          receiveQueryResult('allTodos', {
            data: TODO_WITH_REV,
            meta: { count: 1 },
            skip: 0
          })
        )
        const queryAfter = getQueryFromStore(store, 'allTodos')

        expect(queryBefore).toEqual(queryAfter)
      })
    })
  })

  describe('Mutations', () => {
    const INIT_DATE = 1000
    const UPDATE_DATE = 2000

    beforeEach(async () => {
      jest.spyOn(Date, 'now').mockReturnValue(INIT_DATE)
      await store.dispatch(
        initQuery('allTodos', new Q({ doctype: 'io.cozy.todos' }))
      )
      await store.dispatch(
        initQuery('allTodos2', new Q({ doctype: 'io.cozy.todos2' }))
      )

      await store.dispatch(
        receiveQueryResult('allTodos', {
          data: [TODO_1, TODO_2],
          meta: { count: 2 },
          skip: 0,
          next: true
        })
      )
      await store.dispatch(
        receiveQueryResult('allTodos2', {
          data: [{ ...TODO_1, _type: 'io.cozy.todos2' }],
          meta: { count: 2 },
          skip: 0,
          next: true
        })
      )
      Date.now.mockReturnValue(UPDATE_DATE)
    })

    afterEach(() => {
      Date.now.mockRestore()
    })

    describe('auto update', () => {
      it('should update all the queries that can contain the document (creation)', async () => {
        const result = {
          data: { ...TODO_1, done: true, _id: '1337', id: '1337' }
        }
        await store.dispatch(receiveMutationResult('foo', result))
        const query1 = getQueryFromStore(store, 'allTodos')
        const query2 = getQueryFromStore(store, 'allTodos2')
        expect(query1.data.find(doc => doc._id == '1337')).not.toBeUndefined()
        expect(query1.lastUpdate).toBe(UPDATE_DATE)
        expect(query2.lastUpdate).not.toBe(UPDATE_DATE)
      })

      it('should update all queries containing the documents (update)', async () => {
        const result = { data: { ...TODO_1, done: true, id: TODO_1._id } }
        await store.dispatch(receiveMutationResult('foo', result))
        const query1 = getQueryFromStore(store, 'allTodos')
        const query2 = getQueryFromStore(store, 'allTodos2')
        expect(query1.lastUpdate).toBe(UPDATE_DATE)
        expect(query2.lastUpdate).not.toBe(UPDATE_DATE)
      })

      it('should only update relevant queries (where)', async () => {
        const allTodos = new Q({ doctype: 'io.cozy.todos' })
        await store.dispatch(
          initQuery('doneTodos', allTodos.where({ done: true }))
        )
        await store.dispatch(
          initQuery('undoneTodos', allTodos.where({ done: false }))
        )
        const data = [TODO_1, TODO_2, TODO_3, TODO_4]
        await store.dispatch(
          receiveQueryResult('allTodos', {
            data: data,
            meta: { count: data.length },
            skip: 0,
            next: true
          })
        )
        const query1 = getQueryFromStore(store, 'doneTodos')
        const query2 = getQueryFromStore(store, 'undoneTodos')
        const sortById = arr => sortBy(arr, '_id')
        expect(sortById(query1.data)).toEqual(sortById([TODO_3, TODO_4]))
        expect(query1.lastUpdate).toBe(UPDATE_DATE)
        expect(query1.count).toBe(2)
        expect(sortById(query2.data)).toEqual(sortById([TODO_1, TODO_2]))
        expect(query2.lastUpdate).toBe(UPDATE_DATE)
        expect(query2.count).toBe(2)
      })

      it('should remove documents from queries that should not contain it', async () => {
        const allTodos = new Q({ doctype: 'io.cozy.todos' })
        await store.dispatch(
          initQuery('doneTodos', allTodos.where({ done: true }))
        )
        await store.dispatch(
          initQuery('undoneTodos', allTodos.where({ done: false }))
        )
        const data = [TODO_1, TODO_2, TODO_3, TODO_4]
        await store.dispatch(
          receiveQueryResult('allTodos', {
            data: data,
            meta: { count: data.length },
            skip: 0,
            next: true
          })
        )
        await store.dispatch(
          receiveQueryResult('allTodos', {
            data: [
              { ...TODO_1, done: true },
              { ...TODO_2, done: true }
            ],
            meta: { count: data.length },
            skip: 0,
            next: true
          })
        )
        const query1 = getQueryFromStore(store, 'doneTodos')
        const query2 = getQueryFromStore(store, 'undoneTodos')
        expect(query1.data.length).toBe(4)
        expect(query1.lastUpdate).toBe(UPDATE_DATE)
        expect(query2.data.length).toBe(0)
        expect(query2.lastUpdate).toBe(UPDATE_DATE)
      })
    })

    describe('updateQueries', () => {
      const NEW_TODO = {
        _id: 'azerty',
        _type: 'io.cozy.todos',
        label: 'Jettison boosters',
        done: false
      }

      it('should apply the updater function to the query existing data and the mutation result', async () => {
        const updater = jest.fn(() => [])
        const result = { data: [NEW_TODO] }
        await store.dispatch(
          receiveMutationResult('foo', result, {
            updateQueries: {
              allTodos: updater
            }
          })
        )
        expect(updater).toHaveBeenCalledWith([TODO_1, TODO_2], result)
      })

      it('should apply the update to the query data', async () => {
        const updater = (previousData, result) => [
          ...previousData.slice(0, 1),
          result.data[0],
          ...previousData.slice(1)
        ]
        const result = { data: [NEW_TODO] }
        await store.dispatch(
          receiveMutationResult('foo', result, {
            updateQueries: {
              allTodos: updater
            }
          })
        )
        const query = getQueryFromStore(store, 'allTodos')
        expect(query.data).toEqual([TODO_1, NEW_TODO, TODO_2])
      })
    })
  })

  describe('StoreProxy', () => {
    let proxy
    const QUERY = {
      definition: {
        doctype: 'io.cozy.todos'
      },
      data: [TODO_1._id, TODO_2._id],
      fetchStatus: 'loaded',
      hasMore: false,
      count: 2
    }

    beforeEach(() => {
      proxy = new StoreProxy({
        documents: {
          'io.cozy.todos': {
            [TODO_1._id]: TODO_1,
            [TODO_2._id]: TODO_2
          },
          'io.cozy.files': {
            abc: { _id: 'abc', _type: 'io.cozy.files', name: 'abc.pdf' },
            def: { _id: 'def', _type: 'io.cozy.files', name: 'def.png' }
          }
        },
        queries: {
          allTodos: QUERY
        }
      })
    })

    it('should read documents', () => {
      expect(proxy.readDocument('io.cozy.todos', TODO_1._id)).toEqual(TODO_1)
    })

    it('should write new documents', () => {
      proxy.writeDocument(TODO_3)
      expect(proxy.getState().documents['io.cozy.todos'][TODO_3._id]).toBe(
        TODO_3
      )
    })
  })
})
