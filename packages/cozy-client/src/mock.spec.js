import { Q } from 'cozy-client'

import { createFakeClient, createMockClient } from './mock'

describe('createFakeClient', () => {
  const simpsonsFixture = [
    { _id: 'homer', name: 'Homer' },
    { _id: 'marge', name: 'Marge' }
  ]

  it('should mock queries inside the store', () => {
    const client = createFakeClient({
      queries: {
        simpsons: {
          data: simpsonsFixture,
          doctype: 'io.cozy.simpsons'
        },
        simpsonsError: {
          doctype: 'io.cozy.simpsons',
          queryError: new Error('some error')
        }
      }
    })
    expect(
      client.getCollectionFromState('io.cozy.simpsons').map(x => x._id)
    ).toEqual(['homer', 'marge'])
    expect(client.getQueryFromState('simpsons').data.map(x => x._id)).toEqual([
      'homer',
      'marge'
    ])
    const errorQuery = client.getQueryFromState('simpsonsError')
    expect(errorQuery.fetchStatus).toBe('failed')
    expect(errorQuery.lastError).toStrictEqual(new Error('some error'))
  })

  it('should mock query with data passed in "remote" option', async () => {
    const client = createFakeClient({
      remote: {
        'io.cozy.simpsons': simpsonsFixture
      }
    })
    const simpsons = await client.query(Q('io.cozy.simpsons'))
    await expect(simpsons.data.map(x => x._id)).toEqual(['homer', 'marge'])
  })

  it('should mock query even if the doctype has not been mocked', async () => {
    const client = createFakeClient({
      remote: {
        'io.cozy.simpsons': simpsonsFixture
      }
    })
    const simpsons = await client.query(Q('io.cozy.adams'))
    await expect(simpsons.data.map(x => x._id)).toEqual([])
  })

  it('should mock function with clientFunctions', async () => {
    const client = createFakeClient({
      clientFunctions: {
        stackClient: {
          fetchJSON: () =>
            Promise.resolve({ data: [{ _id: 'homer', name: 'Homer' }] })
        }
      }
    })

    const simpsons = await client.stackClient.fetchJSON('io.cozy.simpsons')
    expect(simpsons.data).toEqual([{ _id: 'homer', name: 'Homer' }])
  })

  describe('createMockClient', () => {
    it('should mock basic client functions', async () => {
      const client = createMockClient()

      expect(JSON.stringify(client.query)).toEqual(JSON.stringify(jest.fn()))
      expect(JSON.stringify(client.save)).toEqual(JSON.stringify(jest.fn()))
      expect(JSON.stringify(client.saveAll)).toEqual(JSON.stringify(jest.fn()))
      expect(JSON.stringify(client.stackClient.fetchJSON)).toEqual(
        JSON.stringify(jest.fn())
      )
    })
  })
})
