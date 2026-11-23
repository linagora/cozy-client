import { render, waitFor } from '@testing-library/react'
import React from 'react'

import CozyProvider from './Provider'
import RealTimeQueries from './RealTimeQueries'
import { createMockClient } from './mock'

const setup = async doctype => {
  const realtimeCallbacks = {}
  const client = new createMockClient({
    queries: {
      'io.cozy.files/parent': {
        doctype: 'io.cozy.files',
        definition: {
          doctype: 'io.cozy.files',
          id: 'parent'
        },
        data: [
          {
            _id: 'parent',
            _type: 'io.cozy.files',
            name: 'Parent folder',
            path: '/Parent'
          }
        ]
      }
    }
  })

  client.plugins.realtime = {
    subscribe: jest.fn((event, doctype, callback) => {
      realtimeCallbacks[event] = callback
    }),
    unsubscribe: jest.fn()
  }
  client.dispatch = jest.fn()

  const { unmount } = render(
    <CozyProvider client={client}>
      <RealTimeQueries doctype={doctype} />
    </CozyProvider>
  )

  await waitFor(() =>
    expect(client.plugins.realtime.subscribe).toHaveBeenCalledTimes(3)
  )

  return { client, realtimeCallbacks, unmount }
}

describe('RealTimeQueries', () => {
  it('should dispatch CREATE_DOCUMENT mutation for created io.cozy.files', async () => {
    const { client, realtimeCallbacks, unmount } = await setup('io.cozy.files')

    realtimeCallbacks['created']({
      _id: 'mock-created',
      type: 'file',
      name: 'mock-created',
      dir_id: 'parent'
    })

    await waitFor(() => {
      expect(client.dispatch).toHaveBeenCalledWith({
        definition: {
          document: {
            _id: 'mock-created',
            _type: 'io.cozy.files',
            dir_id: 'parent',
            id: 'mock-created',
            name: 'mock-created',
            path: '/Parent/mock-created',
            type: 'file'
          },
          mutationType: 'CREATE_DOCUMENT'
        },
        mutationId: '1',
        response: {
          data: {
            _id: 'mock-created',
            _type: 'io.cozy.files',
            dir_id: 'parent',
            id: 'mock-created',
            name: 'mock-created',
            path: '/Parent/mock-created',
            type: 'file'
          }
        },
        type: 'RECEIVE_MUTATION_RESULT'
      })
    })

    unmount()
    await waitFor(() => {
      expect(client.plugins.realtime.unsubscribe).toHaveBeenCalledTimes(3)
    })
  })

  it('should dispatch UPDATE_DOCUMENT mutation for updated io.cozy.files', async () => {
    const { client, realtimeCallbacks, unmount } = await setup('io.cozy.files')

    realtimeCallbacks['updated']({
      _id: 'mock-updated',
      type: 'file',
      name: 'mock-updated',
      dir_id: 'parent'
    })

    await waitFor(() => {
      expect(client.dispatch).toHaveBeenCalledWith({
        definition: {
          document: {
            _id: 'mock-updated',
            _type: 'io.cozy.files',
            dir_id: 'parent',
            id: 'mock-updated',
            name: 'mock-updated',
            path: '/Parent/mock-updated',
            type: 'file'
          },
          mutationType: 'UPDATE_DOCUMENT'
        },
        mutationId: '1',
        response: {
          data: {
            _id: 'mock-updated',
            _type: 'io.cozy.files',
            dir_id: 'parent',
            id: 'mock-updated',
            name: 'mock-updated',
            path: '/Parent/mock-updated',
            type: 'file'
          }
        },
        type: 'RECEIVE_MUTATION_RESULT'
      })
    })

    unmount()
    expect(client.plugins.realtime.unsubscribe).toHaveBeenCalledTimes(3)
  })

  it('should dispatch DELETE_DOCUMENT mutation for deleted io.cozy.files', async () => {
    const { client, realtimeCallbacks, unmount } = await setup('io.cozy.files')

    realtimeCallbacks['deleted']({
      _id: 'mock-deleted',
      type: 'file',
      name: 'mock-deleted',
      dir_id: 'parent'
    })

    await waitFor(() => {
      expect(client.dispatch).toHaveBeenCalledWith({
        definition: {
          document: {
            _deleted: true,
            _type: 'io.cozy.files',
            _id: 'mock-deleted',
            dir_id: 'parent',
            id: 'mock-deleted',
            name: 'mock-deleted',
            path: '/Parent/mock-deleted',
            type: 'file'
          },
          mutationType: 'DELETE_DOCUMENT'
        },
        mutationId: '1',
        response: {
          data: {
            _deleted: true,
            _type: 'io.cozy.files',
            _id: 'mock-deleted',
            dir_id: 'parent',
            id: 'mock-deleted',
            name: 'mock-deleted',
            path: '/Parent/mock-deleted',
            type: 'file'
          }
        },
        type: 'RECEIVE_MUTATION_RESULT'
      })
    })

    unmount()
    expect(client.plugins.realtime.unsubscribe).toHaveBeenCalledTimes(3)
  })

  it('should handle realtime events for other doctypes than io.cozy.files', async () => {
    const { client, realtimeCallbacks, unmount } = await setup(
      'io.cozy.oauth.clients'
    )

    realtimeCallbacks['created']({
      _id: 'mock-created',
      client_kind: 'desktop',
      client_name: 'Cozy Drive (hostname)'
    })
    await waitFor(() => {
      expect(client.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          definition: {
            document: {
              _id: 'mock-created',
              id: 'mock-created',
              _type: 'io.cozy.oauth.clients',
              client_kind: 'desktop',
              client_name: 'Cozy Drive (hostname)'
            },
            mutationType: 'CREATE_DOCUMENT'
          },
          mutationId: '1',
          response: {
            data: {
              _id: 'mock-created',
              id: 'mock-created',
              _type: 'io.cozy.oauth.clients',
              client_kind: 'desktop',
              client_name: 'Cozy Drive (hostname)'
            }
          },
          type: 'RECEIVE_MUTATION_RESULT'
        })
      )
    })

    unmount()
  })
})
