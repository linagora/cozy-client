import * as mocks from '../__tests__/mocks'
import { Q } from '../queries/dsl'
import {
  editSettings,
  getSettings,
  normalizeSettings,
  saveAfterFetchSettings
} from './settings'

describe('settings', () => {
  describe('getSettings', () => {
    it('should get settings for cozy-home', async () => {
      const client = mocks.client()

      client.fetchQueryAndGetFromState.mockResolvedValue({
        data: [
          {
            some_key: 'some_value'
          }
        ]
      })

      // @ts-ignore
      const result = await getSettings(client, 'home', ['some_key'])

      const query = {
        definition: Q('io.cozy.home.settings').limitBy(1),
        options: {
          as: 'io.cozy.home.settings',
          fetchPolicy: expect.anything(),
          singleDocData: true
        }
      }
      expect(client.fetchQueryAndGetFromState).toHaveBeenCalledWith({
        definition: query.definition,
        options: query.options
      })
      expect(result.some_key).toEqual('some_value')
    })

    it('should get settings for mespapiers', async () => {
      const client = mocks.client()

      client.fetchQueryAndGetFromState.mockResolvedValue({
        data: [
          {
            some_mespapiers_key: 'some_mespapiers_value'
          }
        ]
      })

      const result = await getSettings(
        // @ts-ignore
        client,
        'mespapiers',
        ['some_mespapiers_key']
      )

      const query = {
        definition: Q('io.cozy.mespapiers.settings').limitBy(1),
        options: {
          as: 'io.cozy.mespapiers.settings',
          fetchPolicy: expect.anything(),
          singleDocData: true
        }
      }
      expect(client.fetchQueryAndGetFromState).toHaveBeenCalledWith({
        definition: query.definition,
        options: query.options
      })
      expect(result.some_mespapiers_key).toEqual('some_mespapiers_value')
    })

    it('should get settings for instance', async () => {
      const client = mocks.client()

      client.fetchQueryAndGetFromState.mockResolvedValue({
        data: [
          {
            some_global_key: 'some_global_value'
          }
        ]
      })

      // @ts-ignore
      const result = await getSettings(client, 'instance', ['some_global_key'])

      const query = {
        definition: Q('io.cozy.settings').getById('io.cozy.settings.instance'),
        options: {
          as: 'io.cozy.settings/io.cozy.settings.instance',
          fetchPolicy: expect.anything(),
          singleDocData: true
        }
      }
      expect(client.fetchQueryAndGetFromState).toHaveBeenCalledWith({
        definition: query.definition,
        options: query.options
      })
      expect(result.some_global_key).toEqual('some_global_value')
    })

    it('should get settings for passwords', async () => {
      const client = mocks.client()

      client.fetchQueryAndGetFromState.mockResolvedValue({
        data: [
          {
            some_pass_key: 'some_pass_value'
          }
        ]
      })

      // @ts-ignore
      const result = await getSettings(client, 'passwords', ['some_pass_key'])

      const query = {
        definition: Q('io.cozy.settings').getById('io.cozy.settings.bitwarden'),
        options: {
          as: 'io.cozy.settings/io.cozy.settings.bitwarden',
          fetchPolicy: expect.anything(),
          singleDocData: true
        }
      }
      expect(client.fetchQueryAndGetFromState).toHaveBeenCalledWith({
        definition: query.definition,
        options: query.options
      })
      expect(result.some_pass_key).toEqual('some_pass_value')
    })

    it('should return undefined if no setting is found in database', async () => {
      const client = mocks.client()

      client.fetchQueryAndGetFromState.mockResolvedValue({
        data: [
          {
            some_other_key: 'some_other_value'
          }
        ]
      })

      // @ts-ignore
      const result = await getSettings(client, 'home', ['some_key'])

      expect(result.some_key).toBeUndefined()
    })

    it('should get settings for multiple keys', async () => {
      const client = mocks.client()

      client.fetchQueryAndGetFromState.mockResolvedValue({
        data: [
          {
            some_key_1: 'some_value_1',
            some_key_2: 'some_value_2',
            some_key_3: 'some_value_3'
          }
        ]
      })

      // @ts-ignore
      const result = await getSettings(client, 'home', [
        'some_key_1',
        'some_key_2'
      ])

      const query = {
        definition: Q('io.cozy.home.settings').limitBy(1),
        options: {
          as: 'io.cozy.home.settings',
          fetchPolicy: expect.anything(),
          singleDocData: true
        }
      }
      expect(client.fetchQueryAndGetFromState).toHaveBeenCalledWith({
        definition: query.definition,
        options: query.options
      })
      expect(result.some_key_1).toEqual('some_value_1')
      expect(result.some_key_2).toEqual('some_value_2')
      // @ts-ignore
      expect(result.some_key_3).toBeUndefined()
    })
  })

  describe('saveAfterFetchSettings', () => {
    it('should set settings for instance', async () => {
      const client = mocks.client()

      client.fetchQueryAndGetFromState.mockResolvedValue({
        data: [
          {
            id: 'io.cozy.settings.instance',
            _id: 'io.cozy.settings.instance',
            _type: 'io.cozy.settings',
            type: 'io.cozy.settings',
            attributes: {
              some_setting: 'some_setting_value',
              some_instance_key: 'some_instance_value'
            },
            meta: {
              rev: 'SOME_UNIQ_REV_NUMBER'
            },
            some_setting: 'some_setting_value',
            some_instance_key: 'some_instance_value'
          }
        ]
      })

      await saveAfterFetchSettings(
        // @ts-ignore
        client,
        'instance',
        {
          some_instance_key: 'some_new_instance_value'
        }
      )

      const query = {
        definition: Q('io.cozy.settings').getById('io.cozy.settings.instance'),
        options: {
          as: 'io.cozy.settings/io.cozy.settings.instance',
          fetchPolicy: expect.anything(),
          singleDocData: true
        }
      }
      expect(client.fetchQueryAndGetFromState).toHaveBeenCalledWith({
        definition: query.definition,
        options: query.options
      })
      expect(client.save).toHaveBeenCalledWith({
        id: 'io.cozy.settings.instance',
        _id: 'io.cozy.settings.instance',
        _type: 'io.cozy.settings',
        type: 'io.cozy.settings',
        _rev: 'SOME_UNIQ_REV_NUMBER',
        attributes: {
          some_setting: 'some_setting_value',
          some_instance_key: 'some_new_instance_value'
        },
        some_setting: 'some_setting_value',
        some_instance_key: 'some_new_instance_value',
        meta: {
          rev: 'SOME_UNIQ_REV_NUMBER'
        }
      })
    })

    it('should set settings for passwords', async () => {
      const client = mocks.client()

      client.fetchQueryAndGetFromState.mockResolvedValue({
        data: [
          {
            _type: 'io.cozy.passwords.settings',
            some_pass_key: 'some_pass_value'
          }
        ]
      })

      await saveAfterFetchSettings(
        // @ts-ignore
        client,
        'passwords',
        { some_pass_key: 'some_new_pass_value' }
      )

      const query = {
        definition: Q('io.cozy.settings').getById('io.cozy.settings.bitwarden'),
        options: {
          as: 'io.cozy.settings/io.cozy.settings.bitwarden',
          fetchPolicy: expect.anything(),
          singleDocData: true
        }
      }
      expect(client.fetchQueryAndGetFromState).toHaveBeenCalledWith({
        definition: query.definition,
        options: query.options
      })
      expect(client.save).toHaveBeenCalledWith({
        _type: 'io.cozy.passwords.settings',
        some_pass_key: 'some_new_pass_value'
      })
    })

    it('should set settings for passwords even if key does not exist', async () => {
      const client = mocks.client()

      client.fetchQueryAndGetFromState.mockResolvedValue({
        data: [
          {
            _type: 'io.cozy.passwords.settings',
            some_existing_pass_key: 'some_pass_value'
          }
        ]
      })

      await saveAfterFetchSettings(
        // @ts-ignore
        client,
        'passwords',
        { some_new_pass_key: 'some_new_pass_value' }
      )

      const query = {
        definition: Q('io.cozy.settings').getById('io.cozy.settings.bitwarden'),
        options: {
          as: 'io.cozy.settings/io.cozy.settings.bitwarden',
          fetchPolicy: expect.anything(),
          singleDocData: true
        }
      }
      expect(client.fetchQueryAndGetFromState).toHaveBeenCalledWith({
        definition: query.definition,
        options: query.options
      })
      expect(client.save).toHaveBeenCalledWith({
        _type: 'io.cozy.passwords.settings',
        some_existing_pass_key: 'some_pass_value',
        some_new_pass_key: 'some_new_pass_value'
      })
    })

    it('should set settings for passwords using method', async () => {
      const client = mocks.client()

      client.fetchQueryAndGetFromState.mockResolvedValue({
        data: [
          {
            _type: 'io.cozy.passwords.settings',
            some_pass_key: 1
          }
        ]
      })

      await saveAfterFetchSettings(
        // @ts-ignore
        client,
        'passwords',
        currentValue => ({
          ...currentValue,
          some_pass_key: currentValue.some_pass_key + 1
        }),
        ['some_pass_key']
      )

      const query = {
        definition: Q('io.cozy.settings').getById('io.cozy.settings.bitwarden'),
        options: {
          as: 'io.cozy.settings/io.cozy.settings.bitwarden',
          fetchPolicy: expect.anything(),
          singleDocData: true
        }
      }
      expect(client.fetchQueryAndGetFromState).toHaveBeenCalledWith({
        definition: query.definition,
        options: query.options
      })
      expect(client.save).toHaveBeenCalledWith({
        _type: 'io.cozy.passwords.settings',
        some_pass_key: 2
      })
    })
  })

  describe('normalizeSettings', () => {
    it('should normalize data array into object', () => {
      const result = normalizeSettings([
        {
          id: 'SOME_DOCUMENT_ID',
          _id: 'SOME_DOCUMENT_ID',
          _type: 'io.cozy.home.settings',
          _rev: 'SOME_DOCUMENT_REV',
          cozyMetadata: {
            createdAt: '2024-04-03T15:00:48.961Z',
            metadataVersion: 1,
            updatedAt: '2024-04-03T15:00:48.961Z',
            updatedByApps: []
          },
          some_attribue: true
        }
      ])

      expect(result).toStrictEqual({
        id: 'SOME_DOCUMENT_ID',
        _id: 'SOME_DOCUMENT_ID',
        _type: 'io.cozy.home.settings',
        _rev: 'SOME_DOCUMENT_REV',
        cozyMetadata: {
          createdAt: '2024-04-03T15:00:48.961Z',
          metadataVersion: 1,
          updatedAt: '2024-04-03T15:00:48.961Z',
          updatedByApps: []
        },
        some_attribue: true
      })
    })

    it('should normalize data object into object', () => {
      const result = normalizeSettings({
        id: 'io.cozy.settings.instance',
        _id: 'io.cozy.settings.instance',
        _type: 'io.cozy.settings',
        type: 'io.cozy.settings',
        attributes: {
          some_attributes: 'some_value'
        },
        meta: {
          rev: '2-8803d6fda4bd3216e3fbeb0a181979d5'
        },
        links: {
          self: '/settings/instance'
        },
        some_attributes: 'some_value'
      })

      expect(result).toStrictEqual({
        id: 'io.cozy.settings.instance',
        _id: 'io.cozy.settings.instance',
        _type: 'io.cozy.settings',
        type: 'io.cozy.settings',
        attributes: {
          some_attributes: 'some_value'
        },
        meta: {
          rev: '2-8803d6fda4bd3216e3fbeb0a181979d5'
        },
        links: {
          self: '/settings/instance'
        },
        some_attributes: 'some_value'
      })
    })
  })
  describe('editSettings', () => {
    it('should inject value into settings', () => {
      const result = editSettings(
        'passwords',
        {
          _type: 'io.cozy.passwords.settings',
          some_pass_key: 'some_pass_value'
        },
        { some_pass_key: 'some_new_pass_value' }
      )

      expect(result).toStrictEqual({
        _type: 'io.cozy.passwords.settings',
        some_pass_key: 'some_new_pass_value'
      })
    })

    it('should inject _rev value and edit attributes for instance settings', () => {
      const result = editSettings(
        'instance',
        {
          id: 'io.cozy.settings.instance',
          _id: 'io.cozy.settings.instance',
          _type: 'io.cozy.settings',
          type: 'io.cozy.settings',
          attributes: {
            some_setting: 'some_setting_value',
            some_instance_key: 'some_instance_value'
          },
          meta: {
            rev: 'SOME_UNIQ_REV_NUMBER'
          },
          some_setting: 'some_setting_value',
          some_instance_key: 'some_instance_value'
        },
        { some_instance_key: 'some_new_instance_value' }
      )

      expect(result).toStrictEqual({
        id: 'io.cozy.settings.instance',
        _id: 'io.cozy.settings.instance',
        _type: 'io.cozy.settings',
        type: 'io.cozy.settings',
        _rev: 'SOME_UNIQ_REV_NUMBER',
        attributes: {
          some_setting: 'some_setting_value',
          some_instance_key: 'some_new_instance_value'
        },
        some_setting: 'some_setting_value',
        some_instance_key: 'some_new_instance_value',
        meta: {
          rev: 'SOME_UNIQ_REV_NUMBER'
        }
      })
    })
  })
})
