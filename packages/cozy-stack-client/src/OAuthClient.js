import AccessToken from './AccessToken'
import CozyStackClient from './CozyStackClient'
import errors from './errors'
import logDeprecate from './logDeprecate'
import logger from './logger'

/**
 * @typedef {string} SessionCode
 */
const defaultoauthOptions = {
  clientID: '',
  clientName: '',
  clientKind: '',
  clientSecret: '',
  clientURI: '',
  registrationAccessToken: '',
  redirectURI: '',
  softwareID: '',
  softwareVersion: '',
  logoURI: '',
  policyURI: '',
  notificationPlatform: '',
  notificationDeviceToken: ''
}

/**
 * Specialized `CozyStackClient` for mobile, implementing stack registration
 * through OAuth.
 */
class OAuthClient extends CozyStackClient {
  constructor({ oauth, scope = [], onTokenRefresh, ...options }) {
    super(options)
    this.setOAuthOptions({ ...defaultoauthOptions, ...oauth })
    if (oauth.token) {
      this.setToken(oauth.token)
    }
    this.scope = scope
    this.onTokenRefresh = onTokenRefresh
  }

  /**
   * Checks if the client has his registration information from the server
   *
   * @returns {boolean} true if registered, false otherwise
   * @private
   */
  isRegistered() {
    return this.oauthOptions.clientID !== ''
  }

  /**
   * Converts a camel-cased data set to snake case, suitable for sending to the OAuth server
   *
   * @param   {object} data Initial data
   * @returns {object} Formatted data
   * @private
   */
  snakeCaseOAuthData(data) {
    const mappedFields = {
      softwareID: 'software_id',
      softwareVersion: 'software_version',
      clientID: 'client_id',
      clientName: 'client_name',
      clientKind: 'client_kind',
      clientURI: 'client_uri',
      logoURI: 'logo_uri',
      policyURI: 'policy_uri',
      notificationPlatform: 'notification_platform',
      notificationDeviceToken: 'notification_device_token',
      redirectURI: 'redirect_uris'
    }

    const result = {}

    Object.keys(data).forEach(fieldName => {
      const key = mappedFields[fieldName] || fieldName
      const value = data[fieldName]
      result[key] = value
    })

    // special case: turn redirect_uris into an array
    if (
      result['redirect_uris'] &&
      result['redirect_uris'] instanceof Array === false
    )
      result['redirect_uris'] = [result['redirect_uris']]

    return result
  }

  /**
   * Converts a snake-cased data set to camel case, suitable for internal use
   *
   * @param   {object} data Initial data
   * @returns {object} Formatted data
   * @private
   */
  camelCaseOAuthData(data) {
    const mappedFields = {
      client_id: 'clientID',
      client_name: 'clientName',
      client_secret: 'clientSecret',
      registration_access_token: 'registrationAccessToken',
      software_id: 'softwareID',
      redirect_uris: 'redirectURI'
    }

    const result = {}

    Object.keys(data).forEach(fieldName => {
      const key = mappedFields[fieldName] || fieldName
      const value = data[fieldName]
      result[key] = value
    })

    return result
  }

  /** Performs the HTTP call to register the client to the server */
  doRegistration() {
    return this.fetchJSON(
      'POST',
      '/auth/register',
      this.snakeCaseOAuthData({
        redirectURI: this.oauthOptions.redirectURI,
        clientName: this.oauthOptions.clientName,
        softwareID: this.oauthOptions.softwareID,
        clientKind: this.oauthOptions.clientKind,
        clientURI: this.oauthOptions.clientURI,
        logoURI: this.oauthOptions.logoURI,
        policyURI: this.oauthOptions.policyURI,
        softwareVersion: this.oauthOptions.softwareVersion,
        notificationPlatform: this.oauthOptions.notificationPlatform,
        notificationDeviceToken: this.oauthOptions.notificationDeviceToken
      })
    )
  }

  /**
   * Registers the currenly configured client with the OAuth server and
   * sets internal information from the server response
   *
   * @throws {Error} When the client is already registered
   * @returns {Promise} A promise that resolves with a complete list of client information, including client ID and client secret.
   */
  async register() {
    if (this.isRegistered()) throw new Error('Client already registered')

    const mandatoryFields = ['redirectURI']
    const fields = Object.keys(this.oauthOptions)
    const missingMandatoryFields = mandatoryFields.filter(
      fieldName => fields[fieldName]
    )

    if (missingMandatoryFields.length > 0) {
      throw new Error(
        `Can't register client : missing ${missingMandatoryFields} fields`
      )
    }

    const data = await this.doRegistration()

    this.setOAuthOptions({
      ...this.oauthOptions,
      client_id: data.client_id,
      client_name: data.client_name,
      client_secret: data.client_secret,
      registration_access_token: data.registration_access_token,
      software_id: data.software_id
    })

    return this.oauthOptions
  }

  /**
   * Unregisters the currenly configured client with the OAuth server.
   *
   * @throws {NotRegisteredException} When the client doesn't have it's registration information
   * @returns {Promise}
   */
  async unregister() {
    if (!this.isRegistered()) throw new NotRegisteredException()

    const clientID = this.oauthOptions.clientID
    this.oauthOptions.clientID = ''

    return this.fetchJSON('DELETE', `/auth/register/${clientID}`, null, {
      headers: {
        Authorization: this.registrationAccessTokenToAuthHeader()
      }
    })
  }

  /**
   * Fetches the complete set of client information from the server after it has been registered.
   *
   * @throws {NotRegisteredException} When the client doesn't have it's registration information
   * @returns {Promise}
   */
  async fetchInformation() {
    if (!this.isRegistered()) throw new NotRegisteredException()

    return this.fetchJSON(
      'GET',
      `/auth/register/${this.oauthOptions.clientID}`,
      null,
      {
        headers: {
          Authorization: this.registrationAccessTokenToAuthHeader()
        }
      }
    )
  }

  /**
   * Overwrites the client own information. This method will update both the local information and the remote information on the OAuth server.
   *
   * @throws {NotRegisteredException} When the client doesn't have it's registration information
   * @param   {object} information Set of information to update. Note that some fields such as `clientID` can't be updated.
   * @param   {boolean} resetSecret = false Optionnal, whether to reset the client secret or not
   * @returns {Promise} Resolves to a complete, updated list of client information
   */
  async updateInformation(information, resetSecret = false) {
    if (!this.isRegistered()) throw new NotRegisteredException()

    const mandatoryFields = {
      clientID: this.oauthOptions.clientID,
      clientName: this.oauthOptions.clientName,
      redirectURI: this.oauthOptions.redirectURI,
      softwareID: this.oauthOptions.softwareID
    }
    const data = this.snakeCaseOAuthData({
      ...mandatoryFields,
      ...information
    })

    if (resetSecret) data['client_secret'] = this.oauthOptions.clientSecret

    const result = await this.fetchJSON(
      'PUT',
      `/auth/register/${this.oauthOptions.clientID}`,
      data,
      {
        headers: {
          Authorization: this.registrationAccessTokenToAuthHeader()
        }
      }
    )

    this.setOAuthOptions({ ...data, ...result })

    return this.oauthOptions
  }

  /**
   * Generates a random state code to be used during the OAuth process
   *
   * @returns {string}
   */
  generateStateCode() {
    const STATE_SIZE = 16
    const hasCrypto =
      typeof window !== 'undefined' &&
      typeof window.crypto !== 'undefined' &&
      typeof window.crypto.getRandomValues === 'function'

    let buffer
    if (hasCrypto) {
      buffer = new Uint8Array(STATE_SIZE)
      window.crypto.getRandomValues(buffer)
    } else {
      buffer = new Array(STATE_SIZE)
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] = Math.floor(Math.random() * 255)
      }
    }

    return btoa(String.fromCharCode.apply(null, buffer))
      .replace(/=+$/, '')
      .replace(/\//g, '_')
      .replace(/\+/g, '-')
  }

  /**
   * Generates the URL that the user should be sent to in order to accept the app's permissions.
   *
   * @throws {NotRegisteredException} When the client doesn't have it's registration information
   * @param {object} options - URL generation options
   * @param {string} options.stateCode - A random code to be included in the URl for security. Can be generated with `client.generateStateCode()`
   * @param {Array} [options.scopes] - An array of permission scopes for the token.
   * @param {SessionCode} [options.sessionCode] - A session code that can be used to create a session.
   * @param {string} [options.codeChallenge] - A code challenge that can be used in a PKCE verification process.
   * @returns {string} The URL
   */
  getAuthCodeURL({
    stateCode,
    scopes = this.scope,
    sessionCode = undefined,
    codeChallenge = undefined
  }) {
    if (!this.isRegistered()) throw new NotRegisteredException()

    let query = {
      client_id: this.oauthOptions.clientID,
      redirect_uri: this.oauthOptions.redirectURI,
      state: stateCode,
      response_type: 'code',
      scope: scopes.join(' ')
    }
    if (this.oauthOptions.registerToken) {
      query = {
        ...query,
        registerToken: this.oauthOptions.registerToken
      }
    }
    if (sessionCode) {
      query = {
        ...query,
        session_code: sessionCode
      }
    }
    if (codeChallenge) {
      query = {
        ...query,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256'
      }
    }
    return `${this.uri}/auth/authorize?${this.dataToQueryString(query)}`
  }

  dataToQueryString(data) {
    return Object.keys(data)
      .map(param => `${param}=${encodeURIComponent(data[param])}`)
      .join('&')
  }

  /**
   * Retrieves the access code contained in the URL to which the user is redirected after accepting the app's permissions (the `redirectURI`).
   *
   * @throws {Error} The URL should contain the same state code as the one generated with `client.getAuthCodeURL()`. If not, it will throw an error
   * @param   {string} pageURL The redirected page URL, containing the state code and the access code
   * @param   {string} stateCode The state code that was contained in the original URL the user was sent to (see `client.getAuthCodeURL()`)
   * @returns {string} The access code
   */
  getAccessCodeFromURL(pageURL, stateCode) {
    if (!stateCode) throw new Error('Missing state code')

    const params = new URL(pageURL).searchParams
    const urlStateCode = params.get('state')
    const urlAccessCode = params.get('access_code')

    if (stateCode !== urlStateCode)
      throw new Error('Given state does not match url query state')

    return urlAccessCode
  }

  /**
   * Exchanges an access code for an access token. This function does **not** update the client's token.
   *
   * @throws {NotRegisteredException} When the client doesn't have it's registration information
   * @param   {string} accessCode - The access code contained in the redirection URL — see `client.getAccessCodeFromURL()`
   * @param   {object} oauthOptionsArg — To use when OAuthClient is not yet registered (during login process)
   * @param   {string} uri — To use when OAuthClient is not yet registered (during login process)
   * @param   {string} codeVerifier — The PKCE code verifier (see https://docs.cozy.io/en/cozy-stack/auth/#pkce-extension)
   * @returns {Promise} A promise that resolves with an AccessToken object.
   */
  async fetchAccessToken(accessCode, oauthOptionsArg, uri, codeVerifier) {
    if (!this.isRegistered() && !oauthOptionsArg) {
      throw new NotRegisteredException()
    }

    let oauthOptions = oauthOptionsArg || this.oauthOptions
    let data = {
      grant_type: 'authorization_code',
      code: accessCode,
      client_id: oauthOptions.clientID,
      client_secret: oauthOptions.clientSecret
    }

    if (codeVerifier) {
      data = {
        ...data,
        code_verifier: codeVerifier
      }
    }

    const result = await this.fetchJSON(
      'POST',
      (uri || '') + '/auth/access_token',
      this.dataToQueryString(data),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    )

    return new AccessToken(result)
  }

  /**
   * Used by the flagship application in order to create a token for the konnector with the given slug.
   * This token can then be used by the client-side konnector to make requests to cozy-stack.
   * The flagship app will need to use its own access token to request the konnector token.
   *
   * @param {string} slug - The slug of the konnector
   * @returns {Promise<string>} - A promise that resolves with a new token
   */
  async fetchKonnectorToken(slug) {
    try {
      return await this.fetchJSON('POST', `/auth/tokens/konnectors/${slug}`)
    } catch (error) {
      throw new Error(
        `oAuthClient.fetchKonnectorToken(): Could not create a token for the konnector with slug "${slug}". \n\n${error}`
      )
    }
  }

  /**
   * @typedef SessionCodeRes
   * @property {string} session_code The value of the session code
   */

  /**
   * Fetches a new session code. Only usable by the Flagship application
   *
   * @throws {NotRegisteredException} When the client isn't certified to be the Flagship application
   * @returns {Promise<SessionCodeRes>} A promise that resolves with a new session_code
   */
  async fetchSessionCode() {
    return this.fetchJSON('POST', '/auth/session_code')
  }

  /**
   * Fetches a new session code. Only usable by the Flagship application
   *
   * @throws {NotRegisteredException} When the client isn't certified to be the Flagship application
   * @returns {Promise<SessionCodeRes>} A promise that resolves with a new session_code
   */
  async fetchSessionCodeWithPassword({
    passwordHash,
    twoFactorToken = undefined,
    twoFactorPasscode = undefined
  }) {
    return this.fetchJSON('POST', '/auth/session_code', {
      passphrase: passwordHash,
      two_factor_token: twoFactorToken,
      two_factor_passcode: twoFactorPasscode
    })
  }

  /**
   * @typedef AccessTokenRes
   * @property {string} email_verified_code The email verified code to skip 2FA
   * @property {string} access_token The OAuth access token
   * @property {string} refresh_token The OAuth refresh token
   * @property {string} token_type The OAuth token type
   * @property {string} scope The OAuth scope
   */

  /**
   * @typedef TwoFactorNeededRes
   * @property {string} two_factor_token The 2FA token
   */

  /**
   * Get OAuth access and register tokens without having to make OAuth dance
   *
   * This endpoint returns registration tokens only from a Flagship app,
   * otherwise it returns a session_code that should be used in an OAuth dance
   *
   * More info: https://docs.cozy.io/en/cozy-stack/flagship/
   * More info: https://docs.cozy.io/en/cozy-stack/auth/#post-authloginflagship
   *
   * @returns {Promise<AccessTokenRes|TwoFactorNeededRes|SessionCodeRes>} A promise that resolves with an access token, a session_code or a 2FA code
   */
  async loginFlagship({
    emailVerifiedCode = undefined,
    passwordHash,
    twoFactorToken = undefined,
    twoFactorPasscode = undefined
  }) {
    return this.fetchJSON('POST', '/auth/login/flagship', {
      client_id: this.oauthOptions.clientID,
      client_secret: this.oauthOptions.clientSecret,
      email_verified_code: emailVerifiedCode,
      passphrase: passwordHash,
      two_factor_token: twoFactorToken,
      two_factor_passcode: twoFactorPasscode
    })
  }

  /**
   * Retrieves a new access token by refreshing the currently used token.
   *
   * @throws {NotRegisteredException} When the client doesn't have it's registration information
   * @throws {Error} The client should already have an access token to use this function
   * @returns {Promise} A promise that resolves with a new AccessToken object
   */
  async refreshToken() {
    if (!this.isRegistered()) {
      throw new NotRegisteredException()
    }
    if (!this.token) {
      throw new Error('No token to refresh')
    }

    const data = {
      grant_type: 'refresh_token',
      refresh_token: this.token.refreshToken,
      client_id: this.oauthOptions.clientID,
      client_secret: this.oauthOptions.clientSecret
    }
    try {
      const result = await this.fetchJSONWithCurrentToken(
        'POST',
        '/auth/access_token',
        this.dataToQueryString(data),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }
      )

      const newToken = new AccessToken({
        refresh_token: this.token.refreshToken,
        ...result
      })

      this.setToken(newToken)

      if (this.onTokenRefresh && typeof this.onTokenRefresh === 'function') {
        this.onTokenRefresh(newToken)
      }

      return newToken
    } catch (e) {
      if (this.isRevocationError(e)) {
        this.onRevocationChange(true)
        logger.warn('Client has been revoked. Please authenticate again.')
        throw e
      }

      if (
        errors.EXPIRED_TOKEN.test(e.message) ||
        errors.INVALID_TOKEN.test(e.message) ||
        errors.INVALID_TOKEN_ALT.test(e.message)
      ) {
        const revoked = await this.checkForRevocation()

        if (revoked) {
          logger.warn('Client has been revoked. Please authenticate again.')
          throw e
        }
      }
      throw e
    }
  }

  exchangeOAuthSecret(uri, secret) {
    return this.fetchJSON('POST', uri + '/auth/secret_exchange', {
      secret
    })
  }

  /**
   * Updates the client's stored token
   *
   * @param {string} token = null The new token to use — can be a string, a json object or an AccessToken instance.
   */
  setToken(token) {
    if (token) {
      this.token = token instanceof AccessToken ? token : new AccessToken(token)
    } else {
      this.token = null
    }
  }

  setCredentials(token) {
    logDeprecate('setCredentials is deprecated, please replace by setToken')
    return this.setToken(token)
  }

  /**
   * Updates the OAuth informations
   *
   * @param {object} options Map of OAuth options
   */
  setOAuthOptions(options) {
    this.oauthOptions = this.camelCaseOAuthData(options)
  }

  resetClientId() {
    this.oauthOptions.clientID = ''
  }

  /**
   * Reset the current OAuth client
   */
  resetClient() {
    this.resetClientId()
    this.setUri(null)
    this.setToken(null)
  }

  /**
   * Turns the client's registration access token into a header suitable for HTTP requests. Used in some queries to manipulate the client on the server side.
   *
   * @returns {string}
   * @private
   */
  registrationAccessTokenToAuthHeader() {
    if (!this.oauthOptions.registrationAccessToken) {
      throw new Error('No registration access token')
    }
    return 'Bearer ' + this.oauthOptions.registrationAccessToken
  }

  /**
   * This method should be used in flagship app onboarding process to finalize the
   * cozy creation by setting the user password into the cozy-stack
   *
   * More info: https://docs.cozy.io/en/cozy-stack/settings/#post-settingspassphraseflagship
   *
   * @param {object} params - parameters needed to set passphrase
   * @param {string} params.registerToken - registration token provided by the onboarding link
   * @param {string} params.passwordHash - hash of the master password
   * @param {string} params.hint - hint for the master password
   * @param {string} params.key - key (crypted) used for the vault encryption
   * @param {string} params.publicKey - public key used for sharing ciphers from the vault
   * @param {string} params.privateKey - private key (crypted) used for sharing ciphers from the vault
   * @param {string} params.iterations - number of KDF iterations applied when hashing the master password
   * @returns {object} token - The OAauth token
   */
  setPassphraseFlagship({
    registerToken,
    passwordHash,
    hint,
    key,
    publicKey,
    privateKey,
    iterations
  }) {
    return this.fetchJSON(
      'POST',
      '/settings/passphrase/flagship',
      {
        register_token: registerToken,
        passphrase: passwordHash,
        hint: hint,
        key: key,
        public_key: publicKey,
        private_key: privateKey,
        iterations: iterations,
        client_id: this.oauthOptions.clientID,
        client_secret: this.oauthOptions.clientSecret
      },
      {
        // TODO: faut il mettre le header?
        headers: {
          Authorization: this.registrationAccessTokenToAuthHeader()
        }
      }
    )
  }

  /**
   * Check if the OAuth client's has been revoked.
   * If this is the case, call the onRevocationChange callback
   *
   * @async
   * @returns {Promise<boolean>} A Promise that resolves to `false` if client is still valid, or `true` if it has been revoked.
   */
  async checkForRevocation() {
    try {
      await this.fetchInformation()
      return false
    } catch (err) {
      if (this.isRevocationError(err)) {
        this.onRevocationChange(true)
        return true
      }
      return false
    }
  }
}

class NotRegisteredException extends Error {
  constructor(message = 'Client not registered or missing OAuth information') {
    super(message)
    this.message = message
    this.name = 'NotRegisteredException'
  }
}

export default OAuthClient
