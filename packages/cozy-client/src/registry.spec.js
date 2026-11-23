import CozyClient from 'cozy-client'

import Registry, { transformRegistryFormatToStackFormat } from './registry'
import termUtils from './terms'

jest.mock('./terms', () => ({
  save: jest.fn()
}))

describe('registry api', () => {
  let fetchJSON, client, api

  beforeEach(() => {
    fetchJSON = jest
      .fn()
      .mockImplementation(() => Promise.resolve({ apps: [] }))
    client = new CozyClient({
      stackClient: {
        fetchJSON,
        on: jest.fn(),
        removeListener: jest.fn()
      }
    })
    api = new Registry({ client })
    termUtils.save.mockReset()
  })

  const testApp = {
    slug: 'test-app',
    type: 'webapp'
  }

  const testKonn = {
    slug: 'test-konn',
    type: 'konnector'
  }

  describe('installation', () => {
    it('should call the right routes', async () => {
      await api.installApp(testApp)
      expect(termUtils.save).not.toHaveBeenCalled()
      expect(fetchJSON).toHaveBeenCalledWith('POST', '/apps/test-app')
    })

    it('should call the right routes (app with terms)', async () => {
      const app = {
        ...testApp,
        terms: {
          name: 'hello'
        }
      }
      await api.installApp(app)
      expect(termUtils.save).toHaveBeenCalledWith(client, app.terms)
      expect(fetchJSON).toHaveBeenCalledWith('POST', '/apps/test-app')
    })

    it('should call the right routes (app already installed)', async () => {
      const app = {
        ...testApp,
        installed: true
      }
      await api.installApp(app)
      expect(fetchJSON).toHaveBeenCalledWith(
        'PUT',
        '/apps/test-app?PermissionsAcked=true'
      )
    })

    it('should call the right routes (konnector)', async () => {
      await api.installApp(testKonn)
      expect(fetchJSON).toHaveBeenCalledWith('POST', '/konnectors/test-konn')
    })

    it('should call the right routes (custom source)', async () => {
      await api.installApp(testKonn, 'registry://test-konn/beta')
      expect(fetchJSON).toHaveBeenCalledWith(
        'POST',
        '/konnectors/test-konn?Source=registry%3A%2F%2Ftest-konn%2Fbeta'
      )
    })
  })

  describe('app uninstallation', () => {
    it('should call the correct routes (app)', async () => {
      await api.uninstallApp(testApp)
      expect(fetchJSON).toHaveBeenCalledWith('DELETE', '/apps/test-app')
    })

    it('should call the correct routes (konn)', async () => {
      await api.uninstallApp(testKonn)
      expect(fetchJSON).toHaveBeenCalledWith('DELETE', '/konnectors/test-konn')
    })

    it('should call the correct routes (node)', async () => {
      await api.uninstallApp({ ...testKonn, type: 'node' })
      expect(fetchJSON).toHaveBeenCalledWith('DELETE', '/konnectors/test-konn')
    })
  })

  describe('fetching', () => {
    it('should call the correct route', async () => {
      await api.fetchApps({ channel: 'beta' })
      expect(fetchJSON).toHaveBeenCalledWith(
        'GET',
        '/registry?limit=200&versionsChannel=beta&latestChannelVersion=beta'
      )
    })

    it('should handle the limit parameter', async () => {
      await api.fetchApps({ channel: 'dev', limit: 400 })
      expect(fetchJSON).toHaveBeenCalledWith(
        'GET',
        '/registry?limit=400&versionsChannel=dev&latestChannelVersion=dev'
      )
    })

    it('should call the correct route (filtering)', async () => {
      await api.fetchApps({ channel: 'beta', type: 'konnector' })
      expect(fetchJSON).toHaveBeenCalledWith(
        'GET',
        '/registry?limit=200&versionsChannel=beta&latestChannelVersion=beta&filter[type]=konnector'
      )
    })
  })

  describe('fetchAppVersion', () => {
    it('should call the correct route when a channel is given', async () => {
      await api.fetchAppVersion({ channel: 'stable', slug: 'ameli' })
      expect(fetchJSON).toHaveBeenCalledWith(
        'GET',
        '/registry/ameli/stable/latest'
      )
    })
    it('should call the correct route when a specific version is given', async () => {
      await api.fetchAppVersion({ version: '1.1.1', slug: 'mgen' })
      expect(fetchJSON).toHaveBeenCalledWith('GET', '/registry/mgen/1.1.1')
    })
    it('should call the correct route when neither a version or a channel is given', async () => {
      await api.fetchAppVersion({ slug: 'impots' })
      expect(fetchJSON).toHaveBeenCalledWith(
        'GET',
        '/registry/impots/stable/latest'
      )
    })
  })
})

describe('transformRegistryFormatToStackFormat', () => {
  it('should add "id" and "attributes" properties', () => {
    const registryRes = {
      latest_version: { manifest: { name: 'name', source: 'source' } },
      type: 'konnector'
    }
    const stackFormat = {
      id: 'source',
      attributes: { name: 'name', source: 'source' },
      latest_version: { manifest: { name: 'name', source: 'source' } },
      type: 'konnector'
    }

    expect(transformRegistryFormatToStackFormat(registryRes)).toEqual(
      stackFormat
    )
  })
})
