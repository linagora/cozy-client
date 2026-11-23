jest.mock('./CozyStackClient')

import AppCollection from './AppCollection'
import { APPS_DOCTYPE } from './AppCollection'
import CozyStackClient from './CozyStackClient'
import { ALL_APPS_RESPONSE, GET_APPS_RESPONSE } from './__tests__/fixtures/apps'
import logger from './logger'
const FIXTURES = {
  ALL_APPS_RESPONSE,
  GET_APPS_RESPONSE
}
describe(`AppCollection`, () => {
  const client = new CozyStackClient()

  describe('all', () => {
    const collection = new AppCollection(client)

    beforeAll(() => {
      client.fetchJSON.mockReturnValue(
        Promise.resolve(FIXTURES.ALL_APPS_RESPONSE)
      )
    })

    it('should call the right route', async () => {
      await collection.all()
      expect(client.fetchJSON).toHaveBeenCalledWith('GET', '/apps/')
    })

    it('should return a correct JSON API response', async () => {
      const resp = await collection.all()
      expect(resp).toConformToJSONAPI()
    })

    it('should return normalized documents', async () => {
      const resp = await collection.all()
      expect(resp.data[0]).toHaveDocumentIdentity()
      expect(resp.data[0].id).toEqual('io.cozy.apps/drive')
    })

    it('should ignore id attribute in manifests', async () => {
      const resp = await collection.all()
      expect(
        resp.data.every(app => app.id === `${app._type}/${app.slug}`)
      ).toBe(true)
    })
  })

  describe('get', () => {
    const collection = new AppCollection(client)

    beforeAll(() => {
      client.fetchJSON.mockReturnValue(
        Promise.resolve(FIXTURES.GET_APPS_RESPONSE)
      )
    })

    it('should call the right route', async () => {
      await collection.get('io.cozy.apps/fakeid')
      expect(client.fetchJSON).toHaveBeenCalledWith('GET', '/apps/fakeid')
    })

    it('should return a correct JSON API response', async () => {
      const resp = await collection.get('io.cozy.apps/fakeid')
      expect(resp).toConformToJSONAPI()
    })

    it('should return normalized document', async () => {
      const resp = await collection.get('io.cozy.apps/fakeid')
      expect(resp.data).toHaveDocumentIdentity()
      expect(resp.data._type).toEqual(APPS_DOCTYPE)
    })

    describe('deprecated get call without <doctype>/', () => {
      beforeEach(() => {
        jest.spyOn(logger, 'warn').mockImplementation(() => {})
      })

      afterEach(() => {
        logger.warn.mockRestore()
      })
      it('should call the right route (deprecated call with <doctype>/)', async () => {
        await collection.get('fakeid')
        expect(client.fetchJSON).toHaveBeenCalledWith('GET', '/apps/fakeid')
      })
    })

    describe('get call with query argument', () => {
      const query = { sources: ['stack', 'registry'] }

      it('should throw an error if query.sources is not an array', async () => {
        const query = { sources: {} }
        await expect(
          collection.get('io.cozy.apps/fakeid', query)
        ).rejects.toThrow(
          'Invalid "sources" attribute passed in query, please use an array with at least one element.'
        )
      })

      it('should throw an error if query.sources is an empty array', async () => {
        const query = { sources: [] }
        await expect(
          collection.get('io.cozy.apps/fakeid', query)
        ).rejects.toThrow(
          'Invalid "sources" attribute passed in query, please use an array with at least one element.'
        )
      })

      it('should call stack with query {} or undefined', async () => {
        const query1 = {}
        await collection.get('io.cozy.apps/fakeid', query1)

        expect(client.fetchJSON).toHaveBeenCalledWith('GET', '/apps/fakeid')
        expect(client.fetchJSON).not.toHaveBeenCalledWith(
          'GET',
          '/registry/fakeid'
        )

        const query2 = undefined
        await collection.get('io.cozy.apps/fakeid', query2)

        expect(client.fetchJSON).toHaveBeenCalledWith('GET', '/apps/fakeid')
        expect(client.fetchJSON).not.toHaveBeenCalledWith(
          'GET',
          '/registry/fakeid'
        )
      })

      it('should fetch /apps/fakeid first and not /registry/fakeid if nothing went wrong', async () => {
        await collection.get('io.cozy.apps/fakeid', query)

        expect(client.fetchJSON).toHaveBeenCalledWith('GET', '/apps/fakeid')

        expect(client.fetchJSON).not.toHaveBeenCalledWith(
          'GET',
          '/registry/fakeid'
        )
      })

      it('should fetch /registry/fakeid if /apps/fakeid returns an error', async () => {
        jest
          .spyOn(client, 'fetchJSON')
          .mockRejectedValueOnce(new Error('Bad request'))

        await collection.get('io.cozy.apps/fakeid', query)

        expect(client.fetchJSON).toHaveBeenCalledWith('GET', '/apps/fakeid')
        expect(client.fetchJSON).toHaveBeenCalledWith('GET', '/registry/fakeid')
      })

      it('should return an app from stack if the fetch worked', async () => {
        const stackRes = {
          data: {
            id: 'fromStack',
            type: 'type',
            attributes: 'attributes'
          }
        }
        const registryRes = {
          id: 'fromRegistry',
          type: 'type',
          attributes: 'attributes'
        }

        jest
          .spyOn(client, 'fetchJSON')
          .mockResolvedValueOnce(stackRes)
          .mockResolvedValue(registryRes)

        const { data } = await collection.get('io.cozy.apps/fakeid', query)

        expect(data.id).toBe('fromStack')
      })

      it('should return app from registry if something went wrong in fetching stack', async () => {
        const registryRes = {
          id: 'fromRegistry',
          type: 'type',
          attributes: 'attributes'
        }

        jest
          .spyOn(client, 'fetchJSON')
          .mockRejectedValueOnce(new Error('Bad request'))
          .mockResolvedValue(registryRes)

        const { data } = await collection.get('io.cozy.apps/fakeid', query)

        expect(data.id).toBe('fromRegistry')
      })
    })

    describe('deprecated get call with "registry" source', () => {
      beforeEach(() => {
        jest.spyOn(logger, 'warn').mockImplementation(() => {})
      })
      afterEach(() => {
        logger.warn.mockRestore()
      })

      it('should call the right route (deprecated call with registry source)', async () => {
        await collection.get('io.cozy.apps/fakeid', { sources: ['registry'] })
        expect(client.fetchJSON).toHaveBeenCalledWith('GET', '/registry/fakeid')
        expect(logger.warn).toHaveBeenCalledWith(
          `The use of source registry is deprecated since it can polute the io.cozy.apps slice. For exemple, if we request data from the registry, than the app will be present in the io.cozy.apps slice and then the isInstalled() will return true.\n
            Use Q('io.cozy.apps_registry) instead`
        )
      })
    })
  })

  describe('create', () => {
    const collection = new AppCollection(client)

    it('should throw error', async () => {
      await expect(collection.create()).rejects.toThrowError(
        'create() method is not available for applications'
      )
    })
  })

  describe('update', () => {
    const collection = new AppCollection(client)

    it('should throw error', async () => {
      await expect(collection.update()).rejects.toThrowError(
        'update() method is not available for applications'
      )
    })
  })

  describe('destroy', () => {
    const collection = new AppCollection(client)

    it('should throw error', async () => {
      await expect(collection.destroy()).rejects.toThrowError(
        'destroy() method is not available for applications'
      )
    })
  })
})
