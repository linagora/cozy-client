import { defaultPerformanceApi } from '../performances/defaultPerformanceApi'
import queries, {
  initQuery,
  receiveQueryResult,
  convert$gtNullSelectors,
  makeSorterFromDefinition,
  mergeSelectorAndPartialIndex,
  sortAndLimitDocsIds,
  loadQuery,
  receiveQueryError,
  updateData,
  computeMatchPartition,
  executeQueryFromState,
  mapIdsToDocuments
} from './queries'
import { Q } from '../queries/dsl'
import { TODO_1, TODO_2, TODO_3 } from '../__tests__/fixtures'

describe('queries reducer', () => {
  let state
  const response = {
    data: [TODO_1, TODO_2]
  }
  const applyAction = action => {
    state = queries(defaultPerformanceApi, state, action)
  }
  beforeEach(() => {
    state = {}
    jest.spyOn(Date, 'now').mockReturnValue(1337)
  })
  afterEach(() => {
    Date.now.mockRestore()
  })

  describe('INIT_QUERY', () => {
    it('should init correctly', () => {
      const qdef = Q('io.cozy.todos')
      applyAction(initQuery('a', qdef))
      expect(state).toMatchSnapshot()
    })

    test('init should have no effect after receiveQueryResult', () => {
      const qdef = Q('io.cozy.todos')
      applyAction(initQuery('a', qdef))
      applyAction(receiveQueryResult('a', response))
      let state1 = state
      applyAction(initQuery('a', qdef))
      expect(state1).toBe(state)
    })

    test('init should not set status to loading after receiveQueryResult', () => {
      const qdef = Q('io.cozy.todos')
      applyAction(initQuery('a', qdef))
      applyAction(receiveQueryResult('a', response))
      applyAction(initQuery('a', qdef))
      expect(state.a.fetchStatus).toBe('loaded')
    })
  })

  describe('LOAD_QUERY', () => {
    it('should set isFetching to true and not changing fetchStatus when query has been loaded and background fetching activated', () => {
      // Given
      const queryDefinition = Q('io.cozy.todos')
      applyAction(initQuery('a', queryDefinition))
      applyAction(receiveQueryResult('a', response))
      expect(state.a.fetchStatus).toBe('loaded')

      // When
      applyAction(loadQuery('a', { backgroundFetching: true }))

      // Then
      expect(state.a.fetchStatus).toBe('loaded')
      expect(state.a.isFetching).toBe(true)
    })

    it('should not set isFetching and keep changing fetchStatus when query has been loaded and background fetching deactivated', () => {
      // Given
      const queryDefinition = Q('io.cozy.todos')
      applyAction(initQuery('a', queryDefinition))
      applyAction(receiveQueryResult('a', response))
      expect(state.a.fetchStatus).toBe('loaded')

      // When
      applyAction(loadQuery('a'))

      // Then
      expect(state.a.fetchStatus).toBe('loading')
      expect(state.a.isFetching).toBe(null)
    })
  })

  describe('RECEIVE_QUERY_RESULT', () => {
    it('should set isFetching to false when query has been re-fetched correctly and background fetching activated', () => {
      // Given
      const queryDefinition = Q('io.cozy.todos')
      applyAction(initQuery('a', queryDefinition))

      // When
      applyAction(
        receiveQueryResult('a', response, { backgroundFetching: true })
      )

      // Then
      expect(state.a.isFetching).toBe(false)
    })

    it('should set isFetching to false when query has been re-fetched correctly and background fetching deactivated', () => {
      // Given
      const queryDefinition = Q('io.cozy.todos')
      applyAction(initQuery('a', queryDefinition))

      // When
      applyAction(receiveQueryResult('a', response))

      // Then
      expect(state.a.isFetching).toBe(null)
    })

    it('should override the previous result if the querie is refetched when backgroundFetching is enabled', () => {
      // Given
      const queryDefinition = Q('io.cozy.todos')
      applyAction(initQuery('a', queryDefinition))

      // When
      applyAction(
        receiveQueryResult('a', {
          data: [TODO_1, TODO_2]
        })
      )
      // Then
      expect(state.a.data).toEqual([TODO_1._id, TODO_2._id])

      applyAction(
        receiveQueryResult(
          'a',
          {
            data: [TODO_1]
          },
          { backgroundFetching: true }
        )
      )

      expect(state.a.data).toEqual([TODO_1._id])
    })

    it('should replace the previous result for a full snapshot query', () => {
      const recipient1 = {
        _id: 'file-1/recipient-1',
        _type: 'io.cozy.sharings.recipients'
      }
      const recipient2 = {
        _id: 'file-1/recipient-2',
        _type: 'io.cozy.sharings.recipients'
      }
      const queryDefinition = Q(
        'io.cozy.sharings.recipients'
      ).effectiveRecipients('file-1')
      applyAction(initQuery('recipients', queryDefinition))

      applyAction(
        receiveQueryResult('recipients', {
          data: [recipient1, recipient2]
        })
      )
      applyAction(
        receiveQueryResult('recipients', {
          data: [recipient1]
        })
      )

      expect(state.recipients.data).toEqual([recipient1._id])
      expect(state.recipients.count).toBe(1)
      expect(state.recipients.hasMore).toBe(false)
    })
  })

  describe('RECEIVE_QUERY_ERROR', () => {
    it('should set isFetching to false when query is in error and background fetching activated', () => {
      // Given
      const queryDefinition = Q('io.cozy.todos')
      applyAction(initQuery('a', queryDefinition))
      const error = {}

      // When
      applyAction(receiveQueryError('a', error, { backgroundFetching: true }))

      // Then
      expect(state.a.isFetching).toBe(false)
    })
    it('should not set isFetching when query is in error and background fetching deactivated', () => {
      // Given
      const queryDefinition = Q('io.cozy.todos')
      applyAction(initQuery('a', queryDefinition))
      const error = {}

      // When
      applyAction(receiveQueryError('a', error))

      // Then
      expect(state.a.isFetching).toBe(null)
    })
  })

  describe('updates', () => {
    beforeEach(() => {
      applyAction(initQuery('a', Q('io.cozy.todos')))
    })

    it('should correctly update', () => {
      applyAction(
        receiveQueryResult('a', {
          data: [TODO_1, TODO_2]
        })
      )
      expect(state).toMatchSnapshot()
      expect(state['a'].data).toEqual([TODO_1._id, TODO_2._id])
      applyAction(
        receiveQueryResult('a', {
          data: [TODO_1, TODO_2]
        })
      )
      expect(state['a'].data).toEqual([TODO_1._id, TODO_2._id])
    })

    it('should correctly update two queries', () => {
      applyAction(initQuery('b', Q('io.cozy.todos')))
      applyAction(
        receiveQueryResult('a', {
          data: [TODO_1, TODO_2]
        })
      )
      expect(state).toMatchSnapshot()
    })

    it('should correctly update a query with a selector', () => {
      const query = Q('io.cozy.todos')
      applyAction(initQuery('b', query.where({ done: true })))
      applyAction(
        receiveQueryResult('a', {
          data: [TODO_3]
        })
      )
      expect(state).toMatchSnapshot()
    })
    it('should update a query with a partiel index', () => {
      applyAction(initQuery('a', Q('io.cozy.todos')))
      applyAction(
        initQuery(
          'b',
          Q('io.cozy.todos').partialIndex({
            done: false
          })
        )
      )
      applyAction(
        receiveQueryResult('a', {
          data: [TODO_1, TODO_2, TODO_3]
        })
      )
      expect(state).toMatchSnapshot()
    })
    it('should correctly update a sorted query with a deleted document', () => {
      const query = Q('io.cozy.todos')
      applyAction(
        initQuery(
          'a',
          query
            .indexFields(['date'])
            .sortBy([{ date: 'asc' }])
            .where({ done: false })
        )
      )
      applyAction(initQuery('b', query.where({ done: true })))
      applyAction(
        receiveQueryResult('a', {
          data: [{ ...TODO_3, _deleted: true }]
        })
      )
      expect(state).toMatchSnapshot()
    })

    it('should correctly update a query with several ids', () => {
      const query = Q('io.cozy.todos')
      applyAction(initQuery('b', query.getByIds([TODO_1._id, TODO_2._id])))
      applyAction(
        receiveQueryResult('b', {
          data: [TODO_1, TODO_2]
        })
      )
      expect(state.b.data).toEqual([TODO_1._id, TODO_2._id])
      applyAction(
        receiveQueryResult('a', {
          data: [TODO_3]
        })
      )
      expect(state.b.data).toEqual([TODO_1._id, TODO_2._id]) // TODO_3 does not appear in the results of query b, because it is not part of the specified ids
    })

    it('should correctly update a query with a $gt: null selector', () => {
      const query = Q('io.cozy.todos')
      applyAction(
        initQuery(
          'b',
          query.where({
            done: true,
            _id: {
              $gt: null
            }
          })
        )
      )
      applyAction(
        receiveQueryResult('a', {
          data: [TODO_3]
        })
      )
      expect(state).toMatchSnapshot()
    })

    it('should not update a query not concerned even with a selector', () => {
      const query = Q('io.cozy.todos')
      applyAction(initQuery('b', query.where({ done: false })))
      applyAction(
        receiveQueryResult('a', {
          data: [TODO_3]
        })
      )
      expect(state).toMatchSnapshot()
    })

    it('should not add documents to another query if autoUpdate.add was set to false', () => {
      const query = Q('io.cozy.todos')
      applyAction(
        initQuery('b', query.where({ done: true }), {
          autoUpdate: { add: false }
        })
      )
      applyAction(
        receiveQueryResult('a', {
          data: [TODO_3]
        })
      )
      expect(state.b.data.length).toBe(0)
      expect(state).toMatchSnapshot()
    })

    it('should not remove documents from another query if autoUpdate.remove was set to false', () => {
      const query = Q('io.cozy.todos')
      applyAction(
        initQuery('b', query.where({ done: true }), {
          autoUpdate: { remove: false }
        })
      )
      applyAction(
        receiveQueryResult('a', {
          data: [TODO_3]
        })
      )
      applyAction(
        receiveQueryResult('a', {
          data: [{ ...TODO_3, done: false }]
        })
      )
      expect(state.b.data.length).toBe(1)
      expect(state).toMatchSnapshot()
    })

    it('should not crash if data is null', () => {
      const query = Q('io.cozy.todos').getById('not-existing-doc')
      applyAction(initQuery('b', query))
      applyAction(
        receiveQueryResult('b', {
          data: null
        })
      )
      expect(state).toMatchSnapshot()
    })

    it('should only update queries with the right id selector', () => {
      const query = Q('io.cozy.todos').getById(TODO_3._id)
      applyAction(initQuery('b', query))
      applyAction(
        receiveQueryResult('a', {
          data: [TODO_2]
        })
      )
      expect(state.b.lastUpdate).toBe(null)
      applyAction(
        receiveQueryResult('a', {
          data: [TODO_3]
        })
      )
      expect(state.b.lastUpdate).not.toBe(null)
    })
  })
})

describe('selectors', () => {
  it('should convert $gt selectors when their value is null', () => {
    const selector = {
      somefield: 'somevalue',
      convertMe: {
        $gt: null
      },
      nested: {
        convertMeToo: {
          $gt: null
        }
      },
      notNull: {
        $gt: 2
      }
    }
    const converted = convert$gtNullSelectors(selector)
    expect(converted).toEqual({
      somefield: 'somevalue',
      convertMe: {
        $gtnull: null
      },
      nested: {
        convertMeToo: {
          $gtnull: null
        }
      },
      notNull: {
        $gt: 2
      }
    })
  })
})

describe('makeSorterFromDefinition', () => {
  it('should make a sort function from a definition', () => {
    const q = Q('io.cozy.files').sortBy([{ name: 'desc' }, { label: 'asc' }])

    const sorter = makeSorterFromDefinition(q)
    const files = [
      { _id: '1', name: 1, label: 'C' },
      { _id: '2', name: 2, label: 'B' },
      { _id: '3', name: 3, label: 'C' },
      { _id: '4', name: 3, label: 'A' },
      { _id: '5', name: 3, label: 'a' }
    ]
    const sorted = sorter(files)
    expect(sorted.map(x => x._id)).toEqual(['4', '5', '3', '2', '1'])
  })

  it('should handle objects with deep properties', () => {
    const q = Q('io.cozy.files').sortBy([{ 'name.label': 'asc' }])
    const sorter = makeSorterFromDefinition(q)
    const files = [
      { name: { label: 'C' } },
      { name: { label: 'B' } },
      { name: { label: 'a' } },
      { name: { label: 'A' } },
      { name: { label: 'b' } }
    ]
    const sorted = sorter(files)
    expect(sorted.map(x => x.name.label)).toEqual(['a', 'A', 'B', 'b', 'C'])
  })
})

describe('mergeSelectorAndPartialIndex', () => {
  it('should return a selector even if no partial index', () => {
    const query = Q('io.cozy.files').where({
      _id: {
        $gt: null
      }
    })

    const result = {
      _id: { $gt: null }
    }

    expect(mergeSelectorAndPartialIndex(query)).toMatchObject(result)
  })

  it('should return a selector with partial index', () => {
    const query = Q('io.cozy.files')
      .where({
        _id: {
          $gt: null
        }
      })
      .partialIndex({
        specificAttributes: {
          $exists: false
        }
      })

    const result = {
      _id: { $gt: null },
      specificAttributes: { $exists: false }
    }

    expect(mergeSelectorAndPartialIndex(query)).toMatchObject(result)
  })

  it('should return a selector even if only partial index', () => {
    const query = Q('io.cozy.files').partialIndex({
      specificAttributes: {
        $exists: false
      }
    })

    const result = {
      specificAttributes: {
        $exists: false
      }
    }

    expect(mergeSelectorAndPartialIndex(query)).toMatchObject(result)
  })
})

describe('sortAndLimitDocsIds', () => {
  const docs = {
    'io.cozy.files': {
      doc1: {
        _id: 'doc1',
        name: 'toto'
      },
      doc2: {
        _id: 'doc2',
        name: 'tata'
      },
      doc3: {
        _id: 'doc3',
        name: 'tutu'
      },
      doc4: {
        _id: 'doc4',
        name: 'tutu'
      }
    }
  }
  it('should return ids as is, when no sort', () => {
    const query = Q('io.cozy.files')
    const ids = sortAndLimitDocsIds(
      { definition: query.toDefinition() },
      docs,
      ['doc1', 'doc2', 'doc3'],
      {
        count: 0,
        fetchedPagesCount: 0
      }
    )
    expect(ids).toEqual(['doc1', 'doc2', 'doc3'])
  })
  it('should return ids as is, when no documents in the documents slice', () => {
    const query = Q('io.cozy.files').sortBy([{ name: 'asc' }])

    const ids = sortAndLimitDocsIds(
      { definition: query.toDefinition() },
      null,
      ['doc1', 'doc2', 'doc3'],
      {
        count: 0,
        fetchedPagesCount: 0
      }
    )
    expect(ids).toEqual(['doc1', 'doc2', 'doc3'])
  })
  it('should return sorted ids', () => {
    const query = Q('io.cozy.files').sortBy([{ name: 'asc' }])

    const ids = sortAndLimitDocsIds(
      { definition: query.toDefinition() },
      docs,
      ['doc1', 'doc2', 'doc3'],
      {
        count: 3,
        fetchedPagesCount: 1
      }
    )
    expect(ids).toEqual(['doc2', 'doc1', 'doc3'])
  })
  it('should return sorted ids, accordingly to limitBy', () => {
    const query1 = Q('io.cozy.files')
      .sortBy([{ name: 'asc' }])
      .limitBy(2)

    const ids1 = sortAndLimitDocsIds(
      { definition: query1.toDefinition() },
      docs,
      ['doc1', 'doc2', 'doc3'],
      {
        count: 2,
        fetchedPagesCount: 1
      }
    )
    expect(ids1).toEqual(['doc2', 'doc1'])

    const query2 = Q('io.cozy.files')
      .sortBy([{ name: 'asc' }])
      .limitBy(1)

    const ids2 = sortAndLimitDocsIds(
      { definition: query2.toDefinition() },
      docs,
      ['doc1', 'doc2', 'doc3'],
      {
        count: 1,
        fetchedPagesCount: 2
      }
    )
    expect(ids2).toEqual(['doc2', 'doc1'])
  })

  it('should correctly handle count inferior to limit', () => {
    const query1 = Q('io.cozy.files')
      .sortBy([{ name: 'asc' }])
      .limitBy(2)

    const ids1 = sortAndLimitDocsIds(
      { definition: query1.toDefinition() },
      docs,
      ['doc1', 'doc2'],
      {
        count: 1,
        fetchedPagesCount: 1
      }
    )
    expect(ids1.length).toEqual(1)

    const query2 = Q('io.cozy.files')
      .sortBy([{ name: 'asc' }])
      .limitBy(2)

    const ids2 = sortAndLimitDocsIds(
      { definition: query2.toDefinition() },
      docs,
      ['doc1', 'doc2', 'doc3'],
      {
        count: 1,
        fetchedPagesCount: 2
      }
    )
    expect(ids2.length).toEqual(3)
  })
})

describe('updateData', () => {
  it('should update correctly the data after a create mutation', () => {
    const queryState = {
      definition: {
        doctype: 'io.cozy.files',
        selector: {
          dir_id: 'd6fa040d335c5f49e8c4b674a001849a',
          type: 'file',
          name: {
            $gt: null
          },
          _id: {
            $ne: 'io.cozy.files.trash-dir'
          }
        },
        sort: [
          {
            dir_id: 'asc'
          }
        ],
        limit: 100
      }
    }

    const createdDocument = {
      id: 'd6fa040d335c5f49e8c4b674a00216d2',
      _type: 'io.cozy.files',
      type: 'file',
      _id: 'd6fa040d335c5f49e8c4b674a00216d2',
      _rev: '1-b8663df3d2a468171ceaccc7049421ba',
      name: 'cozy.url',
      dir_id: 'd6fa040d335c5f49e8c4b674a001849a',
      created_at: '2022-09-01T10:39:01.759905+02:00',
      updated_at: '2022-09-01T10:39:01.759905+02:00'
    }
    const newData = [createdDocument]

    const documents = {
      'io.cozy.files': {
        d6fa040d335c5f49e8c4b674a001849a: {
          id: 'd6fa040d335c5f49e8c4b674a001849a',
          _id: 'd6fa040d335c5f49e8c4b674a001849a',
          _type: 'io.cozy.files',
          type: 'directory',
          attributes: {
            type: 'directory',
            name: 'test',
            dir_id: 'io.cozy.files.root-dir',
            created_at: '2022-08-31T13:07:19.976349+02:00',
            updated_at: '2022-08-31T13:07:19.976349+02:00',
            path: '/test'
          },
          name: 'test',
          dir_id: 'io.cozy.files.root-dir'
        },
        [createdDocument.id]: {
          ...createdDocument
        }
      }
    }
    const updatedDataToCheck = updateData(queryState, newData, documents)
    expect(updatedDataToCheck.data.length).toEqual(1)
    expect(updatedDataToCheck.count).toEqual(1)
  })
})

describe('computeMatchPartition', () => {
  it('should resolve a getById query without scanning the whole newData', () => {
    const newData = [TODO_1, TODO_2, TODO_3]
    const definition = Q('io.cozy.todos').getById(TODO_2._id)
    const { matchedIds, unmatchedIds } = computeMatchPartition(
      definition,
      newData
    )
    expect(matchedIds).toEqual([TODO_2._id])
    expect(unmatchedIds).toEqual([])
  })

  it('should not match a getById query for a missing or wrong-doctype id', () => {
    const newData = [TODO_1, { ...TODO_2, _type: 'io.cozy.other' }]
    expect(
      computeMatchPartition(Q('io.cozy.todos').getById('missing'), newData)
    ).toEqual({ matchedIds: [], unmatchedIds: [] })
    expect(
      computeMatchPartition(Q('io.cozy.todos').getById(TODO_2._id), newData)
    ).toEqual({ matchedIds: [], unmatchedIds: [TODO_2._id] })
  })

  it('should treat a deleted document as unmatched for a getById query', () => {
    const newData = [{ ...TODO_1, _deleted: true }]
    expect(
      computeMatchPartition(Q('io.cozy.todos').getById(TODO_1._id), newData)
    ).toEqual({ matchedIds: [], unmatchedIds: [TODO_1._id] })
  })

  it('should resolve a getByIds query', () => {
    const newData = [TODO_1, TODO_2, TODO_3]
    const definition = Q('io.cozy.todos').getByIds([TODO_1._id, 'missing'])
    expect(computeMatchPartition(definition, newData)).toEqual({
      matchedIds: [TODO_1._id],
      unmatchedIds: []
    })
  })

  it('should partition a selector query with the sift scan', () => {
    const newData = [TODO_1, TODO_2, TODO_3]
    const definition = Q('io.cozy.todos').where({ done: true })
    const { matchedIds, unmatchedIds } = computeMatchPartition(
      definition,
      newData
    )
    expect(matchedIds).toEqual([TODO_3._id])
    expect(unmatchedIds.sort()).toEqual([TODO_1._id, TODO_2._id].sort())
  })

  it('should memoize the partition per definition within the same newData', () => {
    const newData = [TODO_1, TODO_2]
    const definition = Q('io.cozy.todos').getById(TODO_1._id)
    const first = computeMatchPartition(definition, newData)
    const second = computeMatchPartition(definition, newData)
    expect(second).toBe(first)
  })
})

describe('execute query from state', () => {
  const docState = {
    'io.cozy.files': {
      '123': {
        _id: '123',
        _type: 'io.cozy.files',
        name: 'well',
        created_at: '2024-01-01'
      },
      '456': {
        _id: '456',
        _type: 'io.cozy.files',
        name: 'hello',
        created_at: '2024-02-01'
      },
      '789': {
        _id: '789',
        _type: 'io.cozy.files',
        name: 'there',
        created_at: '2024-03-01'
      }
    }
  }
  const state = {
    cozy: {
      documents: {
        ...docState
      },
      queries: {}
    }
  }

  it('should get the correct filtered results from state thanks to selector', () => {
    const query1 = {
      doctype: 'io.cozy.files',
      selector: {
        created_at: {
          $gt: '2024-01-31'
        }
      }
    }
    const res1 = executeQueryFromState(state, query1)
    expect(res1.data.length).toEqual(2)
    expect(res1.data[0]).toEqual(docState['io.cozy.files']['456'])
    expect(res1.data[1]).toEqual(docState['io.cozy.files']['789'])

    const query2 = {
      doctype: 'io.cozy.files',
      selector: {
        name: 'well'
      }
    }
    const res2 = executeQueryFromState(state, query2)
    expect(res2.data.length).toEqual(1)
    expect(res2.data[0]).toEqual(docState['io.cozy.files']['123'])

    const query3 = {
      doctype: 'io.cozy.files',
      selector: {
        created_at: {
          $gt: '2024-01-31'
        },
        name: 'hello'
      }
    }
    const res3 = executeQueryFromState(state, query3)
    expect(res3.data.length).toEqual(1)
    expect(res3.data[0]).toEqual(docState['io.cozy.files']['456'])

    const query4 = {
      doctype: 'io.cozy.files',
      selector: {
        created_at: {
          $gt: '2024-01-30',
          $lt: '2024-01-31'
        }
      }
    }
    const res4 = executeQueryFromState(state, query4)
    expect(res4.data.length).toEqual(0)
  })

  it('should get the correct filtered results from state thanks to id', () => {
    const query1 = {
      doctype: 'io.cozy.files',
      id: '123'
    }
    const res1 = executeQueryFromState(state, query1)
    expect(res1.data).toEqual(docState['io.cozy.files']['123'])

    const query2 = {
      doctype: 'io.cozy.files',
      ids: ['123', '789']
    }
    const res2 = executeQueryFromState(state, query2)
    expect(res2.data.length).toEqual(2)
    expect(res2.data[0]).toEqual(docState['io.cozy.files']['123'])
    expect(res2.data[1]).toEqual(docState['io.cozy.files']['789'])

    const query3 = {
      doctype: 'io.cozy.files',
      id: '-1'
    }
    const res3 = executeQueryFromState(state, query3)
    expect(res3.data).toEqual(null)

    const query4 = {
      doctype: 'io.cozy.files',
      ids: ['-1', '123']
    }
    const res4 = executeQueryFromState(state, query4)
    expect(res4.data[0]).toEqual(docState['io.cozy.files']['123'])
  })

  it('should get all the docs from state for the doctype when no filter', () => {
    const query1 = {
      doctype: 'io.cozy.files'
    }
    const res1 = executeQueryFromState(state, query1)
    expect(res1.data.length).toEqual(3)
  })

  it('should correctly return when no doc is available', () => {
    const res1 = executeQueryFromState({}, { doctype: 'io.cozy.files' })
    expect(res1.data).toEqual([])

    const res2 = executeQueryFromState(
      {},
      { doctype: 'io.cozy.files', id: '123' }
    )
    expect(res2.data).toEqual(null)
  })

  it('should get all the docs from state for the doctype and sort result', () => {
    const query1 = {
      doctype: 'io.cozy.files',
      sort: [{ created_at: 'asc' }]
    }

    const res1 = executeQueryFromState(state, query1)
    expect(res1.data[0]._id).toEqual('123')
    expect(res1.data[1]._id).toEqual('456')
    expect(res1.data[2]._id).toEqual('789')

    const query2 = {
      doctype: 'io.cozy.files',
      sort: [{ created_at: 'desc' }]
    }

    const res2 = executeQueryFromState(state, query2)
    expect(res2.data[0]._id).toEqual('789')
    expect(res2.data[1]._id).toEqual('456')
    expect(res2.data[2]._id).toEqual('123')
  })
})

describe('mapIdsToDocuments', () => {
  const documents = {
    'io.cozy.files': {
      '123': { _id: '123', _type: 'io.cozy.files' },
      '456': { _id: '456', _type: 'io.cozy.files' },
      '789': { _id: '789', _type: 'io.cozy.files' }
    }
  }

  it('should return the correct docs', () => {
    const ids = ['123', '789']
    const res = mapIdsToDocuments(documents, 'io.cozy.files', ids)
    expect(res).toEqual([
      { _id: '123', _type: 'io.cozy.files' },
      { _id: '789', _type: 'io.cozy.files' }
    ])
  })

  it('should not return missing docs', () => {
    const ids = ['123', 'ghostid']
    const res = mapIdsToDocuments(documents, 'io.cozy.files', ids)
    expect(res).toEqual([{ _id: '123', _type: 'io.cozy.files' }])
  })
})
