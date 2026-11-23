import CozyStackClient from './CozyStackClient'
import OAuthClientsCollection from './OAuthClientsCollection'
import { FetchError } from './errors'

const DEFAULT_LIMIT = 100

describe('OAuthClientsCollection', () => {
  const setup = () => {
    const stackClient = new CozyStackClient()
    stackClient.uri = 'http://cozy.localhost'
    const collection = new OAuthClientsCollection(stackClient)

    return { stackClient, collection }
  }

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('all', () => {
    const { stackClient, collection } = setup()

    it('should call the appropriate route', async () => {
      jest.spyOn(stackClient, 'fetchJSON').mockResolvedValue({
        data: [],
        links: {},
        meta: { count: 0 }
      })

      await collection.all()
      expect(stackClient.fetchJSON).toHaveBeenCalledWith(
        'GET',
        `/settings/clients?page[limit]=${DEFAULT_LIMIT}`
      )
    })

    it('should normalize documents', async () => {
      jest.spyOn(stackClient, 'fetchJSON').mockResolvedValue({
        data: [{ _id: '1', attributes: { client_kind: 'desktop' } }],
        links: {},
        meta: { count: 1 }
      })
      const result = await collection.all()
      expect(result.data).toEqual([
        {
          _id: '1',
          _type: 'io.cozy.oauth.clients',
          id: '1',
          client_kind: 'desktop',
          attributes: { client_kind: 'desktop' }
        }
      ])
      expect(result.next).toBe(false)
    })

    describe('when data is paginated', () => {
      const RESPONSE = {
        data: [
          { id: '1', attributes: { client_kind: 'desktop' } },
          { id: '2', attributes: { client_kind: 'mobile' } }
        ],
        links: {
          next: '/settings/clients?page[cursor]=bookmark-id-123'
        },
        meta: {
          count: 4
        }
      }

      beforeEach(() => {
        jest.spyOn(stackClient, 'fetchJSON').mockResolvedValue(RESPONSE)
      })

      afterEach(() => {
        stackClient.fetchJSON.mockReset()
      })

      it('should return a pagination bookmark', async () => {
        const result = await collection.all()
        expect(result.data).toEqual([
          {
            _id: '1',
            _type: 'io.cozy.oauth.clients',
            id: '1',
            client_kind: 'desktop',
            attributes: {
              client_kind: 'desktop'
            }
          },
          {
            _id: '2',
            _type: 'io.cozy.oauth.clients',
            id: '2',
            client_kind: 'mobile',
            attributes: {
              client_kind: 'mobile'
            }
          }
        ])
        expect(result.next).toBe(true)
        expect(result.bookmark).toBe('bookmark-id-123')
      })
    })
  })

  describe('get', () => {
    const { stackClient, collection } = setup()

    describe('when requested document is in first results page', () => {
      beforeEach(() => {
        jest.spyOn(stackClient, 'fetchJSON').mockResolvedValue({
          data: [
            { id: '1', attributes: { client_kind: 'desktop' } },
            { id: '2', attributes: { client_kind: 'mobile' } }
          ],
          links: {},
          meta: {
            count: 2
          }
        })
      })

      afterEach(() => {
        stackClient.fetchJSON.mockReset()
      })

      it('should call the appropriate route', async () => {
        await collection.get('1')
        expect(stackClient.fetchJSON).toHaveBeenCalledWith(
          'GET',
          `/settings/clients?page[limit]=${DEFAULT_LIMIT}`
        )
      })

      it('should return the normalized client document whose _id was given', async () => {
        const result1 = await collection.get('1')
        expect(result1.data).toEqual({
          _id: '1',
          _type: 'io.cozy.oauth.clients',
          id: '1',
          client_kind: 'desktop',
          attributes: {
            client_kind: 'desktop'
          }
        })

        const result2 = await collection.get('2')
        expect(result2.data).toEqual({
          _id: '2',
          _type: 'io.cozy.oauth.clients',
          id: '2',
          client_kind: 'mobile',
          attributes: {
            client_kind: 'mobile'
          }
        })
      })
    })

    describe('when requested document is not in first results page', () => {
      beforeEach(() => {
        jest
          .spyOn(stackClient, 'fetchJSON')
          .mockResolvedValueOnce({
            data: [{ id: '1', attributes: { client_kind: 'desktop' } }],
            links: {
              next: '/settings/clients?page[cursor]=bookmark-id-123'
            },
            meta: {}
          })
          .mockResolvedValueOnce({
            data: [{ id: '2', attributes: { client_kind: 'mobile' } }],
            links: {},
            meta: {}
          })
      })

      afterEach(() => {
        stackClient.fetchJSON.mockReset()
      })

      it('should fetch the next page', async () => {
        await collection.get('2')
        expect(stackClient.fetchJSON).toHaveBeenCalledWith(
          'GET',
          `/settings/clients?page[limit]=${DEFAULT_LIMIT}`
        )
        expect(stackClient.fetchJSON).toHaveBeenCalledWith(
          'GET',
          `/settings/clients?page[limit]=${DEFAULT_LIMIT}&page[cursor]=bookmark-id-123`
        )
      })

      it('should return the normalized document in the end', async () => {
        const result = await collection.get('2')
        expect(result.data).toEqual({
          _id: '2',
          _type: 'io.cozy.oauth.clients',
          id: '2',
          client_kind: 'mobile',
          attributes: {
            client_kind: 'mobile'
          }
        })
      })
    })

    describe('when no documents have the given id', () => {
      beforeEach(() => {
        jest.spyOn(stackClient, 'fetchJSON').mockResolvedValue({
          data: [],
          links: {},
          meta: {}
        })
      })

      afterEach(() => {
        stackClient.fetchJSON.mockReset()
      })

      it('should throw a Not Found error', async () => {
        await expect(collection.get('2')).rejects.toThrow(
          new FetchError({}, 'Not Found')
        )
      })
    })
  })

  describe('destroy', () => {
    const { stackClient, collection } = setup()
    const client = {
      _id: '1',
      attributes: { client_kind: 'desktop' }
    }

    beforeEach(() => {
      jest.spyOn(stackClient, 'fetchJSON').mockResolvedValue()
    })

    it('should call the appropriate route', async () => {
      await collection.destroy(client)
      expect(stackClient.fetchJSON).toHaveBeenCalledWith(
        'DELETE',
        '/settings/clients/1'
      )
    })

    it('should add _deleted to the normalized document', async () => {
      const result = await collection.destroy(client)
      expect(result.data).toEqual({
        ...client,
        id: '1',
        _type: 'io.cozy.oauth.clients',
        client_kind: 'desktop',
        _deleted: true
      })
    })
  })
})
