import { QueryDefinition, Q } from '../queries/dsl'
import logger from '../logger'

describe('QueryDefinition', () => {
  beforeEach(() => {
    jest.spyOn(logger, 'warn').mockImplementation(() => jest.fn())
    jest.spyOn(logger, 'info').mockImplementation(() => jest.fn())
  })

  afterEach(() => {
    logger.warn.mockRestore()
    logger.info.mockRestore()
  })

  it('should build query defs on selected fields', () => {
    const q = new QueryDefinition({ doctype: 'io.cozy.todos' })
    expect(q.select(['toto'])).toMatchObject({
      doctype: 'io.cozy.todos',
      fields: ['toto']
    })
  })

  it('should build query def on id', () => {
    const q = new QueryDefinition({ doctype: 'io.cozy.todos' })
    expect(q.getById('id1')).toMatchObject({
      id: 'id1',
      doctype: 'io.cozy.todos'
    })
  })

  it('should build query def on ids', () => {
    const q = new QueryDefinition({ doctype: 'io.cozy.todos' })
    expect(q.getByIds(['id1', 'ids2'])).toMatchObject({
      ids: ['id1', 'ids2'],
      doctype: 'io.cozy.todos'
    })
  })

  it('should work with shorthand Q', () => {
    const q = Q('io.cozy.files')
    expect(q.getByIds(['id1', 'ids2'])).toMatchObject({
      ids: ['id1', 'ids2'],
      doctype: 'io.cozy.files'
    })
  })

  it('should build an effective recipients query for a classic sharing', () => {
    const query = Q('io.cozy.sharings.recipients').effectiveRecipients('file-1')

    expect(query).toMatchObject({
      doctype: 'io.cozy.sharings.recipients',
      selector: { file_id: 'file-1', drive_id: null }
    })
  })

  it('should build an effective recipients query for a shared drive', () => {
    const query = Q('io.cozy.sharings.recipients').effectiveRecipients(
      'file-1',
      { driveId: 'drive-1' }
    )

    expect(query).toMatchObject({
      selector: { file_id: 'file-1', drive_id: 'drive-1' }
    })
  })

  it('should reject effective recipients queries on another doctype', () => {
    expect(() => Q('io.cozy.sharings').effectiveRecipients('file-1')).toThrow(
      'effectiveRecipients must be called on io.cozy.sharings.recipients'
    )
  })

  it('should reject effective recipients queries without a file id', () => {
    expect(() =>
      Q('io.cozy.sharings.recipients').effectiveRecipients(null)
    ).toThrow('effectiveRecipients called with undefined fileId')
  })

  it('paginates only one way', () => {
    const q = Q('io.cozy.files')
    const withSkip = q.offset(2)
    expect(withSkip.skip).toEqual(2)
    expect(withSkip.bookmark).toBeUndefined()
    expect(withSkip.cursor).toBeUndefined()

    const cursor = [['io.cozy.files', '1234'], 'xyz']
    const withCursor = withSkip.offsetCursor(cursor)
    expect(withCursor.cursor).toEqual(cursor)
    expect(withCursor.bookmark).toBeUndefined()
    expect(withCursor.skip).toBeUndefined()

    const withBookmark = withCursor.offsetBookmark('bookmark-id')
    expect(withBookmark.bookmark).toEqual('bookmark-id')
    expect(withBookmark.cursor).toBeUndefined()
    expect(withBookmark.skip).toBeUndefined()

    const withSkipAgain = withBookmark.offset(2)
    expect(withSkipAgain.skip).toEqual(2)
    expect(withSkipAgain.bookmark).toBeUndefined()
    expect(withSkipAgain.cursor).toBeUndefined()
  })

  it('should not warn for valid queries', () => {
    Q('io.cozy.files')
      .sortBy([{ type: 'asc' }, { dirID: 'asc' }])
      .where({ type: 'file', dirID: '123' })
      .indexFields(['type', 'dirID'])
    expect(logger.warn).toHaveBeenCalledTimes(0)
  })
  it('should warn on sorting non-indexed fields', () => {
    Q('io.cozy.files')
      .where({ type: 'file', dirID: '123' })
      .indexFields(['type', 'dirID'])
      .sortBy([{ type: 'asc' }, { dirID: 'asc' }, { date: 'asc' }])
    expect(logger.warn).toHaveBeenCalledTimes(1)
  })
  it('should warn on sort order', () => {
    Q('io.cozy.files')
      .where({ type: 'file', dirID: '123' })
      .indexFields(['type', 'dirID'])
      .sortBy([{ dirID: 'asc' }, { type: 'asc' }])
    expect(logger.warn).toHaveBeenCalledTimes(1)
  })
  it('should warn on sort order through the selector', () => {
    Q('io.cozy.files')
      .where({ type: 'file', dirID: '123' })
      .sortBy([{ dirID: 'asc' }, { type: 'asc' }])
    expect(logger.warn).toHaveBeenCalledTimes(1)
  })
  it('should not warn for queries with no selector', () => {
    Q('io.cozy.files').sortBy([{ dirID: 'asc' }, { type: 'asc' }])
    expect(logger.warn).toHaveBeenCalledTimes(0)
  })

  it('should warn when using a selector with $exists: false', () => {
    Q('io.cozy.files').where({ trashed: { $exists: false } })
    expect(logger.warn).toHaveBeenCalledTimes(1)
  })
  it('should inform when using a selector with $neq', () => {
    Q('io.cozy.files').where({ _id: { $ne: 'io.cozy.root-id' } })
    expect(logger.info).toHaveBeenCalledTimes(1)
  })
  it('should throw when using a selector with an array without an $operator', () => {
    const query = () =>
      Q('io.cozy.files').where({ worker: ['worker1', 'worker2'] })
    expect(() => query()).toThrow()
  })
  it('should not throw an error when we make a selector on multiple value with a mango operator', () => {
    const query = () =>
      Q('io.cozy.files').where({
        worker: { $in: ['konnector', 'client'] }
      })
    expect(() => query()).not.toThrow()
  })
  it('should throw an error when there is a select without all the fields in selector', () => {
    const query = () =>
      Q('io.cozy.files')
        .where({ name: 'saymyname' })
        .select(['size'])
    expect(() => query()).toThrow()
  })
  it('should throw an error when there is a select without all the fields in partial index', () => {
    const query = () =>
      Q('io.cozy.files')
        .where({ size: 42 })
        .partialIndex({ name: { $exists: true } })
        .select(['size'])
    expect(() => query()).toThrow()
  })
  it('should throw an error when there is a select without all the fields in nor selector nor partial index', () => {
    const query = () =>
      Q('io.cozy.files')
        .where({ size: 42 })
        .partialIndex({ name: { $exists: true } })
        .select(['date'])
    expect(() => query()).toThrow()
  })
  it('should not throw when there is a select with all the fields in selector and partial index', () => {
    const query = () =>
      Q('io.cozy.files')
        .where(
          {
            size: 42
          },
          {
            date: '2021-01-01'
          }
        )
        .partialIndex({ name: { $exists: true } })
        .select(['date', 'size', 'name', 'trashed'])
    expect(() => query()).not.toThrow()
  })
})
