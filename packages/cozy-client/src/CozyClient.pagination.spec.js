import CozyClient from './CozyClient'
import { Q } from './queries/dsl'
import { receiveQueryResult } from './store'

describe('query pagination during a refresh', () => {
  const setup = (backgroundFetching = true) => {
    const client = new CozyClient({ backgroundFetching })
    const query = Q('io.cozy.todos').limitBy(1)
    const documents = ['1', '2', '3'].map(_id => ({
      _id,
      _rev: '1-a',
      _type: 'io.cozy.todos'
    }))
    client.ensureQueryExists('todos', query)
    client.dispatch(
      receiveQueryResult('todos', {
        data: [documents[0]],
        next: true,
        bookmark: 'page2'
      })
    )
    const requests = []
    client.requestQuery = jest.fn(
      definition =>
        new Promise((resolve, reject) => {
          requests.push({ definition, resolve, reject })
        })
    )
    return { client, query, documents, requests }
  }

  it.each([
    [false, 'bookmark', 'before'],
    [false, 'bookmark', 'after'],
    [true, 'bookmark', 'before'],
    [true, 'bookmark', 'after'],
    [false, 'offset', 'before'],
    [false, 'offset', 'after'],
    [true, 'offset', 'before'],
    [true, 'offset', 'after']
  ])(
    'ignores old pages with backgroundFetching=%s and %s pagination resolving %s the refresh',
    async (backgroundFetching, pagination, order) => {
      const { client, query, documents, requests } = setup(backgroundFetching)
      const pageQuery =
        pagination === 'bookmark'
          ? query.offsetBookmark('page2')
          : query.offset(1)
      const oldPage = client.query(pageQuery, { as: 'todos' })
      const refresh = client.query(query, {
        as: 'todos',
        backgroundFetching: true
      })
      expect(requests).toHaveLength(2)

      const finishOldPage = async () => {
        requests[0].resolve({ data: [documents[2]], next: false })
        await oldPage
        expect(client.getQueryFromState('todos').data).toEqual([documents[0]])
        expect(client.getQueryFromState('todos').hasMore).toBe(true)
        expect(client.getDocumentFromState('io.cozy.todos', '3')).toBe(null)
      }
      if (order === 'before') {
        await finishOldPage()
      }
      requests[1].resolve({
        data: [documents[0]],
        next: true,
        bookmark: 'page2'
      })
      await refresh
      if (order === 'after') {
        await finishOldPage()
      }

      const nextPage = client.query(pageQuery, { as: 'todos' })
      requests[2].resolve({ data: [documents[1]], next: false })
      await nextPage
      expect(client.getQueryFromState('todos').data).toEqual(
        documents.slice(0, 2)
      )
      expect(client.getQueryFromState('todos').hasMore).toBe(false)
    }
  )

  it('does not reuse an old page request when the refreshed cursor is the same', async () => {
    const { client, query, documents, requests } = setup()
    const pageQuery = query.offsetBookmark('page2')
    const oldPage = client.query(pageQuery, { as: 'todos' })
    const refresh = client.query(query, { as: 'todos' })
    requests[1].resolve({ data: [documents[0]], next: true, bookmark: 'page2' })
    await refresh

    const newPage = client.query(pageQuery, { as: 'todos' })
    expect(requests).toHaveLength(3)
    requests[2].resolve({ data: [documents[1]], next: false })
    await newPage
    requests[0].resolve({ data: [documents[2]], next: true, bookmark: 'old' })
    await oldPage

    expect(client.getQueryFromState('todos').data).toEqual(
      documents.slice(0, 2)
    )
    expect(client.getQueryFromState('todos').hasMore).toBe(false)
  })

  it('ignores an obsolete page error without failing the refreshed query', async () => {
    const { client, query, documents, requests } = setup()
    const onError = jest.fn()
    const oldPage = client.query(query.offsetBookmark('page2'), {
      as: 'todos',
      onError
    })
    const refresh = client.query(query, { as: 'todos' })
    requests[1].resolve({ data: [documents[0]], next: false })
    await refresh
    requests[0].reject(new Error('obsolete request failed'))
    await oldPage

    expect(client.getQueryFromState('todos').fetchStatus).toBe('loaded')
    expect(client.getQueryFromState('todos').lastError).toBe(null)
    expect(onError).not.toHaveBeenCalled()
  })
})
