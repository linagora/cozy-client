import DocumentCollection from './DocumentCollection'
import { normalizeDoc } from './normalize'
import { isFile } from './FileCollection'
import { uri, sharedDriveApiPrefix } from './utils'
import logger from './logger'

const normalizePermission = perm => normalizeDoc(perm, 'io.cozy.permissions')

/**
 * Options that can be passed to PermissionCollection's constructor
 *
 * @typedef {object} PermissionCollectionOptions
 * @property {string} [driveId] - ID of the shared drive targeted by the collection
 */

/**
 * Implements `DocumentCollection` API along with specific methods for `io.cozy.permissions`.
 */
class PermissionCollection extends DocumentCollection {
  /**
   * @param {string} doctype - Doctype of the collection (should be `io.cozy.permissions`)
   * @param {CozyStackClient} stackClient -The client used to make requests to the server
   * @param {PermissionCollectionOptions} [options] - The collection options
   */
  constructor(doctype, stackClient, options = {}) {
    super(doctype, stackClient, options)
    this.prefix = options.driveId ? sharedDriveApiPrefix(options.driveId) : ''
  }
  async get(id) {
    const resp = await this.stackClient.fetchJSON(
      'GET',
      this.prefix + uri`/permissions/${id}`
    )
    return {
      data: normalizePermission(resp.data)
    }
  }
  /**
   * Create a new set of permissions
   * It can also associates one or more codes to it, via the codes parameter
   *
   * @param {object} permission - permission to create
   * @param {string} permission.codes A comma separed list of values (defaulted to code)
   * @param {string} permission.ttl Make the codes expire after a delay (bigduration format)
   * @param {boolean} permission.tiny If set to true then the generated shortcode will be 6 digits
   * Cozy-Stack has a few conditions to be able to use this tiny shortcode ATM you have to specifiy
   * a ttl < 1h, but it can change.
   * see https://docs.cozy.io/en/cozy-stack/permissions/#post-permissions for exact informations
   *
   * bigduration format: https://github.com/justincampbell/bigduration/blob/master/README.md
   * @see https://docs.cozy.io/en/cozy-stack/permissions/#post-permissions
   *
   */
  async create({ _id, _type, codes = 'code', ttl, tiny, ...attributes }) {
    const searchParams = new URLSearchParams()
    searchParams.append('codes', codes)
    if (ttl) searchParams.append('ttl', ttl)
    if (tiny) searchParams.append('tiny', true)
    const resp = await this.stackClient.fetchJSON(
      'POST',
      `${this.prefix}/permissions?${searchParams}`,
      {
        data: {
          type: 'io.cozy.permissions',
          attributes
        }
      }
    )
    return {
      data: normalizePermission(resp.data)
    }
  }

  /**
   * Adds a permission to the given document. Document type must be
   * `io.cozy.apps`, `io.cozy.konnectors` or `io.cozy.permissions`
   *
   * @param  {object}  document - Document which receives the permission
   * @param  {object}  permission - Describes the permission
   * @param {object} options - options
   * @param {string} [options.expiresAt] - Date at which the permission will expire. Set to "" to remove it.
   * @param {string} [options.password] - To generate a password-protected link. Set to "" to remove it.
   * @returns {Promise}
   *
   * @example
   * ```
   * const permissions = await client.collection('io.cozy.permissions').add(
   *   konnector,
   *   {
   *     folder: {
   *       type: 'io.cozy.files',
   *       verbs: ['GET', 'PUT'],
   *       values: [`io.cozy.files.bc57b60eb2954537b0dcdc6ebd8e9d23`]
   *     }
   *   },
   *   { expiresAt: '2100-01-01T00:00:00Z', password: 'password' }
   * )
   * ```
   */
  async add(document, permission, options = {}) {
    let endpoint
    switch (document._type) {
      case 'io.cozy.apps':
        endpoint = `${this.prefix}/permissions/apps/${document.slug}`
        break
      case 'io.cozy.konnectors':
        endpoint = `${this.prefix}/permissions/konnectors/${document.slug}`
        break
      case 'io.cozy.permissions':
        endpoint = `${this.prefix}/permissions/${document._id}`
        break
      default:
        throw new Error(
          'Permissions can only be added on existing permissions, apps and konnectors.'
        )
    }

    const { expiresAt, password } = options
    // We need to pass password and expires_at even if they are empty strings because the API expects them.
    // If value is a empty string, the stack will remove the password or expires_at.
    const hasPassword = password || password === ''
    const hasExpiresAt = expiresAt || expiresAt === ''

    const resp = await this.stackClient.fetchJSON('PATCH', endpoint, {
      data: {
        type: 'io.cozy.permissions',
        attributes: {
          permissions: permission,
          ...(hasPassword && { password }),
          ...(hasExpiresAt && { expires_at: expiresAt })
        }
      }
    })

    return { data: normalizePermission(resp.data) }
  }

  destroy(permission) {
    return this.stackClient.fetchJSON(
      'DELETE',
      this.prefix + uri`/permissions/${permission.id}`
    )
  }

  async findLinksByDoctype(doctype) {
    const resp = await this.stackClient.fetchJSON(
      'GET',
      this.prefix + uri`/permissions/doctype/${doctype}/shared-by-link`
    )
    return {
      ...resp,
      data: resp.data.map(normalizePermission)
    }
  }

  /**
   *
   * @deprecated
   */
  async findApps() {
    logger.warn(
      `PermissionCollection.findApps will be removed in next version of cozy-client. \n
      You can use AppCollection.all() instead \n
      or even better client.query(Q('io.cozy.apps'), {as: 'io.cozy.apps'})`
    )
    const resp = await this.stackClient.fetchJSON('GET', '/apps/')
    return { ...resp, data: resp.data.map(a => ({ _id: a.id, ...a })) }
  }

  /**
   * Create a share link
   *
   * @param {{_id, _type}} document - cozy document
   * @param {object} options - options
   * @param {string} [options.ttl] - Time to live (bigduration format, e.g. "4Y3M2D1h30m15s")
   * @param {string} [options.password] - To generate a password-protected link
   * @param {string[]} [options.verbs] - explicit permissions to use
   * @param {string} [options.codes] A comma separed list of values (defaulted to code)
   * @param {boolean} [options.tiny] If set to true then the generated shortcode will be 6 digits
   * Cozy-Stack has a few conditions to be able to use this tiny shortcode ATM you have to specifiy
   * a ttl < 1h, but it can change.
   * see https://docs.cozy.io/en/cozy-stack/permissions/#post-permissions for exact informations
   */
  async createSharingLink(document, options = {}) {
    const { ttl, password, verbs, tiny, codes = 'code' } = options
    const searchParams = new URLSearchParams()
    searchParams.append('codes', codes)
    if (ttl) searchParams.append('ttl', ttl)
    if (tiny) searchParams.append('tiny', true)

    const resp = await this.stackClient.fetchJSON(
      'POST',
      `${this.prefix}/permissions?${searchParams}`,
      {
        data: {
          type: 'io.cozy.permissions',
          attributes: {
            permissions: getPermissionsFor(
              document,
              true,
              verbs ? { verbs } : {}
            ),
            ...(password && { password })
          }
        }
      }
    )
    return { data: normalizePermission(resp.data) }
  }
  /**
   * Follow the next link to fetch the next permissions
   *
   * @param {object} permissions JSON-API based permissions document
   */
  async fetchPermissionsByLink(permissions) {
    if (permissions.links && permissions.links.next) {
      const resp = await this.stackClient.fetchJSON(
        'GET',
        permissions.links.next
      )
      return { ...resp, data: resp.data.map(normalizePermission) }
    }
  }

  /**
   *
   * @param {object} document Cozy doc
   * @returns {object} with all the permissions
   */
  async fetchAllLinks(document) {
    let allLinks = await this.findLinksByDoctype(document._type)
    let resp = allLinks
    while (resp.links && resp.links.next) {
      resp = await this.fetchPermissionsByLink(resp)
      allLinks.data.push(...resp.data)
    }
    return allLinks
  }
  /**
   * Destroy a sharing link and the related permissions
   *
   * @param {object} document - document to revoke sharing link
   */
  async revokeSharingLink(document) {
    const allLinks = await this.fetchAllLinks(document)
    const links = allLinks.data.filter(perm =>
      isPermissionRelatedTo(perm, document)
    )
    for (let perm of links) {
      await this.destroy(perm)
    }
  }

  /**
   * async getOwnPermissions - deprecated: please use fetchOwnPermissions instead
   *
   * @typedef {object} Permission
   *
   * @returns {Permission} permission
   */
  async getOwnPermissions() {
    logger.warn(
      'getOwnPermissions is deprecated, please use fetchOwnPermissions instead'
    )
    return this.fetchOwnPermissions()
  }

  /**
   * async fetchOwnPermissions - Fetches permissions
   *
   * @typedef {object} Permission
   *
   * @returns {Permission} permission
   */
  async fetchOwnPermissions() {
    const resp = await this.stackClient.fetchJSON(
      'GET',
      `${this.prefix}/permissions/self`
    )
    return {
      data: normalizePermission(resp.data),
      included: resp.included ? resp.included.map(normalizePermission) : []
    }
  }
}

/**
 * Build a permission set
 *
 * @param {{_id, _type}} document - cozy document
 * @param {boolean} publicLink - are the permissions for a public link ?
 * @param {object} options - options
 * @param {string[]} [options.verbs] - explicit permissions to use
 * @returns {object} permissions object that can be sent through /permissions/*
 */
export const getPermissionsFor = (
  document,
  publicLink = false,
  options = {}
) => {
  const { _id, _type } = document
  const verbs = options.verbs ? options.verbs : publicLink ? ['GET'] : ['ALL']
  // TODO: this works for albums, but it needs to be generalized and integrated
  // with cozy-client ; some sort of doctype "schema" will be needed here
  return isFile(document)
    ? {
        files: {
          type: 'io.cozy.files',
          verbs,
          values: [_id]
        }
      }
    : {
        collection: {
          type: _type,
          verbs,
          values: [_id]
        },
        files: {
          type: 'io.cozy.files',
          verbs,
          values: [`${_type}/${_id}`],
          selector: 'referenced_by'
        }
      }
}

const isPermissionRelatedTo = (perm, document) => {
  const { _id } = document
  return isFile(document)
    ? perm.attributes.permissions.files.values.indexOf(_id) !== -1
    : perm.attributes.permissions.collection.values.indexOf(_id) !== -1
}

export default PermissionCollection
