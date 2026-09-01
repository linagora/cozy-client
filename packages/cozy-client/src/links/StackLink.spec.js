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

    it('should fetch and normalize effective recipients for a classic sharing', async () => {
      const query = Q('io.cozy.sharings.recipients').effectiveRecipients(
        'file/1'
      )
      stackClient.collection().fetchEffectiveRecipients.mockResolvedValue({
        data: [
          {
            id: 'https://alice.example',
            name: 'Alice',
            read_only: false
          }
        ],
        meta: { file_id: 'file/1' }
      })

      const response = await link.request(query)

      expect(stackClient.collection).toHaveBeenCalledWith('io.cozy.sharings')
      expect(
        stackClient.collection().fetchEffectiveRecipients
      ).toHaveBeenCalledWith('file/1', { driveId: null })
      expect(response).toEqual({
        data: [
          {
            id: 'personal/file/file%2F1/recipient/https%3A%2F%2Falice.example',
            _id: 'personal/file/file%2F1/recipient/https%3A%2F%2Falice.example',
            _type: 'io.cozy.sharings.recipients',
            recipient_id: 'https://alice.example',
            file_id: 'file/1',
            drive_id: null,
            name: 'Alice',
            read_only: false
          }
        ],
        meta: { file_id: 'file/1' }
      })
    })

    it('should fetch effective recipients in a shared drive scope', async () => {
      const query = Q('io.cozy.sharings.recipients').effectiveRecipients(
        'file-1',
        { driveId: 'drive/1' }
      )
      stackClient.collection().fetchEffectiveRecipients.mockResolvedValue({
        data: [{ id: 'alice@example.test', name: 'Alice' }]
      })

      const response = await link.request(query)

      expect(
        stackClient.collection().fetchEffectiveRecipients
      ).toHaveBeenCalledWith('file-1', { driveId: 'drive/1' })
      expect(response.data[0]).toMatchObject({
        id: 'drive/drive%2F1/file/file-1/recipient/alice%40example.test',
        recipient_id: 'alice@example.test',
        file_id: 'file-1',
        drive_id: 'drive/1'
      })
    })

    it('should scope virtual document ids by target', async () => {
      stackClient.collection().fetchEffectiveRecipients.mockResolvedValue({
        data: [{ id: 'sharing-1:0', name: 'Alice' }]
      })

      const fileResponse = await link.request(
        Q('io.cozy.sharings.recipients').effectiveRecipients('file-1')
      )
      const childResponse = await link.request(
        Q('io.cozy.sharings.recipients').effectiveRecipients('child-1')
      )

      expect(fileResponse.data[0].recipient_id).toBe('sharing-1:0')
      expect(childResponse.data[0].recipient_id).toBe('sharing-1:0')
      expect(fileResponse.data[0].id).not.toBe(childResponse.data[0].id)
    })

    it('should not forward effective recipients queries when offline', async () => {
      const query = Q('io.cozy.sharings.recipients').effectiveRecipients(
        'file-1'
      )
      const forward = jest.fn()
      link.isOnline = jest.fn().mockResolvedValue(false)

      await expect(link.request(query, {}, null, forward)).rejects.toThrow(
        'Effective recipients cannot be fetched offline'
      )
      expect(forward).not.toHaveBeenCalled()
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
