import get from 'lodash/get'
import intersection from 'lodash/intersection'

import CozyClient from '../CozyClient'
import { DOCTYPE_FILES } from '../const'
import logger from '../logger'
import { Q } from '../queries/dsl'
import { getParentFolderId } from './file'

/**
 * @typedef {object} Document - Couchdb document like an io.cozy.files
 * @property {string} _id
 * @property {string} id
 * @property {string} _type
 * @property {string} type
 */

/**
 * @typedef {('ALL'|'GET'|'PATCH'|'POST'|'PUT'|'DELETE')} PermissionVerb
 */

/**
 * @typedef {object} PermissionItem
 * @property {PermissionVerb[]} verbs - ALL, GET, PUT, PATCH, DELETE, POST…
 * @property {string} selector - defaults to `id`
 * @property {string[]} values
 * @property {string} type - a couch db database like 'io.cozy.files'
 */

/**
 * Is this permission read only ?
 *
 * @private
 * @param {PermissionItem} perm - permission node in a io.cozy.permissions document
 * @param {object} options - Options
 * @param {PermissionVerb[]} [options.writability] - Writability
 * @returns {boolean} true if the note should be displayed read-only
 */
export function isReadOnly(perm, options = {}) {
  const { writability = ['PATCH', 'POST', 'PUT', 'DELETE'] } = options
  return (
    perm.verbs && // no verbs is equivalent to ['ALL']
    perm.verbs.length > 0 && // empty array is equivalent to ['ALL']
    intersection(perm.verbs, ['ALL', ...writability]).length === 0
  )
}

/**
 * Fetches the list of permissions blocks
 *
 * @param {CozyClient} client -
 * @returns {Promise<PermissionItem[]>} list of permissions
 */
export async function fetchOwn(client) {
  const collection = client.collection('io.cozy.permissions')
  const data = await collection.fetchOwnPermissions()
  const permissions = get(data, 'data.attributes.permissions')
  if (!permissions) throw `Can't get self permissions`
  return Object.values(permissions)
}

/**
 * Checks if the permission item is about a specific doctype
 *
 * @param {PermissionItem} permission -
 * @param {string} type - doctype
 */
export function isForType(permission, type) {
  return permission.type === type || permission.type + '.*' === type
}

/**
 * Finds the permission block for the the file
 * in the permissions owned by the current cozy-client.
 *
 * Iterates through parent folders if needed
 * until we can find the permissions attached to the share
 *
 * @private
 * @param {object} options - Options
 * @param {Document} options.document - a couchdb document
 * @param {CozyClient} options.client - A cozy client
 * @param {PermissionItem[]} options.permissions -
 * @returns {Promise<PermissionItem|undefined>} the corresponding permission block
 */
async function findPermissionFor(options) {
  const { document, client, permissions } = options
  const id = document._id || document.id
  const type = document._type || document.type
  const doc = { ...document, id, type }

  const definedPermissions = permissions ? permissions : await fetchOwn(client)
  const perms = definedPermissions.filter(p => isForType(p, type))

  return _findPermissionFor({ doc, client, perms })

  async function getFile(id) {
    const query = Q(DOCTYPE_FILES).getById(id)
    const data = await client.query(query)
    return data && data.data
  }

  async function _findPermissionFor({ doc, client, perms }) {
    const perm = perms.find(perm => {
      if (perm.values) {
        const selector = perm.selector || 'id'
        const value = doc[selector]
        return perm.values.includes(value)
      } else {
        return true
      }
    })

    if (perm) {
      // ok, there is a match
      return perm
    } else if (type === DOCTYPE_FILES) {
      // for files, we recursively try to check for parent folders
      const parentId = getParentFolderId(doc)
      const parentFolder = parentId && (await getFile(parentId))
      if (parentFolder) {
        return _findPermissionFor({ doc: parentFolder, perms, client })
      }
    }
    // couldn't find anything
    return undefined
  }
}

export async function isDocumentReadOnly(args) {
  const {
    document,
    client,
    writability,
    permissions = await fetchOwn(client)
  } = args
  const perm =
    permissions.length <= 1
      ? permissions[0] // shortcut because most of time, there will be only one permission block
      : await findPermissionFor({ document, client, permissions })

  if (perm) {
    return isReadOnly(perm, { writability })
  } else {
    logger.warn(`can't find the document in current attached permissions`)
    return undefined
  }
}

/**
 * When a cozy to cozy sharing is created Cozy's stack creates a
 * shortcut in `/Inbox of sharing` on the recipient's cozy to have a
 * quick access even when the sharing is not accepted yet.
 *
 * However, this file is created only if the stack knows the URL of the cozy.
 * This is not always the case.
 *
 * This method is here to tell us if the shortcut's file is created
 * on the recipient's cozy. It can be used to make an UI distinction between the
 * both situation.
 *
 * @typedef  {object} Permission
 * @property {object} data Permission document
 * @property {Array} included Member information from the sharing
 *
 * @param {Permission} permission From getOwnPermissions mainly
 */
export const isShortcutCreatedOnTheRecipientCozy = permission => {
  if (!permission.included) return false
  const sharingMember = permission.included.find(
    item => item.type === 'io.cozy.sharings.members'
  )
  if (sharingMember && sharingMember.attributes.instance) {
    return true
  }
  return false
}
