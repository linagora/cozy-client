jest.mock('./CozyStackClient')

import CozyStackClient from './CozyStackClient'
import SharingCollection, { getSharingRules } from './SharingCollection'

const FOLDER = {
  _type: 'io.cozy.files',
  _id: 'folder_1',
  type: 'directory',
  name: 'bills'
}

const FILE = {
  _type: 'io.cozy.files',
  _id: 'file_1',
  type: 'file',
  name: 'File 1'
}
const RECIPIENT = {
  _type: 'io.cozy.contacts',
  _id: 'contact_1',
  attributes: {
    email: [{ address: 'jdoe@doe.com', primary: true }]
  }
}
const ORGANIZATION = {
  _type: 'com.bitwarden.organizations',
  _id: 'SOME_ORGANIZATION_ID',
  name: 'SOME_ORGANIZATION_NAME'
}

const SHARING = {
  _id: 'sharing_1'
}
describe('SharingCollection', () => {
  const client = new CozyStackClient()
  const collection = new SharingCollection('io.cozy.sharings', client)

  describe('get', () => {
    it('should call the right route', async () => {
      client.fetchJSON.mockResolvedValue({ data: [] })
      await collection.get('1')
      expect(client.fetchJSON).toHaveBeenCalledWith('GET', '/sharings/1')
    })
  })
  describe('findByDoctype', () => {
    beforeEach(() => {
      client.fetch.mockReset()
      client.fetchJSON.mockResolvedValue({ data: [] })
    })

    it('should call the right route', async () => {
      await collection.findByDoctype('io.cozy.files')
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'GET',
        '/sharings/doctype/io.cozy.files?shared_docs=true'
      )
    })
  })

  describe('share', () => {
    beforeEach(() => {
      jest.spyOn(console, 'warn').mockImplementation(() => {})
      client.fetch.mockReset()
      client.fetchJSON.mockResolvedValue({ data: [] })
    })

    it('should create a sharing with read-only policy and set members to read-only too and set the previewPath for a folder', async () => {
      const document = FOLDER
      const readOnlyRecipients = [RECIPIENT]
      const description = 'foo'
      const previewPath = '/preview'
      const openSharing = false

      await collection.create({
        document,
        readOnlyRecipients,
        description,
        previewPath,
        openSharing,
        rules: [
          {
            add: 'push',
            doctype: 'io.cozy.files',
            remove: 'push',
            title: FOLDER.name,
            update: 'push',
            values: [FOLDER._id]
          }
        ]
      })

      expect(client.fetchJSON).toHaveBeenCalledWith('POST', '/sharings/', {
        data: {
          attributes: {
            description,
            open_sharing: openSharing,
            preview_path: previewPath,
            rules: [
              {
                add: 'push',
                doctype: 'io.cozy.files',
                remove: 'push',
                title: FOLDER.name,
                update: 'push',
                values: [FOLDER._id]
              }
            ]
          },
          relationships: {
            read_only_recipients: {
              data: [{ id: 'contact_1', type: 'io.cozy.contacts' }]
            }
          },
          type: 'io.cozy.sharings'
        }
      })
    })

    it('should create a sharing with read-only policy and set members to read-only too and set the previewPath for a file', async () => {
      const document = FILE
      const readOnlyRecipients = [RECIPIENT]
      const description = 'foo'
      const previewPath = '/preview'
      const openSharing = false

      await collection.create({
        document,
        readOnlyRecipients,
        description,
        previewPath,
        openSharing,
        rules: getSharingRules(document)
      })

      expect(client.fetchJSON).toHaveBeenCalledWith('POST', '/sharings/', {
        data: {
          attributes: {
            description,
            open_sharing: openSharing,
            preview_path: previewPath,
            rules: [
              {
                doctype: 'io.cozy.files',
                remove: 'revoke',
                title: FILE.name,
                update: 'sync',
                values: [FILE._id]
              }
            ]
          },
          relationships: {
            read_only_recipients: {
              data: [{ id: 'contact_1', type: 'io.cozy.contacts' }]
            }
          },
          type: 'io.cozy.sharings'
        }
      })
    })

    it('should create a sharing with read/write policy and set members to read/write too and set the previewPath for a file', async () => {
      const document = FILE
      const recipients = [RECIPIENT]
      const description = 'foo'
      const previewPath = '/preview'
      const openSharing = true

      await collection.create({
        document,
        recipients,
        description,
        previewPath,
        openSharing,
        rules: getSharingRules(document)
      })

      expect(client.fetchJSON).toHaveBeenCalledWith('POST', '/sharings/', {
        data: {
          attributes: {
            description,
            open_sharing: openSharing,
            preview_path: previewPath,
            rules: [
              {
                doctype: 'io.cozy.files',
                remove: 'revoke',
                title: FILE.name,
                update: 'sync',
                values: [FILE._id]
              }
            ]
          },
          relationships: {
            recipients: {
              data: [{ id: 'contact_1', type: 'io.cozy.contacts' }]
            }
          },
          type: 'io.cozy.sharings'
        }
      })
    })

    it('should create a sharing with read/write policy and set members to read/write too and set the previewPath for a folder', async () => {
      const document = FOLDER
      const recipients = [RECIPIENT]
      const description = 'foo'
      const previewPath = '/preview'
      const openSharing = true

      await collection.create({
        document,
        recipients,
        description,
        previewPath,
        openSharing,
        rules: getSharingRules(document)
      })

      expect(client.fetchJSON).toHaveBeenCalledWith('POST', '/sharings/', {
        data: {
          attributes: {
            description,
            open_sharing: openSharing,
            preview_path: previewPath,
            rules: [
              {
                add: 'sync',
                doctype: 'io.cozy.files',
                remove: 'sync',
                title: FOLDER.name,
                update: 'sync',
                values: [FOLDER._id]
              }
            ]
          },
          relationships: {
            recipients: {
              data: [{ id: 'contact_1', type: 'io.cozy.contacts' }]
            }
          },
          type: 'io.cozy.sharings'
        }
      })
    })
  })

  describe('create', () => {
    beforeEach(() => {
      client.fetch.mockReset()
      client.fetchJSON.mockResolvedValue({ data: [] })
    })

    it('should creates a sharing for a folder with the most open rules but with only read only recipients', async () => {
      const sharingDesc = 'foo'
      const openSharing = true
      const previewPath = '/preview'
      await collection.create({
        document: FOLDER,
        readOnlyRecipients: [RECIPIENT],
        openSharing,
        previewPath,
        description: sharingDesc
      })

      expect(client.fetchJSON).toHaveBeenCalledWith('POST', '/sharings/', {
        data: {
          attributes: {
            description: sharingDesc,
            open_sharing: openSharing,
            preview_path: previewPath,
            rules: [
              {
                add: 'sync',
                doctype: 'io.cozy.files',
                remove: 'sync',
                title: FOLDER.name,
                update: 'sync',
                values: [FOLDER._id]
              }
            ]
          },
          relationships: {
            read_only_recipients: {
              data: [{ id: 'contact_1', type: 'io.cozy.contacts' }]
            }
          },
          type: 'io.cozy.sharings'
        }
      })
    })

    it('should creates a sharing for a filer with the most open rules but with only read only recipients', async () => {
      const sharingDesc = 'foo'
      const openSharing = true
      const previewPath = '/preview'
      await collection.create({
        document: FILE,
        readOnlyRecipients: [RECIPIENT],
        openSharing,
        previewPath,
        description: sharingDesc
      })

      expect(client.fetchJSON).toHaveBeenCalledWith('POST', '/sharings/', {
        data: {
          attributes: {
            description: sharingDesc,
            open_sharing: openSharing,
            preview_path: previewPath,
            rules: [
              {
                doctype: 'io.cozy.files',
                remove: 'revoke',
                title: FILE.name,
                update: 'sync',
                values: [FILE._id]
              }
            ]
          },
          relationships: {
            read_only_recipients: {
              data: [{ id: 'contact_1', type: 'io.cozy.contacts' }]
            }
          },
          type: 'io.cozy.sharings'
        }
      })
    })

    it('should creates a sharing for a filer with the most open rules  with recipients', async () => {
      const sharingDesc = 'foo'
      const openSharing = true
      const previewPath = '/preview'
      await collection.create({
        document: FILE,
        recipients: [RECIPIENT],
        openSharing,
        previewPath,
        description: sharingDesc
      })

      expect(client.fetchJSON).toHaveBeenCalledWith('POST', '/sharings/', {
        data: {
          attributes: {
            description: sharingDesc,
            open_sharing: openSharing,
            preview_path: previewPath,
            rules: [
              {
                doctype: 'io.cozy.files',
                remove: 'revoke',
                title: FILE.name,
                update: 'sync',
                values: [FILE._id]
              }
            ]
          },
          relationships: {
            recipients: {
              data: [{ id: 'contact_1', type: 'io.cozy.contacts' }]
            }
          },
          type: 'io.cozy.sharings'
        }
      })
    })
    it('should creates a sharing with the appSlug', async () => {
      const sharingDesc = 'foo'
      const openSharing = true
      const previewPath = '/preview'
      const appSlug = 'mySlugApp'
      await collection.create({
        document: FILE,
        recipients: [RECIPIENT],
        openSharing,
        previewPath,
        description: sharingDesc,
        appSlug
      })

      expect(client.fetchJSON).toHaveBeenCalledWith('POST', '/sharings/', {
        data: {
          attributes: {
            description: sharingDesc,
            open_sharing: openSharing,
            preview_path: previewPath,
            app_slug: appSlug,
            rules: [
              {
                doctype: 'io.cozy.files',
                remove: 'revoke',
                title: FILE.name,
                update: 'sync',
                values: [FILE._id]
              }
            ]
          },
          relationships: {
            recipients: {
              data: [{ id: 'contact_1', type: 'io.cozy.contacts' }]
            }
          },
          type: 'io.cozy.sharings'
        }
      })
    })

    it('should creates a sharing for an organization with the most open rules, no preview and with recipients', async () => {
      const sharingDesc = 'foos'
      const openSharing = true
      const previewPath = undefined
      await collection.create({
        document: ORGANIZATION,
        recipients: [RECIPIENT],
        openSharing,
        previewPath,
        description: sharingDesc
      })

      expect(client.fetchJSON).toHaveBeenCalledWith('POST', '/sharings/', {
        data: {
          attributes: {
            description: sharingDesc,
            open_sharing: openSharing,
            preview_path: undefined,
            rules: [
              {
                title: 'SOME_ORGANIZATION_NAME',
                doctype: 'com.bitwarden.organizations',
                values: ['SOME_ORGANIZATION_ID'],
                add: 'sync',
                update: 'sync',
                remove: 'revoke'
              },
              {
                title: 'Ciphers',
                doctype: 'com.bitwarden.ciphers',
                values: ['SOME_ORGANIZATION_ID'],
                add: 'sync',
                update: 'sync',
                remove: 'sync',
                selector: 'organization_id'
              }
            ]
          },
          relationships: {
            recipients: {
              data: [{ id: 'contact_1', type: 'io.cozy.contacts' }]
            }
          },
          type: 'io.cozy.sharings'
        }
      })
    })
  })

  describe('createSharedDrive', () => {
    beforeEach(() => {
      client.fetch.mockReset()
      client.fetchJSON.mockResolvedValue({ data: [] })
    })

    it('should call POST /sharings/drives with folder_id and description', async () => {
      await collection.createSharedDrive({
        document: FOLDER,
        recipients: [RECIPIENT],
        description: 'shared drive'
      })

      expect(client.fetchJSON).toHaveBeenCalledWith(
        'POST',
        '/sharings/drives',
        {
          data: {
            attributes: {
              folder_id: FOLDER._id,
              description: 'shared drive'
            },
            relationships: {
              recipients: {
                data: [{ id: 'contact_1', type: 'io.cozy.contacts' }]
              }
            }
          }
        }
      )
    })

    it('should support read only recipients', async () => {
      await collection.createSharedDrive({
        document: FOLDER,
        readOnlyRecipients: [RECIPIENT],
        description: 'test'
      })

      expect(client.fetchJSON).toHaveBeenCalledWith(
        'POST',
        '/sharings/drives',
        {
          data: {
            attributes: {
              folder_id: FOLDER._id,
              description: 'test'
            },
            relationships: {
              read_only_recipients: {
                data: [{ id: 'contact_1', type: 'io.cozy.contacts' }]
              }
            }
          }
        }
      )
    })

    it('should be called when create is called with sharedDrive: true', async () => {
      const spy = jest.spyOn(collection, 'createSharedDrive')
      spy.mockResolvedValue({ data: [] })

      await collection.create({
        document: FOLDER,
        recipients: [RECIPIENT],
        description: 'test',
        sharedDrive: true
      })

      expect(spy).toHaveBeenCalledWith({
        document: FOLDER,
        description: 'test',
        recipients: [RECIPIENT],
        readOnlyRecipients: []
      })

      spy.mockRestore()
    })
  })

  describe('revokeAllRecipients', () => {
    beforeEach(() => {
      client.fetch.mockReset()
      client.fetchJSON.mockResolvedValue({ data: [] })
    })

    it('should call the right route', async () => {
      await collection.revokeAllRecipients(SHARING)
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'DELETE',
        `/sharings/${SHARING._id}/recipients`
      )
    })
  })

  describe('revokeGroup', () => {
    beforeEach(() => {
      client.fetch.mockReset()
      client.fetchJSON.mockResolvedValue({ data: [] })
    })

    it('should call the right route', async () => {
      await collection.revokeGroup(SHARING, 1)
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'DELETE',
        `/sharings/${SHARING._id}/groups/1`
      )
    })
  })

  describe('addRecipients', () => {
    beforeEach(() => {
      client.fetch.mockReset()
      client.fetchJSON.mockResolvedValue({ data: [] })
    })

    it('handle the recipients option', async () => {
      await collection.addRecipients({
        document: SHARING,
        recipients: [RECIPIENT]
      })
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'POST',
        `/sharings/${SHARING._id}/recipients`,
        {
          data: {
            id: SHARING._id,
            relationships: {
              recipients: {
                data: [{ id: 'contact_1', type: 'io.cozy.contacts' }]
              }
            },
            type: 'io.cozy.sharings'
          }
        }
      )
    })
    it('should accept the readOnlyRecipients option', async () => {
      await collection.addRecipients({
        document: SHARING,
        readOnlyRecipients: [RECIPIENT]
      })
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'POST',
        `/sharings/${SHARING._id}/recipients`,
        {
          data: {
            id: SHARING._id,
            relationships: {
              read_only_recipients: {
                data: [{ id: 'contact_1', type: 'io.cozy.contacts' }]
              }
            },
            type: 'io.cozy.sharings'
          }
        }
      )
    })
    it('should accept both options', async () => {
      await collection.addRecipients({
        document: SHARING,
        readOnlyRecipients: [RECIPIENT],
        recipients: [RECIPIENT]
      })
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'POST',
        `/sharings/${SHARING._id}/recipients`,
        {
          data: {
            id: SHARING._id,
            relationships: {
              read_only_recipients: {
                data: [{ id: 'contact_1', type: 'io.cozy.contacts' }]
              },
              recipients: {
                data: [{ id: 'contact_1', type: 'io.cozy.contacts' }]
              }
            },
            type: 'io.cozy.sharings'
          }
        }
      )
    })
  })

  describe('getDiscoveryLink', () => {
    it('should call the route without a shortcut param', () => {
      client.fullpath.mockImplementation(path => path)
      const result = collection.getDiscoveryLink('sharingID', 'abc123')
      expect(result).toBe('/sharings/sharingID/discovery?sharecode=abc123')
    })
    it('should call the route with a shortcut param', () => {
      client.fullpath.mockImplementation(path => path)
      const result = collection.getDiscoveryLink('sharingID', 'abc123', {
        shortcut: true
      })
      expect(result).toBe(
        '/sharings/sharingID/discovery?sharecode=abc123&shortcut=true'
      )
    })
  })

  describe('renameSharedDrive', () => {
    beforeEach(() => {
      client.fetch.mockReset()
      client.fetchJSON.mockResolvedValue({ data: [] })
    })

    it('should call the right route with correct parameters', () => {
      const sharing = {
        _id: 'sharing_123',
        rules: [
          {
            values: ['folder_456']
          }
        ]
      }
      const newName = 'New Folder Name'

      collection.renameSharedDrive(sharing, newName)

      expect(client.fetchJSON).toHaveBeenCalledWith(
        'PATCH',
        '/sharings/drives/sharing_123/folder_456',
        {
          data: {
            type: 'io.cozy.files',
            id: 'folder_456',
            attributes: {
              name: 'New Folder Name'
            }
          }
        }
      )
    })
  })
})
