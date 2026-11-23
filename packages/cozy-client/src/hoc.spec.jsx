import { fireEvent, render, screen } from '@testing-library/react'
import React, { useState } from 'react'
import { Provider as ReduxProvider } from 'react-redux'

import Provider from './Provider'
import * as mocks from './__tests__/mocks'
import { withClient, queryConnect, queryConnectFlat } from './hoc'
import logger from './logger'
import { Q } from './queries/dsl'
// At some point __tests__/mocks and testing/utils shall be reconciled
import { setupClient } from './testing/utils'

beforeEach(() => {
  jest.spyOn(logger, 'warn').mockImplementation(() => {})
  Component.mockClear()
})

afterEach(() => {
  logger.warn.mockRestore()
})

const Component = jest.fn(() => <div>Component</div>)
Component.displayName = 'Component'

describe('with client', () => {
  it('should give a display name', () => {
    const WithClientComponent = withClient(Component)
    expect(WithClientComponent.displayName).toBe('withClient(Component)')
  })

  it('should work with Provider', () => {
    const client = mocks.client()
    const store = {
      dispatch: jest.fn(),
      subscribe: jest.fn(),
      getState: jest.fn()
    }
    const WithClientComponent = withClient(Component)
    render(
      <Provider client={client} store={store}>
        <WithClientComponent />
      </Provider>
    )

    expect(Component).toHaveBeenCalledWith({ client }, {})
  })
})

const queryConns = {
  simpsons: { query: client => Q('io.cozy.simpsons'), as: 'simpsons' },
  upperSimpsons: {
    query: client => Q('io.cozy.simpsons-upper'),
    as: 'upperSimpsons'
  }
}

describe('queryConnect', () => {
  const setup = () => {
    const client = setupClient()
    const WithQueries = queryConnect({
      simpsons: queryConns.simpsons,
      upperSimpsons: queryConns.upperSimpsons
    })(Component)
    return { WithQueries, client }
  }

  it('should give a display name', () => {
    const { WithQueries } = setup()
    expect(WithQueries.displayName).toBe('withQuery(withQuery(Component))')
  })

  it('should pass result of query definitions as props', () => {
    const { WithQueries, client } = setup()
    const context = {
      client
    }
    render(
      <Provider client={client}>
        <WithQueries />
      </Provider>,
      { context }
    )

    const propsPassedToComponent = Component.mock.calls[0][0]

    expect(propsPassedToComponent.simpsons.data.map(x => x.name)).toEqual([
      'Homer',
      'Marge'
    ])
    expect(propsPassedToComponent.upperSimpsons.data.map(x => x.name)).toEqual([
      'HOMER',
      'MARGE'
    ])
  })

  it('should be possible to pass props', () => {
    const WithQuery = queryConnect({
      simpson: props => ({
        query: Q('io.cozy.simpsons').getById(props.simpsonId),
        as: `simpsons/${props.simpsonId}`
      })
    })(Component)
    const client = setupClient()
    const Wrapper = ({ client }) => {
      const [id, setId] = useState('marge')
      return (
        <Provider client={client}>
          <div>
            <WithQuery simpsonId={id} />
            <button onClick={() => setId('homer')}>change to homer</button>
          </div>
        </Provider>
      )
    }

    render(<Wrapper client={client} />)

    expect(Component).toHaveBeenCalledWith(
      expect.objectContaining({
        simpsonId: 'marge'
      }),
      {}
    )

    fireEvent.click(screen.getByText('change to homer'))

    expect(Component).toHaveBeenCalledWith(
      expect.objectContaining({
        simpsonId: 'homer'
      }),
      {}
    )
  })
})

describe('queryConnectFlat', () => {
  const setup = () => {
    const client = setupClient()
    const WithQueries = queryConnectFlat({
      simpsons: queryConns.simpsons,
      upperSimpsons: queryConns.upperSimpsons
    })(Component)
    return { WithQueries, client }
  }

  it('should give a display name', () => {
    const { WithQueries } = setup()
    expect(WithQueries.displayName).toBe('queryConnectFlat(Component)')
  })

  it('should pass result of query definitions as props', () => {
    const { WithQueries, client } = setup()
    render(
      <ReduxProvider store={client.store}>
        <Provider client={client}>
          <WithQueries />
        </Provider>
      </ReduxProvider>
    )
    const propsPassedToComponent = Component.mock.calls[0][0]

    expect(propsPassedToComponent.simpsons.data.map(x => x.name)).toEqual([
      'Homer',
      'Marge'
    ])
    expect(propsPassedToComponent.upperSimpsons.data.map(x => x.name)).toEqual([
      'HOMER',
      'MARGE'
    ])
  })
})
