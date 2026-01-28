[cozy-client](../README.md) / QueryDefinition

# Class: QueryDefinition

Chainable API to create query definitions to retrieve documents
from a Cozy. `QueryDefinition`s are sent to links.

## Constructors

### constructor

• **new QueryDefinition**(`options?`)

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | `Object` | Initial options for the query definition |
| `options.bookmark` | `string` | - |
| `options.cursor` | `CouchDBViewCursor` | - |
| `options.doctype` | `string` | - |
| `options.fields` | `string`\[] | - |
| `options.id` | `string` | - |
| `options.ids` | `string`\[] | - |
| `options.includes` | `string`\[] | - |
| `options.indexedFields` | `string`\[] | - |
| `options.limit` | `number` | - |
| `options.partialFilter` | `any` | - |
| `options.referenced` | `string` | - |
| `options.selector` | `any` | - |
| `options.sharingId` | `string` | - |
| `options.skip` | `number` | - |
| `options.sort` | `any`\[] | - |

*Defined in*

[packages/cozy-client/src/queries/dsl.js:51](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/queries/dsl.js#L51)

## Properties

### bookmark

• **bookmark**: `string`

*Defined in*

[packages/cozy-client/src/queries/dsl.js:65](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/queries/dsl.js#L65)

***

### cursor

• **cursor**: `CouchDBViewCursor`

*Defined in*

[packages/cozy-client/src/queries/dsl.js:64](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/queries/dsl.js#L64)

***

### doctype

• **doctype**: `string`

*Defined in*

[packages/cozy-client/src/queries/dsl.js:52](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/queries/dsl.js#L52)

***

### fields

• **fields**: `string`\[]

*Defined in*

[packages/cozy-client/src/queries/dsl.js:56](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/queries/dsl.js#L56)

***

### id

• **id**: `string`

*Defined in*

[packages/cozy-client/src/queries/dsl.js:53](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/queries/dsl.js#L53)

***

### ids

• **ids**: `string`\[]

*Defined in*

[packages/cozy-client/src/queries/dsl.js:54](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/queries/dsl.js#L54)

***

### includes

• **includes**: `string`\[]

*Defined in*

[packages/cozy-client/src/queries/dsl.js:60](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/queries/dsl.js#L60)

***

### indexedFields

• **indexedFields**: `string`\[]

*Defined in*

[packages/cozy-client/src/queries/dsl.js:57](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/queries/dsl.js#L57)

***

### limit

• **limit**: `number`

*Defined in*

[packages/cozy-client/src/queries/dsl.js:62](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/queries/dsl.js#L62)

***

### partialFilter

• **partialFilter**: `any`

*Defined in*

[packages/cozy-client/src/queries/dsl.js:58](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/queries/dsl.js#L58)

***

### referenced

• **referenced**: `string`

*Defined in*

[packages/cozy-client/src/queries/dsl.js:61](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/queries/dsl.js#L61)

***

### selector

• **selector**: `any`

*Defined in*

[packages/cozy-client/src/queries/dsl.js:55](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/queries/dsl.js#L55)

***

### sharingId

• **sharingId**: `string`

*Defined in*

[packages/cozy-client/src/queries/dsl.js:66](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/queries/dsl.js#L66)

***

### skip

• **skip**: `number`

*Defined in*

[packages/cozy-client/src/queries/dsl.js:63](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/queries/dsl.js#L63)

***

### sort

• **sort**: `any`\[]

*Defined in*

[packages/cozy-client/src/queries/dsl.js:59](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/queries/dsl.js#L59)

## Methods

### UNSAFE_noLimit

▸ **UNSAFE_noLimit**(): [`QueryDefinition`](QueryDefinition.md)

*Returns*

[`QueryDefinition`](QueryDefinition.md)

*Defined in*

[packages/cozy-client/src/queries/dsl.js:293](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/queries/dsl.js#L293)

***

### checkSelectFields

▸ **checkSelectFields**(`obj`): `void`

Check if the selected fields are all included in the selectors

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `obj` | `PartialQueryDefinition` | A partial QueryDefinition to check |

*Returns*

`void`

*Defined in*

[packages/cozy-client/src/queries/dsl.js:156](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/queries/dsl.js#L156)

***

### checkSelector

▸ **checkSelector**(`selector`): `void`

Checks the selector predicates.

It is useful to warn the developer when a partial index might be used.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `selector` | `any` | The selector definition |

*Returns*

`void`

*Defined in*

[packages/cozy-client/src/queries/dsl.js:119](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/queries/dsl.js#L119)

***

### checkSortOrder

▸ **checkSortOrder**(`obj`): `void`

Checks if the sort order matches the index' fields order.

When sorting with CouchDB, it is required to:

*   use indexed fields
*   keep the same order than the indexed fields.

See https://docs.cozy.io/en/tutorials/data/queries/#sort-data-with-mango

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `obj` | `PartialQueryDefinition` | A partial QueryDefinition to check |

*Returns*

`void`

*Defined in*

[packages/cozy-client/src/queries/dsl.js:80](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/queries/dsl.js#L80)

***

### getById

▸ **getById**(`id`): [`QueryDefinition`](QueryDefinition.md)

Query a single document on its id.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `string` | The document id. |

*Returns*

[`QueryDefinition`](QueryDefinition.md)

The QueryDefinition object.

*Defined in*

[packages/cozy-client/src/queries/dsl.js:183](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/queries/dsl.js#L183)

***

### getByIds

▸ **getByIds**(`ids`): [`QueryDefinition`](QueryDefinition.md)

Query several documents on their ids.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `ids` | `any`\[] | The documents ids. |

*Returns*

[`QueryDefinition`](QueryDefinition.md)

The QueryDefinition object.

*Defined in*

[packages/cozy-client/src/queries/dsl.js:196](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/queries/dsl.js#L196)

***

### include

▸ **include**(`includes`): [`QueryDefinition`](QueryDefinition.md)

Includes documents having a relationships with the ones queried.
For example, query albums including the photos.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `includes` | `any`\[] | The documents to include. |

*Returns*

[`QueryDefinition`](QueryDefinition.md)

The QueryDefinition object.

*Defined in*

[packages/cozy-client/src/queries/dsl.js:276](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/queries/dsl.js#L276)

***

### indexFields

▸ **indexFields**(`indexedFields`): [`QueryDefinition`](QueryDefinition.md)

Specify which fields should be indexed. This prevent the automatic indexing of the mango fields.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `indexedFields` | `any`\[] | The fields to index. |

*Returns*

[`QueryDefinition`](QueryDefinition.md)

The QueryDefinition object.

*Defined in*

[packages/cozy-client/src/queries/dsl.js:232](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/queries/dsl.js#L232)

***

### limitBy

▸ **limitBy**(`limit`): [`QueryDefinition`](QueryDefinition.md)

Maximum number of documents returned, useful for pagination. Default is 100.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `limit` | `number` | The document's limit. |

*Returns*

[`QueryDefinition`](QueryDefinition.md)

The QueryDefinition object.

*Defined in*

[packages/cozy-client/src/queries/dsl.js:289](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/queries/dsl.js#L289)

***

### offset

▸ **offset**(`skip`): [`QueryDefinition`](QueryDefinition.md)

Skip the first ‘n’ documents, where ‘n’ is the value specified.

Beware, this [performs badly](http://docs.couchdb.org/en/stable/ddocs/views/pagination.html#paging-alternate-method) on view's index.
Prefer cursor-based pagination in such situation.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `skip` | `number` | The number of documents to skip. |

*Returns*

[`QueryDefinition`](QueryDefinition.md)

The QueryDefinition object.

*Defined in*

[packages/cozy-client/src/queries/dsl.js:306](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/queries/dsl.js#L306)

***

### offsetBookmark

▸ **offsetBookmark**(`bookmark`): [`QueryDefinition`](QueryDefinition.md)

Use [bookmark](https://docs.couchdb.org/en/2.2.0/api/database/find.html#pagination) pagination.
Note this only applies for mango-queries (not views) and is way more efficient than skip pagination.
The bookmark is a string returned by the \_find response and can be seen as a pointer in
the index for the next query.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `bookmark` | `string` | The bookmark to continue a previous paginated query. |

*Returns*

[`QueryDefinition`](QueryDefinition.md)

The QueryDefinition object.

*Defined in*

[packages/cozy-client/src/queries/dsl.js:344](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/queries/dsl.js#L344)

***

### offsetCursor

▸ **offsetCursor**(`cursor`): [`QueryDefinition`](QueryDefinition.md)

Use [cursor-based](https://docs.cozy.io/en/cozy-stack/jsonapi/#pagination) pagination.
*Warning*: this is only useful for views.
The cursor is a \[startkey, startkey_docid] array, where startkey is the view's key,
e.g. \["io.cozy.photos.albums", "album-id"] and startkey_docid is the id of
the starting document of the query, e.g. "file-id".
Use the last docid of each query as startkey_docid to paginate or leave blank for the first query.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `cursor` | `CouchDBViewCursor` | The cursor for pagination. |

*Returns*

[`QueryDefinition`](QueryDefinition.md)

The QueryDefinition object.

*Defined in*

[packages/cozy-client/src/queries/dsl.js:326](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/queries/dsl.js#L326)

***

### partialIndex

▸ **partialIndex**(`partialFilter`): [`QueryDefinition`](QueryDefinition.md)

Specify a [partial index](https://docs.couchdb.org/en/stable/api/database/find.html#find-partial-indexes).
The filter must follow the same syntax than the selector.

A partial index includes a filter, used to select documents before the indexing.
You can find more information about partial indexes [here](https://docs.cozy.io/en/tutorials/data/advanced/#partial-indexes)

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `partialFilter` | `any` | The filter definition. |

*Returns*

[`QueryDefinition`](QueryDefinition.md)

*Defined in*

[packages/cozy-client/src/queries/dsl.js:246](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/queries/dsl.js#L246)

***

### referencedBy

▸ **referencedBy**(`document`): [`QueryDefinition`](QueryDefinition.md)

Use the [file reference system](https://docs.cozy.io/en/cozy-stack/references-docs-in-vfs/)

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `document` | `any` | The reference document |

*Returns*

[`QueryDefinition`](QueryDefinition.md)

The QueryDefinition object.

*Defined in*

[packages/cozy-client/src/queries/dsl.js:359](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/queries/dsl.js#L359)

***

### select

▸ **select**(`fields`): [`QueryDefinition`](QueryDefinition.md)

Specify which fields of each object should be returned. If it is omitted, the entire object is returned.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `fields` | `any`\[] | The fields to return. |

*Returns*

[`QueryDefinition`](QueryDefinition.md)

The QueryDefinition object.

*Defined in*

[packages/cozy-client/src/queries/dsl.js:220](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/queries/dsl.js#L220)

***

### sharingById

▸ **sharingById**(`id`): [`QueryDefinition`](QueryDefinition.md)

Use a sharingId to query documents coming from a sharing

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `string` | The sharing doc id |

*Returns*

[`QueryDefinition`](QueryDefinition.md)

The QueryDefinition object.

*Defined in*

[packages/cozy-client/src/queries/dsl.js:369](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/queries/dsl.js#L369)

***

### sortBy

▸ **sortBy**(`sort`): [`QueryDefinition`](QueryDefinition.md)

Specify how to sort documents, following the [sort syntax](http://docs.couchdb.org/en/latest/api/database/find.html#find-sort)

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `sort` | `any`\[] | The list of field name and direction pairs. |

*Returns*

[`QueryDefinition`](QueryDefinition.md)

The QueryDefinition object.

*Defined in*

[packages/cozy-client/src/queries/dsl.js:257](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/queries/dsl.js#L257)

***

### toDefinition

▸ **toDefinition**(): `Object`

*Returns*

`Object`

| Name | Type |
| :------ | :------ |
| `bookmark` | `string` |
| `cursor` | `CouchDBViewCursor` |
| `doctype` | `string` |
| `fields` | `string`\[] |
| `id` | `string` |
| `ids` | `string`\[] |
| `includes` | `string`\[] |
| `indexedFields` | `string`\[] |
| `limit` | `number` |
| `partialFilter` | `any` |
| `referenced` | `string` |
| `selector` | `any` |
| `sharingId` | `string` |
| `skip` | `number` |
| `sort` | `any`\[] |

*Defined in*

[packages/cozy-client/src/queries/dsl.js:373](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/queries/dsl.js#L373)

***

### where

▸ **where**(`selector`): [`QueryDefinition`](QueryDefinition.md)

Query documents with a [mango selector](http://docs.couchdb.org/en/latest/api/database/find.html#find-selectors).
Each field passed in the selector will be indexed, except if the indexField option is used.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `selector` | `any` | The Mango selector. |

*Returns*

[`QueryDefinition`](QueryDefinition.md)

The QueryDefinition object.

*Defined in*

[packages/cozy-client/src/queries/dsl.js:207](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/queries/dsl.js#L207)
