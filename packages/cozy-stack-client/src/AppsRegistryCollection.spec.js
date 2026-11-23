jest.mock('./CozyStackClient')

import AppsRegistryCollection, {
  APPS_REGISTRY_DOCTYPE
} from './AppsRegistryCollection'
import CozyStackClient from './CozyStackClient'

describe(`AppsRegistryCollection`, () => {
  const client = new CozyStackClient()

  describe('get', () => {
    const collection = new AppsRegistryCollection(client)

    beforeAll(() => {
      client.fetchJSON.mockReturnValue(
        Promise.resolve({
          type: 'io.cozy.apps_registry',
          id: '5396fc6',
          latest_version: {
            manifest: {
              source: 'source.notes'
            }
          }
        })
      )
    })

    it('should call the right route', async () => {
      await collection.get('io.cozy.apps_registry/fakeid')
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'GET',
        '/registry/io.cozy.apps_registry/fakeid'
      )
    })

    it('should return a correct JSON API response', async () => {
      const resp = await collection.get('io.cozy.apps_registry/fakeid')
      expect(resp).toConformToJSONAPI()
    })

    it('should return normalized document', async () => {
      const resp = await collection.get('io.cozy.apps_registry/fakeid')
      expect(resp.data).toHaveDocumentIdentity()
      expect(resp.data._type).toEqual(APPS_REGISTRY_DOCTYPE)
    })

    it('should always return an id', async () => {
      client.fetchJSON.mockReturnValue(
        Promise.resolve({
          slug: 'dummy',
          type: 'konnector',
          maintenance_activated: true,
          latest_version: {
            manifest: {
              manifestVersion: 1,
              source: 'git://github.com/konnectors/dummy.git'
            }
          }
        })
      )

      const resp = await collection.get('app')

      expect(resp.data).toStrictEqual({
        _id: 'io.cozy.konnectors/dummy',
        id: 'io.cozy.konnectors/dummy',
        _type: 'io.cozy.apps_registry',
        attributes: {
          manifestVersion: 1,
          source: 'git://github.com/konnectors/dummy.git'
        },
        maintenance_activated: true,
        slug: 'dummy',
        type: 'konnector',
        latest_version: {
          manifest: {
            manifestVersion: 1,
            source: 'git://github.com/konnectors/dummy.git'
          }
        }
      })
    })

    it('should return list of apps in maintenance', async () => {
      client.fetchJSON.mockReturnValue(
        Promise.resolve([
          {
            _id: 'app1',
            slug: 'app1',
            type: 'webapp',
            maintenance_activated: true
          },
          {
            maintenance_activated: true,
            slug: 'konnector1',
            type: 'konnector'
          }
        ])
      )

      const resp = await collection.get('maintenance')

      expect(resp.data).toHaveLength(2)
      expect(resp.data).toStrictEqual([
        {
          _id: 'io.cozy.apps/app1',
          _type: 'io.cozy.apps_registry',
          id: 'io.cozy.apps/app1',
          slug: 'app1',
          type: 'webapp',
          maintenance_activated: true,
          attributes: {}
        },
        {
          _id: 'io.cozy.konnectors/konnector1',
          _type: 'io.cozy.apps_registry',
          id: 'io.cozy.konnectors/konnector1',
          maintenance_activated: true,
          slug: 'konnector1',
          type: 'konnector',
          attributes: {}
        }
      ])
    })
  })

  describe('create', () => {
    const collection = new AppsRegistryCollection(client)

    it('should throw error', async () => {
      await expect(collection.create()).rejects.toThrowError(
        'create() method is not available for AppsRegistryCollection'
      )
    })
  })

  describe('destroy', () => {
    const collection = new AppsRegistryCollection(client)

    it('should throw error', async () => {
      await expect(collection.destroy()).rejects.toThrowError(
        'destroy() method is not available for AppsRegistryCollection'
      )
    })
  })
})
