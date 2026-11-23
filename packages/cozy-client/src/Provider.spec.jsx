jest.mock('./CozyClient')

import { fireEvent, render } from '@testing-library/react'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import configureStore from 'redux-mock-store'

import CozyClient from './CozyClient'
import Provider from './Provider'

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

  it('should provide the client in the context', () => {
    class FakeComponent extends Component {
      static contextTypes = {
        client: PropTypes.object
      }
      onClick = () => {
        this.context.client.query('foo')
      }
      render() {
        return <button onClick={this.onClick} />
      }
    }
    const wrapper = render(
      <Provider client={client} store={store}>
        <FakeComponent />
      </Provider>
    )
    fireEvent.click(wrapper.getByRole('button'))
    expect(client.query).toHaveBeenCalledWith('foo')
  })
})
