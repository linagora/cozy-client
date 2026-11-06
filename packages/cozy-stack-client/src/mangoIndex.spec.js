import {
  isMatchingIndex,
  getIndexFields,
  getIndexNameFromFields,
  makeOperatorsExplicit
} from './mangoIndex'

const buildDesignDoc = (fields, { partialFilter, id } = {}) => {
  return {
    _id: id,
    views: {
      123: {
        map: {
          fields,
          partial_filter_selector: partialFilter
        }
      }
    }
  }
}

describe('matching index', () => {
  it('should match index with same fields', () => {
    const matchingIndex = buildDesignDoc({
      foo: 'asc',
      bar: 'asc'
    })
    expect(isMatchingIndex(matchingIndex, ['foo', 'bar'])).toEqual(true)
  })

  it('should not match index with different fields', () => {
    const nonMatchingIndex1 = buildDesignDoc({ baz: 'asc' })
    const nonMatchingIndex2 = buildDesignDoc({
      bar: 'asc',
      foo: 'asc'
    })
    const nonMatchingIndex3 = buildDesignDoc({})
    const nonMatchingIndex4 = buildDesignDoc({ foo: 'asc' })

    expect(isMatchingIndex(nonMatchingIndex1, ['foo', 'bar'])).toEqual(false)
    expect(isMatchingIndex(nonMatchingIndex2, ['foo', 'bar'])).toEqual(false)
    expect(isMatchingIndex(nonMatchingIndex3, ['foo', 'bar'])).toEqual(false)
    expect(isMatchingIndex(nonMatchingIndex4, ['foo', 'bar'])).toEqual(false)
  })

  it('should match index with same fields and same partial filter', () => {
    const partialFilter = {
      $and: [
        {
          baz: {
            $ne: 'xyz'
          }
        },
        {
          fu: {
            $eq: true
          }
        }
      ]
    }
    const matchingIndex = buildDesignDoc(
      {
        foo: 'asc',
        bar: 'asc'
      },
      { partialFilter }
    )

    expect(
      isMatchingIndex(matchingIndex, ['foo', 'bar'], {
        fu: true,
        baz: {
          $ne: 'xyz'
        }
      })
    ).toEqual(true)
  })

  it('should not match index with same fields and different partial filter', () => {
    const partialFilter = {
      baz: {
        $ne: 'xyz',
        $exists: true
      }
    }
    const matchingIndex = buildDesignDoc(
      {
        foo: 'asc',
        bar: 'asc'
      },
      { partialFilter }
    )
    expect(
      isMatchingIndex(matchingIndex, ['foo', 'bar'], {
        baz: {
          $ne: 'xyz'
        }
      })
    ).toEqual(false)
  })

  it('should not match index with same fields and index with existing partialFilter but asked for index without partialFilter', () => {
    const partialFilter = {
      baz: {
        $ne: 'xyz',
        $exists: true
      }
    }
    const matchingIndex = buildDesignDoc(
      {
        foo: 'asc',
        bar: 'asc'
      },
      { partialFilter }
    )
    expect(isMatchingIndex(matchingIndex, ['foo', 'bar'])).toEqual(false)
  })
})

describe('getIndexFields', () => {
  it('should return nothing', () => {
    expect(getIndexFields({})).toEqual([])
  })

  it('should return fields from selector', () => {
    const selector = {
      _id: {
        $gt: null
      },
      name: 'toto'
    }
    expect(getIndexFields({ selector })).toEqual(['_id', 'name'])
  })

  it('should return fields from sort', () => {
    const selector = {}
    const sort = [{ _id: 'asc' }, { name: 'asc' }]
    expect(getIndexFields({ selector, sort })).toEqual(['_id', 'name'])
  })

  it('should return fields from partial filter', () => {
    const partialFilter = {
      date: {
        $exists: false
      },
      trashed: {
        $ne: true
      }
    }
    expect(getIndexFields({ partialFilter })).toEqual(['date', 'trashed'])
  })

  it('should return fields from partial filter even with logicial operator', () => {
    const partialFilter = {
      $or: [
        {
          'email.address': {
            $exists: true
          }
        },
        {
          'phone.number': {
            $exists: true
          }
        }
      ]
    }
    expect(getIndexFields({ partialFilter })).toEqual([
      '$or',
      'email.address',
      'phone.number'
    ])
  })

  it('should return all fields', () => {
    const selector = {
      _id: {
        $gt: null
      },
      name: 'toto'
    }
    const sort = [{ _id: 'asc' }, { name: 'asc' }]

    const partialFilter = {
      date: {
        $exists: false
      },
      trashed: {
        $ne: true
      }
    }
    expect(getIndexFields({ selector, sort, partialFilter })).toEqual([
      '_id',
      'name',
      'date',
      'trashed'
    ])
  })
})

describe('getIndexNameFromFields', () => {
  const fields = ['dir_id', 'type', 'name']

  it('should return index fields', () => {
    expect(getIndexNameFromFields(fields)).toEqual(
      'by_dir_id_and_type_and_name'
    )
  })

  it('should return index fields with partial filter', () => {
    const partialFilter = {
      trashed: false
    }

    expect(getIndexNameFromFields(fields, partialFilter)).toEqual(
      'by_dir_id_and_type_and_name_filter_(trashed_false)'
    )
  })

  it('should return index fields with partial filter with multiple conditions', () => {
    const partialFilter = {
      type: 'file',
      classe: 'image',
      trashed: true
    }

    expect(getIndexNameFromFields(fields, partialFilter)).toEqual(
      'by_dir_id_and_type_and_name_filter_(type_file)_and_(classe_image)_and_(trashed_true)'
    )
  })

  it('should return index fields with partial filter with nested conditions', () => {
    const partialFilter = {
      type: 'file',
      trashed: true,
      'metadata.notifiedAt': {
        $exists: false
      }
    }

    expect(getIndexNameFromFields(fields, partialFilter)).toEqual(
      'by_dir_id_and_type_and_name_filter_(type_file)_and_(trashed_true)_and_(metadata.notifiedAt_$exists_false)'
    )
  })

  it('should return index fields with partial filter with $or and $and at root', () => {
    const partialFilter = {
      type: 'file',
      $or: [
        {
          trashed: {
            $exists: false
          }
        },
        {
          trashed: false
        },
        {
          class: 'image'
        }
      ]
    }

    expect(getIndexNameFromFields(fields, partialFilter)).toEqual(
      'by_dir_id_and_type_and_name_filter_(type_file)_and_((trashed_$exists_false)_$or_(trashed_false)_$or_(class_image))'
    )
  })

  it('should return index fields with partial filter with $or inside sub condition', () => {
    const partialFilter = {
      worker: { $or: ['konnector', 'client'] },
      state: 'running'
    }

    expect(getIndexNameFromFields(fields, partialFilter)).toEqual(
      'by_dir_id_and_type_and_name_filter_(worker_$or_(konnector_client))_and_(state_running)'
    )
  })

  it('should return index fields with partial filter with $nor inside sub condition', () => {
    const partialFilter = {
      $nor: [
        {
          type: {
            $eq: 'directory'
          }
        },
        { dir_id: 'id1234' },
        {
          'metadata.notifiedAt': {
            $exists: false
          }
        }
      ]
    }

    expect(getIndexNameFromFields(fields, partialFilter)).toEqual(
      'by_dir_id_and_type_and_name_filter_((type_$eq_directory)_$nor_(dir_id_id1234)_$nor_(metadata.notifiedAt_$exists_false))'
    )
  })
})

describe('makeOperatorsExplicit', () => {
  it('should transforms implicit $eq operator to explicit', () => {
    const query = { name: 'test' }
    const expected = { name: { $eq: 'test' } }
    expect(makeOperatorsExplicit(query)).toEqual(expected)
  })

  it('should transforms implicit $and operator to explicit', () => {
    const query = { name: 'test', age: 42 }
    const expected = { $and: [{ age: { $eq: 42 } }, { name: { $eq: 'test' } }] }
    expect(makeOperatorsExplicit(query)).toEqual(expected)
  })

  it('should maintains explicit $eq operator', () => {
    const query = { name: { $eq: 'test' } }
    const expected = { name: { $eq: 'test' } }
    expect(makeOperatorsExplicit(query)).toEqual(expected)
  })

  it('should maintains explicit $and operator', () => {
    const query = { $and: [{ name: 'test' }, { age: 42 }] }
    const expected = { $and: [{ age: { $eq: 42 } }, { name: { $eq: 'test' } }] }
    expect(makeOperatorsExplicit(query)).toEqual(expected)
  })

  it('should handles nested implicit $eq operators', () => {
    const query = { user: { name: 'test', age: 42 } }
    const expected = {
      user: { $and: [{ age: { $eq: 42 } }, { name: { $eq: 'test' } }] }
    }
    expect(makeOperatorsExplicit(query)).toEqual(expected)
  })

  it('should handles nested explicit operators', () => {
    const query = { user: { $or: [{ name: 'test' }, { age: { $ne: 42 } }] } }
    const expected = {
      user: { $or: [{ age: { $ne: 42 } }, { name: { $eq: 'test' } }] }
    }
    expect(makeOperatorsExplicit(query)).toEqual(expected)
  })

  it('should handles mixed implicit and explicit operators', () => {
    const query = { name: 'test', age: { $ne: 42 } }
    const expected = { $and: [{ age: { $ne: 42 } }, { name: { $eq: 'test' } }] }
    expect(makeOperatorsExplicit(query)).toEqual(expected)
  })

  it('should handles operator with string array', () => {
    const query = {
      _id: {
        $nin: ['id123', 'id456']
      },
      type: 'file'
    }
    const expected = {
      $and: [
        {
          _id: {
            $nin: ['id123', 'id456']
          }
        },
        { type: { $eq: 'file' } }
      ]
    }
    expect(makeOperatorsExplicit(query)).toEqual(expected)
  })

  it('should handles $or operator with string array', () => {
    const query = {
      type: {
        $or: ['konnector', 'worker']
      }
    }
    const expected = {
      $or: [{ type: { $eq: 'konnector' } }, { type: { $eq: 'worker' } }]
    }
    expect(makeOperatorsExplicit(query)).toEqual(expected)
  })

  it('should handles $or operator with object array', () => {
    const query = {
      type: 'file',
      $or: [
        {
          trashed: {
            $exists: false
          }
        },
        {
          trashed: false
        }
      ]
    }
    const expected = {
      $and: [
        { $or: [{ trashed: { $exists: false } }, { trashed: { $eq: false } }] },
        { type: { $eq: 'file' } }
      ]
    }
    expect(makeOperatorsExplicit(query)).toEqual(expected)
  })

  it('should handles explicit $and operator with nested object to make explicit', () => {
    const query = {
      type: 'file',
      trashed: true,
      'metadata.notifiedAt': {
        $exists: false
      }
    }
    const expected = {
      $and: [
        { 'metadata.notifiedAt': { $exists: false } },
        { trashed: { $eq: true } },
        { type: { $eq: 'file' } }
      ]
    }
    expect(makeOperatorsExplicit(query)).toEqual(expected)
  })

  it('should handles explicit $nor operator', () => {
    const query = {
      $nor: [
        {
          type: {
            $eq: 'directory'
          }
        },
        { dir_id: 'id1234' },
        {
          'metadata.notifiedAt': {
            $exists: false
          }
        }
      ]
    }
    const expected = {
      $and: [
        {
          dir_id: {
            $ne: 'id1234'
          }
        },
        {
          'metadata.notifiedAt': {
            $exists: false
          }
        },
        {
          type: {
            $ne: 'directory'
          }
        }
      ]
    }

    expect(makeOperatorsExplicit(query)).toEqual(expected)
  })

  it('should order alphabetically object inside arrays compared with their first key', () => {
    const query = {
      second: { $exists: true },
      third: true,
      first: {
        $and: [
          {
            fourth: true
          },
          {
            fifth: {
              $exists: true
            }
          }
        ]
      }
    }
    const expected = {
      $and: [
        {
          first: {
            $and: [
              {
                fifth: {
                  $exists: true
                }
              },
              {
                fourth: {
                  $eq: true
                }
              }
            ]
          }
        },
        {
          second: {
            $exists: true
          }
        },
        {
          third: {
            $eq: true
          }
        }
      ]
    }

    expect(makeOperatorsExplicit(query)).toEqual(expected)
  })
})
