# Contact and group suggestions

Use the query layer for a recipient picker:

```js
import { Q, fetchPolicies } from 'cozy-client'

const q = 'al'
const limit = 20
const result = await client.fetchQueryAndGetFromState({
  definition: Q('io.cozy.contacts.suggestions').suggestContacts(q, { limit }),
  options: {
    as: `contact-suggestions/${encodeURIComponent(q)}/${limit}`,
    singleDocData: true,
    fetchPolicy: fetchPolicies.olderThan(30 * 1000)
  }
})
const suggestions = result.data.suggestions
```

`io.cozy.contacts.suggestions` is a virtual query type, not a CouchDB doctype or
a new contact model. It caches one search result per trimmed query and limit.
Its nested suggestions use the existing contact and group fields, preserving
the stack's order. Partial suggestions never overwrite stored contacts/groups.
People without a local document have no `_id` or `id`. Groups contain their ID,
name, color and member count, without member documents.

For callers that do not use the query cache, the transport method is
`client.collection('io.cozy.contacts').suggest(q, { limit })`; it returns
`{ data: suggestions, next: false }`. Search text must contain at least two
Unicode characters after trimming. The combined limit defaults to 20 and must
be an integer between 1 and 256.

The stack requires read access to all `io.cozy.contacts` and
`io.cozy.contacts.groups` documents. It selects the sources from its configuration:
`centralized_org_directory=false` searches local contacts/groups only, regardless
of `common_contacts`. Enable the picker only on a stack supporting this API.

Suggestion queries are online only and are not routed to a local PouchDB database.
Offline applications should use their existing synced contact/group queries.

Sharing creation, recipient addition and shared-drive creation accept these
suggestions. Local contacts and groups are serialized by ID. Organization members
(`meta.kind === 'member'`) and people without an ID are serialized by their primary
email; organization IDs cannot be used as local contact IDs. Typed addresses can
also be passed as `{ _type: 'io.cozy.contacts', email: 'alice@example.org' }`.
