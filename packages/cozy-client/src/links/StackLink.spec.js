import { Q } from '../queries/dsl'
import CozyClient from '../CozyClient'
import StackLink, { transformBulkDocsResponse } from './StackLink'
import { SCHEMA } from '../__tests__/fixtures'
import logger from '../logger'
// eslint-disable-next-line no-underscore-dangle
import { _resetForceStackWarning } from './forceLink'

describe('StackLink', () => {
  describe('name', () => {
    it('should expose a stable name', () => {
      expect(new StackLink().name).toBe('stack')
    })
  })

  let stackClient, link, client

  beforeEach(() => {
    link = new StackLink()
    client = new CozyClient({ links: [link], schema: SCHEMA })
    stackClient = client.getStackClient()
  })

  describe('forceLink', () => {
    let warnSpy

    beforeEach(() => {
      _resetForceStackWarning()
      warnSpy = jest.spyOn(logger, 'warn').mockImplementation(() => {})
    })

    afterEach(() => {
      warnSpy.mockRestore()
    })

    it('forwards when forceLink targets another link', async () => {
      const link = new StackLink()
      const forward = jest.fn().mockResolvedValue('forwarded')
      expect(
        await link.request(
          { doctype: 'io.cozy.files' },
          { forceLink: 'dataproxy' },
          undefined,
          forward
        )
      ).toBe('forwarded')
    })

    it('handles a forceStack:true query (legacy: does not forward, emits deprecation warning)', async () => {
      const link = new StackLink()
      link.executeQuery = jest.fn().mockResolvedValue({ data: [] })
      link.isOnline = jest.fn().mockResolvedValue(false) // offline — should NOT bail because forceStack
      const forwardFn = jest.fn()
      const op = { doctype: 'io.cozy.files' }
      await link.request(op, { forceStack: true }, null, forwardFn)
      expect(forwardFn).not.toHaveBeenCalled()
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('forceStack is deprecated')
      )
    })

    it('forwards a plain query when offline', async () => {
      const link = new StackLink()
      link.isOnline = jest.fn().mockResolvedValue(false)
      const forwardFn = jest.fn().mockResolvedValue(null)
      const op = { doctype: 'io.cozy.files' }
      await link.request(op, {}, null, forwardFn)
      expect(forwardFn).toHaveBeenCalled()
    })
  })

  describe('query execution', () => {
    it('should execute queries without a selector', async () => {
      const query = Q('io.cozy.todos')
      stackClient.collection().all.mockReset()
      await link.request(query)
      expect(stackClient.collection().all).toHaveBeenCalled()
      expect(stackClient.collection).toHaveBeenCalledWith(
        'io.cozy.todos',
        expect.anything()
      )
    })

    it('should execute queries with a selector', async () => {
      const query = Q('io.cozy.todos').where({ checked: true })
      stackClient.collection().find.mockReset()
      await link.request(query)
      expect(stackClient.collection().find).toHaveBeenCalledWith(
        { checked: true },
        {}
      )
    })

    it('should use find if a sort option is given', async () => {
      const query = Q('io.cozy.todos').sortBy([{ name: 'asc' }])
      stackClient.collection().find.mockReset()
      await link.request(query)
      expect(stackClient.collection().find).toHaveBeenCalled()
      expect(stackClient.collection).toHaveBeenCalledWith(
        'io.cozy.todos',
        expect.anything()
      )
    })

    it('should use all if a no sort option is given', async () => {
      const query = Q('io.cozy.todos')
      stackClient.collection().all.mockReset()
      await link.request(query)
      expect(stackClient.collection().all).toHaveBeenCalled()
      expect(stackClient.collection).toHaveBeenCalledWith(
        'io.cozy.todos',
        expect.anything()
      )
    })

    it('should use find if a partialFilter is given', async () => {
      const query = Q('io.cozy.todos').partialIndex({ trashed: false })
      stackClient.collection().find.mockReset()
      await link.request(query)
      expect(stackClient.collection().find).toHaveBeenCalled()
      expect(stackClient.collection).toHaveBeenCalledWith(
        'io.cozy.todos',
        expect.anything()
      )
    })

    it('should use find if fields are given', async () => {
      const query = Q('io.cozy.todos').select(['trashed'])
      stackClient.collection().find.mockReset()
      await link.request(query)
      expect(stackClient.collection().find).toHaveBeenCalled()
      expect(stackClient.collection).toHaveBeenCalledWith(
        'io.cozy.todos',
        expect.anything()
      )
    })
  })

  describe('reset', () => {
    it('should delete client', async () => {
      expect(link.stackClient).not.toBeNull()
      await link.reset()
      expect(link.stackClient).toBeNull()
    })
  })

  describe('transformBulkDocsResponse', () => {
    it('should return a data object with _id and _rev updated', () => {
      const updateAllResponse = [
        { ok: true, rev: '2-deadbeef', id: '1' },
        { ok: true, rev: '2-cffeebabe', id: '2' }
      ]
      const originalDocuments = [
        { _rev: '1-abcdef', label: 'Fish stew', _id: '1' },
        { _rev: '1-abcdgg', label: 'Lamb stew', _id: '2' }
      ]
      const resp = transformBulkDocsResponse(
        updateAllResponse,
        originalDocuments
      )
      expect(resp).toEqual({
        data: [
          { _rev: '2-deadbeef', label: 'Fish stew', _id: '1' },
          { _rev: '2-cffeebabe', label: 'Lamb stew', _id: '2' }
        ]
      })
    })

    it('should throw an error in case of partial update', () => {
      const updateAllResponse = [
        { ok: true, rev: '2-deadbeef', id: '1' },
        { error: 'conflict', reason: 'Conflict', id: '2' }
      ]
      const originalDocuments = [
        { _rev: '1-abcdef', label: 'Fish stew', _id: '1' },
        { _rev: '1-abcdgg', label: 'Lamb stew', _id: '2' }
      ]

      let bulkErr
      try {
        transformBulkDocsResponse(updateAllResponse, originalDocuments)
      } catch (e) {
        bulkErr = e
      }
      expect(bulkErr.message).toBe('Error while bulk saving')
      const errors = bulkErr.getErrors()
      expect(errors.length).toBe(1)
      expect(errors[0]).toEqual({
        error: 'conflict',
        reason: 'Conflict',
        id: '2',
        doc: expect.objectContaining(originalDocuments[1])
      })
    })
  })
})
