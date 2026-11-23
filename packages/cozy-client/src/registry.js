import get from 'lodash/get'
import 'url-search-params-polyfill'

import { APP_TYPE } from './constants'
import termUtils from './terms'

export const transformRegistryFormatToStackFormat = doc => ({
  id: get(doc, 'latest_version.manifest.source'),
  attributes: get(doc, 'latest_version.manifest'),
  ...doc
})

export const registryEndpoint = '/registry/'

const queryPartFromOptions = options => {
  const query = new URLSearchParams(options).toString()
  return query ? `?${query}` : ''
}

const getBaseRoute = app => {
  const { type } = app
  // TODO node is an historic type, it should be `konnector`, check with the back
  const route =
    type === APP_TYPE.KONNECTOR || type === 'node' ? 'konnectors' : 'apps'
  return `/${route}`
}

/**
 * @typedef {object} RegistryApp
 * @property {string} slug
 * @property {object} terms
 * @property {boolean} installed
 * @property {string} type
 */

/**
 * @typedef {"dev"|"beta"|"stable"} RegistryAppChannel
 */

class Registry {
  constructor(options) {
    if (!options.client) {
      throw new Error('Need to pass a client to instantiate a Registry API.')
    }
    this.client = options.client
  }

  /**
   * Installs or updates an app from a source.
   *
   * Accepts the terms if the app has them.
   *
   * @param  {RegistryApp} app - App to be installed
   * @param  {string} source - String (ex: registry://drive/stable)
   * @returns {Promise}
   */
  async installApp(app, source) {
    const { slug, terms } = app
    const searchParams = {}
    const isUpdate = app.installed
    if (isUpdate) searchParams.PermissionsAcked = isUpdate
    if (source) searchParams.Source = source
    const querypart = queryPartFromOptions(searchParams)
    if (terms) {
      await termUtils.save(this.client, terms)
    }
    const verb = app.installed ? 'PUT' : 'POST'
    const baseRoute = getBaseRoute(app)
    return this.client.stackClient.fetchJSON(
      verb,
      `${baseRoute}/${slug}${querypart}`
    )
  }

  /**
   * Uninstalls an app.
   *
   * @param  {RegistryApp} app - App to be installed
   * @returns {Promise}
   */
  async uninstallApp(app) {
    const { slug } = app
    const baseRoute = getBaseRoute(app)
    return this.client.stackClient.fetchJSON('DELETE', `${baseRoute}/${slug}`)
  }

  /**
   * Fetch at most 200 apps from the channel
   *
   * @param  {object} params - Fetching parameters
   * @param  {string} params.type - "webapp" or "konnector"
   * @param  {RegistryAppChannel} params.channel - The channel of the apps to fetch
   * @param  {string} params.limit - maximum number of fetched apps - defaults to 200
   *
   * @returns {Promise<Array<RegistryApp>>}
   */
  async fetchApps(params) {
    const { channel, type, limit = '200' } = params
    const searchParams = {
      limit,
      versionsChannel: channel,
      latestChannelVersion: channel
    }
    let querypart = new URLSearchParams(searchParams).toString()
    if (type) {
      // Unfortunately, URLSearchParams encodes brackets so we have to do
      // the querypart handling manually
      querypart = querypart + `&filter[type]=${type}`
    }
    const { data: apps } = await this.client.stackClient.fetchJSON(
      'GET',
      `/registry?${querypart}`
    )
    return apps
  }

  /**
   * Fetch the list of apps that are in maintenance mode
   *
   * @returns {Promise<Array<RegistryApp>>}
   */
  fetchAppsInMaintenance() {
    return this.client.stackClient.fetchJSON('GET', '/registry/maintenance')
  }

  /**
   * Fetch the status of a single app on the registry
   *
   * @param  {string} slug - The slug of the app to fetch
   *
   * @returns {Promise<RegistryApp>}
   */
  fetchApp(slug) {
    return this.client.stackClient.fetchJSON('GET', `/registry/${slug}`)
  }

  /**
   * Fetch the latest version of an app for the given channel and slug
   *
   * @param  {object} params - Fetching parameters
   * @param  {string} params.slug - The slug of the app to fetch
   * @param  {RegistryAppChannel} params.channel - The channel of the app to fetch
   * @param  {string} params.version - The version of the app to fetch. Can also be "latest"
   *
   * @returns {Promise<RegistryApp>}
   */
  fetchAppVersion(params) {
    if (!params.slug) {
      throw new Error('Need to pass a slug to use fetchAppVersion')
    }
    const { slug, channel, version } = params
    const finalChannel =
      !channel && (!version || version === 'latest') ? 'stable' : channel
    let url = `/registry/${slug}/`
    if (finalChannel) {
      url += `${finalChannel}/${version || 'latest'}`
    } else {
      url += `${version}`
    }

    return this.client.stackClient.fetchJSON('GET', url)
  }
}

export default Registry
