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

  it('with a driveId, builds a drive-scoped query with driveId and per-drive cache key, no forceLink', async () => {
    const expectedResult = { data: { _id: 'dir-123', path: '/Drive/Folder' } }
    const client = {
      fetchQueryAndGetFromState: jest.fn().mockResolvedValue(expectedResult)
    }

    const res = await queryFileById(client, 'dir-123', 'drive-abc')

    expect(res).toBe(expectedResult)
    expect(client.fetchQueryAndGetFromState).toHaveBeenCalledTimes(1)
    const calledOptions =
      client.fetchQueryAndGetFromState.mock.calls[0][0].options
    expect(calledOptions.as).toBe('io.cozy.files/drive/drive-abc/dir-123')
    expect(calledOptions.driveId).toBe('drive-abc')
    expect(calledOptions).not.toHaveProperty('forceLink')
    expect(calledOptions.singleDocData).toBe(true)
  })

  it('without a driveId, options are byte-for-byte identical to the legacy call', async () => {
    const client = {
      fetchQueryAndGetFromState: jest.fn().mockResolvedValue({ data: null })
    }

    await queryFileById(client, 'some-id', undefined)

    const calledOptions =
      client.fetchQueryAndGetFromState.mock.calls[0][0].options
    expect(calledOptions).not.toHaveProperty('driveId')
    expect(calledOptions).not.toHaveProperty('forceLink')
    expect(calledOptions.as).toBe('io.cozy.files/some-id')
  })
})
