import { Q } from 'cozy-client'

import { createIndex } from '../../mango'
import { getDocsAndNormalize } from './getDocs'
import PouchDBQuery from './pouchdb'

jest.mock('../../mango', () => ({
  ...jest.requireActual('../../mango'),
  createIndex: jest.fn()
}))

jest.mock('./getDocs', () => ({
  getDocsAndNormalize: jest.fn()
}))

describe('PouchDBQuery find()', () => {
  let pouchQE

  beforeEach(() => {
    pouchQE = new PouchDBQuery()
    pouchQE.client = {}
    pouchQE.db = {}
    pouchQE.doctype = 'io.cozy.test'

    jest.clearAllMocks()
  })

  it('should use provided indexedFields', async () => {
    const options = {
      selector: { name: 'John' },
      sort: [{ name: 'asc' }],
      indexedFields: ['name'],
      doctype: 'io.cozy.test'
    }

    getDocsAndNormalize.mockResolvedValue([{ _id: '1', name: 'John' }])

    const result = await pouchQE.find(options)

    expect(getDocsAndNormalize).toHaveBeenCalledWith({
      client: pouchQE.client,
      db: pouchQE.db,
      doctype: pouchQE.doctype,
      queryFunc: 'find',
      queryParams: expect.objectContaining({
        selector: options.selector,
        sort: options.sort,
        partialFilter: options.partialFilter,
        indexedFields: ['name'],
        use_index: 'by_name'
      })
    })
    expect(result).toEqual([{ _id: '1', name: 'John' }])
  })

  it('should use the index attribute from the sort', async () => {
    const query = Q('io.cozy.todos')
      .where({})
      .sortBy([{ name: 'asc' }])
    await pouchQE.find(query)
    expect(getDocsAndNormalize).toHaveBeenCalledWith({
      client: pouchQE.client,
      db: pouchQE.db,
      doctype: pouchQE.doctype,
      queryFunc: 'find',
      queryParams: expect.objectContaining({
        sort: query.sort,
        indexedFields: ['name'],
        use_index: 'by_name'
      })
    })
  })

  it('should handle partialIndex', async () => {
    const query = Q('io.cozy.todos')
      .indexFields(['name'])
      .partialIndex({ name: { $exists: true } })
    await pouchQE.find(query)
    expect(getDocsAndNormalize).toHaveBeenCalledWith({
      client: pouchQE.client,
      db: pouchQE.db,
      doctype: pouchQE.doctype,
      queryFunc: 'find',
      queryParams: expect.objectContaining({
        partialFilter: { name: { $exists: true } },
        indexedFields: ['name'],
        use_index: 'by_name_filter_(name_$exists_true)'
      })
    })
  })

  it('should handle complex index name for partial filters ', async () => {
    const query = Q('io.cozy.todos')
      .indexFields(['name'])
      .partialIndex({
        $and: [{ name: { $exists: true } }, { date: { $gt: null } }],
        $or: [{ count: { $eq: '1' } }, { count: { $eq: '2' } }]
      })
    await pouchQE.find(query)
    expect(getDocsAndNormalize).toHaveBeenCalledWith({
      client: pouchQE.client,
      db: pouchQE.db,
      doctype: pouchQE.doctype,
      queryFunc: 'find',
      queryParams: expect.objectContaining({
        partialFilter: {
          $and: [{ name: { $exists: true } }, { date: { $gt: null } }],
          $or: [{ count: { $eq: '1' } }, { count: { $eq: '2' } }]
        },
        indexedFields: ['name'],
        use_index:
          'by_name_filter_((name_$exists_true)_$and_(date_$gt_null))_and_((count_$eq_1)_$or_(count_$eq_2))'
      })
    })
  })

  it('should create index and retry query if missing index error occurs', async () => {
    const options = {
      selector: { age: { $gt: 18 } },
      sort: [{ age: 'desc' }],
      indexedFields: ['age'],
      doctype: 'io.cozy.test'
    }

    const mockError = new Error('no index')

    getDocsAndNormalize
      .mockRejectedValueOnce(mockError)
      .mockResolvedValueOnce([{ _id: '2', age: 20 }])

    const result = await pouchQE.find(options)

    expect(createIndex).toHaveBeenCalledWith(pouchQE.db, ['age'], {
      indexName: 'by_age',
      doctype: 'io.cozy.test'
    })

    expect(getDocsAndNormalize).toHaveBeenCalledTimes(2)
    expect(result).toEqual([{ _id: '2', age: 20 }])
  })

  it('should throw error if non-index related error occurs', async () => {
    const options = { selector: { status: 'active' } }
    const mockError = new Error('generic error')

    getDocsAndNormalize.mockRejectedValue(mockError)

    await expect(pouchQE.find(options)).rejects.toThrow('generic error')

    expect(createIndex).not.toHaveBeenCalled()
  })
})
