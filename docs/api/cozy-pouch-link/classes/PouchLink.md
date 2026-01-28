[cozy-pouch-link](../README.md) / PouchLink

# Class: PouchLink

Link to be passed to a `CozyClient` instance to support CouchDB. It instantiates
PouchDB collections for each doctype that it supports and knows how
to respond to queries and mutations.

## Hierarchy

*   `default`

    ↳ **`PouchLink`**

## Constructors

### constructor

• **new PouchLink**(`opts`)

constructor - Initializes a new PouchLink

*Parameters*

| Name | Type |
| :------ | :------ |
| `opts` | `PouchLinkOptions` |

*Overrides*

CozyLink.constructor

*Defined in*

[CozyPouchLink.js:100](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L100)

## Properties

### client

• **client**: `any`

*Defined in*

[CozyPouchLink.js:184](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L184)

***

### doctypes

• **doctypes**: `string`\[]

*Defined in*

[CozyPouchLink.js:118](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L118)

***

### doctypesReplicationOptions

• **doctypesReplicationOptions**: `Record`<`string`, `any`>

*Defined in*

[CozyPouchLink.js:119](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L119)

***

### indexes

• **indexes**: `Object`

*Defined in*

[CozyPouchLink.js:120](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L120)

***

### initialSync

• **initialSync**: `boolean`

*Defined in*

[CozyPouchLink.js:124](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L124)

***

### options

• **options**: { `replicationInterval`: `number`  } & `PouchLinkOptions`

*Defined in*

[CozyPouchLink.js:112](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L112)

***

### performanceApi

• **performanceApi**: `any`

*Defined in*

[CozyPouchLink.js:141](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L141)

***

### periodicSync

• **periodicSync**: `boolean`

*Defined in*

[CozyPouchLink.js:125](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L125)

***

### pouches

• **pouches**: `any`

*Defined in*

[CozyPouchLink.js:259](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L259)

***

### queryEngine

• **queryEngine**: `DatabaseQueryEngine` | typeof `default`

*Defined in*

[CozyPouchLink.js:257](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L257)

***

### replicationStatus

• **replicationStatus**: `Record`<`string`, `ReplicationStatus`>

*Defined in*

[CozyPouchLink.js:128](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L128)

***

### storage

• **storage**: `PouchLocalStorage`

*Defined in*

[CozyPouchLink.js:121](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L121)

## Methods

### addDoctype

▸ **addDoctype**(`doctype`, `replicationOptions`, `options`): `Promise`<`void`>

Adds a new doctype to the list of managed doctypes, sets its replication options,
adds it to the pouches, and starts replication.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `doctype` | `string` | The name of the doctype to add. |
| `replicationOptions` | `any` | The replication options for the doctype. |
| `options` | `Object` | The replication options for the doctype. |
| `options.shouldStartReplication` | `boolean` | - |

*Returns*

`Promise`<`void`>

*Defined in*

[CozyPouchLink.js:823](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L823)

***

### addReferencesTo

▸ **addReferencesTo**(`mutation`): `Promise`<`void`>

*Parameters*

| Name | Type |
| :------ | :------ |
| `mutation` | `any` |

*Returns*

`Promise`<`void`>

*Defined in*

[CozyPouchLink.js:772](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L772)

***

### bulkMutation

▸ **bulkMutation**(`mutation`): `Promise`<`any`\[]>

*Parameters*

| Name | Type |
| :------ | :------ |
| `mutation` | `any` |

*Returns*

`Promise`<`any`\[]>

*Defined in*

[CozyPouchLink.js:758](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L758)

***

### createDocument

▸ **createDocument**(`mutation`): `Promise`<`any`>

*Parameters*

| Name | Type |
| :------ | :------ |
| `mutation` | `any` |

*Returns*

`Promise`<`any`>

*Defined in*

[CozyPouchLink.js:721](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L721)

***

### createDocuments

▸ **createDocuments**(`mutation`): `Promise`<`any`\[]>

*Parameters*

| Name | Type |
| :------ | :------ |
| `mutation` | `any` |

*Returns*

`Promise`<`any`\[]>

*Defined in*

[CozyPouchLink.js:726](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L726)

***

### dbMethod

▸ **dbMethod**(`method`, `mutation`): `Promise`<`any`>

*Parameters*

| Name | Type |
| :------ | :------ |
| `method` | `any` |
| `mutation` | `any` |

*Returns*

`Promise`<`any`>

*Defined in*

[CozyPouchLink.js:776](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L776)

***

### deleteDocument

▸ **deleteDocument**(`mutation`): `Promise`<`any`>

*Parameters*

| Name | Type |
| :------ | :------ |
| `mutation` | `any` |

*Returns*

`Promise`<`any`>

*Defined in*

[CozyPouchLink.js:739](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L739)

***

### deleteDocuments

▸ **deleteDocuments**(`mutation`): `Promise`<`any`\[]>

*Parameters*

| Name | Type |
| :------ | :------ |
| `mutation` | `any` |

*Returns*

`Promise`<`any`\[]>

*Defined in*

[CozyPouchLink.js:750](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L750)

***

### executeMutation

▸ **executeMutation**(`mutation`, `options`, `result`, `forward`): `Promise`<`any`>

*Parameters*

| Name | Type |
| :------ | :------ |
| `mutation` | `any` |
| `options` | `any` |
| `result` | `any` |
| `forward` | `any` |

*Returns*

`Promise`<`any`>

*Defined in*

[CozyPouchLink.js:677](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L677)

***

### executeQuery

▸ **executeQuery**(`__namedParameters`): `Promise`<`any`>

*Parameters*

| Name | Type |
| :------ | :------ |
| `__namedParameters` | `Object` |

*Returns*

`Promise`<`any`>

*Defined in*

[CozyPouchLink.js:625](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L625)

***

### getChanges

▸ **getChanges**(`doctype`, `options`): `Promise`<`PouchDBChangesResults`>

Get PouchDB changes
See https://pouchdb.com/api.html#changes

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `doctype` | `string` | The PouchDB database's doctype |
| `options` | `any` | The changes options. See https://pouchdb.com/api.html#changes |

*Returns*

`Promise`<`PouchDBChangesResults`>

The changes

*Defined in*

[CozyPouchLink.js:530](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L530)

***

### getDbInfo

▸ **getDbInfo**(`doctype`): `Promise`<`PouchDBInfo`>

Get PouchDB database info
See https://pouchdb.com/api.html#database_information

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `doctype` | `string` | The PouchDB database's doctype |

*Returns*

`Promise`<`PouchDBInfo`>

The db info

*Defined in*

[CozyPouchLink.js:545](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L545)

***

### getPouch

▸ **getPouch**(`doctype`): `any`

*Parameters*

| Name | Type |
| :------ | :------ |
| `doctype` | `any` |

*Returns*

`any`

*Defined in*

[CozyPouchLink.js:443](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L443)

***

### getQueryEngineFromDoctype

▸ **getQueryEngineFromDoctype**(`doctype`): `any`

*Parameters*

| Name | Type |
| :------ | :------ |
| `doctype` | `any` |

*Returns*

`any`

*Defined in*

[CozyPouchLink.js:435](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L435)

***

### getReplicationURL

▸ **getReplicationURL**(`doctype`, `replicationOptions`): `string`

Get the authenticated replication URL for a specific doctype

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `doctype` | `string` | The document type to replicate (e.g., 'io.cozy.files') |
| `replicationOptions` | `Object` | - |
| `replicationOptions.driveId` | `string` | - |

*Returns*

`string`

The authenticated replication URL

*Defined in*

[CozyPouchLink.js:164](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L164)

***

### getSharedDriveDoctypes

▸ **getSharedDriveDoctypes**(): `string`\[]

*Returns*

`string`\[]

*Defined in*

[CozyPouchLink.js:848](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L848)

***

### getSyncInfo

▸ **getSyncInfo**(`doctype`): `any`

*Parameters*

| Name | Type |
| :------ | :------ |
| `doctype` | `any` |

*Returns*

`any`

*Defined in*

[CozyPouchLink.js:431](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L431)

***

### handleDoctypeSyncEnd

▸ **handleDoctypeSyncEnd**(`doctype`): `void`

*Parameters*

| Name | Type |
| :------ | :------ |
| `doctype` | `any` |

*Returns*

`void`

*Defined in*

[CozyPouchLink.js:327](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L327)

***

### handleDoctypeSyncStart

▸ **handleDoctypeSyncStart**(`doctype`): `void`

*Parameters*

| Name | Type |
| :------ | :------ |
| `doctype` | `any` |

*Returns*

`void`

*Defined in*

[CozyPouchLink.js:322](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L322)

***

### handleOnSync

▸ **handleOnSync**(`doctypeUpdates`): `void`

Receives PouchDB updates (documents grouped by doctype).
Normalizes the data (.id -> .\_id, .rev -> \_rev).
Passes the data to the client and to the onSync handler.

Emits an event (pouchlink:sync:end) when the sync (all doctypes) is done

*Parameters*

| Name | Type |
| :------ | :------ |
| `doctypeUpdates` | `any` |

*Returns*

`void`

*Defined in*

[CozyPouchLink.js:300](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L300)

***

### hasIndex

▸ **hasIndex**(`name`): `boolean`

*Parameters*

| Name | Type |
| :------ | :------ |
| `name` | `any` |

*Returns*

`boolean`

*Defined in*

[CozyPouchLink.js:621](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L621)

***

### migrateAdapter

▸ **migrateAdapter**(`params`): `Promise`<`void`>

Migrate the current adapter

**`property`** {string} \[fromAdapter] - The current adapter type, e.g. 'idb'

**`property`** {string} \[toAdapter] - The new adapter type, e.g. 'indexeddb'

**`property`** {string} \[url] - The Cozy URL

**`property`** {Array<object>} \[plugins] - The PouchDB plugins

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `params` | `MigrationParams` | Migration params |

*Returns*

`Promise`<`void`>

*Defined in*

[CozyPouchLink.js:198](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L198)

***

### needsToWaitWarmup

▸ **needsToWaitWarmup**(`doctype`): `Promise`<`boolean`>

Check if there is warmup queries for this doctype
and return if those queries are already warmed up or not

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `doctype` | `string` | Doctype to check |

*Returns*

`Promise`<`boolean`>

the need to wait for the warmup

*Defined in*

[CozyPouchLink.js:607](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L607)

***

### onLogin

▸ **onLogin**(): `Promise`<`void`>

*Returns*

`Promise`<`void`>

*Defined in*

[CozyPouchLink.js:217](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L217)

***

### onSyncError

▸ **onSyncError**(`error`): `Promise`<`void`>

*Parameters*

| Name | Type |
| :------ | :------ |
| `error` | `any` |

*Returns*

`Promise`<`void`>

*Defined in*

[CozyPouchLink.js:405](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L405)

***

### persistCozyData

▸ **persistCozyData**(`doc`, `forward?`): `Promise`<`any`>

We persist in the local Pouch database all the documents that do not
exist on the remote Couch database.

Those documents are computed by the cozy-stack then are sent to the
client using JSON-API format

*Parameters*

| Name | Type | Default value |
| :------ | :------ | :------ |
| `doc` | `any` | `undefined` |
| `forward` | (`operation`: `any`, `result`: `any`) => `void` | `doNothing` |

*Returns*

`Promise`<`any`>

*Overrides*

CozyLink.persistCozyData

*Defined in*

[CozyPouchLink.js:560](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L560)

***

### registerClient

▸ **registerClient**(`client`): `Promise`<`void`>

*Parameters*

| Name | Type |
| :------ | :------ |
| `client` | `any` |

*Returns*

`Promise`<`void`>

*Defined in*

[CozyPouchLink.js:183](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L183)

***

### removeDoctype

▸ **removeDoctype**(`doctype`): `Promise`<`void`>

Removes a doctype from the list of managed doctypes, deletes its replication options,
and removes it from the pouches.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `doctype` | `string` | The name of the doctype to remove. |

*Returns*

`Promise`<`void`>

*Defined in*

[CozyPouchLink.js:842](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L842)

***

### request

▸ **request**(`operation`, `options`, `result?`, `forward?`): `Promise`<`any`>

*Parameters*

| Name | Type | Default value |
| :------ | :------ | :------ |
| `operation` | `any` | `undefined` |
| `options` | `any` | `undefined` |
| `result` | `any` | `null` |
| `forward` | (`operation`: `any`, `result`: `any`) => `void` | `doNothing` |

*Returns*

`Promise`<`any`>

*Overrides*

CozyLink.request

*Defined in*

[CozyPouchLink.js:470](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L470)

***

### reset

▸ **reset**(): `Promise`<`void`>

*Returns*

`Promise`<`void`>

*Overrides*

CozyLink.reset

*Defined in*

[CozyPouchLink.js:284](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L284)

***

### startReplication

▸ **startReplication**(`options?`): `void`

User of the link can call this to start ongoing replications.
Typically, it can be used when the application regains focus.

Emits pouchlink:sync:start event when the replication begins

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | `Object` | The options |
| `options.waitForReplications` | `boolean` | - |

*Returns*

`void`

*Defined in*

[CozyPouchLink.js:361](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L361)

***

### startReplicationWithDebounce

▸ **startReplicationWithDebounce**(`options?`): `void`

Debounced version of startReplication() method

Debounce delay can be configured through constructor's `syncDebounceDelayInMs` option

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | `Object` | The options |
| `options.waitForReplications` | `boolean` | - |

*Returns*

`void`

*Defined in*

[CozyPouchLink.js:378](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L378)

***

### stopReplication

▸ **stopReplication**(): `void`

User of the link can call this to stop ongoing replications.
Typically, it can be used when the applications loses focus.

Emits pouchlink:sync:stop event

*Returns*

`void`

*Defined in*

[CozyPouchLink.js:397](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L397)

***

### supportsOperation

▸ **supportsOperation**(`operation`): `boolean`

*Parameters*

| Name | Type |
| :------ | :------ |
| `operation` | `any` |

*Returns*

`boolean`

*Defined in*

[CozyPouchLink.js:451](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L451)

***

### syncImmediately

▸ **syncImmediately**(): `Promise`<`void`>

*Returns*

`Promise`<`void`>

*Defined in*

[CozyPouchLink.js:806](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L806)

***

### updateDocument

▸ **updateDocument**(`mutation`): `Promise`<`any`>

*Parameters*

| Name | Type |
| :------ | :------ |
| `mutation` | `any` |

*Returns*

`Promise`<`any`>

*Defined in*

[CozyPouchLink.js:730](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L730)

***

### updateDocuments

▸ **updateDocuments**(`mutation`): `Promise`<`any`\[]>

*Parameters*

| Name | Type |
| :------ | :------ |
| `mutation` | `any` |

*Returns*

`Promise`<`any`\[]>

*Defined in*

[CozyPouchLink.js:735](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L735)

***

### getPouchAdapterName

▸ `Static` **getPouchAdapterName**(`localStorage`): `Promise`<`string`>

Return the PouchDB adapter name.
Should be IndexedDB for newest adapters.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `localStorage` | `LocalStorage` | Methods to access local storage |

*Returns*

`Promise`<`string`>

The adapter name

*Defined in*

[CozyPouchLink.js:151](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L151)
