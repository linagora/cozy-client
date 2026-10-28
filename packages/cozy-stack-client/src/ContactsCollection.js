import DocumentCollection from './DocumentCollection'
import { normalizeDoctypeJsonApi } from './normalize'
import { uri } from './utils'
// @ts-ignore Need to import it to be used in jsdoc
import { IOCozyContact } from 'cozy-client/dist/types'

export const CONTACTS_DOCTYPE = 'io.cozy.contacts'

const normalizeContactJsonApi = normalizeDoctypeJsonApi(CONTACTS_DOCTYPE)

/**
 * A suggestion uses existing contact fields, without requiring a stored document.
 *
 * @typedef {Partial<IOCozyContact> & SuggestionOrigin} ContactSuggestion
 */

/**
 * @typedef {object} SuggestionOrigin
 * @property {object} [meta]
 * @property {'member'|'contact'} [meta.kind] - Organization member or local contact
 */

/**
 * @typedef {object} GroupSuggestion
 * @property {'io.cozy.contacts.groups'} _type
 * @property {string} _id
 * @property {string} id
 * @property {string} name
 * @property {string} color
 */

/** @typedef {ContactSuggestion|GroupSuggestion} RecipientSuggestion */

function normalizeSuggestion(resource) {
  if (
    resource.type !== CONTACTS_DOCTYPE &&
    resource.type !== 'io.cozy.contacts.groups'
  ) {
    throw new Error(`Unexpected suggestion type: ${resource.type}`)
  }
  const document = normalizeDoctypeJsonApi(resource.type)(resource)
  if (!resource.id) {
    delete document.id
    delete document._id
  }
  return {
    ...document,
    ...(resource.type === CONTACTS_DOCTYPE && {
      displayName: document.displayName || document.fullname || ''
    })
  }
}

const normalizeMyself = contact => {
  return {
    ...normalizeContactJsonApi(contact),
    _rev: contact?.meta?.rev
  }
}

/**
 * Contact documents and recipient suggestions from the stack.
 */
class ContactsCollection extends DocumentCollection {
  /**
   * Fetch groups and people the user can share with, in server order.
   * The stack chooses local or organization sources from its configuration.
   *
   * @param {string} q - Search text, at least two Unicode characters after trimming
   * @param {object} [options] - Search options
   * @param {number} [options.limit=20] - Combined result limit, from 1 to 256
   * @returns {Promise<{data: RecipientSuggestion[], next: boolean}>} Partial contact and group suggestions
   */
  async suggest(q, { limit = 20 } = {}) {
    if (typeof q !== 'string' || Array.from(q.trim()).length < 2) {
      throw new TypeError('Contact suggestions require at least 2 characters')
    }
    if (!Number.isInteger(limit) || limit < 1 || limit > 256) {
      throw new RangeError(
        'Contact suggestions limit must be between 1 and 256'
      )
    }
    const response = await this.stackClient.fetchJSON(
      'GET',
      uri`/contacts/suggest?q=${q.trim()}&limit=${limit}`
    )
    return { data: response.data.map(normalizeSuggestion), next: false }
  }

  async find(selector, options) {
    if (
      selector !== undefined &&
      Object.values(selector).length === 1 &&
      selector['me'] == true
    ) {
      return this.findMyself()
    } else {
      return super.find(selector, options)
    }
  }

  async findMyself() {
    const resp = await this.stackClient.fetchJSON('POST', '/contacts/myself')
    const col = {
      data: [normalizeMyself(resp.data)],
      next: false,
      meta: null,
      bookmark: false
    }
    return col
  }

  /**
   * Destroys a contact
   *
   * If the contact is linked to accounts, it will be trashed instead of being
   * destroyed.
   *
   * @param  {IOCozyContact} contact - Contact to destroy. IT MUST BE THE FULL CONTACT OBJECT
   * @returns {Promise<{ data: IOCozyContact }>} - Resolves when contact has been destroyed
   */
  async destroy(contact) {
    const syncData = contact?.cozyMetadata?.sync || {}
    const isLinkedToAccounts = Object.keys(syncData).length > 0
    if (isLinkedToAccounts) {
      return super.update({
        ...contact,
        trashed: true
      })
    } else {
      return super.destroy(contact)
    }
  }
}

export default ContactsCollection
