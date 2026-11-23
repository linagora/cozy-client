import CozyClient from './CozyClient'
import { SCHEMA, TODO_1, TODO_2 } from './__tests__/fixtures'
import CozyLink from './links/CozyLink'
import { defaultPerformanceApi } from './performances/defaultPerformanceApi'
import { createStore, getQueryFromStore } from './store'
import { receiveQueryResult, initQuery } from './store/queries'

describe('Associations', () => {
  const requestHandler = jest.fn()
  const persistHandler = jest.fn()
  const link = new CozyLink(requestHandler, persistHandler)
  const client = new CozyClient({ links: [link], schema: SCHEMA })

  const getTodo = id =>
    client
      .hydrateDocuments(
        'io.cozy.todos',
        [client.getDocumentFromState('io.cozy.todos', id)],
        'allTodos'
      )
      .shift()

  beforeEach(async () => {
    const store = createStore(defaultPerformanceApi)
    client.setStore(store, { force: true })
    await store.dispatch(initQuery('allTodos', { doctype: 'io.cozy.todos' }))
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
                ],
                next: true,
                meta: { count: 4 }
              }
            }
          },
          TODO_2
        ],
        included: [
          {
            _id: 'abc',
            _type: 'io.cozy.files',
            name: 'abc.jpg',
            attributes: {
              metadata: {
                datetime: '2019-01-01'
              }
            }
          },
          {
            _id: 'def',
            _type: 'io.cozy.files',
            name: 'def.png',
            attributes: {
              metadata: {
                datetime: '2019-01-02'
              }
            }
          }
        ]
      })
    )
  })

  describe('HasMany', () => {
    it('should return data', () => {
      expect(getTodo(TODO_1._id).attachments.data).toEqual([
        {
          _id: 'abc',
          _type: 'io.cozy.files',
          name: 'abc.jpg',
          attributes: {
            metadata: {
              datetime: '2019-01-01'
            }
          }
        },
        {
          _id: 'def',
          _type: 'io.cozy.files',
          name: 'def.png',
          attributes: {
            metadata: {
              datetime: '2019-01-02'
            }
          }
        }
      ])
    })

    it('should return count', () => {
      expect(getTodo(TODO_1._id).attachments.count).toBe(4)
    })

    it('should be able to fetchMore data', async () => {
      const FAKE_RESPONSE = {
        data: [
          {
            _id: 'def',
            _type: 'io.cozy.files',
            name: 'def.png',
            attributes: {
              metadata: {
                datetime: '2019-01-02'
              }
            }
          },
          { _id: 'ghi', _type: 'io.cozy.files' },
          { _id: 'jkl', _type: 'io.cozy.files' }
        ],
        included: [
          { _id: 'ghi', _type: 'io.cozy.files', name: 'ghi.jpg' },
          { _id: 'jkl', _type: 'io.cozy.files', name: 'jkl.png' }
        ],
        next: false
      }
      requestHandler.mockResolvedValueOnce(FAKE_RESPONSE)

      const queryBefore = getQueryFromStore(client.store, 'allTodos')
      await getTodo(TODO_1._id).attachments.fetchMore()
      expect(getTodo(TODO_1._id).attachments.data).toEqual([
        {
          _id: 'abc',
          _type: 'io.cozy.files',
          name: 'abc.jpg',
          attributes: {
            metadata: {
              datetime: '2019-01-01'
            }
          }
        },
        {
          _id: 'def',
          _type: 'io.cozy.files',
          name: 'def.png',
          attributes: {
            metadata: {
              datetime: '2019-01-02'
            }
          }
        },
        { _id: 'ghi', _type: 'io.cozy.files', name: 'ghi.jpg' },
        { _id: 'jkl', _type: 'io.cozy.files', name: 'jkl.png' }
      ])
      const queryAfter = getQueryFromStore(client.store, 'allTodos')
      expect(queryBefore.lastUpdate).toBeLessThan(queryAfter.lastUpdate)
    })
  })
})
