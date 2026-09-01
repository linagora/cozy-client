import { shouldDocumentBePersisted } from './storage'

const BASE_DOC = {
  _id: '123',
  name: 'saymy'
}

describe('shouldDocumentBePersisted', () => {
  it('should not persist a doc with cozyLocalOnly flag', () => {
    const doc = { ...BASE_DOC, cozyLocalOnly: true }
    expect(shouldDocumentBePersisted(doc)).toBe(false)
  })

  it('should not persist effective recipients', () => {
    const doc = {
      ...BASE_DOC,
      _type: 'io.cozy.sharings.recipients'
    }

    expect(shouldDocumentBePersisted(doc)).toBe(false)
  })

  it('should not persist a doc with rev', () => {
    const doc1 = { ...BASE_DOC, _rev: '123' }
    expect(shouldDocumentBePersisted(doc1)).toBe(false)

    const doc2 = { ...BASE_DOC, meta: { rev: '123' } }
    expect(shouldDocumentBePersisted(doc2)).toBe(false)
  })

  it('should persist if we enforce it', () => {
    const doc = { ...BASE_DOC, _rev: '123' }
    expect(shouldDocumentBePersisted(doc, true)).toBe(true)
  })

  it('should persist if there is not revision', () => {
    const doc = { ...BASE_DOC }
    expect(shouldDocumentBePersisted(doc)).toBe(true)
  })
})
