jest.mock('./CozyClient')

import React from 'react'
import configureStore from 'redux-mock-store'
import { fireEvent, render } from '@testing-library/react'

import Provider from './Provider'
import CozyClient from './CozyClient'
import useClient from './hooks/useClient'

describe('Provider', () => {
  const client = new CozyClient()
  const store = configureStore()({})

  it('should renders children when passed in', () => {
    const wrapper = render(
      <Provider client={client} store={store}>
        <div>Component</div>
      </Provider>
    )
    expect(wrapper.getByText('Component')).toBeTruthy()
  })

  it('should provide the client through React context', () => {
    const ConsumerComponent = () => {
      const ctxClient = useClient()
      return <button onClick={() => ctxClient.query('foo')} />
    }
    const wrapper = render(
      <Provider client={client} store={store}>
        <ConsumerComponent />
      </Provider>
    )
    fireEvent.click(wrapper.getByRole('button'))
    expect(client.query).toHaveBeenCalledWith('foo')
  })
})
