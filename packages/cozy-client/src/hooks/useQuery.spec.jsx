import { renderHook } from '@testing-library/react-hooks'

import CozyClient from '../CozyClient'
import CozyLink from '../links/CozyLink'
import { Q } from '../queries/dsl'
import simpsonsFixture from '../testing/simpsons.json'
import { setupClient, makeWrapper } from '../testing/utils'
import useQuery, { useQueries } from './useQuery'

/**
 * @param {object} Options options
 * @param {object=} Options.customClient custom Client
 * @param {object=} Options.queryDefinition custom Querydef
 * @param {object=} Options.queryOptions custom QueryOpts
 * @param {object=} Options.storeQueries custome StoreQueries
 * @returns
 */
const setupQuery = ({
  customClient,
  queryDefinition,
  queryOptions,
  storeQueries
}) => {
  const client = customClient || setupClient({ queries: storeQueries })
  const hookResult = renderHook(() => useQuery(queryDefinition, queryOptions), {
    wrapper: makeWrapper(client)
  })
  return { client, hookResult }
}

const setupQueries = ({ querySpecs }) => {
  const client = setupClient()
  const hookResult = renderHook(() => useQueries(querySpecs), {
    wrapper: makeWrapper(client)
  })
  return { client, hookResult }
}

describe('use query', () => {
  it('should return the correct data', () => {
    const {
      hookResult: {
        result: { current }
      }
    } = setupQuery({
      queryOptions: {
        as: 'simpsons'
      },
      queryDefinition: () => Q('io.cozy.simpsons')
    })
    expect(current).toMatchObject({
      data: [
        expect.objectContaining({ name: 'Homer' }),
        expect.objectContaining({ name: 'Marge' })
      ],
      definition: expect.objectContaining({
        doctype: 'io.cozy.simpsons'
      })
    })
  })
  it('should respect the enable property', () => {
    const { client } = setupQuery({
      queryOptions: {
        as: 'simpsons',
        enabled: false
      },
      queryDefinition: () => Q('io.cozy.simpsons')
    })
    expect(client.query).not.toHaveBeenCalled()
  })
  it('should respect not throw error if the qDef contains a getById with null', () => {
    const {
      client,
      hookResult: {
        result: { current }
      }
    } = setupQuery({
      queryOptions: {
        as: 'simpsonsTest',
        enabled: false
      },
      queryDefinition: () => Q('io.cozy.simpsons').getById(null)
    })
    expect(client.query).not.toThrowError()
    expect(current.fetchStatus).toEqual('pending')
  })
  it('should share the same API than ObservableQuery', () => {
    const {
      hookResult: {
        result: { current }
      }
    } = setupQuery({
      queryOptions: {
        as: 'simpsons'
      },
      queryDefinition: () => Q('io.cozy.simpsons')
    })
    expect(current).toMatchObject({
      data: [
        expect.objectContaining({ name: 'Homer' }),
        expect.objectContaining({ name: 'Marge' })
      ],
      definition: expect.objectContaining({
        doctype: 'io.cozy.simpsons'
      })
    })

    expect(Object.keys(current)).toEqual(
      expect.arrayContaining([
        'id',
        'definition',
        'fetchStatus',
        'isFetching',
        'lastFetch',
        'lastUpdate',
        'lastErrorUpdate',
        'lastError',
        'hasMore',
        'count',
        'fetchedPagesCount',
        'data',
        'storeData',
        'relationshipNames',
        'bookmark',
        'options',
        'fetchMore',
        'fetch'
      ])
    )
  })
  it('should query through the client in context', () => {
    const { client } = setupQuery({
      queryOptions: {
        as: 'simpsons'
      },
      queryDefinition: () => Q('io.cozy.simpsons')
    })
    expect(client.query).toHaveBeenCalled()
  })

  it('should not query through the client in context if enabled is set to false', () => {
    const { client } = setupQuery({
      queryOptions: {
        as: 'simpsons',
        enabled: false
      },
      queryDefinition: () => Q('io.cozy.simpsons')
    })
    expect(client.query).not.toHaveBeenCalled()
  })

  it('should return a single doc data for a single doc query if singleDocData is provided', () => {
    const {
      hookResult: {
        result: { current }
      }
    } = setupQuery({
      queryOptions: {
        as: 'simpsons/marge',
        singleDocData: true
      },
      queryDefinition: () => Q('io.cozy.simpsons').getById('marge')
    })
    expect(current).toMatchObject({
      data: expect.objectContaining({ name: 'Marge' }),
      definition: expect.objectContaining({
        doctype: 'io.cozy.simpsons',
        id: 'marge'
      })
    })
  })

  it('should return an array for data for a single doc query if singleDocData is not provided', () => {
    const {
      hookResult: {
        result: { current }
      }
    } = setupQuery({
      queryOptions: {
        as: 'simpsons/marge'
      },
      queryDefinition: () => Q('io.cozy.simpsons').getById('marge')
    })
    expect(current.data.length).toBe(1)
    expect(current).toMatchObject({
      data: expect.arrayContaining([
        expect.objectContaining({ name: 'Marge' })
      ]),
      definition: expect.objectContaining({
        doctype: 'io.cozy.simpsons',
        id: 'marge'
      })
    })
  })

  it('fetches more results with bookmark', async () => {
    const bookmark = 'bookmark-123'
    const queryDefinition = Q('io.cozy.simpsons')
    const {
      hookResult: {
        result: { current }
      },
      client
    } = setupQuery({
      queryOptions: {
        as: 'simpsonsBookmarked'
      },
      queryDefinition: () => queryDefinition,
      storeQueries: {
        simpsonsBookmarked: {
          data: simpsonsFixture,
          doctype: 'io.cozy.simpsons',
          definition: queryDefinition,
          bookmark
        }
      }
    })

    const fetchMoreResult = await current.fetchMore()
    const lastCallArgs =
      client.query.mock.calls[client.query.mock.calls.length - 1][0]
    expect(lastCallArgs).toMatchObject({ bookmark })
    expect(fetchMoreResult).toEqual({ data: null })
  })

  it('fetches more results with skip', async () => {
    const {
      hookResult: {
        result: { current }
      },
      client
    } = setupQuery({
      queryOptions: {
        as: 'simpsons'
      },
      queryDefinition: () => Q('io.cozy.simpsons')
    })

    const fetchMoreResult = await current.fetchMore()
    const lastCallArgs =
      client.query.mock.calls[client.query.mock.calls.length - 1][0]
    expect(lastCallArgs).toMatchObject({ skip: current.data.length })
    expect(fetchMoreResult).toEqual({ data: null })
  })

  it('should call onError callback when an error is thrown. Callback passed as argument', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => null)
    const requestHandler = jest.fn()
    const client = new CozyClient({
      links: [new CozyLink(requestHandler)]
    })
    const error = new TypeError('Failed to fetch')
    requestHandler.mockRejectedValue(error)
    const onError = jest.fn().mockReturnValue(() => true)
    setupQuery({
      customClient: client,
      queryOptions: {
        as: 'fake-query',
        onError
      },
      queryDefinition: () => Q('io.cozy.todos')
    })

    // TODO find a better alternative
    setTimeout(() => {
      expect(onError).toBeCalled()
    }, 100)
  })
})

describe('use queries', () => {
  it('should return the correct data', () => {
    const {
      hookResult: {
        result: { current }
      }
    } = setupQueries({
      querySpecs: {
        simpsons: {
          query: () => Q('io.cozy.simpsons'),
          as: 'simpsons'
        },
        upperSimpsons: {
          query: () => Q('io.cozy.simpsons-upper'),
          as: 'upperSimpsons'
        }
      }
    })
    expect(current).toMatchObject({
      simpsons: {
        data: [
          expect.objectContaining({ name: 'Homer' }),
          expect.objectContaining({ name: 'Marge' })
        ],
        definition: expect.objectContaining({
          doctype: 'io.cozy.simpsons'
        })
      },
      upperSimpsons: {
        data: [
          expect.objectContaining({ name: 'HOMER' }),
          expect.objectContaining({ name: 'MARGE' })
        ],
        definition: expect.objectContaining({
          doctype: 'io.cozy.simpsons-upper'
        })
      }
    })
  })
})
