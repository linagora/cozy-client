/* global jest */

// TODO use jest.useFakeTimers() to speed up the tests
// See https://github.com/cozy/cozy-client/pull/239 for example
// on how to use fake timers with setTimeout created in promises.

import PouchManager from './PouchManager'
import * as mocks from './__tests__/mocks'
import { Q } from 'cozy-client'
import MockDate from 'mockdate'
import { isMobileApp } from 'cozy-device-helper'

jest.mock('pouchdb-browser')
jest.mock('cozy-device-helper')
jest.mock('./remote', () => ({
  fetchRemoteLastSequence: jest.fn(),
  fetchRemoteInstance: jest.fn()
}))

import * as rep from './startReplication'
import PouchDB from 'pouchdb-browser'
import { LOCALSTORAGE_STORAGE_KEYS, PouchLocalStorage } from './localStorage'
import { platformWeb } from './platformWeb'

import { fetchRemoteInstance, fetchRemoteLastSequence } from './remote'

const ls = new PouchLocalStorage(platformWeb.storage)

const sleep = delay => {
  return new Promise(resolve => {
    setTimeout(resolve, delay)
  })
}

const query = () => ({
  definition: () =>
    Q('io.cozy.files')
      .where({
        trashed: false,
        type: 'file',
        updated_at: { $gt: null }
      })
      .indexFields(['updated_at', 'type', 'trashed'])
      .sortBy([{ updated_at: 'desc' }])
      .limitBy(100),
  options: {
    as: 'recent-view-query'
  }
})

const query1 = () => ({
  definition: () => Q('io.cozy.todos').limitBy(100),
  options: {
    as: 'query1'
  }
})
const query2 = () => ({
  definition: () => Q('io.cozy.todos').limitBy(100),
  options: {
    as: 'query2'
  }
})

const dbName = 'cozy.tools__doctype__io.cozy.todos'

describe('PouchManager', () => {
  let manager,
    managerOptions,
    getReplicationURL,
    onSync = jest.fn()

  beforeEach(async () => {
    getReplicationURL = () => 'http://replicationURL.local'
    managerOptions = {
      replicationDelay: 16,
      getReplicationURL: () => getReplicationURL(),
      onSync,
      prefix: 'cozy.tools'
    }
    manager = new PouchManager(['io.cozy.todos'], managerOptions)
    await manager.init()
    const pouch = manager.getPouch(dbName)
    const replication = mocks.pouchReplication({
      direction: 'pull',
      change: {
        docs: [
          { _id: '1', name: 'Make replication work' },
          { _id: '2', name: 'Profit!' }
        ]
      }
    })
    pouch.sync = jest.fn().mockImplementation(replication)
    pouch.info = jest.fn().mockImplementation(() => Promise.resolve())
    PouchDB.mockReset()
    PouchDB.plugin.mockReset()
    fetchRemoteLastSequence.mockResolvedValue('10-xyz')
    fetchRemoteInstance.mockResolvedValue({ rows: [{ doc: { _id: '123' } }] })
  })

  afterEach(() => {
    manager.destroy()
  })

  it('should create pouches', () => {
    expect(Object.values(manager.pouches).length).toBe(1)
  })

  it('should first replicate through _all_docs and then through replication protocol', async () => {
    manager.startReplicationLoop()
    await sleep(1000)
    expect(fetchRemoteInstance).toHaveBeenCalledTimes(1)
    const pouch = manager.getPouch(dbName)
    expect(pouch.info).toHaveBeenCalledTimes(1)
    expect(pouch.sync).toHaveBeenCalled()
  })

  it('should call info() on all pouches before starting replication', async () => {
    manager.startReplicationLoop()
    await sleep(1)
    expect(manager.getPouch(dbName).info).toHaveBeenCalled()
    manager.stopReplicationLoop()
    manager.startReplicationLoop()
    await sleep(1)

    // Database existence check should only occur once
    expect(manager.getPouch(dbName).info).toHaveBeenCalledTimes(1)
  })

  it('should periodically call sync', async () => {
    manager.startReplicationLoop()
    await sleep(1000)
    const pouch = manager.getPouch(dbName)
    expect(pouch.sync.mock.calls.length).toBeGreaterThan(5)
  })

  it('should not start remote replication for first replication', async () => {
    manager = new PouchManager(['io.cozy.todos', 'io.cozy.readonly'], {
      ...managerOptions,
      doctypesReplicationOptions: {
        'io.cozy.readonly': { strategy: 'fromRemote' }
      }
    })
    await manager.init()
    const normalPouch = manager.getPouch(dbName)
    const readOnlyPouch = manager.getPouch(
      'cozy.tools__doctype__io.cozy.readonly'
    )
    readOnlyPouch.replicate = {}
    readOnlyPouch.replicate.from = jest.fn()
    manager.startReplicationLoop()
    await sleep(1000)
    expect(fetchRemoteLastSequence).toHaveBeenCalled()
    expect(normalPouch.sync).toHaveBeenCalledTimes(1)
    expect(readOnlyPouch.replicate.from).toHaveBeenCalledTimes(1)
  })

  it('should only replicate from the remote for some doctypes', async () => {
    manager = new PouchManager(
      ['io.cozy.todos', 'io.cozy.readonly', 'io.cozy.writeonly'],
      {
        ...managerOptions,
        doctypesReplicationOptions: {
          'io.cozy.readonly': { strategy: 'fromRemote' },
          'io.cozy.writeonly': { strategy: 'toRemote' }
        }
      }
    )
    await manager.init()
    const normalPouch = manager.getPouch(dbName)
    const readOnlyPouch = manager.getPouch(
      'cozy.tools__doctype__io.cozy.readonly'
    )
    readOnlyPouch.replicate = {}
    readOnlyPouch.replicate.from = jest.fn()
    const writeOnlyPouch = manager.getPouch(
      'cozy.tools__doctype__io.cozy.writeonly'
    )
    writeOnlyPouch.replicate = {}
    writeOnlyPouch.replicate.to = jest.fn()
    manager.updateSyncInfo('io.cozy.todos')
    manager.updateSyncInfo('io.cozy.readonly')
    manager.updateSyncInfo('io.cozy.writeonly')
    manager.startReplicationLoop()
    await sleep(1000)
    expect(readOnlyPouch.replicate.from).toHaveBeenCalled()
    expect(writeOnlyPouch.replicate.to).toHaveBeenCalled()
    expect(normalPouch.sync).toHaveBeenCalled()
  })

  it('should stop in case of error', async () => {
    getReplicationURL = () => {
      throw new Error()
    }
    jest.spyOn(console, 'warn').mockReturnValue()
    jest.spyOn(manager, 'stopReplicationLoop')
    manager.startReplicationLoop()
    await sleep(1)

    try {
      await manager.waitForCurrentReplications()
    } catch (e) {
      /* continue regardless of error */
    }
    expect(manager.stopReplicationLoop).toHaveBeenCalled()
  })

  it('should not start replication several times', async () => {
    jest.spyOn(manager, 'replicateOnce')
    manager.options.replicationDelay = 30 * 1000
    expect(manager.replicateOnce).toHaveBeenCalledTimes(0)
    manager.startReplicationLoop()
    await sleep(1)
    expect(manager.replicateOnce).toHaveBeenCalledTimes(1)
    manager.startReplicationLoop()
    await sleep(1)
    expect(manager.replicateOnce).toHaveBeenCalledTimes(1)
    manager.replicateOnce.mockRestore()
  })

  it('should sync immediately', async () => {
    try {
      await manager.startReplicationLoop()
      expect(manager.replicationLoop).not.toBeUndefined()
      jest.spyOn(manager.replicationLoop, 'scheduleImmediateTask')
      manager.syncImmediately()
      expect(manager.replicationLoop.scheduleImmediateTask).toHaveBeenCalled()
    } finally {
      manager.stopReplicationLoop()
    }
  })

  it('should call on sync with doctype updates', async () => {
    jest.spyOn(manager, 'replicateOnce')
    onSync.mockReset()
    manager.updateSyncInfo('io.cozy.todos')
    await manager.replicateOnce()
    expect(onSync).toHaveBeenCalledWith({
      'io.cozy.todos': [
        {
          _id: '1',
          name: 'Make replication work'
        },
        {
          _id: '2',
          name: 'Profit!'
        }
      ]
    })
  })

  it('should add pouch plugin', async () => {
    const options = { ...managerOptions, pouch: { plugins: ['myPlugin'] } }
    const manager = new PouchManager(['io.cozy.todos'], options)
    await manager.init()
    expect(PouchDB.plugin).toHaveBeenCalledTimes(1)
  })

  it('should instanciate pouch with options', async () => {
    const pouchOptions = { adapter: 'sqlite', location: 'default' }
    const options = { ...managerOptions, pouch: { options: pouchOptions } }
    const manager = new PouchManager(['io.cozy.todos'], options)
    await manager.init()
    expect(PouchDB).toHaveBeenCalledWith(
      'cozy.tools__doctype__io.cozy.todos',
      pouchOptions
    )
  })

  describe('getPersistedSyncedDoctypes', () => {
    it('should return an empty array if local storage is empty', async () => {
      expect(await ls.getPersistedSyncedDoctypes()).toEqual({})
    })

    it('should return an empty array if local storage contains something that is not an array', async () => {
      localStorage.__STORE__[LOCALSTORAGE_STORAGE_KEYS.SYNCED] = 'true'
      expect(await ls.getPersistedSyncedDoctypes()).toEqual({})
    })

    it('should return the list of doctypes if local storage contains one', async () => {
      const persistedSyncedDoctypes = {
        'io.cozy.todos': { date: '2021-08-11T13:48:06.085Z' }
      }
      localStorage.__STORE__[LOCALSTORAGE_STORAGE_KEYS.SYNCED] = JSON.stringify(
        persistedSyncedDoctypes
      )
      expect(await ls.getPersistedSyncedDoctypes()).toEqual(
        persistedSyncedDoctypes
      )
    })
  })

  describe('persistSyncedDoctypes', () => {
    it('should put the list of synced doctypes in localStorage', async () => {
      const manager = new PouchManager(['io.cozy.todos'], managerOptions)
      await manager.init()
      manager.syncedDoctypes = ['io.cozy.todos']
      ls.persistSyncedDoctypes(manager.syncedDoctypes)

      expect(localStorage.__STORE__[LOCALSTORAGE_STORAGE_KEYS.SYNCED]).toEqual(
        JSON.stringify(manager.syncedDoctypes)
      )
    })
  })

  describe('updateSyncInfo', () => {
    beforeAll(() => {
      MockDate.set('2021-08-01T00:00:00.000Z')
    })

    afterAll(() => {
      MockDate.reset()
    })

    it('should add the doctype to synced doctypes', async () => {
      const manager = new PouchManager(['io.cozy.todos'], managerOptions)
      await manager.init()
      await manager.updateSyncInfo('io.cozy.todos')
      expect(Object.keys(manager.syncedDoctypes)).toEqual(['io.cozy.todos'])
    })

    it('should persist the new synced doctypes list', async () => {
      const manager = new PouchManager(['io.cozy.todos'], managerOptions)
      await manager.init()

      await manager.updateSyncInfo('io.cozy.todos')
      expect(localStorage.__STORE__[LOCALSTORAGE_STORAGE_KEYS.SYNCED]).toEqual(
        JSON.stringify({
          'io.cozy.todos': {
            date: '2021-08-01T00:00:00.000Z',
            status: 'synced'
          }
        })
      )
    })
  })

  describe('getSyncStatus', () => {
    let manager

    beforeEach(async () => {
      manager = new PouchManager(['io.cozy.todos'], managerOptions)
      await manager.init()
    })

    it(`should return 'synced' if the doctype is synced`, async () => {
      await manager.updateSyncInfo('io.cozy.todos')
      expect(manager.getSyncStatus('io.cozy.todos')).toBe('synced')
    })

    it(`should return 'not_synced' if the doctype is not synced`, () => {
      expect(manager.getSyncStatus('io.cozy.todos')).toBe('not_synced')
    })

    it('should return status if updateSyncInfo was called with custom status', async () => {
      await manager.updateSyncInfo('io.cozy.todos', 'not_complete')
      expect(manager.getSyncStatus('io.cozy.todos')).toBe('not_complete')
    })
  })

  describe('destroySyncedDoctypes', () => {
    it('should destroy the local storage item', async () => {
      await ls.destroySyncedDoctypes()

      expect(localStorage.removeItem).toHaveBeenLastCalledWith(
        LOCALSTORAGE_STORAGE_KEYS.SYNCED
      )
    })
    it('should reset syncedDoctypes', async () => {
      manager.syncedDoctypes = {
        'io.cozy.todos': { date: '2021-08-11T13:48:06.085Z' }
      }
      await manager.clearSyncedDoctypes()
      expect(manager.syncedDoctypes).toEqual({})
    })
  })

  describe('getPersistedWarmedUpQueriess', () => {
    it('should return an empty object if local storage is empty', async () => {
      expect(await ls.getPersistedWarmedUpQueries()).toEqual({})
    })

    it('should return the list of queries if local storage contains ones', async () => {
      const persistedQueries = [query().options.as]
      localStorage.__STORE__[
        LOCALSTORAGE_STORAGE_KEYS.WARMUPEDQUERIES
      ] = JSON.stringify(persistedQueries)
      expect(await ls.getPersistedWarmedUpQueries()).toEqual(persistedQueries)
    })
  })

  describe('persistWarmedUpQueries', () => {
    it('should put the list of warmedUpQueries in localStorage', async () => {
      const manager = new PouchManager(['io.cozy.todos'], managerOptions)
      await manager.init()
      manager.warmedUpQueries = { 'io.cozy.todos': ['query1', 'query2'] }
      await ls.persistWarmedUpQueries(manager.warmedUpQueries)

      expect(
        localStorage.__STORE__[LOCALSTORAGE_STORAGE_KEYS.WARMUPEDQUERIES]
      ).toEqual(JSON.stringify(manager.warmedUpQueries))
    })
  })

  describe('areQueriesWarmedUp', () => {
    let manager

    beforeEach(async () => {
      manager = new PouchManager(['io.cozy.todos'], managerOptions)
      await manager.init()
    })

    it('should return true if all the queries are warmuped', async () => {
      manager.warmedUpQueries = {
        'io.cozy.todos': [query1().options.as, query2().options.as]
      }
      await ls.persistWarmedUpQueries(manager.warmedUpQueries)

      expect(
        await manager.areQueriesWarmedUp('io.cozy.todos', [query1(), query2()])
      ).toBe(true)
    })

    it('should return false if at least one query is not warmuped', async () => {
      manager.warmedUpQueries = {
        'io.cozy.todos': [query2().options.as]
      }
      await ls.persistWarmedUpQueries()

      expect(
        await manager.areQueriesWarmedUp('io.cozy.todos', [query1(), query2()])
      ).toBe(false)
    })

    it('should return false if the queries are not been done', async () => {
      expect(
        await manager.areQueriesWarmedUp('io.cozy.todos', [query1(), query2()])
      ).toBe(false)
    })
  })

  describe('clearWarmedupQueries', () => {
    it('should clear the local storage item', async () => {
      manager.clearWarmedUpQueries()

      expect(localStorage.removeItem).toHaveBeenLastCalledWith(
        LOCALSTORAGE_STORAGE_KEYS.WARMUPEDQUERIES
      )
    })
    it('should reset warmedupQueries', () => {
      manager.warmedUpQueries = {
        'io.cozy.todos': [query2().options.as]
      }
      manager.clearWarmedUpQueries()
      expect(manager.warmedUpQueries).toEqual({})
    })
  })

  describe('Events Listeners', () => {
    describe('Add/Remove Listeners', () => {
      beforeEach(() => {
        isMobileApp.mockResolvedValue(true)
        // eslint-disable-next-line no-global-assign
        addEventListener = jest.spyOn(document, 'addEventListener')
        // eslint-disable-next-line no-global-assign
        removeEventListener = jest.spyOn(document, 'removeEventListener')
        jest.resetModules()
      })

      it('starts without listener', () => {
        expect(addEventListener).not.toHaveBeenCalled()
        expect(removeEventListener).not.toHaveBeenCalled()
      })

      it('adds listeners only one time', () => {
        expect(addEventListener).not.toHaveBeenCalled()
        manager.addListeners()
        expect(addEventListener).toHaveBeenCalled()
        const calls = addEventListener.mock.calls
        manager.addListeners()
        expect(addEventListener).toHaveBeenCalledTimes(calls.length)
      })

      it('removes listeners only one time', () => {
        expect(removeEventListener).not.toHaveBeenCalled()
        manager.addListeners()
        manager.removeListeners()
        expect(removeEventListener).toHaveBeenCalled()
        const calls = addEventListener.mock.calls
        manager.removeListeners()
        expect(removeEventListener).toHaveBeenCalledTimes(calls.length)
      })
    })

    describe('Each Events', () => {
      let startReplicationLoop, stopReplicationLoop

      beforeEach(() => {
        isMobileApp.mockResolvedValue(true)
        startReplicationLoop = jest.spyOn(manager, 'startReplicationLoop')
        stopReplicationLoop = jest.spyOn(manager, 'stopReplicationLoop')
        manager.addListeners()
      })

      afterEach(() => {
        startReplicationLoop.mockRestore()
        stopReplicationLoop.mockRestore()
      })

      for (const eventName of ['resume', 'online']) {
        it(`check ${eventName} listener to start replication`, () => {
          document.dispatchEvent(new Event(eventName))
          expect(startReplicationLoop).toHaveBeenCalled()
          expect(stopReplicationLoop).not.toHaveBeenCalled()
        })
      }

      for (const eventName of ['pause', 'offline']) {
        it(`check ${eventName} listener to start replication`, () => {
          document.dispatchEvent(new Event(eventName))
          expect(startReplicationLoop).not.toHaveBeenCalled()
          expect(stopReplicationLoop).toHaveBeenCalled()
        })
      }
    })
  })

  describe('warmupQueries', () => {
    let manager
    const executeMock = jest.fn()
    beforeEach(async () => {
      let newManagerOptions = {
        ...managerOptions,
        executeQuery: executeMock,
        doctypesReplicationOptions: {
          'io.cozy.todos': {
            strategy: 'fromRemote',
            warmupQueries: [query1(), query2()]
          }
        }
      }
      manager = new PouchManager(['io.cozy.todos'], newManagerOptions)
      await manager.init()
    })

    it('should executes warmeupQueries on the first replicationLoop only', async () => {
      jest
        .spyOn(rep, 'startReplication')
        .mockImplementation(() => Promise.resolve({}))
      await manager.replicateOnce()
      await sleep(10)
      executeMock.mockResolvedValue({})
      expect(executeMock).toHaveBeenCalledTimes(2)
      expect(executeMock).toHaveBeenNthCalledWith(
        1,
        query1()
          .definition()
          .toDefinition()
      )
      expect(executeMock).toHaveBeenNthCalledWith(
        2,
        query2()
          .definition()
          .toDefinition()
      )
      expect(await ls.getPersistedWarmedUpQueries()).toEqual({
        'io.cozy.todos': ['query1', 'query2']
      })
      //Simulation of a loop. Let's replicate again
      await manager.replicateOnce()
      await sleep(10)
      expect(executeMock).toHaveBeenCalledTimes(2)
    })

    it('should not persist or cache warmedup queries if one has failed', async () => {
      jest
        .spyOn(rep, 'startReplication')
        .mockImplementation(() => Promise.resolve({}))
      executeMock.mockRejectedValueOnce('error').mockResolvedValue({})

      await manager.replicateOnce()
      await sleep(10)
      expect(await ls.getPersistedWarmedUpQueries()).toEqual({})
      expect(manager.warmedUpQueries['io.cozy.todos']).toBeUndefined()
    })
  })
})
