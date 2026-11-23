/* eslint-env jest */

import jestFetchMock from 'jest-fetch-mock'

import AppToken from './AppToken'
import CozyStackClient from './CozyStackClient'
import DocumentCollection from './DocumentCollection'
import JobCollection from './JobCollection'
import KonnectorCollection from './KonnectorCollection'
import { FetchError } from './errors'

const FAKE_RESPONSE = {
  offset: 0,
  rows: [{ id: '12345', label: 'Buy bread', done: false }],
  total_rows: 1
}

const FAKE_INIT_OPTIONS = {
  uri: 'http://cozy.tools:8080',
  token: 'aAbBcCdDeEfFgGhH'
}

const FAKE_APP_TOKEN =
  'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhcHAiLCJpYXQiOjE1NTYxMTIwOTQsImlzcyI6ImVkYXMubXljb3p5LmNsb3VkIiwic3ViIjoiaG9tZSIsInNlc3Npb25faWQiOiI4YjI1ZTgzNTkwYTg5MDg0MDUzNDIxZGE0ZmZlOTMwNiJ9.gA3Xnoliu43gwpuO88O6G59rVP_HClZ_vBp96pEjVNnZDpxU4ZnQoWmICoLXih4PvFZRj2eHjnG-eqnJx6XM2A'

const FAKE_DATA_COZY_STR = JSON.stringify({
  app: {
    editor: 'Cozy',
    icon: 'icon.svg',
    name: 'Accueil',
    prefix: 'Cozy',
    slug: 'home'
  },
  domain: 'test.mycozy.cloud',
  locale: 'fr',
  token: `${FAKE_APP_TOKEN}`,
  tracking: false
})
const FAKE_DATA_COZY = FAKE_DATA_COZY_STR.replace(/"/g, '&#34;')

const FAKE_APP_HTML = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>Cozy Home</title>
  <link rel="icon" href="//test.mycozy.cloud/assets/favicon.f56cf1d03b.ico">
  <link rel="icon" type="image/png" href="//test.mycozy.cloud/assets/favicon-16x16.192a16308f.png" sizes="16x16">
  <link rel="icon" type="image/png" href="//test.mycozy.cloud/assets/favicon-32x32.9f958fa2c7.png" sizes="32x32">
  <link rel="apple-touch-icon" sizes="180x180" href="//test.mycozy.cloud/assets/apple-touch-icon.a0e0ae4102.png"/>
    <link rel="manifest" href="/manifest.json" crossorigin="use-credentials"><meta name="msapplication-TileColor" content="#2b5797"><meta name="theme-color" content="#ffffff"><meta name="viewport" content="width=device-width,height=device-height,initial-scale=1,viewport-fit=cover"><link rel="stylesheet" href="vendors/home.c451e5ac76c8377b20c5.0.min.css"><link rel="stylesheet" href="app/home.cbb1b1050b936df11fbd.min.css"><link rel="stylesheet" type="text/css" href="//test.mycozy.cloud/assets/styles/theme.faa4e12bdc.css"> <script src="//test.mycozy.cloud/assets/js/cozy-client.605c649bc3.min.js"></script>
<link rel="stylesheet" type="text/css" href="//test.mycozy.cloud/assets/fonts/fonts.33109548ca.css">
<link rel="stylesheet" type="text/css" href="//test.mycozy.cloud/assets/css/cozy-bar.6effa2d88c.min.css">
<script src="//test.mycozy.cloud/assets/js/cozy-bar.f99c08ee53.min.js"></script></head><body><div role="application" data-cozy="${FAKE_DATA_COZY}"><script src="vendors/home.a664629f1a5622ccb459.js"></script><script src="app/home.455bbc269323b2c64382.js"></script><script src="//test.mycozy.cloud/assets/js/piwik.js" async></script></div></body></html>
`

describe('CozyStackClient', () => {
  it('should normalize the provided uri', () => {
    const client = new CozyStackClient({
      uri: 'http://cozy.tools:8080//',
      token: ''
    })
    expect(client.fullpath('/foo')).toBe('http://cozy.tools:8080/foo')
    expect(client.fullpath('http://customcozy.mycozy.cloud/foo')).toBe(
      'http://customcozy.mycozy.cloud/foo'
    )
  })

  it('should instanciate konnectors property', () => {
    const stackClient = new CozyStackClient({
      FAKE_INIT_OPTIONS
    })

    expect(stackClient.konnectors instanceof KonnectorCollection).toBe(true)
  })

  describe('setToken', () => {
    it('allows a JWT string', () => {
      const client = new CozyStackClient(FAKE_INIT_OPTIONS)
      const jwt =
        'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhcHAiLCJpYXQiOjE1NzkxOTAyODEsImlzcyI6ImNvenkudG9vbHM6ODA4MCIsInN1YiI6Im5vdGVzIiwic2Vzc2lvbl9pZCI6ImViMjM5NTBlZjY1NmY3MzllYjg4Y2E2MWZhMDA2ZmZiIn0.WvadOrBnidB3HBl8mCRuQUf0E-EFVQzNHzLPO923Zyv67aRguIdQyWvj6abjEHDcmk5OTEICeM7L5Um1tFWNlg'
      client.setToken(jwt)
      expect(client.token).toHaveProperty('token', jwt)
    })

    it('allows an AccessToken', () => {
      const client = new CozyStackClient(FAKE_INIT_OPTIONS)
      const jwt =
        'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhcHAiLCJpYXQiOjE1NzkxOTAyODEsImlzcyI6ImNvenkudG9vbHM6ODA4MCIsInN1YiI6Im5vdGVzIiwic2Vzc2lvbl9pZCI6ImViMjM5NTBlZjY1NmY3MzllYjg4Y2E2MWZhMDA2ZmZiIn0.WvadOrBnidB3HBl8mCRuQUf0E-EFVQzNHzLPO923Zyv67aRguIdQyWvj6abjEHDcmk5OTEICeM7L5Um1tFWNlg'
      const appToken = new AppToken(jwt)
      client.setToken(appToken)
      expect(client.token).toHaveProperty('token', jwt)
    })
  })

  describe('collection', () => {
    const client = new CozyStackClient(FAKE_INIT_OPTIONS)

    it('should return a DocumentCollection by default', () => {
      expect(client.collection('io.cozy.todos')).toBeInstanceOf(
        DocumentCollection
      )
    })

    it('should return a JobCollection for io.cozy.jobs doctype', () => {
      expect(client.collection('io.cozy.jobs')).toBeInstanceOf(JobCollection)
    })

    it('should throw if the doctype is undefined', () => {
      expect(() => client.collection()).toThrow()
    })
  })

  describe('create', () => {
    const client = new CozyStackClient(FAKE_INIT_OPTIONS)
    beforeAll(() => {
      jest.spyOn(client, 'fetchJSON')
      client.fetchJSON.mockResolvedValue({ data: {} })
    })

    afterEach(() => {
      client.fetchJSON.mockClear()
    })

    afterAll(() => {
      client.fetchJSON.mockRestore()
    })

    it('should send POST resquest', async () => {
      await client
        .collection('io.cozy.foos')
        .create({ attributes: { name: 'Foo' } })

      expect(client.fetchJSON).toHaveBeenCalledTimes(1)
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'POST',
        '/data/io.cozy.foos/',
        { attributes: { name: 'Foo' } }
      )
    })

    it('should send PUT resquest on fixed _id', async () => {
      await client
        .collection('io.cozy.foos')
        .create({ _id: 'bar', attributes: { name: 'Foo' } })

      expect(client.fetchJSON).toHaveBeenCalledTimes(1)
      expect(client.fetchJSON).toHaveBeenCalledWith(
        'PUT',
        '/data/io.cozy.foos/bar',
        { attributes: { name: 'Foo' } }
      )
    })
  })

  describe('fetch', () => {
    let onRevocationChange
    let client

    beforeAll(() => {
      global.fetch = jestFetchMock
    })

    beforeEach(() => {
      onRevocationChange = jest.fn()
      client = new CozyStackClient({
        ...FAKE_INIT_OPTIONS,
        onRevocationChange
      })
    })

    it('should include credentials automatically', async () => {
      await client.fetch('GET', '/data/io.cozy.todos')
      expect(fetch).toHaveBeenCalledWith(
        'http://cozy.tools:8080/data/io.cozy.todos',
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            Authorization: 'Bearer aAbBcCdDeEfFgGhH'
          }
        }
      )
    })

    it('should call onRevocationChange with true if client is revoked', async () => {
      fetch.mockRejectedValueOnce({ message: 'Client not found' })
      await client.fetch('GET', '/data/anyroute').catch(() => {})
      expect(onRevocationChange).toHaveBeenCalledWith(true)
      onRevocationChange.mockReset()
      fetch.mockRejectedValueOnce({ message: 'Could not find document' })
      await client.fetch('GET', '/data/anyroute').catch(() => {})
      expect(onRevocationChange).not.toHaveBeenCalledWith(true)
    })

    it('should send body if provided with Content-type header', async () => {
      await client.fetch(
        'POST',
        '/data/io.cozy.todos',
        JSON.stringify({
          label: 'Buy bread'
        }),
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          }
        }
      )
      expect(fetch).toHaveBeenCalledWith(
        'http://cozy.tools:8080/data/io.cozy.todos',
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
            Authorization: 'Bearer aAbBcCdDeEfFgGhH',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            label: 'Buy bread'
          })
        }
      )
    })

    it('should not send the payload if no Content-Type header has been set', async () => {
      const body = 'foo=bar'
      await client.fetch('POST', '/data/io.cozy.todos/foo', body)
      expect(fetch).toHaveBeenCalledWith(
        'http://cozy.tools:8080/data/io.cozy.todos/foo',
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            Authorization: 'Bearer aAbBcCdDeEfFgGhH'
          }
        }
      )
    })

    it('should return the simple response object if no options or no body', async () => {
      const resp = await client.fetch('GET', '/data/io.cozy.todos')
      // if it has a .text method, it should be a Response object
      expect(resp.text).not.toBeUndefined()
    })

    it('should emit on error', async () => {
      const status = 413
      const statusText = 'Request Entity Too Large'
      const body = JSON.stringify({
        errors: [{ status, title: statusText, detail: 'Quota exceeded' }]
      })
      const response = new Response(body, {
        status,
        statusText
      })
      fetch.mockReturnValueOnce(response)
      const handler = jest.fn()
      client.on('error', handler)
      await client.fetch('GET', '/data/anyroute')
      expect(handler).toHaveBeenCalledWith(expect.any(FetchError))
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          response,
          status,
          reason: body
        })
      )
    })
  })

  describe('fetchJSON', () => {
    const client = new CozyStackClient(FAKE_INIT_OPTIONS)

    beforeAll(() => {
      global.fetch = jestFetchMock
    })

    beforeEach(() => {
      fetch.resetMocks()
      fetch.mockResponse(JSON.stringify(FAKE_RESPONSE), {
        headers: { 'Content-Type': 'application/json' }
      })
    })

    it('should ask for JSON by default', async () => {
      await client.fetchJSON('GET', '/data/io.cozy.todos')
      expect(fetch).toHaveBeenCalledWith(
        'http://cozy.tools:8080/data/io.cozy.todos',
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
            Authorization: 'Bearer aAbBcCdDeEfFgGhH'
          }
        }
      )
    })

    it('should stringify a JSON payload', async () => {
      await client.fetchJSON('POST', '/data/io.cozy.todos', {
        label: 'Buy bread'
      })
      expect(fetch).toHaveBeenCalledWith(
        'http://cozy.tools:8080/data/io.cozy.todos',
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
            Authorization: 'Bearer aAbBcCdDeEfFgGhH',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            label: 'Buy bread'
          })
        }
      )
    })

    it('should not transform the payload if a Content-Type header has been set', async () => {
      const body = 'foo=bar'
      await client.fetchJSON('POST', '/data/io.cozy.todos/foo', body, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      expect(fetch).toHaveBeenCalledWith(
        'http://cozy.tools:8080/data/io.cozy.todos/foo',
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
            Authorization: 'Bearer aAbBcCdDeEfFgGhH',
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body
        }
      )
    })

    it('should return JSON', async () => {
      const resp = await client.fetchJSON('GET', '/data/io.cozy.todos')
      expect(resp).toEqual(FAKE_RESPONSE)
    })

    it('should throw an error when fetch does', async () => {
      fetch.mockRejectOnce(new Error('404 (Not found)'))
      expect.assertions(2)
      try {
        await client.fetchJSON('GET', '/foo/bar')
      } catch (e) {
        expect(e).toBeInstanceOf(Error)
        // expect(e.name).toBe('FetchError')
        expect(e.message).toMatch(/Not/)
      }
    })

    it('should throw a specific error when the request returns an error with no Response Body', async () => {
      fetch.mockResponse(() => {
        return Promise.resolve({
          headers: {
            'content-type': 'application/json; charset=UTF-8'
          },
          body: JSON.stringify(null),
          ok: false,
          status: 503,
          statusText: '',
          type: 'default',
          url: 'http://cozy.tools:8080/data/io.cozy.todos'
        })
      })

      await expect(client.fetchJSON('GET', '/foo/bar')).rejects.toThrow(
        `FetchError received a 503 error without a Response Body when calling http://cozy.tools:8080/data/io.cozy.todos`
      )
    })

    it('should try to refresh the current token when received an invalid token error', async () => {
      const client = new CozyStackClient(FAKE_INIT_OPTIONS)
      global.fetch
        .mockRejectOnce(
          new Error(JSON.stringify({ error: 'Invalid JWT token' }))
        )
        .once([FAKE_APP_HTML, { status: 200 }])
        .once([JSON.stringify({ res: 'ok' }), { status: 200 }])
      await client.fetchJSON('GET', '/test')
      const token = client.getAccessToken()
      expect(token).toEqual(FAKE_APP_TOKEN)
      expect(global.fetch).toHaveBeenLastCalledWith(
        expect.anything(),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${FAKE_APP_TOKEN}`
          })
        })
      )
    })

    it('should try to refresh the current token when received an expired token response', async () => {
      const client = new CozyStackClient(FAKE_INIT_OPTIONS)
      jest.spyOn(client, 'refreshToken')
      global.fetch
        .mockResponseOnce(() => {
          return Promise.resolve({
            headers: {
              'content-type': 'application/json; charset=UTF-8'
            },
            body: JSON.stringify({
              error: 'Expired token'
            }),
            ok: false,
            status: 403,
            statusText: '',
            type: 'default',
            url: 'http://cozy.tools:8080/settings/capabilities'
          })
        })
        .once([FAKE_APP_HTML, { status: 200 }])
        .once([JSON.stringify({ res: 'ok' }), { status: 200 }])
      await client.fetchJSON('GET', '/test')
      const token = client.getAccessToken()
      expect(token).toEqual(FAKE_APP_TOKEN)
      expect(client.refreshToken).toHaveBeenCalled()
      expect(global.fetch).toHaveBeenLastCalledWith(
        expect.anything(),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${FAKE_APP_TOKEN}`
          })
        })
      )
    })

    it('should call onTokenRefresh after setToken when refreshing the current token', async () => {
      const client = new CozyStackClient(FAKE_INIT_OPTIONS)
      jest.spyOn(client, 'onTokenRefresh')
      jest.spyOn(client, 'setToken')
      global.fetch
        .mockResponseOnce(() => {
          return Promise.resolve({
            headers: {
              'content-type': 'application/json; charset=UTF-8'
            },
            body: JSON.stringify({
              error: 'Expired token'
            }),
            ok: false,
            status: 403,
            statusText: '',
            type: 'default',
            url: 'http://cozy.tools:8080/settings/capabilities'
          })
        })
        .once([FAKE_APP_HTML, { status: 200 }])
        .once([JSON.stringify({ res: 'ok' }), { status: 200 }])
      await client.fetchJSON('GET', '/test')

      expect(client.onTokenRefresh).toHaveBeenCalled()
      expect(client.setToken).toHaveBeenCalled()
      const onTokenRefreshOrder =
        client.onTokenRefresh.mock.invocationCallOrder[0]
      const setTokenOrder = client.setToken.mock.invocationCallOrder[0]
      expect(setTokenOrder).toBeLessThan(onTokenRefreshOrder)
    })

    it(`should try to refresh the current token when receiving a 'forbidden' response with 'access token expired' error in 'www-authenticate'`, async () => {
      const client = new CozyStackClient(FAKE_INIT_OPTIONS)
      jest.spyOn(client, 'refreshToken')
      global.fetch
        .mockResponseOnce(() => {
          return Promise.resolve({
            headers: {
              'content-type': 'application/json; charset=UTF-8',
              'www-authenticate':
                'Bearer error="invalid_token" error_description="The access token expired"'
            },
            body: JSON.stringify({
              error: 'Forbidden'
            }),
            ok: false,
            status: 403,
            statusText: '',
            type: 'default',
            url: 'http://cozy.tools:8080/settings/capabilities'
          })
        })
        .once([FAKE_APP_HTML, { status: 200 }])
        .once([JSON.stringify({ res: 'ok' }), { status: 200 }])
      await client.fetchJSON('GET', '/test')
      const token = client.getAccessToken()
      expect(token).toEqual(FAKE_APP_TOKEN)
      expect(client.refreshToken).toHaveBeenCalled()
      expect(global.fetch).toHaveBeenLastCalledWith(
        expect.anything(),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${FAKE_APP_TOKEN}`
          })
        })
      )
    })

    it(`should try to refresh the current token when receiving a 'forbidden' response with 'invalid token' error in 'www-authenticate' (not expired token)`, async () => {
      const client = new CozyStackClient(FAKE_INIT_OPTIONS)
      jest.spyOn(client, 'refreshToken')
      global.fetch.mockResponseOnce(() => {
        return Promise.resolve({
          headers: {
            'content-type': 'application/json; charset=UTF-8',
            'www-authenticate': 'Bearer error="invalid_token"'
          },
          body: JSON.stringify({
            error: 'Forbidden'
          }),
          ok: false,
          status: 403,
          statusText: '',
          type: 'default',
          url: 'http://cozy.tools:8080/settings/capabilities'
        })
      })

      expect.assertions(4)
      try {
        await client.fetchJSON('GET', '/test')
      } catch (e) {
        expect(e).toBeInstanceOf(FetchError)
        expect(e.message).toBe('Invalid token')
        expect(client.refreshToken).toHaveBeenCalled()
        const token = client.getAccessToken()
        expect(token).toEqual(FAKE_INIT_OPTIONS.token)
      }
    })

    it('should not change option header even if we recall the method after an expired token for instance', async () => {
      jest.spyOn(client, 'fetchJSONWithCurrentToken')
      fetch.mockRejectedValueOnce({ message: 'Expired token' })
      jest.spyOn(client, 'refreshToken')
      client.refreshToken.mockResolvedValue(FAKE_APP_TOKEN)
      await client.fetchJSON(
        'POST',
        '/data/io.cozy.files/_index',
        { index: { fields: ['dir_id', 'type'] } },
        {}
      )

      expect(client.refreshToken).toHaveBeenCalled()
      expect(client.fetchJSONWithCurrentToken).toHaveBeenNthCalledWith(
        1,
        'POST',
        '/data/io.cozy.files/_index',
        { index: { fields: ['dir_id', 'type'] } },
        {}
      )
      expect(client.fetchJSONWithCurrentToken).toHaveBeenNthCalledWith(
        2,
        'POST',
        '/data/io.cozy.files/_index',
        { index: { fields: ['dir_id', 'type'] } },
        {}
      )
    })
  })

  describe('refreshToken', () => {
    beforeAll(() => {
      global.fetch = require('jest-fetch-mock')
    })

    beforeEach(() => {
      fetch.resetMocks()
      fetch.mockResponse(FAKE_APP_HTML)
    })

    const getClient = (options = {}) =>
      new CozyStackClient({
        uri: 'http://cozy.tools:8080/',
        token: 'azertyuio',
        ...options
      })

    it('should return a new token', async () => {
      const client = getClient()
      const newToken = await client.refreshToken()
      expect(newToken.token).toEqual(FAKE_APP_TOKEN)
    })

    it('should have called onRefreshToken', async () => {
      const handleRefresh = jest.fn()
      const client = getClient({
        onTokenRefresh: handleRefresh
      })
      await client.refreshToken()
      expect(handleRefresh).toHaveBeenCalledWith({
        token: FAKE_APP_TOKEN
      })
    })

    it('should have called setToken', async () => {
      const handleRefresh = jest.fn()
      const client = getClient({
        onTokenRefresh: handleRefresh
      })
      jest.spyOn(client, 'setToken')
      await client.refreshToken()
      expect(client.setToken).toHaveBeenCalledWith({
        token: FAKE_APP_TOKEN
      })
    })

    it('should fail without repeat on server error', async () => {
      const client = getClient()
      fetch.mockReject(new Error('server error'))
      const newToken = client.refreshToken()
      await expect(newToken).rejects.toThrow()
    })

    it('should fail on server error', async () => {
      const client = getClient()
      fetch.mockReject(new Error('server error'))
      const newToken = client.refreshToken()
      await expect(newToken).rejects.toThrow()
    })

    it('should fail on server error', async () => {
      const client = getClient()
      fetch.mockReject(new Error('server error'))
      const newToken = client.refreshToken()
      await expect(newToken).rejects.toThrow()
    })

    it(`should NOT try to refresh several times in parallel`, async () => {
      const client = new CozyStackClient(FAKE_INIT_OPTIONS)
      jest.spyOn(client, 'refreshToken')
      jest.spyOn(client, 'fetch')
      jest.spyOn(client._promiseCache, 'exec')
      global.fetch.mockResponse(() => {
        return Promise.resolve({
          headers: {
            'content-type': 'application/json; charset=UTF-8'
          },
          body: JSON.stringify({
            error: 'Expired token'
          }),
          ok: false,
          status: 403,
          statusText: '',
          type: 'default',
          url: 'http://cozy.tools:8080/settings/capabilities'
        })
      })

      try {
        await Promise.all([
          client.fetchJSON('GET', '/test'),
          client.fetchJSON('GET', '/test')
        ])
      } catch (e) {
        expect(e).toBeInstanceOf(FetchError)
        expect(client.fetch).toHaveBeenCalledTimes(2)
      }
      expect(client.refreshToken).toHaveBeenCalledTimes(1)
      const token = client.getAccessToken()
      expect(token).toEqual(FAKE_INIT_OPTIONS.token)
      expect(client._promiseCache.exec).toHaveBeenCalledTimes(2)
    })
  })

  it(`should call refresh token several times if needed`, async () => {
    const client = new CozyStackClient(FAKE_INIT_OPTIONS)
    jest.spyOn(client, 'refreshToken')
    jest.spyOn(client, 'fetch')
    global.fetch.mockResponse(() => {
      return Promise.resolve({
        headers: {
          'content-type': 'application/json; charset=UTF-8'
        },
        body: JSON.stringify({
          error: 'Expired token'
        }),
        ok: false,
        status: 403,
        statusText: '',
        type: 'default',
        url: 'http://cozy.tools:8080/settings/capabilities'
      })
    })

    try {
      await client.fetchJSON('GET', '/test')
    } catch (e) {
      expect(e).toBeInstanceOf(FetchError)
    }
    try {
      await client.fetchJSON('GET', '/test')
    } catch (e) {
      expect(e).toBeInstanceOf(FetchError)
    }

    expect(client.refreshToken).toHaveBeenCalledTimes(2)
    expect(client.fetch).toHaveBeenCalledTimes(2)
  })

  describe('getAccessToken', () => {
    it('should return the current app token', () => {
      const client = new CozyStackClient(FAKE_INIT_OPTIONS)
      expect(client.getAccessToken()).toBe(FAKE_INIT_OPTIONS.token)
    })
  })
})

describe('FetchError', () => {
  it('should have HTTP info about the error', () => {
    const error = new FetchError(
      {
        url: 'http://cozy.tools:8080/data/io.cozy.todos',
        status: 400
      },
      'Bad request'
    )
    expect(error).toHaveProperty('status', 400)
    expect(error).toHaveProperty(
      'url',
      'http://cozy.tools:8080/data/io.cozy.todos'
    )
  })

  it('should throw an error if no reason param is provided', () => {
    expect(() => {
      new FetchError(
        {
          url: 'http://cozy.tools:8080/data/io.cozy.todos',
          status: 400
        },
        null
      )
    }).toThrowError(
      `FetchError received a 400 error without a Response Body when calling http://cozy.tools:8080/data/io.cozy.todos`
    )
  })
})
