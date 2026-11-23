import AccessToken from './AccessToken'
import OAuthClient from './OAuthClient'
import { FetchError } from './errors'

const CLIENT_INIT_OPTIONS = {
  uri: 'http://cozy.tools:8080',
  oauth: {
    clientName: 'TestClientName',
    softwareID: 'TestSofwareID',
    redirectURI: 'http://localhost'
  }
}

const REGISTERED_CLIENT_INIT_OPTIONS = {
  uri: CLIENT_INIT_OPTIONS.uri,
  oauth: {
    ...CLIENT_INIT_OPTIONS.oauth,
    clientID: '1',
    clientsecret: '1',
    registrationAccessToken: 'registrationAccessToken-1234'
  }
}

describe('OAuthClient', () => {
  beforeAll(() => {
    global.fetch = require('jest-fetch-mock')
  })

  beforeEach(() => {
    fetch.resetMocks()
    fetch.mockResponse(JSON.stringify({ foo: 'bar' }))
  })

  let client

  describe('without registration', () => {
    beforeEach(() => {
      client = new OAuthClient(CLIENT_INIT_OPTIONS)
    })

    it('should register a client', () => {
      client.register()
      expect(fetch.mock.calls[0]).toMatchSnapshot()
    })

    it('should throw on other server interactions', () => {
      expect(client.unregister()).rejects.toThrowErrorMatchingSnapshot()
      expect(client.fetchInformation()).rejects.toThrowErrorMatchingSnapshot()
      expect(client.updateInformation()).rejects.toThrowErrorMatchingSnapshot()
      expect(client.fetchAccessToken()).rejects.toThrowErrorMatchingSnapshot()
      expect(client.refreshToken()).rejects.toThrowErrorMatchingSnapshot()
    })

    it('should not generate a auth code URL', () => {
      expect(() => {
        client.getAuthCodeURL({ stateCode: 'statecode' })
      }).toThrowErrorMatchingSnapshot()
    })
  })

  describe('with registration', () => {
    beforeEach(() => {
      client = new OAuthClient(REGISTERED_CLIENT_INIT_OPTIONS)
      client.setToken({
        tokenType: 'type',
        accessToken: 'accessToken-abcd',
        refreshToken: 'refresh-789',
        scope: 'io.cozy.todos'
      })
    })

    it('should throw when trying to register again', () => {
      expect(client.register()).rejects.toThrowErrorMatchingSnapshot()
    })

    it('should unregister a client', () => {
      expect(client.isRegistered()).toBeTruthy()
      client.unregister()
      expect(fetch.mock.calls[0]).toMatchSnapshot()
      expect(client.isRegistered()).toBeFalsy()
    })

    it('should fetch client informations', () => {
      client.fetchInformation()
      expect(fetch.mock.calls[0]).toMatchSnapshot()
    })

    it('should update client informations', () => {
      client.updateInformation({
        policy_url: 'http://example.com'
      })
      expect(fetch.mock.calls[0]).toMatchSnapshot()
    })

    it('should generate a random state code', () => {
      expect(client.generateStateCode()).toBeDefined()
    })

    it('should generate the auth code URL', () => {
      expect(
        client.getAuthCodeURL({
          stateCode: 'randomstatetoken',
          scopes: ['io.cozy.todos']
        })
      ).toEqual(
        `${REGISTERED_CLIENT_INIT_OPTIONS.uri}/auth/authorize?client_id=${
          REGISTERED_CLIENT_INIT_OPTIONS.oauth.clientID
        }&redirect_uri=${encodeURIComponent(
          REGISTERED_CLIENT_INIT_OPTIONS.oauth.redirectURI
        )}&state=randomstatetoken&response_type=code&scope=io.cozy.todos`
      )
    })

    it('should generate the auth code URL even with registerToken', () => {
      const oauthOptions = {
        ...REGISTERED_CLIENT_INIT_OPTIONS,
        oauth: {
          ...REGISTERED_CLIENT_INIT_OPTIONS.oauth,
          registerToken: 'AZERTY'
        }
      }
      const newClient = new OAuthClient(oauthOptions)
      newClient.setToken({
        tokenType: 'type',
        accessToken: 'accessToken-abcd',
        refreshToken: 'refresh-789',
        scope: 'io.cozy.todos'
      })
      expect(
        newClient.getAuthCodeURL({
          stateCode: 'randomstatetoken',
          scopes: ['io.cozy.todos']
        })
      ).toEqual(
        `${REGISTERED_CLIENT_INIT_OPTIONS.uri}/auth/authorize?client_id=${
          REGISTERED_CLIENT_INIT_OPTIONS.oauth.clientID
        }&redirect_uri=${encodeURIComponent(
          REGISTERED_CLIENT_INIT_OPTIONS.oauth.redirectURI
        )}&state=randomstatetoken&response_type=code&scope=io.cozy.todos&registerToken=AZERTY`
      )
    })

    it('should get the access code from an URL', () => {
      const stateCode = 'myrandomcode'
      const accessCode = 'myaccesscode'
      const url = `http://example.com?state=${stateCode}&access_code=${accessCode}`
      expect(client.getAccessCodeFromURL(url, stateCode)).toEqual(accessCode)
    })

    it('should throw when no access code is provided', () => {
      expect(() => {
        client.getAccessCodeFromURL('http://example.com')
      }).toThrowErrorMatchingSnapshot()
    })

    it('should throw when the provided access code is different from the URL', () => {
      const stateCode = 'myrandomcode'
      const accessCode = 'myaccesscode'
      const url = `http://example.com?state=${stateCode}&access_code=${accessCode}`

      expect(() => {
        client.getAccessCodeFromURL(url, 'incorrect')
      }).toThrowErrorMatchingSnapshot()
    })

    it('should fetch an access token', () => {
      client.fetchAccessToken('myaccesstoken')
      expect(fetch.mock.calls[0]).toMatchSnapshot()
    })

    it('should refresh the access token', () => {
      client.refreshToken()
      expect(fetch.mock.calls[0]).toMatchSnapshot()
    })

    it('should automatically refresh the token after a failed fetch', async () => {
      fetch.mockRejectOnce(new Error('Expired token'))
      const spy = jest.spyOn(client, 'refreshToken')
      await client.fetchJSON('GET', '/foo')
      expect(spy).toHaveBeenCalled()
    })

    it('should throw when refreshing the access token without token', () => {
      client = new OAuthClient(REGISTERED_CLIENT_INIT_OPTIONS)
      expect(client.refreshToken()).rejects.toThrowErrorMatchingSnapshot()
    })

    it('should update the internal credentials', () => {
      const camelCredentials = {
        tokenType: 'Camel',
        accessToken: 'Cased',
        refreshToken: 'refresh-me',
        scope: 'io.cozy.todos'
      }
      const snakeCredentials = {
        token_type: 'Snake',
        access_token: 'DoubleCased',
        refresh_token: 'refresh-you',
        scope: 'io.cozy.todos'
      }
      client.setToken(camelCredentials)
      expect(client.token).toBeInstanceOf(AccessToken)
      expect(client.token.tokenType).toEqual(camelCredentials.tokenType)
      expect(client.token.accessToken).toEqual(camelCredentials.accessToken)
      expect(client.token.refreshToken).toEqual(camelCredentials.refreshToken)
      expect(client.token.scope).toEqual(camelCredentials.scope)

      client.setToken(JSON.stringify(snakeCredentials))
      expect(client.token).toBeInstanceOf(AccessToken)
      expect(client.token.tokenType).toEqual(snakeCredentials.token_type)
      expect(client.token.accessToken).toEqual(snakeCredentials.access_token)
      expect(client.token.refreshToken).toEqual(snakeCredentials.refresh_token)
      expect(client.token.scope).toEqual(snakeCredentials.scope)
    })

    it('should reset the client', () => {
      client.setUri('test')
      expect(client.uri).toEqual('test')
      client.resetClient()
      expect(client.uri).toBeNull()
      expect(client.oauthOptions.clientID).toEqual('')
      expect(client.token).toBeNull()
    })
  })

  describe('fetchJSON', () => {
    it('should call onTokenRefresh after setToken when refreshing the current token', async () => {
      const client = new OAuthClient({
        ...REGISTERED_CLIENT_INIT_OPTIONS,
        oauth: {
          ...REGISTERED_CLIENT_INIT_OPTIONS.oauth,
          token: new AccessToken({
            tokenType: 'type',
            accessToken: 'accessToken-abcd',
            refreshToken: 'refresh-789',
            scope: 'io.cozy.todos'
          })
        },
        onTokenRefresh: jest.fn()
      })
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
  })

  describe('getAccessToken', () => {
    it('should return the current access token', () => {
      client = new OAuthClient(REGISTERED_CLIENT_INIT_OPTIONS)
      client.setToken({
        tokenType: 'type',
        accessToken: 'accessToken-abcd',
        refreshToken: 'refresh-789',
        scope: 'io.cozy.todos'
      })
      expect(client.getAccessToken()).toBe('accessToken-abcd')
    })
  })

  describe('getRefreshToken', () => {
    it('should call onRevocation', async () => {
      client = new OAuthClient(REGISTERED_CLIENT_INIT_OPTIONS)
      client.setToken({
        tokenType: 'type',
        accessToken: 'accessToken-abcd',
        refreshToken: 'refresh-789',
        scope: 'io.cozy.todos'
      })
      client.fetchJSONWithCurrentToken = jest
        .fn()
        .mockImplementationOnce(async () => {
          throw new FetchError({}, 'Invalid JWT token')
        })
        .mockImplementation(async () => {
          throw new FetchError({}, 'the client must be registered')
        })

      const revocationSpy = jest.spyOn(client, 'onRevocationChange')
      const refreshSpy = jest.spyOn(client, 'refreshToken')

      try {
        await client.fetchInformation()
      } catch (error) {
        expect(refreshSpy).toHaveBeenCalled()
        expect(revocationSpy).toHaveBeenCalledWith(true)
        expect(error).toBeInstanceOf(FetchError)
      }

      // Clean up our spies
      refreshSpy.mockRestore()
      revocationSpy.mockRestore()
    })
  })
})

const FAKE_DATA_COZY = JSON.stringify({
  app: {
    editor: 'Cozy',
    icon: 'icon.svg',
    name: 'Accueil',
    prefix: 'Cozy',
    slug: 'home'
  },
  domain: 'test.mycozy.cloud',
  locale: 'fr',
  token: 'SOME_TOKEN',
  tracking: false
})

const FAKE_APP_HTML = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>Cozy Home</title>
  <link rel="icon" href="//test.mycozy.cloud/assets/favicon.f56cf1d03b.ico">
  <link rel="icon" type="image/png" href="//test.mycozy.cloud/assets/favicon-16x16.192a16308f.png" sizes="16x16">
  <link rel="icon" type="image/png" href="//test.mycozy.cloud/assets/favicon-32x32.9f958fa2c7.png" sizes="32x32">
  <link rel="apple-touch-icon" sizes="180x180" href="//test.mycozy.cloud/assets/apple-touch-icon.a0e0ae4102.png"/>
    <link rel="manifest" href="/manifest.json" crossorigin="use-credentials"><meta name="msapplication-TileColor" content="#2b5797"><meta name="theme-color" content="#ffffff"><meta name="viewport" content="width=device-width,height=device-height,initial-scale=1,viewport-fit=cover"><link rel="stylesheet" href="vendors/home.c451e5ac76c8377b20c5.0.min.css"><link rel="stylesheet" href="app/home.cbb1b1050b936df11fbd.min.css"><link rel="stylesheet" type="text/css" href="//test.mycozy.cloud/assets/styles/theme.faa4e12bdc.css"> <script src="//test.mycozy.cloud/assets/js/cozy-client.605c649bc3.min.js"></script> 
<link rel="stylesheet" type="text/css" href="//test.mycozy.cloud/assets/fonts/fonts.33109548ca.css">
<link rel="stylesheet" type="text/css" href="//test.mycozy.cloud/assets/css/cozy-bar.6effa2d88c.min.css">
<script src="//test.mycozy.cloud/assets/js/cozy-bar.f99c08ee53.min.js"></script></head><body><div role="application" data-cozy='${FAKE_DATA_COZY}'><script src="vendors/home.a664629f1a5622ccb459.js"></script><script src="app/home.455bbc269323b2c64382.js"></script><script src="//test.mycozy.cloud/assets/js/piwik.js" async></script></div></body></html>
`
