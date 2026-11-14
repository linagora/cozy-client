import { equalityCheckForQuery } from './selector'

const mapIdsToDocuments = (state, doctype, ids) => {
  return ids.map(id => state[doctype][id])
}

const state = {
  documents: {
    'io.cozy.files': {
      doc1: {
        _id: 'doc1'
      },
      doc2: {
        _id: 'doc2'
      },
      doc3: {
        _id: 'doc3'
      }
    }
  },
  queries: {
    query1: {
      id: 'query1',
      data: ['doc1', 'doc2']
    },
    query2: {
      id: 'query2',
      data: ['doc2']
    }
  }
}

const defaultQueryResult = {
  id: 1,
  data: [],
  fetchStatus: 'loaded',
  relationshipNames: null
}

describe('equalityCheckForQuery', () => {
  it('ignores background activity when the documents and fetch status are unchanged', () => {
    const loaded = { ...defaultQueryResult, storeData: [], isFetching: false }
    const refreshing = { ...loaded, isFetching: true }
    expect(equalityCheckForQuery(loaded, refreshing)).toBe(true)
    expect(equalityCheckForQuery(refreshing, loaded)).toBe(true)
  })

  const queryResultA1 = {
    id: 1,
    storeData: mapIdsToDocuments(state.documents, 'io.cozy.files', [
      'doc1',
      'doc2'
    ]),
    ...defaultQueryResult
  }
  const queryResultA2 = {
    id: 1,
    storeData: mapIdsToDocuments(state.documents, 'io.cozy.files', [
      'doc1',
      'doc2'
    ]),
    ...defaultQueryResult
  }
  const queryResultA3 = {
    id: 1,
    storeData: mapIdsToDocuments(state.documents, 'io.cozy.files', [
      'doc1',
      'doc2',
      'doc3'
    ]),
    ...defaultQueryResult
  }
  const queryResultA4 = {
    id: 1,
    storeData: mapIdsToDocuments(state.documents, 'io.cozy.files', [
      'doc2',
      'doc3'
    ]),
    ...defaultQueryResult
  }
  const queryResultB1 = {
    id: 2,
    storeData: mapIdsToDocuments(state.documents, 'io.cozy.files', ['doc2']),
    ...defaultQueryResult
  }

  const queryResultB2 = {
    id: 2,
    storeData: mapIdsToDocuments(state.documents, 'io.cozy.files', ['doc3']),
    ...defaultQueryResult
  }

  const queryResultC1 = {
    id: 3,
    storeData: state.documents['io.cozy.files'].doc1,
    data: {},
    ...defaultQueryResult
  }

  const queryResultC2 = {
    id: 3,
    storeData: state.documents['io.cozy.files'].doc1,
    data: {},
    ...defaultQueryResult
  }

  const queryResultC3 = {
    id: 3,
    storeData: state.documents['io.cozy.files'].doc2,
    data: {},
    ...defaultQueryResult
  }

  it('should return true for referential equality', () => {
    expect(equalityCheckForQuery(queryResultA1, queryResultA1)).toBe(true)
    expect(equalityCheckForQuery(null, null)).toBe(true)
  })

  it('should return false if one object is null', () => {
    expect(equalityCheckForQuery(null, queryResultA1)).toBe(false)
    expect(equalityCheckForQuery(queryResultA1, null)).toBe(false)
  })

  it('should return false if one or both objects are not objects', () => {
    // @ts-ignore
    expect(equalityCheckForQuery('notAnObject', queryResultA1)).toBe(false)
    // @ts-ignore
    expect(equalityCheckForQuery(queryResultA1, 'notAnObject')).toBe(false)
  })

  it('should return false if `id` properties are different', () => {
    expect(equalityCheckForQuery(queryResultA1, queryResultB1)).toBe(false)
  })

  it('should return false if one or both objects lack `data`', () => {
    // @ts-ignore
    expect(equalityCheckForQuery({ id: 1 }, queryResultA1)).toBe(false)
    // @ts-ignore
    expect(equalityCheckForQuery(queryResultA1, { id: 1 })).toBe(false)
  })

  it('should return false if `data` lengths are different', () => {
    expect(equalityCheckForQuery(queryResultA1, queryResultA3)).toBe(false)
  })

  it('should return false if elements in `data` are different', () => {
    expect(equalityCheckForQuery(queryResultA1, queryResultA3)).toBe(false)
    expect(equalityCheckForQuery(queryResultA3, queryResultA4)).toBe(false)
    expect(equalityCheckForQuery(queryResultB1, queryResultB2)).toBe(false)
  })

  it('should return true for matching data array, with equal references ', () => {
    expect(equalityCheckForQuery(queryResultA1, queryResultA2)).toBe(true)
  })

  it('should return false for matching data array, with different references ', () => {
    const queryResShallowCopyA1 = {
      ...queryResultA1,
      storeData: JSON.parse(JSON.stringify(queryResultA1.storeData)) // Deep copy
    }
    expect(equalityCheckForQuery(queryResultA1, queryResShallowCopyA1)).toBe(
      false
    )
  })

  it('should return true for matching object data', () => {
    expect(equalityCheckForQuery(queryResultC1, queryResultC2)).toBe(true)
  })
  it('should return false for different object data', () => {
    expect(equalityCheckForQuery(queryResultC1, queryResultC3)).toBe(false)
  })
})

describe('equalityCheckForQuery with relationships', () => {
  const queryResA = {
    ...defaultQueryResult,
    relationshipNames: ['relation1'],
    storeData: mapIdsToDocuments(state.documents, 'io.cozy.files', [
      'doc1',
      'doc2'
    ]),
    data: [{ relation1: { _rev: 'rev1' } }]
  }

  const queryResB = {
    ...defaultQueryResult,
    relationshipNames: ['relation1'],
    storeData: mapIdsToDocuments(state.documents, 'io.cozy.files', [
      'doc1',
      'doc2'
    ]),
    data: [{ relation1: { _rev: 'rev2' } }]
  }

  const queryResC = {
    ...defaultQueryResult,
    relationshipNames: ['relation1'],
    storeData: mapIdsToDocuments(state.documents, 'io.cozy.files', [
      'doc1',
      'doc2'
    ]),
    data: [{ relation1: { _rev: 'rev1' } }, { relation1: { _rev: 'rev2' } }]
  }

  const queryResD = {
    ...defaultQueryResult,
    relationshipNames: ['relation1', 'relation2'],
    storeData: mapIdsToDocuments(state.documents, 'io.cozy.files', [
      'doc1',
      'doc2'
    ]),
    data: [{ relation1: { _rev: 'rev1' } }, { relation2: { _rev: 'rev2' } }]
  }

  const queryResE = {
    ...defaultQueryResult,
    relationshipNames: ['relation1'],
    storeData: mapIdsToDocuments(state.documents, 'io.cozy.files', ['doc1']),
    data: [{ relation1: { _id: '123' } }]
  }

  const queryResF = {
    ...defaultQueryResult,
    relationshipNames: ['relation1'],
    storeData: mapIdsToDocuments(state.documents, 'io.cozy.files', ['doc1']),
    data: [{ relation1: { _id: '123' } }]
  }

  it('returns true when data and relationship revisions match', () => {
    expect(equalityCheckForQuery(queryResA, queryResA)).toBe(true)
    expect(equalityCheckForQuery(queryResD, queryResD)).toBe(true)
  })

  it('returns false when relationship revisions differ', () => {
    expect(equalityCheckForQuery(queryResA, queryResB)).toBe(false)
  })

  it('returns false when relationship revisions are missing', () => {
    expect(equalityCheckForQuery(queryResE, queryResF)).toBe(false)
  })

  it('returns false when data lengths differ', () => {
    expect(equalityCheckForQuery(queryResA, queryResC)).toBe(false)
  })
})
