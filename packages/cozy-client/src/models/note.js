import { generateWebLink } from '../helpers'
import logger from '../logger'

/**
 *
 * @param {string} notesAppUrl URL to the Notes App (https://notes.foo.mycozy.cloud)
 * @param {object} file io.cozy.files object
 */
export const generatePrivateUrl = (notesAppUrl, file, options = {}) => {
  const { returnUrl } = options
  const url = new URL(notesAppUrl)
  if (returnUrl) {
    url.searchParams.set('returnUrl', returnUrl)
  }
  url.hash = `#/n/${file.id}`
  return url.toString()
}
export const generateUrlForNote = (notesAppUrl, file) => {
  logger.warn(
    'generateUrlForNote is deprecated. Please use models.note.generatePrivateUrl instead'
  )
  return generatePrivateUrl(notesAppUrl, file)
}
/**
 * Fetch and build an URL to open a note.
 *
 * @param {object} client CozyClient instance
 * @param {object} file io.cozy.file object
 * @param {object} options Options
 * @param {string} [options.pathname] Pathname to use in the URL
 * @param {string} [options.driveId] Shared drive ID used to fetched the URL
 * @param {string} [options.returnUrl] Return URL to add in query string
 * @returns {Promise<string>} url
 */
export const fetchURL = async (client, file, options = {}) => {
  const {
    data: { note_id, subdomain, protocol, instance, sharecode, public_name }
  } = await client
    .getStackClient()
    .collection('io.cozy.notes', { driveId: options.driveId })
    .fetchURL({ _id: file.id })
  if (sharecode) {
    const searchParams = [['id', note_id]]
    searchParams.push(['sharecode', sharecode])

    if (public_name) {
      searchParams.push(['username', public_name])
    }

    if (options.returnUrl) {
      searchParams.push(['returnUrl', options.returnUrl])
    }

    return generateWebLink({
      cozyUrl: `${protocol}://${instance}`,
      searchParams,
      pathname: options.pathname ?? '/public/',
      slug: 'notes',
      subDomainType: subdomain
    })
  } else {
    return generateWebLink({
      cozyUrl: `${protocol}://${instance}`,
      pathname: options.pathname ?? '',
      slug: 'notes',
      subDomainType: subdomain,
      hash: `/n/${note_id}`
    })
  }
}
