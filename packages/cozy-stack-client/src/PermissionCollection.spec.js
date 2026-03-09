jest.mock('./CozyStackClient')

import CozyStackClient from './CozyStackClient'
import PermissionCollection, { getPermissionsFor } from './PermissionCollection'

const fixtures = {
  permission: {
    test: {
      type: 'io.cozy.todos',
      verbs: ['GET', 'PUT', 'DELETE']
    }
  }
}

describe('PermissionCollection', () => {
  const client = new CozyStackClient()
  const collection = new PermissionCollection('io.cozy.permissions', client)

  describe('Permissions', () => {
    beforeAll(() => {
      client.fetch.mockReset()
      client.fetchJSON.mockResolvedValue({ data: [] })
    })
    describe('create', () => {
      it('calls with the right args', async () => {
        await collection.create({
          _type: 'io.cozy.permissions',
          _id: 'a340d5e0d64711e6b66c5fc9ce1e17c6',
          codes: 'a,b'
        })
        expect(client.fetchJSON).toHaveBeenCalledWith(
          'POST',
          '/permissions?codes=a%2Cb',
          { data: { attributes: {}, type: 'io.cozy.permissions' } }
        )

        await collection.create({
          _type: 'io.cozy.permissions',
          _id: 'a340d5e0d64711e6b66c5fc9ce1e17c6'
        })
        expect(client.fetchJSON).toHaveBeenCalledWith(
          'POST',
          '/permissions?codes=code',
          { data: { attributes: {}, type: 'io.cozy.permissions' } }
        )

        await collection.create({
          _type: 'io.cozy.permissions',
          _id: 'a340d5e0d64711e6b66c5fc9ce1e17c6',
          codes: 'a,b',
          ttl: '1D'
        })
        expect(client.fetchJSON).toHaveBeenCalledWith(
          'POST',
          '/permissions?codes=a%2Cb&ttl=1D',
          { data: { attributes: {}, type: 'io.cozy.permissions' } }
        )

        await collection.create({
          _type: 'io.cozy.permissions',
          _id: 'a340d5e0d64711e6b66c5fc9ce1e17c6',
          codes: 'a,b',
          ttl: '1D',
          tiny: 'true'
        })
        expect(client.fetchJSON).toHaveBeenCalledWith(
          'POST',
          '/permissions?codes=a%2Cb&ttl=1D&tiny=true',
          { data: { attributes: {}, type: 'io.cozy.permissions' } }
        )
      })
    })
    it('should fetch its own permissions', async () => {
      await collection.fetchOwnPermissions()
      expect(client.fetchJSON).toHaveBeenCalledWith('GET', '/permissions/self')
    })

    describe('add', () => {
      it('uses expected permissions endpoint', async () => {
        await collection.add(
          {
            _type: 'io.cozy.permissions',
            _id: 'a340d5e0d64711e6b66c5fc9ce1e17c6'
          },
          fixtures.permission
        )

        expect(client.fetchJSON).toHaveBeenCalledWith(
          'PATCH',
          '/permissions/a340d5e0d64711e6b66c5fc9ce1e17c6',
          {
            data: {
              type: 'io.cozy.permissions',
              attributes: {
                permissions: fixtures.permission
              }
            }
          }
        )
      })

      it('should call with options if they are defined and filled in', async () => {
        await collection.add(
          {
            _type: 'io.cozy.permissions',
            _id: 'a340d5e0d64711e6b66c5fc9ce1e17c6'
          },
          fixtures.permission,
          { expiresAt: '2019-01-01T00:00:00Z', password: 'password' }
        )

        expect(client.fetchJSON).toHaveBeenCalledWith(
          'PATCH',
          '/permissions/a340d5e0d64711e6b66c5fc9ce1e17c6',
          {
            data: {
              type: 'io.cozy.permissions',
              attributes: {
                permissions: fixtures.permission,
                expires_at: '2019-01-01T00:00:00Z',
                password: 'password'
              }
            }
          }
        )
      })

      it('should call with options if they are defined but not filled in', async () => {
        await collection.add(
          {
            _type: 'io.cozy.permissions',
            _id: 'a340d5e0d64711e6b66c5fc9ce1e17c6'
          },
          fixtures.permission,
          { expiresAt: '', password: '' }
        )

        expect(client.fetchJSON).toHaveBeenCalledWith(
          'PATCH',
          '/permissions/a340d5e0d64711e6b66c5fc9ce1e17c6',
          {
            data: {
              type: 'io.cozy.permissions',
              attributes: {
                permissions: fixtures.permission,
                expires_at: '',
                password: ''
              }
            }
          }
        )
      })

      it('should call without options if they are undefined', async () => {
        await collection.add(
          {
            _type: 'io.cozy.permissions',
            _id: 'a340d5e0d64711e6b66c5fc9ce1e17c6'
          },
          fixtures.permission
        )

        expect(client.fetchJSON).toHaveBeenCalledWith(
          'PATCH',
          '/permissions/a340d5e0d64711e6b66c5fc9ce1e17c6',
          {
            data: {
              type: 'io.cozy.permissions',
              attributes: {
                permissions: fixtures.permission
              }
            }
          }
        )
      })

      it('uses expected apps endpoint', async () => {
        await collection.add(
          {
            _type: 'io.cozy.apps',
            slug: 'test-app'
          },
          fixtures.permission
        )

        expect(client.fetchJSON).toHaveBeenCalledWith(
          'PATCH',
          '/permissions/apps/test-app',
          {
            data: {
              type: 'io.cozy.permissions',
              attributes: {
                permissions: fixtures.permission
              }
            }
          }
        )
      })

      it('uses expected konnectors endpoint', async () => {
        await collection.add(
          {
            _type: 'io.cozy.konnectors',
            slug: 'test-konnector'
          },
          fixtures.permission
        )

        expect(client.fetchJSON).toHaveBeenCalledWith(
          'PATCH',
          '/permissions/konnectors/test-konnector',
          {
            data: {
              type: 'io.cozy.permissions',
              attributes: {
                permissions: fixtures.permission
              }
            }
          }
        )
      })

      it('throws an error if document does not have expected doctype', () => {
        expect(collection.add({ _type: 'io.cozy.todos' })).rejects.toEqual(
          new Error(
            'Permissions can only be added on existing permissions, apps and konnectors.'
          )
        )
      })

      it('normalizes the resulting document', async () => {
        client.fetchJSON.mockReturnValue({
          data: {
            type: 'io.cozy.permissions',
            id: 'a340d5e0d64711e6b66c5fc9ce1e17c6',
            attributes: {
              permissions: fixtures.permission
            }
          }
        })
        const resp = await collection.add(
          {
            _type: 'io.cozy.permissions',
            _id: 'a340d5e0d64711e6b66c5fc9ce1e17c6'
          },
          fixtures.permission
        )

        expect(resp.data.type).toEqual('io.cozy.permissions')
        expect(resp.data._type).toEqual('io.cozy.permissions')
        expect(resp.data.id).toEqual('a340d5e0d64711e6b66c5fc9ce1e17c6')
        expect(resp.data._id).toEqual('a340d5e0d64711e6b66c5fc9ce1e17c6')
        expect(resp.data.attributes.permissions).toEqual(fixtures.permission)
      })
    })
  })

  describe('createSharingLink', () => {
    it('Should be read-only by default', async () => {
      const document = { _type: 'io.cozy.files', _id: '1234' }
      await collection.createSharingLink(document)
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'POST',
        '/permissions?codes=code',
        {
          data: {
            type: 'io.cozy.permissions',
            attributes: {
              permissions: {
                files: {
                  type: 'io.cozy.files',
                  verbs: ['GET'],
                  values: [document._id]
                }
              }
            }
          }
        }
      )
    })

    it('Should use specific permissions when requested', async () => {
      const document = { _type: 'io.cozy.files', _id: '1234' }
      const verbs = ['GET', 'PATCH', 'PUT']
      const options = { verbs }
      await collection.createSharingLink(document, options)
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'POST',
        '/permissions?codes=code',
        {
          data: {
            type: 'io.cozy.permissions',
            attributes: {
              permissions: {
                files: {
                  type: 'io.cozy.files',
                  verbs: verbs,
                  values: [document._id]
                }
              }
            }
          }
        }
      )
    })

    it('Should be call with the right params', async () => {
      const document = { _type: 'io.cozy.files', _id: '1234' }
      await collection.createSharingLink(document, {
        ttl: '1D',
        tiny: true,
        codes: 'a,b'
      })
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'POST',
        '/permissions?codes=a%2Cb&ttl=1D&tiny=true',
        { data: { attributes: {}, type: 'io.cozy.permissions' } }
      )
    })
  })
})

describe('revokeSharingLink', () => {
  const client = new CozyStackClient()
  const collection = new PermissionCollection('io.cozy.permissions', client)

  beforeEach(() => {
    client.fetchJSON.mockReset()
    client.fetchJSON.mockResolvedValue({ data: [] })
  })

  it('should revoke a sharing link', async () => {
    client.fetchJSON.mockReturnValue(
      Promise.resolve({
        data: [
          {
            type: 'io.cozy.permissions',
            id: 'perm_id_1',
            attributes: {
              type: 'share',
              permissions: {
                files: {
                  type: 'io.cozy.files',
                  verbs: ['GET'],
                  values: ['file_1']
                }
              }
            }
          }
        ]
      })
    )
    await collection.revokeSharingLink({
      _id: 'file_1',
      _type: 'io.cozy.files'
    })
    expect(client.fetchJSON).toHaveBeenNthCalledWith(
      1,
      'GET',
      '/permissions/doctype/io.cozy.files/shared-by-link'
    )
    expect(client.fetchJSON).toHaveBeenNthCalledWith(
      2,
      'DELETE',
      '/permissions/perm_id_1'
    )
  })

  it('it should fetch all the links by calling next links', async () => {
    client.fetchJSON.mockReturnValueOnce(
      Promise.resolve({
        data: [
          {
            type: 'io.cozy.permissions',
            id: 'perm_id_1',
            attributes: {
              type: 'share',
              permissions: {
                files: {
                  type: 'io.cozy.files',
                  verbs: ['GET'],
                  values: ['file_1']
                }
              }
            }
          }
        ],
        links: {
          next: '/permissions/next_page'
        }
      })
    )
    await collection.fetchAllLinks({ _type: 'io.cozy.files' })

    expect(client.fetchJSON).toHaveBeenNthCalledWith(
      1,
      'GET',
      '/permissions/doctype/io.cozy.files/shared-by-link'
    )

    expect(client.fetchJSON).toHaveBeenNthCalledWith(
      2,
      'GET',
      '/permissions/next_page'
    )
  })
})

describe('getPermissionsFor', () => {
  it('Should give all permissions by default', () => {
    const document = { _type: 'io.cozy.files', _id: '1234' }
    const perms = getPermissionsFor(document, false)
    expect(perms.files.verbs).toEqual(expect.arrayContaining(['ALL']))
  })

  it('Should give GET permissions for a link', () => {
    const document = { _type: 'io.cozy.files', _id: '1234' }
    const perms = getPermissionsFor(document, true)
    expect(perms.files.verbs).toEqual(expect.arrayContaining(['GET']))
  })

  it('Should let one set the permissions it want', () => {
    const document = { _type: 'io.cozy.files', _id: '1234' }
    const verbs = ['GET', 'PATCH', 'PUT']
    const options = { verbs }
    const perms = getPermissionsFor(document, false, options)
    expect(perms.files.verbs).toEqual(expect.arrayContaining(verbs))
    const perms2 = getPermissionsFor(document, true, options)
    expect(perms2.files.verbs).toEqual(expect.arrayContaining(verbs))
  })
})

describe('PermissionCollection with driveId', () => {
  const client = new CozyStackClient()
  const driveId = 'abc123drive'
  const collection = new PermissionCollection('io.cozy.permissions', client, {
    driveId
  })

  beforeEach(() => {
    client.fetchJSON.mockReset()
    client.fetchJSON.mockResolvedValue({ data: [] })
  })

  it('should set the correct API prefix for shared drives', () => {
    expect(collection.prefix).toEqual('/sharings/drives/abc123drive')
  })

  describe('get', () => {
    it('calls the API with the shared drive prefix', async () => {
      client.fetchJSON.mockResolvedValue({
        data: { type: 'io.cozy.permissions', id: 'test-perm-id' }
      })
      await collection.get('test-perm-id')
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'GET',
        '/sharings/drives/abc123drive/permissions/test-perm-id'
      )
    })
  })

  describe('create', () => {
    it('calls the API with the shared drive prefix', async () => {
      client.fetchJSON.mockResolvedValue({
        data: { type: 'io.cozy.permissions', id: 'new-perm-id' }
      })
      await collection.create({ _type: 'io.cozy.permissions', codes: 'code' })
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'POST',
        '/sharings/drives/abc123drive/permissions?codes=code',
        { data: { attributes: {}, type: 'io.cozy.permissions' } }
      )
    })

    it('includes ttl and tiny options', async () => {
      client.fetchJSON.mockResolvedValue({
        data: { type: 'io.cozy.permissions', id: 'new-perm-id' }
      })
      await collection.create({
        _type: 'io.cozy.permissions',
        codes: 'a,b',
        ttl: '1D',
        tiny: true
      })
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'POST',
        '/sharings/drives/abc123drive/permissions?codes=a%2Cb&ttl=1D&tiny=true',
        { data: { attributes: {}, type: 'io.cozy.permissions' } }
      )
    })
  })

  describe('add', () => {
    it('uses shared drive prefix for permissions document', async () => {
      await collection.add(
        {
          _type: 'io.cozy.permissions',
          _id: 'a340d5e0d64711e6b66c5fc9ce1e17c6'
        },
        fixtures.permission
      )
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'PATCH',
        '/sharings/drives/abc123drive/permissions/a340d5e0d64711e6b66c5fc9ce1e17c6',
        {
          data: {
            type: 'io.cozy.permissions',
            attributes: {
              permissions: fixtures.permission
            }
          }
        }
      )
    })
  })

  describe('destroy', () => {
    it('calls the API with the shared drive prefix', async () => {
      await collection.destroy({ id: 'perm-to-delete' })
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'DELETE',
        '/sharings/drives/abc123drive/permissions/perm-to-delete'
      )
    })
  })

  describe('createSharingLink', () => {
    it('calls the API with the shared drive prefix', async () => {
      client.fetchJSON.mockResolvedValue({
        data: { type: 'io.cozy.permissions', id: 'new-perm-id' }
      })
      const document = { _type: 'io.cozy.files', _id: '1234' }
      await collection.createSharingLink(document)
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'POST',
        '/sharings/drives/abc123drive/permissions?codes=code',
        {
          data: {
            type: 'io.cozy.permissions',
            attributes: {
              permissions: {
                files: {
                  type: 'io.cozy.files',
                  verbs: ['GET'],
                  values: ['1234']
                }
              }
            }
          }
        }
      )
    })
  })

  describe('fetchOwnPermissions', () => {
    it('calls the API with the shared drive prefix', async () => {
      client.fetchJSON.mockResolvedValue({
        data: { type: 'io.cozy.permissions', id: 'self-perm' }
      })
      await collection.fetchOwnPermissions()
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'GET',
        '/sharings/drives/abc123drive/permissions/self'
      )
    })
  })
})
