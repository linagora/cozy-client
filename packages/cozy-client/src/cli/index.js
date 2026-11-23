import fs from 'fs'
import http from 'http'

import merge from 'lodash/merge'
import opn from 'open'
import enableDestroy from 'server-destroy'

import logger from 'cozy-logger'

import CozyClient from '../CozyClient'

const log = logger.namespace('create-cli-client')

const btoa = require('btoa')
const nodeFetch = require('node-fetch')

/**
 * Creates and starts and HTTP server suitable for OAuth authentication
 *
 * @param  {object} serverOptions - OAuth callback server options
 * @param  {Function} serverOptions.onAuthentication - Additional callback called
 * when the user authenticates
 * @param  {string} serverOptions.route - Route used for authentication
 * @param  {number} serverOptions.port - Port on which the server will listen
 * @param  {Function} serverOptions.onListen - Callback called when the
 * server starts
 *
 * @typedef {object} DestroyableServer
 * @function destroy
 *
 * @returns {DestroyableServer}
 *
 * @private
 */
const createCallbackServer = serverOptions => {
  const { route, onListen, onAuthentication, port } = serverOptions
  const server = http.createServer((request, response) => {
    if (request.url.indexOf(route) === 0) {
      onAuthentication(request.url)
      response.write('Authentication successful, you can close this page.')
      response.end()
    }
  })
  server.listen(port, () => {
    onListen()
  })
  enableDestroy(server)
  return server
}

/**
 * Creates a function suitable for usage with CozyClient::startOAuthFlow
 *
 * Starts a local server. The stack upon user authentication will
 * redirect to this local server with a URL containing credentials.
 * The callback resolves with this authenticationURL which continues
 * the authentication flow inside startOAuthFlow.
 *
 * When the server is started, the authentication page is opened on the
 * desktop browser of the user.
 *
 * @param {object} serverOptions - Options for the OAuth callback server
 * @param {number} serverOptions.port - Port used for the OAuth callback server
 * @param {Function} serverOptions.onAuthentication - Callback when the user authenticates
 * @param {Function} serverOptions.onListen - Callback called with the authentication URL
 * @param {string} serverOptions.route - Route used for authentication
 * @param {boolean} serverOptions.shouldOpenAuthenticationPage - Whether the authentication
 * page should be automatically opened (default: true)
 *
 * @private
 */
const mkServerFlowCallback = serverOptions => authenticationURL =>
  new Promise((resolve, reject) => {
    let rejectTimeout, successTimeout
    const server = createCallbackServer({
      ...serverOptions,
      onAuthentication: callbackURL => {
        log('debug', 'Authenticated, Shutting server down')
        successTimeout = setTimeout(() => {
          // Is there a way to call destroy only after all requests have
          // been completely served ? Otherwise we close the server while
          // the successful oauth page is being served and the page does
          // not get loaded on the client side.
          server.destroy()
          resolve('http://localhost:8000/' + callbackURL)
          clearTimeout(rejectTimeout)
        }, 300)
      },
      onListen: () => {
        log(
          'debug',
          'OAuth callback server started, waiting for authentication'
        )
        if (serverOptions.shouldOpenAuthenticationPage !== false) {
          opn(authenticationURL, { wait: false })
        }
        if (serverOptions.onListen) {
          serverOptions.onListen({ authenticationURL })
        }
      }
    })

    rejectTimeout = setTimeout(() => {
      clearTimeout(successTimeout)
      server.destroy()
      reject('Timeout for authentication')
    }, 30 * 1000)
  })

const hashCode = function (str) {
  var hash = 0,
    i,
    chr
  if (str.length === 0) return hash
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i)
    hash = (hash << 5) - hash + chr
    hash |= 0 // Convert to 32bit integer
  }
  return hash
}

const DEFAULT_SERVER_OPTIONS = {
  port: 3333,
  route: '/do_access',
  getSavedCredentials: clientOptions => {
    if (!clientOptions.oauth.softwareID) {
      throw new Error('Please provide oauth.softwareID in your clientOptions.')
    }
    const doctypeHash = Math.abs(hashCode(JSON.stringify(clientOptions.scope)))
    const sluggedURI = clientOptions.uri
      .replace(/https?:\/\//, '')
      .replace(/\./g, '-')
    return `/tmp/cozy-client-oauth-${sluggedURI}-${clientOptions.oauth.softwareID}-${doctypeHash}.json`
  }
}

const writeJSON = (fs, filename, data) => {
  fs.writeFileSync(filename, JSON.stringify(data))
}

/**
 * Parses a JSON from a file
 * Returns null in case of error
 *
 * @private
 */
const readJSON = (fs, filename) => {
  try {
    if (!fs.existsSync(filename)) {
      return null
    }
    const res = JSON.parse(fs.readFileSync(filename).toString())
    return res
  } catch (e) {
    logger.warn(`Could not load ${filename} (${e.message})`)
    return null
  }
}

/**
 * Creates a client with interactive authentication.
 *
 * - Will start an OAuth flow and open an authentication page
 * - Starts a local server to listen for the oauth callback
 * - Resolves with the client after user authentication
 *
 * @param {object} clientOptions Same as CozyClient::constructor.
 *
 * @example
 * ```
 * import { createClientInteractive } from 'cozy-client/dist/cli'
 * await createClientInteractive({
 *   uri: 'http://cozy.tools:8080',
 *   scope: ['io.cozy.bills'],
 *   oauth: {
 *     softwareID: 'my-cli-application-using-bills'
 *   }
 * })
 * ```
 *
 * @returns {Promise<CozyClient>} - A client that is ready with a token
 */
const createClientInteractive = (clientOptions, serverOpts) => {
  global.fetch = nodeFetch
  global.btoa = btoa
  const serverOptions = merge(DEFAULT_SERVER_OPTIONS, serverOpts)
  const createClientFS = serverOptions.fs || fs

  const mergedClientOptions = merge(
    {
      oauth: {
        clientName: 'cli-client',
        redirectURI: `http://localhost:${serverOptions.port}${serverOptions.route}`
      }
    },
    clientOptions
  )

  if (!clientOptions.scope) {
    throw new Error('scope must be provided in client options')
  }

  const getSavedCredentials = serverOptions.getSavedCredentials
  const savedCredentialsFilename = getSavedCredentials(mergedClientOptions)
  const savedCredentials = readJSON(createClientFS, savedCredentialsFilename)

  log('debug', `Starting OAuth flow`)
  const client = new CozyClient(mergedClientOptions)

  if (savedCredentials) {
    log('debug', `Using saved credentials in ${savedCredentialsFilename}`)
    client.stackClient.setToken(savedCredentials.token)
    client.stackClient.setOAuthOptions(savedCredentials.oauthOptions)
    return Promise.resolve(client)
  }

  return client.startOAuthFlow(mkServerFlowCallback(serverOptions)).then(() => {
    log('debug', `Saving credentials to ${savedCredentialsFilename}`)
    writeJSON(createClientFS, savedCredentialsFilename, {
      oauthOptions: client.stackClient.oauthOptions,
      token: client.stackClient.token
    })
    return client
  })
}

const main = async () => {
  const client = await createClientInteractive({
    scope: ['io.cozy.files'],
    uri: 'http://cozy.tools:8080',
    oauth: {
      softwareID: 'io.cozy.client.cli'
    }
  })
  console.log(client.toJSON())
}

if (require.main === module) {
  main().catch(e => {
    console.error(e)
    process.exit(1)
  })
}

export { createClientInteractive }
