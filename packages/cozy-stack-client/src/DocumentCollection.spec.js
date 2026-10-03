jest.mock('./CozyStackClient')

import flag from 'cozy-flags'
import CozyStackClient from './CozyStackClient'
import DocumentCollection from './DocumentCollection'
import { isMatchingIndex } from './mangoIndex'
import logger from './logger'

jest.mock('./mangoIndex', () => ({
  ...jest.requireActual('./mangoIndex'),
  isMatchingIndex: jest.fn()
}))

const ALL_RESPONSE_FIXTURE = {
  offset: 0,
  rows: [
    {
      id: '12345',
      doc: { _id: '12345', label: 'Buy bread', done: false }
    },
    {
      id: '67890',
      doc: { _id: '67890', label: 'Check email', done: false }
    },
    {
      id: '_design/todo',
      doc: { _id: '_design/todo' }
    }
  ],
  total_rows: 3
}

const NORMAL_RESPONSE_FIXTURE = {
  rows: [
    {
      id: '12345',
      label: 'Buy bread',
      done: false
    },
    {
      id: '67890',
      label: 'Check email',
      done: false
    }
  ],
  total_rows: 2
}

const FIND_RESPONSE_FIXTURE = {
  docs: [
    { _id: '12345', label: 'Buy bread', done: false },
    { _id: '67890', label: 'Check email', done: false }
  ],
  limit: 100,
  next: false
}

const GET_RESPONSE_FIXTURE = {
  id: '12345',
  label: 'Buy bread',
  done: false
}

const NEW_TODO = {
  label: 'Jettison boosters',
  done: false
}
const CREATE_RESPONSE_FIXTURE = {
  id: '12345',
  ok: true,
  type: 'io.cozy.todos',
  rev: '1-67890',
  data: {
    _id: '12345',
    _type: 'io.cozy.todos',
    _rev: '1-67890',
    ...NEW_TODO
  }
}

const TODO_TO_UPDATE = {
  _id: '12345',
  _type: 'io.cozy.todos',
  _rev: '1-67890',
  label: 'Jettison boosters',
  done: false
}
const UPDATE_RESPONSE_FIXTURE = {
  id: '12345',
  ok: true,
  type: 'io.cozy.todos',
  rev: '2-67890',
  data: {
    _rev: '2-67890',
    ...TODO_TO_UPDATE
  }
}

const TODO_TO_DESTROY = {
  _id: '12345',
  _type: 'io.cozy.todos',
  _rev: '1-67890'
}
const DESTROY_RESPONSE_FIXTURE = {
  id: '12345',
  type: 'io.cozy.todos',
  ok: true,
  rev: '2-12345',
  _deleted: true
}

describe('DocumentCollection', () => {
  const client = new CozyStackClient()

  describe('all', () => {
    const collection = new DocumentCollection('io.cozy.todos', client)

    beforeAll(() => {
      client.fetchJSON.mockResolvedValue(NORMAL_RESPONSE_FIXTURE)
      jest.spyOn(logger, 'warn').mockImplementation(() => {})
    })

    it('should call the right route', async () => {
      await collection.all()
      expect(client.fetchJSON).toHaveBeenLastCalledWith(
        'GET',
        '/data/io.cozy.todos/_normal_docs?include_docs=true&limit=100'
      )

      client.fetchJSON.mockResolvedValue(ALL_RESPONSE_FIXTURE)
      await collection.all({ limit: null })
      expect(client.fetchJSON).toHaveBeenLastCalledWith(
        'GET',
        '/data/io.cozy.todos/_all_docs?include_docs=true'
      )
    })

    it('should accept skip and limit options', async () => {
      await collection.all({ skip: 50, limit: 200 })
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'GET',
        '/data/io.cozy.todos/_normal_docs?include_docs=true&limit=200&skip=50'
      )
    })

    it('should accept bookmark options', async () => {
      await collection.all({ bookmark: 'himark' })
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'GET',
        '/data/io.cozy.todos/_normal_docs?include_docs=true&limit=100&bookmark=himark'
      )
    })

    it('should paginate results with skip', async () => {
      client.fetchJSON.mockReturnValue({
        rows: [{}, {}],
        total_rows: 3
      })
      const respWithNext = await collection.all({ skip: 0, limit: 2 })
      expect(respWithNext.next).toBe(true)

      client.fetchJSON.mockReturnValue({
        rows: [{}],
        total_rows: 3
      })
      const respWithoutNext = await collection.all({ skip: 2, limit: 2 })
      expect(respWithoutNext.next).toBe(false)
    })

    it('should paginate results with bookmark', async () => {
      client.fetchJSON.mockReturnValue({
        rows: [{}, {}],
        total_rows: 3
      })
      const respWithNext = await collection.all({ limit: 2, bookmark: 'book' })
      expect(respWithNext.next).toBe(true)

      client.fetchJSON.mockReturnValue({
        rows: [{}],
        total_rows: 3
      })
      const respWithoutNext = await collection.all({
        limit: 2,
        bookmark: 'mark'
      })
      expect(respWithoutNext.next).toBe(false)
    })

    it('should accept keys option', async () => {
      client.fetchJSON.mockResolvedValue(ALL_RESPONSE_FIXTURE)
      await collection.all({ keys: ['abc', 'def'] })
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'GET',
        '/data/io.cozy.todos/_all_docs?include_docs=true&limit=100&keys=[%22abc%22,%22def%22]'
      )
    })

    it('should return a correct JSON API response', async () => {
      const resp = await collection.all()
      expect(resp).toConformToJSONAPI()
    })

    it('should return normalized documents', async () => {
      const resp = await collection.all()
      expect(resp.data[0]).toHaveDocumentIdentity()
    })

    it('should normalize documents regardless of the route being used', async () => {
      client.fetchJSON.mockResolvedValue(ALL_RESPONSE_FIXTURE)
      const resp = await collection.all({ keys: ['abc', 'def'] })
      expect(resp.data[0]).toHaveDocumentIdentity()
      expect(resp.data[0].label).toBe('Buy bread')
    })

    it('should not fail if there is no doc of this type yet', async () => {
      client.fetchJSON.mockReturnValue(
        Promise.reject(new Error('404: not_found'))
      )

      const respAll = await collection.all()
      expect(respAll).toConformToJSONAPI()
      expect(respAll.data).toHaveLength(0)

      const respFind = await collection.find({ name: 'Bart' })
      expect(respFind).toConformToJSONAPI()
      expect(respFind.data).toHaveLength(0)

      const respGet = await collection.get('fakeId')
      expect(respGet).toConformToJSONAPI()
      expect(respGet.data).toBe(null)

      const respGetAll = await collection.getAll(['fakeId', 'fakeId2'])
      expect(respGetAll).toConformToJSONAPI()
      expect(respGetAll.data.length).toBe(0)

      client.fetchJSON.mockRestore()
    })

    it('should throw for other error types', async () => {
      client.fetchJSON.mockReturnValueOnce(
        Promise.reject(new Error('Bad request'))
      )
      expect.assertions(1)
      try {
        await collection.all()
      } catch (e) {
        expect(e).toBeInstanceOf(Error)
      }
    })

    it('should not return design documents if we intentionnally define limit=null', async () => {
      client.fetchJSON.mockResolvedValueOnce(
        Promise.resolve(ALL_RESPONSE_FIXTURE)
      )
      const docs = await collection.all({ limit: null })

      expect(docs.data.length).toBe(2)
    })

    it('should works even if the key references an empty doc', async () => {
      const responsesWithEmptyDoc = {
        ...ALL_RESPONSE_FIXTURE,
        rows: [
          ...ALL_RESPONSE_FIXTURE.rows,
          {
            id: '11111',
            doc: null
          }
        ]
      }
      client.fetchJSON.mockResolvedValue(responsesWithEmptyDoc)
      const docs = await collection.all({ keys: ['12345', '67890', '11111'] })
      expect(docs.data.length).toBe(2)
    })

    it('should ignore rows with errors', async () => {
      const responsesWithEmptyDoc = {
        ...ALL_RESPONSE_FIXTURE,
        rows: [
          ...ALL_RESPONSE_FIXTURE.rows,
          {
            key: '11111',
            error: 'not_found'
          }
        ]
      }
      client.fetchJSON.mockResolvedValue(responsesWithEmptyDoc)
      const docs = await collection.all({ keys: ['12345', '67890', '11111'] })
      expect(docs.data.length).toBe(2)
    })
  })

  describe('get', () => {
    const collection = new DocumentCollection('io.cozy.todos', client)

    beforeAll(() => {
      client.fetchJSON.mockResolvedValue(GET_RESPONSE_FIXTURE)
    })
    it('should call the right route', async () => {
      await collection.get('fakeid')
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'GET',
        '/data/io.cozy.todos/fakeid'
      )
    })

    it('should return a correct JSON API response', async () => {
      const resp = await collection.get('fakeid')
      expect(resp).toConformToJSONAPI()
    })

    it('should return normalized document', async () => {
      const resp = await collection.get('fakeid')
      expect(resp.data).toHaveDocumentIdentity()
    })
  })

  describe('createIndex', () => {
    const collection = new DocumentCollection('io.cozy.todos', client)

    describe('existing index', () => {
      beforeAll(() => {
        jest.resetAllMocks()
      })

      afterAll(() => {
        jest.resetAllMocks()
      })

      it('should call the right routes with the right payload', async () => {
        client.fetchJSON.mockResolvedValueOnce({
          id: '_design/123456',
          name: '123456'
        })
        client.fetchJSON.mockResolvedValueOnce({
          data: []
        })
        await collection.createIndex(['label', 'done'])
        expect(client.fetchJSON).toHaveBeenNthCalledWith(
          1,
          'POST',
          '/data/io.cozy.todos/_index',
          { index: { fields: ['label', 'done'] } }
        )
        expect(client.fetchJSON).toHaveBeenNthCalledWith(
          2,
          'POST',
          '/data/io.cozy.todos/_find',
          {
            selector: {
              label: { $gt: null },
              done: { $gt: null }
            },
            limit: 1,
            skip: 0,
            use_index: '_design/123456'
          }
        )
      })

      it('should use the partial filter if defined', async () => {
        client.fetchJSON.mockResolvedValueOnce({
          id: '_design/123456',
          name: '123456',
          result: 'exists'
        })
        const partialFilter = { $trashed: false }
        await collection.createIndex(['label', 'done'], {
          partialFilter
        })
        expect(client.fetchJSON).toHaveBeenCalledWith(
          'POST',
          '/data/io.cozy.todos/_index',
          {
            index: {
              fields: ['label', 'done'],
              partial_filter_selector: partialFilter
            }
          }
        )
      })

      it('should return the index ID', async () => {
        client.fetchJSON.mockResolvedValue({
          id: '_design/123456',
          name: '123456',
          result: 'exists'
        })
        const resp = await collection.createIndex(['label', 'done'])
        expect(resp).toHaveProperty('id', '_design/123456')
      })

      it('should use the partial filter if defined and use it also when querying after a fail', async () => {
        const partialFilter = { $trashed: false }
        collection.find = jest.fn()
        collection.find.mockResolvedValueOnce({ data: [] })
        client.fetchJSON.mockResolvedValueOnce({
          result: 'dontexistyet'
        })
        await collection.createIndex(['label', 'done'], {
          partialFilter
        })

        expect(client.fetchJSON).toHaveBeenCalledWith(
          'POST',
          '/data/io.cozy.todos/_index',
          {
            index: {
              fields: ['label', 'done'],
              partial_filter_selector: partialFilter
            }
          }
        )

        expect(collection.find).toHaveBeenCalledWith(
          { done: { $gt: null }, label: { $gt: null } },
          { indexId: undefined, limit: 1, partialFilterFields: ['$trashed'] }
        )
      })

      fit('dont know yet but its something about logical operator at first selector', async () => {
        const partialFilter = {
          $or: [
            {
              'email.address': {
                $exists: true
              }
            },
            {
              'phone.number': {
                $exists: true
              }
            }
          ]
        }
        collection.find = jest.fn()
        collection.find.mockResolvedValueOnce({ data: [] })
        client.fetchJSON.mockResolvedValueOnce({
          result: 'dontexistyet'
        })
        await collection.createIndex([], {
          partialFilter
        })

        expect(client.fetchJSON).toHaveBeenCalledWith(
          'POST',
          '/data/io.cozy.todos/_index',
          {
            index: {
              fields: [],
              partial_filter_selector: partialFilter
            }
          }
        )

        expect(collection.find).toHaveBeenCalledWith(
          {
            /* _id: {
              $gt: null
            } */
          },
          {
            indexId: undefined,
            limit: 1,
            partialFilterFields: ['$or', 'email.address', 'phone.number']
          }
        )
      })
    })

    describe('new index', () => {
      beforeAll(() => {
        jest.resetAllMocks()
      })
      afterAll(() => {
        jest.resetAllMocks()
      })
      it('should return the index ID', async () => {
        collection.find = jest.fn()
        collection.find.mockResolvedValueOnce({ data: [] })
        client.fetchJSON
          .mockReturnValueOnce(
            Promise.resolve({
              id: '_design/123456',
              name: '123456',
              result: 'created'
            })
          )
          .mockReturnValueOnce(
            Promise.resolve({
              id: '_design/123456',
              name: '123456',
              result: 'exists'
            })
          )
        const resp = await collection.createIndex(['label', 'done'])
        expect(resp).toHaveProperty('id', '_design/123456')
      })
    })
  })

  describe('find', () => {
    beforeEach(() => {
      client.fetchJSON.mockResolvedValue(FIND_RESPONSE_FIXTURE)
    })

    it('should call the right route with the right payload', async () => {
      const collection = new DocumentCollection('io.cozy.todos', client)
      await collection.find({ done: false })
      expect(client.fetchJSON).toHaveBeenLastCalledWith(
        'POST',
        '/data/io.cozy.todos/_find',
        {
          selector: { done: false },
          skip: 0,
          use_index: '_design/by_done'
        }
      )
    })

    it('should accept skip and limit options', async () => {
      const collection = new DocumentCollection('io.cozy.todos', client)
      await collection.find({ done: false }, { skip: 50, limit: 200 })
      expect(client.fetchJSON).toHaveBeenLastCalledWith(
        'POST',
        '/data/io.cozy.todos/_find',
        {
          limit: 200,
          selector: { done: false },
          skip: 50,
          use_index: '_design/by_done'
        }
      )
    })

    it('should accept bookmark option', async () => {
      const collection = new DocumentCollection('io.cozy.todos', client)
      await collection.find({ done: false }, { bookmark: 'himark', limit: 200 })
      expect(client.fetchJSON).toHaveBeenLastCalledWith(
        'POST',
        '/data/io.cozy.todos/_find',
        {
          limit: 200,
          selector: { done: false },
          skip: 0,
          bookmark: 'himark',
          use_index: '_design/by_done'
        }
      )
    })

    it('should accept a sort option', async () => {
      const collection = new DocumentCollection('io.cozy.todos', client)
      await collection.find({ done: false }, { sort: [{ label: 'desc' }] })
      expect(client.fetchJSON).toHaveBeenLastCalledWith(
        'POST',
        '/data/io.cozy.todos/_find',
        {
          skip: 0,
          selector: { done: false },
          sort: [{ label: 'desc' }, { done: 'desc' }],
          use_index: '_design/by_label_and_done'
        }
      )
    })

    it('should use a valid default sorting option', async () => {
      const collection = new DocumentCollection('io.cozy.todos', client)
      await collection.find({ done: false }, { sort: [{ label: 'asc' }] })
      expect(client.fetchJSON).toHaveBeenLastCalledWith(
        'POST',
        '/data/io.cozy.todos/_find',
        {
          skip: 0,
          selector: { done: false },
          sort: [{ label: 'asc' }, { done: 'asc' }],
          use_index: '_design/by_label_and_done'
        }
      )
      await collection.find({ done: false }, { sort: [{ label: 'desc' }] })
      expect(client.fetchJSON).toHaveBeenLastCalledWith(
        'POST',
        '/data/io.cozy.todos/_find',
        {
          skip: 0,
          selector: { done: false },
          sort: [{ label: 'desc' }, { done: 'desc' }],
          use_index: '_design/by_label_and_done'
        }
      )
    })

    it('should throw when using different sort orders', async () => {
      const collection = new DocumentCollection('io.cozy.todos', client)
      await expect(
        collection.find(
          { done: false },
          { sort: [{ label: 'asc' }, { _id: 'desc' }] }
        )
      ).rejects.toThrow()
    })

    it('should respect the sorting order', async () => {
      const collection = new DocumentCollection('io.cozy.todos', client)
      await collection.find(
        { done: false },
        { sort: [{ label: 'desc' }, { _id: 'desc' }] }
      )
      expect(client.fetchJSON).toHaveBeenLastCalledWith(
        'POST',
        '/data/io.cozy.todos/_find',
        {
          skip: 0,
          selector: { done: false },
          sort: [{ label: 'desc' }, { _id: 'desc' }, { done: 'desc' }],
          use_index: '_design/by_label_and__id_and_done'
        }
      )
    })

    it('should return a correct JSON API response', async () => {
      const collection = new DocumentCollection('io.cozy.todos', client)
      const resp = await collection.find({ done: false })
      expect(resp).toConformToJSONAPI()
    })

    it('should return normalized documents', async () => {
      const collection = new DocumentCollection('io.cozy.todos', client)
      const resp = await collection.find({ done: false })
      expect(resp.data[0]).toHaveDocumentIdentity()
    })

    it('should not throw an error if it is a missing index', async () => {
      client.fetchJSON.mockRestore()
      client.fetchJSON
        .mockRejectedValueOnce(new Error('no_index'))
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce(FIND_RESPONSE_FIXTURE)
        .mockResolvedValueOnce(FIND_RESPONSE_FIXTURE)
      const collection = new DocumentCollection('io.cozy.todos', client)
      await expect(
        collection.findWithMango(
          'fakepath',
          { done: { $exists: true } },
          { indexedFields: ['label'] }
        )
      ).resolves.toBe(FIND_RESPONSE_FIXTURE)
      client.fetchJSON
        .mockRejectedValueOnce(new Error('no_usable_index'))
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce(FIND_RESPONSE_FIXTURE)
        .mockResolvedValueOnce(FIND_RESPONSE_FIXTURE)

      await expect(
        collection.findWithMango(
          'fakepath',
          { done: { $exists: true } },
          { indexedFields: ['label'] }
        )
      ).resolves.toBe(FIND_RESPONSE_FIXTURE)
    })

    it('should not throw an error when a warning is returned in resp.warning and a partial filter is defined', async () => {
      client.fetchJSON.mockRestore()
      client.fetchJSON
        .mockResolvedValueOnce({
          rows: [],
          warning:
            '_design/by_label was not used because it does not contain a valid index for this query'
        })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce(FIND_RESPONSE_FIXTURE)
        .mockResolvedValueOnce(FIND_RESPONSE_FIXTURE)
      const collection = new DocumentCollection('io.cozy.todos', client)
      await expect(
        collection.findWithMango(
          'fakepath',
          { label: 'work' },
          {
            indexedFields: ['label'],
            partialFilter: { done: { $exists: true } }
          }
        )
      ).resolves.toBe(FIND_RESPONSE_FIXTURE)
    })

    it('should not throw an error when a warning is returned in resp.meta.warning and a partial filter is defined', async () => {
      client.fetchJSON.mockRestore()
      client.fetchJSON
        .mockResolvedValueOnce({
          rows: [],
          meta: {
            warning:
              '_design/by_label was not used because it does not contain a valid index for this query'
          }
        })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce(FIND_RESPONSE_FIXTURE)
        .mockResolvedValueOnce(FIND_RESPONSE_FIXTURE)
      const collection = new DocumentCollection('io.cozy.todos', client)
      await expect(
        collection.findWithMango(
          'fakepath',
          { label: 'work' },
          {
            indexedFields: ['label'],
            partialFilter: { done: { $exists: true } }
          }
        )
      ).resolves.toBe(FIND_RESPONSE_FIXTURE)
    })

    it('should not throw an error when a warning is returned in resp.warning without a partial filter', async () => {
      client.fetchJSON.mockRestore()
      client.fetchJSON
        .mockResolvedValueOnce({
          rows: [],
          warning:
            '_design/by_label was not used because it does not contain a valid index for this query'
        })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce(FIND_RESPONSE_FIXTURE)
        .mockResolvedValueOnce(FIND_RESPONSE_FIXTURE)
      const collection = new DocumentCollection('io.cozy.todos', client)
      await expect(
        collection.findWithMango(
          'fakepath',
          { label: 'work' },
          { indexedFields: ['label'] }
        )
      ).resolves.toBe(FIND_RESPONSE_FIXTURE)
    })

    it('should not throw an error when a warning is returned in resp.meta.warning without a partial filter', async () => {
      client.fetchJSON.mockRestore()
      client.fetchJSON
        .mockResolvedValueOnce({
          rows: [],
          meta: {
            warning:
              '_design/by_label was not used because it does not contain a valid index for this query'
          }
        })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce(FIND_RESPONSE_FIXTURE)
        .mockResolvedValueOnce(FIND_RESPONSE_FIXTURE)
      const collection = new DocumentCollection('io.cozy.todos', client)
      await expect(
        collection.findWithMango(
          'fakepath',
          { label: 'work' },
          { indexedFields: ['label'] }
        )
      ).resolves.toBe(FIND_RESPONSE_FIXTURE)
    })

    it('should not throw an error if is a timeout', async () => {
      client.fetchJSON.mockRestore()
      client.fetchJSON
        .mockRejectedValueOnce(new Error('context deadline exceeded'))
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce(FIND_RESPONSE_FIXTURE)
        .mockResolvedValueOnce(FIND_RESPONSE_FIXTURE)
      const collection = new DocumentCollection('io.cozy.todos', client)
      await expect(
        collection.findWithMango(
          'fakepath',
          { done: { $exists: true } },
          { indexedFields: ['label'] }
        )
      ).resolves.toBe(FIND_RESPONSE_FIXTURE)
    })

    it('should throw an error if it is not a missing index', async () => {
      client.fetchJSON.mockRestore()
      client.fetchJSON.mockRejectedValueOnce(new Error('custom error'))
      const collection = new DocumentCollection('io.cozy.todos', client)
      await expect(
        collection.findWithMango(
          'fakepath',
          { done: { $exists: true } },
          { indexedFields: ['label'] }
        )
      ).rejects.toThrow()
    })

    it('should index the specified fields when no index exists', async () => {
      client.fetchJSON.mockRestore()
      client.fetchJSON
        .mockRejectedValueOnce(new Error('no_index'))
        .mockReturnValueOnce(
          Promise.resolve({
            rows: []
          })
        )
        .mockReturnValueOnce(
          Promise.resolve({
            id: '_design/by_label',
            name: 'by_label',
            result: 'created'
          })
        )
        .mockResolvedValueOnce(FIND_RESPONSE_FIXTURE)
        .mockResolvedValueOnce(FIND_RESPONSE_FIXTURE)

      const collection = new DocumentCollection('io.cozy.todos', client)
      await collection.find(
        { done: { $exists: true } },
        { indexedFields: ['label'], sort: [{ label: 'desc' }] }
      )
      const expectedFindParams = {
        skip: 0,
        selector: { done: { $exists: true } },
        sort: [{ label: 'desc' }],
        use_index: '_design/by_label'
      }

      expect(client.fetchJSON).toHaveBeenCalledWith(
        'POST',
        '/data/io.cozy.todos/_find',
        expectedFindParams
      )
      expect(client.fetchJSON).toHaveBeenNthCalledWith(
        2,
        'GET',
        '/data/io.cozy.todos/_design_docs?include_docs=true'
      )
      expect(client.fetchJSON).toHaveBeenNthCalledWith(
        3,
        'POST',
        '/data/io.cozy.todos/_index',
        { index: { fields: ['label'] }, ddoc: 'by_label' }
      )
      expect(client.fetchJSON).toHaveBeenLastCalledWith(
        'POST',
        '/data/io.cozy.todos/_find',
        expectedFindParams
      )
    })

    it('should deal with index conflict', async () => {
      client.fetchJSON.mockRestore()
      client.fetchJSON
        .mockRejectedValueOnce(new Error('no_index'))
        .mockResolvedValueOnce({ rows: [] })
        .mockRejectedValueOnce(new Error('error_saving_ddoc'))
        .mockResolvedValueOnce(FIND_RESPONSE_FIXTURE)

      const collection = new DocumentCollection('io.cozy.todos', client)
      await collection.find(
        { done: { $exists: true } },
        { indexedFields: ['label'], sort: [{ label: 'desc' }] }
      )
      const expectedFindParams = {
        skip: 0,
        selector: { done: { $exists: true } },
        sort: [{ label: 'desc' }],
        use_index: '_design/by_label'
      }
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'POST',
        '/data/io.cozy.todos/_find',
        expectedFindParams
      )
      expect(client.fetchJSON).toHaveBeenNthCalledWith(
        2,
        'GET',
        '/data/io.cozy.todos/_design_docs?include_docs=true'
      )
      expect(client.fetchJSON).toHaveBeenNthCalledWith(
        3,
        'POST',
        '/data/io.cozy.todos/_index',
        { index: { fields: ['label'] }, ddoc: 'by_label' }
      )
      expect(client.fetchJSON).toHaveBeenLastCalledWith(
        'POST',
        '/data/io.cozy.todos/_find',
        expectedFindParams
      )
    })

    it('should handle index created in parallel (Index already exists)', async () => {
      client.fetchJSON.mockRestore()

      isMatchingIndex.mockReturnValue(true)

      client.fetchJSON
        .mockRejectedValueOnce(new Error('no_index'))
        .mockResolvedValueOnce({
          rows: [
            {
              doc: {
                _id: '_design/by_label',
                _rev: '1-abc123',
                language: 'query'
              }
            }
          ]
        })
        .mockResolvedValueOnce(FIND_RESPONSE_FIXTURE)

      const collection = new DocumentCollection('io.cozy.todos', client)
      await expect(
        collection.findWithMango(
          'fakepath',
          { done: true },
          { indexedFields: ['label'] }
        )
      ).resolves.toBe(FIND_RESPONSE_FIXTURE)

      expect(client.fetchJSON).toHaveBeenNthCalledWith(
        1,
        'POST',
        'fakepath',
        expect.objectContaining({
          selector: { done: true }
        })
      )

      expect(client.fetchJSON).toHaveBeenNthCalledWith(
        2,
        'GET',
        '/data/io.cozy.todos/_design_docs?include_docs=true'
      )

      expect(client.fetchJSON).toHaveBeenLastCalledWith(
        'POST',
        'fakepath',
        expect.objectContaining({
          selector: { done: true }
        })
      )
    })

    it('should copy existing index', async () => {
      const index = {
        id: '_design/123456',
        doc: {
          _id: '_design/123456',
          _rev: '1-123',
          language: 'query',
          views: {
            123456: {
              map: {
                fields: {
                  label: 'asc',
                  done: 'asc'
                },
                partial_filter_selector: {
                  trashed: false
                }
              }
            }
          }
        }
      }
      isMatchingIndex.mockReturnValue(index.doc)

      client.fetchJSON.mockRestore()
      client.fetchJSON
        .mockRejectedValueOnce(new Error('no_index'))
        .mockResolvedValueOnce({ rows: [index] })
        .mockReturnValueOnce(
          Promise.resolve({
            id: '_design/by_label_and_done_filter_(trashed_false)',
            ok: true,
            rev: '1-123'
          })
        )
        .mockReturnValueOnce(
          Promise.resolve({
            id: '_design/123456',
            ok: true,
            rev: '1-123'
          })
        )
        .mockResolvedValueOnce(FIND_RESPONSE_FIXTURE)
        .mockResolvedValueOnce(FIND_RESPONSE_FIXTURE)

      const collection = new DocumentCollection('io.cozy.todos', client)
      await collection.find(
        { done: { $exists: true } },
        {
          indexedFields: ['label', 'done'],
          sort: [{ label: 'desc' }],
          partialFilter: {
            trashed: false
          }
        }
      )
      const expectedFindParams = {
        skip: 0,
        selector: { done: { $exists: true }, trashed: false },
        sort: [{ label: 'desc' }, { done: 'desc' }],
        use_index: '_design/by_label_and_done_filter_(trashed_false)'
      }
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'POST',
        '/data/io.cozy.todos/_find',
        expectedFindParams
      )
      expect(client.fetchJSON).toHaveBeenNthCalledWith(
        2,
        'GET',
        '/data/io.cozy.todos/_design_docs?include_docs=true'
      )
      expect(client.fetchJSON).toHaveBeenNthCalledWith(
        3,
        'POST',
        '/data/io.cozy.todos/_design/123456/copy?rev=1-123',
        null,
        {
          headers: {
            Destination: '_design/by_label_and_done_filter_(trashed_false)'
          }
        }
      )
      expect(client.fetchJSON).toHaveBeenNthCalledWith(
        4,
        'DELETE',
        '/data/io.cozy.todos/_design/123456?rev=1-123'
      )
      expect(client.fetchJSON).toHaveBeenLastCalledWith(
        'POST',
        '/data/io.cozy.todos/_find',
        expectedFindParams
      )
    })

    it('should set executions stats if flag is enabled', async () => {
      const collection = new DocumentCollection('io.cozy.todos', client)
      flag('debug', true)
      await collection.find({ done: false })
      expect(client.fetchJSON).toHaveBeenLastCalledWith(
        'POST',
        '/data/io.cozy.todos/_find',
        {
          selector: { done: false },
          skip: 0,
          use_index: '_design/by_done',
          execution_stats: true
        }
      )
    })
  })

  describe('findAll', () => {
    beforeEach(() => {
      client.fetchJSON.mockClear()
      client.fetchJSON.mockResolvedValue(FIND_RESPONSE_FIXTURE)
    })

    it('should behave as find method', async () => {
      const collection = new DocumentCollection('io.cozy.todos', client)
      await collection.findAll({ done: false })
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'POST',
        '/data/io.cozy.todos/_find',
        {
          selector: { done: false },
          skip: 0,
          use_index: '_design/by_done',
          execution_stats: true
        }
      )
    })

    it('should call find several time with bookmark until next is true, and returns all data', async () => {
      const FIND_RESPONSE_WITH_NEXT_FIXTURE = {
        docs: [
          { _id: '1111', label: 'Buy bread', done: false },
          { _id: '2222', label: 'Check email', done: false }
        ],
        bookmark: 'AZERTYUIO',
        limit: 100,
        next: true
      }
      client.fetchJSON.mockResolvedValueOnce(FIND_RESPONSE_WITH_NEXT_FIXTURE)

      const collection = new DocumentCollection('io.cozy.todos', client)
      const data = await collection.findAll({ done: false })
      expect(client.fetchJSON).toHaveBeenCalledTimes(2)
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'POST',
        '/data/io.cozy.todos/_find',
        {
          bookmark: 'AZERTYUIO',
          selector: { done: false },
          skip: 0,
          use_index: '_design/by_done',
          execution_stats: true
        }
      )
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'POST',
        '/data/io.cozy.todos/_find',
        {
          selector: { done: false },
          skip: 0,
          use_index: '_design/by_done',
          execution_stats: true
        }
      )
      expect(data).toEqual(
        [
          ...FIND_RESPONSE_WITH_NEXT_FIXTURE.docs,
          ...FIND_RESPONSE_FIXTURE.docs
        ].map(doc => ({ ...doc, id: doc._id, _type: 'io.cozy.todos' }))
      )
    })
  })

  describe('create', () => {
    const collection = new DocumentCollection('io.cozy.todos', client)

    beforeAll(() => {
      jest.resetAllMocks()
      client.fetchJSON.mockResolvedValue(CREATE_RESPONSE_FIXTURE)
    })

    it('should call the right route with the right payload', async () => {
      await collection.create(NEW_TODO)
      expect(client.fetchJSON).toHaveBeenLastCalledWith(
        'POST',
        '/data/io.cozy.todos/',
        NEW_TODO
      )
    })

    it('should return normalized documents', async () => {
      const resp = await collection.create(NEW_TODO)
      expect(resp.data).toHaveDocumentIdentity()
    })
  })

  describe('update', () => {
    const collection = new DocumentCollection('io.cozy.todos', client)

    beforeAll(() => {
      client.fetchJSON.mockResolvedValue(UPDATE_RESPONSE_FIXTURE)
    })

    it('should call the right route with the right payload', async () => {
      await collection.update(TODO_TO_UPDATE)
      expect(client.fetchJSON).toHaveBeenLastCalledWith(
        'PUT',
        `/data/io.cozy.todos/${TODO_TO_UPDATE._id}`,
        TODO_TO_UPDATE
      )
    })

    it('should return normalized documents', async () => {
      const resp = await collection.update(TODO_TO_UPDATE)
      expect(resp.data).toHaveDocumentIdentity()
    })
  })

  describe('destroy', () => {
    const collection = new DocumentCollection('io.cozy.todos', client)

    beforeEach(() => {
      // we first need to mock the return value of getAllSharingLinks()
      client.fetchJSON.mockResolvedValueOnce({ data: [] })
      client.fetchJSON.mockReturnValueOnce(
        Promise.resolve(DESTROY_RESPONSE_FIXTURE)
      )
    })

    afterEach(() => {
      client.fetchJSON.mockRestore()
    })

    it('should call the right route with the right payload', async () => {
      await collection.destroy(TODO_TO_DESTROY)
      expect(client.fetchJSON).toHaveBeenLastCalledWith(
        'DELETE',
        `/data/io.cozy.todos/${TODO_TO_DESTROY._id}?rev=${TODO_TO_DESTROY._rev}`
      )
    })

    it('should return a normalized document', async () => {
      const resp = await collection.destroy(TODO_TO_DESTROY)
      expect(resp.data).toHaveDocumentIdentity()
    })
  })

  describe('batch update/delete', () => {
    const setup = () => {
      const client = new CozyStackClient()
      const collection = new DocumentCollection('io.cozy.simpsons', client)
      jest.spyOn(collection, 'updateAll')
      return { client, collection }
    }

    it('should create database when bulk updating', async () => {
      const { client, collection } = setup()
      jest.spyOn(collection, 'create').mockImplementation(doc => doc)
      client.fetchJSON
        .mockRejectedValueOnce({
          reason: { reason: 'Database does not exist.' }
        })
        .mockImplementationOnce((method, doctype, data) =>
          Promise.resolve(
            data.docs.map(doc => ({
              id: doc._id,
              _rev: Math.random(),
              ok: true
            }))
          )
        )

      const res = await collection.updateAll([
        { _id: 1, name: 'Marge' },
        { _id: 2, name: 'Homer' }
      ])

      expect(collection.create).toHaveBeenCalledWith({
        _id: 1,
        name: 'Marge'
      })
      expect(collection.updateAll).toHaveBeenCalledWith([
        { _id: 2, name: 'Homer' }
      ])
      expect(res.map(doc => doc.id)).toEqual([1, 2])
    })

    it('should remove special _type member from docs before updating', async () => {
      const { client, collection } = setup()
      await collection.updateAll([
        { _id: 1, _type: 'io.cozy.simpsons', name: 'Marge' },
        { _id: 2, _type: 'io.cozy.simpsons', name: 'Homer' }
      ])
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'POST',
        '/data/io.cozy.simpsons/_bulk_docs',
        { docs: [{ _id: 1, name: 'Marge' }, { _id: 2, name: 'Homer' }] }
      )
    })

    it('should do bulk delete', async () => {
      const { collection, client } = setup()
      await collection.destroyAll([
        { _id: 1, name: 'Marge', _type: 'io.cozy.simpsons' },
        { _id: 2, name: 'Homer' }
      ])
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'POST',
        '/data/io.cozy.simpsons/_bulk_docs',
        {
          docs: [
            { _deleted: true, _id: 1, name: 'Marge' },
            { _deleted: true, _id: 2, name: 'Homer' }
          ]
        }
      )
    })
  })

  describe('changes', () => {
    const collection = new DocumentCollection('io.cozy.todos', client)
    const defaultCouchOptions = { since: 'my-seq' }
    beforeEach(() => {
      client.fetchJSON.mockReturnValueOnce(
        Promise.resolve({
          last_seq: 'new-seq',
          results: [
            { doc: { _id: '1', done: false, label: 'Fetch changes' } },
            { doc: null },
            { doc: { _id: '_design/view' } },
            { doc: { _id: '2', _deleted: true, label: 'Refactor code' } }
          ]
        })
      )
    })

    it('should call the right route without parameter', async () => {
      await collection.fetchChanges()
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'GET',
        '/data/io.cozy.todos/_changes?include_docs=true',
        undefined
      )
    })

    it('should call the right route with deprecated parameter', async () => {
      jest.spyOn(logger, 'warn').mockImplementation(() => {})
      await collection.fetchChanges('my-seq')
      logger.warn.mockRestore()
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'GET',
        '/data/io.cozy.todos/_changes?since=my-seq&include_docs=true',
        undefined
      )
    })

    it('should call the right route with deprecated parameter', async () => {
      await collection.fetchChanges({ limit: 100 })
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'GET',
        '/data/io.cozy.todos/_changes?limit=100&include_docs=true',
        undefined
      )
    })

    it('should call changes with doc_ids parameters', async () => {
      await collection.fetchChanges({ doc_ids: [1, 2, 3] })
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'POST',
        '/data/io.cozy.todos/_changes?include_docs=true&filter=_doc_ids',
        { doc_ids: [1, 2, 3] }
      )
    })

    it('should  be possible to call fetchChangesRaw with include_docs false', async () => {
      client.fetchJSON = jest.fn().mockReturnValue({
        last_seq:
          '5-g1AAAAIreJyVkEsKwjAURZ-toI5cgq5A0sQ0OrI70XyppcaRY92J7kR3ojupaSPUUgotgRd4yTlwbw4A0zRUMLdnpaMkwmyF3Ily9xBwEIuiKLI05KOTW0wkV4rruP29UyGWbordzwKVxWBNOGMKZhertDlarbr5pOT3DV4gudUC9-MPJX9tpEAYx4TQASns2E24ucuJ7rXJSL1BbEgf3vTwpmedCZkYa7Pulck7Xt7x_usFU2aIHOD4eEfVTVA5KMGUkqhNZV-8_o5i',
        pending: 0,
        results: [
          {
            changes: [
              {
                rev: '2-7051cbe5c8faecd085a3fa619e6e6337'
              }
            ],
            id: '6478c2ae800dfc387396d14e1fc39626',
            seq:
              '3-g1AAAAG3eJzLYWBg4MhgTmHgz8tPSTV0MDQy1zMAQsMcoARTIkOS_P___7MSGXAqSVIAkkn2IFUZzIkMuUAee5pRqnGiuXkKA2dpXkpqWmZeagpu_Q4g_fGEbEkAqaqH2sIItsXAyMjM2NgUUwdOU_JYgCRDA5ACGjQfn30QlQsgKvcjfGaQZmaUmmZClM8gZhyAmHGfsG0PICrBPmQC22ZqbGRqamyIqSsLAAArcXo'
          },
          {
            changes: [
              {
                rev: '3-7379b9e515b161226c6559d90c4dc49f'
              }
            ],
            deleted: true,
            id: '5bbc9ca465f1b0fcd62362168a7c8831',
            seq:
              '4-g1AAAAHXeJzLYWBg4MhgTmHgz8tPSTV0MDQy1zMAQsMcoARTIkOS_P___7MymBMZc4EC7MmJKSmJqWaYynEakaQAJJPsoaYwgE1JM0o1TjQ3T2HgLM1LSU3LzEtNwa3fAaQ_HqQ_kQG3qgSQqnoUtxoYGZkZG5uS4NY8FiDJ0ACkgAbNx2cfROUCiMr9CJ8ZpJkZpaaZEOUziBkHIGbcJ2zbA4hKsA-ZwLaZGhuZmhobYurKAgCz33kh'
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
            seq:
              '5-g1AAAAIReJyVkE0OgjAQRkcwUVceQU9g-mOpruQm2tI2SLCuXOtN9CZ6E70JFmpCCCFCmkyTdt6bfJMDwDQNFcztWWkcY8JXyB2cu49AgFwURZGloRid3MMkEUoJHbXbOxVy6arc_SxQWQzRVHCuYHaxSpuj1aqbj0t-3-AlSrZakn78oeSvjRSIkIhSNiCFHbsKN3c50b02mURvEB-yD296eNOzzoRMRLRZ98rkHS_veGcC_nR-fGe1gaCaxihhjOI2lX0BhniHaA'
          }
        ]
      })
      const changes = await collection.fetchChangesRaw({ includeDocs: false })

      expect(client.fetchJSON).toHaveBeenCalledWith(
        'GET',
        '/data/io.cozy.todos/_changes?include_docs=false',
        undefined
      )

      expect(changes).toEqual({
        pending: 0,
        last_seq:
          '5-g1AAAAIreJyVkEsKwjAURZ-toI5cgq5A0sQ0OrI70XyppcaRY92J7kR3ojupaSPUUgotgRd4yTlwbw4A0zRUMLdnpaMkwmyF3Ily9xBwEIuiKLI05KOTW0wkV4rruP29UyGWbordzwKVxWBNOGMKZhertDlarbr5pOT3DV4gudUC9-MPJX9tpEAYx4TQASns2E24ucuJ7rXJSL1BbEgf3vTwpmedCZkYa7Pulck7Xt7x_usFU2aIHOD4eEfVTVA5KMGUkqhNZV-8_o5i',
        results: [
          {
            changes: [
              {
                rev: '2-7051cbe5c8faecd085a3fa619e6e6337'
              }
            ],
            id: '6478c2ae800dfc387396d14e1fc39626',
            seq:
              '3-g1AAAAG3eJzLYWBg4MhgTmHgz8tPSTV0MDQy1zMAQsMcoARTIkOS_P___7MSGXAqSVIAkkn2IFUZzIkMuUAee5pRqnGiuXkKA2dpXkpqWmZeagpu_Q4g_fGEbEkAqaqH2sIItsXAyMjM2NgUUwdOU_JYgCRDA5ACGjQfn30QlQsgKvcjfGaQZmaUmmZClM8gZhyAmHGfsG0PICrBPmQC22ZqbGRqamyIqSsLAAArcXo'
          },
          {
            changes: [
              {
                rev: '3-7379b9e515b161226c6559d90c4dc49f'
              }
            ],
            deleted: true,
            id: '5bbc9ca465f1b0fcd62362168a7c8831',
            seq:
              '4-g1AAAAHXeJzLYWBg4MhgTmHgz8tPSTV0MDQy1zMAQsMcoARTIkOS_P___7MymBMZc4EC7MmJKSmJqWaYynEakaQAJJPsoaYwgE1JM0o1TjQ3T2HgLM1LSU3LzEtNwa3fAaQ_HqQ_kQG3qgSQqnoUtxoYGZkZG5uS4NY8FiDJ0ACkgAbNx2cfROUCiMr9CJ8ZpJkZpaaZEOUziBkHIGbcJ2zbA4hKsA-ZwLaZGhuZmhobYurKAgCz33kh'
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
            seq:
              '5-g1AAAAIReJyVkE0OgjAQRkcwUVceQU9g-mOpruQm2tI2SLCuXOtN9CZ6E70JFmpCCCFCmkyTdt6bfJMDwDQNFcztWWkcY8JXyB2cu49AgFwURZGloRid3MMkEUoJHbXbOxVy6arc_SxQWQzRVHCuYHaxSpuj1aqbj0t-3-AlSrZakn78oeSvjRSIkIhSNiCFHbsKN3c50b02mURvEB-yD296eNOzzoRMRLRZ98rkHS_veGcC_nR-fGe1gaCaxihhjOI2lX0BhniHaA'
          }
        ]
      })
    })

    it('should call the right route', async () => {
      const changes = await collection.fetchChanges(defaultCouchOptions)
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'GET',
        '/data/io.cozy.todos/_changes?since=my-seq&include_docs=true',
        undefined
      )
      expect(changes).toEqual({
        newLastSeq: 'new-seq',
        documents: [
          {
            _id: '1',
            id: '1',
            _type: 'io.cozy.todos',
            done: false,
            label: 'Fetch changes'
          }
        ]
      })
    })

    it('should call support includeDeleted', async () => {
      const changes = await collection.fetchChanges(defaultCouchOptions, {
        includeDeleted: true
      })
      expect(changes).toEqual({
        newLastSeq: 'new-seq',
        documents: [
          {
            _id: '1',
            id: '1',
            _type: 'io.cozy.todos',
            done: false,
            label: 'Fetch changes'
          },
          {
            _id: '2',
            id: '2',
            _type: 'io.cozy.todos',
            _deleted: true,
            label: 'Refactor code'
          }
        ]
      })
    })

    it('should call support includeDesign', async () => {
      const changes = await collection.fetchChanges(defaultCouchOptions, {
        includeDesign: true
      })
      expect(changes).toEqual({
        newLastSeq: 'new-seq',
        documents: [
          {
            _id: '1',
            id: '1',
            _type: 'io.cozy.todos',
            done: false,
            label: 'Fetch changes'
          },
          { _id: '_design/view', id: '_design/view', _type: 'io.cozy.todos' }
        ]
      })
    })
  })

  describe('handleMissingIndex', () => {
    const collection = new DocumentCollection('io.cozy.triggers', client)
    const selector = {
      'message.account': 'ca7b7f1'
    }

    beforeEach(() => {
      collection.findExistingIndex = jest.fn()
      collection.migrateIndex = jest.fn()
      collection.createIndex = jest.fn()
    })

    it('should not throw with undefined indexedFields', async () => {
      client.fetchJSON.mockResolvedValue({ rows: [] })
      expect(
        await collection.handleMissingIndex(selector, {
          indexedFields: undefined,
          sort: undefined
        })
      )
    })

    it('should migrate unamed index with or without indexedFields ', async () => {
      const existingIndex = {
        _id: '123'
      }
      collection.findExistingIndex.mockResolvedValue(existingIndex)
      collection.migrateIndex.mockResolvedValue({})

      await collection.handleMissingIndex(selector, {
        indexedFields: undefined,
        sort: undefined
      })
      expect(collection.migrateIndex).toHaveBeenCalledWith(
        existingIndex,
        'by_message.account'
      )

      await collection.handleMissingIndex(selector, {
        indexedFields: ['message.account']
      })
      expect(collection.migrateIndex).toHaveBeenCalledWith(
        existingIndex,
        'by_message.account'
      )
    })

    it('should create new index, with or without indexedFields', async () => {
      collection.findExistingIndex.mockResolvedValue(null)
      collection.createIndex.mockResolvedValue({})

      await collection.handleMissingIndex(selector, {
        indexedFields: undefined,
        sort: undefined
      })
      expect(collection.createIndex).toHaveBeenCalledWith(['message.account'], {
        indexName: 'by_message.account'
      })

      await collection.handleMissingIndex(selector, {
        indexedFields: ['message.account']
      })
      expect(collection.createIndex).toHaveBeenCalledWith(['message.account'], {
        indexName: 'by_message.account'
      })
    })
  })

  describe('findExistingIndex', () => {
    const collection = new DocumentCollection('io.cozy.triggers', client)
    const selector = {
      'message.account': 'ca7b7f1'
    }
    const index = {
      _id: '_design/123',
      views: {
        '123': {
          map: {
            fields: {
              'cozyMetadata.createdAt': 'desc'
            }
          }
        }
      }
    }

    beforeEach(() => {
      collection.fetchAllMangoIndexes = jest.fn()
    })
    it('should not find anything if there no existing index', async () => {
      collection.fetchAllMangoIndexes.mockResolvedValue([])
      const res = await collection.findExistingIndex(selector, {
        indexedFields: undefined,
        sort: undefined
      })
      expect(res).toBe(null)
    })

    it('should get matching index with correct arguments with indexed field', async () => {
      collection.fetchAllMangoIndexes.mockResolvedValue([index])

      await collection.findExistingIndex(selector, {
        indexedFields: ['message.account']
      })
      expect(isMatchingIndex).toHaveBeenCalledWith(
        index,
        ['message.account'],
        undefined
      )
    })

    it('should get matching index with correct arguments without indexed field', async () => {
      collection.fetchAllMangoIndexes.mockResolvedValue([index])

      await collection.findExistingIndex(selector, {
        sort: [{ 'cozyMetadata.createdAt': 'desc' }]
      })
      expect(isMatchingIndex).toHaveBeenCalledWith(
        index,
        ['cozyMetadata.createdAt', 'message.account'],
        undefined
      )
    })
  })
  describe('toMangoOptions', () => {
    const collection = new DocumentCollection('io.cozy.todos', client)
    let warnSpy

    beforeEach(() => {
      jest.resetAllMocks()
      warnSpy = jest.spyOn(logger, 'warn').mockImplementation(() => {})
    })

    it('should correctly build the indexName', () => {
      const selector = {
        name: {
          $gt: null
        },
        date: {
          $lt: '2022-01-01'
        }
      }

      const opts = collection.toMangoOptions(selector)
      expect(opts.use_index).toEqual('_design/by_name_and_date')
    })

    it('should correctly build the indexName with partialFilter', () => {
      const selector = {
        name: {
          $gt: null
        },
        date: {
          $lt: '2022-01-01'
        }
      }
      const partialFilter = {
        trashed: {
          $ne: true
        }
      }
      const opts = collection.toMangoOptions(selector, { partialFilter })
      expect(opts.use_index).toEqual(
        '_design/by_name_and_date_filter_(trashed_$ne_true)'
      )
    })

    it('should merge selector and partialFilter', () => {
      const selector = {
        name: {
          $gt: null
        }
      }
      const partialFilter = {
        trashed: {
          $ne: true
        }
      }
      const opts = collection.toMangoOptions(selector, { partialFilter })
      expect(opts.selector).toEqual({
        name: {
          $gt: null
        },
        trashed: {
          $ne: true
        }
      })
    })

    it('should not modify the selector after merge', () => {
      // This test is made to ensure there is no side-effect on the selector
      const selector = {
        name: {
          $gt: null
        }
      }
      const selectorCopy = { ...selector }
      collection.toMangoOptions(selector, { partialFilter: { trashed: false } })
      expect(selector).toEqual(selectorCopy)
    })

    it('should correctly build the sort', () => {
      const selector = {
        name: {
          $gt: null
        }
      }
      const sort = [{ name: 'asc' }]
      const indexedFields = ['date']
      const opts = collection.toMangoOptions(selector, {
        sort,
        indexedFields
      })
      expect(opts.sort).toEqual([{ name: 'asc' }, { date: 'asc' }])
    })

    it('should raise warning when there is a selector and no indexFields', () => {
      collection.toMangoOptions({ name: 'toto' }, {})
      expect(warnSpy).toHaveBeenCalled()
    })

    it('should not raise warning when there is a selector and indexFields', () => {
      collection.toMangoOptions({ name: 'toto' }, { indexedFields: ['name'] })
      expect(warnSpy).not.toHaveBeenCalled()
    })

    it('should add mandatory attributes when specifying fields', () => {
      const fields = ['date']
      const opts = collection.toMangoOptions({}, { fields })
      expect(opts.fields).toEqual(['date', '_id', '_rev'])
    })
  })
})
