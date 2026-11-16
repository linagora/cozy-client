import FileRecentsCollection, {
  FILE_RECENTS_DOCTYPE
} from './FileRecentsCollection'
import CozyStackClient from './CozyStackClient'

const queryParams = url => {
  const [path, query = ''] = url.split('?')
  return { path, params: Object.fromEntries(new URLSearchParams(query)) }
}

const recent = (id, attributes = {}, file = { type: 'io.cozy.files', id }) => ({
  type: FILE_RECENTS_DOCTYPE,
  id,
  meta: { rev: `1-${id}` },
  attributes: {
    last_activity_at: '2026-11-08T10:00:00Z',
    name: `name-of-${id}`,
    type: 'file',
    ...attributes
  },
  relationships: { file: { data: file } }
})

const includedFile = id => ({
  type: 'io.cozy.files',
  id,
  meta: { rev: `2-${id}` },
  attributes: { type: 'file', name: `current-${id}`, size: '12345' },
  links: { self: `/files/${id}` }
})

describe('FileRecentsCollection', () => {
  const stackClient = new CozyStackClient()
  const collection = new FileRecentsCollection(stackClient)

  beforeEach(() => {
    jest.spyOn(stackClient, 'fetchJSON').mockResolvedValue({
      data: [],
      meta: { count: 0 }
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('is the collection of the io.cozy.files.recents doctype', () => {
    expect(stackClient.collection(FILE_RECENTS_DOCTYPE)).toBeInstanceOf(
      FileRecentsCollection
    )
  })

  describe('all', () => {
    it('reads the first page of the recents', async () => {
      await collection.all()

      expect(stackClient.fetchJSON).toHaveBeenCalledWith(
        'GET',
        '/files/recents'
      )
    })

    it('passes the limit and the cursor of the page', async () => {
      await collection.all({ limit: 20, bookmark: 'cursor-1' })

      const [method, url] = stackClient.fetchJSON.mock.calls[0]
      expect(method).toBe('GET')
      expect(queryParams(url)).toEqual({
        path: '/files/recents',
        params: { 'page[limit]': '20', 'page[cursor]': 'cursor-1' }
      })
    })

    it('normalizes the recents and their file relationship', async () => {
      stackClient.fetchJSON.mockResolvedValue({
        data: [recent('cat', { mime: 'image/jpeg' })],
        meta: { count: 1 }
      })

      const { data } = await collection.all()

      expect(data[0]).toMatchObject({
        _id: 'cat',
        id: 'cat',
        _type: FILE_RECENTS_DOCTYPE,
        _rev: '1-cat',
        name: 'name-of-cat',
        mime: 'image/jpeg',
        last_activity_at: '2026-11-08T10:00:00Z',
        relationships: {
          file: { data: { _id: 'cat', _type: 'io.cozy.files' } }
        }
      })
    })

    it('keeps an empty file relationship for an item the user cannot read', async () => {
      stackClient.fetchJSON.mockResolvedValue({
        data: [recent('lost', {}, null)],
        meta: { count: 1 }
      })

      const { data } = await collection.all()

      expect(data[0].relationships.file).toEqual({ data: null })
    })

    it('normalizes the included files as io.cozy.files', async () => {
      stackClient.fetchJSON.mockResolvedValue({
        data: [recent('cat')],
        included: [includedFile('cat')],
        meta: { count: 1 }
      })

      const { included } = await collection.all()

      expect(included).toEqual([
        expect.objectContaining({
          _id: 'cat',
          _type: 'io.cozy.files',
          _rev: '2-cat',
          name: 'current-cat',
          size: '12345'
        })
      ])
    })

    it('returns no included file when the response has none', async () => {
      const { included } = await collection.all()

      expect(included).toEqual([])
    })

    it('returns the cursor of the next page', async () => {
      stackClient.fetchJSON.mockResolvedValue({
        data: [recent('cat')],
        meta: { count: 1 },
        links: {
          next:
            '/files/recents?page%5Bcursor%5D=eyJpZCI6ImNhdCJ9&page%5Blimit%5D=1'
        }
      })

      const result = await collection.all({ limit: 1 })

      expect(result.next).toBe(true)
      expect(result.bookmark).toBe('eyJpZCI6ImNhdCJ9')
    })

    it('has a next page after an empty page that has a next link', async () => {
      stackClient.fetchJSON.mockResolvedValue({
        data: [],
        meta: { count: 0 },
        links: { next: '/files/recents?page%5Bcursor%5D=c2&page%5Blimit%5D=2' }
      })

      const result = await collection.all({ limit: 2 })

      expect(result.next).toBe(true)
      expect(result.bookmark).toBe('c2')
    })

    it('has no next page without a next link', async () => {
      stackClient.fetchJSON.mockResolvedValue({
        data: [recent('cat')],
        meta: { count: 1 }
      })

      const result = await collection.all({ limit: 1 })

      expect(result.next).toBe(false)
      expect(result.bookmark).toBe(null)
    })

    it('lets a 404 propagate, when the recents are disabled on the stack', async () => {
      stackClient.fetchJSON.mockRejectedValue(
        Object.assign(new Error('Not Found'), { status: 404 })
      )

      await expect(collection.all()).rejects.toThrow()
    })
  })

  it.each(['get', 'getAll', 'find'])(
    'does not support %s, since the recents are only listed',
    async method => {
      await expect(collection[method]()).rejects.toThrow(
        'io.cozy.files.recents can only be listed'
      )
      expect(stackClient.fetchJSON).not.toHaveBeenCalled()
    }
  )
})
