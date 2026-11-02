# Contact and group suggestions

Use the contact collection transport for a recipient picker:

```js
const { data: suggestions } = await client
  .collection('io.cozy.contacts')
  .suggest('al', { limit: 20 })
```

The method returns `{ data: suggestions, next: false }` in the stack's order.
Suggestions contain a mix of groups, partial contacts and people without a local
document. People without a local document have no `_id` or `id`. Groups contain
their ID, name, color and member count, without member documents.

Search text must contain at least two Unicode characters after trimming. The
combined limit defaults to 20 and must be an integer between 1 and 256.

Suggestions are transient and online only. This transport deliberately bypasses
`Q()` and the query/link chain: results stay in the picker state, without Redux
query caching, request deduplication or local persistence. The picker should
debounce searches and ignore responses for older input. Offline applications
should use their existing synced contact/group queries. Direct access requires
an authenticated stack client, including in mobile and webview callers.

The stack requires read access to all `io.cozy.contacts` and
`io.cozy.contacts.groups` documents. It selects the sources from its configuration:
`centralized_org_directory=false` searches local contacts/groups only, regardless
of `common_contacts`. Enable the picker only on a stack supporting this API.

Sharing creation, recipient addition and shared-drive creation accept these
suggestions. Local contacts and groups are serialized by ID. Organization members
(`meta.kind === 'org_member'`) and people without an ID are serialized by a non-empty
primary email, falling back to the first non-empty email. Organization IDs cannot
be used as local contact IDs. Typed addresses can also be passed as
`{ _type: 'io.cozy.contacts', email: 'alice@example.org' }`.

Recipients without a local ID or usable email are rejected before sending the
sharing request. This includes groups without an ID and organization members
without an email, since their organization ID is not a local contact ID.
