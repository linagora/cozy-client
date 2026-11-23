import { Q } from '../queries/dsl'
import {
  isReadOnly,
  isDocumentReadOnly,
  fetchOwn,
  isShortcutCreatedOnTheRecipientCozy
} from './permission'

jest.mock('../queries/dsl', () => ({
  Q: jest.fn()
}))

function getById(id, doctype) {
  const parents = {
    'first-ggchild': 'first-gchild',
    'first-gchild': 'first-child',
    'first-child': 'first'
  }
  return {
    _id: id,
    id: id,
    _type: doctype,
    type: doctype,
    attributes: {
      dir_id: parents[id] || ''
    },
    relationships: {
      parent: {
        data: {
          id: parents[id],
          type: doctype
        }
      }
    }
  }
}

function setupClient(verbs = [], ids = ['first', 'other']) {
  Q.mockImplementation(doctype => ({
    getById: id => ({ data: getById(id, doctype) })
  }))
  return {
    query: async data => data,
    collection: () => ({
      fetchOwnPermissions: async () => ({
        data: {
          id: '9385e37389cb9f71a230168f245df2f8',
          _id: '9385e37389cb9f71a230168f245df2f8',
          _type: 'io.cozy.permissions',
          type: 'io.cozy.permissions',
          attributes: {
            type: 'share',
            source_id: 'io.cozy.apps/notes',
            permissions: {
              files: {
                type: 'io.cozy.files',
                verbs: verbs,
                values: ids
              },
              album: {
                type: 'io.cozy.photo.albums',
                verbs: verbs,
                values: ['third']
              }
            },
            shortcodes: {
              email: 'k7oMbB11jKFR'
            }
          }
        }
      })
    })
  }
}

describe('isReadOnly', () => {
  function setupPermissions(verbs) {
    const perms = {
      type: 'io.cozy.files',
      selector: 'id',
      values: ['hello', 'world']
    }
    if (verbs) {
      perms.verbs = verbs
    }
    return perms
  }

  describe('for an implicit "ALL" permission (empty verbs)', () => {
    it('should be false', () => {
      const perms = setupPermissions()
      expect(isReadOnly(perms)).toBeFalsy()
    })
  })
  describe('for an explicit "ALL" permission', () => {
    it('should be false', () => {
      const perms = setupPermissions(['ALL'])
      expect(isReadOnly(perms)).toBeFalsy()
    })
  })
  ;[('PATCH', 'PUT', 'DELETE', 'POST')].forEach(verb => {
    describe(`with a ['GET', '${verb}']`, () => {
      it('should be false', () => {
        const perms = setupPermissions(['GET', verb])
        expect(isReadOnly(perms)).toBeFalsy()
      })
    })
  })
  describe('for GET and OPTIONS only', () => {
    it('should be true', () => {
      const perms = setupPermissions(['GET', 'OPTIONS'])
      expect(isReadOnly(perms)).toBeTruthy()
    })
  })

  describe('when triggering the writability only with PATCH', () => {
    ;['GET', 'PUT', 'DELETE', 'POST'].forEach(verb => {
      describe(`with a ['OPTIONS', '${verb}']`, () => {
        it('should be true', () => {
          const perms = setupPermissions(['GET', 'OPTIONS'])
          expect(isReadOnly(perms, { writability: ['PATCH'] })).toBeTruthy()
        })
      })
    })
    describe('for PATCH', () => {
      it('should be fakse', () => {
        const perms = setupPermissions(['GET', 'PATCH'])
        expect(isReadOnly(perms, { writability: ['PATCH'] })).toBeFalsy()
      })
    })
  })
})

describe('isDocumentReadOnly', () => {
  ;[
    ['only one individual file permission', ['only'], 'only'],
    ['a permission for this file', ['first', 'second'], 'first'],
    ['a permission for an ancestor', ['first', 'second'], 'first-ggchild']
  ].forEach(data => {
    describe(`when there is ${data[0]}`, () => {
      describe('when we have a PATCH permission', () => {
        it('should return read-write', async () => {
          const client = setupClient(['GET', 'PATCH'], data[1])
          const document = getById(data[2], 'io.cozy.files')
          await expect(
            isDocumentReadOnly({ client, document })
          ).resolves.toBeFalsy()
        })
      })
      describe('when we only have a GET permission', () => {
        it('should return read-only', async () => {
          const client = setupClient(['GET'], data[1])
          const document = getById(data[2], 'io.cozy.files')
          await expect(
            isDocumentReadOnly({ client, document })
          ).resolves.toBeTruthy()
        })
      })
    })
  })
})

describe('fetchOwn', () => {
  it('returns a list of permissions', async () => {
    const client = setupClient()
    const result = await fetchOwn(client)

    expect(result).toEqual([
      { type: 'io.cozy.files', values: ['first', 'other'], verbs: [] },
      { type: 'io.cozy.photo.albums', values: ['third'], verbs: [] }
    ])
  })
})

describe('isShortcutCreatedOnTheRecipientCozy', () => {
  it('tests the return ', () => {
    const includedWithInstance = [
      {
        type: 'io.cozy.sharings.members',
        id: '',
        attributes: {
          status: 'seen',
          name: 'alice@cozy.tools',
          email: 'alice@cozy.tools',
          instance: 'http://q2.cozy.tools:8080'
        }
      }
    ]
    expect(
      isShortcutCreatedOnTheRecipientCozy({ included: includedWithInstance })
    ).toBeTruthy()

    const includedWithoutInstance = [
      {
        type: 'io.cozy.sharings.members',
        id: '',
        attributes: {
          status: 'seen',
          name: 'alice@cozy.tools',
          email: 'alice@cozy.tools'
        }
      }
    ]
    expect(
      isShortcutCreatedOnTheRecipientCozy({ included: includedWithoutInstance })
    ).toBeFalsy()
  })
})
