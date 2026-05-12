import { Q } from 'cozy-client'

import { queryFileById } from './files'

describe('queryFileById', () => {
  it('should call client.fetchQueryAndGetFromState with the expected definition and options', async () => {
    const expectedResult = { data: { _id: 'parent', path: '/parent' } }
    const client = {
      fetchQueryAndGetFromState: jest.fn().mockResolvedValue(expectedResult)
    }

    const res = await queryFileById(client, 'parent')

    expect(res).toBe(expectedResult)
    expect(client.fetchQueryAndGetFromState).toHaveBeenCalledTimes(1)
    expect(client.fetchQueryAndGetFromState).toHaveBeenCalledWith({
      definition: expect.objectContaining(Q('io.cozy.files').getById('parent')),
      options: {
        as: 'io.cozy.files/parent',
        fetchPolicy: expect.any(Function),
        singleDocData: true
      }
    })
  })
})
