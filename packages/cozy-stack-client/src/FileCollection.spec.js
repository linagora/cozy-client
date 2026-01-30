jest.mock('./CozyStackClient')

import CozyStackClient from './CozyStackClient'
import FileCollection from './FileCollection'
import logger from './logger'

const STAT_BY_ID_RESPONSE = {
  data: {
    type: 'io.cozy.files',
    id: '42',
    attributes: {
      type: 'directory',
      name: 'bills',
      dir_id: 'io.cozy.files.root-dir',
      created_at: '2016-11-25T16:07:45.398867198+01:00',
      updated_at: '2016-11-25T16:07:45.398867198+01:00',
      tags: []
    },
    meta: {},
    links: {},
    relationships: {}
  },
  included: []
}

const CREATE_DIRECTORY_RESPONSE = {
  data: {
    type: 'io.cozy.files',
    id: 'cb1c159a8db1ee7aeb9441c3ff001753',
    attributes: {
      type: 'directory',
      name: 'notes',
      dir_id: 'io.cozy.files.root-dir',
      created_at: '2016-11-25T16:07:45.398867198+01:00',
      updated_at: '2016-11-25T16:07:45.398867198+01:00',
      tags: []
    },
    meta: {},
    links: {},
    relationships: {}
  }
}

const CREATE_METADATA_RESPONSE = {
  data: {
    type: 'io.cozy.files.metadata',
    id: 'fd1c512a8cc1ff7aeb9566c3ee523325'
  }
}

describe('FileCollection', () => {
  const client = new CozyStackClient()
  const collection = new FileCollection('io.cozy.files', client)

  describe('statById', () => {
    beforeEach(() => {
      client.fetchJSON.mockResolvedValue(STAT_BY_ID_RESPONSE)
    })

    afterEach(() => {
      client.fetchJSON.mockReset()
    })

    it('should call the right route', async () => {
      await collection.statById(42)
      expect(client.fetchJSON).toHaveBeenCalledWith('GET', '/files/42')
    })

    it('should accept skip, cursor and limit options', async () => {
      await collection.statById(42, {
        'page[skip]': 50,
        'page[limit]': 200,
        'page[cursor]': ['io.cozy.files', 'abc123'],
        ignoredOption: 'not-included'
      })
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'GET',
        '/files/42?page[limit]=200&page[skip]=50&page[cursor]=[%22io.cozy.files%22,%22abc123%22]'
      )
    })

    it('should return a correct JSON API response', async () => {
      const resp = await collection.statById(42)
      expect(resp).toConformToJSONAPI()
    })

    it('should return normalized documents', async () => {
      const resp = await collection.statById(42)
      expect(resp.data).toHaveDocumentIdentity()
    })
  })

  describe('getDownloadLinkByRevision', () => {
    beforeEach(() => {
      client.fetchJSON.mockResolvedValue({
        ...STAT_BY_ID_RESPONSE,

        links: {
          related: 'http://foo'
        }
      })
    })

    afterEach(() => {
      client.fetchJSON.mockReset()
    })

    it('should encode filename', async () => {
      await collection.getDownloadLinkByRevision('1', '#name')
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'POST',
        '/files/downloads?VersionId=1&Filename=%2523name'
      )
    })
  })

  describe('getDownloadLinkById', () => {
    beforeEach(() => {
      client.fetchJSON.mockResolvedValue({
        ...STAT_BY_ID_RESPONSE,

        links: {
          related: 'http://foo'
        }
      })
    })

    afterEach(() => {
      client.fetchJSON.mockReset()
    })

    it('should encode filename', async () => {
      await collection.getDownloadLinkById('1', '#name')
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'POST',
        '/files/downloads?Id=1&Filename=%2523name'
      )
    })
  })

  describe('find', () => {
    client.uri = 'http://cozy.tools'
    const FIND_RESPONSE = {
      data: [{ id: '1' }, { id: '2' }],
      links: {
        next: '/files/_find?page[cursor]=bookmark-id-123'
      },
      meta: {
        count: 4
      }
    }

    beforeAll(() => {
      client.fetchJSON.mockResolvedValue(FIND_RESPONSE)
      jest.spyOn(console, 'warn').mockImplementation(() => {})
    })

    afterAll(() => {
      client.fetchJSON.mockReset()
    })

    it('should call the right route with the right params', async () => {
      await collection.find(
        { trashed: false },
        {
          indexId: 'index-1',
          bookmark: 'bookmark-123',
          limit: 2,
          skip: 4,
          sort: [{ name: 'asc' }]
        }
      )
      expect(client.fetchJSON).toHaveBeenCalledWith('POST', '/files/_find', {
        bookmark: 'bookmark-123',
        fields: undefined,
        limit: 2,
        selector: { trashed: false },
        skip: 4,
        sort: [{ name: 'asc' }, { trashed: 'asc' }],
        use_index: 'index-1'
      })
    })

    it('should return the expected value', async () => {
      const result = await collection.find(
        { trashed: false },
        {
          indexId: 'index-1',
          bookmark: 'bookmark-123',
          limit: 2,
          skip: 4,
          sort: [{ name: 'asc' }]
        }
      )

      expect(result.data.length).toEqual(FIND_RESPONSE.data.length)
      expect(result.meta).toEqual(FIND_RESPONSE.meta)
      expect(result.bookmark).toEqual('bookmark-id-123')
    })

    it('should handle malformatted next links', async () => {
      client.fetchJSON.mockResolvedValue({ data: [], meta: {} })
      const resultWithoutNext = await collection.find(
        {},
        { indexId: 'index-1' }
      )
      expect(resultWithoutNext.bookmark).toBeUndefined()

      client.fetchJSON.mockReturnValue(
        Promise.resolve({ next: {}, data: [], meta: {} })
      )
      const resultWithoutLink = await collection.find(
        {},
        { indexId: 'index-1' }
      )
      expect(resultWithoutLink.bookmark).toBeUndefined()

      client.fetchJSON.mockReturnValue(
        Promise.resolve({
          next: { link: '/no-cursor-here' },
          data: [],
          meta: {}
        })
      )
      const resultWithoutCursor = await collection.find(
        {},
        { indexId: 'index-1' }
      )
      expect(resultWithoutCursor.bookmark).toBeUndefined()
    })
  })

  describe('create', () => {
    beforeEach(() => {
      client.fetchJSON.mockResolvedValue({
        ...STAT_BY_ID_RESPONSE,

        links: {
          related: 'http://foo'
        }
      })
    })

    afterEach(() => {
      client.fetchJSON.mockReset()
    })

    it('file - should throw illegal characters errors when invalid file name', async () => {
      expect.assertions(1)
      try {
        await collection.create({ name: 'incorrect/filename' })
      } catch (error) {
        expect(error.message).toEqual(
          'Invalid filename containing illegal character(s): /'
        )
      }
    })
    it('file - should throw missing name errors when name is multiple spaces', async () => {
      expect.assertions(1)
      try {
        await collection.create({ name: '   ' })
      } catch (error) {
        expect(error.message).toEqual('Missing name argument')
      }
    })

    it('file - should throw incorrect file name errors when name is forbidden', async () => {
      expect.assertions(1)
      try {
        await collection.create({ name: '..' })
      } catch (error) {
        expect(error.message).toEqual('Invalid filename: ..')
      }
    })

    it('file - should sanitize the filename', async () => {
      await collection.create({
        name: 'Name ',
        data: 'content'
      })
      expect(
        client.fetchJSON.mock.calls[client.fetchJSON.mock.calls.length - 1]
      ).toMatchSnapshot()
    })

    it('file - should not sanitize the filename if asked not to', async () => {
      await collection.create(
        {
          name: 'Name ',
          data: 'content'
        },
        { sanitizeName: false }
      )
      expect(
        client.fetchJSON.mock.calls[client.fetchJSON.mock.calls.length - 1]
      ).toMatchSnapshot()
    })

    it('directory - should throw illegal characters errors when invalid file name', async () => {
      expect.assertions(1)
      try {
        await collection.create({
          name: 'incorrect/filename',
          type: 'directory'
        })
      } catch (error) {
        expect(error.message).toEqual(
          'Invalid filename containing illegal character(s): /'
        )
      }
    })

    it('directory - should throw missing name errors when name is multiple spaces', async () => {
      expect.assertions(1)
      try {
        await collection.create({ name: '   ', type: 'directory' })
      } catch (error) {
        expect(error.message).toEqual('Missing name argument')
      }
    })

    it('directory - should throw incorrect file name errors when name is forbidden', async () => {
      expect.assertions(1)
      try {
        await collection.create({ name: '..', type: 'directory' })
      } catch (error) {
        expect(error.message).toEqual('Invalid filename: ..')
      }
    })

    it('directory - should sanitize the filename', async () => {
      await collection.create({
        name: 'Name ',
        type: 'directory'
      })
      expect(
        client.fetchJSON.mock.calls[client.fetchJSON.mock.calls.length - 1]
      ).toMatchSnapshot()
    })

    it('directory - should not sanitize the filename if asked not to', async () => {
      await collection.create(
        {
          name: 'Name ',
          type: 'directory'
        },
        { sanitizeName: false }
      )
      expect(
        client.fetchJSON.mock.calls[client.fetchJSON.mock.calls.length - 1]
      ).toMatchSnapshot()
    })
  })

  describe('createDirectory', () => {
    const NEW_DIR = {
      name: 'notes',
      dirId: '12345',
      lastModifiedDate: 'Wed, 01 Feb 2017 10:24:42 GMT'
    }

    const NEW_DIR_WITH_METADATA = {
      name: 'notes',
      dirId: '12345',
      lastModifiedDate: 'Wed, 01 Feb 2017 10:24:42 GMT',
      metadata: { toto: 'toto' }
    }

    beforeEach(() => {
      client.fetchJSON.mockReturnValue(
        Promise.resolve(CREATE_DIRECTORY_RESPONSE)
      )
    })

    afterEach(() => {
      client.fetchJSON.mockReset()
    })

    it('should call the right route to create directory', async () => {
      await collection.createDirectory(NEW_DIR)

      expect(client.fetchJSON).toHaveBeenCalledTimes(1)
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'POST',
        '/files/12345?Name=notes&Type=directory&MetadataID=',
        undefined,
        { headers: { Date: 'Wed, 01 Feb 2017 10:24:42 GMT' } }
      )
    })

    it('should call the right route to create metadata and directory', async () => {
      client.fetchJSON.mockReturnValueOnce(
        Promise.resolve(CREATE_METADATA_RESPONSE)
      )

      await collection.createDirectory(NEW_DIR_WITH_METADATA)

      expect(client.fetchJSON).toHaveBeenCalledTimes(2)
      expect(client.fetchJSON).toHaveBeenNthCalledWith(
        1,
        'POST',
        '/files/upload/metadata',
        {
          data: { attributes: { toto: 'toto' }, type: 'io.cozy.files.metadata' }
        }
      )
      expect(client.fetchJSON).toHaveBeenNthCalledWith(
        2,
        'POST',
        '/files/12345?Name=notes&Type=directory&MetadataID=fd1c512a8cc1ff7aeb9566c3ee523325',
        undefined,
        { headers: { Date: 'Wed, 01 Feb 2017 10:24:42 GMT' } }
      )
    })

    it('should return a correct JSON API response', async () => {
      const resp = await collection.createDirectory(NEW_DIR)
      expect(resp).toConformToJSONAPI()
    })

    it('should return normalized documents', async () => {
      const resp = await collection.createDirectory(NEW_DIR)
      expect(resp.data).toHaveDocumentIdentity()
    })

    it('should sanitize the filename', async () => {
      await collection.createDirectory({
        ...NEW_DIR,
        name: 'Name '
      })
      expect(
        client.fetchJSON.mock.calls[client.fetchJSON.mock.calls.length - 1]
      ).toMatchSnapshot()
    })

    it('should not sanitize the filename if asked not to', async () => {
      await collection.createDirectory(
        {
          ...NEW_DIR,
          name: 'Name '
        },
        { sanitizeName: false }
      )
      expect(
        client.fetchJSON.mock.calls[client.fetchJSON.mock.calls.length - 1]
      ).toMatchSnapshot()
    })
  })

  describe('createDirectoryByPath', () => {
    beforeEach(() => {
      jest.spyOn(collection, 'statById').mockImplementation(() =>
        Promise.resolve({
          data: {
            _id: 'io.cozy.files.root-dir',
            attributes: {
              path: '/'
            }
          }
        })
      )
      jest.spyOn(collection, 'statByPath').mockImplementation(path =>
        path === '/foo'
          ? Promise.resolve({
              data: {
                _id: '8c217f9bf5e7118a34627f1ab800243b',
                attributes: {
                  name: 'foo',
                  dir_id: 'io.cozy.files.root-dir',
                  path: '/foo'
                }
              }
            })
          : Promise.reject(
              new Error(
                JSON.stringify({
                  errors: [
                    {
                      status: '404'
                    }
                  ]
                })
              )
            )
      )
      jest.spyOn(collection, 'createDirectory').mockImplementation(({ name }) =>
        Promise.resolve(
          name === 'bar'
            ? {
                data: {
                  _id: '9c217f9bf5e7118a34627f1ab800243b',
                  attributes: {
                    name: 'bar',
                    dir_id: '8c217f9bf5e7118a34627f1ab800243b',
                    path: '/foo/bar'
                  }
                }
              }
            : {
                data: {
                  _id: '7c217f9bf5e7118a34627f1ab800243b',
                  attributes: {
                    name: 'bar',
                    dir_id: '9c217f9bf5e7118a34627f1ab800243b',
                    path: '/foo/bar/baz'
                  }
                }
              }
        )
      )
    })

    afterEach(() => {
      collection.statById.mockRestore()
      collection.statByPath.mockRestore()
      collection.createDirectory.mockRestore()
    })

    it('should return the root dir when given an empty path', async () => {
      const resp = await collection.createDirectoryByPath('/')
      expect(resp.data._id).toBe('io.cozy.files.root-dir')
    })

    it('should create the whole path', async () => {
      const resp = await collection.createDirectoryByPath('/foo/bar/baz')
      expect(resp.data._id).toBe('7c217f9bf5e7118a34627f1ab800243b')
      expect(collection.statByPath).toHaveBeenCalledTimes(3)
      expect(collection.createDirectory).toHaveBeenCalledTimes(2)
      expect(collection.createDirectory).toHaveBeenLastCalledWith(
        {
          dirId: '9c217f9bf5e7118a34627f1ab800243b',
          name: 'baz'
        },
        { sanitizeName: true }
      )
    })

    it('should sanitize the filename', async () => {
      await collection.createDirectoryByPath('/foo / bar/ baz ')
      expect(
        collection.createDirectory.mock.calls[
          collection.createDirectory.mock.calls.length - 1
        ]
      ).toMatchSnapshot()
    })

    it('should not sanitize the filename if asked not to', async () => {
      await collection.createDirectoryByPath('/foo / bar/ baz ', {
        sanitizeName: false
      })
      expect(
        collection.createDirectory.mock.calls[
          collection.createDirectory.mock.calls.length - 1
        ]
      ).toMatchSnapshot()
    })
  })

  describe('findReferencedBy', () => {
    const client = new CozyStackClient()
    const collection = new FileCollection('io.cozy.files', client)

    const spy = jest.spyOn(client, 'fetchJSON')

    beforeEach(() => {
      spy.mockClear()
    })

    const doc = {
      _type: 'io.cozy.files',
      _id: '123'
    }
    const ref = {
      type: 'io.cozy.photos.albums',
      id: 'album-1'
    }

    it('should pass all the filters', () => {
      spy.mockReturnValue({
        data: [ref],
        meta: { count: 1 }
      })
      collection.findReferencedBy(doc)
      expect(spy).toMatchSnapshot()
    })

    it('should detect a next page', async () => {
      spy.mockReturnValue({
        data: [ref],
        links: {
          next: 'http://example.com/next'
        },
        meta: { count: 1 }
      })
      const result = await collection.findReferencedBy(doc)
      expect(result.next).toBe(true)
    })

    it('should detect the abscence of a next page', async () => {
      spy.mockReturnValue({
        data: null, // XXX: cozy-stack returns null instead of an empty array
        links: {},
        meta: { count: 0 }
      })
      const result = await collection.findReferencedBy(doc)
      expect(result.next).toBe(false)
    })
  })

  describe('referencedBy', () => {
    const client = new CozyStackClient()
    const collection = new FileCollection('io.cozy.files', client)

    const spy = jest.spyOn(client, 'fetchJSON')

    beforeEach(() => {
      spy.mockClear()
    })

    const file = {
      _type: 'io.cozy.files',
      _id: '123'
    }
    const refs = [
      {
        _id: '456',
        _type: 'io.cozy.photos.albums'
      }
    ]

    it('should add a reference', async () => {
      spy.mockReturnValue({
        data: [{ id: '456', type: 'io.cozy.photos.albums' }],
        meta: { rev: '2-xxx', count: 1 }
      })

      const res = await collection.addReferencedBy(file, refs)
      expect(spy).toHaveBeenCalledWith(
        'POST',
        '/files/123/relationships/referenced_by',
        { data: [{ id: '456', type: 'io.cozy.photos.albums' }] }
      )

      expect(res.data).toEqual(refs)
      expect(res.meta).not.toBeNull()
      expect(spy).toMatchSnapshot()
    })

    it('should remove a reference', async () => {
      spy.mockReturnValue({
        data: null,
        meta: { rev: '3-xxx', count: 0 }
      })

      const res = await collection.removeReferencedBy(file, refs)
      expect(spy).toHaveBeenCalledWith(
        'DELETE',
        '/files/123/relationships/referenced_by',
        { data: [{ id: '456', type: 'io.cozy.photos.albums' }] }
      )

      expect(res.data).toEqual([])
      expect(res.meta).not.toBeNull()
      expect(spy).toMatchSnapshot()
    })
  })

  describe('referencesTo', () => {
    const client = new CozyStackClient()
    const collection = new FileCollection('io.cozy.files', client)

    beforeEach(() => {
      client.fetchJSON.mockReturnValue({})
    })

    const album = {
      _type: 'io.cozy.photos.albums',
      _id: '123',
      name: 'My album'
    }
    const refs = [
      {
        _id: '456',
        name: 'My photo.jpg'
      }
    ]

    it('should add a reference', async () => {
      await collection.addReferencesTo(album, refs)
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'POST',
        '/data/io.cozy.photos.albums/123/relationships/references',
        { data: [{ id: '456', type: 'io.cozy.files' }] }
      )
    })

    it('should remove a reference', async () => {
      await collection.removeReferencesTo(album, refs)
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'DELETE',
        '/data/io.cozy.photos.albums/123/relationships/references',
        { data: [{ id: '456', type: 'io.cozy.files' }] }
      )
    })
  })

  describe('destroy', () => {
    const client = new CozyStackClient()
    const collection = new FileCollection('io.cozy.files', client)

    beforeEach(() => {
      client.fetchJSON.mockReturnValue({})
    })

    it('should send any given If-Match revision', async () => {
      const file = {
        _id: '123',
        _rev: '2-123'
      }
      const ifMatch = '1-456'

      await collection.destroy(file, { ifMatch })

      expect(client.fetchJSON).toHaveBeenCalledWith(
        'DELETE',
        `/files/${file._id}`,
        undefined,
        { headers: { 'If-Match': ifMatch } }
      )
    })
  })

  describe('update', () => {
    const client = new CozyStackClient()
    const collection = new FileCollection('io.cozy.files', client)

    const spyUpdateFile = jest.spyOn(collection, 'updateFile')
    const spyUpdateAttributes = jest.spyOn(collection, 'updateAttributes')

    beforeEach(() => {
      spyUpdateFile.mockReturnValue()
      spyUpdateAttributes.mockReturnValue()
    })

    it('should update file when a data param is passed', async () => {
      const atts = {
        fileId: '123',
        type: 'file',
        name: 'thoughts.txt',
        data: new Blob()
      }
      await collection.update(atts)
      expect(spyUpdateFile).toHaveBeenCalled()
    })

    it('should fail when a data param is passed for a directory', async () => {
      expect.assertions(1)
      try {
        const atts = {
          fileId: '123',
          type: 'directory',
          name: 'dirdir',
          data: new Blob()
        }
        await collection.update(atts)
      } catch (error) {
        expect(error.message).toEqual(
          'You cannot pass a data object for a directory'
        )
      }
    })

    it('should update attributes when no data param is passed', async () => {
      const atts = {
        _id: '123',
        type: 'file',
        name: 'thoughts.txt'
      }
      await collection.update(atts)
      expect(spyUpdateAttributes).toHaveBeenCalledWith(atts._id, atts, {
        ifMatch: '',
        sanitizeName: true
      })
    })

    it('should sanitize the filename', async () => {
      const attrsWithContent = {
        fileId: '123',
        type: 'file',
        name: ' thoughts .txt',
        data: new Blob()
      }
      await collection.update(attrsWithContent)
      expect(
        spyUpdateFile.mock.calls[spyUpdateFile.mock.calls.length - 1]
      ).toMatchSnapshot()

      const attrs = {
        fileId: '123',
        type: 'file',
        name: ' thoughts .txt'
      }
      await collection.update(attrs)
      expect(
        spyUpdateAttributes.mock.calls[
          spyUpdateAttributes.mock.calls.length - 1
        ]
      ).toMatchSnapshot()
    })

    it('should not sanitize the filename if asked not to', async () => {
      const attrsWithContent = {
        fileId: '123',
        type: 'file',
        name: ' thoughts .txt',
        data: new Blob()
      }
      await collection.update(attrsWithContent, { sanitizeName: false })
      expect(
        spyUpdateFile.mock.calls[spyUpdateFile.mock.calls.length - 1]
      ).toMatchSnapshot()

      const attrs = {
        fileId: '123',
        type: 'file',
        name: ' thoughts .txt'
      }
      await collection.update(attrs, { sanitizeName: false })
      expect(
        spyUpdateAttributes.mock.calls[
          spyUpdateAttributes.mock.calls.length - 1
        ]
      ).toMatchSnapshot()
    })

    it('should send any given If-Match revision', async () => {
      // Without data
      const attrs = {
        _id: '123',
        type: 'file',
        name: 'thoughts.txt'
      }
      const ifMatch = '1-456'

      await collection.update(attrs, { ifMatch })
      expect(spyUpdateAttributes).toHaveBeenCalledWith(attrs._id, attrs, {
        sanitizeName: true,
        ifMatch
      })

      // With data
      const data = new Blob()

      await collection.update({ ...attrs, data }, { ifMatch })
      expect(spyUpdateFile).toHaveBeenCalledWith(
        data,
        { ...attrs, fileId: attrs._id },
        {
          sanitizeName: true,
          ifMatch
        }
      )
    })
  })

  describe('updateAttributes', () => {
    beforeEach(() => {
      client.fetchJSON.mockReturnValue({ data: [] })
    })

    afterEach(() => {
      client.fetchJSON.mockClear()
    })

    it('should not fetch json when file name is not valid', async () => {
      try {
        await collection.updateAttributes('42', {
          dir_id: '123',
          name: 'incorrect / name'
        })
      } catch (error) {
        expect(client.fetchJSON.mock.calls.length).toEqual(0)
      }
    })

    it('should throw error when file name contains illegal characters', async () => {
      try {
        await collection.updateAttributes('42', {
          dir_id: '123',
          name: 'incorrect / name'
        })
      } catch (error) {
        expect(error.message).toEqual(
          'Invalid filename containing illegal character(s): /'
        )
      }
    })

    it('should throw error when file name is forbidden', async () => {
      try {
        await collection.updateAttributes('42', {
          dir_id: '123',
          name: '.'
        })
      } catch (error) {
        expect(error.message).toEqual('Invalid filename: .')
      }
    })

    it('should throw error when file name is only space', async () => {
      try {
        await collection.updateAttributes('42', {
          dir_id: '123',
          name: '    '
        })
      } catch (error) {
        expect(error.message).toEqual('Missing name argument')
      }
    })

    it('should call the right route', async () => {
      await collection.updateAttributes('42', {
        dir_id: '123',
        name: 'correct-name'
      })
      expect(client.fetchJSON.mock.calls.length).toBeGreaterThan(0)
      expect(
        client.fetchJSON.mock.calls[client.fetchJSON.mock.calls.length - 1]
      ).toMatchSnapshot()
    })

    it('should sanitize the filename', async () => {
      await collection.updateAttributes('42', {
        dir_id: '123',
        name: 'Name '
      })
      expect(
        client.fetchJSON.mock.calls[client.fetchJSON.mock.calls.length - 1]
      ).toMatchSnapshot()
    })

    it('should not sanitize the filename if asked not to', async () => {
      await collection.updateAttributes(
        '42',
        {
          dir_id: '123',
          name: 'Name '
        },
        { sanitizeName: false }
      )
      expect(
        client.fetchJSON.mock.calls[client.fetchJSON.mock.calls.length - 1]
      ).toMatchSnapshot()
    })

    it('should send any given If-Match revision', async () => {
      await collection.updateAttributes(
        '42',
        {
          dir_id: '123',
          name: 'Name '
        },
        { ifMatch: '1-456' }
      )
      expect(
        client.fetchJSON.mock.calls[client.fetchJSON.mock.calls.length - 1]
      ).toMatchSnapshot()
    })
  })

  describe('updateMetadataAttribute', () => {
    beforeEach(() => {
      client.fetchJSON.mockReturnValue({ data: [] })
    })

    afterEach(() => {
      client.fetchJSON.mockClear()
    })

    it('should call the right route', async () => {
      await collection.updateMetadataAttribute('42', {
        classification: 'tax_notice'
      })
      expect(client.fetchJSON.mock.calls.length).toBeGreaterThan(0)
      expect(
        client.fetchJSON.mock.calls[client.fetchJSON.mock.calls.length - 1]
      ).toMatchSnapshot()
    })
  })

  describe('createFileMetadata', () => {
    beforeEach(() => {
      client.fetchJSON.mockReturnValue({ data: [] })
    })

    afterEach(() => {
      client.fetchJSON.mockClear()
    })

    it('should call the right route', async () => {
      await collection.createFileMetadata({
        type: 'bill'
      })
      expect(client.fetchJSON.mock.calls.length).toBeGreaterThan(0)
      expect(
        client.fetchJSON.mock.calls[client.fetchJSON.mock.calls.length - 1]
      ).toMatchSnapshot()
    })
  })

  describe('updateFile', () => {
    beforeEach(() => {
      client.fetchJSON.mockReturnValue({
        data: {
          id: '59140416-b95f',
          _id: '59140416-b95f',
          dir_id: '41686c35-9d8e'
        }
      })
    })

    afterEach(() => {
      client.fetchJSON.mockClear()
    })

    it('should not fetch json when file name is not valid', async () => {
      try {
        const data = new File([''], 'mydoc.epub')
        const params = {
          fileId: '59140416-b95f',
          name: '/'
        }
        await collection.updateFile(data, params)
      } catch (error) {
        expect(client.fetchJSON.mock.calls.length).toEqual(0)
      }
    })

    it('should throw error when file name contains illegal characters', async () => {
      try {
        const data = new File([''], 'mydoc.epub')
        const params = {
          fileId: '59140416-b95f',
          name: 'illegal/characters'
        }
        await collection.updateFile(data, params)
      } catch (error) {
        expect(error.message).toEqual(
          'Invalid filename containing illegal character(s): /'
        )
      }
    })

    it('should throw error when file name is forbidden', async () => {
      try {
        const data = new File([''], 'mydoc.epub')
        const params = {
          fileId: '59140416-b95f',
          name: '..'
        }
        await collection.updateFile(data, params)
      } catch (error) {
        expect(error.message).toEqual('Invalid filename: ..')
      }
    })

    it('should throw error when file name is only space', async () => {
      try {
        const data = new File([''], 'mydoc.epub')
        const params = {
          fileId: '59140416-b95f',
          checksum: 'a6dabd99832b270468e254814df2ed20',
          metadata: { type: 'bill' },
          name: ' '
        }
        await collection.updateFile(data, params)
      } catch (error) {
        expect(error.message).toEqual('Missing name argument')
      }
    })

    it('should update a file without metadata + add UpdatedAt when lastModifiedDate filled', async () => {
      const data = new File([''], 'mydoc.epub')
      const params = {
        fileId: '59140416-b95f',
        checksum: 'a6dabd99832b270468e254814df2ed20'
      }
      const result = await collection.updateFile(data, params)
      const expectedPath = `/files/59140416-b95f?Name=mydoc.epub&Type=file&Executable=false&Encrypted=false&UpdatedAt=${new Date(
        data.lastModified
      ).toISOString()}&CreatedAt=${new Date(data.lastModified).toISOString()}`
      const expectedOptions = {
        headers: {
          'Content-MD5': 'a6dabd99832b270468e254814df2ed20',
          'Content-Type': 'application/epub+zip'
        }
      }
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'PUT',
        expectedPath,
        data,
        expectedOptions
      )
      expect(result).toEqual({
        data: {
          id: '59140416-b95f',
          _id: '59140416-b95f',
          _type: 'io.cozy.files',
          dir_id: '41686c35-9d8e'
        }
      })
    })

    it('should update a file with metadata', async () => {
      const metadataId = '2460a631-ae55'
      client.fetchJSON.mockReturnValueOnce({
        data: {
          id: metadataId
        }
      })
      const data = new File([''], 'mydoc.epub')
      const params = {
        fileId: '59140416-b95f',
        checksum: 'a6dabd99832b270468e254814df2ed20',
        metadata: { type: 'bill' }
      }
      const result = await collection.updateFile(data, params)
      const expectedPath = `/files/59140416-b95f?Name=mydoc.epub&Type=file&Executable=false&Encrypted=false&MetadataID=${metadataId}&UpdatedAt=${new Date(
        data.lastModified
      ).toISOString()}&CreatedAt=${new Date(data.lastModified).toISOString()}`
      const expectedOptions = {
        headers: {
          'Content-MD5': 'a6dabd99832b270468e254814df2ed20',
          'Content-Type': 'application/epub+zip'
        }
      }
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'PUT',
        expectedPath,
        data,
        expectedOptions
      )
      expect(result).toEqual({
        data: {
          id: '59140416-b95f',
          _id: '59140416-b95f',
          _type: 'io.cozy.files',
          dir_id: '41686c35-9d8e'
        }
      })
    })

    it('should send the file size via querystring and headers', async () => {
      const data = new File([''], 'mydoc.epub')
      const params = {
        fileId: '59140416-b95f',
        checksum: 'a6dabd99832b270468e254814df2ed20',
        contentLength: 1234
      }
      const result = await collection.updateFile(data, params)
      const expectedPath = `/files/59140416-b95f?Name=mydoc.epub&Type=file&Executable=false&Encrypted=false&Size=1234&UpdatedAt=${new Date(
        data.lastModified
      ).toISOString()}&CreatedAt=${new Date(data.lastModified).toISOString()}`
      const expectedOptions = {
        headers: {
          'Content-MD5': 'a6dabd99832b270468e254814df2ed20',
          'Content-Type': 'application/epub+zip',
          'Content-Length': '1234'
        }
      }
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'PUT',
        expectedPath,
        data,
        expectedOptions
      )
      expect(result).toEqual({
        data: {
          id: '59140416-b95f',
          _id: '59140416-b95f',
          _type: 'io.cozy.files',
          dir_id: '41686c35-9d8e'
        }
      })
    })

    it('should have a file name', async () => {
      let data = new File([''], '')
      const params = {
        fileId: '59140416-b95f',
        checksum: 'a6dabd99832b270468e254814df2ed20'
      }
      await expect(collection.updateFile(data, params)).rejects.toThrow()

      data = new File([''], 'mydoc.epub')
      await collection.updateFile(data, params)
      const expectedPath = `/files/59140416-b95f?Name=mydoc.epub&Type=file&Executable=false&Encrypted=false&UpdatedAt=${new Date(
        data.lastModified
      ).toISOString()}&CreatedAt=${new Date(data.lastModified).toISOString()}`

      const expectedOptions = {
        headers: {
          'Content-MD5': 'a6dabd99832b270468e254814df2ed20',
          'Content-Type': 'application/epub+zip'
        }
      }
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'PUT',
        expectedPath,
        data,
        expectedOptions
      )

      data = new ArrayBuffer(8)
      params.name = 'mydoc.epub'
      params.contentType = 'application/epub+zip'

      await collection.updateFile(data, params)

      expect(client.fetchJSON).toHaveBeenCalledWith(
        'PUT',
        `/files/59140416-b95f?Name=mydoc.epub&Type=file&Executable=false&Encrypted=false`,
        data,
        expectedOptions
      )
    })

    it('should sanitize the filename', async () => {
      await collection.updateFile(new File([''], ' mydoc .epub'), {
        fileId: '59140416-b95f',
        checksum: 'a6dabd99832b270468e254814df2ed20',
        contentLength: 1234,
        lastModifiedDate: new Date('2021-01-01')
      })
      expect(
        client.fetchJSON.mock.calls[client.fetchJSON.mock.calls.length - 1]
      ).toMatchSnapshot()
    })

    it('should not sanitize the filename if asked not to', async () => {
      await collection.updateFile(
        new File([''], ' mydoc .epub'),
        {
          fileId: '59140416-b95f',
          checksum: 'a6dabd99832b270468e254814df2ed20',
          contentLength: 1234,
          lastModifiedDate: new Date('2021-01-01')
        },
        { sanitizeName: false }
      )
      expect(
        client.fetchJSON.mock.calls[client.fetchJSON.mock.calls.length - 1]
      ).toMatchSnapshot()
    })

    it('should send any given If-Match revision', async () => {
      await collection.updateFile(
        new File([''], 'mydoc.epub'),
        {
          fileId: '59140416-b95f',
          checksum: 'a6dabd99832b270468e254814df2ed20',
          contentLength: 1234,
          lastModifiedDate: new Date('2021-01-01')
        },
        { ifMatch: '1-456' }
      )
      expect(
        client.fetchJSON.mock.calls[client.fetchJSON.mock.calls.length - 1]
      ).toMatchSnapshot()
    })
  })

  describe('emptyTrash', () => {
    it('should empty the trash', async () => {
      await collection.emptyTrash()
      expect(client.fetchJSON).toHaveBeenCalledWith('DELETE', '/files/trash')
    })
  })

  describe('restore', () => {
    it('should restore a trashed file', async () => {
      const FILE_ID = 'd04ab491-2fc6'
      client.fetchJSON.mockReturnValue({
        data: {
          id: FILE_ID,
          meta: {
            rev: 'abc'
          },
          trashed: false
        }
      })
      const result = await collection.restore(FILE_ID)
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'POST',
        '/files/trash/d04ab491-2fc6'
      )
      expect(result).toEqual({
        data: {
          id: FILE_ID,
          _id: FILE_ID,
          _rev: 'abc',
          meta: {
            rev: 'abc'
          },
          _type: 'io.cozy.files',
          trashed: false
        }
      })
    })
  })

  describe('copy', () => {
    afterEach(() => {
      client.fetchJSON.mockClear()
    })

    it('should copy a file', async () => {
      const FILE_ID = 'd04ab491-2fc6'
      const COPIED_FILE_ID = '59140416-b95f'
      client.fetchJSON.mockReturnValue({
        data: {
          id: COPIED_FILE_ID,
          type: 'io.cozy.files'
        }
      })
      const result = await collection.copy(FILE_ID)
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'POST',
        '/files/d04ab491-2fc6/copy'
      )
      expect(result).toEqual({
        data: {
          id: COPIED_FILE_ID,
          type: 'io.cozy.files',
          _id: COPIED_FILE_ID,
          _rev: undefined,
          _type: 'io.cozy.files'
        }
      })
    })

    it('should copy a file with custom name and directory', async () => {
      const FILE_ID = 'd04ab491-2fc6'
      const COPIED_FILE_ID = '59140416-b95f'
      const COPIED_FILE_NAME = 'newName'
      const COPIED_DIR_ID = '41686c35-9d8e'
      client.fetchJSON.mockReturnValue({
        data: {
          id: COPIED_FILE_ID,
          type: 'io.cozy.files',
          attributes: {
            name: COPIED_FILE_NAME,
            dir_id: COPIED_DIR_ID
          }
        }
      })
      const result = await collection.copy(
        FILE_ID,
        COPIED_FILE_NAME,
        COPIED_DIR_ID
      )
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'POST',
        '/files/d04ab491-2fc6/copy?Name=newName&DirID=41686c35-9d8e'
      )
      expect(result).toEqual({
        data: {
          id: COPIED_FILE_ID,
          type: 'io.cozy.files',
          _id: COPIED_FILE_ID,
          _rev: undefined,
          _type: 'io.cozy.files',
          name: COPIED_FILE_NAME,
          dir_id: COPIED_DIR_ID,
          attributes: {
            name: COPIED_FILE_NAME,
            dir_id: COPIED_DIR_ID
          }
        }
      })
    })

    it("should remove leading and trailing spaces from the copy's given name", async () => {
      const FILE_ID = 'd04ab491-2fc6'
      const COPIED_FILE_ID = '59140416-b95f'
      const COPIED_FILE_NAME = ' newName '
      const COPIED_DIR_ID = '41686c35-9d8e'
      client.fetchJSON.mockReturnValue({
        data: {
          id: COPIED_FILE_ID,
          type: 'io.cozy.files',
          attributes: {
            name: COPIED_FILE_NAME,
            dir_id: COPIED_DIR_ID
          }
        }
      })
      const result = await collection.copy(
        FILE_ID,
        COPIED_FILE_NAME,
        COPIED_DIR_ID
      )
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'POST',
        '/files/d04ab491-2fc6/copy?Name=newName&DirID=41686c35-9d8e'
      )
      expect(result).toEqual({
        data: {
          id: COPIED_FILE_ID,
          type: 'io.cozy.files',
          _id: COPIED_FILE_ID,
          _rev: undefined,
          _type: 'io.cozy.files',
          name: COPIED_FILE_NAME,
          dir_id: COPIED_DIR_ID,
          attributes: {
            name: COPIED_FILE_NAME,
            dir_id: COPIED_DIR_ID
          }
        }
      })
    })

    it("should not modify the copy's given name if sanitization is disabled", async () => {
      const FILE_ID = 'd04ab491-2fc6'
      const COPIED_FILE_ID = '59140416-b95f'
      const COPIED_FILE_NAME = ' newName '
      const COPIED_DIR_ID = '41686c35-9d8e'
      client.fetchJSON.mockReturnValue({
        data: {
          id: COPIED_FILE_ID,
          type: 'io.cozy.files',
          attributes: {
            name: COPIED_FILE_NAME,
            dir_id: COPIED_DIR_ID
          }
        }
      })
      const result = await collection.copy(
        FILE_ID,
        COPIED_FILE_NAME,
        COPIED_DIR_ID,
        { sanitizeName: false }
      )
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'POST',
        '/files/d04ab491-2fc6/copy?Name=%20newName%20&DirID=41686c35-9d8e'
      )
      expect(result).toEqual({
        data: {
          id: COPIED_FILE_ID,
          type: 'io.cozy.files',
          _id: COPIED_FILE_ID,
          _rev: undefined,
          _type: 'io.cozy.files',
          name: COPIED_FILE_NAME,
          dir_id: COPIED_DIR_ID,
          attributes: {
            name: COPIED_FILE_NAME,
            dir_id: COPIED_DIR_ID
          }
        }
      })
    })
  })

  describe('deleteFilePermanently', () => {
    it('should definitely delete a file', async () => {
      const FILE_ID = 'd04ab491-2fc6'
      client.fetchJSON.mockReturnValue({
        data: {
          id: FILE_ID,
          meta: {
            rev: 'abc'
          }
        }
      })
      const result = await collection.deleteFilePermanently(FILE_ID)
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'PATCH',
        '/files/d04ab491-2fc6',
        {
          data: {
            type: 'io.cozy.files',
            id: 'd04ab491-2fc6',
            attributes: {
              permanent_delete: true
            }
          }
        },
        {
          headers: {
            'If-Match': ''
          }
        }
      )
      expect(result).toEqual({
        data: {
          id: FILE_ID,
          _id: FILE_ID,
          _type: 'io.cozy.files',
          _rev: 'abc',
          meta: {
            rev: 'abc'
          }
        }
      })
    })

    it('should send any given If-Match revision', async () => {
      const FILE_ID = 'd04ab491-2fc6'
      const FILE_REV = '2-7051cbe5c8faecd085a3fa619e6e6337'

      client.fetchJSON.mockReturnValue({
        data: {
          id: FILE_ID,
          type: 'io.cozy.files'
        }
      })

      await collection.deleteFilePermanently(FILE_ID, { ifMatch: FILE_REV })

      expect(client.fetchJSON).toHaveBeenCalledWith(
        'PATCH',
        '/files/d04ab491-2fc6',
        {
          data: {
            type: 'io.cozy.files',
            id: FILE_ID,
            attributes: {
              permanent_delete: true
            }
          }
        },
        {
          headers: {
            'If-Match': FILE_REV
          }
        }
      )
    })
  })

  describe('download', () => {
    beforeEach(() => {
      client.fetchJSON.mockResolvedValue({
        links: {
          related: 'http://downloadable-link'
        },
        data: {}
      })
    })

    afterEach(() => {
      client.fetchJSON.mockClear()
    })

    it('should work when not specifying a revision', async () => {
      const file = {
        _id: '42',
        name: 'fileName'
      }
      await collection.download(file)
      const expectPath = `/files/downloads?Id=${file._id}&Filename=${file.name}`
      expect(client.fetchJSON).toHaveBeenCalledWith('POST', expectPath)
    })

    it('should use download a specific version of a file', async () => {
      const file = {
        _id: '42',
        name: 'fileName'
      }
      await collection.download(file, '123')
      const expectPath = `/files/downloads?VersionId=123&Filename=${file.name}`
      expect(client.fetchJSON).toHaveBeenCalledWith('POST', expectPath)
    })

    it('should use download a specific version of a file with a specific name', async () => {
      const file = {
        _id: '42',
        name: 'fileName'
      }
      await collection.download(file, '123', 'myFileName')
      const expectPath = `/files/downloads?VersionId=123&Filename=myFileName`
      expect(client.fetchJSON).toHaveBeenCalledWith('POST', expectPath)
    })
  })

  describe('createFile', () => {
    const data = new File([''], 'mydoc.epub')
    const id = '59140416-b95f'
    const dirId = '41686c35-9d8e'
    const contentLength = 1234

    beforeEach(() => {
      client.fetchJSON.mockReturnValue({
        data: {
          id: id,
          _id: id,
          dir_id: dirId
        }
      })
    })

    afterEach(() => {
      client.fetchJSON.mockClear()
    })

    it('should create a file without metadata', async () => {
      const params = { dirId }
      const result = await collection.createFile(data, params)
      const expectedPath = `/files/${dirId}?Name=mydoc.epub&Type=file&Executable=false&Encrypted=false&MetadataID=&Size=&SourceAccount=&SourceAccountIdentifier=&UpdatedAt=${new Date(
        data.lastModified
      ).toISOString()}&CreatedAt=${new Date(data.lastModified).toISOString()}`
      const expectedOptions = {
        headers: {
          'Content-Type': 'application/epub+zip'
        }
      }
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'POST',
        expectedPath,
        data,
        expectedOptions
      )
      expect(result).toEqual({
        data: {
          id: id,
          _id: id,
          _type: 'io.cozy.files',
          dir_id: dirId
        }
      })
    })

    it('should create a file with metadata', async () => {
      const metadataId = '2460a631-ae55'
      client.fetchJSON.mockReturnValueOnce({
        data: {
          id: metadataId
        }
      })
      const params = {
        dirId: dirId,
        metadata: { type: 'bill' }
      }
      const result = await collection.createFile(data, params)
      const expectedPath = `/files/${dirId}?Name=mydoc.epub&Type=file&Executable=false&Encrypted=false&MetadataID=${metadataId}&Size=&SourceAccount=&SourceAccountIdentifier=&UpdatedAt=${new Date(
        data.lastModified
      ).toISOString()}&CreatedAt=${new Date(data.lastModified).toISOString()}`
      const expectedOptions = {
        headers: {
          'Content-Type': 'application/epub+zip'
        }
      }
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'POST',
        expectedPath,
        data,
        expectedOptions
      )
      expect(result).toEqual({
        data: {
          id: id,
          _id: id,
          _type: 'io.cozy.files',
          dir_id: dirId
        }
      })
    })

    it('should send the file size via querystring and headers', async () => {
      const params = { dirId, contentLength }
      const result = await collection.createFile(data, params)
      const expectedPath = `/files/${dirId}?Name=mydoc.epub&Type=file&Executable=false&Encrypted=false&MetadataID=&Size=${String(
        contentLength
      )}&SourceAccount=&SourceAccountIdentifier=&UpdatedAt=${new Date(
        data.lastModified
      ).toISOString()}&CreatedAt=${new Date(data.lastModified).toISOString()}`
      const expectedOptions = {
        headers: {
          'Content-Type': 'application/epub+zip',
          'Content-Length': String(contentLength)
        }
      }
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'POST',
        expectedPath,
        data,
        expectedOptions
      )
      expect(result).toEqual({
        data: {
          id: id,
          _id: id,
          _type: 'io.cozy.files',
          dir_id: dirId
        }
      })
    })

    it('should send the file konnectors params via querystring', async () => {
      const params = {
        dirId,
        contentLength,
        sourceAccount: 'source-account',
        sourceAccountIdentifier: 'bob@cozy.localhost'
      }
      const result = await collection.createFile(data, params)
      const expectedPath = `/files/${dirId}?Name=mydoc.epub&Type=file&Executable=false&Encrypted=false&MetadataID=&Size=${String(
        contentLength
      )}&SourceAccount=source-account&SourceAccountIdentifier=bob%40cozy.localhost&UpdatedAt=${new Date(
        data.lastModified
      ).toISOString()}&CreatedAt=${new Date(data.lastModified).toISOString()}`
      const expectedOptions = {
        headers: {
          'Content-Type': 'application/epub+zip',
          'Content-Length': String(contentLength)
        }
      }
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'POST',
        expectedPath,
        data,
        expectedOptions
      )
      expect(result).toEqual({
        data: {
          id: id,
          _id: id,
          _type: 'io.cozy.files',
          dir_id: dirId
        }
      })
    })

    it('should sanitize the filename', async () => {
      await collection.createFile(new File([''], ' mydoc .epub'), {
        dirId,
        lastModifiedDate: new Date('2021-01-01')
      })
      expect(
        client.fetchJSON.mock.calls[client.fetchJSON.mock.calls.length - 1]
      ).toMatchSnapshot()
    })

    it('should not sanitize the filename if asked not to', async () => {
      await collection.createFile(
        new File([''], ' mydoc .epub'),
        {
          dirId,
          lastModifiedDate: new Date('2021-01-01')
        },
        { sanitizeName: false }
      )
      expect(
        client.fetchJSON.mock.calls[client.fetchJSON.mock.calls.length - 1]
      ).toMatchSnapshot()
    })
  })

  describe('doUpload', () => {
    const id = '59140416-b95f'
    const dirId = '41686c35-9d8e'
    const fileName = 'mydoc.epub'

    beforeEach(() => {
      client.fetchJSON.mockReturnValue({
        data: {
          id: id,
          _id: id,
          dir_id: dirId
        }
      })
    })

    afterEach(() => {
      client.fetchJSON.mockClear()
    })

    it('should use the given content-type', async () => {
      const data = new ArrayBuffer(8)
      const path = `/files/${dirId}?Name=${fileName}&Type=file`
      await collection.doUpload(data, path, {
        contentType: 'application/epub+zip'
      })

      const expectedOptions = {
        headers: {
          'Content-Type': 'application/epub+zip'
        }
      }
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'POST',
        path,
        data,
        expectedOptions
      )
    })

    it('should handle fileName with &', async () => {
      const fileNameWithAmpersand = 'toto%26titi.txt'
      const data = new File([''], fileNameWithAmpersand)
      const path = `/files/${dirId}?Name=${fileNameWithAmpersand}&Type=file`

      await collection.doUpload(data, path, {})

      const date = new Date(data.lastModified).toISOString()
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'POST',
        `${path}&UpdatedAt=${date}&CreatedAt=${date}`,
        data,
        {
          headers: {
            'Content-Type': 'text/plain'
          }
        }
      )
    })

    it('should set the File content-type', async () => {
      const data = new File([''], fileName)
      const path = `/files/${dirId}?Name=${fileName}&Type=file`
      await collection.doUpload(data, path, {})

      const expectedOptions = {
        headers: {
          'Content-Type': 'application/epub+zip'
        }
      }
      const date = new Date(data.lastModified).toISOString()
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'POST',
        `${path}&UpdatedAt=${date}&CreatedAt=${date}`,
        data,
        expectedOptions
      )
    })

    it('should infer the content-type based on name', async () => {
      const data = new ArrayBuffer(8)
      const path = `/files/${dirId}?Name=${fileName}&Type=file`
      await collection.doUpload(data, path, {})

      const expectedOptions = {
        headers: {
          'Content-Type': 'application/epub+zip'
        }
      }
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'POST',
        path,
        data,
        expectedOptions
      )
    })

    it('should fallback on application/octet-stream content-type', async () => {
      const data = new ArrayBuffer(8)
      const name = 'mydoc.fakeext'
      const path = `/files/${dirId}?Name=${name}&Type=file`
      await collection.doUpload(data, path, {})

      const expectedOptions = {
        headers: {
          'Content-Type': 'application/octet-stream'
        }
      }
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'POST',
        path,
        data,
        expectedOptions
      )
    })

    it('should set the lastModifiedDate from File', async () => {
      const data = new File([''], fileName)
      const path = `/files/${dirId}?Name=${undefined}&Type=file`
      await collection.doUpload(data, path, {})

      const expectedOptions = {
        headers: {
          'Content-Type': 'application/octet-stream'
        }
      }
      const date = new Date(data.lastModified).toISOString()
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'POST',
        `${path}&UpdatedAt=${date}&CreatedAt=${date}`,
        data,
        expectedOptions
      )
    })

    it('should set the given lastModifiedDate', async () => {
      const data = new File([''], fileName)
      const lastModifiedDate = new Date('2021-01-01')
      const path = `/files/${dirId}?Name=${undefined}&Type=file`
      await collection.doUpload(data, path, { lastModifiedDate })

      const expectedOptions = {
        headers: {
          'Content-Type': 'application/octet-stream'
        }
      }
      const date = new Date(lastModifiedDate).toISOString()
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'POST',
        `${path}&UpdatedAt=${date}&CreatedAt=${date}`,
        data,
        expectedOptions
      )
    })

    it('should send any given If-Match revision', async () => {
      const data = new File([''], fileName)
      const path = `/files/${dirId}?Name=${fileName}&Type=file`
      await collection.doUpload(data, path, { ifMatch: '1-456' })

      const expectedOptions = {
        headers: {
          'Content-Type': 'application/epub+zip',
          'If-Match': '1-456'
        }
      }
      const date = new Date(data.lastModified).toISOString()
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'POST',
        `${path}&UpdatedAt=${date}&CreatedAt=${date}`,
        data,
        expectedOptions
      )
    })
  })

  describe('isChild', () => {
    beforeEach(() => {
      client.fetchJSON
        .mockReturnValue({
          data: {
            _id: 'root-id',
            dir_id: '',
            path: '/'
          }
        })
        .mockReturnValueOnce({
          data: {
            _id: '123',
            dir_id: 'root-id',
            path: '/a/b'
          }
        })
        .mockReturnValueOnce({
          data: {
            _id: '456',
            dir_id: '123',
            path: '/a/b/c'
          }
        })
    })

    it('should find the parent with path', async () => {
      const child = { _id: 'file-id', path: '/a/b/c', dirID: '456' }
      const parent = { _id: 'root-id' }
      const res = await collection.isChildOf(child, parent)
      expect(res).toEqual(true)

      expect(client.fetchJSON).toHaveBeenNthCalledWith(
        1,
        'GET',
        '/files/metadata?Path=%2Fa'
      )
      expect(client.fetchJSON).toHaveBeenNthCalledWith(
        2,
        'GET',
        '/files/metadata?Path=%2Fa%2Fb'
      )
      expect(client.fetchJSON).toHaveBeenNthCalledWith(
        3,
        'GET',
        '/files/metadata?Path=%2Fa%2Fb%2Fc'
      )
    })

    it('should find the parent with id', async () => {
      client.fetchJSON
        .mockReturnValueOnce({
          data: {
            _id: 'root-id',
            dir_id: '',
            path: '/'
          }
        })
        .mockReturnValueOnce({
          data: {
            _id: '123',
            dir_id: 'root-id',
            path: '/a'
          }
        })
        .mockReturnValueOnce({
          data: {
            _id: 'file-id',
            dir_id: '123',
            path: '/a/b'
          }
        })

      const res = await collection.isChildOf('file-id', 'root-id')
      expect(res).toEqual(true)
    })

    it('should find the parent with dirID', async () => {
      const child = { _id: 'file-id', path: '/a/b/c', dirID: 'root-id' }
      const parent = 'root-id'
      const res = await collection.isChildOf(child, parent)
      expect(res).toEqual(true)
    })

    it('should not find the parent', async () => {
      const child = { _id: 'file-id', path: '/a/b/c', dirID: '456' }
      const parent = { _id: 'fake-id' }
      const res = await collection.isChildOf(child, parent)
      expect(res).toEqual(false)
    })
  })

  describe('fetchFileContentById', () => {
    it('should fetch the content of a file', async () => {
      const FILE_ID = 'd04ab491-2fc6'

      await collection.fetchFileContentById(FILE_ID)
      expect(client.fetch).toHaveBeenCalledWith(
        'GET',
        '/files/download/d04ab491-2fc6'
      )
    })
  })

  describe('findNotSynchronizedDirectories', () => {
    const client = new CozyStackClient()
    const collection = new FileCollection('io.cozy.files', client)

    const spy = jest.spyOn(client, 'fetchJSON')

    beforeEach(() => {
      spy.mockClear()
    })

    const oauthClient = {
      _type: 'io.cozy.oauth.clients',
      _id: '123'
    }

    it('should pass all the filters', () => {
      spy.mockReturnValue({
        data: [],
        meta: {}
      })
      collection.findNotSynchronizedDirectories(oauthClient)
      expect(spy).toMatchSnapshot()
    })

    it('should accept an `includeFiles` param to fetch whole directory objects', async () => {
      spy.mockReturnValue({
        data: [],
        meta: {}
      })
      collection.findNotSynchronizedDirectories(oauthClient, {
        includeFiles: true
      })
      expect(spy).toMatchSnapshot()
    })

    it('should detect a next page', async () => {
      spy.mockReturnValue({
        data: [],
        links: {
          next: 'http://example.com/next'
        },
        meta: {}
      })
      const result = await collection.findNotSynchronizedDirectories(
        oauthClient
      )
      expect(result.next).toBe(true)
    })

    it('should detect the abscence of a next page', async () => {
      spy.mockReturnValue({
        data: [],
        links: {},
        meta: {}
      })
      const result = await collection.findNotSynchronizedDirectories(
        oauthClient
      )
      expect(result.next).toBe(false)
    })
  })

  describe('synchronization directories exclusions', () => {
    const client = new CozyStackClient()
    const collection = new FileCollection('io.cozy.files', client)

    const spy = jest.spyOn(client, 'fetchJSON')

    beforeEach(() => {
      spy.mockClear()
    })

    const oauthClient = {
      _type: 'io.cozy.oauth.clients',
      _id: '123'
    }

    it('should add a directory exclusion', async () => {
      const directories = [
        {
          _id: '456',
          _type: 'io.cozy.files'
        }
      ]
      await collection.addNotSynchronizedDirectories(oauthClient, directories)
      expect(spy).toMatchSnapshot()
    })

    it('should remove a directory exclusion', async () => {
      const directories = [
        {
          _id: '456',
          _type: 'io.cozy.files'
        }
      ]
      await collection.removeNotSynchronizedDirectories(
        oauthClient,
        directories
      )
      expect(spy).toMatchSnapshot()
    })
  })

  describe('fetchChanges', () => {
    const collection = new FileCollection('io.cozy.files', client)
    const defaultCouchOptions = { since: 'my-seq' }
    beforeEach(() => {
      client.fetchJSON.mockReturnValueOnce(
        Promise.resolve({
          last_seq: 'new-seq',
          pending: false,
          results: [
            {
              doc: {
                _id: '1',
                type: 'directory',
                name: 'bills',
                dir_id: 'io.cozy.files.root-dir',
                created_at: '2016-11-25T16:07:45.398867198+01:00',
                updated_at: '2016-11-25T16:07:45.398867198+01:00',
                tags: []
              }
            },
            { doc: null },
            { doc: { _id: '_design/view' } },
            {
              doc: {
                _id: '2',
                type: 'file',
                name: 'first-month.pdf',
                dir_id: '1',
                created_at: '2016-11-25T16:07:45.398867198+01:00',
                updated_at: '2016-11-25T16:07:45.398867198+01:00',
                tags: []
              }
            }
          ]
        })
      )
    })

    it('should call the right route without parameters', async () => {
      await collection.fetchChanges()
      expect(client.fetchJSON).toHaveBeenCalledWith('GET', '/files/_changes')
    })

    it('should call the right route with deprecated parameter', async () => {
      jest.spyOn(logger, 'warn').mockImplementation(() => {})
      await collection.fetchChanges('my-seq')
      logger.warn.mockRestore()
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'GET',
        '/files/_changes?since=my-seq'
      )
    })

    it('should call the right route with current parameters', async () => {
      await collection.fetchChanges({ limit: 100 })
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'GET',
        '/files/_changes?limit=100'
      )
    })

    it('should  be possible to call fetchChanges with includeDocs false', async () => {
      client.fetchJSON = jest.fn().mockReturnValue(
        Promise.resolve({
          last_seq: '5-xxx',
          pending: 0,
          results: [
            {
              changes: [
                {
                  rev: '2-7051cbe5c8faecd085a3fa619e6e6337'
                }
              ],
              id: '6478c2ae800dfc387396d14e1fc39626',
              seq: '3-xxx'
            },
            {
              changes: [
                {
                  rev: '3-7379b9e515b161226c6559d90c4dc49f'
                }
              ],
              deleted: true,
              id: '5bbc9ca465f1b0fcd62362168a7c8831',
              seq: '4-xxx'
            },
            {
              changes: [
                {
                  rev: '6-460637e73a6288cb24d532bf91f32969'
                },
                {
                  rev: '5-eeaa298781f60b7bcae0c91bdedd1b87'
                }
              ],
              id: '729eb57437745e506b333068fff665ae',
              seq: '5-xxx'
            }
          ]
        })
      )
      const changes = await collection.fetchChanges({ includeDocs: false })

      expect(client.fetchJSON).toHaveBeenCalledWith('GET', '/files/_changes')

      expect(changes).toEqual({
        pending: 0,
        newLastSeq: '5-xxx',
        results: [
          {
            changes: [
              {
                rev: '2-7051cbe5c8faecd085a3fa619e6e6337'
              }
            ],
            id: '6478c2ae800dfc387396d14e1fc39626',
            seq: '3-xxx'
          },
          {
            changes: [
              {
                rev: '3-7379b9e515b161226c6559d90c4dc49f'
              }
            ],
            deleted: true,
            id: '5bbc9ca465f1b0fcd62362168a7c8831',
            seq: '4-xxx'
          },
          {
            changes: [
              {
                rev: '6-460637e73a6288cb24d532bf91f32969'
              },
              {
                rev: '5-eeaa298781f60b7bcae0c91bdedd1b87'
              }
            ],
            id: '729eb57437745e506b333068fff665ae',
            seq: '5-xxx'
          }
        ]
      })
    })

    it('should support fields option', async () => {
      await collection.fetchChanges(defaultCouchOptions, {
        fields: ['_id', 'name']
      })
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'GET',
        `/files/_changes?since=my-seq&fields=${encodeURIComponent('_id,name')}`
      )
    })

    it('should support includeFilePath option', async () => {
      await collection.fetchChanges(defaultCouchOptions, {
        includeFilePath: true
      })
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'GET',
        '/files/_changes?since=my-seq&include_docs=true&include_file_path=true'
      )
    })

    it('should support skipDeleted option', async () => {
      await collection.fetchChanges(defaultCouchOptions, {
        skipDeleted: true
      })
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'GET',
        '/files/_changes?since=my-seq&skip_deleted=true'
      )
    })

    it('should support skipTrashed option', async () => {
      await collection.fetchChanges(defaultCouchOptions, {
        skipTrashed: true
      })
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'GET',
        '/files/_changes?since=my-seq&include_docs=true&skip_trashed=true'
      )
    })
  })

  describe('createArchiveLinkByIds', () => {
    beforeEach(() => {
      client.fetchJSON.mockResolvedValue({ links: { related: 'link' } })
    })
    afterEach(() => {
      client.fetchJSON.mockReset()
    })

    it('should call the right route', async () => {
      const ids = ['42', '43']
      await collection.createArchiveLinkByIds({ ids })
      expect(client.fetchJSON).toHaveBeenCalledWith('POST', '/files/archive', {
        data: {
          attributes: {
            ids,
            name: 'files'
          },
          type: 'io.cozy.archives'
        }
      })
    })
    it('should call the right route with a custom name', async () => {
      const ids = ['42', '43']
      const name = 'my-archive'
      await collection.createArchiveLinkByIds({ ids, name })
      expect(client.fetchJSON).toHaveBeenCalledWith('POST', '/files/archive', {
        data: {
          attributes: {
            ids,
            name
          },
          type: 'io.cozy.archives'
        }
      })
    })
    it('should call the right route with a specific page by file', async () => {
      const ids = ['42', '43']
      const pages = [{ id: '42', page: 1 }, { id: '43', page: 2 }]
      await collection.createArchiveLinkByIds({ ids, pages })
      expect(client.fetchJSON).toHaveBeenCalledWith('POST', '/files/archive', {
        data: {
          attributes: {
            ids,
            name: 'files',
            pages
          },
          type: 'io.cozy.archives'
        }
      })
    })
  })

  describe('downloadArchive', () => {
    beforeEach(() => {
      client.fetchJSON.mockResolvedValue({ links: { related: 'link' } })
    })
    afterEach(() => {
      client.fetchJSON.mockReset()
    })

    it('should call the right route', async () => {
      const ids = ['42']
      await collection.downloadArchive(ids)
      expect(client.fetchJSON).toHaveBeenCalledWith('POST', '/files/archive', {
        data: {
          attributes: { ids, name: 'files' },
          type: 'io.cozy.archives'
        }
      })
    })
    it('should call the right route with a custom name', async () => {
      const ids = ['42']
      const name = 'my-archive'
      await collection.downloadArchive(ids, name)
      expect(client.fetchJSON).toHaveBeenCalledWith('POST', '/files/archive', {
        data: {
          attributes: { ids, name },
          type: 'io.cozy.archives'
        }
      })
    })
    it('should call the right route with a specific page by file', async () => {
      const ids = ['42']
      const pages = [{ id: '42', page: 1 }]
      await collection.downloadArchive(ids, undefined, { pages })
      expect(client.fetchJSON).toHaveBeenCalledWith('POST', '/files/archive', {
        data: {
          attributes: { ids, name: 'files', pages },
          type: 'io.cozy.archives'
        }
      })
    })
  })

  describe('getOrCreateSharedDrivesDirectory', () => {
    it('should call the right route', async () => {
      await collection.getOrCreateSharedDrivesDirectory()

      expect(client.fetchJSON).toHaveBeenCalledWith(
        'POST',
        '/files/shared-drives'
      )
    })
  })
})
