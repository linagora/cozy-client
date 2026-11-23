import React from 'react'
import { act, render } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'

import CozyClient from '../CozyClient'
import { Q } from '../queries/dsl'
import { createMockClient } from '../mock'
import CozyProvider from '../Provider'
import { receiveQueryResult } from '../store'
import logger from '../logger'

import useQueryAll from './useQueryAll'

const sleep = delay => new Promise(resolve => setTimeout(resolve, delay))

describe('useQueryAll', () => {
  const setup = ({ todosResult, enabled = true }) => {
    const client = createMockClient({
      queries: {
        todos: todosResult
      }
    })
    client.query.mockImplementation(async () => {
      // give a little time for hook to be re-rendered several times
      await sleep(10)
      return {
        data: [{ _id: '2', done: false }],
        next: false
      }
    })
    const wrapper = ({ children }) => (
      <CozyProvider client={client}>{children}</CozyProvider>
    )
    const query = Q('io.cozy.todos')
    const options = {
      as: 'todos',
      enabled
    }
    const hook = renderHook(() => useQueryAll(query, options), {
      wrapper
    })
    return { client, wrapper, hook }
  }

  const setupPagination = ({
    cachedPages = 1,
    backgroundFetching = false
  } = {}) => {
    const client = new CozyClient({ backgroundFetching })
    const query = Q('io.cozy.todos').limitBy(1)
    const documents = ['1', '2', '3'].map(_id => ({
      _id,
      _rev: '1-a',
      _type: 'io.cozy.todos'
    }))
    client.ensureQueryExists('todos', query)
    for (let page = 0; page < cachedPages; page++) {
      client.dispatch(
        receiveQueryResult('todos', {
          data: [documents[page]],
          next: true,
          bookmark: `page${page + 2}`
        })
      )
    }
    const requests = []
    client.requestQuery = jest.fn(
      definition =>
        new Promise((resolve, reject) => {
          requests.push({
            bookmark: definition.bookmark || null,
            resolve,
            reject
          })
        })
    )
    const Results = ({ enabled }) => {
      const result = useQueryAll(query, {
        as: 'todos',
        enabled,
        backgroundFetching: true
      })
      return (
        <div data-testid="query-results">
          {result.data.map(document => document._id).join(',')}
          {result.hasMore ? ' loading' : ' complete'}
        </div>
      )
    }
    const wrapper = ({ children }) => (
      <CozyProvider client={client}>{children}</CozyProvider>
    )
    return { client, query, documents, requests, Results, wrapper }
  }

  it('should run only 1 fetch more even if the hook is rendered-multiple times', () => {
    const {
      client,
      hook: { result, rerender }
    } = setup({
      todosResult: {
        data: [{ _id: '1', done: true }],
        next: true,
        doctype: 'io.cozy.todos'
      }
    })
    expect(result.error).toBeFalsy()
    rerender()
    rerender()
    rerender()
    rerender()

    // one for the initial query and one for the fetchMore
    expect(client.query).toHaveBeenCalledTimes(2)
  })

  it('does not paginate a disabled query with cached pages remaining', () => {
    const { client, hook } = setup({
      enabled: false,
      todosResult: {
        data: [{ _id: '1' }],
        next: true,
        doctype: 'io.cozy.todos'
      }
    })
    hook.rerender()
    expect(client.query).not.toHaveBeenCalled()
  })

  it.each([1, 2])(
    'waits for a background refresh before resuming %i cached pages',
    async cachedPages => {
      const { documents, requests, Results, wrapper } = setupPagination({
        cachedPages
      })
      const { rerender, getByTestId } = render(<Results enabled={false} />, {
        wrapper
      })
      expect(requests).toHaveLength(0)
      rerender(<Results enabled />)
      expect(requests.map(request => request.bookmark)).toEqual([null])

      for (let page = 0; page < documents.length; page++) {
        await act(async () => {
          requests[page].resolve({
            data: [documents[page]],
            next: page < 2,
            bookmark: `page${page + 2}`
          })
        })
        expect(requests.map(request => request.bookmark)).toEqual(
          [null, 'page2', 'page3'].slice(0, Math.min(page + 2, 3))
        )
      }
      expect(getByTestId('query-results').textContent).toBe('1,2,3 complete')
    }
  )

  it.each([[false, 'response'], [true, 'response'], [true, 'error']])(
    'restarts pagination after a refresh overlaps page three with backgroundFetching=%s and an old %s',
    async (backgroundFetching, outcome) => {
      const { documents, requests, Results, wrapper } = setupPagination({
        backgroundFetching
      })
      const { rerender, getByTestId } = render(<Results enabled />, { wrapper })
      for (let page = 0; page < 2; page++) {
        await act(async () => {
          requests[page].resolve({
            data: [documents[page]],
            next: true,
            bookmark: `page${page + 2}`
          })
        })
      }
      expect(requests.map(request => request.bookmark)).toEqual([
        null,
        'page2',
        'page3'
      ])

      rerender(<Results enabled={false} />)
      rerender(<Results enabled />)
      expect(requests[3].bookmark).toBe(null)
      await act(async () => {
        requests[3].resolve({
          data: [documents[0]],
          next: true,
          bookmark: 'page2'
        })
      })
      expect(requests).toHaveLength(4)
      await act(async () => {
        if (outcome === 'error') {
          requests[2].reject(new Error('obsolete page failed'))
        } else {
          requests[2].resolve({ data: [documents[2]], next: false })
        }
      })
      expect(getByTestId('query-results').textContent).toBe('1 loading')
      expect(requests[4].bookmark).toBe('page2')

      for (let page = 1; page < 3; page++) {
        await act(async () => {
          requests[page + 3].resolve({
            data: [documents[page]],
            next: page < 2,
            bookmark: `page${page + 2}`
          })
        })
      }
      expect(requests.map(request => request.bookmark)).toEqual([
        null,
        'page2',
        'page3',
        null,
        'page2',
        'page3'
      ])
      expect(getByTestId('query-results').textContent).toBe('1,2,3 complete')
    }
  )

  it('reports completion when the last background page is empty', async () => {
    const { documents, requests, Results, wrapper } = setupPagination({
      backgroundFetching: true
    })
    const { getByTestId } = render(<Results enabled />, { wrapper })
    await act(async () => {
      requests[0].resolve({
        data: [documents[0]],
        next: true,
        bookmark: 'page2'
      })
    })
    await act(async () => {
      requests[1].resolve({ data: [], next: false })
    })
    expect(requests).toHaveLength(2)
    expect(getByTestId('query-results').textContent).toBe('1 complete')
  })

  it('can paginate again after a failed page is refreshed', async () => {
    const { client, documents, requests, Results, wrapper } = setupPagination()
    const warn = jest.spyOn(logger, 'warn').mockImplementation(() => {})
    const { rerender, getByTestId } = render(<Results enabled />, { wrapper })
    try {
      await act(async () => {
        requests[0].resolve({
          data: [documents[0]],
          next: true,
          bookmark: 'page2'
        })
      })
      await act(async () => {
        requests[1].reject(new Error('page failed'))
      })
      expect(client.getQueryFromState('todos').fetchStatus).toBe('failed')
      rerender(<Results enabled={false} />)
      rerender(<Results enabled />)
      await act(async () => {
        requests[2].resolve({
          data: [documents[0]],
          next: true,
          bookmark: 'page2'
        })
      })
      expect(requests[3].bookmark).toBe('page2')
      await act(async () => {
        requests[3].resolve({ data: [documents[1]], next: false })
      })
      expect(getByTestId('query-results').textContent).toBe('1,2 complete')
    } finally {
      warn.mockRestore()
    }
  })

  it('should not run fetch if there are no more results', () => {
    const {
      client,
      hook: { result, rerender }
    } = setup({
      todosResult: {
        data: [{ _id: '1', done: true }],
        next: false,
        doctype: 'io.cozy.todos'
      }
    })
    expect(result.error).toBeFalsy()
    rerender()
    rerender()
    rerender()
    rerender()

    // one for the initial query and one for the fetchMore
    expect(client.query).toHaveBeenCalledTimes(1)
  })
})
