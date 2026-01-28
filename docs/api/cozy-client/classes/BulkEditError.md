[cozy-client](../README.md) / BulkEditError

# Class: BulkEditError

## Hierarchy

*   `Error`

    ↳ **`BulkEditError`**

## Constructors

### constructor

• **new BulkEditError**(`bulkResponse`, `updatedDocs`)

Indicates that a bulk edit has (potentially partially) failed

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `bulkResponse` | `CouchDBBulkResult`\[] | CouchDB Bulk response |
| `updatedDocs` | `CozyClientDocument`\[] | Docs with updated \_id and \_rev |

*Overrides*

Error.constructor

*Defined in*

[packages/cozy-client/src/errors.js:10](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/errors.js#L10)

## Properties

### name

• **name**: `string`

*Inherited from*

Error.name

*Defined in*

[packages/cozy-client/src/errors.js:12](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/errors.js#L12)

***

### results

• **results**: { `doc`: `CozyClientDocument` ; `error`: `string` ; `id`: `string` ; `ok`: `boolean` ; `reason`: `string` ; `rev`: `string`  }\[]

*Defined in*

[packages/cozy-client/src/errors.js:13](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/errors.js#L13)

## Methods

### getErrors

▸ **getErrors**(): `CouchDBBulkResult` & { `doc`: `CozyClientDocument`  }\[]

Get bulk errors results

*Returns*

`CouchDBBulkResult` & { `doc`: `CozyClientDocument`  }\[]

> }

*Defined in*

[packages/cozy-client/src/errors.js:32](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/errors.js#L32)

***

### getUpdatedDocuments

▸ **getUpdatedDocuments**(): `CozyClientDocument`\[]

Get documents that have been correctly updated

*Returns*

`CozyClientDocument`\[]

*Defined in*

[packages/cozy-client/src/errors.js:23](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/errors.js#L23)
