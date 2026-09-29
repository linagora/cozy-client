export const ensureFirstSlash = path => {
  if (!path) {
    return '/'
  } else {
    return path.startsWith('/') ? path : '/' + path
  }
}

/**
 * generateWebLink - Construct a link to a web app
 *
 * This function does not get its cozy url from a CozyClient instance so it can
 * be used to build urls that point to other Cozies than the user's own Cozy.
 * This is useful when pointing to the Cozy of the owner of a shared note for
 * example.
 *
 * @param {object} options               Object of options
 * @param {string}   options.cozyUrl       Base URL of the cozy, eg. cozy.tools or test.mycozy.cloud
 * @param {Array}    [options.searchParams]  Array of search parameters as [key, value] arrays, eg. ['username', 'bob']
 * @param {string}   [options.pathname]      Path to a specific part of the app, eg. /public
 * @param {string}   [options.hash]          Path inside the app, eg. /files/test.jpg
 * @param {string}   [options.slug]          Slug of the app
 * @param {string}   [options.subDomainType] Whether the cozy is using flat or nested subdomains. Defaults to flat.
 *
 * @returns {string} Generated URL
 */
export const generateWebLink = ({
  cozyUrl,
  searchParams: searchParamsOption,
  pathname,
  hash,
  slug,
  subDomainType
}) => {
  const searchParams = searchParamsOption || []
  const url = new URL(cozyUrl)

  url.host =
    subDomainType === 'nested'
      ? `${slug}.${url.host}`
      : url.host
          .split('.')
          .map((x, i) => (i === 0 ? x + '-' + slug : x))
          .join('.')
  url.pathname = ensureFirstSlash(pathname)
  url.hash = ensureFirstSlash(hash)

  for (const [param, value] of searchParams) {
    url.searchParams.set(param, value)
  }

  return url.toString()
}

/**
 * Deconstruct the given link in order to retrieve useful data like Cozy's name, domain, or slug
 *
 * The given link MUST contain a slug
 *
 * @param {string} webLink - link to deconstruct. It should be a link from a Cozy and containing a slug
 * @param {import("../types").SubdomainType} [subDomainType=flat] - whether the cozy is using flat or nested subdomains.
 * @returns {import("../types").CozyLinkData} Deconstructed link
 */
export const deconstructCozyWebLinkWithSlug = (
  webLink,
  subDomainType = 'flat'
) => {
  const url = new URL(webLink)

  const slug =
    subDomainType === 'nested'
      ? url.host.split('.')[0]
      : url.host.split('.')[0].split('-')[1]

  const cozyName =
    subDomainType === 'nested'
      ? url.host.split('.')[1]
      : url.host.split('.')[0].split('-')[0]

  const cozyBaseDomain = url.host
    .split('.')
    .slice(subDomainType === 'nested' ? 2 : 1)
    .join('.')

  return {
    cozyBaseDomain,
    cozyName,
    pathname: url.pathname,
    hash: url.hash,
    protocol: url.protocol,
    searchParams: url.searchParams.toString(),
    slug
  }
}

const isValidSlug = slug => slug.match(/^[a-z0-9]+$/)

/**
 * Deconstruct the given redirect link in order to retrieve slug, pathname and hash
 *
 * @param {string} redirectLink - redirect link to deconstruct (i.e. 'drive/public/#/folder/SOME_ID')
 * @returns {import("../types").RedirectLinkData} Deconstructed link
 * @throws {InvalidRedirectLinkError} Thrown when redirect link is invalid
 */

export const deconstructRedirectLink = redirectLink => {
  const [splits, hash] = redirectLink.split('#')
  const [slug, pathname] = splits.split(/\/(.*)/)

  if (!isValidSlug(slug)) {
    throw new InvalidRedirectLinkError(redirectLink)
  }

  return {
    slug,
    pathname,
    hash
  }
}

export class InvalidRedirectLinkError extends Error {
  constructor(redirectLink) {
    super(`Invalid redirect link ${redirectLink}`)

    this.redirectLink = redirectLink
  }
}

export class InvalidProtocolError extends Error {
  constructor(url) {
    super(`Invalid URL protocol ${url.protocol}`)

    this.url = url
  }
}

export class BlockedCozyError extends Error {
  constructor(url) {
    super(`Blocked cozy ${url.toString()}`)

    this.url = url
  }
}

export class InvalidCozyUrlError extends Error {
  constructor(url) {
    super(`URL ${url.toString()} does not seem to be a valid Cozy URL`)

    this.url = url
  }
}

/* uri - Returns a well formed URL origin from a protocol, a hostname and a port
 *
 * If the protocol and/or port are omitted from the argument, the function will
 * default to HTTPS and omit the port in the returned origin.
 *
 * @param {object} url          Object of URL elements
 * @param {string} url.protocol Protocol to use in the origin (e.g. http)
 * @param {string} url.hostname Hostname to use in the origin (e.g. claude.mycozy.cloud)
 * @param {string} url.port     Port to use in the origin (e.g. 8080)
 *
 * @returns {string} Generated URL origin
 */
const uri = ({ protocol, hostname, port }) => {
  return (
    (protocol !== '' ? `${protocol}//` : 'https://') +
    hostname +
    (port !== '' ? `:${port}` : '')
  )
}

/* publicPreloginUrl - Returns a valid URL string to the /public/prelogin API endpoint
 *
 * The built URL will point to the origin generated from the given protocol,
 * hostname and port.
 *
 * @param {object} url          Object of URL elements
 * @param {string} url.protocol Protocol to use in the origin (e.g. http)
 * @param {string} url.hostname Hostname to use in the origin (e.g. claude.mycozy.cloud)
 * @param {string} url.port     Port to use in the origin (e.g. 8080)
 *
 * @returns {string} Generated Well Known password change URL string
 */
const publicPreloginUrl = url => uri(url) + '/public/prelogin'

/* isValidOrigin - Checks whether a given URL is a valid Cozy origin
 *
 * This method tries to fetch the Well Known change password page of the Cozy
 * supposedly at the given origin. This allows us to determine whether the given
 * origin is the root URL of a Cozy or not via the status of the response:
 * - a 200 response status means there's an actual Well Known password change
 *   page accessible from the given origin so we suppose it's a valid Cozy
 *   origin (i.e. it could be another site altogether though)
 * - a 401 response status means the pointed page requires authentication so the
 *   origin is probably pointing to a cozy-app. In that case we should consider this
 *   URL to be invalid
 * - a 503 response status with a "Blocked" reason means the pointed page is a Cozy
 *   but it is blocked. In that case we consider that the url is a valid Cozy origin
 *   but we want the method to throw as we cannot verify if the URL points to the
 *   Cozy's root or to a specifc slug. The caller is responsible to handle that exception
 * - another status means there aren't any Cozy behind to the given origin
 *
 * @param {URL} url URL to validate
 *
 * @returns {Promise<boolean>} True if we believe there's a Cozy behind the given origin
 * @throws {InvalidCozyUrlError} Thrown when we know for sure there aren't any Cozy behind the given origin
 * @throws {BlockedCozyError} Thrown when we know for sure there is Cozy behind the given origin but it is in a "Blocked" state
 */
const isValidOrigin = async url => {
  const response = await fetch(publicPreloginUrl(url))
  const { status, url: responseUri } = response

  if (status === 404) {
    throw new InvalidCozyUrlError(url)
  }

  if (await isResponseAboutBlockedCozy(response)) {
    throw new BlockedCozyError(url)
  }

  if (status !== 200) return

  const wasRedirected =
    responseUri && url.origin !== new URL(responseUri).origin

  if (wasRedirected) {
    return false
  }

  const contentType = response.headers.get('content-type')
  if (!contentType || contentType.indexOf('application/json') === -1) {
    return false
  }

  return response.json()
}

/**
 * rootCozyUrl - Get the root URL of a Cozy from more precise ones
 *
 * The goal is to allow users to use any URL copied from their browser as their
 * Cozy URL rather than trying to explain to them what we expect (e.g. when
 * requesting the Cozy URL to connect an app).
 * If we can't get the root URL either because there's no Cozy or the domain
 * does not exist or anything else, we'll throw an InvalidCozyUrlError.
 * Also, since we communicate only via HTTP or HTTPS, we'll throw an
 * InvalidProtocolError if any other protocol is used.
 *
 * This function expects a fully qualified URL thus with a protocol and a valid
 * hostname. If your application accepts Cozy intances as input (e.g. `claude`
 * when the Cozy can be found at `https://claude.mycozy.cloud`), it is your
 * responsibility to add the appropriate domain to the hostname before calling
 * this function.
 *
 * Examples:
 *
 * 1. getting the root URL when your user gives you its instance name
 *
 *   const userInput = 'claude'
 *   const rootUrl = await rootCozyUrl(new URL(`https://${userInput}.mycozy.cloud`))
 *   // → returns new URL('https://claude.mycozy.cloud')
 *
 * 2. getting the root URL when your user gives you a Cozy Drive URL
 *
 *   const userInput = 'https://claude-drive.mycozy.cloud/#/folder/io.cozy.files.root-dir'
 *   const rootUrl = await rootCozyUrl(new URL(userInput))
 *   // → returns new URL('https://claude.mycozy.cloud')
 *
 * 3. getting the root URL when the Cozy uses nested sub-domains
 *
 *   const userInput = 'http://photos.camille.nimbus.com:8080/#/album/1234567890'
 *   const rootCozyUrl = await rootCozyUrl(new URL(userInput))
 *   // → returns new URL('http://camille.nimbus.com:8080')
 *
 * @param {URL} url The URL from which we'll try to get the root Cozy URL
 *
 * @returns {Promise<URL>} The root Cozy URL
 */
export const rootCozyUrl = async url => {
  const detail = await fetchRegistrationDetails(url)

  return detail.rootUrl
}

/**
 * Check if the given response is about a Cozy being blocked
 *
 * @param {Response} response - Fetch API response
 * @returns {Promise<boolean>} true if the response is about a Cozy being blocked, false otherwize
 */
const isResponseAboutBlockedCozy = async response => {
  if (response.status !== 503) return false

  const contentType = response.headers.get('content-type')
  const isJson = contentType && contentType.indexOf('json') >= 0
  const data = await (isJson ? response.json() : response.text())

  if (data?.some?.(reason => reason.title === 'Blocked')) {
    return true
  }

  return false
}

/**
 * Check if the given value is an absolute URL using the http or https protocol
 *
 * @param {any} value - Value to check
 * @returns {boolean} true if the value is an absolute http(s) URL
 */
export const isHttpUrl = value => {
  if (typeof value !== 'string') return false
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol)
  } catch (e) {
    return false
  }
}

/**
 * Check if the given url uses the expected protocols (http or https). Throws otherwise
 *
 * @param {URL} url - URL to validate
 */
const throwIfInvalidProtocol = url => {
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new InvalidProtocolError(url)
  }
}

const mayHaveSlug = url => /^[^.-][^.]+-[^.-]+\./.test(url.hostname)
const removeSlug = url => {
  const [subDomain, ...domain] = url.hostname.split('.')
  const hostname = [subDomain.replace(/-.+/, ''), ...domain].join('.')

  const noSlugUrl = new URL(
    uri({ protocol: url.protocol, hostname, port: url.port })
  )

  return noSlugUrl
}

const removeSubdomain = url => {
  const hostname = url.hostname
    .split('.')
    .splice(1)
    .join('.')
  const noSubUrl = new URL(
    uri({ protocol: url.protocol, hostname, port: url.port })
  )

  return noSubUrl
}

/**
 * @typedef {object} RegistrationDetails
 * @property {URL} rootUrl - The Cozy's root URL
 * @property {boolean} isOIDC - True if the Cozy's uses OIDC for login
 */

/**
 * registrationDetails - Get the root URL and prelogin info of a Cozy from more
 * precise ones
 *
 * The goal is to allow users to use any URL copied from their browser as their
 * Cozy URL rather than trying to explain to them what we expect (e.g. when
 * requesting the Cozy URL to connect an app).
 * If we can't get the root URL either because there's no Cozy or the domain
 * does not exist or anything else, we'll throw an InvalidCozyUrlError.
 * Also, since we communicate only via HTTP or HTTPS, we'll throw an
 * InvalidProtocolError if any other protocol is used.
 *
 * This function expects a fully qualified URL thus with a protocol and a valid
 * hostname. If your application accepts Cozy intances as input (e.g. `claude`
 * when the Cozy can be found at `https://claude.mycozy.cloud`), it is your
 * responsibility to add the appropriate domain to the hostname before calling
 * this function.
 *
 * Examples:
 *
 * 1. getting the root URL when your user gives you its instance name
 *
 *   const userInput = 'claude'
 *   const details = await fetchRegistrationDetails(new URL(`https://${userInput}.mycozy.cloud`))
 *   // → returns { rootUrl: new URL('https://claude.mycozy.cloud'), isOIDC: false }
 *
 * 2. getting the root URL when your user gives you a Cozy Drive URL
 *
 *   const userInput = 'https://claude-drive.mycozy.cloud/#/folder/io.cozy.files.root-dir'
 *   const rootUrl = await fetchRegistrationDetails(new URL(userInput))
 *   // → returns { rootUrl: new URL('https://claude.mycozy.cloud'), isOIDC: false }
 *
 * 3. getting the root URL when the Cozy uses nested sub-domains
 *
 *   const userInput = 'http://photos.camille.nimbus.com:8080/#/album/1234567890'
 *   const rootCozyUrl = await fetchRegistrationDetails(new URL(userInput))
 *   // → returns { rootUrl: new URL('http://camille.nimbus.com:8080'), isOIDC: false }
 *
 * 4. getting the root URL when your user gives you an instance from OIDC partners
 *
 *   const details = await fetchRegistrationDetails(new URL(`https://alice.someoidcpartener.com`))
 *   // → returns { rootUrl: new URL('https://alice.someoidcpartener.com'), isOIDC: true }
 *
 * @param {URL} url The URL from which we'll try to get the root Cozy URL
 *
 * @returns {Promise<RegistrationDetails>} The root Cozy URL
 */
export const fetchRegistrationDetails = async url => {
  throwIfInvalidProtocol(url)

  const preloginData = await isValidOrigin(url)
  if (preloginData) {
    return {
      rootUrl: new URL(
        uri({
          protocol: url.protocol,
          hostname: url.hostname,
          port: url.port
        })
      ),
      isOIDC: preloginData.OIDC
    }
  }

  // If the entered URL's lowest sub-domain contains a dash, remove it and
  // what follows and try the new resulting url.
  if (mayHaveSlug(url)) {
    const noSlugUrl = removeSlug(url)

    const noSlugPreloginData = await isValidOrigin(noSlugUrl)
    if (noSlugPreloginData) {
      return {
        rootUrl: noSlugUrl,
        isOIDC: noSlugPreloginData.OIDC
      }
    }
  }

  // Try to remove the first sub-domain in case its a nested app name
  // eslint-disable-next-line no-unused-vars
  const noSubUrl = removeSubdomain(url)
  const noSubPreloginData = await isValidOrigin(noSubUrl)
  if (noSubPreloginData) {
    return {
      rootUrl: noSubUrl,
      isOIDC: noSubPreloginData.OIDC
    }
  }

  // At this point, we've tried everything we could to correct the user's URL
  // without success. So bail out and let the user provide a valid one.
  throw new InvalidCozyUrlError(url)
}
