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

[CozyPouchLink.js:102](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L102)

## Properties

### client

• **client**: `any`

*Defined in*

[CozyPouchLink.js:192](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L192)

***

### doctypes

• **doctypes**: `string`\[]

*Defined in*

[CozyPouchLink.js:120](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L120)

***

### doctypesReplicationOptions

• **doctypesReplicationOptions**: `Record`<`string`, `any`>

*Defined in*

[CozyPouchLink.js:121](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L121)

***

### indexes

• **indexes**: `Object`

*Defined in*

[CozyPouchLink.js:122](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L122)

***

### initialSync

• **initialSync**: `boolean`

*Defined in*

[CozyPouchLink.js:128](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L128)

***

### options

• **options**: { `replicationInterval`: `number`  } & `PouchLinkOptions`

*Defined in*

[CozyPouchLink.js:114](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L114)

***

### performanceApi

• **performanceApi**: `any`

*Defined in*

[CozyPouchLink.js:145](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L145)

***

### periodicSync

• **periodicSync**: `boolean`

*Defined in*

[CozyPouchLink.js:129](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L129)

***

### pouches

• **pouches**: `any`

*Defined in*

[CozyPouchLink.js:267](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L267)

***

### queryEngine

• **queryEngine**: `DatabaseQueryEngine` | typeof `default`

*Defined in*

[CozyPouchLink.js:265](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L265)

***

### replicationStatus

• **replicationStatus**: `Record`<`string`, `ReplicationStatus`>

*Defined in*

[CozyPouchLink.js:132](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L132)

***

### storage

• **storage**: `PouchLocalStorage`

*Defined in*

[CozyPouchLink.js:125](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L125)

## Accessors

### name

• `get` **name**(): `string`

*Returns*

`string`

*Overrides*

CozyLink.name

*Defined in*

[CozyPouchLink.js:148](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L148)

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

[CozyPouchLink.js:882](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L882)

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

[CozyPouchLink.js:830](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L830)

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

[CozyPouchLink.js:816](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L816)

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

[CozyPouchLink.js:779](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L779)

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

[CozyPouchLink.js:784](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L784)

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

[CozyPouchLink.js:834](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L834)

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

[CozyPouchLink.js:797](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L797)

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

[CozyPouchLink.js:808](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L808)

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

[CozyPouchLink.js:735](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L735)

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

[CozyPouchLink.js:680](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L680)

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

[CozyPouchLink.js:579](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L579)

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

[CozyPouchLink.js:451](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L451)

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

[CozyPouchLink.js:594](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L594)

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

[CozyPouchLink.js:488](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L488)

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

[CozyPouchLink.js:464](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L464)

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

[CozyPouchLink.js:172](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L172)

***

### getSharedDriveDoctypes

▸ **getSharedDriveDoctypes**(): `string`\[]

*Returns*

`string`\[]

*Defined in*

[CozyPouchLink.js:914](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L914)

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

[CozyPouchLink.js:441](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L441)

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

[CozyPouchLink.js:337](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L337)

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

[CozyPouchLink.js:332](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L332)

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

[CozyPouchLink.js:310](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L310)

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

[CozyPouchLink.js:672](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L672)

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

[CozyPouchLink.js:206](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L206)

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

[CozyPouchLink.js:658](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L658)

***

### onLogin

▸ **onLogin**(): `Promise`<`void`>

*Returns*

`Promise`<`void`>

*Defined in*

[CozyPouchLink.js:225](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L225)

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

[CozyPouchLink.js:415](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L415)

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

[CozyPouchLink.js:609](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L609)

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

[CozyPouchLink.js:191](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L191)

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

[CozyPouchLink.js:908](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L908)

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

[CozyPouchLink.js:518](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L518)

***

### reset

▸ **reset**(): `Promise`<`void`>

*Returns*

`Promise`<`void`>

*Overrides*

CozyLink.reset

*Defined in*

[CozyPouchLink.js:293](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L293)

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

[CozyPouchLink.js:371](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L371)

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

[CozyPouchLink.js:388](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L388)

***

### stopReplication

▸ **stopReplication**(): `void`

User of the link can call this to stop ongoing replications.
Typically, it can be used when the applications loses focus.

Emits pouchlink:sync:stop event

*Returns*

`void`

*Defined in*

[CozyPouchLink.js:407](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L407)

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

[CozyPouchLink.js:496](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L496)

***

### syncImmediately

▸ **syncImmediately**(): `Promise`<`void`>

*Returns*

`Promise`<`void`>

*Defined in*

[CozyPouchLink.js:864](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L864)

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

[CozyPouchLink.js:788](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L788)

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

[CozyPouchLink.js:793](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L793)

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

[CozyPouchLink.js:159](https://github.com/linagora/cozy-client/blob/master/packages/cozy-pouch-link/src/CozyPouchLink.js#L159)
