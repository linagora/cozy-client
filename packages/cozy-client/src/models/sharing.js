import CozyClient from '../CozyClient'
import { DOCTYPE_FILES, DOCTYPE_PERMISSIONS } from '../const'
import { generateWebLink } from '../helpers'

/**
 * Generate Sharing link for one or many files
 *
 * @param {CozyClient} client - Instance of CozyClient
 * @param {string[]} filesIds - Array of io.cozy.files ids
 * @param {object} options - Options
 * @param {string} [options.ttl] - Time to live (bigduration format, e.g. "4Y3M2D1h30m15s")
 * @param {string} [options.password] - To generate a password-protected link
 * @param {string[]} [options.verbs] - Array of verbs to allow on the shared link. Default is ['GET']
 * @returns {Promise<string>} Shared link
 */
export const makeSharingLink = async (
  client,
  filesIds,
  { ttl, password, verbs = ['GET'] } = {}
) => {
  const PERMS = {
    _type: DOCTYPE_PERMISSIONS,
    permissions: {
      files: { type: DOCTYPE_FILES, values: filesIds, verbs }
    },
    ...(ttl && { ttl }),
    ...(password && { password })
  }
  const { data: sharedLink } = await client.save(PERMS)

  const webLink = generateWebLink({
    cozyUrl: client.getStackClient().uri,
    searchParams: [['sharecode', sharedLink?.attributes?.shortcodes?.code]],
    pathname: '/public',
    slug: 'drive',
    subDomainType: client.capabilities.flat_subdomains ? 'flat' : 'nested'
  })

  return webLink
}
