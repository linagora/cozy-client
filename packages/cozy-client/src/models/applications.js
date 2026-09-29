import flag from 'cozy-flags'
import get from 'lodash/get'

import { isHttpUrl } from '../helpers'

const STORE_SLUG = 'store'

/**
 * Returns the store URL of an app/konnector
 *
 * @param {Array} [appData=[]] Apps data, as returned by endpoint /apps/ or /konnectors
 * @param {object} [app={}] AppObject
 * @returns {string} URL as string
 */
export const getStoreURL = (appData = [], app = {}) => {
  if (!app.slug) {
    throw new Error('Expected app / konnector with the defined slug')
  }

  const storeApp = isInstalled(appData, { slug: STORE_SLUG })
  if (!storeApp) return null

  const storeUrl = storeApp.links && storeApp.links.related

  if (!storeUrl) return null

  return `${storeUrl}#/discover/${app.slug}`
}

/**
 * Returns the store URL to install/update an app/konnector
 *
 * @param  {Array}  [appData=[]]   Apps data, as returned by endpoint /apps/ or
 * /konnectors/
 * @param  {object} [app={}] AppObject
 * @returns {string}                URL as string
 */
export const getStoreInstallationURL = (appData = [], app = {}) => {
  const storeUrl = getStoreURL(appData, app)

  if (!storeUrl) {
    return null
  }

  return `${storeUrl}/install`
}

/**
 *
 * @param {Array} apps Array of apps returned by /apps /konnectors
 * @param {object} wantedApp io.cozy.app with at least a slug
 * @returns {object} The io.cozy.app is installed or undefined if not
 */
export const isInstalled = (apps = [], wantedApp = {}) => {
  return apps.find(app => app.slug === wantedApp.slug)
}

/**
 * @param {object} app io.cozy.apps document
 * @returns {string} url to the app
 */
export const getUrl = app => {
  if (app.standalone === true && app.client_url_flag) {
    const clientUrl = flag(app.client_url_flag)
    if (isHttpUrl(clientUrl)) return clientUrl
  }
  return app.links && app.links.related
}

/**
 * getAppDisplayName - Combines the translated prefix and name of the app into a single string.
 *
 * @param {object} app io.cozy.apps or io.cozy.konnectors document
 * @param {string} lang Locale to use
 *
 * @returns {string} Name of the app suitable for display
 */
export const getAppDisplayName = (app, lang) => {
  const basePrefix = get(app, 'name_prefix')
  const baseName = get(app, 'name')
  const translatedName = get(app, ['locales', lang, 'name'], baseName)
  const translatedPrefix = get(
    app,
    ['locales', lang, 'name_prefix'],
    basePrefix
  )

  return translatedPrefix &&
    (translatedPrefix.toLowerCase() !== 'cozy' &&
      translatedPrefix.toLowerCase() !== 'twake')
    ? `${translatedPrefix} ${translatedName}`
    : translatedName
}

/**
 * sortApplicationsList - Sort the apps based on the slugs in parameters. Apps listed in the slugsOrder array will be added first
 * and will respect the order defined by slugsOrder and other apps will be added after.
 *
 * @param {object[]} apps io.cozy.apps array
 * @param {string[]} slugsOrder slugs array
 *
 * @returns {object[]} io.cozy.apps array
 */
export const sortApplicationsList = (apps, slugsOrder) => {
  return [...apps].sort((a, b) => {
    let indexA = slugsOrder.indexOf(a.slug)
    if (indexA === -1) indexA = 1000

    let indexB = slugsOrder.indexOf(b.slug)
    if (indexB === -1) indexB = 1000

    return indexA - indexB
  })
}

/**
 * @typedef {Object} EntrypointTitle
 * @property {string} [en] - English title
 * @property {string} [fr] - French title
 * @property {string} [ru] - Russian title
 * @property {string} [vi] - Vietnamese title
 */

/**
 * @typedef {Object} EntrypointCondition
 * @property {'flag'} type - The type of condition (currently only 'flag' is supported)
 * @property {string} name - The name of the flag
 * @property {boolean} value - The expected value of the flag
 */

/**
 * @typedef {Object} Entrypoint
 * @property {string} name - The unique name of the entrypoint
 * @property {EntrypointTitle} title - Localized titles for the entrypoint
 * @property {string} hash - The URL hash for navigation
 * @property {string} icon - Base64 encoded SVG icon
 * @property {EntrypointCondition[]} [conditions] - Conditions that must be met to display the entrypoint
 */

/**
 * Checks if an entrypoint condition is satisfied
 *
 * @param {EntrypointCondition} entrypointCondition - The condition to check
 * @returns {boolean} True if the condition is satisfied
 */
export const checkEntrypointCondition = entrypointCondition => {
  if (entrypointCondition.type === 'flag') {
    return flag(entrypointCondition.name) === entrypointCondition.value
  }

  return false
}

/**
 * Checks if an entrypoint should be displayed based on its conditions
 *
 * @param {Entrypoint} entrypoint - The entrypoint to check
 * @returns {boolean} True if all conditions are satisfied
 */
export const shouldDisplayEntrypoint = entrypoint => {
  const conditions = entrypoint.conditions || []

  return conditions.every(condition => checkEntrypointCondition(condition))
}

/**
 * Selects entrypoints by their names
 *
 * @param {Entrypoint[]} entrypoints - Array of entrypoints
 * @param {string[]} names - Array of entrypoint names to select
 * @returns {Entrypoint[]} Filtered array of entrypoints
 */
export const selectEntrypoints = (entrypoints, names) => {
  return entrypoints.filter(entrypoint => names.includes(entrypoint.name))
}

/**
 * Filters entrypoints based on whether they should be displayed
 *
 * @param {Entrypoint[]} entrypoints - Array of entrypoints
 * @returns {Entrypoint[]} Filtered array of entrypoints that should be displayed
 */
export const filterEntrypoints = entrypoints => {
  return entrypoints.filter(entrypoint => shouldDisplayEntrypoint(entrypoint))
}
