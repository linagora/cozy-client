import CozyStackClient from './CozyStackClient'
import SettingsCollection, { normalizeSettings } from './SettingsCollection'

describe('SettingsCollection', () => {
  const stackClient = new CozyStackClient()
  const collection = new SettingsCollection(stackClient)

  afterEach(() => {
    jest.resetAllMocks()
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  describe('get', () => {
    it('should call the appropriate route', async () => {
      jest.spyOn(stackClient, 'fetchJSON').mockResolvedValue({
        data: {}
      })

      await collection.get('instance')
      expect(stackClient.fetchJSON).toHaveBeenCalledWith(
        'GET',
        '/settings/instance'
      )

      await collection.get('io.cozy.settings.instance')
      expect(stackClient.fetchJSON).toHaveBeenCalledWith(
        'GET',
        '/settings/instance'
      )

      await collection.get('disk-usage')
      expect(stackClient.fetchJSON).toHaveBeenCalledWith(
        'GET',
        '/settings/disk-usage'
      )

      await collection.get('io.cozy.settings.bitwarden')
      expect(stackClient.fetchJSON).toHaveBeenCalledWith(
        'GET',
        '/data/io.cozy.settings/io.cozy.settings.bitwarden'
      )
    })

    it('should format bitwarden id', async () => {
      jest.spyOn(stackClient, 'fetchJSON').mockResolvedValueOnce({
        type: 'io.cozy.settings',
        _id: 'io.cozy.settings.bitwarden'
      })
      const bitwardenResp = await collection.get('io.cozy.settings.bitwarden')
      expect(bitwardenResp.data.id).toBe('io.cozy.settings.bitwarden')
      expect(bitwardenResp.data._id).toBe('io.cozy.settings.bitwarden')
    })

    it('should format correctly the response', async () => {
      jest.spyOn(stackClient, 'fetchJSON').mockResolvedValueOnce({
        data: {
          type: 'io.cozy.settings',
          id: 'io.cozy.settings.disk-usage'
        }
      })
      const resp = await collection.get('disk-usage')
      expect(resp.data.id).toBe('io.cozy.settings.disk-usage')

      jest.spyOn(stackClient, 'fetchJSON').mockResolvedValueOnce({
        data: {
          0: { id: 'client-0' },
          1: { id: 'client-1' }
        }
      })
      const clientsResp = await collection.get('clients')
      expect(clientsResp.data.id).toBe('/settings/clients')
    })

    it('should throw server error', async () => {
      jest
        .spyOn(stackClient, 'fetchJSON')
        .mockRejectedValue(new Error('Some problem'))

      await expect(collection.get('whatever')).rejects.toThrow()
    })
  })

  describe('update', () => {
    it('should call the appropriate route', async () => {
      jest.spyOn(stackClient, 'fetchJSON').mockResolvedValue({
        data: {}
      })

      await collection.update({ _id: 'io.cozy.settings.instance' })
      expect(stackClient.fetchJSON).toHaveBeenCalledWith(
        'PUT',
        '/settings/instance',
        {
          data: {
            _id: 'io.cozy.settings.instance'
          }
        }
      )

      await collection.update({ _id: 'instance' })
      expect(stackClient.fetchJSON).toHaveBeenCalledWith(
        'PUT',
        '/data/io.cozy.settings/instance',
        { _id: 'instance' }
      )
    })
  })

  describe('normalize a document', () => {
    it('should flatten attributes', () => {
      const resp = {
        attributes: {
          public_name: 'John'
        }
      }
      const normDoc = normalizeSettings(resp)
      expect(normDoc.public_name).toBe('John')
      expect(normDoc.attributes.public_name).toBe('John')
    })
  })
})
