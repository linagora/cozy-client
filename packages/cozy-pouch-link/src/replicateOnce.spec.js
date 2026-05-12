/* global jest */

jest.mock('./remote', () => ({
  fetchRemoteLastSequence: jest.fn().mockResolvedValue('0'),
  isDatabaseNotFoundError: jest.fn().mockReturnValue(false),
  isDatabaseUnradableError: jest.fn().mockReturnValue(false)
}))

jest.mock('./startReplication', () => ({
  startReplication: jest.fn()
}))

import { replicateOnce } from './replicateOnce'
import { startReplication } from './startReplication'

describe('replicateOnce', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call onSync with clean doctype keys, not prefixed pouch dbNames', async () => {
    const dbName = 'instance__doctype__io.cozy.todos'
    const docs = [{ _id: 'doc-1', name: 'a' }]

    startReplication.mockResolvedValue(docs)

    const pouchManager = {
      pouches: { [dbName]: { id: 'fake-pouch' } },
      replications: {},
      doctypesReplicationOptions: {},
      options: {
        onSync: jest.fn()
      },
      storage: {
        persistDoctypeLastSequence: jest.fn().mockResolvedValue(),
        getDoctypeLastSequence: jest.fn().mockResolvedValue(''),
        destroyDoctypeLastSequence: jest.fn().mockResolvedValue()
      },
      client: {},
      isOnline: jest.fn().mockResolvedValue(true),
      getReplicationURL: jest.fn().mockReturnValue('http://example/db'),
      getSyncStatus: jest.fn().mockReturnValue('synced'),
      updateSyncInfo: jest.fn().mockResolvedValue(),
      checkToWarmupDoctype: jest.fn(),
      handleReplicationError: jest.fn(),
      cancelCurrentReplications: jest.fn()
    }

    await replicateOnce(pouchManager)

    expect(pouchManager.options.onSync).toHaveBeenCalledTimes(1)
    const payload = pouchManager.options.onSync.mock.calls[0][0]

    // The bug: payload was keyed by the full prefixed dbName
    // The fix: payload must be keyed by the clean doctype
    expect(Object.keys(payload)).toEqual(['io.cozy.todos'])
    expect(Object.keys(payload)).not.toContain(dbName)
    expect(payload['io.cozy.todos']).toEqual(docs)
  })

  it('should preserve clean doctype keys for multiple pouches', async () => {
    const dbNameA = 'instance__doctype__io.cozy.todos'
    const dbNameB = 'instance__doctype__io.cozy.files'
    const docsA = [{ _id: 'a1' }]
    const docsB = [{ _id: 'b1' }]

    startReplication.mockImplementation(pouch => {
      if (pouch === 'pouchA') return Promise.resolve(docsA)
      if (pouch === 'pouchB') return Promise.resolve(docsB)
      return Promise.resolve([])
    })

    const pouchManager = {
      pouches: { [dbNameA]: 'pouchA', [dbNameB]: 'pouchB' },
      replications: {},
      doctypesReplicationOptions: {},
      options: { onSync: jest.fn() },
      storage: {
        persistDoctypeLastSequence: jest.fn().mockResolvedValue(),
        getDoctypeLastSequence: jest.fn().mockResolvedValue(''),
        destroyDoctypeLastSequence: jest.fn().mockResolvedValue()
      },
      client: {},
      isOnline: jest.fn().mockResolvedValue(true),
      getReplicationURL: jest.fn().mockReturnValue('http://example/db'),
      getSyncStatus: jest.fn().mockReturnValue('synced'),
      updateSyncInfo: jest.fn().mockResolvedValue(),
      checkToWarmupDoctype: jest.fn(),
      handleReplicationError: jest.fn(),
      cancelCurrentReplications: jest.fn()
    }

    await replicateOnce(pouchManager)

    expect(pouchManager.options.onSync).toHaveBeenCalledTimes(1)
    const payload = pouchManager.options.onSync.mock.calls[0][0]
    expect(Object.keys(payload).sort()).toEqual([
      'io.cozy.files',
      'io.cozy.todos'
    ])
    expect(payload['io.cozy.todos']).toEqual(docsA)
    expect(payload['io.cozy.files']).toEqual(docsB)
  })
})
