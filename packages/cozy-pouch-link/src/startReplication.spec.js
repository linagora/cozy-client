import MicroEE from 'microee'

import helpers from './helpers'
import { fetchRemoteLastSequence, fetchRemoteInstance } from './remote'
import {
  replicateAllDocs,
  startReplication,
  sharedDriveReplicateAllDocs
} from './startReplication'

jest.mock('./remote', () => ({
  fetchRemoteLastSequence: jest.fn(),
  fetchRemoteInstance: jest.fn()
}))

jest.mock('./helpers', () => ({
  ...jest.requireActual('./helpers').default,
  insertBulkDocs: jest.fn()
}))

const { insertBulkDocs } = helpers

const url = 'http://test.local'

const generateDocs = nDocs => {
  let docs = []
  for (let i = 0; i < nDocs; i++) {
    docs.push({ doc: { _id: i.toString() } })
  }
  return docs
}

const storage = {
  getLastReplicatedDocID: jest.fn(),
  persistLastReplicatedDocID: jest.fn()
}

function ReplicationOnMock() {}
MicroEE.mixin(ReplicationOnMock)
const mockReplicationOn = new ReplicationOnMock()
mockReplicationOn.cancel = () => {
  mockReplicationOn.emit('complete')
}

describe('startReplication', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    fetchRemoteLastSequence.mockResolvedValue('10-xyz')
  })

  describe('replication through _all_docs', () => {
    it('should replicate all docs', async () => {
      storage.getLastReplicatedDocID.mockReturnValue(null)
      const dummyDocs = generateDocs(2)
      fetchRemoteInstance.mockResolvedValue({ rows: dummyDocs })

      const rep = await replicateAllDocs({
        db: null,
        baseUrl: url,
        doctype: undefined,
        storage
      })
      const expectedDocs = dummyDocs.map(doc => doc.doc)
      expect(rep).toEqual(expectedDocs)
      expect(fetchRemoteInstance).toHaveBeenCalledTimes(1)
      expect(insertBulkDocs).toHaveBeenCalledTimes(1)
    })

    it('should replicate all docs when it gets more docs than the batch limit', async () => {
      storage.getLastReplicatedDocID.mockReturnValue(null)
      const dummyDocs = generateDocs(1002)
      fetchRemoteInstance.mockResolvedValueOnce({
        rows: dummyDocs.slice(0, 1001)
      })
      fetchRemoteInstance.mockResolvedValueOnce({
        rows: dummyDocs.slice(1000, 1002)
      })

      const rep = await replicateAllDocs({
        db: null,
        baseUrl: url,
        doctype: undefined,
        storage
      })
      const expectedDocs = dummyDocs.map(doc => doc.doc)
      expect(rep).toEqual(expectedDocs)
      expect(fetchRemoteInstance).toHaveBeenCalledTimes(2)
      expect(insertBulkDocs).toHaveBeenCalledTimes(2)
    })

    it('should replicate from the last saved doc id', async () => {
      storage.getLastReplicatedDocID.mockReturnValue('5')
      const dummyDocs = generateDocs(10)
      fetchRemoteInstance.mockResolvedValue({ rows: dummyDocs.slice(5, 11) })

      const rep = await replicateAllDocs({
        db: null,
        baseUrl: url,
        doctype: undefined,
        storage
      })

      const calledUrl = new URL(`${url}/_all_docs`)
      expect(fetchRemoteInstance).toHaveBeenCalledWith(calledUrl, {
        include_docs: true,
        limit: 1000,
        startkey_docid: '5'
      })
      expect(fetchRemoteInstance).toHaveBeenCalledTimes(1)
      expect(insertBulkDocs).toHaveBeenCalledTimes(1)
      const expectedDocs = dummyDocs.map(doc => doc.doc).slice(6, 11)
      expect(rep).toEqual(expectedDocs)
    })
  })

  describe('startReplication', () => {
    it('should call replicateAllDocs on initial replication', async () => {
      const replicationOptions = getReplicationOptionsMock()
      replicationOptions.initialReplication = true

      const getReplicationURL = () =>
        'https://user:SOME_TOKEN@claude.mycozy.cloud/data/io.cozy.files'

      const dummyDocs = generateDocs(2)
      fetchRemoteInstance.mockResolvedValue({ rows: dummyDocs })

      const pouch = getPouchMock()

      await startReplication(
        pouch,
        replicationOptions,
        getReplicationURL,
        storage,
        null
      )

      expect(fetchRemoteInstance).toHaveBeenCalledWith(
        new URL(
          'https://user:SOME_TOKEN@claude.mycozy.cloud/data/io.cozy.files/_all_docs'
        ),
        { include_docs: true, limit: 1000 }
      )
      expect(pouch.replicate.from).not.toHaveBeenCalled()
      expect(pouch.replicate.to).not.toHaveBeenCalled()
      expect(pouch.sync).not.toHaveBeenCalled()
    })

    it('should call Pouch replication on non-initial replications', async () => {
      const replicationOptions = getReplicationOptionsMock()
      replicationOptions.initialReplication = false

      const getReplicationURL = () =>
        'https://user:SOME_TOKEN@claude.mycozy.cloud/data/io.cozy.files'

      const pouch = getPouchMock()

      const promise = startReplication(
        pouch,
        replicationOptions,
        getReplicationURL,
        storage,
        null
      )
      mockReplicationOn.emit('complete')
      await promise

      expect(fetchRemoteInstance).not.toHaveBeenCalled()
      expect(pouch.replicate.to).not.toHaveBeenCalled()
      expect(pouch.sync).not.toHaveBeenCalled()
      expect(pouch.replicate.from).toHaveBeenCalledWith(
        'https://user:SOME_TOKEN@claude.mycozy.cloud/data/io.cozy.files',
        { batch_size: 1000, selector: { cozyLocalOnly: { $exists: false } } }
      )
    })

    it(`should call Pouch replication on initial replications AND strategy is 'toRemote'`, async () => {
      const replicationOptions = getReplicationOptionsMock()
      replicationOptions.initialReplication = true
      replicationOptions.strategy = 'toRemote'

      const getReplicationURL = () =>
        'https://user:SOME_TOKEN@claude.mycozy.cloud/data/io.cozy.files'

      const pouch = getPouchMock()

      const promise = startReplication(
        pouch,
        replicationOptions,
        getReplicationURL,
        storage,
        null
      )
      mockReplicationOn.emit('complete')
      await promise

      expect(fetchRemoteInstance).not.toHaveBeenCalled()
      expect(pouch.replicate.from).not.toHaveBeenCalled()
      expect(pouch.sync).not.toHaveBeenCalled()
      expect(pouch.replicate.to).toHaveBeenCalledWith(
        'https://user:SOME_TOKEN@claude.mycozy.cloud/data/io.cozy.files',
        { batch_size: 1000, selector: { cozyLocalOnly: { $exists: false } } }
      )
    })

    it(`should handle error result when Pouch replication`, async () => {
      const replicationOptions = getReplicationOptionsMock()
      replicationOptions.initialReplication = false

      const getReplicationURL = () =>
        'https://user:SOME_TOKEN@claude.mycozy.cloud/data/io.cozy.files'

      const pouch = getPouchMock()

      const promise = startReplication(
        pouch,
        replicationOptions,
        getReplicationURL,
        storage,
        null
      )
      mockReplicationOn.emit('error', 'some_error_message')
      await expect(promise).rejects.toEqual('some_error_message')
    })

    it(`should handle change event with Sync format and Replication format when Pouch replication`, async () => {
      const replicationOptions = getReplicationOptionsMock()
      replicationOptions.initialReplication = false

      const getReplicationURL = () =>
        'https://user:SOME_TOKEN@claude.mycozy.cloud/data/io.cozy.files'

      const pouch = getPouchMock()

      const promise = startReplication(
        pouch,
        replicationOptions,
        getReplicationURL,
        storage,
        null
      )
      // Sync format
      mockReplicationOn.emit('change', {
        change: {
          docs: [
            {
              _id: 'SOME_DOCUMENT_ID_1',
              some_property: 'some_value'
            }
          ]
        }
      })
      // Replicaiton format
      mockReplicationOn.emit('change', {
        docs: [
          {
            _id: 'SOME_DOCUMENT_ID_2',
            some_property: 'some_value'
          }
        ]
      })
      mockReplicationOn.emit('complete')
      const result = await promise

      expect(result).toStrictEqual([
        {
          _id: 'SOME_DOCUMENT_ID_1',
          some_property: 'some_value'
        },
        {
          _id: 'SOME_DOCUMENT_ID_2',
          some_property: 'some_value'
        }
      ])
    })

    it(`should filter design document from change event when Pouch replication`, async () => {
      const replicationOptions = getReplicationOptionsMock()
      replicationOptions.initialReplication = false

      const getReplicationURL = () =>
        'https://user:SOME_TOKEN@claude.mycozy.cloud/data/io.cozy.files'

      const pouch = getPouchMock()

      const promise = startReplication(
        pouch,
        replicationOptions,
        getReplicationURL,
        storage,
        null
      )
      mockReplicationOn.emit('change', {
        change: {
          docs: [
            {
              _id: 'SOME_DOCUMENT_ID_1',
              some_property: 'some_value'
            },
            {
              _id: '_design_SOME_DOCUMENT_ID_2',
              some_property: 'some_value'
            }
          ]
        }
      })
      mockReplicationOn.emit('complete')
      const result = await promise

      expect(result).toStrictEqual([
        {
          _id: 'SOME_DOCUMENT_ID_1',
          some_property: 'some_value'
        }
      ])
    })

    it(`should filter deleted document from change event when Pouch replication`, async () => {
      const replicationOptions = getReplicationOptionsMock()
      replicationOptions.initialReplication = false

      const getReplicationURL = () =>
        'https://user:SOME_TOKEN@claude.mycozy.cloud/data/io.cozy.files'

      const pouch = getPouchMock()

      const promise = startReplication(
        pouch,
        replicationOptions,
        getReplicationURL,
        storage,
        null
      )
      mockReplicationOn.emit('change', {
        change: {
          docs: [
            {
              _id: 'SOME_DOCUMENT_ID_1',
              some_property: 'some_value'
            },
            {
              _id: 'SOME_DOCUMENT_ID_2',
              some_property: 'some_value',
              _deleted: true
            }
          ]
        }
      })
      mockReplicationOn.emit('complete')
      const result = await promise

      expect(result).toStrictEqual([
        {
          _id: 'SOME_DOCUMENT_ID_1',
          some_property: 'some_value'
        }
      ])
    })

    it(`should allow to cancel promise when Pouch replication`, async () => {
      const replicationOptions = getReplicationOptionsMock()
      replicationOptions.initialReplication = false

      const getReplicationURL = () =>
        'https://user:SOME_TOKEN@claude.mycozy.cloud/data/io.cozy.files'

      const pouch = getPouchMock()

      const promise = startReplication(
        pouch,
        replicationOptions,
        getReplicationURL,
        storage,
        null
      )

      expect(promise.cancel).toBeDefined()

      promise.cancel()

      // this change should be ignored
      mockReplicationOn.emit('change', {
        change: {
          docs: [
            {
              _id: 'SOME_DOCUMENT_ID_1',
              some_property: 'some_value'
            },
            {
              _id: 'SOME_DOCUMENT_ID_2',
              some_property: 'some_value',
              _deleted: true
            }
          ]
        }
      })

      const result = await promise

      expect(result).toStrictEqual([])
    })
  })

  describe('sharedDriveReplicateAllDocs', () => {
    const driveId = 'test-drive-123'
    const doctype = 'io.cozy.files'

    const mockClient = {
      collection: jest.fn()
    }

    const mockCollection = {
      fetchChanges: jest.fn()
    }

    const mockPouch = {
      get: jest.fn(),
      remove: jest.fn(),
      bulkGet: jest.fn(),
      bulkDocs: jest.fn()
    }

    const mockStorage = {
      getLastReplicatedDocID: jest.fn(),
      persistLastReplicatedDocID: jest.fn(),
      getDoctypeLastSequence: jest.fn(),
      persistDoctypeLastSequence: jest.fn()
    }

    beforeEach(() => {
      jest.resetAllMocks()
      mockClient.collection.mockReturnValue(mockCollection)
      insertBulkDocs.mockResolvedValue()
    })

    it('should throw error when driveId is not provided', async () => {
      await expect(
        sharedDriveReplicateAllDocs({
          pouch: mockPouch,
          storage: mockStorage,
          doctype,
          client: mockClient,
          initialReplication: false
        })
      ).rejects.toThrow('sharedDriveReplicateAllDocs: driveId is required')
    })

    it('should handle initial replication with empty results', async () => {
      mockStorage.getDoctypeLastSequence.mockResolvedValue(null)
      mockCollection.fetchChanges.mockResolvedValue({
        newLastSeq: 'seq-1',
        results: [],
        pending: false
      })

      const result = await sharedDriveReplicateAllDocs({
        driveId,
        pouch: mockPouch,
        storage: mockStorage,
        doctype,
        client: mockClient,
        initialReplication: true
      })

      expect(result).toEqual([])
      expect(mockCollection.fetchChanges).toHaveBeenCalledWith(
        { include_docs: true },
        {
          includeFilePath: false,
          skipDeleted: true,
          skipTrashed: true,
          limit: 1000
        }
      )
      expect(insertBulkDocs).toHaveBeenCalledWith(mockPouch, [])
      expect(mockStorage.persistDoctypeLastSequence).toHaveBeenCalledWith(
        doctype,
        'seq-1'
      )
    })

    it('should handle initial replication with single batch of documents', async () => {
      mockStorage.getDoctypeLastSequence.mockResolvedValue(null)
      const mockDocs = [
        { doc: { _id: 'doc-1', name: 'file1.txt' } },
        { doc: { _id: 'doc-2', name: 'file2.txt' } }
      ]
      mockCollection.fetchChanges.mockResolvedValue({
        newLastSeq: 'seq-2',
        results: mockDocs,
        pending: false
      })

      const result = await sharedDriveReplicateAllDocs({
        driveId,
        pouch: mockPouch,
        storage: mockStorage,
        doctype,
        client: mockClient,
        initialReplication: true
      })

      const expectedDocs = [
        { _id: 'doc-1', name: 'file1.txt', driveId },
        { _id: 'doc-2', name: 'file2.txt', driveId }
      ]

      expect(result).toEqual(expectedDocs)
      expect(mockCollection.fetchChanges).toHaveBeenCalledWith(
        { include_docs: true },
        {
          includeFilePath: false,
          skipDeleted: true,
          skipTrashed: true,
          limit: 1000
        }
      )
      expect(insertBulkDocs).toHaveBeenCalledWith(mockPouch, expectedDocs)
      expect(mockStorage.persistDoctypeLastSequence).toHaveBeenCalledWith(
        doctype,
        'seq-2'
      )
    })

    it('should handle incremental replication from last saved doc ID', async () => {
      mockStorage.getDoctypeLastSequence.mockResolvedValue('seq-1')
      const mockDocs = [{ doc: { _id: 'doc-3', name: 'file3.txt' } }]
      mockCollection.fetchChanges.mockResolvedValue({
        newLastSeq: 'seq-3',
        results: mockDocs,
        pending: false
      })

      const result = await sharedDriveReplicateAllDocs({
        driveId,
        pouch: mockPouch,
        storage: mockStorage,
        doctype,
        client: mockClient,
        initialReplication: false
      })

      const expectedDocs = [{ _id: 'doc-3', name: 'file3.txt', driveId }]

      expect(result).toEqual(expectedDocs)
      expect(mockCollection.fetchChanges).toHaveBeenCalledWith(
        { include_docs: true, since: 'seq-1' },
        {
          includeFilePath: false,
          skipDeleted: false,
          skipTrashed: false,
          limit: 1000
        }
      )
      expect(insertBulkDocs).toHaveBeenCalledWith(mockPouch, expectedDocs)
      expect(mockStorage.persistDoctypeLastSequence).toHaveBeenCalledWith(
        doctype,
        'seq-3'
      )
    })

    it('should handle replication with multiple batches (pagination)', async () => {
      mockStorage.getDoctypeLastSequence.mockResolvedValue(null)

      // First batch
      mockCollection.fetchChanges.mockResolvedValueOnce({
        newLastSeq: 'seq-1',
        results: [{ doc: { _id: 'doc-1', name: 'file1.txt' } }],
        pending: true
      })

      // Second batch
      mockCollection.fetchChanges.mockResolvedValueOnce({
        newLastSeq: 'seq-2',
        results: [{ doc: { _id: 'doc-2', name: 'file2.txt' } }],
        pending: false
      })

      const result = await sharedDriveReplicateAllDocs({
        driveId,
        pouch: mockPouch,
        storage: mockStorage,
        doctype,
        client: mockClient,
        initialReplication: true
      })

      const expectedDocs = [
        { _id: 'doc-1', name: 'file1.txt', driveId },
        { _id: 'doc-2', name: 'file2.txt', driveId }
      ]

      expect(result).toEqual(expectedDocs)
      expect(mockCollection.fetchChanges).toHaveBeenCalledTimes(2)
      expect(insertBulkDocs).toHaveBeenCalledTimes(2)
      expect(mockStorage.persistDoctypeLastSequence).toHaveBeenCalledTimes(2)
    })

    it('should handle deleted documents by removing them from local pouch', async () => {
      mockStorage.getDoctypeLastSequence.mockResolvedValue(null)
      const mockDocs = [
        { doc: { _id: 'doc-1', name: 'file1.txt' } },
        { doc: { _id: 'doc-2', name: 'file2.txt', _deleted: true } }
      ]
      mockCollection.fetchChanges.mockResolvedValue({
        newLastSeq: 'seq-1',
        results: mockDocs,
        pending: false
      })

      // Mock that doc-2 exists in local pouch
      mockPouch.bulkGet.mockResolvedValue({
        results: [
          {
            docs: [
              {
                ok: { _id: 'doc-2', _rev: '1-abc', name: 'file2.txt' }
              }
            ]
          }
        ]
      })
      mockPouch.bulkDocs.mockResolvedValue([{ ok: true, id: 'doc-2' }])

      const result = await sharedDriveReplicateAllDocs({
        driveId,
        pouch: mockPouch,
        storage: mockStorage,
        doctype,
        client: mockClient,
        initialReplication: true
      })

      const expectedDocs = [
        { _id: 'doc-1', name: 'file1.txt', driveId },
        { _id: 'doc-2', name: 'file2.txt', _deleted: true, driveId }
      ]

      expect(result).toEqual(expectedDocs)
      expect(mockPouch.bulkGet).toHaveBeenCalledWith({
        docs: [{ id: 'doc-2' }]
      })
      expect(mockPouch.bulkDocs).toHaveBeenCalledWith([
        {
          _id: 'doc-2',
          _rev: '1-abc',
          name: 'file2.txt',
          _deleted: true
        }
      ])
      expect(insertBulkDocs).toHaveBeenCalledWith(
        mockPouch,
        expectedDocs.filter(doc => !doc._deleted)
      )
    })

    it('should handle deleted documents when they do not exist in local pouch', async () => {
      mockStorage.getDoctypeLastSequence.mockResolvedValue(null)
      const mockDocs = [{ doc: { _id: 'doc-1', _deleted: true } }]
      mockCollection.fetchChanges.mockResolvedValue({
        newLastSeq: 'seq-1',
        results: mockDocs,
        pending: false
      })

      // Mock that doc-1 does not exist in local pouch (bulkGet returns error)
      mockPouch.bulkGet.mockResolvedValue({
        results: [
          {
            docs: [
              {
                error: {
                  status: 404,
                  name: 'not_found',
                  message: 'missing'
                }
              }
            ]
          }
        ]
      })
      mockPouch.bulkDocs.mockResolvedValue([])

      const result = await sharedDriveReplicateAllDocs({
        driveId,
        pouch: mockPouch,
        storage: mockStorage,
        doctype,
        client: mockClient,
        initialReplication: true
      })

      const expectedDocs = [{ _id: 'doc-1', _deleted: true, driveId }]

      expect(result).toEqual(expectedDocs)
      expect(mockPouch.bulkGet).toHaveBeenCalledWith({
        docs: [{ id: 'doc-1' }]
      })
      expect(mockPouch.bulkDocs).not.toHaveBeenCalled()
      expect(insertBulkDocs).toHaveBeenCalledWith(
        mockPouch,
        expectedDocs.filter(doc => !doc._deleted)
      )
    })

    it('should use correct options for initial vs incremental replication', async () => {
      mockStorage.getDoctypeLastSequence.mockResolvedValue('seq-1')
      mockCollection.fetchChanges.mockResolvedValue({
        newLastSeq: 'seq-2',
        results: [],
        pending: false
      })

      // Test initial replication
      await sharedDriveReplicateAllDocs({
        driveId,
        pouch: mockPouch,
        storage: mockStorage,
        doctype,
        client: mockClient,
        initialReplication: true
      })

      expect(mockCollection.fetchChanges).toHaveBeenCalledWith(
        { include_docs: true, since: 'seq-1' },
        {
          includeFilePath: false,
          skipDeleted: true,
          skipTrashed: true,
          limit: 1000
        }
      )

      jest.clearAllMocks()
      mockStorage.getDoctypeLastSequence.mockResolvedValue('seq-1')
      mockCollection.fetchChanges.mockResolvedValue({
        newLastSeq: 'seq-3',
        results: [],
        pending: false
      })

      // Test incremental replication
      await sharedDriveReplicateAllDocs({
        driveId,
        pouch: mockPouch,
        storage: mockStorage,
        doctype,
        client: mockClient,
        initialReplication: false
      })

      expect(mockCollection.fetchChanges).toHaveBeenCalledWith(
        { include_docs: true, since: 'seq-1' },
        {
          includeFilePath: false,
          skipDeleted: false,
          skipTrashed: false,
          limit: 1000
        }
      )
    })
  })
})

const getPouchMock = () => {
  const pouch = {
    replicate: {
      from: jest.fn(),
      to: jest.fn()
    },
    sync: jest.fn()
  }
  pouch.replicate.from.mockReturnValue(mockReplicationOn)
  pouch.replicate.to.mockReturnValue(mockReplicationOn)
  pouch.sync.mockReturnValue(mockReplicationOn)

  return pouch
}

const getReplicationOptionsMock = () => ({
  strategy: 'fromRemote',
  initialReplication: false,
  warmupQueries: [],
  doctype: 'io.cozy.files'
})
