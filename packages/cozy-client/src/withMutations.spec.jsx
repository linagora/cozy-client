import React from 'react'
import { render } from '@testing-library/react'

import withMutations from './withMutations'
import Provider from './Provider'

describe('withMutations', () => {
  beforeEach(() => {
    let originalWarn = console.warn
    // eslint-disable-next-line no-console
    jest.spyOn(console, 'warn').mockImplementation(function (msg) {
      if (msg.includes && msg.includes('withMutations will be removed')) {
        return
      }
      return originalWarn.apply(this, arguments)
    })
  })

  const clientMock = {
    create: jest.fn(),
    destroy: jest.fn(),
    save: jest.fn(),
    mutate: jest.fn(),
    mutateAsWell: jest.fn()
  }

  afterEach(() => {
    jest.resetAllMocks()
    jest.restoreAllMocks()
  })

  it('should not throw error on withMutations usage', () => {
    const Foo = () => <div />
    // mock for proptypes
    jest.spyOn(console, 'error').mockImplementation(message => {
      throw new Error(message)
    })
    const originalWarn = console.warn
    jest.spyOn(console, 'warn').mockImplementation(function (message) {
      if (message.includes('Deprecation: withMutations')) {
        return
      } else {
        return originalWarn.apply(this, arguments)
      }
    })
    const mutationsMock = client => ({
      myMutation1: () => {},
      myMutation2: () => {}
    })

    expect(() => {
      const ConnectedFoo = withMutations(mutationsMock)(Foo)
      render(
        <Provider client={clientMock}>
          <ConnectedFoo />
        </Provider>
      )
    }).not.toThrowError()
  })

  it('should inject base mutations props into wrapped component', async () => {
    const Foo = jest.fn(() => <div>Component</div>)
    const ConnectedFoo = withMutations()(Foo)

    render(
      <Provider client={clientMock}>
        <ConnectedFoo />
      </Provider>
    )

    const { createDocument, saveDocument, deleteDocument } =
      Foo.mock.calls[0][0]

    expect(typeof createDocument).toBe('function')
    expect(typeof saveDocument).toBe('function')
    expect(typeof deleteDocument).toBe('function')
  })

  it('should inject mutations props from one source into wrapped component', async () => {
    const Foo = jest.fn(() => <div>Component</div>)
    const ConnectedFoo = withMutations(client => ({
      mutate: client => client.mutate()
    }))(Foo)

    render(
      <Provider client={clientMock}>
        <ConnectedFoo />
      </Provider>
    )

    const { mutate } = Foo.mock.calls[0][0]
    expect(typeof mutate).toBe('function')

    mutate(clientMock)
    expect(clientMock.mutate).toHaveBeenCalled()
  })

  it('should inject mutations props from several sources into wrapped component', async () => {
    const Foo = jest.fn(() => <div>Component</div>)
    const mutations = client => ({
      mutate: client => client.mutate()
    })

    const anotherMutations = client => ({
      mutateAsWell: client => client.mutateAsWell()
    })

    const ConnectedFoo = withMutations(mutations, anotherMutations)(Foo)

    render(
      <Provider client={clientMock}>
        <ConnectedFoo />
      </Provider>
    )

    const { mutate, mutateAsWell } = Foo.mock.calls[0][0]

    expect(typeof mutate).toBe('function')
    expect(typeof mutateAsWell).toBe('function')

    mutate(clientMock)
    expect(clientMock.mutate).toHaveBeenCalled()

    mutateAsWell(clientMock)
    expect(clientMock.mutateAsWell).toHaveBeenCalled()
  })
})
