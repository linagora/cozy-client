import MockDate from 'mockdate'
import {
  SCHEMA,
  TODO_1,
  TODO_2,
  TODO_3,
  TODO_WITH_AUTHOR,
  AUTHORS,
  DOCTYPE_VERSION,
  APP_NAME,
  APP_VERSION,
  SOURCE_ACCOUNT_ID,
  SOURCE_ACCOUNT_IDENTIFIER,
  FILE_1,
  TODO_WITH_NONEXISTING_RELATIONSHIP
} from './__tests__/fixtures'
import { withIgnoreConsoleWarn } from './__tests__/console'

import CozyClient from './CozyClient'
import { Q } from './queries/dsl'
import CozyStackClient, { OAuthClient } from 'cozy-stack-client'
import CozyLink from './links/CozyLink'
import { Mutations, QueryDefinition } from './queries/dsl'
import {
  initQuery,
  receiveQueryResult,
  receiveQueryError,
  initMutation,
  receiveMutationResult,
  receiveMutationError,
  getQueryFromState,
  getRawQueryFromState,
  isQueryExisting,
  loadQuery,
  resetQuery,
  executeQueryFromState
} from './store'
import { HasManyFiles, Association } from './associations'
import mapValues from 'lodash/mapValues'
import FileCollection from 'cozy-stack-client/dist/FileCollection'
import logger from './logger'

const normalizeData = data =>
  mapValues(data, (docs, doctype) => {
    return docs.map(doc => ({
      ...doc,
      _id: doc.id || doc._id,
      id: doc.id || doc._id,
      _type: doctype
    }))
  })

const METADATA_VERSION = 1

jest.mock('./store', () => ({
  ...jest.requireActual('./store'),
  isQueryExisting: jest.fn().mockReturnValue(false),
  getQueryFromState: jest.fn().mockReturnValue({}),
  getRawQueryFromState: jest.fn().mockReturnValue({}),
  executeQueryFromState: jest.fn().mockReturnValue([])
}))

describe('CozyClient initialization', () => {
  let client, links

  beforeEach(() => {
    links = [
      new CozyLink((operation, options, result = '', forward) => {
        return forward(operation, options, result + 'foo')
      }),
      new CozyLink((operation, options, result, forward) => {
        return forward(operation, options, result + 'bar')
      }),
      (operation, options, result) => {
        return result + 'baz'
      }
    ]
    links.forEach(link => {
      link.registerClient = jest.fn()
    })

    client = new CozyClient({ links, schema: SCHEMA })

    delete window.cozy
  })

  it('should autologin when provided token and uri', () => {
    const token = 'fake_token'
    const uri = 'https://example.mycozy.cloud'
    client = new CozyClient({ token, uri })
    expect(client.isLogged).toBeTruthy()
  })

  describe('explicit login', () => {
    beforeEach(() => {
      jest.spyOn(logger, 'warn').mockImplementation(() => {})
    })
    afterEach(() => {
      logger.warn.mockRestore()
    })

    it('should not break explicit login when provided token and uri', () => {
      const token = 'fake_token'
      const uri = 'https://example.mycozy.cloud'
      client = new CozyClient({ token, uri })
      expect(client.login()).toBeInstanceOf(Promise)
    })
  })

  it('can be instantiated from environment with string token', () => {
    const url = 'https://testcozy.mycozy.cloud'
    const token = 'test-token'
    client = CozyClient.fromEnv({
      COZY_URL: url,
      COZY_CREDENTIALS: token
    })
    expect(client.stackClient.uri).toBe(url)
    expect(client.stackClient.token.token).toBe(token)
  })

  it('can be instantiated from environment with OAuth token', () => {
    const url = 'https://testcozy.mycozy.cloud'
    const token = 'test-token'
    const creds = {
      token: {
        accessToken: token
      }
    }
    client = CozyClient.fromEnv({
      COZY_URL: url,
      COZY_CREDENTIALS: JSON.stringify(creds)
    })
    expect(client.stackClient.uri).toBe(url)
    expect(client.stackClient.token.accessToken).toBe(token)
  })

  it('can be instantiated from a cookie-based old client', () => {
    // Not using a real cozy-client-js here not to have to add it as a dep
    const url = 'https://testcozy.mycozy.cloud'
    const token = 'Registration-token'
    const oldClient = {
      _url: url,
      _token: {
        token
      }
    }
    const client = CozyClient.fromOldClient(oldClient)
    expect(client.stackClient.uri).toBe(url)
    expect(client.stackClient.token.token).toBe(token)
  })

  it('can be instantiated from an oauth-based old client', async () => {
    // Not using a real cozy-client-js here not to have to add it as a dep
    const url = 'https://testcozy.mycozy.cloud'
    const oauth = {
      clientID: 'my-client'
      // ... other OAuth client attributes
    }
    const token = {
      tokenType: 'bearer',
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      scope: ['io.cozy.files']
    }
    const oldClient = {
      _url: url,
      _oauth: true,
      authorize: () => ({
        client: oauth,
        token
      })
    }
    const client = await CozyClient.fromOldOAuthClient(oldClient)
    expect(client.stackClient.uri).toBe(url)
    expect(client.stackClient.oauthOptions.clientID).toBe(oauth.clientID)
    expect(client.stackClient.token.accessToken).toBe(token.accessToken)
    expect(client.stackClient.scope).toBe(token.scope)
  })

  it('can be instantiated from dataset injected by the Stack in DOM', async () => {
    const options = { cozyDomain: 'cozy.tools', cozyToken: 'abc123' }
    const node = document.createElement('div')
    Object.assign(node.dataset, options)
    jest.spyOn(document, 'querySelector').mockReturnValue(node)
    const client = CozyClient.fromDOM()
    expect(client.stackClient.uri).toBe('http://cozy.tools')
    expect(client.stackClient.token.token).toBe('abc123')
    document.querySelector.mockRestore()
  })

  it('fromDOM should handle single DOM dataset', async () => {
    const options = JSON.stringify({
      cozyDomain: 'cozy.tools',
      cozyToken: 'abc123'
    })
    const node = document.createElement('div')
    node.dataset.cozy = options
    jest.spyOn(document, 'querySelector').mockReturnValue(node)
    const client = CozyClient.fromDOM()
    expect(client.stackClient.uri).toBe('http://cozy.tools')
    expect(client.stackClient.token.token).toBe('abc123')
    document.querySelector.mockRestore()
  })

  describe('Instance options', () => {
    it('should expose options loaded via the DOM', () => {
      const options = { cozyDomain: 'cozy.tools', cozyToken: 'abc123' }
      const node = document.createElement('div')
      Object.assign(node.dataset, options)
      const globalQuerySelectorBefore = document.querySelector
      document.querySelector = jest.fn().mockReturnValue(node)

      const client = new CozyClient({})
      client.loadInstanceOptionsFromDOM()
      expect(client.getInstanceOptions()).toEqual(options)

      document.querySelector = globalQuerySelectorBefore
    })

    it('should load the single DOM dataset', () => {
      const options = { domain: 'cozy.tools', token: 'abc123' }
      const node = document.createElement('div')
      node.dataset.cozy = JSON.stringify(options)
      const globalQuerySelectorBefore = document.querySelector
      document.querySelector = jest.fn().mockReturnValue(node)

      const client = new CozyClient({})
      client.loadInstanceOptionsFromDOM()
      expect(client.getInstanceOptions()).toEqual(options)

      document.querySelector = globalQuerySelectorBefore
    })

    it('should load the single DOM dataset and the other exposed options', () => {
      const singleOptions = {
        domain: 'cozy.tools',
        token: 'abc123'
      }
      const cozyOptions = {
        cozyDomain: 'cozy.tools',
        cozyDefaultWallpaper: 'wallpaper.jpg'
      }

      const node = document.createElement('div')
      node.dataset.cozy = JSON.stringify(singleOptions)
      Object.assign(node.dataset, cozyOptions)

      const globalQuerySelectorBefore = document.querySelector
      document.querySelector = jest.fn().mockReturnValue(node)

      const client = new CozyClient({})
      expect(client.getInstanceOptions()).toMatchObject({
        domain: 'cozy.tools',
        token: 'abc123',
        cozyDomain: 'cozy.tools',
        cozyDefaultWallpaper: 'wallpaper.jpg'
      })

      document.querySelector = globalQuerySelectorBefore
    })

    it('should secure the URL if window.cozy.isSecureProtocol is true', () => {
      window.cozy = {
        isSecureProtocol: true
      }

      const client = new CozyClient({
        uri: 'http://cozy.tools',
        schema: '',
        token: 'SOME_TOKEN'
      })

      expect(client.options.uri).toBe('https://cozy.tools')
    })

    it('should NOT secure the URL if window.cozy.isSecureProtocol is false', () => {
      window.cozy = {
        isSecureProtocol: false
      }

      const client = new CozyClient({
        uri: 'http://cozy.tools',
        schema: '',
        token: 'SOME_TOKEN'
      })

      expect(client.options.uri).toBe('http://cozy.tools')
    })

    it('should not secure the URL if window is undefined (node env)', () => {
      let windowSpy = jest.spyOn(window, 'window', 'get')
      windowSpy.mockImplementation(() => undefined)
      const client = new CozyClient({
        uri: 'http://cozy.tools',
        schema: '',
        token: 'SOME_TOKEN'
      })

      expect(client.options.uri).toBe('http://cozy.tools')
      windowSpy.mockRestore()
    })

    describe('capabilities', () => {
      it('should instanciate Client with capabilities', () => {
        const options = {
          domain: 'cozy.tools',
          token: 'abc123',
          capabilities: {
            can_auth_with_oidc: false
          }
        }
        const node = document.createElement('div')
        node.dataset.cozy = JSON.stringify(options)
        const globalQuerySelectorBefore = document.querySelector
        document.querySelector = jest.fn().mockReturnValue(node)

        const client = new CozyClient({})
        expect(client.capabilities).toEqual(options.capabilities)

        document.querySelector = globalQuerySelectorBefore
      })

      it('should instanciate Client with null capabilities', () => {
        const options = {
          domain: 'cozy.tools',
          token: 'abc123'
        }
        const node = document.createElement('div')
        node.dataset.cozy = JSON.stringify(options)
        const globalQuerySelectorBefore = document.querySelector
        document.querySelector = jest.fn().mockReturnValue(node)

        const client = new CozyClient({})
        expect(client.capabilities).toBe(null)

        document.querySelector = globalQuerySelectorBefore
      })
    })
  })

  describe('plugins', () => {
    it('can register a plugin', () => {
      expect.assertions(2)
      class TestPlugin {
        constructor(testClient) {
          expect(testClient).toBe(client)
        }
      }
      TestPlugin.pluginName = 'test'
      const client = new CozyClient({})
      client.registerPlugin(TestPlugin)
      expect(client.plugins.test).toBeInstanceOf(TestPlugin)
    })

    it('cannot register a plugin with the same name as another plugin', () => {
      class TestPlugin {}
      class TestPlugin2 {}
      TestPlugin.pluginName = TestPlugin2.pluginName = 'test'
      client.registerPlugin(TestPlugin)
      expect(() => client.registerPlugin(TestPlugin2)).toThrow(
        new Error(
          'Cannot register plugin test. A plugin with the same name has already been registered.'
        )
      )
    })

    it('cannot register a plugin with no `pluginName`', () => {
      class TestPlugin {}
      expect(() => client.registerPlugin(TestPlugin)).toThrow(
        new Error(
          'Cannot register a plugin whose class does not have `pluginName` attribute.'
        )
      )
    })
  })

  it('should have chained links', async () => {
    const res = await client.requestQuery({})
    expect(res).toBe('foobarbaz')
  })

  it('should have registered the client on all links ', () => {
    for (const link of links) {
      expect(link.registerClient).toHaveBeenCalledWith(client)
    }
  })

  it('should create a store when calling makeObservableQuery', () => {
    jest.spyOn(logger, 'warn').mockImplementation(() => {})
    client.makeObservableQuery(
      new QueryDefinition({ doctype: 'io.cozy.todos' })
    )
    logger.warn.mockRestore()
    expect(client.store).not.toBe(undefined)
  })
})

describe('Stack client initialization', () => {
  beforeEach(() => {
    jest.spyOn(logger, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    logger.warn.mockRestore()
  })

  it('should add default callbacks', async () => {
    const client = new CozyClient({})
    await client.login()
    expect(client.stackClient.options.onRevocationChange).toBe(
      client.handleRevocationChange
    )
    expect(client.stackClient.options.onTokenRefresh).toBe(
      client.handleTokenRefresh
    )
  })

  it('proxies errors from stackClient', done => {
    const client = new CozyClient({ uri: 'http://localhost:8080' })
    client.on('error', function(value) {
      expect(value).toEqual('hello')
      done()
    })
    client.getStackClient().emit('error', 'hello')
  })
})

describe('CozyClient handlers', () => {
  let client

  beforeEach(() => {
    client = new CozyClient({})
    client.emit = jest.fn()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should handle revocation change to true', () => {
    client.handleRevocationChange(true)
    expect(client.emit).toHaveBeenCalledWith('revoked')
    expect(client.isRevoked).toBe(true)
  })

  it('should handle revocation change to false', () => {
    client.handleRevocationChange(false)
    expect(client.emit).toHaveBeenCalledWith('unrevoked')
    expect(client.isRevoked).toBe(false)
  })

  it('should warn when overriding default handlers', () => {
    jest.spyOn(logger, 'warn').mockImplementation(() => {})
    new CozyClient({
      stackClient: new CozyStackClient({
        onRevocationChange: () => {}
      })
    })
    expect(logger.warn).toHaveBeenCalledWith(
      'You passed a stackClient with its own onRevocationChange. It is not supported, unexpected things might happen.'
    )
  })
})

describe('CozyClient logout', () => {
  let client, links, stackClient

  class MockOAuthClient extends OAuthClient {
    constructor() {
      super({ oauth: {} })
      this.unregister = jest.fn()
      this.isRegistered = jest.fn()
      this.fetch = jest.fn()
    }
  }

  beforeEach(() => {
    links = [
      new CozyLink((operation, options, result = '', forward) => {
        return forward(operation, options, result + 'foo')
      }),
      new CozyLink((operation, options, result, forward) => {
        return forward(operation, options, result + 'bar')
      }),
      (operation, options, result) => {
        return result + 'baz'
      }
    ]
    links.forEach(link => {
      link.registerClient = jest.fn()
    })
    stackClient = new MockOAuthClient()
    client = new CozyClient({
      links,
      stackClient,
      schema: SCHEMA,
      warningForCustomHandlers: false
    })
  })

  it('should call reset on each link that can be reset', async () => {
    client.query = jest
      .fn()
      .mockResolvedValueOnce({
        data: { attributes: { file_versioning: true, flat_subdomains: true } }
      })
      .mockResolvedValueOnce({
        data: { attributes: { locale: 'fr', tracking: true } }
      })
    links[0].reset = jest.fn()
    links[2].reset = jest.fn()
    await client.login()
    await client.logout()
    expect(links[0].reset).toHaveBeenCalledTimes(1)
    expect(links[2].reset).toHaveBeenCalledTimes(1)

    // test if we launch twice logout, it doesn't launch twice reset.
    jest.spyOn(logger, 'warn').mockImplementation(() => {})
    await client.logout()
    logger.warn.mockRestore()

    expect(links[0].reset).toHaveBeenCalledTimes(1)
    expect(links[2].reset).toHaveBeenCalledTimes(1)
  })

  it('should call all reset even if a reset throws an error', async () => {
    client.query = jest
      .fn()
      .mockResolvedValueOnce({
        data: { attributes: { file_versioning: true, flat_subdomains: true } }
      })
      .mockResolvedValueOnce({
        data: { attributes: { locale: 'fr', tracking: true } }
      })
    links[0].reset = jest.fn().mockRejectedValue(new Error('Async error'))
    links[2].reset = jest.fn()
    await client.login()
    await client.logout()
    expect(links[0].reset).toHaveBeenCalledTimes(1)
    expect(links[2].reset).toHaveBeenCalledTimes(1)
  })

  it('should emit events', async () => {
    client.query = jest
      .fn()
      .mockResolvedValueOnce({
        data: { attributes: { file_versioning: true, flat_subdomains: true } }
      })
      .mockResolvedValueOnce({
        data: { attributes: { locale: 'fr', tracking: true } }
      })
    const originalLogout = client.logout
    links[0].reset = jest.fn()
    links[2].reset = jest.fn()
    jest.spyOn(client, 'logout').mockImplementation(async function() {
      await originalLogout.apply(this, arguments)
      expect(client.emit.mock.calls.map(x => x[0])).toEqual([
        'beforeLogin',
        'login',
        'beforeLogout',
        'logout'
      ])
    })
    jest.spyOn(client, 'emit')
    await client.login()
    await client.logout()
  })

  it('should unregister an oauth client', async () => {
    client.query = jest
      .fn()
      .mockResolvedValueOnce({
        data: { attributes: { file_versioning: true, flat_subdomains: true } }
      })
      .mockResolvedValueOnce({
        data: { attributes: { locale: 'fr', tracking: true } }
      })
    await client.login()
    stackClient.isRegistered.mockReturnValue(true)

    await client.logout()
    expect(stackClient.unregister).toHaveBeenCalled()
    expect(stackClient.fetch).not.toHaveBeenCalledWith('DELETE', '/auth/login')
  })

  it('should log out a web client', async () => {
    stackClient = {
      fetch: jest.fn(),
      unregister: jest.fn(),
      on: jest.fn()
    }
    client = new CozyClient({
      links,
      stackClient,
      schema: SCHEMA,
      uri: 'http://cozy.io',
      token: '123abc',
      warningForCustomHandlers: false
    })
    await client.logout()
    expect(stackClient.fetch).toHaveBeenCalledWith('DELETE', '/auth/login')
    expect(stackClient.unregister).not.toHaveBeenCalled()
  })

  it('should reset the redux state', async () => {
    stackClient = {
      fetch: jest.fn(),
      on: jest.fn()
    }
    client = new CozyClient({
      links,
      stackClient,
      schema: SCHEMA,
      uri: 'http://cozy.io',
      token: '123abc',
      warningForCustomHandlers: false
    })

    client.ensureStore()
    client.store.dispatch(initQuery('allTodos', { doctype: 'io.cozy.todos' }))

    await client.logout()

    expect(client.store.getState().cozy).toEqual({
      documents: {},
      queries: {}
    })
  })
})

describe('CozyClient login', () => {
  let client, links

  beforeEach(() => {
    links = [
      new CozyLink((operation, options, result = '', forward) => {
        return forward(operation, options, result + 'foo')
      }),
      new CozyLink((operation, options, result, forward) => {
        return forward(operation, options, result + 'bar')
      }),
      (operation, options, result) => {
        return result + 'baz'
      }
    ]
    links.forEach(link => {
      link.registerClient = jest.fn(client => (link.client = client))
    })
    client = new CozyClient({ links, schema: SCHEMA })
  })

  it('Should call `registerClientOnLinks`', async () => {
    client.registerClientOnLinks = jest.fn()
    await client.login()

    expect(client.registerClientOnLinks).toHaveBeenCalled()
  })

  it('Should call `onLogin` on every link that implements it', async () => {
    links[0].onLogin = jest.fn(() =>
      expect(links[0].client.stackClient.uri).toBe('http://cozy.tools')
    )
    links[2].onLogin = jest.fn()

    await client.login({ uri: 'http://cozy.tools' })

    expect(links[0].onLogin).toHaveBeenCalledTimes(1)
    expect(links[2].onLogin).toHaveBeenCalledTimes(1)

    await withIgnoreConsoleWarn(async () => {
      // test if we launch twice login, it doesn't launch twice onLogin.
      await client.login()
    })

    expect(links[0].onLogin).toHaveBeenCalledTimes(1)
    expect(links[2].onLogin).toHaveBeenCalledTimes(1)
  })

  it('should emit login', async () => {
    client.emit = jest.fn()
    client.registerClientOnLinks = jest.fn()
    await client.login()
    expect(client.emit).toHaveBeenCalledWith('login')
  })

  it('should set isRevoked to false', async () => {
    client.emit = jest.fn()
    client.registerClientOnLinks = jest.fn()
    client.isRevoked = true
    await client.login()
    expect(client.isRevoked).toBe(false)
  })
})

describe('CozyClient', () => {
  const requestHandler = jest.fn()
  const persistHandler = jest.fn()
  const link = new CozyLink(requestHandler, persistHandler)

  const MOCKED_DATE = '2018-05-05T09:09:00.115Z'

  beforeAll(() => {
    MockDate.set(MOCKED_DATE)
  })

  afterAll(() => {
    jest.restoreAllMocks()
    MockDate.reset()
  })

  let client
  beforeEach(() => {
    client = new CozyClient({
      links: [link],
      schema: SCHEMA,
      appMetadata: {
        slug: APP_NAME,
        sourceAccount: SOURCE_ACCOUNT_ID,
        sourceAccountIdentifier: SOURCE_ACCOUNT_IDENTIFIER,
        version: APP_VERSION
      }
    })
    client.ensureStore()
    jest.spyOn(client.store, 'dispatch').mockImplementation(() => {})
  })

  afterEach(() => {
    requestHandler.mockReset()
    persistHandler.mockReset()
  })
  describe('setAppMetadata', () => {
    it('should update the appMetadata', () => {
      client.setAppMetadata({ slug: 'test' })
      expect(client.appMetadata.slug).toEqual('test')
      expect(client.appMetadata.sourceAccount).toEqual(SOURCE_ACCOUNT_ID)
    })
  })
  describe('all', () => {
    it('should return a QueryDefinition', () => {
      expect(Q('io.cozy.todos')).toEqual({ doctype: 'io.cozy.todos' })
    })
  })

  describe('setData', () => {
    it('should fill the store with data', () => {
      client.store.dispatch.mockRestore()
      jest.spyOn(client.store, 'dispatch')
      client.setData(
        normalizeData({
          'io.cozy.todos': [{ id: 1, done: true }, { id: 2, done: false }],
          'io.cozy.people': [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]
        })
      )
      expect(client.getDocumentFromState('io.cozy.todos', 1)).toMatchObject({
        id: 1,
        done: true
      })
      expect(client.getDocumentFromState('io.cozy.people', 1)).toMatchObject({
        id: 1,
        name: 'Alice'
      })
    })
  })

  describe('getDocumentFromState', () => {
    it('should return null in case of error', () => {
      jest.spyOn(client.store, 'getState').mockImplementation(() => {
        throw new Error('Problem with store')
      })
      expect(client.getDocumentFromState('io.cozy.people', 1)).toBe(null)
    })
  })

  describe('find', () => {
    it('should return a QueryDefinition', () => {
      expect(Q('io.cozy.todos').where({ done: { $eq: true } })).toEqual({
        doctype: 'io.cozy.todos',
        selector: { done: { $eq: true } }
      })
    })
  })

  describe('save', () => {
    it('should add the _type if not present', async () => {
      const todo = { _type: 'io.cozy.todos', label: 'Buy croissants' }
      client.store.dispatch.mockReset()
      await client.save(todo)
      const dispatchCalls = client.store.dispatch.mock.calls
      expect(dispatchCalls.slice(-2)[0][0]).toMatchObject({
        definition: expect.objectContaining({
          document: expect.objectContaining({
            label: 'Buy croissants',
            _type: 'io.cozy.todos'
          }),
          mutationType: 'CREATE_DOCUMENT'
        })
      })
    })
    it('should mutate the document', async () => {
      client.setData(
        normalizeData({
          'io.cozy.todos': [TODO_1]
        })
      )
      const doc = { ...TODO_1, label: 'Buy croissants' }
      client.store.dispatch.mockReset()
      await client.save(doc)
      const dispatchCalls = client.store.dispatch.mock.calls
      expect(dispatchCalls.slice(-2)[0][0]).toMatchObject({
        definition: expect.objectContaining({
          document: expect.objectContaining({
            label: 'Buy croissants',
            done: false
          }),
          mutationType: 'UPDATE_DOCUMENT'
        })
      })
    })

    it('should dehydrate relationships', async () => {
      class FakeHasMany extends Association {
        dehydrate(doc) {
          return {
            ...doc,
            [this.name]: this.target[this.name]
          }
        }
      }
      const rawDoc = {
        ...TODO_1,
        authors: ['author1', 'author2']
      }
      const hydratedDoc = {
        ...TODO_1,
        authors: new FakeHasMany(rawDoc, 'authors', 'io.cozy.authors', {})
      }
      await client.save(hydratedDoc, { as: 'updateTodo' })
      expect(client.store.dispatch.mock.calls[0][0]).toEqual(
        initMutation('updateTodo', {
          mutationType: 'UPDATE_DOCUMENT',
          document: {
            ...rawDoc,
            cozyMetadata: {
              updatedAt: MOCKED_DATE,
              updatedByApps: [
                {
                  date: MOCKED_DATE,
                  slug: APP_NAME,
                  version: APP_VERSION
                }
              ]
            }
          }
        })
      )
    })
  })

  describe('saveAll', () => {
    it('should not work with docs of different doctypes', async () => {
      const client = new CozyClient()
      await expect(
        client.saveAll([
          { _type: 'io.cozy.todos', label: 'Buy milk', done: false },
          { _type: 'io.czoy.simpsons', name: 'Homer' }
        ])
      ).rejects.toEqual(
        new Error('saveAll can only save documents with the same doctype')
      )
    })

    it('should work with the default stack client', async () => {
      const client = new CozyClient()
      client.ensureStore()
      jest.spyOn(client.store, 'dispatch')
      client.stackClient.fetchJSON = jest.fn().mockImplementation((...args) => {
        console.log(...args)
      })
      client.stackClient.collection = () => {
        return {
          updateAll: jest.fn().mockImplementation(documents => {
            return documents.map((d, i) => ({
              ok: true,
              id: d._id,
              rev: `1-deadbeef-${i}`
            }))
          })
        }
      }
      const docs = [TODO_1, TODO_2, TODO_3]
      client.store.dispatch.mockReset()
      const res = await client.saveAll(docs)
      expect(client.store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'RECEIVE_MUTATION_RESULT',
          response: expect.objectContaining({
            data: expect.any(Array)
          })
        })
      )
      expect(res.data).toEqual([
        expect.objectContaining({ _rev: '1-deadbeef-0' }),
        expect.objectContaining({ _rev: '1-deadbeef-1' }),
        expect.objectContaining({ _rev: '1-deadbeef-2' })
      ])
    })
  })

  describe('destroy', () => {
    let doc
    beforeEach(() => {
      client.setData(
        normalizeData({
          'io.cozy.todos': [TODO_1]
        })
      )
      doc = { ...TODO_1, label: 'Buy croissants' }
      client.store.dispatch.mockReset()
    })

    it('should remove the document from the store', async () => {
      await client.destroy(doc)
      expect(client.store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          definition: {
            document: expect.objectContaining({
              _id: 'todo_1'
            }),
            mutationType: 'DELETE_DOCUMENT'
          },
          mutationId: '1'
        })
      )
    })
  })

  describe('getDocumentSavePlan', () => {
    it('should handle missing _rev and _id', () => {
      const NEW_FOO = {
        attributes: {
          bar: 'Zap'
        }
      }
      const mutation = client.getDocumentSavePlan(NEW_FOO)
      expect(mutation.mutationType).toBe('CREATE_DOCUMENT')
    })

    it('should handle fixed _id', () => {
      const NEW_FOO = {
        _id: '29328139a6ed4320bdd75d28141e8fb2',
        attributes: {
          bar: 'Zap'
        }
      }
      const mutation = client.getDocumentSavePlan(NEW_FOO)
      expect(mutation.mutationType).toBe('CREATE_DOCUMENT')
    })

    it('should handle _rev for update', () => {
      const OLD_FOO = {
        _id: '29328139a6ed4320bdd75d28141e8fb2',
        _rev: '1-5e3e3c68250747589266c23ce507b1a4'
      }
      const mutation = client.getDocumentSavePlan(OLD_FOO)
      expect(mutation.mutationType).toBe('UPDATE_DOCUMENT')
    })

    it('should add cozy metadata when creating a document', () => {
      const doc = {
        _type: 'io.cozy.todos',
        cozyMetadata: {
          customField: 'foo'
        }
      }
      const {
        document: { cozyMetadata }
      } = client.getDocumentSavePlan(doc)
      expect(cozyMetadata.createdByApp).toEqual(APP_NAME)
      expect(cozyMetadata.customField).toEqual('foo')
    })

    it('should add cozy metadata when updating a document', () => {
      const doc = {
        _id: '29328139a6ed4320bdd75d28141e8fb2',
        _rev: '1-5e3e3c68250747589266c23ce507b1a4',
        _type: 'io.cozy.todos',
        cozyMetadata: {
          createdByApp: 'other-app',
          updatedByApps: [
            {
              date: '2016-01-15T12:33:00.225Z',
              slug: 'other-app',
              version: 27
            }
          ]
        }
      }
      const {
        document: { cozyMetadata }
      } = client.getDocumentSavePlan(doc)
      expect(cozyMetadata.createdByApp).toEqual('other-app')
      expect(cozyMetadata.updatedByApps).toEqual([
        {
          date: MOCKED_DATE,
          slug: APP_NAME,
          version: APP_VERSION
        },
        {
          date: '2016-01-15T12:33:00.225Z',
          slug: 'other-app',
          version: 27
        }
      ])
    })

    it('should handle references for a new document with mutation creators', () => {
      const NEW_TODO = {
        _type: 'io.cozy.todos',
        label: 'Buy RAM',
        relationships: {
          attachments: {
            data: [
              {
                _type: 'io.cozy.files',
                _id: 1
              }
            ]
          }
        }
      }
      const EXPECTED_CREATED_TODO = { _id: 67890, ...NEW_TODO }
      const mutation = client.getDocumentSavePlan(NEW_TODO, {
        attachments: [{ _id: 12345, _type: 'io.cozy.files' }]
      })
      expect(Array.isArray(mutation)).toBe(true)
      expect(typeof mutation[1] === 'function').toBe(true)
      expect(mutation[1]({ data: EXPECTED_CREATED_TODO })).toEqual([
        Mutations.addReferencesTo(EXPECTED_CREATED_TODO, [
          { _id: 12345, _type: 'io.cozy.files' }
        ])
      ])
    })

    it('should handle references for a new file with relationship', () => {
      // icons is a has-many relationship defined in __tests__/fixtures for files
      const NEW_FILE = {
        _type: 'io.cozy.files',
        icons: [
          {
            id: 67890,
            type: 'io.cozy.files'
          }
        ],
        relationships: { icons: [{ _id: 67890, _type: 'io.cozy.files' }] }
      }
      const EXPECTED_CREATED_FILE = {
        _id: 12345,
        _type: 'io.cozy.files',
        relationships: { icons: [{ _id: 67890, _type: 'io.cozy.files' }] }
      }
      const mutation = client.getDocumentSavePlan(NEW_FILE, {
        icons: [
          {
            id: 67890,
            type: 'io.cozy.files'
          }
        ]
      })
      expect(Array.isArray(mutation)).toBe(true)
      expect(typeof mutation[1] === 'function').toBe(true)
      expect(mutation[1]({ data: EXPECTED_CREATED_FILE })).toEqual([
        Mutations.addReferencedBy(EXPECTED_CREATED_FILE, [
          { id: 67890, type: 'io.cozy.files' }
        ])
      ])
    })

    it('should handle empty references', () => {
      const NEW_TODO = {
        _type: 'io.cozy.todos',
        label: 'Buy RAM',
        attachments: [{ _id: 12345, _type: 'io.cozy.files' }]
      }
      const mutation = client.getDocumentSavePlan(NEW_TODO, {
        attachments: []
      })
      expect(Array.isArray(mutation)).toBe(false)
      expect(mutation).toEqual({
        mutationType: 'CREATE_DOCUMENT',
        document: {
          ...NEW_TODO,
          cozyMetadata: {
            metadataVersion: METADATA_VERSION,
            createdAt: MOCKED_DATE,
            createdByApp: APP_NAME,
            createdByAppVersion: APP_VERSION,
            doctypeVersion: DOCTYPE_VERSION,
            updatedAt: MOCKED_DATE,
            updatedByApps: [
              {
                date: MOCKED_DATE,
                slug: APP_NAME,
                version: APP_VERSION
              }
            ],
            sourceAccount: SOURCE_ACCOUNT_ID,
            sourceAccountIdentifier: SOURCE_ACCOUNT_IDENTIFIER
          }
        }
      })
    })
  })

  describe('cozy metadata', () => {
    it('should create cozy metadata (creation trigger)', () => {
      const doc = {
        _type: 'io.cozy.todos'
      }
      const { cozyMetadata } = client.ensureCozyMetadata(doc, {
        event: 'creation'
      })
      expect(cozyMetadata).toEqual({
        metadataVersion: METADATA_VERSION,
        doctypeVersion: DOCTYPE_VERSION,
        createdByApp: APP_NAME,
        sourceAccount: SOURCE_ACCOUNT_ID,
        sourceAccountIdentifier: SOURCE_ACCOUNT_IDENTIFIER,
        createdByAppVersion: APP_VERSION,
        updatedByApps: [
          {
            date: MOCKED_DATE,
            slug: APP_NAME,
            version: APP_VERSION
          }
        ],
        createdAt: MOCKED_DATE,
        updatedAt: MOCKED_DATE
      })
    })

    it('should accept custom values for cozy metadata (creation trigger)', () => {
      const doc = {
        _type: 'io.cozy.todos',
        cozyMetadata: {
          createdByApp: 'My great app',
          doctypeVersion: 42
        }
      }
      const { cozyMetadata } = client.ensureCozyMetadata(doc, {
        event: 'creation'
      })
      expect(cozyMetadata).toEqual({
        metadataVersion: METADATA_VERSION,
        doctypeVersion: 42,
        createdByApp: 'My great app',
        sourceAccount: SOURCE_ACCOUNT_ID,
        sourceAccountIdentifier: SOURCE_ACCOUNT_IDENTIFIER,
        createdByAppVersion: APP_VERSION,
        updatedByApps: [
          {
            date: MOCKED_DATE,
            slug: APP_NAME,
            version: APP_VERSION
          }
        ],
        createdAt: MOCKED_DATE,
        updatedAt: MOCKED_DATE
      })
    })

    it('should update existing cozy metadata (update trigger)', () => {
      const doc = {
        _type: 'io.cozy.todos',
        cozyMetadata: {
          metadataVersion: 2,
          doctypeVersion: 4,
          createdByApp: 'previous-app',
          updatedByApps: [
            {
              date: '2017-03-08T09:14:00.185Z',
              slug: 'previous-app',
              version: 8
            }
          ],
          updatedAt: '2017-03-08T09:14:00.185Z'
        }
      }
      const { cozyMetadata } = client.ensureCozyMetadata(doc, {
        event: 'update'
      })
      expect(cozyMetadata).toEqual({
        metadataVersion: 2,
        doctypeVersion: 4,
        createdByApp: 'previous-app',
        updatedByApps: [
          {
            date: MOCKED_DATE,
            slug: APP_NAME,
            version: APP_VERSION
          },
          {
            date: '2017-03-08T09:14:00.185Z',
            slug: 'previous-app',
            version: 8
          }
        ],
        updatedAt: MOCKED_DATE
      })
    })

    it('should not create duplicates in updatedByApps (update trigger)', () => {
      const doc = {
        _type: 'io.cozy.todos',
        cozyMetadata: {
          doctypeVersion: 4,
          createdByApp: 'previous-app',
          updatedByApps: [
            {
              date: '2017-03-08T09:14:00.185Z',
              slug: APP_NAME,
              version: 1
            }
          ],
          updatedAt: '2017-03-08T09:14:00.185Z'
        }
      }
      const { cozyMetadata } = client.ensureCozyMetadata(doc, {
        event: 'update'
      })
      expect(cozyMetadata).toEqual({
        doctypeVersion: 4,
        createdByApp: 'previous-app',
        updatedByApps: [
          {
            date: MOCKED_DATE,
            slug: APP_NAME,
            version: APP_VERSION
          }
        ],
        updatedAt: MOCKED_DATE
      })
    })
  })

  describe('query', () => {
    let query, fakeResponse
    beforeEach(() => {
      query = Q('io.cozy.todos')
      fakeResponse = { data: 'FAKE!!!' }
      jest.clearAllMocks()
    })
    it('should throw an error if the option.enabled is not a boolean', async () => {
      await expect(
        client.query(query, { as: 'allTodos', enabled: '' })
      ).rejects.toThrow()
    })
    it('should first dispatch a INIT_QUERY action', async () => {
      requestHandler.mockResolvedValueOnce(fakeResponse)
      await client.query(query, { as: 'allTodos' })
      expect(client.store.dispatch.mock.calls[0][0]).toEqual(
        initQuery('allTodos', { doctype: 'io.cozy.todos' }, { as: 'allTodos' })
      )
    })

    it('should then dispatch a RECEIVE_QUERY_RESULT action', async () => {
      requestHandler.mockResolvedValueOnce(fakeResponse)
      await client.query(query, { as: 'allTodos' })
      const dispatchCalls = client.store.dispatch.mock.calls
      const lastDispatchCall = dispatchCalls[dispatchCalls.length - 1]
      expect(lastDispatchCall[0]).toEqual(
        receiveQueryResult('allTodos', fakeResponse)
      )
    })

    it('should dispatch a RECEIVE_QUERY_ERROR action if an error occurs', async () => {
      const error = new Error('Fake error')
      requestHandler.mockRejectedValueOnce(error)
      try {
        await client.query(query, { as: 'allTodos' })
      } catch (e) {} // eslint-disable-line no-empty
      const dispatchCalls = client.store.dispatch.mock.calls
      const lastDispatchCall = dispatchCalls[dispatchCalls.length - 1]
      expect(lastDispatchCall[0]).toEqual(receiveQueryError('allTodos', error))
    })

    it('should resolve to the query response', async () => {
      requestHandler.mockResolvedValueOnce(fakeResponse)
      const resp = await client.query(query)
      expect(resp).toEqual(fakeResponse)
    })

    it('should call the link with the query', async () => {
      requestHandler.mockResolvedValueOnce(fakeResponse)
      await client.query(query)
      expect(requestHandler).toHaveBeenCalledTimes(1)
      expect(requestHandler.mock.calls[0][0]).toBe(query)
    })

    it('should resolve to a null document when a getById with includes misses', async () => {
      requestHandler.mockResolvedValueOnce({ data: null })

      const resp = await client.query(
        Q('io.cozy.todos')
          .getById('missing')
          .include(['attachments'])
      )

      expect(requestHandler).toHaveBeenCalledTimes(1)
      expect(resp.data).toBeNull()
    })

    it('should handle queries with includes', async () => {
      requestHandler.mockReturnValueOnce(
        Promise.resolve({
          data: [TODO_1, TODO_2, TODO_3]
        })
      )
      requestHandler
        .mockReturnValueOnce(
          Promise.resolve({
            data: [
              { _id: 'abc', _type: 'io.cozy.files' },
              { _id: 'def', _type: 'io.cozy.files' }
            ],
            included: [
              { _id: 'abc', _type: 'io.cozy.files', name: 'abc.png' },
              { _id: 'def', _type: 'io.cozy.files', name: 'def.png' }
            ]
          })
        )
        .mockResolvedValueOnce({ data: [], included: [] })
        .mockResolvedValueOnce({ data: [], included: [] })

      const resp = await client.query(
        Q('io.cozy.todos').include(['attachments'])
      )

      expect(requestHandler).toHaveBeenCalledTimes(4)
      expect(resp).toEqual({
        data: [
          {
            ...TODO_1,
            relationships: {
              attachments: {
                data: [
                  { _id: 'abc', _type: 'io.cozy.files' },
                  { _id: 'def', _type: 'io.cozy.files' }
                ]
              }
            }
          },
          {
            ...TODO_2,
            relationships: {
              attachments: {
                data: []
              }
            }
          },
          {
            ...TODO_3,
            relationships: {
              attachments: {
                data: []
              }
            }
          }
        ],
        included: [
          { _id: 'abc', _type: 'io.cozy.files', name: 'abc.png' },
          { _id: 'def', _type: 'io.cozy.files', name: 'def.png' }
        ]
      })
    })

    it('should set the correct name to the query', async () => {
      requestHandler.mockResolvedValueOnce(fakeResponse)
      const getById = Q('io.cozy.files').getById('1')
      await client.query(getById)
      expect(client.store.dispatch.mock.calls[0][0]).toEqual(
        expect.objectContaining({
          queryId: 'io.cozy.files/1'
        })
      )
    })
    it('should use the name passed as an argument', async () => {
      requestHandler.mockResolvedValueOnce(fakeResponse)
      const getById = Q('io.cozy.files').getById('1')
      await client.query(getById, { as: 'toto' })
      expect(client.store.dispatch.mock.calls[0][0]).toEqual(
        expect.objectContaining({
          queryId: 'toto'
        })
      )
    })
    it('should name the query correctly', async () => {
      requestHandler.mockResolvedValueOnce(fakeResponse)
      await client.query(query, { as: 'allTodos' })
      expect(client.store.dispatch.mock.calls[0][0]).toEqual(
        initQuery('allTodos', { doctype: 'io.cozy.todos' }, { as: 'allTodos' })
      )
    })

    it('should do nothing if the request is already in a loading status', async () => {
      jest.spyOn(client, 'requestQuery')
      jest.spyOn(client, 'dispatch')
      getQueryFromState.mockReturnValueOnce({
        fetchStatus: 'loading'
      })
      await client.query(query, { as: 'allTodos' })
      expect(client.requestQuery).not.toHaveBeenCalled()
      expect(client.dispatch).not.toHaveBeenCalled()
    })

    it('should return the same result if the query is run while she is already in loading status whithout requesting the query twice', async () => {
      jest.spyOn(client, 'requestQuery')
      requestHandler.mockResolvedValue({})

      const [resp, resp2] = await Promise.all([
        client.query(query, { as: 'allTodos' }),
        client.query(query, { as: 'allTodos' })
      ])
      expect(resp).toStrictEqual(resp2)
      expect(client.requestQuery).toHaveBeenCalledTimes(1)
    })

    it('should handle the executeFromStore option', async () => {
      executeQueryFromState.mockReturnValueOnce([])
      await client.query(query, { executeFromStore: true })
      expect(requestHandler).toHaveBeenCalledTimes(0)
      expect(executeQueryFromState).toHaveBeenCalledTimes(1)
    })

    it('should persist virtual document when no meta.rev nor _rev', async () => {
      jest.spyOn(client, 'requestQuery')
      requestHandler.mockResolvedValue({
        data: {
          _id: 'some_id'
        }
      })

      await client.query(query, { as: 'allTodos' })

      expect(persistHandler).toHaveBeenCalledWith(
        {
          _id: 'some_id'
        },
        expect.anything()
      )
    })

    it('should not persist virtual document when meta.rev', async () => {
      jest.spyOn(client, 'requestQuery')
      requestHandler.mockResolvedValue({
        data: {
          _id: 'some_id',
          meta: {
            rev: 'SOME_REV'
          }
        }
      })

      await client.query(query, { as: 'allTodos' })

      expect(persistHandler).not.toHaveBeenCalled()
    })

    it('should not persist virtual document when _rev', async () => {
      jest.spyOn(client, 'requestQuery')
      requestHandler.mockResolvedValue({
        data: {
          _id: 'some_id',
          _rev: 'SOME_REV'
        }
      })

      await client.query(query, { as: 'allTodos' })

      expect(persistHandler).not.toHaveBeenCalled()
    })

    it('should persist array of virtual documents when no meta.rev nor _rev', async () => {
      jest.spyOn(client, 'requestQuery')
      requestHandler.mockResolvedValue({
        data: [
          {
            _id: 'some_id'
          },
          {
            _id: 'some_id2'
          }
        ]
      })

      await client.query(query, { as: 'allTodos' })

      expect(persistHandler).toHaveBeenCalledWith(
        {
          _id: 'some_id'
        },
        expect.anything()
      )
      expect(persistHandler).toHaveBeenCalledWith(
        {
          _id: 'some_id2'
        },
        expect.anything()
      )
    })

    it('should not persist virtual documents if cozyLocalOnly', async () => {
      jest.spyOn(client, 'requestQuery')
      requestHandler.mockResolvedValue({
        data: [
          {
            _id: 'some_id',
            cozyLocalOnly: true
          }
        ]
      })

      await client.query(query, { as: 'allTodos' })

      expect(persistHandler).not.toHaveBeenCalled()
    })

    it('should enforce persisting io.cozy.files.shortcuts as virtual documents even if meta.rev exists', async () => {
      jest.spyOn(client, 'requestQuery')
      requestHandler.mockResolvedValue({
        data: [
          {
            _id: 'some_id',
            meta: {
              rev: 'SOME_REV'
            }
          }
        ]
      })
      const shortcutsQuery = Q('io.cozy.files.shortcuts')

      await client.query(shortcutsQuery, { as: 'allShortcuts' })

      expect(persistHandler).toHaveBeenCalled()
    })

    describe('relationship with query failure', () => {
      beforeEach(() => {
        jest.spyOn(HasManyFiles, 'query').mockImplementation(() => {
          throw new Error('Query error')
        })
      })

      afterEach(() => {
        HasManyFiles.query.mockRestore()
      })

      it('should not fail to retrieve document if relationship query fails', async () => {
        requestHandler.mockReturnValueOnce(
          Promise.resolve({
            data: [TODO_1]
          })
        )
        requestHandler.mockReturnValueOnce(
          Promise.resolve({
            data: [
              { _id: 'abc', _type: 'io.cozy.files' },
              { _id: 'def', _type: 'io.cozy.files' }
            ],
            included: [
              { _id: 'abc', _type: 'io.cozy.files', name: 'abc.png' },
              { _id: 'def', _type: 'io.cozy.files', name: 'def.png' }
            ]
          })
        )

        const resp = await client.query(
          Q('io.cozy.todos').include(['attachments'])
        )

        expect(requestHandler).toHaveBeenCalledTimes(1)
        expect(resp).toEqual({
          data: [
            {
              ...TODO_1,
              relationships: {}
            }
          ],
          included: []
        })
      })
    })

    it('should do nothing if fetch policy returns false', async () => {
      jest.spyOn(client, 'requestQuery')
      const fetchPolicy = jest.fn(() => false)
      await client.query(query, { as: 'allTodos', fetchPolicy })
      const state = client.store.getState()
      const queryState = getQueryFromState(state.cozy, 'allTodos')
      expect(fetchPolicy).toHaveBeenCalledWith(queryState)
      expect(client.requestQuery).not.toHaveBeenCalled()
    })

    it('should dispatch a INIT_QUERY action if status is not loaded', async () => {
      requestHandler.mockResolvedValueOnce(fakeResponse)
      getQueryFromState.mockReturnValueOnce({
        fetchStatus: 'pending'
      })
      await client.query(query, { as: 'allTodos' })
      expect(client.store.dispatch.mock.calls[0][0]).toEqual(
        initQuery('allTodos', { doctype: 'io.cozy.todos' }, { as: 'allTodos' })
      )
    })

    it('should dispatch a INIT_QUERY action if no skip and no bookmark', async () => {
      requestHandler.mockResolvedValueOnce(fakeResponse)
      getQueryFromState.mockReturnValueOnce({
        fetchStatus: 'loaded'
      })
      await client.query(query, { as: 'allTodos' })
      expect(client.store.dispatch.mock.calls[0][0]).toEqual(
        initQuery('allTodos', { doctype: 'io.cozy.todos' }, { as: 'allTodos' })
      )
    })

    it('should dispatch a LOAD_QUERY action', async () => {
      requestHandler.mockResolvedValueOnce(fakeResponse)
      getQueryFromState.mockReturnValueOnce({
        fetchStatus: 'loaded'
      })
      await client.query(query, { as: 'allTodos' })
      expect(client.store.dispatch.mock.calls[1][0]).toEqual(
        loadQuery('allTodos', {})
      )
    })

    it('should dispatch a LOAD_QUERY action providing backgroundFetching when set', async () => {
      requestHandler.mockResolvedValueOnce(fakeResponse)
      getQueryFromState.mockReturnValueOnce({
        fetchStatus: 'loaded'
      })
      await client.query(query, { as: 'allTodos', backgroundFetching: true })
      expect(client.store.dispatch.mock.calls[1][0]).toEqual(
        loadQuery('allTodos', { backgroundFetching: true })
      )
    })

    it('should dispatch a RECEIVE_QUERY_RESULT action providing backgroundFetching when set', async () => {
      requestHandler.mockResolvedValueOnce(fakeResponse)
      getQueryFromState.mockReturnValueOnce({
        fetchStatus: 'loaded'
      })
      query.skip = 100
      await client.query(query, { as: 'allTodos', backgroundFetching: true })
      const dispatchCalls = client.store.dispatch.mock.calls
      const lastDispatchCall = dispatchCalls[dispatchCalls.length - 1]
      expect(lastDispatchCall[0]).toEqual(
        receiveQueryResult('allTodos', fakeResponse, {
          backgroundFetching: true
        })
      )
    })

    it('should dispatch a RECEIVE_QUERY_RESULT action if query has skip', async () => {
      requestHandler.mockResolvedValueOnce(fakeResponse)
      getQueryFromState.mockReturnValueOnce({
        fetchStatus: 'loaded'
      })
      query.skip = 100
      await client.query(query, { as: 'allTodos' })
      const dispatchCalls = client.store.dispatch.mock.calls
      const lastDispatchCall = dispatchCalls[dispatchCalls.length - 1]
      expect(lastDispatchCall[0]).toEqual(
        receiveQueryResult('allTodos', fakeResponse)
      )
    })

    it('should dispatch a RECEIVE_QUERY_RESULT action if query has bookmark', async () => {
      requestHandler.mockResolvedValueOnce(fakeResponse)
      getQueryFromState.mockReturnValueOnce({
        fetchStatus: 'loaded'
      })
      query.bookmark = 'fake-bookmark'
      await client.query(query, { as: 'allTodos' })
      const dispatchCalls = client.store.dispatch.mock.calls
      const lastDispatchCall = dispatchCalls[dispatchCalls.length - 1]
      expect(lastDispatchCall[0]).toEqual(
        receiveQueryResult('allTodos', fakeResponse)
      )
    })

    describe('setupOnError', () => {
      const setupOnError = () => {
        const error = new TypeError('Failed to fetch')
        requestHandler.mockRejectedValueOnce(error)
        return jest.fn().mockReturnValueOnce(() => true)
      }

      it('should call onError callback when an error is thrown. Callback passed as argument', async () => {
        const onError = setupOnError()

        await client.query(query, { as: 'allTodos', onError })
        expect(onError).toBeCalled()
      })

      it('should call onError callback when an error is caught. It is passed during instantiation', async () => {
        const setupOnError = () => jest.fn().mockReturnValueOnce(() => true)
        const onError = setupOnError()
        const client = new CozyClient({ onError })

        await client.query(query, { as: 'allTodos' })
        expect(onError).toBeCalled()
      })

      it('should call onError callback when an error is catched. It is passed with setOnError', async () => {
        const onError = setupOnError()
        client.setOnError(onError)

        await client.query(query, { as: 'allTodos' })
        expect(onError).toBeCalled()
      })

      it('should throw an error when we call setOnError twice (or several times)', async () => {
        const client = new CozyClient({})
        const onError = () => true

        const funcShouldThrow = () => client.setOnError(onError)
        expect(funcShouldThrow).not.toThrow()
        expect(funcShouldThrow).toThrow('On Error is already defined')
      })

      it('should throw an error when there is no onError callback', async () => {
        const error = new TypeError('Failed to fetch')
        requestHandler.mockRejectedValueOnce(error)

        await expect(client.query(query, { as: 'allTodos' })).rejects.toThrow(
          'Failed to fetch'
        )
      })
    })
  })

  describe('queryAll', () => {
    let query

    beforeEach(() => {
      query = Q('io.cozy.todos')
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    it('should call `query` until there is no more document to query', async () => {
      let i = 0
      jest.spyOn(client, 'query').mockImplementation(() => {
        let resp

        if (i === 0) {
          resp = { data: [{ _id: '0', label: 'Shopping' }], next: true }
        }

        if (i === 1) {
          resp = { data: [{ _id: '1', label: 'Laundry' }], next: true }
        }

        if (i === 2) {
          resp = { data: [{ _id: '2', label: 'Cook' }], next: true }
        }

        if (i === 3) {
          resp = { data: [{ _id: '3', label: 'Rest' }], next: false }
        }

        getRawQueryFromState.mockReturnValue(resp)

        ++i

        return resp
      })

      const offsetSpy = jest.spyOn(query, 'offset')
      const offsetBookmarkSpy = jest.spyOn(query, 'offsetBookmark')
      const documents = await client.queryAll(query)

      expect(client.query).toHaveBeenCalledTimes(4)
      expect(offsetSpy).toHaveBeenCalled()
      expect(offsetBookmarkSpy).not.toHaveBeenCalled()
      expect(getRawQueryFromState).toHaveBeenCalled()
      expect(documents).toMatchSnapshot()
    })

    it('should use offsetBookmark when a bookmark is in the query result', async () => {
      jest
        .spyOn(client, 'query')
        .mockResolvedValueOnce({
          data: [{ _id: '0', label: 'Shopping' }],
          next: true,
          bookmark: '123'
        })
        .mockResolvedValue({
          data: [{ _id: '1', label: 'Laundry' }],
          next: false
        })

      const offsetSpy = jest.spyOn(query, 'offset')
      const offsetBookmarkSpy = jest.spyOn(query, 'offsetBookmark')

      const documents = await client.queryAll(query)

      expect(client.query).toHaveBeenCalledTimes(2)
      expect(offsetSpy).not.toHaveBeenCalled()
      expect(offsetBookmarkSpy).toHaveBeenCalled()
      expect(getRawQueryFromState).not.toHaveBeenCalled()
      expect(documents).toMatchSnapshot()
    })
    it('should not throw error if there is an error', async () => {
      const error = new Error('Fake error')
      jest.spyOn(client, 'query').mockRejectedValue(error)

      await expect(client.queryAll(query)).resolves.not.toThrowError()
    })
  })

  describe('mutate', () => {
    const mutation = { mutationType: 'FAKE' }
    const fakeResponse = {
      data: [{ ...TODO_1, label: 'Buy croissants', rev: 2 }]
    }

    it('should first dispatch a INIT_MUTATION action', async () => {
      await client.mutate(mutation, { as: 'updateTodo' })
      expect(client.store.dispatch.mock.calls[0][0]).toEqual(
        initMutation('updateTodo', mutation)
      )
    })

    it('should call the link with the mutation', async () => {
      await client.mutate(mutation)
      expect(requestHandler.mock.calls[0][0]).toBe(mutation)
    })

    it('should then dispatch a RECEIVE_MUTATION_RESULT action', async () => {
      requestHandler.mockResolvedValueOnce(fakeResponse)
      await client.mutate(mutation, { as: 'updateTodo' })
      expect(client.store.dispatch.mock.calls[1][0]).toEqual(
        receiveMutationResult('updateTodo', fakeResponse, {}, mutation)
      )
    })

    it('should resolve to the mutation response', async () => {
      requestHandler.mockResolvedValueOnce(fakeResponse)
      const resp = await client.mutate(mutation)
      expect(resp).toEqual(fakeResponse)
    })

    it('should dispatch a RECEIVE_MUTATION_ERROR action if an error occurs', async () => {
      const error = new Error('Fake error')
      requestHandler.mockRejectedValueOnce(error)
      try {
        await client.mutate(mutation, { as: 'updateTodo' })
      } catch (e) {} // eslint-disable-line no-empty
      expect(client.store.dispatch.mock.calls[1][0]).toEqual(
        receiveMutationError('updateTodo', error, mutation)
      )
    })

    it('should handle an array of mutations (including mutation creators)', async () => {
      const FAKE_MUTATION_1 = { mutationType: 'FAKE_1' }
      const FAKE_MUTATION_2 = resp => ({ mutationType: 'FAKE_2', resp })
      requestHandler.mockResolvedValue(fakeResponse)
      await client.mutate([mutation, FAKE_MUTATION_1, FAKE_MUTATION_2])
      expect(requestHandler).toHaveBeenCalledTimes(3)
      expect(requestHandler.mock.calls[0][0]).toBe(mutation)
      expect(requestHandler.mock.calls[1][0]).toBe(FAKE_MUTATION_1)
      expect(requestHandler.mock.calls[2][0]).toEqual({
        mutationType: 'FAKE_2',
        resp: fakeResponse
      })
    })
  })

  describe('hydratation', () => {
    it('getQueryFromState should hydrate the documents if asked', async () => {
      client.store.dispatch.mockRestore()
      client.requestQuery = async ({ doctype }) => {
        if (doctype === 'io.cozy.todos') {
          return {
            data: [TODO_WITH_AUTHOR]
          }
        } else if (doctype == 'io.cozy.persons') {
          return {
            data: AUTHORS
          }
        }
      }
      await client.query({ doctype: 'io.cozy.todos' }, { as: 'todos' })
      await client.query({ doctype: 'io.cozy.persons' }, { as: 'people' })

      getQueryFromState.mockReturnValueOnce({
        data: AUTHORS
      })
      const { data: rawTodos } = client.getQueryFromState('todos')

      getQueryFromState.mockReturnValueOnce({
        definition: { doctype: 'io.cozy.todos' },
        data: [TODO_WITH_AUTHOR]
      })
      const { data: hydratedTodos } = client.getQueryFromState('todos', {
        hydrated: true
      })
      expect(rawTodos[0].authors).toBeUndefined()

      // Since the todo is hydrated, we can access authors through the relationship
      expect(hydratedTodos[0].authors.data[0].name).toBe('Alice')
    })

    it('should hydrate relationships into associations with helper methods in the context of a query', () => {
      const doc = client
        .hydrateDocuments(
          'io.cozy.todos',
          [
            {
              ...TODO_1,
              relationships: {
                attachments: {
                  data: [
                    { _id: 'abc', _type: 'io.cozy.files' },
                    { _id: 'def', _type: 'io.cozy.files' }
                  ]
                }
              }
            }
          ],
          'allTodos'
        )
        .shift()
      expect(doc.attachments).toBeInstanceOf(HasManyFiles)
    })

    it('should not fail on null (when getting absent documents from the store)', () => {
      const doc = client
        .hydrateDocuments('io.cozy.todos', [null], 'allTodos')
        .shift()
      expect(doc).toBe(null)
    })

    it('should hydrate relationships if the relationship exists', () => {
      const resp = client.hydrateDocument(TODO_WITH_AUTHOR)
      expect(resp.authors).not.toBe(undefined)
      expect(resp.attachments).toBe(undefined)
    })

    it('should not hydrate relationships if the relationship does not exist', () => {
      const resp = client.hydrateDocument(TODO_WITH_NONEXISTING_RELATIONSHIP)
      expect(resp.authors).toBe(undefined)
      expect(resp.attachments).toBe(undefined)
      expect(resp.broken).toBe(undefined)
    })

    it('should not hydrate relationships if not specified', () => {
      getQueryFromState.mockReturnValueOnce({
        definition: { doctype: 'io.cozy.todos' },
        data: [TODO_WITH_AUTHOR]
      })
      const resp = client.getQueryFromState('allTodos')
      expect(resp.data[0].authors).toBe(undefined)
      expect(resp.data[0].attachments).toBe(undefined)
    })

    it('should hydrate relationships only if the relationship does exist ', () => {
      getQueryFromState.mockReturnValueOnce({
        definition: { doctype: 'io.cozy.todos' },
        data: [TODO_WITH_AUTHOR]
      })
      const resp = client.getQueryFromState('allTodos', { hydrated: true })
      expect(resp.data[0].authors).not.toBe(undefined)
      expect(resp.data[0].attachments).toBe(undefined)
    })

    it('should hydrate relationships if the relationship does not exist but hydration is forced', () => {
      const newClient = new CozyClient({
        schema: SCHEMA,
        autoHydrate: true
      })
      getQueryFromState.mockReturnValueOnce({
        definition: { doctype: 'io.cozy.todos' },
        data: [TODO_WITH_AUTHOR]
      })
      const resp = newClient.getQueryFromState('allTodos')
      expect(resp.data[0].authors).not.toBe(undefined)
      expect(resp.data[0].attachments).not.toBe(undefined)
    })
  })

  describe('serialization', () => {
    it('should be snapshotted in a simplified format', () => {
      const client = new CozyClient({ uri: 'http://localhost:8080' })
      expect(client).toMatchSnapshot()
    })
  })

  describe('fetchQueryAndGetFromState', () => {
    const setup = () => {
      const client = new CozyClient({})
      const fileCol = new FileCollection('io.cozy.files', client.stackClient)
      client.stackClient.collection.mockReturnValue(fileCol)
      client.stackClient.fetchJSON = jest.fn().mockResolvedValue({
        data: {
          _id: 'resultFromQuery'
        }
      })
      getQueryFromState.mockReturnValue({
        data: {
          _id: 'resultFromState'
        }
      })
      return { client }
    }

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('should fetch data if fetchPolicy is true and get result from state', async () => {
      const query = {
        definition: Q('io.cozy.files').getById('id'),
        options: {
          as: 'io.cozy.files/id',
          fetchPolicy: jest.fn(() => true)
        }
      }
      const { client } = setup()

      const res = await client.fetchQueryAndGetFromState(query)
      expect(client.stackClient.fetchJSON).toHaveBeenCalledWith(
        'GET',
        '/files/id'
      )
      expect(res).not.toMatchObject({
        data: {
          _id: 'resultFromQuery'
        }
      })
      expect(res).toMatchObject({
        data: {
          _id: 'resultFromState'
        }
      })
    })

    it('should not fetch data if fetchPolicy is false and get result from state', async () => {
      const query = {
        definition: Q('io.cozy.files').getById('id'),
        options: {
          as: 'io.cozy.files/id',
          fetchPolicy: jest.fn(() => false)
        }
      }
      const { client } = setup()

      const res = await client.fetchQueryAndGetFromState(query)
      expect(client.stackClient.fetchJSON).not.toHaveBeenCalled()
      expect(res).toMatchObject({
        data: {
          _id: 'resultFromState'
        }
      })
    })
  })

  describe('resetQuery', () => {
    const fakeResponse = {
      data: [TODO_1, TODO_2, TODO_3]
    }
    const queryId = 'allTodos'

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('should reset the query state and refetch it', async () => {
      isQueryExisting.mockReturnValue(true)
      requestHandler.mockResolvedValue(fakeResponse)
      const queryDefinition = Q('io.cozy.todos')
      getQueryFromState.mockReturnValue({
        definition: queryDefinition,
        id: queryId,
        data: fakeResponse
      })

      await client.resetQuery(queryId)

      const dispatchCalls = client.store.dispatch.mock.calls
      const firstDispatchCall = dispatchCalls[0]
      expect(firstDispatchCall[0]).toEqual(resetQuery(queryId))
      const lastDispatchCall = dispatchCalls[dispatchCalls.length - 1]
      expect(lastDispatchCall[0]).toEqual(
        receiveQueryResult('allTodos', fakeResponse)
      )
    })

    it('should return null when the query is not found', async () => {
      isQueryExisting.mockReturnValue(false)
      const res = await client.resetQuery(queryId)
      expect(res).toBe(null)
    })
  })
})

describe('file creation', () => {
  const setup = (options = {}) => {
    const client = new CozyClient({
      schema: options.schema || SCHEMA
    })
    const fileCol = new FileCollection('io.cozy.files', client.stackClient)
    client.stackClient.collection.mockReturnValue(fileCol)
    client.stackClient.fetchJSON = jest.fn().mockResolvedValue({
      data: {
        _id: '1337'
      }
    })
    return { client }
  }

  it('should be possible to create a directory', async () => {
    const { client } = setup()
    const { data: doc } = await client.create('io.cozy.files', {
      dirId: 'dirid1337',
      type: 'directory',
      name: 'toto.pdf'
    })
    expect(doc._id).toEqual('1337')
    expect(client.stackClient.fetchJSON).toHaveBeenCalledWith(
      'POST',
      '/files/dirid1337?Name=toto.pdf&Type=directory&MetadataID=',
      undefined,
      { headers: { Date: '' } }
    )
  })

  it('should not be possible to create a document with a wrong schema', async () => {
    const customSchema = {
      validated: {
        doctype: 'io.cozy.validated',
        attributes: {
          dummy: 'dummy'
        }
      }
    }
    const { client } = setup({ schema: customSchema })
    jest
      .spyOn(client.schema, 'validateAttribute')
      .mockResolvedValue('must be unique')
    const res = client.create('io.cozy.validated', {})
    await expect(res).rejects.toEqual(new Error('Validation failed'))
  })

  it('should be possible to create a file', async () => {
    const { client } = setup()
    jest.spyOn(client, 'dispatch')
    const data = 'file-content'
    const { data: doc } = await client.create('io.cozy.files', {
      type: 'file',
      data: data,
      dirId: 'folder-id',
      name: 'toto.pdf',
      contentLength: data.length
    })
    expect(doc._id).toEqual('1337')
    expect(client.stackClient.fetchJSON).toHaveBeenCalledWith(
      'POST',
      '/files/folder-id?Name=toto.pdf&Type=file&Executable=false&Encrypted=false&MetadataID=&Size=12&SourceAccount=&SourceAccountIdentifier=',
      'file-content',
      {
        headers: { 'Content-Type': 'text/plain', 'Content-Length': '12' },
        onUploadProgress: undefined
      }
    )
    expect(client.dispatch.mock.calls.map(x => x[0].type)).toEqual([
      'INIT_MUTATION',
      'RECEIVE_MUTATION_RESULT'
    ])
  })

  it('should support creating a file with references', async () => {
    const { client } = setup()
    jest.spyOn(client, 'requestMutation')
    client.stackClient.fetchJSON = jest
      .fn()
      .mockResolvedValueOnce({
        data: {
          _id: '1337',
          relationships: { icons: [{ _id: 1, _type: 'io.cozy.files' }] }
        }
      })
      .mockResolvedValueOnce({
        data: [{ id: 1, type: 'io.cozy.files' }]
      })
    await client.create(
      'io.cozy.files',
      {
        type: 'file',
        data: 'file-content',
        dirId: 'folder-id',
        name: 'toto.pdf'
      },
      {
        icons: [{ _id: 1, _type: 'io.cozy.files' }]
      }
    )
    client.stackClient.fetchJSON = jest.fn().mockResolvedValue({
      data: [{ id: '1337', type: 'io.cozy.files' }]
    })
    const requestMutationCalls = client.requestMutation.mock.calls
    const lastCall = requestMutationCalls[requestMutationCalls.length - 1]
    expect(lastCall[0]).toEqual(
      expect.objectContaining({
        document: expect.objectContaining({
          _id: '1337'
        }),
        mutationType: 'ADD_REFERENCED_BY',
        referencedDocuments: [expect.objectContaining({ _id: 1 })]
      })
    )
  })
})

describe('file update', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })
  const setup = () => {
    const client = new CozyClient({})
    const fileCol = new FileCollection('io.cozy.files', client.stackClient)
    client.stackClient.collection.mockReturnValue(fileCol)
    return { client }
  }

  it('should be possible to update a file', async () => {
    const { client } = setup()
    client.setData(
      normalizeData({
        'io.cozy.files': [FILE_1]
      })
    )
    jest.spyOn(client.store, 'dispatch').mockImplementation(() => {})
    client.stackClient.fetchJSON = jest.fn().mockResolvedValue({
      data: {
        label: 'edited'
      }
    })
    const { data: doc } = await client.save({ ...FILE_1, label: 'edited' })
    expect(client.store.dispatch.mock.calls[0][0]).toMatchObject(
      initMutation('1', {
        mutationType: 'UPDATE_DOCUMENT',
        document: {
          ...FILE_1,
          label: 'edited'
        }
      })
    )

    expect(doc).toMatchObject({ label: 'edited' })
  })
})

describe('document creation', () => {
  it('should not be possible to create documents with references for a relationship not supporting references', async () => {
    class ExternalHasManyAuthor {}
    const client = new CozyClient({
      schema: {
        todos: {
          ...SCHEMA.todos,
          relationships: {
            authors: {
              type: ExternalHasManyAuthor,
              doctype: 'io.cozy.persons'
            }
          }
        }
      }
    })
    client.stackClient.collection = () => ({
      create: jest
        .fn()
        .mockImplementation(doc => ({ data: { ...doc, _id: 'fake-id' } }))
    })

    await expect(
      client.create(
        'io.cozy.todos',
        { label: 'Todo with external author' },
        {
          authors: [{ _id: 1, _type: 'io.cozy.persons' }]
        }
      )
    ).rejects.toEqual(
      new Error(
        'The "authors" relationship does not support references. If you need to add references to a document, its relationship class must have the methods {add,remove}References'
      )
    )
  })

  it('should be possible to create a document containing relationships', async () => {
    const client = new CozyClient({ schema: SCHEMA })
    client.stackClient.collection = () => ({
      create: jest
        .fn()
        .mockImplementation(doc => ({ data: { ...doc, _id: 'fake-id' } }))
    })
    const updatedDoc = await client.create('io.cozy.todos', {
      label: 'Todo with external author',
      relationships: {
        authors: {
          data: [{ _id: 1, _type: 'io.cozy.persons' }]
        }
      }
    })
    expect(updatedDoc.data.relationships.authors.data[0]._id).toBe(1)
  })
})

describe('CozyClient revocation handling', () => {
  let client
  let mockCallback

  beforeEach(() => {
    client = new CozyClient({})
    client.stackClient.refreshToken = jest.fn().mockImplementation(() => {
      client.stackClient.onRevocationChange(true)
    })

    mockCallback = jest.fn()
    client.on('revoked', mockCallback)
  })

  it('should call "revoked" event when token is expired', async () => {
    await client.stackClient.refreshToken()

    expect(mockCallback).toHaveBeenCalledTimes(1)
  })

  it('should not call "revoked" event when token is not expired', async () => {
    client.stackClient.refreshToken = jest.fn().mockImplementation(() => {
      client.stackClient.onRevocationChange(false)
    })

    await client.stackClient.refreshToken()

    expect(mockCallback).not.toHaveBeenCalled()
  })
})
