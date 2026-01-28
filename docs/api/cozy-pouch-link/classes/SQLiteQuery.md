[cozy-pouch-link](../README.md) / SQLiteQuery

# Class: SQLiteQuery

## Hierarchy

*   `DatabaseQueryEngine`

    ↳ **`SQLiteQuery`**

## Constructors

### constructor

• **new SQLiteQuery**(`pouchManager`, `doctype`)

*Parameters*

| Name | Type |
| :------ | :------ |
| `pouchManager` | `any` |
| `doctype` | `any` |

*Overrides*

DatabaseQueryEngine.constructor

*Defined in*

[db/sqlite/sqliteDb.js:3](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/db/sqlite/sqliteDb.js#L3)

## Methods

### allDocs

▸ **allDocs**(`options`): `Promise`<`QueryResponse`>

Get all docs

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | `AllDocsParams` | The all docs options |

*Returns*

`Promise`<`QueryResponse`>

The found docs

*Inherited from*

DatabaseQueryEngine.allDocs

*Defined in*

[db/dbInterface.js:55](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/db/dbInterface.js#L55)

***

### find

▸ **find**(`options`): `Promise`<`QueryResponse`>

Find docs with filtered query

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | `FindParams` | The find options |

*Returns*

`Promise`<`QueryResponse`>

The found docs

*Inherited from*

DatabaseQueryEngine.find

*Defined in*

[db/dbInterface.js:45](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/db/dbInterface.js#L45)

***

### getById

▸ **getById**(`id`): `Promise`<`QueryResponseSingleDoc`>

Get a single doc by its id

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `string` | id of the document to get |

*Returns*

`Promise`<`QueryResponseSingleDoc`>

The found docs

*Inherited from*

DatabaseQueryEngine.getById

*Defined in*

[db/dbInterface.js:65](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/db/dbInterface.js#L65)

***

### getByIds

▸ **getByIds**(`ids`): `Promise`<`QueryResponse`>

Get several docs by their ids

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `ids` | `string`\[] | ids of the documents to get |

*Returns*

`Promise`<`QueryResponse`>

The found docs

*Inherited from*

DatabaseQueryEngine.getByIds

*Defined in*

[db/dbInterface.js:75](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/db/dbInterface.js#L75)

***

### openDB

▸ **openDB**(`dbName`): `void`

Open the database

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `dbName` | `string` | The database name |

*Returns*

`void`

*Inherited from*

DatabaseQueryEngine.openDB

*Defined in*

[db/dbInterface.js:35](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/db/dbInterface.js#L35)
