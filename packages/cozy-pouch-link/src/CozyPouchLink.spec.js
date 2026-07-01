import omit from 'lodash/omit'

import { find, allDocs, withoutDesignDocuments } from './helpers'
jest.mock('./helpers', () => ({
  find: jest.fn(),
  allDocs: jest.fn(),
  normalizeFindSelector: jest.requireActual('./helpers').default
    .normalizeFindSelector,
  withoutDesignDocuments: jest.fn(),
  isAdapterBugged: jest.fn()
}))
jest.mock('./remote', () => ({
  fetchRemoteInstance: jest.fn()
}))
import { fetchRemoteInstance } from './remote'

import CozyPouchLink from '.'
import { SCHEMA, TODO_1, TODO_2, TODO_3, TODO_4 } from './__tests__/fixtures'
import PouchDB from 'pouchdb-browser'
import PouchDBMemoryAdapterPlugin from 'pouchdb-adapter-memory'
import CozyClient, { Q } from 'cozy-client'
import { MutationTypes } from 'cozy-client/dist'

// Necessary to have the memory adapter for the tests since neither
// IndexedDB nor WebSQL adapter can be used in Jest
PouchDB.plugin(PouchDBMemoryAdapterPlugin)

const mockClient = {
  stackClient: {
    uri: 'http://cozy.tools:8080',
    token: {
      toBasicAuth: () => 'user:token@'
    },
    on: jest.fn()
  }
}

const TODO_DOCTYPE = SCHEMA.todos.doctype

let client, link

async function setup(linkOpts = {}) {
  jest.spyOn(CozyPouchLink.prototype, 'executeMutation')
  jest.spyOn(CozyPouchLink.prototype, 'executeQuery')

  link = new CozyPouchLink({ doctypes: [TODO_DOCTYPE], ...linkOpts })

  client = new CozyClient({
    ...mockClient,
    links: [link],
    warningForCustomHandlers: false,
    schema: {
      todos: omit(SCHEMA.todos, ['relationships'])
    }
  })
  client.emit = jest.fn()
  await link.onLogin()

  client.setData = jest.fn()
  fetchRemoteInstance.mockResolvedValue({ rows: [] })
}

async function clean() {
  await link.reset()
}

describe('CozyPouchLink', () => {
  beforeEach(() => {
    allDocs.mockReturnValue({ docs: [] })
    withoutDesignDocuments.mockReturnValue({ docs: [] })
    find.mockReturnValue({ docs: [] })
  })
  afterEach(clean)

  it('should generate replication url', async () => {
    await setup()
    const url = await link.getReplicationURL(TODO_DOCTYPE)
    expect(url).toBe('http://user:token@cozy.tools:8080/data/io.cozy.todos')
  })

  it('has name === "pouch"', async () => {
    await setup()
    expect(link.name).toBe('pouch')
  })

  it('handles a forceLink:"dataproxy" query (regression: Plan A drive capability)', async () => {
    await setup()
    link.pouches.getSyncStatus = jest.fn().mockReturnValue('synced')
    const forwardFn = jest.fn()
    await link.request(
      Q(TODO_DOCTYPE),
      { forceLink: 'dataproxy' },
      null,
      forwardFn
    )
    expect(forwardFn).not.toHaveBeenCalled()
  })

  it('forwards a forceLink:"stack" query', async () => {
    await setup()
    const forwardFn = jest.fn()
    await link.request(Q(TODO_DOCTYPE), { forceLink: 'stack' }, null, forwardFn)
    expect(forwardFn).toHaveBeenCalled()
  })

  it('forwards a legacy forceStack:true query', async () => {
    await setup()
    const forwardFn = jest.fn()
    await link.request(Q(TODO_DOCTYPE), { forceStack: true }, null, forwardFn)
    expect(forwardFn).toHaveBeenCalled()
  })

  describe('request handling', () => {
    const query1 = () => ({
      definition: () => Q(TODO_DOCTYPE).limitBy(100),
      options: {
        as: 'query1'
      }
    })
    const query2 = () => ({
      definition: () => Q(TODO_DOCTYPE).limitBy(100),
      options: {
        as: 'query2'
      }
    })

    it('should check if the doctype is supported and forward if not', async () => {
      await setup()
      const query = Q('io.cozy.rockets')
      await link.request(query, null, () => {
        expect(true).toBe(true)
        return Promise.resolve()
      })
    })

    it('should check if the pouch is synced and forward if not', async () => {
      await setup()
      const query = Q(TODO_DOCTYPE)
      expect.assertions(1)
      await link.request(query, null, null, () => {
        expect(true).toBe(true)
      })
    })

    it('should check if the pouch is synced and queries warmuped and forward if not', async () => {
      await setup({
        doctypesReplicationOptions: {
          TODO_DOCTYPE: { warmupQueries: [query1(), query2()] }
        }
      })
      const query = Q(TODO_DOCTYPE)
      expect.assertions(1)
      await link.request(query, null, null, () => {
        expect(true).toBe(true)
      })
    })

    it('should not forward if the pouch is synced and there is no warmup queries for this doctype', async () => {
      await setup({
        doctypesReplicationOptions: {
          'io.cozy.files': { warmupQueries: [query1(), query2()] }
        }
      })
      link.pouches.getSyncStatus = jest.fn().mockReturnValue('synced')

      const query = Q(TODO_DOCTYPE)
      expect.assertions(0)
      await link.request(query, null, () => {
        expect(true).toBe(true)
      })
    })

    test('supportsOperation returns false if the doctype is synched with a read only strategy and the operation is a mutation', async () => {
      const operationTODO = {
        doctype: TODO_DOCTYPE,
        mutationType: 'CREATE_DOCUMENT',
        document: { _type: 'io.cozy.todos' }
      }

      await setup({
        doctypesReplicationOptions: {
          'io.cozy.todos': { strategy: 'fromRemote' }
        }
      })

      expect(link.supportsOperation(operationTODO)).toBe(false)
    })

    test('supportsOperation returns true if the doctype is synched with a read only strategy and the operation is not a mutation', async () => {
      const operationTODO = {
        doctype: TODO_DOCTYPE
      }

      await setup({
        doctypesReplicationOptions: {
          'io.cozy.todos': { strategy: 'fromRemote' }
        }
      })

      expect(link.supportsOperation(operationTODO)).toBe(true)
    })

    test('supportsOperation with a synchronized doctype', async () => {
      const operationTODO = {
        doctype: TODO_DOCTYPE
      }

      await setup()
      expect(link.supportsOperation(operationTODO)).toBe(true)
    })

    it('should forward if the doctype is synched only for read access and the query is a mutation', async () => {
      await setup({
        doctypesReplicationOptions: {
          'io.cozy.todos': { strategy: 'fromRemote' }
        }
      })
      link.pouches.getSyncStatus = jest.fn().mockReturnValue('synced')
      await link.request(
        {
          doctype: TODO_DOCTYPE,
          mutationType: 'CREATE_DOCUMENT',
          document: { _type: 'io.cozy.todos' }
        },
        null,
        () => {
          expect(true).toBe(true)
        }
      )
    })

    it('should not forward if the doctype is synched only for read access and the query is not a mutation', async () => {
      await setup({
        doctypesReplicationOptions: {
          'io.cozy.todos': { strategy: 'fromRemote' }
        }
      })
      link.pouches.getSyncStatus = jest.fn().mockReturnValue('synced')
      const mock = jest.fn()
      await link.request(Q(TODO_DOCTYPE), null, mock)
      expect(mock).not.toHaveBeenCalled()
    })
  })

  describe('queries', () => {
    beforeEach(() => {
      allDocs.mockReturnValue({ docs: [TODO_1] })
      withoutDesignDocuments.mockReturnValue({ docs: [TODO_1] })
      find.mockReturnValue({ docs: [TODO_1] })
    })
    const docs = [TODO_1, TODO_2, TODO_3, TODO_4]
    it('should be able to execute a query', async () => {
      await setup()
      link.pouches.getSyncStatus = jest.fn().mockReturnValue('synced')
      const db = link.getPouch(TODO_DOCTYPE)
      db.post({
        label: 'Make PouchDB link work',
        done: false
      })
      const query = Q(TODO_DOCTYPE)
      const docs = await link.request(query)
      expect(docs.data.length).toBe(1)
    })

    it('should be possible to query only one doc', async () => {
      await setup()
      link.pouches.getSyncStatus = jest.fn().mockReturnValue('synced')
      const db = link.getPouch(TODO_DOCTYPE)
      db.post({
        _id: 'deadbeef',
        label: 'Make PouchDB link work',
        done: false
      })
      const query = Q(TODO_DOCTYPE).getById('deadbeef')
      const resp = await link.request(query)
      expect(resp.data.label).toBe('Make PouchDB link work')
    })

    it('should be possible to explicitly index fields', async () => {
      find.mockReturnValue({ docs: [TODO_3, TODO_4] })
      await setup()
      link.pouches.getSyncStatus = jest.fn().mockReturnValue('synced')
      const db = link.getPouch(TODO_DOCTYPE)
      await db.bulkDocs(docs.map(x => omit(x, '_type')))
      const query = Q(TODO_DOCTYPE)
        .where({ done: true, label: { $gt: null } })
        .indexFields(['label', 'done'])
      const resp = await link.request(query)
      expect(resp.data.length).toEqual(2)
      expect(resp.data[0]._id).toEqual(TODO_3._id)
      expect(resp.data[1]._id).toEqual(TODO_4._id)
    })

    it('should be possible to query multiple docs', async () => {
      withoutDesignDocuments.mockReturnValue({ docs: [TODO_1, TODO_3] })
      await setup()
      link.pouches.getSyncStatus = jest.fn().mockReturnValue('synced')
      const db = link.getPouch(TODO_DOCTYPE)
      await db.bulkDocs(docs.map(x => omit(x, '_type')))
      const ids = [TODO_1._id, TODO_3._id]
      const query = Q(TODO_DOCTYPE).getByIds(ids)
      const resp = await link.request(query)
      expect(resp.next).toBe(false)
      expect(resp.data.length).toEqual(2)
      expect(resp.data[0]._id).toEqual(TODO_1._id)
      expect(resp.data[1]._id).toEqual(TODO_3._id)
    })

    it('should be possible to select', async () => {
      find.mockReturnValue({ docs: [TODO_3, TODO_4] })
      await setup()
      link.pouches.getSyncStatus = jest.fn().mockReturnValue('synced')
      const db = link.getPouch(TODO_DOCTYPE)
      await db.bulkDocs(docs.map(x => omit(x, '_type')))
      const query = Q(TODO_DOCTYPE)
        .where({ label: { $gt: null }, done: true })
        .indexFields(['done', 'label'])
        .sortBy([{ done: 'asc' }, { label: 'asc' }])
      const res = await link.request(query)
      // expect(link.hasIndex('io.cozy.todos/by_done_and_id')).toBe(true)
      expect(res).toMatchObject({
        data: [
          {
            label: 'Build stuff',
            _type: TODO_DOCTYPE
          },
          {
            label: 'Run a semi-marathon',
            _type: TODO_DOCTYPE
          }
        ],
        meta: {
          count: 2
        },
        skip: 0,
        next: false
      })
    })

    it("should add _id in the selected fields since CozyClient' store needs it", async () => {
      find.mockReturnValue({ docs: [TODO_3, TODO_4] })
      await setup()
      link.pouches.getSyncStatus = jest.fn().mockReturnValue('synced')
      const db = link.getPouch(TODO_DOCTYPE)
      await db.bulkDocs(docs.map(x => omit(x, '_type')))
      const query = Q(TODO_DOCTYPE)
        .where({ label: { $gt: null }, done: true })
        .indexFields(['done', 'label'])
        .sortBy([{ done: 'asc' }, { label: 'asc' }])
        .select(['label', 'done'])
      const res = await link.request(query)
      expect(Object.keys(res.data[0])).toEqual(
        expect.arrayContaining(['label', 'done', '_id', '_rev'])
      )
    })
  })

  describe('mutations', () => {
    it('should be possible to save a new document', async () => {
      await setup()
      link.pouches.getSyncStatus = jest.fn().mockReturnValue('synced')
      const { _id, ...NEW_TODO } = TODO_3
      const mutation = client.getDocumentSavePlan(NEW_TODO)
      const res = await link.request(mutation)
      expect(link.executeMutation).toHaveBeenCalled()
      expect(res).toMatchObject({
        data: {
          id: expect.any(String),
          _id: expect.any(String),
          _rev: expect.any(String),
          label: 'Build stuff',
          _type: TODO_DOCTYPE
        }
      })
    })

    it('should be possible to save multiple documents', async () => {
      await setup()
      link.pouches.getSyncStatus = jest.fn().mockReturnValue('synced')
      const { _id, ...NEW_TODO } = TODO_3
      const res = await client.saveAll([TODO_3, TODO_4, NEW_TODO])
      expect(link.executeMutation).toHaveBeenCalled()
      expect(res).toMatchObject({
        data: [
          expect.objectContaining({
            label: 'Build stuff',
            _rev: expect.any(String)
          }),
          expect.objectContaining({
            label: 'Run a semi-marathon',
            _rev: expect.any(String)
          }),
          expect.objectContaining({
            label: 'Build stuff',
            _rev: expect.any(String)
          })
        ]
      })
    })

    it('should be possible to create multiple documents', async () => {
      await setup()
      link.pouches.getSyncStatus = jest.fn().mockReturnValue('synced')
      const docs = [
        {
          label: 'doc1',
          _type: 'io.cozy.todos'
        },
        { _type: 'io.cozy.todos', label: 'doc2' }
      ]
      const mutation = {
        mutationType: MutationTypes.CREATE_DOCUMENTS,
        documents: docs
      }
      const res = await link.request(mutation)

      expect(res).toMatchObject({
        data: [
          expect.objectContaining({
            label: 'doc1',
            _rev: expect.any(String),
            _id: expect.any(String)
          }),
          expect.objectContaining({
            label: 'doc2',
            _rev: expect.any(String),
            _id: expect.any(String)
          })
        ]
      })
    })

    it('should be possible to delete multiple documents', async () => {
      await setup()
      link.pouches.getSyncStatus = jest.fn().mockReturnValue('synced')
      const docs = [
        {
          _id: '1',
          _type: 'io.cozy.todos'
        },
        { _id: '2', _type: 'io.cozy.todos' }
      ]
      const mutation = {
        mutationType: MutationTypes.DELETE_DOCUMENTS,
        documents: docs
      }
      const res = await link.request(mutation)

      expect(res).toMatchObject({
        data: [
          expect.objectContaining({
            _deleted: true,
            _rev: expect.any(String),
            _id: '1'
          }),
          expect.objectContaining({
            _deleted: true,
            _rev: expect.any(String),
            _id: '2'
          })
        ]
      })
    })

    it('should throw with BulkEditError in case of partial success when saving multiple documents', async () => {
      await setup()
      link.dbMethod = method => {
        if (method !== 'bulkDocs') {
          throw new Error('Only bulkDocs is overrided in the test')
        }
        return [
          { error: 'conflict', id: TODO_3._id },
          { ok: true, id: TODO_4._id, rev: '2-gabedead' },
          { ok: true, id: '3', rev: '1-cffeebabe' }
        ]
      }
      link.pouches.getSyncStatus = jest.fn().mockReturnValue('synced')
      const { _id, ...NEW_TODO } = TODO_3
      let err
      try {
        await client.saveAll([TODO_3, TODO_4, NEW_TODO])
      } catch (e) {
        err = e
      }
      expect(link.executeMutation).toHaveBeenCalled()
      expect(err.message).toEqual('Error while bulk saving')
      const errors = err.getErrors()
      expect(errors.length).toBe(1)
      expect(errors[0].error).toEqual('conflict')
      expect(errors[0].doc._id).toEqual(TODO_3._id)
    })

    it('should be possible to update a document', async () => {
      await setup()
      link.pouches.getSyncStatus = jest.fn().mockReturnValue('synced')
      const { _id, ...NEW_TODO } = TODO_3
      const saveMutation = client.getDocumentSavePlan(NEW_TODO)
      const saved = (await link.request(saveMutation)).data
      const updateMutation = client.getDocumentSavePlan({
        ...saved,
        done: false
      })
      const updated = (await link.request(updateMutation)).data
      expect(updated).toMatchObject({
        label: 'Build stuff',
        done: false
      })
    })
  })

  describe('reset', () => {
    let spy

    afterEach(async () => {
      spy.mockRestore()
    })

    it('should delete all databases', async () => {
      await setup()
      spy = jest.spyOn(link.pouches, 'destroy').mockReturnValue(jest.fn())
      const pouches = link.pouches
      await link.reset()
      expect(pouches.destroy).toHaveBeenCalledTimes(1)
    })

    it('should delete client', async () => {
      await setup()
      spy = jest.spyOn(link.pouches, 'destroy').mockReturnValue(jest.fn())
      link.registerClient(jest.fn())
      expect(link.client).not.toBeNull()
      await link.reset()
      expect(link.client).toBeNull()
    })

    it('should forget the PouchManager instance', async () => {
      await setup()
      await link.reset()
      expect(link.pouches).toBeNull()
    })
  })

  describe('onSync', () => {
    it('should call setData with normalized data', async () => {
      await setup()
      link.handleOnSync({
        'io.cozy.todos': [{ ...TODO_1, rev: '1-deadbeef' }]
      })

      expect(client.setData).toHaveBeenCalledTimes(1)
      expect(client.setData).toHaveBeenCalledWith({
        'io.cozy.todos': [
          {
            _id: '1',
            _rev: '1-deadbeef',
            _type: 'io.cozy.todos',
            done: false,
            id: '1',
            label: 'Buy bread'
          }
        ]
      })
      expect(client.emit).toHaveBeenCalledWith('pouchlink:sync:end')
    })
  })
  describe('startReplication', () => {
    it('should emit the event', async () => {
      await setup()
      link.startReplication()

      expect(client.emit).toHaveBeenCalledWith('pouchlink:sync:start')
    })
  })
  describe('stopReplication', () => {
    it('should emit the event', async () => {
      await setup()
      link.stopReplication()

      expect(client.emit).toHaveBeenCalledWith('pouchlink:sync:stop')
    })
  })
  describe('onLogin', () => {
    let spy

    afterEach(() => {
      spy.mockRestore()
    })

    it('should start the replication loop if `options.initialSync` is true', async () => {
      spy = jest
        .spyOn(CozyPouchLink.prototype, 'startReplication')
        .mockReturnValue(jest.fn())

      await setup({ initialSync: true })

      expect(link.startReplication).toHaveBeenCalledTimes(1)
    })

    it('should not start the replication loop if `options.initialSync` is false', async () => {
      spy = jest
        .spyOn(CozyPouchLink.prototype, 'startReplication')
        .mockReturnValue(jest.fn())

      await setup({ initialSync: false })

      expect(link.startReplication).not.toHaveBeenCalled()
    })
  })

  describe('addDoctype', () => {
    const OTHER_DOCTYPE = 'io.cozy.files'

    it('should register a doctype only once, even though the link and pouch manager share the doctypes array', async () => {
      await setup()
      jest.spyOn(link.pouches, 'addDoctype').mockResolvedValue(undefined)
      // The link and its pouch manager hold the same array, so a single
      // registration must not land the doctype in it twice.
      expect(link.doctypes).toBe(link.pouches.doctypes)

      await link.addDoctype(OTHER_DOCTYPE, { strategy: 'fromRemote' })

      expect(link.doctypes.filter(d => d === OTHER_DOCTYPE)).toHaveLength(1)
      expect(
        link.pouches.doctypes.filter(d => d === OTHER_DOCTYPE)
      ).toHaveLength(1)
      expect(link.pouches.addDoctype).toHaveBeenCalledTimes(1)
    })

    it('should not re-register, restart replication, or overwrite options for a managed doctype', async () => {
      await setup()
      jest.spyOn(link.pouches, 'addDoctype').mockResolvedValue(undefined)
      jest
        .spyOn(link, 'startReplicationWithDebounce')
        .mockImplementation(() => {})

      await link.addDoctype(
        OTHER_DOCTYPE,
        { strategy: 'fromRemote' },
        { shouldStartReplication: true }
      )
      await link.addDoctype(
        OTHER_DOCTYPE,
        { strategy: 'sync' },
        { shouldStartReplication: true }
      )

      expect(link.doctypes.filter(d => d === OTHER_DOCTYPE)).toHaveLength(1)
      expect(
        link.pouches.doctypes.filter(d => d === OTHER_DOCTYPE)
      ).toHaveLength(1)
      expect(link.pouches.addDoctype).toHaveBeenCalledTimes(1)
      expect(link.startReplicationWithDebounce).toHaveBeenCalledTimes(1)
      // The no-op re-add keeps the original options instead of overwriting them.
      expect(link.doctypesReplicationOptions[OTHER_DOCTYPE]).toEqual({
        strategy: 'fromRemote'
      })
    })

    it('should register again a doctype that was previously removed', async () => {
      await setup()
      const addSpy = jest.spyOn(link.pouches, 'addDoctype')

      await link.addDoctype(OTHER_DOCTYPE, { strategy: 'fromRemote' })
      await link.removeDoctype(OTHER_DOCTYPE)
      await link.addDoctype(OTHER_DOCTYPE, { strategy: 'fromRemote' })

      expect(link.doctypes.filter(d => d === OTHER_DOCTYPE)).toHaveLength(1)
      expect(
        link.pouches.doctypes.filter(d => d === OTHER_DOCTYPE)
      ).toHaveLength(1)
      // The pouch is recreated on the second registration.
      expect(addSpy).toHaveBeenCalledTimes(2)
    })
  })

  describe('immediate sync', () => {
    it('should not throw if pouches not there', async () => {
      await setup()
      link.pouches = null
      expect(() => {
        link.syncImmediately()
      }).not.toThrow()
    })
    it('should call syncImmediately on pouch manager', async () => {
      await setup()
      link.pouches.syncImmediately = jest.fn().mockImplementation(() => {})
      await link.syncImmediately()
      expect(link.pouches.syncImmediately).toHaveBeenCalled()
    })
  })

  describe('login', () => {
    it('should throw if the stack client uri is not initialized', () => {
      const clientWithoutUri = {
        stackClient: {
          token: {
            toBasicAuth: () => 'user:token@'
          },
          on: jest.fn()
        }
      }

      const link = new CozyPouchLink({ doctypes: [TODO_DOCTYPE] })
      const client = new CozyClient({
        ...clientWithoutUri,
        links: [link],
        warningForCustomHandlers: false,
        schema: {
          todos: omit(SCHEMA.todos, ['relationships'])
        }
      })

      link.registerClient(client)

      expect(link.onLogin()).rejects.toThrow()
    })
  })

  describe('driveId support', () => {
    it('maps a driveId option to its registered drive doctype', () => {
      const driveLink = new CozyPouchLink({
        doctypes: ['io.cozy.files', 'io.cozy.files.shareddrives-abc'],
        doctypesReplicationOptions: {
          'io.cozy.files.shareddrives-abc': { driveId: 'abc' }
        }
      })
      expect(driveLink.getDbDoctype('io.cozy.files', { driveId: 'abc' })).toBe(
        'io.cozy.files.shareddrives-abc'
      )
      expect(driveLink.getDbDoctype('io.cozy.files', {})).toBe('io.cozy.files')
      expect(driveLink.getDbDoctype('io.cozy.files', { driveId: 'nope' })).toBe(
        'io.cozy.files'
      )
    })

    it('reads the drive database but types docs as io.cozy.files', async () => {
      const FILES_DOCTYPE = 'io.cozy.files'
      const DRIVE_DOCTYPE = 'io.cozy.files.shareddrives-abc'

      const driveLink = new CozyPouchLink({
        doctypes: [FILES_DOCTYPE, DRIVE_DOCTYPE],
        doctypesReplicationOptions: {
          [DRIVE_DOCTYPE]: { driveId: 'abc' }
        }
      })
      const driveClient = new CozyClient({
        ...mockClient,
        links: [driveLink],
        warningForCustomHandlers: false,
        schema: {}
      })
      driveClient.emit = jest.fn()
      await driveLink.onLogin()
      driveClient.setData = jest.fn()

      await driveLink.getPouch(FILES_DOCTYPE).put({ _id: 'own1' })
      await driveLink.getPouch(DRIVE_DOCTYPE).put({ _id: 'drive1' })

      driveLink.pouches.getSyncStatus = jest.fn().mockReturnValue('synced')

      const res = await driveLink.request(Q(FILES_DOCTYPE).getById('drive1'), {
        driveId: 'abc'
      })
      expect(res.data._id).toBe('drive1')
      expect(res.data._type).toBe(FILES_DOCTYPE)

      await driveLink.reset()
    })

    it('reads the drive database through the find path and types docs as io.cozy.files', async () => {
      const FILES_DOCTYPE = 'io.cozy.files'
      const DRIVE_DOCTYPE = 'io.cozy.files.shareddrives-abc'

      const driveLink = new CozyPouchLink({
        doctypes: [FILES_DOCTYPE, DRIVE_DOCTYPE],
        doctypesReplicationOptions: {
          [DRIVE_DOCTYPE]: { driveId: 'abc' }
        }
      })
      const driveClient = new CozyClient({
        ...mockClient,
        links: [driveLink],
        warningForCustomHandlers: false,
        schema: {}
      })
      driveClient.emit = jest.fn()
      await driveLink.onLogin()
      driveClient.setData = jest.fn()

      await driveLink
        .getPouch(FILES_DOCTYPE)
        .put({ _id: 'own1', updated_at: '2024-01-01' })
      await driveLink
        .getPouch(DRIVE_DOCTYPE)
        .put({ _id: 'drive1', updated_at: '2024-06-01' })

      driveLink.pouches.getSyncStatus = jest.fn().mockReturnValue('synced')

      const res = await driveLink.request(
        Q(FILES_DOCTYPE)
          .where({ updated_at: { $gt: null } })
          .indexFields(['updated_at']),
        { driveId: 'abc' }
      )

      expect(res.data.some(d => d._id === 'drive1')).toBe(true)
      expect(res.data.some(d => d._id === 'own1')).toBe(false)
      expect(res.data.every(d => d._type === FILES_DOCTYPE)).toBe(true)

      await driveLink.reset()
    })

    it('supportsOperation is true for io.cozy.files with driveId when drive doctype is managed', async () => {
      const FILES_DOCTYPE = 'io.cozy.files'
      const DRIVE_DOCTYPE = 'io.cozy.files.shareddrives-abc'

      const driveLink = new CozyPouchLink({
        doctypes: [FILES_DOCTYPE, DRIVE_DOCTYPE],
        doctypesReplicationOptions: {
          [DRIVE_DOCTYPE]: { driveId: 'abc' }
        }
      })
      const driveClient = new CozyClient({
        ...mockClient,
        links: [driveLink],
        warningForCustomHandlers: false,
        schema: {}
      })
      driveClient.emit = jest.fn()
      await driveLink.onLogin()

      expect(driveLink.supportsOperation({ doctype: FILES_DOCTYPE })).toBe(true)

      await driveLink.reset()
    })

    it('request uses drive doctype sync state, not io.cozy.files sync state', async () => {
      const FILES_DOCTYPE = 'io.cozy.files'
      const DRIVE_DOCTYPE = 'io.cozy.files.shareddrives-abc'

      const driveLink = new CozyPouchLink({
        doctypes: [FILES_DOCTYPE, DRIVE_DOCTYPE],
        doctypesReplicationOptions: {
          [DRIVE_DOCTYPE]: { driveId: 'abc' }
        }
      })
      const driveClient = new CozyClient({
        ...mockClient,
        links: [driveLink],
        warningForCustomHandlers: false,
        schema: {}
      })
      driveClient.emit = jest.fn()
      await driveLink.onLogin()

      await driveLink.getPouch(DRIVE_DOCTYPE).put({ _id: 'drive1' })

      // Drive doctype synced, io.cozy.files not synced: drive query must be handled locally
      driveLink.pouches.getSyncStatus = jest.fn(doctype => {
        if (doctype === DRIVE_DOCTYPE) return 'synced'
        return 'not_synced'
      })

      const forwardSpy = jest.fn()
      const res = await driveLink.request(
        Q(FILES_DOCTYPE).getById('drive1'),
        { driveId: 'abc' },
        null,
        forwardSpy
      )
      expect(forwardSpy).not.toHaveBeenCalled()
      expect(res.data._id).toBe('drive1')

      // Inverse: drive doctype not synced, io.cozy.files synced: drive query must be forwarded
      driveLink.pouches.getSyncStatus = jest.fn(doctype => {
        if (doctype === DRIVE_DOCTYPE) return 'not_synced'
        return 'synced'
      })

      const forwardSpy2 = jest.fn().mockResolvedValue({ data: null })
      await driveLink.request(
        Q(FILES_DOCTYPE).getById('drive1'),
        { driveId: 'abc' },
        null,
        forwardSpy2
      )
      expect(forwardSpy2).toHaveBeenCalled()

      await driveLink.reset()
    })
  })

  describe('deleteDocument', () => {
    it('should add _rev and _deleted prop to a deleted document', async () => {
      await setup()
      const document = { id: 'docId', rev: '123', ok: true }
      link.dbMethod = jest.fn().mockReturnValue(document)
      const res = await link.deleteDocument({ document })

      expect(res).toMatchObject({
        id: 'docId',
        _id: 'docId',
        rev: '123',
        _rev: '123',
        _deleted: true
      })
    })
  })
})
