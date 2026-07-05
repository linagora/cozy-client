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

[CozyPouchLink.js:101](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L101)

## Properties

### client

• **client**: `any`

*Defined in*

[CozyPouchLink.js:191](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L191)

***

### doctypes

• **doctypes**: `string`\[]

*Defined in*

[CozyPouchLink.js:119](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L119)

***

### doctypesReplicationOptions

• **doctypesReplicationOptions**: `Record`<`string`, `any`>

*Defined in*

[CozyPouchLink.js:120](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L120)

***

### indexes

• **indexes**: `Object`

*Defined in*

[CozyPouchLink.js:121](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L121)

***

### initialSync

• **initialSync**: `boolean`

*Defined in*

[CozyPouchLink.js:127](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L127)

***

### options

• **options**: { `replicationInterval`: `number`  } & `PouchLinkOptions`

*Defined in*

[CozyPouchLink.js:113](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L113)

***

### performanceApi

• **performanceApi**: `any`

*Defined in*

[CozyPouchLink.js:144](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L144)

***

### periodicSync

• **periodicSync**: `boolean`

*Defined in*

[CozyPouchLink.js:128](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L128)

***

### pouches

• **pouches**: `any`

*Defined in*

[CozyPouchLink.js:266](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L266)

***

### queryEngine

• **queryEngine**: `DatabaseQueryEngine` | typeof `default`

*Defined in*

[CozyPouchLink.js:264](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L264)

***

### replicationStatus

• **replicationStatus**: `Record`<`string`, `ReplicationStatus`>

*Defined in*

[CozyPouchLink.js:131](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L131)

***

### storage

• **storage**: `PouchLocalStorage`

*Defined in*

[CozyPouchLink.js:124](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L124)

## Accessors

### name

• `get` **name**(): `string`

*Returns*

`string`

*Overrides*

CozyLink.name

*Defined in*

[CozyPouchLink.js:147](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L147)

## Methods

### addDoctype

▸ **addDoctype**(`doctype`, `replicationOptions`, `options`): `Promise`<`void`>

Adds a new doctype to the list of managed doctypes, sets its replication options,
adds it to the pouches, and starts replication. Does nothing when the doctype is
already managed, so the list stays free of duplicates.

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

[CozyPouchLink.js:881](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L881)

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

[CozyPouchLink.js:829](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L829)

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

[CozyPouchLink.js:815](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L815)

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

[CozyPouchLink.js:778](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L778)

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

[CozyPouchLink.js:783](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L783)

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

[CozyPouchLink.js:833](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L833)

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

[CozyPouchLink.js:796](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L796)

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

[CozyPouchLink.js:807](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L807)

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

[CozyPouchLink.js:734](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L734)

***

### executeQuery

▸ **executeQuery**(`operation`, `options`): `Promise`<`any`>

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `operation` | `any` | The query operation |
| `options` | `any` | - |

*Returns*

`Promise`<`any`>

*Defined in*

[CozyPouchLink.js:679](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L679)

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

[CozyPouchLink.js:578](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L578)

***

### getDbDoctype

▸ **getDbDoctype**(`logicalDoctype`, `options`): `any`

Returns the registered physical doctype for a given logical doctype and query options.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `logicalDoctype` | `any` | The logical doctype |
| `options` | `any` | - |

*Returns*

`any`

*Defined in*

[CozyPouchLink.js:450](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L450)

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

[CozyPouchLink.js:593](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L593)

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

[CozyPouchLink.js:487](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L487)

***

### getQueryEngineFromDoctype

▸ **getQueryEngineFromDoctype**(`doctype`, `options`): `any`

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `doctype` | `any` | The doctype |
| `options` | `any` | - |

*Returns*

`any`

*Defined in*

[CozyPouchLink.js:463](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L463)

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

[CozyPouchLink.js:171](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L171)

***

### getSharedDriveDoctypes

▸ **getSharedDriveDoctypes**(): `string`\[]

*Returns*

`string`\[]

*Defined in*

[CozyPouchLink.js:913](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L913)

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

[CozyPouchLink.js:440](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L440)

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

[CozyPouchLink.js:336](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L336)

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

[CozyPouchLink.js:331](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L331)

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

[CozyPouchLink.js:309](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L309)

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

[CozyPouchLink.js:671](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L671)

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

[CozyPouchLink.js:205](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L205)

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

[CozyPouchLink.js:657](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L657)

***

### onLogin

▸ **onLogin**(): `Promise`<`void`>

*Returns*

`Promise`<`void`>

*Defined in*

[CozyPouchLink.js:224](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L224)

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

[CozyPouchLink.js:414](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L414)

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

[CozyPouchLink.js:608](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L608)

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

[CozyPouchLink.js:190](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L190)

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

[CozyPouchLink.js:907](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L907)

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

[CozyPouchLink.js:517](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L517)

***

### reset

▸ **reset**(): `Promise`<`void`>

*Returns*

`Promise`<`void`>

*Overrides*

CozyLink.reset

*Defined in*

[CozyPouchLink.js:292](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L292)

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

[CozyPouchLink.js:370](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L370)

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

[CozyPouchLink.js:387](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L387)

***

### stopReplication

▸ **stopReplication**(): `void`

User of the link can call this to stop ongoing replications.
Typically, it can be used when the applications loses focus.

Emits pouchlink:sync:stop event

*Returns*

`void`

*Defined in*

[CozyPouchLink.js:406](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L406)

***

### supportsOperation

▸ **supportsOperation**(`operation`, `options`): `boolean`

*Parameters*

| Name | Type |
| :------ | :------ |
| `operation` | `any` |
| `options` | `any` |

*Returns*

`boolean`

*Defined in*

[CozyPouchLink.js:495](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L495)

***

### syncImmediately

▸ **syncImmediately**(): `Promise`<`void`>

*Returns*

`Promise`<`void`>

*Defined in*

[CozyPouchLink.js:863](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L863)

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

[CozyPouchLink.js:787](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L787)

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

[CozyPouchLink.js:792](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L792)

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

[CozyPouchLink.js:158](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L158)
