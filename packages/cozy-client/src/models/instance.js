import get from 'lodash/get'
import { Q } from '../queries/dsl'

const FallbackQuota = 1e11
const GB = 1000 * 1000 * 1000
const PREMIUM_QUOTA = 50 * GB

/**
 * @typedef {object} InstanceInfo
 * @typedef {object} ContextInfo
 * @typedef {object} DiskUsageInfo
 */

/**
 * @typedef SettingsInfo
 * @property {ContextInfo} context - Object returned by /settings/context
 * @property {InstanceInfo} instance - Object returned by /settings/instance
 * @property {DiskUsageInfo} diskUsage - Object returned by /settings/disk-usage
 */

// If manager URL is present, then the instance is not self-hosted
export const isSelfHosted = instanceInfo => {
  return get(instanceInfo, 'context.data.manager_url') ? false : true
}
export const arePremiumLinksEnabled = instanceInfo => {
  return get(instanceInfo, 'context.data.enable_premium_links') ? true : false
}
export const isFreemiumUser = instanceInfo => {
  const quota = get(instanceInfo, 'diskUsage.data.quota', false)
  return parseInt(quota) <= PREMIUM_QUOTA
}
export const getUuid = instanceInfo => {
  return get(instanceInfo, 'instance.data.uuid')
}

/**
 * Returns whether an instance is concerned by our offers
 *
 * @param {SettingsInfo} data Object containing all the results from /settings/*
 * @returns {boolean} Should we display offers
 */
export const shouldDisplayOffers = data => {
  return (
    !isSelfHosted(data) &&
    arePremiumLinksEnabled(data) &&
    getUuid(data) &&
    isFreemiumUser(data)
  )
}
/**
 * Returns if an instance has subscribed to one of our offers
 *
 * @param {SettingsInfo} data Object containing all the results from /settings/*
 * @returns {boolean} Does the cozy have offers
 */
export const hasAnOffer = data => {
  return (
    !isSelfHosted(data) &&
    arePremiumLinksEnabled(data) &&
    getUuid(data) &&
    !isFreemiumUser(data)
  )
}

/**
 * Returns the link to the Premium page on the Cozy's Manager
 *
 * @param {InstanceInfo} instanceInfo - Instance information
 */
export const buildPremiumLink = instanceInfo => {
  const managerUrl = get(instanceInfo, 'context.data.manager_url', false)
  const locale = get(instanceInfo, 'instance.data.locale', 'en')
  const uuid = getUuid(instanceInfo)
  if (managerUrl && uuid) {
    return `${managerUrl}/cozy/instances/${uuid}/premium?lang=${locale}`
  } else {
    return null
  }
}

/**
 * Checks the value of the password_defined attribute
 *
 * @param {import("../CozyClient").default} client - The CozyClient instance
 * @returns {Promise<boolean>} - Returns the value of the password_defined attribute
 */
export const hasPasswordDefinedAttribute = async client => {
  try {
    const {
      data: { password_defined }
    } = await client.fetchQueryAndGetFromState({
      definition: Q('io.cozy.settings').getById('io.cozy.settings.instance'),
      options: {
        as: 'io.cozy.settings/io.cozy.settings.instance',
        singleDocData: true
      }
    })

    return Boolean(password_defined)
  } catch {
    return false
  }
}

/**
 * @typedef DiskInfosRaw
 * @property diskQuota {number} - Space used in GB
 * @property diskUsage {number} -  Maximum space available in GB
 * @property percentUsage {number} - Usage percent of the disk
 */

/**
 * @typedef DiskInfos
 * @property humanDiskQuota {string} - Space used in GB rounded
 * @property humanDiskUsage {string} - Maximum space available in GB rounded
 * @property percentUsage {string} - Usage percent of the disk rounded
 */

/**
 * Convert input value into GB
 *
 * @param {number} bytes - Value in bytes
 * @returns {number} - Returns the value in GB
 */
const convertBytesToGB = bytes => bytes * 1e-9

/**
 * Computes `value` rounded to `fractionDigits`.
 *
 * @param {number} value - Value to format
 * @param {number} fractionDigits - Number of decimal numbers
 * @returns {string} - Returns the rounded number as a string
 */
const formatDecimals = (value, fractionDigits = 2) =>
  `${value % 1 ? value.toFixed(fractionDigits) : value}`

/**
 * Transform bytes data to GB data and compute percent usage
 *
 * @param {number} usage - Value in bytes representing the space used
 * @param {number} quota - Value in bytes representing the maximum space available
 * @returns {DiskInfosRaw} - Returns an transform data to GB and usage percent of the disk
 */
const computeDiskInfos = (usage, quota = FallbackQuota) => {
  let percentUsage = (usage / quota) * 100
  // Handle division by zero: if quota is 0, percent is always 0
  if (quota === 0) {
    percentUsage = 0
  }
  return {
    diskQuota: convertBytesToGB(quota),
    diskUsage: convertBytesToGB(usage),
    percentUsage
  }
}

/**
 * Make human readable information from disk information (usage, quota)
 *
 * @param {number|string} usage - Value in bytes representing the space used
 * @param {number|string} [quota] - Value in bytes representing the maximum space available
 * @returns {DiskInfos} - Return a set of human readable information about disk
 */
export const makeDiskInfos = (usage, quota) => {
  const { diskQuota, diskUsage, percentUsage } = computeDiskInfos(
    +usage,
    quota != null && quota !== '' ? +quota : undefined
  )
  return {
    humanDiskQuota: formatDecimals(diskQuota),
    humanDiskUsage: formatDecimals(diskUsage),
    percentUsage: Math.round(percentUsage).toString()
  }
}
