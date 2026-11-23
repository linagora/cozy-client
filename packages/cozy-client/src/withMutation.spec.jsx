import { fireEvent, render } from '@testing-library/react'
import React from 'react'

import CozyClient from './CozyClient'
import Provider from './Provider'
import CozyLink from './links/CozyLink'
import withMutation from './withMutation'

describe('withMutation', () => {
  const NEW_TODO = {
    _id: 'NEW_TODO',
    label: 'Jettison fairings',
    _type: 'io.cozy.todos',
    done: false
  }
  const link = new CozyLink(
    jest.fn(() => Promise.resolve({ data: [NEW_TODO] }))
  )
  const client = new CozyClient({ links: [link] })

  const mutationCreator = jest.fn()

  it('should inject a `mutate` prop into the wrapped component', async () => {
    const AddButton = ({ mutate }) => (
      <button onClick={() => mutate(NEW_TODO)}>Add</button>
    )
    const ConnectedAddButton = withMutation(mutationCreator)(AddButton)

    const wrapper = render(
      <Provider client={client}>
        <ConnectedAddButton />
      </Provider>
    )
    fireEvent.click(wrapper.getByRole('button'))

    expect(mutationCreator).toHaveBeenCalledWith(NEW_TODO)
  })

  it('should inject a prop whose name match the `name` option', async () => {
    const AddButton = ({ addTodo }) => (
      <button onClick={() => addTodo(NEW_TODO)}>Add</button>
    )
    const ConnectedAddButton = withMutation(mutationCreator, {
      name: 'addTodo'
    })(AddButton)

    const wrapper = render(
      <Provider client={client}>
        <ConnectedAddButton />
      </Provider>
    )
    fireEvent.click(wrapper.getByRole('button'))

    expect(mutationCreator).toHaveBeenCalledWith(NEW_TODO)
  })
})
