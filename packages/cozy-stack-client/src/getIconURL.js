import { CozyStackClient } from './types'

import memoize, { ErrorReturned } from './memoize'
/**
 * Get Icon source Url
 *
 * @param  {object}  app - Apps data - io.cozy.apps
 * @param  {string}  slug - Slug - string
 * @param  {string|undefined} domain - Host to use in the origin (e.g. cozy.tools)
 * @param  {string} protocol - Url protocol (e.g. http / https)
 * @returns {string}  Source Url of icon
 * @private
 * @throws {Error} When cannot fetch or get icon source
 */
const loadIcon = (app, slug, domain, protocol) => {
  if (!domain) throw new Error('Cannot fetch icon: missing domain')
  const source = _getAppIconURL(app, slug, domain, protocol)
  if (!source) {
    throw new Error(`Cannot get icon source for app ${app.name}`)
  }
  return source
}

/**
 * Get App Icon URL
 *
 * @param  {object}  app - Apps data - io.cozy.apps or Slug - string
 * @param  {string}  slug - Slug - string
 * @param  {string|undefined} domain - Host to use in the origin (e.g. cozy.tools)
 * @param  {string} protocol - Url protocol (e.g. http / https)
 * @private
 * @returns {string|null}  App Icon URL
 */
const _getAppIconURL = (app, slug, domain, protocol) => {
  const path =
    (app && app.links && app.links.icon) || _getRegistryIconPath(app, slug)
  return path ? `${protocol}//${domain}${path}` : null
}

/**
 * Get Registry Icon Path
 *
 * @param  {object}  app - Apps data - io.cozy.apps or Slug - string
 * @param  {string}  slug - Slug - string
 * @returns {string|undefined}  Registry icon path
 * @private
 */
const _getRegistryIconPath = (app, slug) => {
  if (slug) {
    return `/registry/${slug}/icon`
  }

  return (
    app &&
    app.latest_version &&
    app.latest_version.version &&
    `/registry/${app.slug}/${app.latest_version.version}/icon`
  )
}

const mimeTypes = {
  gif: 'image/gif',
  ico: 'image/vnd.microsoft.icon',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  svg: 'image/svg+xml'
}

/**
 * Get icon extension
 *
 * @param {object} app io.cozy.apps or io.cozy.konnectors document
 * @param  {string} app.icon - App Icon
 * @param  {string} app.name - App Name
 * @returns {string}  icon extension
 * @private
 * @throws {Error} When problem while detecting icon mime type
 */
const getIconExtensionFromApp = app => {
  if (!app.icon) {
    throw new Error(
      `${app.name}: Cannot detect icon mime type since app has no icon`
    )
  }

  const extension = app.icon.split('.').pop()

  if (!extension) {
    throw new Error(
      `${app.name}: Unable to detect icon mime type from extension (${app.icon})`
    )
  }

  return extension
}

const fallbacks = async (tries, check) => {
  let err
  for (let _try of tries) {
    try {
      const res = await _try()
      check && check(res)
      return res
    } catch (e) {
      err = e
    }
  }
  throw err
}

/**
 * Fetch application/konnector that is installed
 *
 * @private
 */
const fetchAppOrKonnector = (stackClient, type, slug) =>
  stackClient.fetchJSON('GET', `/${type}s/${slug}`).then(x => x.data.attributes)

/**
 * Fetch application/konnector from the registry
 *
 * @private
 */
const fetchAppOrKonnectorViaRegistry = (stackClient, type, slug) =>
  stackClient
    .fetchJSON('GET', `/registry/${slug}`)
    .then(x => x.latest_version.manifest)

/**
 * Get Icon URL using blob mechanism if OAuth connected
 * or using preloaded url when blob not needed
 *
 * @param  {CozyStackClient}  stackClient - CozyStackClient
 * @param  {object} opts - Options
 * @param  {string} opts.type - Options type
 * @param  {string|undefined} opts.slug - Options slug
 * @param  {object|string|undefined}  opts.appData - Apps data - io.cozy.apps
 * @param  {string} [opts.priority='stack'] - Options priority
 * @returns {Promise<string>} DOMString containing URL source or a URL representing the Blob .
 * @private
 * @throws {Error} while fetching icon, or unknown image extension
 */
export const _getIconURL = async (stackClient, opts) => {
  const { type, slug, appData, priority = 'stack' } = opts
  if (stackClient.oauthOptions) {
    const iconDataFetchers = [
      () => stackClient.fetch('GET', `/${type}s/${slug}/icon`),
      () => stackClient.fetch('GET', `/registry/${slug}/icon`)
    ]
    if (priority === 'registry') {
      iconDataFetchers.reverse()
    }
    const resp = await fallbacks(iconDataFetchers, resp => {
      if (!resp.ok) {
        throw new Error(`Error while fetching icon ${resp.statusText}`)
      }
    })
    let icon = await resp.blob()
    let app
    if (!icon.type) {
      // iOS10 does not set correctly mime type for images, so we assume
      // that an empty mime type could mean that the app is running on iOS10.
      // For regular images like jpeg, png or gif it still works well in the
      // Safari browser but not for SVG.
      // So let's set a mime type manually. We cannot always set it to
      // image/svg+xml and must guess the mime type based on the icon attribute
      // from app/manifest
      // See https://stackoverflow.com/questions/38318411/uiwebview-on-ios-10-beta-not-loading-any-svg-images
      const appDataFetchers = [
        () => fetchAppOrKonnector(stackClient, type, slug),
        () => fetchAppOrKonnectorViaRegistry(stackClient, type, slug)
      ]
      if (priority === 'registry') {
        appDataFetchers.reverse()
      }
      app = appData || (await fallbacks(appDataFetchers)) || {}
      const ext = getIconExtensionFromApp(app)
      if (!mimeTypes[ext]) {
        throw new Error(`Unknown image extension "${ext}" for app ${app.name}`)
      }
      icon = new Blob([icon], { type: mimeTypes[ext] })
    }
    return URL.createObjectURL(icon)
  } else {
    try {
      const { host: domain, protocol } = new URL(stackClient.uri)
      return loadIcon(appData, slug, domain, protocol)
    } catch (error) {
      throw new Error(
        `Cannot fetch icon: invalid stackClient.uri: ${error.message}`
      )
    }
  }
}

/**
 * Get Icon URL using blob mechanism if OAuth connected
 * or using preloaded url when blob not needed
 *
 */
const getIconURL = function () {
  return _getIconURL.apply(this, arguments).catch(() => new ErrorReturned())
}

export default memoize(getIconURL, {
  maxDuration: 300 * 1000,
  key: (stackClient, opts) => {
    const { type, slug, priority } = opts
    return stackClient.uri + +':' + type + ':' + slug + ':' + priority
  }
})

export { getIconURL }
