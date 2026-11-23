import get from 'lodash/get'

import { isAndroid, isIOS } from 'cozy-device-helper'
import flag from 'cozy-flags'

/**
 * Checks if a document has been updated by a specific app
 *
 * @param {object} doc - The document to check
 * @param {string} appSlug - The slug of the app to check
 * @returns {boolean} - True if the document has been updated by the app, false otherwise
 */
export const hasBeenUpdatedByApp = (doc, appSlug) => {
  const updatedByApps = get(doc, 'cozyMetadata.updatedByApps')
  return Boolean(updatedByApps && updatedByApps.find(x => x.slug === appSlug))
}

/**
 * Gets the app that created a document
 *
 * @param {object} doc - The document to check
 * @returns {string} - The slug of the app that created the document
 */
export const getCreatedByApp = doc => get(doc, 'cozyMetadata.createdByApp')

/**
 * Gets the download link for the Cozy Flagship app and his white-labels versions
 *
 * @param {string} lang - The language code for the download page
 * @returns {string} - The URL of the download page
 */
export const getFlagshipDownloadLink = lang => {
  if (isAndroid()) {
    const id = flag('flagship.playstore-id') || 'io.cozy.flagship.mobile'
    return `https://play.google.com/store/apps/details?id=${id}&hl=${lang}`
  }
  if (isIOS()) {
    const id = flag('flagship.appstore-id') || 'id1600636174'
    return `https://apps.apple.com/${lang}/app/${id}`
  }

  return flag('flagship.download-link') || `https://cozy.io/${lang}/download`
}
