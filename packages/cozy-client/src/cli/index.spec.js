import http from 'http'
import { createClientInteractive } from './index'
import { OAuthClient } from 'cozy-stack-client'
import opn from 'open'
import fetch from 'node-fetch'
import { URL } from 'url'
import logger from 'cozy-logger'

logger.setLevel('error')

jest.mock('open', () => jest.fn())

describe('createClientInteractive', () => {
  let servers

  const fs = {
    existsSync: jest.fn().mockReturnValue(false),
    readFileSync: jest.fn(() => null),
    writeFileSync: jest.fn(() => null)
  }

  beforeEach(() => {
    servers = []
    const originalCreateServer = http.createServer

    // Saves created server for destruction in afterEach
    jest.spyOn(http, 'createServer').mockImplementation(function () {
      const server = originalCreateServer.apply(this, arguments)
      servers.push(server)
      return server
    })
    fs.writeFileSync.mockClear()
  })

  afterEach(() => {
    http.createServer.mockRestore()
    servers.forEach(server => {
      server.destroy()
    })
  })

  beforeEach(() => {
    jest.spyOn(OAuthClient.prototype, 'doRegistration').mockResolvedValue({
      client_id: 'fake-client-id',
      client_name: 'fake-client-name',
      software_id: 'fake-software-id'
    })
    jest.spyOn(OAuthClient.prototype, 'fetchAccessToken').mockResolvedValue({
      access_token: 'fake-access-token',
      refresh_token: 'fake-refresh-token'
    })
  })

  afterEach(() => {
    OAuthClient.prototype.doRegistration.mockRestore()
    OAuthClient.prototype.fetchAccessToken.mockRestore()
  })

  const setup = ({ getSavedCredentials } = {}) => {
    let clientPromise = createClientInteractive(
      {
        uri: 'http://cozy.tools:8080',
        scope: ['io.cozy.bills'],
        oauth: {
          softwareID: 'fake-software-id',
          clientURI: 'http://testcozy.mycozy.cloud',
          softwareVersion: '1.1.0',
          logoURI: 'http://my-logo.com/logo.jpg'
        }
      },
      {
        fs,
        getSavedCredentials
      }
    )

    // Override opn implementation so that we "click" on the "Authorize"
    // button in the oauth authorization  page, continuing the OAuth flow
    opn.mockImplementation(async openedUrl => {
      const url = new URL(openedUrl)
      const redirectURI = url.searchParams.get('redirect_uri')
      const state = url.searchParams.get('state')
      // Use opn call as a signal that the server has been started
      await fetch(redirectURI + '?state=' + state)
    })
    return { clientPromise }
  }

  it('should create an oauth server, open a page and save credentials', async () => {
    const { clientPromise } = setup()
    const client = await clientPromise
    expect(http.createServer).toHaveBeenCalled()
    expect(client.stackClient.oauthOptions).toMatchObject({
      clientID: 'fake-client-id',
      clientName: 'fake-client-name',
      clientURI: 'http://testcozy.mycozy.cloud',
      redirectURI: 'http://localhost:3333/do_access',
      softwareID: 'fake-software-id',
      softwareVersion: '1.1.0'
    })
    expect(client.stackClient.token).toMatchObject({
      accessToken: 'fake-access-token',
      refreshToken: 'fake-refresh-token'
    })
    expect(fs.writeFileSync).toHaveBeenCalled()

    expect(fs.writeFileSync.mock.calls[0][0]).toBe(
      '/tmp/cozy-client-oauth-cozy-tools:8080-fake-software-id-208358843.json'
    )
    expect(JSON.parse(fs.writeFileSync.mock.calls[0][1])).toEqual({
      oauthOptions: {
        clientID: 'fake-client-id',
        clientName: 'fake-client-name',
        clientKind: '',
        clientURI: 'http://testcozy.mycozy.cloud',
        redirectURI: 'http://localhost:3333/do_access',
        softwareID: 'fake-software-id',
        softwareVersion: '1.1.0',
        logoURI: 'http://my-logo.com/logo.jpg',
        policyURI: '',
        notificationPlatform: '',
        notificationDeviceToken: ''
      },
      token: {
        accessToken: 'fake-access-token',
        refreshToken: 'fake-refresh-token'
      }
    })
  })

  it('should create a client from saved credentials', async () => {
    fs.existsSync.mockReturnValue(true)
    fs.readFileSync.mockReturnValue(
      JSON.stringify({
        token: {
          accessToken: 'saved-access-token',
          refreshToken: 'saved-refresh-token'
        },
        oauthOptions: {
          clientName: 'fake-client-name',
          clientURI: 'http://testcozy.mycozy.cloud',
          redirectURI: 'http://localhost:3333/do_access',
          softwareID: 'fake-software-id',
          softwareVersion: '1.1.0',
          clientID: 'client-1337'
        }
      })
    )
    const { clientPromise } = setup()
    const client = await clientPromise
    expect(http.createServer).not.toHaveBeenCalled()
    expect(client.stackClient.token).toMatchObject({
      accessToken: 'saved-access-token',
      refreshToken: 'saved-refresh-token'
    })
    expect(client.stackClient.oauthOptions).toMatchObject({
      clientName: 'fake-client-name',
      clientURI: 'http://testcozy.mycozy.cloud',
      redirectURI: 'http://localhost:3333/do_access',
      softwareID: 'fake-software-id',
      softwareVersion: '1.1.0'
    })
  })

  it('allows to customize target token file path', async () => {
    fs.existsSync.mockReturnValue(false)
    fs.readFileSync.mockReturnValue(
      JSON.stringify({
        token: {
          accessToken: 'saved-access-token',
          refreshToken: 'saved-refresh-token'
        },
        oauthOptions: {
          clientName: 'fake-client-name',
          clientURI: 'http://testcozy.mycozy.cloud',
          redirectURI: 'http://localhost:3333/do_access',
          softwareID: 'fake-software-id',
          softwareVersion: '1.1.0',
          clientID: 'client-1337'
        }
      })
    )
    const { clientPromise } = setup({
      getSavedCredentials: () => 'custom file path'
    })
    await clientPromise
    expect(fs.writeFileSync.mock.calls[0][0]).toBe('custom file path')
  })
})
