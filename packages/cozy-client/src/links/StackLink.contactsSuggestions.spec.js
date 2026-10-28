import CozyClient from '../CozyClient'
import fetchPolicies from '../policies'
import { Q } from '../queries/dsl'
import StackLink from './StackLink'

const doctype = 'io.cozy.contacts.suggestions'

describe('contact suggestion queries', () => {
  let client, link, suggest
  beforeEach(() => {
    link = new StackLink()
    client = new CozyClient({ links: [link], schema: {} })
    suggest = client.getStackClient().collection().suggest
    suggest.mockReset()
  })

  const query = (q, limit = 20) => ({
    definition: Q(doctype).suggestContacts(q, { limit }),
    options: { as: `${doctype}/q/${q}/limit/${limit}`, singleDocData: true }
  })

  it('isolates mixed suggestions from document caches and replaces stale results', async () => {
    const suggestions = [
      { _type: 'io.cozy.contacts.groups', _id: 'team', name: 'Team' },
      {
        _type: 'io.cozy.contacts',
        fullname: 'Alice',
        email: [{ address: 'alice@example.org' }]
      }
    ]
    suggest
      .mockResolvedValueOnce({ data: suggestions })
      .mockResolvedValueOnce({ data: [] })
    const first = await client.fetchQueryAndGetFromState(query('al'))
    expect(first.data.suggestions).toEqual(suggestions)
    expect(first.hasMore).toBe(false)
    expect(
      client.store.getState().cozy.documents['io.cozy.contacts']
    ).toBeUndefined()
    expect(
      client.store.getState().cozy.documents['io.cozy.contacts.groups']
    ).toBeUndefined()
    const refreshed = await client.fetchQueryAndGetFromState(query('al'))
    expect(refreshed.data.suggestions).toEqual([])
  })

  it('keeps different queries and limits independent', async () => {
    suggest.mockImplementation(async (q, { limit }) => ({
      data: [{ fullname: `${q}:${limit}` }]
    }))
    await client.fetchQueryAndGetFromState(query('al', 10))
    await client.fetchQueryAndGetFromState(query('al', 20))
    await client.fetchQueryAndGetFromState(query('bo', 10))
    expect(
      client.getQueryFromState(query('al', 10).options.as, {
        singleDocData: true
      }).data.suggestions
    ).toEqual([{ fullname: 'al:10' }])
    expect(suggest).toHaveBeenCalledWith('al', { limit: 10 })
  })

  it('reuses a fresh cached search without another request', async () => {
    suggest.mockResolvedValue({ data: [] })
    const cachedQuery = query('al')
    cachedQuery.options.fetchPolicy = fetchPolicies.olderThan(30 * 1000)
    await client.fetchQueryAndGetFromState(cachedQuery)
    const cached = await client.fetchQueryAndGetFromState(cachedQuery)
    expect(cached.data.suggestions).toEqual([])
    expect(suggest).toHaveBeenCalledTimes(1)
  })

  it('does not send offline suggestions to a local document database', async () => {
    link.isOnline = jest.fn().mockResolvedValue(false)
    const forward = jest.fn()
    await expect(
      link.request(query('al').definition, {}, null, forward)
    ).rejects.toThrow('cannot be fetched offline')
    expect(forward).not.toHaveBeenCalled()
    expect(suggest).not.toHaveBeenCalled()
  })
})
