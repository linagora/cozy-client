import documents, {
  extractAndMergeDocument,
  mergeDocumentsWithRelationships
} from './documents'

describe('extractAndMerge', () => {
  const data = [
    {
      _id: 'b6ff135b34e041ffb2d4a4865f3e0a53',
      _type: 'io.cozy.files',
      blabla: 'new field',
      cozyMetadata: {
        created_at: '123456',
        updatedByApps: {
          slug: 'drive'
        }
      }
    },
    {
      _id: 'b6ff135b34e041ffb2d4a4865f3e235f',
      _type: 'io.cozy.files',
      blibli: 'another new field'
    }
  ]
  const updatedStateWithIncluded = {
    'io.cozy.files': {
      b6ff135b34e041ffb2d4a4865f3e0a53: {
        _id: 'b6ff135b34e041ffb2d4a4865f3e0a53',
        _type: 'io.cozy.files',
        name: 'IMG_0016.PNG',
        type: 'file',
        dir_id: '7d2f9c24cd345ce3171bf71f401e80c6',
        links: { self: '/files/b6ff135b34e041ffb2d4a4865f3e0a53' },
        meta: { rev: '5-87840eceaab358e38aa8b6bb0d4577b1' },
        relationships: {
          parent: {
            links: { related: '/files/7d2f9c24cd345ce3171bf71f401e80c6' }
          }
        },
        cozyMetadata: {
          updated_at: '987654',
          updatedByApps: {
            date: '2019-06-11T01:02:03Z'
          }
        }
      },
      b6ff135b34e041ffb2d4a4865f3e235f: {
        _id: 'b6ff135b34e041ffb2d4a4865f3e235f',
        _type: 'io.cozy.files',
        type: 'file',
        name: 'IMG_0054.PNG',
        dir_id: '7d2f9c24cd345ce3171bf71f401e80c6',
        links: { self: '/files/b6ff135b34e041ffb2d4a4865f3e235f' },
        meta: { rev: '5-ca91c0dc02dafb38eb56070c1d80d62c' },
        relationships: {
          parent: {
            links: { related: '/files/7d2f9c24cd345ce3171bf71f401e80c6' }
          }
        }
      }
    }
  }

  it('should return the right data', () => {
    const returnedDatas = extractAndMergeDocument(
      data,
      updatedStateWithIncluded
    )

    const manuallyMergedData = {
      'io.cozy.files': {
        b6ff135b34e041ffb2d4a4865f3e0a53: {
          _id: 'b6ff135b34e041ffb2d4a4865f3e0a53',
          _type: 'io.cozy.files',
          dir_id: '7d2f9c24cd345ce3171bf71f401e80c6',
          name: 'IMG_0016.PNG',
          type: 'file',
          blabla: 'new field',
          cozyMetadata: {
            created_at: '123456',
            updated_at: '987654',
            updatedByApps: {
              slug: 'drive',
              date: '2019-06-11T01:02:03Z'
            }
          },
          links: { self: '/files/b6ff135b34e041ffb2d4a4865f3e0a53' },
          meta: { rev: '5-87840eceaab358e38aa8b6bb0d4577b1' },
          relationships: {
            parent: {
              links: { related: '/files/7d2f9c24cd345ce3171bf71f401e80c6' }
            }
          }
        },
        b6ff135b34e041ffb2d4a4865f3e235f: {
          _id: 'b6ff135b34e041ffb2d4a4865f3e235f',
          _type: 'io.cozy.files',
          dir_id: '7d2f9c24cd345ce3171bf71f401e80c6',
          name: 'IMG_0054.PNG',
          type: 'file',
          blibli: 'another new field',
          links: { self: '/files/b6ff135b34e041ffb2d4a4865f3e235f' },
          meta: { rev: '5-ca91c0dc02dafb38eb56070c1d80d62c' },
          relationships: {
            parent: {
              links: { related: '/files/7d2f9c24cd345ce3171bf71f401e80c6' }
            }
          }
        }
      }
    }
    expect(returnedDatas).toEqual(manuallyMergedData)
  })

  it('should select new value from data', () => {
    const returnedDatas = extractAndMergeDocument(
      // data
      [
        {
          _id: 'b6ff135b34e041ffb2d4a4865f3e235f',
          _type: 'io.cozy.files',
          blibli: 'new value'
        }
      ],
      // updatedStateWithIncluded
      {
        'io.cozy.files': {
          b6ff135b34e041ffb2d4a4865f3e235f: {
            _id: 'b6ff135b34e041ffb2d4a4865f3e235f',
            _type: 'io.cozy.files',
            blibli: 'old value'
          }
        }
      }
    )

    const manuallyMergedData = {
      'io.cozy.files': {
        b6ff135b34e041ffb2d4a4865f3e235f: {
          _id: 'b6ff135b34e041ffb2d4a4865f3e235f',
          _type: 'io.cozy.files',
          blibli: 'new value'
        }
      }
    }
    expect(returnedDatas).toEqual(manuallyMergedData)
  })

  it('should not concatenate arrays', () => {
    const returnedDatas = extractAndMergeDocument(
      // data
      [
        {
          _id: 'b6ff135b34e041ffb2d4a4865f3e235f',
          _type: 'io.cozy.files',
          blibli: 'a new field',
          tags: ['b']
        }
      ],
      // updatedStateWithIncluded
      {
        'io.cozy.files': {
          b6ff135b34e041ffb2d4a4865f3e235f: {
            _id: 'b6ff135b34e041ffb2d4a4865f3e235f',
            _type: 'io.cozy.files',
            blublu: 'another new field',
            tags: ['a']
          }
        }
      }
    )

    const manuallyMergedData = {
      'io.cozy.files': {
        b6ff135b34e041ffb2d4a4865f3e235f: {
          _id: 'b6ff135b34e041ffb2d4a4865f3e235f',
          _type: 'io.cozy.files',
          blibli: 'a new field',
          blublu: 'another new field',
          tags: ['b']
        }
      }
    }
    expect(returnedDatas).toEqual(manuallyMergedData)
  })

  it(
    'should assign a new object for doctype of document to update' +
      'in order to allow selector to recompute their data when documents are updated',
    () => {
      const returnedDatas = extractAndMergeDocument(
        data,
        updatedStateWithIncluded
      )

      // Then
      expect(
        returnedDatas['io.cozy.files'] ===
          updatedStateWithIncluded['io.cozy.files']
      ).toBeFalsy()
    }
  )
  it(
    'should assign a new object for doctype[id] of document to update' +
      'in order to allow selector to recompute their data when documents are updated',
    () => {
      const returnedDatas = extractAndMergeDocument(
        data,
        updatedStateWithIncluded
      )

      // Then
      expect(
        returnedDatas['io.cozy.files']['b6ff135b34e041ffb2d4a4865f3e0a53'] ===
          updatedStateWithIncluded['io.cozy.files'][
            'b6ff135b34e041ffb2d4a4865f3e0a53'
          ]
      ).toBeFalsy()
    }
  )
  it(
    'should assign a new object for doctype of document to update' +
      'even if the mergedData is the same, because reselect createSelector update ' +
      'according to object reference, not only value',
    () => {
      const dataAlreadyIncludedInUpdatedStateWithIncluded = [
        {
          _id: 'b6ff135b34e041ffb2d4a4865f3e0a53',
          _type: 'io.cozy.files'
        },
        {
          _id: 'b6ff135b34e041ffb2d4a4865f3e235f',
          _type: 'io.cozy.files'
        }
      ]

      const returnedDatas = extractAndMergeDocument(
        dataAlreadyIncludedInUpdatedStateWithIncluded,
        updatedStateWithIncluded
      )

      // Then
      expect(
        returnedDatas['io.cozy.files'] ===
          updatedStateWithIncluded['io.cozy.files']
      ).toBeFalsy()

      expect(returnedDatas['io.cozy.files']).toEqual(
        updatedStateWithIncluded['io.cozy.files']
      )
    }
  )
  it('should keep state reference in case no document has changed', () => {
    const newDoc = { ...data[0] }

    const mergedState = extractAndMergeDocument(
      [newDoc],
      updatedStateWithIncluded
    )
    expect(mergedState === updatedStateWithIncluded)
  })

  it('should have different state reference if a new document is added', () => {
    const newDoc = {
      _id: '1234',
      _type: 'io.cozy.files',
      name: 'New doc'
    }
    const mergedState = extractAndMergeDocument(
      [newDoc],
      updatedStateWithIncluded
    )
    expect(mergedState !== updatedStateWithIncluded)
  })

  it('should have different state reference if an existing document have changed', () => {
    const newDoc = {
      ...data[0],
      cozyMetadata: {
        ...data[0].cozyMetadata,
        updatedByApps: '2025-01-01'
      }
    }

    const mergedState = extractAndMergeDocument(
      [newDoc],
      updatedStateWithIncluded
    )
    expect(mergedState !== updatedStateWithIncluded)
  })
})

describe('mergeDocumentsWithRelationships', () => {
  it('should merge 2 documents', () => {
    const prev = {
      a: 1
    }
    const next = {
      a: 2,
      b: 3
    }
    const merged = mergeDocumentsWithRelationships(prev, next)
    expect(merged).toEqual({
      a: 2,
      b: 3
    })
    expect(merged.relationships).toBeUndefined()
  })

  it('should update relationships', () => {
    const prev = {
      relationships: {
        a: [1]
      }
    }
    const next = {
      relationships: {
        a: [2],
        b: [3]
      }
    }
    const merged = mergeDocumentsWithRelationships(prev, next)
    expect(merged).toEqual({
      relationships: {
        a: [2],
        b: [3]
      }
    })
  })

  it('should keep previously existing relationships', () => {
    // this is especially important for HasManyFiles relationships, where documents coming from the stack don't have the `relationships` property, because the relationship info is stored on the other side (on the io.cozy.files documents)
    const prev = {
      relationships: {
        a: [1]
      }
    }
    const next = {
      relationships: {}
    }
    const merged = mergeDocumentsWithRelationships(prev, next)
    expect(merged).toEqual({
      relationships: {
        a: [1]
      }
    })
  })
})

jest.mock('./mutations', () => {
  return {
    isReceivingMutationResult: jest.fn()
  }
})

import { isReceivingMutationResult } from './mutations'

describe('documents reducer - delete mutations', () => {
  const initialState = {
    'io.cozy.files': {
      1: { _id: '1', _type: 'io.cozy.files', name: 'File 1' },
      2: { _id: '2', _type: 'io.cozy.files', name: 'File 2' },
      3: { _id: '3', _type: 'io.cozy.files', name: 'File 3' }
    },
    'io.cozy.notes': {
      a: { _id: 'a', _type: 'io.cozy.notes', name: 'Note A' }
    }
  }

  beforeEach(() => {
    /** @type {jest.Mock} */ isReceivingMutationResult.mockReturnValue(true)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should delete a document with DELETE_DOCUMENT', () => {
    const action = {
      definition: {
        mutationType: 'DELETE_DOCUMENT',
        document: { _id: '2', _type: 'io.cozy.files' }
      },
      response: {}
    }
    const newState = documents(initialState, action)
    expect(newState['io.cozy.files']).not.toHaveProperty('2')
    expect(newState['io.cozy.files']).toHaveProperty('1')
    expect(newState['io.cozy.files']).toHaveProperty('3')
    expect(newState['io.cozy.notes']).toHaveProperty('a')
  })

  it('should delete multiple documents with DELETE_DOCUMENTS', () => {
    const action = {
      definition: {
        mutationType: 'DELETE_DOCUMENTS',
        documents: [
          { _id: '1', _type: 'io.cozy.files' },
          { _id: '3', _type: 'io.cozy.files' }
        ]
      },
      response: {}
    }
    const newState = documents(initialState, action)
    expect(newState['io.cozy.files']).not.toHaveProperty('1')
    expect(newState['io.cozy.files']).not.toHaveProperty('3')
    expect(newState['io.cozy.files']).toHaveProperty('2')
    expect(newState['io.cozy.notes']).toHaveProperty('a')
  })
})
