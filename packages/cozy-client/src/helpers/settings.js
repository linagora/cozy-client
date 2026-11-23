import CozyClient from '../CozyClient'
import fetchPolicies from '../policies'
import { Q } from '../queries/dsl'

const defaultFetchPolicy = fetchPolicies.olderThan(60 * 60 * 1000)

/**
 * Query the cozy-app settings corresponding to the given slug and
 * extract the values corresponding to the given `keys`
 *
 * @template {string} T
 *
 * @param {CozyClient} client - Cozy client instance
 * @param {string} slug - the cozy-app's slug containing the setting (can be 'instance' for global settings)
 * @param {T[]} keys - The names of the settings to retrieve
 * @returns {Promise<Record<T, any>>} - The values of the requested settings
 */
export const getSettings = async (client, slug, keys) => {
  const query = getQuery(slug)

  const currentSettingsResult = await client.fetchQueryAndGetFromState({
    definition: query.definition,
    options: query.options
  })

  const currentSettings = normalizeSettings(currentSettingsResult.data)

  // @ts-ignore
  return extractKeys(currentSettings, keys)
}

/**
 * Save the given value into the corresponding cozy-app setting
 *
 * This methods will first query the cozy-app's settings before injecting the new value and then
 * save the new resulting settings into database
 *
 * @template {string} T
 *
 * @param {CozyClient} client - Cozy client instance
 * @param {string} slug - the cozy-app's slug containing the setting (special cases are: 'instance' for global settings and 'bitwarden' for cozy-pass)
 * @param {Record<string, any> | ((oldValue) => Record<T, any>)} itemsOrSetter - The new values of the settings to save. It can be a raw dictionary, or a callback that should return a new dictionary
 * @param {T[]=} setterKeys - The new values of the settings to save. It can be a raw dictionary, or a callback that should return a new dictionary
 * @returns {Promise<any>} - The result of the `client.save()` call
 */
export const saveAfterFetchSettings = async (
  client,
  slug,
  itemsOrSetter,
  setterKeys
) => {
  const query = getQuery(slug)

  const currentSettingsResult = await client.fetchQueryAndGetFromState({
    definition: query.definition,
    options: query.options
  })

  const currentSettings = normalizeSettings(currentSettingsResult.data)

  let items
  if (typeof itemsOrSetter === 'function') {
    const currentItems = extractKeys(currentSettings, setterKeys)
    items = itemsOrSetter(currentItems)
  } else {
    const currentItems = extractKeys(
      currentSettings,
      Object.keys(itemsOrSetter)
    )
    items = {
      ...currentItems,
      ...itemsOrSetter
    }
  }

  const newSettings = editSettings(slug, currentSettings, items)

  return await client.save(newSettings)
}

/**
 * Convert a result from a `client.query()` or a `useQuery()` that can be
 * an object or an array of objects into a single object
 *
 * @param {Array | Object} data - Result from a client.query or a useQuery
 * @returns {Object} A single object containing the setting data
 */
export const normalizeSettings = data => {
  const settingsData = Array.isArray(data) ? data[0] : data

  return settingsData || {}
}

/**
 * Edit the given settings by injecting `value` into the `key` entry
 * This methods takes care of the kind of settings that is edited as there are
 * some exceptions in settings formats (i.e. `io.cozy.settings.instance`)
 *
 * @param {string} slug - the cozy-app's slug containing the setting (can be 'instance' for global settings)
 * @param {Object} currentSettings - the Setting object (ideally from a `client.query()` or a `useQuery()` and normalized using `normalizeSettings`)
 * @param {Record<string, unknown>} items - The new values for the settings
 * @returns {Object} a new Setting object containing the new value
 */
export const editSettings = (slug, currentSettings, items) => {
  const type = getDoctype(slug)

  const newSettings =
    slug === 'instance'
      ? mergeInstance(currentSettings, items)
      : mergeSettings(currentSettings, type, items)

  return newSettings
}

const mergeInstance = (currentSettings, items) => {
  const newSettings = {
    _id: currentSettings._id,
    _type: currentSettings._type,
    _rev: currentSettings.meta.rev,
    ...currentSettings,
    attributes: {
      ...currentSettings.attributes
    }
  }

  for (const [key, value] of Object.entries(items)) {
    newSettings[key] = value
    newSettings.attributes[key] = value
  }

  return newSettings
}

const mergeSettings = (currentSettings, type, items) => {
  const newSettings = {
    _type: type,
    ...currentSettings
  }

  for (const [key, value] of Object.entries(items)) {
    newSettings[key] = value
  }

  return newSettings
}

/**
 * Extract values from given settings for requested keys
 *
 * @template {string} T
 *
 * @param {Record<T, any>} settings - the Setting object (ideally from a `client.query()` or a `useQuery()` and normalized using `normalizeSettings`)
 * @param {T[]} keys - The names of the settings to extract
 * @returns {Record<T, any>} - Dictionnary containing the values for the requested keys
 */
export const extractKeys = (settings, keys) => {
  let result = {}
  for (const key of keys) {
    // @ts-ignore
    result[key] = settings[key]
  }

  // @ts-ignore
  return result
}

/**
 * Create a Query that can be used to fetch the cozy-app settings for the given slug
 *
 * @param {string} slug - the cozy-app's slug containing the setting (special cases are: 'instance' for global settings and 'passwords' for bitwarden settings)
 * @returns {import('../types').Query} - the Query that can be used to fetch the cozy-app settings
 */
export const getQuery = slug => {
  if (slug === 'instance') {
    return getNestedSettings(slug)
  }

  if (slug === 'passwords') {
    return getNestedSettings('bitwarden')
  }

  return getRootSettings(slug)
}

const getRootSettings = slug => {
  const settingsDoctype = getDoctype(slug)
  const query = {
    definition: Q(settingsDoctype).limitBy(1),
    options: {
      as: settingsDoctype,
      fetchPolicy: defaultFetchPolicy,
      singleDocData: true
    }
  }

  return query
}

const getNestedSettings = slug => {
  const doctype = `io.cozy.settings`
  const subDoctype = getDoctype(slug)
  const query = {
    definition: Q(doctype).getById(subDoctype),
    options: {
      as: `${doctype}/${subDoctype}`,
      fetchPolicy: defaultFetchPolicy,
      singleDocData: true
    }
  }

  return query
}

const getDoctype = slug => {
  if (['instance', 'bitwarden'].includes(slug)) {
    return `io.cozy.settings.${slug}`
  }

  if (slug === 'passwords') {
    return 'io.cozy.settings.bitwarden'
  }

  return `io.cozy.${slug}.settings`
}
