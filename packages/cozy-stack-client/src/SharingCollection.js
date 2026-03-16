import DocumentCollection from './DocumentCollection'
import { normalizeDoctypeJsonApi } from './normalize'
import { isFile, isDirectory } from './FileCollection'
import { uri } from './utils'

export const SHARING_DOCTYPE = 'io.cozy.sharings'
export const BITWARDEN_ORGANIZATIONS_DOCTYPE = 'com.bitwarden.organizations'
export const BITWARDEN_CIPHERS_DOCTYPE = 'com.bitwarden.ciphers'

const normalizeSharing = normalizeDoctypeJsonApi(SHARING_DOCTYPE)

/**
 * @typedef {object} Rule A sharing rule
 * @property {string} title
 * @property {string} doctype
 * @property {Array} values
 * @property {string=} add
 * @property {string=} update
 * @property {string=} remove
 */

/**
 * @typedef {object} SharingRulesOptions
 * @property {boolean} [sharedDrive]
 */

/**
 * @typedef {object} Recipient An io.cozy.contact
 */

/**
 * @typedef {object} Sharing An io.cozy.sharings document
 */

/**
 * @typedef {object} SharingPolicy Define the add/update/remove policies for a sharing
 * @property {string} add
 * @property {string} update
 * @property {string} remove
 */

/**
 * @typedef {(undefined|'one-way'|'two-way')} SharingType Define how a document is synced between sharing's owner and receivers.
 */

/**
 * @typedef {object} RelationshipItem Define a recipient that can be used as target of a sharing
 * @property {string} id - Recipient's ID
 * @property {string} type - Reciptient's type (should be 'io.cozy.contacts')
 */

/**
 * Implements the `DocumentCollection` API along with specific methods for
 * `io.cozy.sharings`.
 */
class SharingCollection extends DocumentCollection {
  /**
   * Finds all sharings for a given doctype
   *
   * @param {string} doctype The doctype
   * @param {SharingRulesOptions} [options] The options
   * @param {boolean} [options.withSharedDocs] If true, the response will include the shared documents
   * @returns {object} The response
   */
  async findByDoctype(doctype, { withSharedDocs = true } = {}) {
    const resp = await this.stackClient.fetchJSON(
      'GET',
      uri`/sharings/doctype/${doctype}?shared_docs=${withSharedDocs}`
    )
    return {
      ...resp,
      data: resp.data.map(normalizeSharing)
    }
  }
  /**
   * Fetches a sharing by id
   *
   * @param {string} id Sharing's id
   * @returns {Sharing} sharing
   */
  async get(id) {
    const path = uri`/sharings/${id}`
    const resp = await this.stackClient.fetchJSON('GET', path)
    return {
      data: normalizeSharing(resp.data)
    }
  }

  /**
   * Rename a shared drive
   *
   * @param {Sharing} sharing Sharing's id
   * @param {string} newName New name
   * @returns {object} The response
   */
  renameSharedDrive(sharing, newName) {
    const folderId = sharing?.rules?.[0]?.values?.[0]
    return this.stackClient.fetchJSON(
      'PATCH',
      uri`/sharings/drives/${sharing?._id}/${folderId}`,
      {
        data: {
          type: 'io.cozy.files',
          id: folderId,
          attributes: {
            name: newName
          }
        }
      }
    )
  }

  /**
   * Fetch shared drives
   *
   * @returns {Promise<{ data: Sharing[]}>} Shared drives (which are io.cozy.sharings documents)
   */
  async fetchSharedDrives() {
    const { data: sharedDrives } = await this.stackClient.fetchJSON(
      'GET',
      '/sharings/drives'
    )

    return { data: sharedDrives.map(normalizeSharing) }
  }

  /**
   *
   * Creates a new Sharing. See https://docs.cozy.io/en/cozy-stack/sharing/#post-sharings
   *
   * @param {object} params Sharing  params
   * @param {Sharing} params.document The document to share
   * @param {string} params.description Description of the sharing
   * @param {string=} params.previewPath The preview path
   * @param {Array<Rule>=} params.rules The rules defined to the sharing. See https://docs.cozy.io/en/cozy-stack/sharing-design/#description-of-a-sharing
   * @param {Array<Recipient>=} params.recipients Recipients to add to the sharings (will have the same permissions given by the rules defined by the sharing )
   * @param {Array<Recipient>=} params.readOnlyRecipients Recipients to add to the sharings with only read only access
   * @param {boolean=} params.openSharing If someone else than the owner can add a recipient to the sharing
   * @param {string=} params.appSlug Slug of the targeted app
   * @param {boolean=} params.sharedDrive If the sharing is a shared drive
   */
  async create({
    document,
    description,
    previewPath,
    rules,
    recipients = [],
    readOnlyRecipients = [],
    openSharing,
    appSlug,
    sharedDrive
  }) {
    if (sharedDrive) {
      return this.createSharedDrive({
        document,
        description,
        recipients,
        readOnlyRecipients
      })
    }

    const attributes = {
      description,
      preview_path: previewPath,
      open_sharing: openSharing,
      rules: rules ? rules : getSharingRules(document, { sharedDrive })
    }
    let optionalAttributes = {}
    if (appSlug) {
      optionalAttributes.app_slug = appSlug
    }

    const resp = await this.stackClient.fetchJSON('POST', '/sharings/', {
      data: {
        type: 'io.cozy.sharings',
        attributes: { ...attributes, ...optionalAttributes },
        relationships: {
          ...(recipients.length > 0 && {
            recipients: { data: recipients.map(toRelationshipItem) }
          }),
          ...(readOnlyRecipients.length > 0 && {
            read_only_recipients: {
              data: readOnlyRecipients.map(toRelationshipItem)
            }
          })
        }
      }
    })
    return { data: normalizeSharing(resp.data) }
  }

  /**
   * Creates a new shared drive. See https://docs.cozy.io/en/cozy-stack/shared-drives/
   *
   * @param {object} params Sharing params
   * @param {Sharing} params.document The document to share. Should have an _id
   * @param {string} params.description Description of the sharing
   * @param {Array<Recipient>=} params.recipients Recipients to add to the sharing
   * @param {Array<Recipient>=} params.readOnlyRecipients Recipients to add with read only access
   */
  async createSharedDrive({
    document,
    description,
    recipients = [],
    readOnlyRecipients = []
  }) {
    const resp = await this.stackClient.fetchJSON('POST', '/sharings/drives', {
      data: {
        attributes: {
          folder_id: document._id,
          description
        },
        relationships: {
          ...(recipients.length > 0 && {
            recipients: { data: recipients.map(toRelationshipItem) }
          }),
          ...(readOnlyRecipients.length > 0 && {
            read_only_recipients: {
              data: readOnlyRecipients.map(toRelationshipItem)
            }
          })
        }
      }
    })
    return { data: normalizeSharing(resp.data) }
  }

  /**
   * getDiscoveryLink - Returns the URL of the page that can be used to accept a sharing. See https://docs.cozy.io/en/cozy-stack/sharing/#get-sharingssharing-iddiscovery
   *
   * @param  {string} sharingId - Id of the sharing
   * @param  {string} sharecode - Code of the sharing
   * @param  {object} [options] - Options
   * @param  {boolean} [options.shortcut] - If true, add a shortcut to the sharing in the user's cozy and skip the OAuth authorize page.
   * @returns {string}
   */
  getDiscoveryLink(sharingId, sharecode, options) {
    const { shortcut } = options || {}
    const searchParams = new URLSearchParams()
    searchParams.append('sharecode', sharecode)
    if (shortcut) searchParams.append('shortcut', true)

    return this.stackClient.fullpath(
      `/sharings/${sharingId}/discovery?${searchParams}`
    )
  }

  /**
   * Add an array of contacts to the Sharing
   *
   * @param {object} options Object
   * @param {Sharing} options.document Sharing Object
   * @param {Array<Recipient>=} options.recipients Recipients to add to the sharing
   * @param {Array<Recipient>=} options.readOnlyRecipients Recipients to add to the sharings with only read only access
   */
  async addRecipients({ document, recipients = [], readOnlyRecipients = [] }) {
    const resp = await this.stackClient.fetchJSON(
      'POST',
      uri`/sharings/${document._id}/recipients`,
      {
        data: {
          type: 'io.cozy.sharings',
          id: document._id,
          relationships: {
            ...(recipients.length > 0 && {
              recipients: { data: recipients.map(toRelationshipItem) }
            }),
            ...(readOnlyRecipients.length > 0 && {
              read_only_recipients: {
                data: readOnlyRecipients.map(toRelationshipItem)
              }
            })
          }
        }
      }
    )
    return { data: normalizeSharing(resp.data) }
  }
  /**
   * Revoke only one recipient of the sharing.
   *
   * @param {Sharing} sharing Sharing Object
   * @param {number} recipientIndex Index of this recipient in the members array of the sharing
   */
  revokeRecipient(sharing, recipientIndex) {
    return this.stackClient.fetchJSON(
      'DELETE',
      uri`/sharings/${sharing._id}/recipients/${recipientIndex}`
    )
  }

  /**
   * Revoke only one group of the sharing.
   *
   * @param {Sharing} sharing Sharing Object
   * @param {number} groupIndex Index of this group in the groups array of the sharing
   */
  revokeGroup(sharing, groupIndex) {
    return this.stackClient.fetchJSON(
      'DELETE',
      uri`/sharings/${sharing._id}/groups/${groupIndex}`
    )
  }

  /**
   * Remove self from the sharing.
   *
   * @param {Sharing} sharing Sharing Object
   */
  revokeSelf(sharing) {
    return this.stackClient.fetchJSON(
      'DELETE',
      uri`/sharings/${sharing._id}/recipients/self`
    )
  }
  /**
   * Revoke the sharing for all the members. Must be called
   * from the owner's cozy
   *
   * @param {Sharing} sharing Sharing Objects
   */
  revokeAllRecipients(sharing) {
    return this.stackClient.fetchJSON(
      'DELETE',
      uri`/sharings/${sharing._id}/recipients`
    )
  }
}

SharingCollection.normalizeDoctype = normalizeDoctypeJsonApi

/**
 * Rules determine the behavior of the sharing when changes are made to the shared document
 * See https://docs.cozy.io/en/cozy-stack/sharing-design/#description-of-a-sharing
 *
 * @param {Sharing} document - The document to share. Should have and _id and a name
 * @param {SharingRulesOptions} [sharingRulesOptions] - The document to share. Should have and _id and a name
 *
 * @returns {Array<Rule>=} The rules that define how to share the document
 */
export const getSharingRules = (document, sharingRulesOptions = {}) => {
  const { sharedDrive } = sharingRulesOptions

  if (sharedDrive) {
    return getSharingRulesForSharedDrive(document)
  }

  if (isFile(document)) {
    return getSharingRulesForFile(document)
  }

  if (document._type === BITWARDEN_ORGANIZATIONS_DOCTYPE) {
    return getSharingRulesForOrganizations(document)
  }

  return getSharingRulesForPhotosAlbum(document)
}

/**
 * Compute the rules that define how to share a Photo Album. See https://docs.cozy.io/en/cozy-stack/sharing-design/#description-of-a-sharing
 *
 * @param {Sharing} document - The document to share. Should have and _id and a name
 *
 * @returns {Array<Rule>=} The rules that define how to share a Photo Album
 */
const getSharingRulesForPhotosAlbum = document => {
  const { _id, _type } = document
  return [
    {
      title: 'collection',
      doctype: _type,
      values: [_id],
      ...getSharingPolicyForAlbum()
    },
    {
      title: 'items',
      doctype: 'io.cozy.files',
      values: [`${_type}/${_id}`],
      selector: 'referenced_by',
      ...getSharingPolicyForReferencedFiles()
    }
  ]
}

/**
 * Compute the sharing policy for a ReferencedFile based on its sharing type
 *
 * @returns {SharingPolicy} The sharing policy for the ReferencedFile
 */
const getSharingPolicyForReferencedFiles = () => {
  return { add: 'sync', update: 'sync', remove: 'sync' }
}

/**
 * Compute the sharing policy for an Album based on its sharing type
 *
 * @returns {Array<Rule>=} The sharing policy for the Album
 */
const getSharingPolicyForAlbum = () => {
  return { update: 'sync', remove: 'revoke' }
}

/**
 * Compute the rules that define how to share a File. See https://docs.cozy.io/en/cozy-stack/sharing-design/#description-of-a-sharing
 *
 * @param {Sharing} document - The document to share. Should have and _id and a name
 *
 * @returns {Array<Rule>=} The rules that define how to share a File
 */
const getSharingRulesForFile = document => {
  const { _id, name } = document
  return [
    {
      title: name,
      doctype: 'io.cozy.files',
      values: [_id],
      ...getSharingPolicyForFile(document)
    }
  ]
}

/**
 * Compute the rules that define a shared drive.
 *
 * @param {Sharing} document - The document to share. Should have and _id and a name
 *
 * @returns {Array<Rule>=} The rules that define a shared drive
 */
const getSharingRulesForSharedDrive = document => {
  const { _id, name } = document
  return [
    {
      title: name,
      doctype: 'io.cozy.files',
      values: [_id],
      add: 'none',
      update: 'none',
      remove: 'none'
    }
  ]
}

/**
 * Compute the sharing policy for a File based on its sharing type
 *
 * @param {Sharing} document - The document to share. Should have and _id and a name
 *
 * @returns {SharingPolicy} The sharing policy for the File
 */
const getSharingPolicyForFile = document => {
  if (isDirectory(document)) {
    return { add: 'sync', update: 'sync', remove: 'sync' }
  }
  return { update: 'sync', remove: 'revoke' }
}

/**
 * Compute the rules that define how to share an Organization. See https://docs.cozy.io/en/cozy-stack/sharing-design/#description-of-a-sharing
 *
 * @param {Sharing} document The document to share. Should have and _id and a name
 *
 * @returns {Array<Rule>=} The rules that define how to share an Organization
 */
const getSharingRulesForOrganizations = document => {
  const { _id, name } = document
  const sharingRules = [
    {
      title: name,
      doctype: BITWARDEN_ORGANIZATIONS_DOCTYPE,
      values: [_id],
      add: 'sync',
      update: 'sync',
      remove: 'revoke'
    },
    {
      title: 'Ciphers',
      doctype: BITWARDEN_CIPHERS_DOCTYPE,
      values: [_id],
      add: 'sync',
      update: 'sync',
      remove: 'sync',
      selector: 'organization_id'
    }
  ]

  return sharingRules
}

/**
 * Compute the RelationshipItem that can be referenced as a sharing recipient
 *
 * @param {Recipient} item The recipient of a sharing
 *
 * @returns {RelationshipItem} The RelationshipItem that can be referenced as a sharing recipient
 */
const toRelationshipItem = item => {
  return {
    id: item._id,
    type: item._type
  }
}

export default SharingCollection
