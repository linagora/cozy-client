import CozyStackClient from './CozyStackClient'
import ContactsCollection from './ContactsCollection'
import DocumentCollection from './DocumentCollection'

const stackMyselfResponse = {
  data: {
    type: 'io.cozy.contacts',
    id: 'bf91cce0-ef48-0137-2638-543d7eb8149c',
    attributes: {
      fullname: 'Alice',
      email: [{ address: 'alice@example.com', primary: true }]
    },
    meta: {
      rev: '1-6516671ec'
    }
  }
}

describe('ContactsCollection', () => {
  describe('find', () => {
    const setup = () => {
      const stackClient = new CozyStackClient({})
      stackClient.fetchJSON = jest
        .fn()
        .mockImplementation(async (method, route) => {
          if (method === 'POST' && route === '/contacts/myself') {
            return stackMyselfResponse
          } else if (route.includes('_index')) {
            return { result: 'exists' }
          } else {
            return { docs: [] }
          }
        })
      const col = new ContactsCollection('io.cozy.contacts', stackClient)
      return { stackClient, col }
    }

    beforeEach(() => {
      jest.spyOn(console, 'warn').mockImplementation(() => {})
    })

    it('call find route if there is no selector', async () => {
      const { col, stackClient } = setup()
      await col.find()
      expect(stackClient.fetchJSON).toHaveBeenCalledWith(
        'POST',
        '/data/io.cozy.contacts/_find',
        expect.any(Object)
      )
    })

    it('should use a special route for the myself contact', async () => {
      const { col, stackClient } = setup()
      const resp = await col.find({
        me: true
      })
      expect(stackClient.fetchJSON).toHaveBeenCalledWith(
        'POST',
        '/contacts/myself'
      )
      expect(resp.data).toEqual([
        expect.objectContaining({
          _id: 'bf91cce0-ef48-0137-2638-543d7eb8149c',
          id: 'bf91cce0-ef48-0137-2638-543d7eb8149c',
          fullname: 'Alice'
        })
      ])
    })

    it('should not use a special route for other types of find', async () => {
      const { col, stackClient } = setup()
      await col.find({
        name: 'Alice'
      })
      expect(stackClient.fetchJSON).toHaveBeenCalledWith(
        'POST',
        '/data/io.cozy.contacts/_find',
        expect.objectContaining({ selector: { name: 'Alice' } })
      )
    })
  })

  describe('destroy', () => {
    const setup = () => {
      const stackClient = new CozyStackClient({})
      const col = new ContactsCollection('io.cozy.contacts', stackClient)
      return { col }
    }

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should delete a contact with no sources', async () => {
      const { col } = setup()

      const documentCollectionDestroySpy = jest
        .spyOn(DocumentCollection.prototype, 'destroy')
        .mockImplementation()

      const contact = {
        _id: '123',
        _rev: '1',
        cozyMetadata: {
          sync: {}
        }
      }

      await col.destroy(contact)
      expect(documentCollectionDestroySpy).toHaveBeenCalledWith(contact)

      const contactWithoutMetadata = {
        _id: '456',
        _rev: '1'
      }
      await col.destroy(contactWithoutMetadata)
      expect(documentCollectionDestroySpy).toHaveBeenCalledWith(
        contactWithoutMetadata
      )
    })

    it('should flag a contact with sources as trashed', async () => {
      const { col } = setup()

      const documentCollectionDestroySpy = jest
        .spyOn(DocumentCollection.prototype, 'destroy')
        .mockImplementation()
      const documentCollectionUpdateSpy = jest
        .spyOn(DocumentCollection.prototype, 'update')
        .mockImplementation()

      const contact = {
        _id: '123',
        cozyMetadata: {
          sync: {
            456: {
              id: 'people/657623'
            }
          }
        }
      }

      await col.destroy(contact)
      expect(documentCollectionDestroySpy).not.toHaveBeenCalled()
      expect(documentCollectionUpdateSpy).toHaveBeenCalledWith({
        ...contact,
        trashed: true
      })
    })
  })
})

describe('contact suggestions', () => {
  let stackClient, collection
  beforeEach(() => {
    stackClient = new CozyStackClient({})
    stackClient.fetchJSON = jest.fn()
    collection = new ContactsCollection('io.cozy.contacts', stackClient)
  })

  it('normalizes mixed results without inventing IDs or group members', async () => {
    stackClient.fetchJSON.mockResolvedValue({
      data: [
        {
          type: 'io.cozy.contacts.groups',
          id: 'b2b-team',
          attributes: { name: 'Team', color: '' }
        },
        {
          type: 'io.cozy.contacts',
          id: 'org-person',
          attributes: {
            fullname: 'Alice',
            email: [{ address: 'alice@example.org' }]
          },
          meta: { kind: 'member' }
        },
        {
          type: 'io.cozy.contacts',
          attributes: {
            fullname: 'Bob',
            email: [{ address: 'bob@example.org' }]
          }
        }
      ]
    })
    const result = await collection.suggest('  É &+  ', { limit: 7 })
    expect(stackClient.fetchJSON).toHaveBeenCalledWith(
      'GET',
      '/contacts/suggest?q=%C3%89%20%26%2B&limit=7'
    )
    expect(result.next).toBe(false)
    expect(result.data[0]).toMatchObject({
      _id: 'b2b-team',
      _type: 'io.cozy.contacts.groups',
      name: 'Team',
      color: ''
    })
    expect(result.data[0]).not.toHaveProperty('members')
    expect(result.data[1]).toMatchObject({
      _id: 'org-person',
      displayName: 'Alice',
      meta: { kind: 'member' }
    })
    expect(result.data[2]).toMatchObject({
      displayName: 'Bob',
      _type: 'io.cozy.contacts'
    })
    expect(result.data[2]).not.toHaveProperty('_id')
    expect(result.data[2]).not.toHaveProperty('id')
  })

  it.each(['', ' a ', '😀'])('rejects short queries: %s', async q => {
    await expect(collection.suggest(q)).rejects.toThrow('at least 2')
    expect(stackClient.fetchJSON).not.toHaveBeenCalled()
  })

  it.each([0, 257, 1.5])('rejects invalid limits: %s', async limit => {
    await expect(collection.suggest('ab', { limit })).rejects.toThrow(
      'between 1 and 256'
    )
    expect(stackClient.fetchJSON).not.toHaveBeenCalled()
  })

  it('uses the default limit and propagates permission errors', async () => {
    const error = Object.assign(new Error('Forbidden'), { status: 403 })
    stackClient.fetchJSON.mockRejectedValue(error)
    await expect(collection.suggest('😀é')).rejects.toBe(error)
    expect(stackClient.fetchJSON).toHaveBeenCalledWith(
      'GET',
      '/contacts/suggest?q=%F0%9F%98%80%C3%A9&limit=20'
    )
  })
})
