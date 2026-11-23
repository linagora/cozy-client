const { QueryDefinition, models } = require('cozy-client')

const { makeDefaultSortIndexValue } = models.contact
const { shuffle } = require('lodash')

const schema = {
  contacts: {
    doctype: 'io.cozy.contacts',
    attributes: {
      'indexes.byFamilyNameGivenNameEmailCozyUrl': {
        type: 'string'
      }
    }
  }
}

const generateFakeContact = (cpt, isIndexed = false) => {
  const familyName = `Fake${cpt}`
  const givenName = `Faky${cpt}`
  const address = `${familyName}@${givenName}.com`
  const contact = {
    name: { familyName, givenName },
    email: [{ address }]
  }
  if (isIndexed) {
    const byFamilyNameGivenNameEmailCozyUrl = makeDefaultSortIndexValue(contact)
    contact.indexes = {
      byFamilyNameGivenNameEmailCozyUrl
    }
  }
  return contact
}

const createContactsBulk = async (client, nContacts, options = {}) => {
  const { nIndexed = 0 } = options

  if (nIndexed > nContacts) {
    console.error(
      'The number of indexed contacts should be inferior to the total number of contacts'
    )
    return null
  }

  const indexedContacts = []
  for (let i = 0; i < nIndexed; i++) {
    indexedContacts.push(generateFakeContact(i, true))
  }

  const notIndexedContacts = []
  for (let i = 0; i < nContacts - nIndexed; i++) {
    notIndexedContacts.push(generateFakeContact(i, false))
  }

  let contacts = notIndexedContacts.concat(indexedContacts)
  contacts = shuffle(contacts)

  await client.stackClient.collection('io.cozy.contacts').updateAll(contacts)
}

const deleteAllContactsBulk = async client => {
  const contacts = await getAllContacts(client)
  await client.stackClient.collection('io.cozy.contacts').destroyAll(contacts)
}

const getAllContacts = async client => {
  const query = new QueryDefinition({
    doctype: 'io.cozy.contacts',
    limit: null
  })
  const resp = await client.query(query)
  return resp.data
}

const getAllContactsSkip = async client => {
  const query = new QueryDefinition({
    doctype: 'io.cozy.contacts',
    limit: 100
  })
  const contacts = []
  let resp = { next: true }

  while (resp && resp.next) {
    resp = await client.query(query.offset(contacts.length), {
      as: 'skip-query'
    })
    contacts.push(...resp.data)
  }
  return contacts
}

const getAllContactsBookmark = async client => {
  const query = new QueryDefinition({
    doctype: 'io.cozy.contacts',
    limit: 100
  })
  const contacts = await client.queryAll(query, { as: 'bookmark-all-query' })
  return contacts
}

const getFilteredContactsBookmark = async client => {
  const selector = {
    _id: {
      $gt: null
    }
  }
  const query = new QueryDefinition({
    doctype: 'io.cozy.contacts',
    limit: 100,
    selector
  })
  const contacts = []
  let resp = { next: true, bookmark: '' }
  while (resp && resp.next) {
    resp = await client.query(query.offsetBookmark(resp.bookmark), {
      as: 'bookmark-find-query'
    })
    contacts.push(...resp.data)
  }
  return contacts
}

const getContactsByIndexesAttributePartialIndex = async (
  client,
  { hasIndexes = false }
) => {
  const query = new QueryDefinition({
    doctype: 'io.cozy.contacts',
    limit: 1000,
    partialFilter: {
      'indexes.byFamilyNameGivenNameEmailCozyUrl': {
        $exists: hasIndexes
      }
    },
    selector: {
      _id: {
        $gt: null
      }
    }
  })
  const contacts = await client.queryAll(query, {
    as: 'by-indexes-partial-query'
  })
  return contacts
}

const getContactsByIndexesAttribute = async (
  client,
  { hasIndexes = false }
) => {
  const indexedFields = hasIndexes
    ? ['indexes.byFamilyNameGivenNameEmailCozyUrl']
    : ['_id']
  const query = new QueryDefinition({
    doctype: 'io.cozy.contacts',
    limit: 1000,
    selector: {
      'indexes.byFamilyNameGivenNameEmailCozyUrl': {
        $exists: hasIndexes
      }
    },
    indexedFields
  })
  const contacts = await client.queryAll(query, { as: 'by-indexes-query' })
  return contacts
}

const getContactsTest = async client => {
  const query = new QueryDefinition({
    doctype: 'io.cozy.contacts',
    limit: 1000,
    selector: {
      'indexes.byFamilyNameGivenNameEmailCozyUrl': {
        $exists: false
      },
      name: {
        $gt: null
      }
    },
    indexedFields: ['name']
  })
  const contacts = await client.queryAll(query, { as: 'by-indexes-test' })
  return contacts
}

module.exports = {
  schema,
  createContactsBulk,
  deleteAllContactsBulk,
  getAllContacts,
  getAllContactsSkip,
  getAllContactsBookmark,
  getFilteredContactsBookmark,
  getContactsByIndexesAttributePartialIndex,
  getContactsByIndexesAttribute,
  getContactsTest
}
