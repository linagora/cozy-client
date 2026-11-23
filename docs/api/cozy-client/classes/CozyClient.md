[cozy-client](../README.md) / CozyClient

# Class: CozyClient

Responsible for

*   Creating observable queries
*   Hydration
*   Creating plan for saving documents
*   Associations

## Constructors

### constructor

• **new CozyClient**(`rawOptions?`)

**`example`**

```js
const client = new CozyClient({
  schema: {
    todos: {
      doctype: 'io.cozy.todos',
      relationships: {
        authors: {
          type: 'has-many',
          doctype: 'io.cozy.persons'
        }
      }
    }
  }
})
```

Cozy-Client will automatically call `this.login()` if provided with a token and an uri

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `rawOptions` | `ClientOptions` | Options |

*Defined in*

[packages/cozy-client/src/CozyClient.js:165](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L165)

## Properties

### appMetadata

• **appMetadata**: `AppMetadata`

*Defined in*

[packages/cozy-client/src/CozyClient.js:182](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L182)

***

### autoHydrate

• **autoHydrate**: `boolean`

*Defined in*

[packages/cozy-client/src/CozyClient.js:244](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L244)

***

### capabilities

• **capabilities**: `ClientCapabilities`

*Defined in*

[packages/cozy-client/src/CozyClient.js:210](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L210)

***

### chain

• **chain**: `any`

*Defined in*

[packages/cozy-client/src/CozyClient.js:1908](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1908)

***

### client

• **client**: `any`

*Defined in*

[packages/cozy-client/src/CozyClient.js:1768](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1768)

***

### disableStoreForQueries

• **disableStoreForQueries**: `boolean`

*Defined in*

[packages/cozy-client/src/CozyClient.js:245](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L245)

***

### instanceOptions

• **instanceOptions**: `Object`

*Defined in*

[packages/cozy-client/src/CozyClient.js:190](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L190)

***

### isLogged

• **isLogged**: `boolean`

*Defined in*

[packages/cozy-client/src/CozyClient.js:189](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L189)

***

### isRevoked

• **isRevoked**: `boolean`

*Defined in*

[packages/cozy-client/src/CozyClient.js:507](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L507)

***

### links

• **links**: `any`\[]

*Defined in*

[packages/cozy-client/src/CozyClient.js:1904](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1904)

***

### loginPromise

• **loginPromise**: `Promise`<`void`>

*Defined in*

[packages/cozy-client/src/CozyClient.js:183](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L183)

***

### options

• **options**: `Object`

*Type declaration*

| Name | Type | Description |
| :------ | :------ | :------ |
| `autoHydrate` | `boolean` | If set to true, all documents will be hydrated w.r.t. the provided schema's relationships, even if the relationship does not exist on the doc. |
| `backgroundFetching` | `boolean` | If set to true, backgroundFetching will be enabled by default on every query. Meaning that, when the fetchStatus has already been loaded, it won't be updated during future fetches. Instead, a `isFetching` attribute will be used to indicate when background fetching is started. |
| `client` | `any` | - |
| `disableStoreForQueries` | `boolean` | If set to true, the client will not leverage the redux store to execute queries and store data. |
| `oauth` | `any` | - |
| `onError` | `Function` | Default callback if a query is errored |
| `onTokenRefresh` | `Function` | - |
| `stackClient` | `any` | - |
| `token` | `any` | - |
| `uri` | `string` | - |
| `useCustomStore` | `boolean` | If set to true, the client will not instantiate a Redux store automatically. Use this if you want to merge cozy-client's store with your own redux store. Note will have to call `setStore` eventually. See [here](https://docs.cozy.io/en/cozy-client/react-integration/#1b-use-your-own-redux-store) for more information. |
| `warningForCustomHandlers` | `boolean` | - |

*Defined in*

[packages/cozy-client/src/CozyClient.js:186](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L186)

***

### performanceApi

• **performanceApi**: `PerformanceAPI`

*Defined in*

[packages/cozy-client/src/CozyClient.js:180](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L180)

***

### plugins

• **plugins**: `Object`

*Defined in*

[packages/cozy-client/src/CozyClient.js:213](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L213)

***

### queryIdGenerator

• **queryIdGenerator**: `QueryIDGenerator`

*Defined in*

[packages/cozy-client/src/CozyClient.js:188](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L188)

***

### schema

• **schema**: `Schema`

*Defined in*

[packages/cozy-client/src/CozyClient.js:205](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L205)

***

### stackClient

• **stackClient**: `any`

*Defined in*

[packages/cozy-client/src/CozyClient.js:1743](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1743)

***

### store

• **store**: `any`

*Defined in*

[packages/cozy-client/src/CozyClient.js:1673](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1673)

***

### storeAccesors

• **storeAccesors**: `any`

*Defined in*

[packages/cozy-client/src/CozyClient.js:238](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L238)

***

### storeAccessors

• **storeAccessors**: `Object`

*Type declaration*

| Name | Type |
| :------ | :------ |
| `dispatch` | `any` |
| `get` | `any` |
| `mutate` | (`def`: `any`, `opts`: `any`) => `any` |
| `query` | (`def`: `any`, `opts`: `any`) => `any` |
| `save` | (`document`: `any`, `opts`: `any`) => `any` |

*Defined in*

[packages/cozy-client/src/CozyClient.js:1411](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1411)

***

### useCustomStore

• **useCustomStore**: `boolean`

*Defined in*

[packages/cozy-client/src/CozyClient.js:240](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L240)

***

### fetchPolicies

▪ `Static` **fetchPolicies**: `Object`

*Type declaration*

| Name | Type |
| :------ | :------ |
| `noFetch` | () => `boolean` |
| `olderThan` | (`delay`: `number`) => `Function` |

***

### hooks

▪ `Static` **hooks**: `Object`

***

### version

▪ `Static` **version**: `string`

## Methods

### \_login

▸ **\_login**(`options`): `Promise`<`void`>

*Parameters*

| Name | Type |
| :------ | :------ |
| `options` | `any` |

*Returns*

`Promise`<`void`>

*Defined in*

[packages/cozy-client/src/CozyClient.js:486](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L486)

***

### addSchema

▸ **addSchema**(`schemaDefinition`): `void`

*Parameters*

| Name | Type |
| :------ | :------ |
| `schemaDefinition` | `any` |

*Returns*

`void`

*Defined in*

[packages/cozy-client/src/CozyClient.js:442](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L442)

***

### all

▸ **all**(`doctype`): [`QueryDefinition`](QueryDefinition.md)

*Parameters*

| Name | Type |
| :------ | :------ |
| `doctype` | `any` |

*Returns*

[`QueryDefinition`](QueryDefinition.md)

*Defined in*

[packages/cozy-client/src/CozyClient.js:588](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L588)

***

### authorize

▸ **authorize**(`[options]?`): `Promise`<`any`>

Creates an OAuth token with needed permissions for the current client.
The authorization page URL generation can be overriding by passing a function pointer as `openURLCallback` parameter
It is possible to skip the session creation process (when using an in-app browser) by passing a sessionCode (see https://docs.cozy.io/en/cozy-stack/auth/#post-authsession_code)

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `[options]` | `Object` | Authorization options |
| `[options].openURLCallback` | `OpenURLCallback` | - |
| `[options].pkceCodes` | `PKCECodes` | - |
| `[options].sessionCode` | `string` | - |

*Returns*

`Promise`<`any`>

Contains the fetched token and the client information. These should be stored and used to restore the client.

*Defined in*

[packages/cozy-client/src/CozyClient.js:1589](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1589)

***

### certifyFlagship

▸ **certifyFlagship**(): `Promise`<`void`>

Perform the Flagship certification process for verifying that the current running app is a genuine Cozy application

This mechanism is described in https://github.com/cozy/cozy-client/blob/master/packages/cozy-client/src/flagship-certification/README.md

*Returns*

`Promise`<`void`>

*Defined in*

[packages/cozy-client/src/CozyClient.js:1570](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1570)

***

### checkForRevocation

▸ **checkForRevocation**(): `Promise`<`any`>

Returns whether the client has been revoked on the server

*Returns*

`Promise`<`any`>

*Defined in*

[packages/cozy-client/src/CozyClient.js:1685](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1685)

***

### collection

▸ **collection**(`doctype`, `options?`): `any`

Forwards to a stack client instance and returns
a [DocumentCollection](https://docs.cozy.io/en/cozy-client/api/cozy-stack-client/#DocumentCollection) instance.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `doctype` | `string` | The collection doctype. |
| `options` | `any` | Options to pass to the collection |

*Returns*

`any`

Collection corresponding to the doctype

*Defined in*

[packages/cozy-client/src/CozyClient.js:580](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L580)

***

### create

▸ **create**(`type`, `doc`, `references`, `options?`): `Promise`<`any`>

Creates a document and saves it on the server

**`example`**

```js
await client.create('io.cozy.todos', {
  label: 'My todo',
  relationships: {
    authors: {
      data: [{_id: 1, _type: 'io.cozy.persons'}]
    }
  }
})
```

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `type` | `string` | Doctype of the document |
| `doc` | `any` | Document to save |
| `references` | `Object` | - |
| `options` | `Partial`<`MutationOptions`> | - |

*Returns*

`Promise`<`any`>

*Defined in*

[packages/cozy-client/src/CozyClient.js:639](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L639)

***

### createAll

▸ **createAll**(`docs`, `options?`): `Promise`<`any`>

Create multiple documents in one batch.
WARNING: this method is currently not supported by the stack, but
works with PouchDB

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `docs` | `CozyClientDocument`\[] | Documents to create. Should not have \_id nor \_rev |
| `options` | `any` | - |

*Returns*

`Promise`<`any`>

*Defined in*

[packages/cozy-client/src/CozyClient.js:663](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L663)

***

### createClient

▸ **createClient**(): `void`

If no stack client has been passed in options, creates a default stack
client and attaches handlers for revocation and token refresh.
If a stackClient has been passed in options, ensure it has handlers for
revocation and token refresh.

If `oauth` options are passed, stackClient is an OAuthStackClient.

*Returns*

`void`

*Defined in*

[packages/cozy-client/src/CozyClient.js:1723](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1723)

***

### destroy

▸ **destroy**(`document`, `options?`): `Promise`<`CozyClientDocument`>

Destroys a document. {before,after}:destroy hooks will be fired.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `document` | `CozyClientDocument` | Document to be deleted |
| `options` | `any` | - |

*Returns*

`Promise`<`CozyClientDocument`>

The document that has been deleted

*Defined in*

[packages/cozy-client/src/CozyClient.js:924](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L924)

***

### destroyAll

▸ **destroyAll**(`documents`, `options?`): `Promise`<`CozyClientDocument`\[]>

Destroy multiple documents

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `documents` | `CozyClientDocument`\[] | Documents to be deleted |
| `options` | `any` | - |

*Returns*

`Promise`<`CozyClientDocument`\[]>

The deleted documents

*Defined in*

[packages/cozy-client/src/CozyClient.js:938](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L938)

***

### dispatch

▸ **dispatch**(`action`): `any`

*Parameters*

| Name | Type |
| :------ | :------ |
| `action` | `any` |

*Returns*

`any`

*Defined in*

[packages/cozy-client/src/CozyClient.js:1794](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1794)

***

### emit

▸ **emit**(...`args`): `void`

Gets overrided by MicroEE.mixin
This is here just so typescript does not scream

TODO Find a better way to make TS understand that emit is
a method from cozy-client

*Parameters*

| Name | Type |
| :------ | :------ |
| `...args` | `any`\[] |

*Returns*

`void`

*Defined in*

[packages/cozy-client/src/CozyClient.js:255](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L255)

***

### ensureCozyMetadata

▸ **ensureCozyMetadata**(`document`, `options?`): `CozyClientDocument`

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `document` | `CozyClientDocument` | Document that will be saved |
| `options` | `Object` | - |
| `options.event` | `string` | - |

*Returns*

`CozyClientDocument`

*Defined in*

[packages/cozy-client/src/CozyClient.js:738](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L738)

***

### ensureQueryExists

▸ **ensureQueryExists**(`queryId`, `queryDefinition`, `options`): `void`

Makes sure that the query exists in the store

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `queryId` | `string` | Id of the query |
| `queryDefinition` | [`QueryDefinition`](QueryDefinition.md) | Definition of the query |
| `options` | `QueryOptions` | - |

*Returns*

`void`

*Defined in*

[packages/cozy-client/src/CozyClient.js:961](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L961)

***

### ensureStore

▸ **ensureStore**(): `void`

*Returns*

`void`

*Defined in*

[packages/cozy-client/src/CozyClient.js:1676](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1676)

***

### fetch

▸ **fetch**(`method`, `path`, `body`, `options?`): `any`

*Parameters*

| Name | Type |
| :------ | :------ |
| `method` | `any` |
| `path` | `any` |
| `body` | `any` |
| `options` | `Object` |

*Returns*

`any`

*Defined in*

[packages/cozy-client/src/CozyClient.js:584](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L584)

***

### fetchQueryAndGetFromState

▸ **fetchQueryAndGetFromState**(`query`): `Promise`<`QueryState`>

Executes a query and returns the results from internal store.

Can be useful in pure JS context (without React)
Has a behavior close to <Query /> or useQuery

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `query` | `Object` | Query with definition and options |
| `query.definition` | [`QueryDefinition`](QueryDefinition.md) | Query Definition |
| `query.options` | `QueryOptions` | Query Options |

*Returns*

`Promise`<`QueryState`>

Query state

*Defined in*

[packages/cozy-client/src/CozyClient.js:1528](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1528)

***

### find

▸ **find**(`doctype`, `selector?`): [`QueryDefinition`](QueryDefinition.md)

*Parameters*

| Name | Type | Default value |
| :------ | :------ | :------ |
| `doctype` | `any` | `undefined` |
| `selector` | `any` | `undefined` |

*Returns*

[`QueryDefinition`](QueryDefinition.md)

*Defined in*

[packages/cozy-client/src/CozyClient.js:597](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L597)

***

### generateRandomId

▸ **generateRandomId**(): `string`

*Returns*

`string`

*Defined in*

[packages/cozy-client/src/CozyClient.js:1386](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1386)

***

### get

▸ **get**(`doctype`, `id`): [`QueryDefinition`](QueryDefinition.md)

*Parameters*

| Name | Type |
| :------ | :------ |
| `doctype` | `any` |
| `id` | `any` |

*Returns*

[`QueryDefinition`](QueryDefinition.md)

*Defined in*

[packages/cozy-client/src/CozyClient.js:604](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L604)

***

### getAssociation

▸ **getAssociation**(`document`, `associationName`): `any`

Creates an association that is linked to the store.

*Parameters*

| Name | Type |
| :------ | :------ |
| `document` | `any` |
| `associationName` | `any` |

*Returns*

`any`

*Defined in*

[packages/cozy-client/src/CozyClient.js:1393](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1393)

***

### getClient

▸ **getClient**(): `any`

*Returns*

`any`

*Defined in*

[packages/cozy-client/src/CozyClient.js:1776](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1776)

***

### getCollectionFromState

▸ **getCollectionFromState**(`type`): `CozyClientDocument`\[]

Get a collection of documents from the internal store.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `type` | `string` | Doctype of the collection |

*Returns*

`CozyClientDocument`\[]

Array of documents or null if the collection does not exist.

*Defined in*

[packages/cozy-client/src/CozyClient.js:1429](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1429)

***

### getDocumentFromState

▸ **getDocumentFromState**(`type`, `id`): `CozyClientDocument`

Get a document from the internal store.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `type` | `string` | Doctype of the document |
| `id` | `string` | Id of the document |

*Returns*

`CozyClientDocument`

Document or null if the object does not exist.

*Defined in*

[packages/cozy-client/src/CozyClient.js:1446](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1446)

***

### getDocumentSavePlan

▸ **getDocumentSavePlan**(`document`, `referencesByName`): `any`

Creates a list of mutations to execute to create a document and its relationships.

```js
const baseDoc = { _type: 'io.cozy.todo', label: 'Go hiking' }
// relations can be arrays or single objects
const relationships = {
  attachments: [{ _id: 12345, _type: 'io.cozy.files' }, { _id: 6789, _type: 'io.cozy.files' }],
  bills: { _id: 9999, _type: 'io.cozy.bills' }
}
client.getDocumentSavePlan(baseDoc, relationships)
```

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `document` | `CozyClientDocument` | Document to create |
| `referencesByName` | `Object` | - |

*Returns*

`any`

One or more mutation to execute

*Defined in*

[packages/cozy-client/src/CozyClient.js:833](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L833)

***

### getIncludesRelationships

▸ **getIncludesRelationships**(`queryDefinition`): `Dictionary`<`any`>

*Parameters*

| Name | Type |
| :------ | :------ |
| `queryDefinition` | `any` |

*Returns*

`Dictionary`<`any`>

*Defined in*

[packages/cozy-client/src/CozyClient.js:1310](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1310)

***

### getInstanceOptions

▸ **getInstanceOptions**(): `any`

getInstanceOptions - Returns current instance options, such as domain or app slug

*Returns*

`any`

*Defined in*

[packages/cozy-client/src/CozyClient.js:1803](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1803)

***

### getQueryFromState

▸ **getQueryFromState**(`id`, `options?`): `QueryState`

Get a query from the internal store.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `string` | Id of the query (set via Query.props.as) |
| `options` | `Object` | Options |
| `options.hydrated` | `boolean` | - |
| `options.singleDocData` | `any` | - |

*Returns*

`QueryState`

*   Query state or null if it does not exist.

*Defined in*

[packages/cozy-client/src/CozyClient.js:1467](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1467)

***

### getRelationshipStoreAccessors

▸ **getRelationshipStoreAccessors**(): `Object`

Returns the accessors that are given to the relationships for them
to deal with the stores.

Relationships need to have access to the store to ping it when
a modification (addById/removeById etc...) has been done. This wakes
the store up, which in turn will update the `<Query>`s and re-render the data.

*Returns*

`Object`

| Name | Type |
| :------ | :------ |
| `dispatch` | `any` |
| `get` | `any` |
| `mutate` | (`def`: `any`, `opts`: `any`) => `any` |
| `query` | (`def`: `any`, `opts`: `any`) => `any` |
| `save` | (`document`: `any`, `opts`: `any`) => `any` |

*Defined in*

[packages/cozy-client/src/CozyClient.js:1409](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1409)

***

### getSettings

▸ **getSettings**<`T`>(`slug`, `keys`): `Promise`<`Record`<`T`, `any`>>

Query the cozy-app settings corresponding to the given slug and
extract the value corresponding to the given `key`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `string` |

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `slug` | `string` | the cozy-app's slug containing the setting (can be 'instance' for global settings) |
| `keys` | `T`\[] | The names of the settings to retrieve |

*Returns*

`Promise`<`Record`<`T`, `any`>>

*   The value of the requested setting

*Defined in*

[packages/cozy-client/src/CozyClient.js:1932](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1932)

***

### getStackClient

▸ **getStackClient**(): `any`

*Returns*

`any`

*Defined in*

[packages/cozy-client/src/CozyClient.js:1783](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1783)

***

### handleRevocationChange

▸ **handleRevocationChange**(`state`): `void`

Sets public attribute and emits event related to revocation

*Parameters*

| Name | Type |
| :------ | :------ |
| `state` | `any` |

*Returns*

`void`

*Defined in*

[packages/cozy-client/src/CozyClient.js:1694](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1694)

***

### handleTokenRefresh

▸ **handleTokenRefresh**(`token`): `void`

Emits event when token is refreshed

*Parameters*

| Name | Type |
| :------ | :------ |
| `token` | `any` |

*Returns*

`void`

*Defined in*

[packages/cozy-client/src/CozyClient.js:1705](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1705)

***

### hydrateDocument

▸ **hydrateDocument**(`document`, `schemaArg`, `[options]?`): `any`

Resolves relationships on a document.

The original document is kept in the target attribute of
the relationship.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `document` | `CozyClientDocument` | for which relationships must be resolved |
| `schemaArg` | `Schema` | - |
| `[options]` | `Object` | Options |
| `[options].forceHydratation` | `boolean` | - |

*Returns*

`any`

*Defined in*

[packages/cozy-client/src/CozyClient.js:1356](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1356)

***

### hydrateDocuments

▸ **hydrateDocuments**(`doctype`, `documents`, `[options]?`): `any`\[]

Returns documents with their relationships resolved according to their schema.
If related documents are not in the store, they will not be fetched automatically.
Instead, the relationships will have null documents.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `doctype` | `string` | Doctype of the documents being hydrated |
| `documents` | `CozyClientDocument`\[] | Documents to be hydrated |
| `[options]` | `Object` | Options |
| `[options].forceHydratation` | `boolean` | - |

*Returns*

`any`\[]

*Defined in*

[packages/cozy-client/src/CozyClient.js:1332](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1332)

***

### hydrateRelationships

▸ **hydrateRelationships**(`document`, `schemaRelationships`, `__namedParameters?`): `Object`

*Parameters*

| Name | Type |
| :------ | :------ |
| `document` | `any` |
| `schemaRelationships` | `any` |
| `__namedParameters` | `Object` |
| `__namedParameters.forceHydratation` | `boolean` |

*Returns*

`Object`

*Defined in*

[packages/cozy-client/src/CozyClient.js:1373](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1373)

***

### isReactNative

▸ **isReactNative**(): `boolean`

*Returns*

`boolean`

*Defined in*

[packages/cozy-client/src/CozyClient.js:1546](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1546)

***

### loadInstanceOptionsFromDOM

▸ **loadInstanceOptionsFromDOM**(`selector?`): `void`

loadInstanceOptionsFromDOM - Loads the dataset injected by the Stack in web pages and exposes it through getInstanceOptions

*Parameters*

| Name | Type | Default value |
| :------ | :------ | :------ |
| `selector` | `string` | `'[role=application]'` |

*Returns*

`void`

*Defined in*

[packages/cozy-client/src/CozyClient.js:1814](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1814)

***

### loadInstanceOptionsFromStack

▸ **loadInstanceOptionsFromStack**(): `Promise`<`void`>

loadInstanceOptionsFromStack - Loads the instance options from cozy-stack and exposes it through getInstanceOptions

This method is not iso with loadInstanceOptionsFromDOM for now.

*Returns*

`Promise`<`void`>

*Defined in*

[packages/cozy-client/src/CozyClient.js:1835](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1835)

***

### login

▸ **login**(`options`): `Promise`<`any`>

Notify the links that they can start and set isLogged to true.

On mobile, where url/token are set after instantiation, use this method
to set the token and uri via options.

Emits

*   "beforeLogin" at the beginning, before links have been set up
*   "login" when the client is fully logged in and links have been set up

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | `Object` | - |
| `options.token` | `string` | If passed, the token is set on the client |
| `options.uri` | `string` | If passed, the uri is set on the client |

*Returns*

`Promise`<`any`>

*   Resolves when all links have been setup and client is fully logged in

*Defined in*

[packages/cozy-client/src/CozyClient.js:475](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L475)

***

### logout

▸ **logout**(): `Promise`<`any`>

Logs out the client and reset all the links

Emits

*   "beforeLogout" at the beginning, before links have been reset
*   "logout" when the client is fully logged out and links have been reset

*Returns*

`Promise`<`any`>

*   Resolves when all links have been reset and client is fully logged out

*Defined in*

[packages/cozy-client/src/CozyClient.js:526](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L526)

***

### makeObservableQuery

▸ **makeObservableQuery**(`queryDefinition`, `options?`): `default`

*Parameters*

| Name | Type |
| :------ | :------ |
| `queryDefinition` | `any` |
| `options` | `Object` |

*Returns*

`default`

*Defined in*

[packages/cozy-client/src/CozyClient.js:1139](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1139)

***

### mutate

▸ **mutate**(`mutationDefinition`, `[params]?`): `Promise`<`any`>

Mutate a document

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `mutationDefinition` | `any` | Describe the mutation |
| `[params]` | `Partial`<`MutationOptions`> & { `options?`: `any`  } | Mutation options |

*Returns*

`Promise`<`any`>

*Defined in*

[packages/cozy-client/src/CozyClient.js:1157](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1157)

***

### on

▸ **on**(...`args`): `void`

*Parameters*

| Name | Type |
| :------ | :------ |
| `...args` | `any`\[] |

*Returns*

`void`

*Defined in*

[packages/cozy-client/src/CozyClient.js:256](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L256)

***

### prepareDocumentForSave

▸ **prepareDocumentForSave**(`doc`): `CozyClientDocument`

Dehydrates and adds metadata before saving a document

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `doc` | `CozyClientDocument` | Document that will be saved |

*Returns*

`CozyClientDocument`

*Defined in*

[packages/cozy-client/src/CozyClient.js:804](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L804)

***

### query

▸ **query**(`queryDefinition`, `[options]?`): `Promise`<`any`>

Executes a query and returns its results.

Results from the query will be saved internally and can be retrieved via
`getQueryFromState` or directly using `<Query />`. `<Query />` automatically
executes its query when mounted if no fetch policy has been indicated.

If the query is called under the fetch policy's delay, then the query
is not executed and nothing is returned. If you need a result anyway,
please use `fetchQueryAndGetFromState` instead

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `queryDefinition` | [`QueryDefinition`](QueryDefinition.md) | Definition that will be executed |
| `[options]` | `QueryOptions` | Options |

*Returns*

`Promise`<`any`>

*Defined in*

[packages/cozy-client/src/CozyClient.js:988](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L988)

***

### queryAll

▸ **queryAll**(`queryDefinition`, `options?`): `Promise`<`any`>

Will fetch all documents for a `queryDefinition`, automatically fetching more
documents if the total of documents is superior to the pagination limit. Can
result in a lot of network requests.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `queryDefinition` | [`QueryDefinition`](QueryDefinition.md) | Definition to be executed |
| `options` | `QueryOptions` | - |

*Returns*

`Promise`<`any`>

All documents matching the query

*Defined in*

[packages/cozy-client/src/CozyClient.js:1099](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1099)

***

### reducer

▸ **reducer**(): (`state`: { `documents`: {} = {}; `queries`: {} = {} }, `action`: `any`) => { `documents`: `any` ; `queries`: `QueriesStateSlice`  }

*Returns*

`fn`

▸ (`state?`, `action`): `Object`

*Parameters*

| Name | Type | Default value |
| :------ | :------ | :------ |
| `state` | `Object` | `initialState` |
| `state.documents` | `Object` | `{}` |
| `state.queries` | `Object` | `{}` |
| `action` | `any` | `undefined` |

*Returns*

`Object`

| Name | Type |
| :------ | :------ |
| `documents` | `any` |
| `queries` | `QueriesStateSlice` |

*Defined in*

[packages/cozy-client/src/CozyClient.js:1790](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1790)

***

### register

▸ **register**(`cozyURL`): `any`

Performs a complete OAuth flow using a React Native WebView for auth.
The `register` method's name has been chosen for compat reasons with the Authentication compo.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `cozyURL` | `string` | Receives the URL of the cozy instance. |

*Returns*

`any`

Contains the fetched token and the client information.

*Defined in*

[packages/cozy-client/src/CozyClient.js:1540](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1540)

***

### registerClientOnLinks

▸ **registerClientOnLinks**(): `void`

*Returns*

`void`

*Defined in*

[packages/cozy-client/src/CozyClient.js:446](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L446)

***

### registerPlugin

▸ **registerPlugin**(`Plugin`, `options`): `any`

A plugin is a class whose constructor receives the client as first argument.
The main mean of interaction with the client should be with events
like "login"/"logout".

The plugin system is meant to encourage separation of concerns, modularity
and testability : instead of registering events at module level, please
create a plugin that subscribes to events.

Plugin instances are stored internally in the `plugins` attribute of the client
and can be accessed via this mean. A plugin class must have the attribute
`pluginName` that will be use as the key in the `plugins` object.

Two plugins with the same `pluginName` cannot co-exist.

**`example`**

```js
class AlertPlugin {
  constructor(client, options) {
    this.client = client
    this.options = options
    this.handleLogin = this.handleLogin.bind(this)
    this.handleLogout = this.handleLogout.bind(this)
    this.client.on("login", this.handleLogin)
    this.client.on("logout", this.handleLogout)
  }

  handleLogin() {
    alert(this.options.onLoginAlert)
  }

  handleLogout() {
    alert(this.options.onLogoutAlert)
  }
}

AlertPlugin.pluginName = 'alerts'

client.registerPlugin(AlertPlugin, {
  onLoginAlert: 'client has logged in !',
  onLogoutAlert: 'client has logged out !'
})

// the instance of the plugin is accessible via
client.plugins.alerts
```

*Parameters*

| Name | Type |
| :------ | :------ |
| `Plugin` | `any` |
| `options` | `any` |

*Returns*

`any`

*Defined in*

[packages/cozy-client/src/CozyClient.js:306](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L306)

***

### removeListener

▸ **removeListener**(...`args`): `void`

*Parameters*

| Name | Type |
| :------ | :------ |
| `...args` | `any`\[] |

*Returns*

`void`

*Defined in*

[packages/cozy-client/src/CozyClient.js:257](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L257)

***

### renewAuthorization

▸ **renewAuthorization**(): `any`

Renews the token if, for instance, new permissions are required or token
has expired.

*Returns*

`any`

Contains the fetched token and the client information.

*Defined in*

[packages/cozy-client/src/CozyClient.js:1635](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1635)

***

### requestMutation

▸ **requestMutation**(`definition`, `options`): `any`

*Parameters*

| Name | Type |
| :------ | :------ |
| `definition` | `any` |
| `options` | `any` |

*Returns*

`any`

*Defined in*

[packages/cozy-client/src/CozyClient.js:1294](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1294)

***

### resetQuery

▸ **resetQuery**(`queryId`): `Promise`<`QueryState`>

Reset a query

This method will reset the query state to its initial state and refetch it.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `queryId` | `string` | Query id |

*Returns*

`Promise`<`QueryState`>

*   Query state or null if the query does not exist

*Defined in*

[packages/cozy-client/src/CozyClient.js:1961](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1961)

***

### save

▸ **save**(`doc`, `options?`): `Promise`<`any`>

Create or update a document

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `doc` | `any` | Document to save |
| `options` | `any` | - |

*Returns*

`Promise`<`any`>

*Defined in*

[packages/cozy-client/src/CozyClient.js:674](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L674)

***

### saveAfterFetchSettings

▸ **saveAfterFetchSettings**<`T`>(`slug`, `itemsOrSetter`, `setterKeys`): `Promise`<`any`>

Save the given value into the corresponding cozy-app setting

This methods will first query the cozy-app's settings before injecting the new value and then
save the new resulting settings into database

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `string` |

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `slug` | `string` | the cozy-app's slug containing the setting (can be 'instance' for global settings) |
| `itemsOrSetter` | `Record`<`string`, `any`> | (`oldValue`: `any`) => `Record`<`T`, `any`> | The new values of the settings to save. It can be a raw dictionary, or a callback that should return a new dictionary |
| `setterKeys` | `T`\[] | The new values of the settings to save. It can be a raw dictionary, or a callback that should return a new dictionary |

*Returns*

`Promise`<`any`>

*   The result of the `client.save()` call

*Defined in*

[packages/cozy-client/src/CozyClient.js:1949](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1949)

***

### saveAll

▸ **saveAll**(`docs`, `options?`): `Promise`<`void`>

Create or update multiple documents in one batch

*   Can only be called with documents from the same doctype
*   Can either be creation (no \_id nor \_rev) or update, not both
*   Does not support automatic creation of references

WARNING: multiple creations is currently not supported by the stack, but
works with PouchDB

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `docs` | `CozyClientDocument`\[] | Documents from the same doctype |
| `options` | `any` | - |

*Returns*

`Promise`<`void`>

*Defined in*

[packages/cozy-client/src/CozyClient.js:707](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L707)

***

### setAppMetadata

▸ **setAppMetadata**(`newAppMetadata`): `void`

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `newAppMetadata` | `AppMetadata` | AppMetadata to update |

*Returns*

`void`

*Defined in*

[packages/cozy-client/src/CozyClient.js:1889](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1889)

***

### setData

▸ **setData**(`data`): `void`

Directly set the data in the store, without using a query
This is useful for cases like Pouch replication, which wants to
set some data in the store.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `data` | `any` | Data that is inserted in the store. Shape: { doctype: \[data] } |

*Returns*

`void`

*Defined in*

[packages/cozy-client/src/CozyClient.js:1862](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1862)

***

### setLinks

▸ **setLinks**(`links`): `Promise`<`void`>

Set links, e.g. PouchLink or StackLink.
When this method is called manually, i.e. after a client instanciation,
we manually call the links onLogin methods

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `links` | `any`\[] | The links to handle |

*Returns*

`Promise`<`void`>

*Defined in*

[packages/cozy-client/src/CozyClient.js:1903](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1903)

***

### setOnError

▸ **setOnError**(`onError`): `void`

At any time put an error function

**`throws`** {Error} onError should not have been defined yet

*Parameters*

| Name | Type |
| :------ | :------ |
| `onError` | `Function` |

*Returns*

`void`

*Defined in*

[packages/cozy-client/src/CozyClient.js:1875](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1875)

***

### setStore

▸ **setStore**(`store`, `[options]?`): `void`

Sets the internal store of the client. Use this when you want to have cozy-client's
internal store colocated with your existing Redux store.

Typically, you would need to do this only once in your application, this is why
setStore throws if you do it twice. If you really need to set the store again,
use options.force = true.

**`example`**

    const client = new CozyClient()
    const store = createStore(combineReducers({
      todos: todoReducer,
      cozy: client.reducer()
    })
    client.setStore(store)

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `store` | `any` | A redux store |
| `[options]` | `Object` | Options |
| `[options].force` | `boolean` | - |

*Returns*

`void`

*Defined in*

[packages/cozy-client/src/CozyClient.js:1661](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1661)

***

### startOAuthFlow

▸ **startOAuthFlow**(`openURLCallback`): `Promise`<`any`>

Performs a complete OAuth flow, including updating the internal token at the end.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `openURLCallback` | `OpenURLCallback` | Receives the URL to present to the user as a parameter, and should return a promise that resolves with the URL the user was redirected to after accepting the permissions. |

*Returns*

`Promise`<`any`>

Contains the fetched token and the client information. These should be stored and used to restore the client.

*Defined in*

[packages/cozy-client/src/CozyClient.js:1556](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1556)

***

### toJSON

▸ **toJSON**(): `CozyClient`

*Returns*

`CozyClient`

*Defined in*

[packages/cozy-client/src/CozyClient.js:1882](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1882)

***

### triggerHook

▸ **triggerHook**(`name`, `document`): `void`

*Parameters*

| Name | Type |
| :------ | :------ |
| `name` | `any` |
| `document` | `any` |

*Returns*

`void`

*Defined in*

[packages/cozy-client/src/CozyClient.js:908](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L908)

***

### updateAll

▸ **updateAll**(`docs`, `options?`): `Promise`<`void`>

Updates multiple documents in one batch. Should have \_id and \_rev

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `docs` | `CozyClientDocument`\[] | Documents from the same doctype |
| `options` | `any` | - |

*Returns*

`Promise`<`void`>

*Defined in*

[packages/cozy-client/src/CozyClient.js:690](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L690)

***

### upload

▸ **upload**(`file`, `dirPath`, `options?`): `Promise`<`any`>

Upload a file

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `file` | `any` | File to be uploaded |
| `dirPath` | `string` | Path to upload the file to. ie : /Administative/XXX/ |
| `options` | `any` | - |

*Returns*

`Promise`<`any`>

Created io.cozy.files

*Defined in*

[packages/cozy-client/src/CozyClient.js:950](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L950)

***

### validate

▸ **validate**(`document`): `Promise`<{}>

*Parameters*

| Name | Type |
| :------ | :------ |
| `document` | `any` |

*Returns*

`Promise`<{}>

*Defined in*

[packages/cozy-client/src/CozyClient.js:611](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L611)

***

### watchQuery

▸ **watchQuery**(...`args`): `default`

*Parameters*

| Name | Type |
| :------ | :------ |
| `...args` | `any`\[] |

*Returns*

`default`

*Defined in*

[packages/cozy-client/src/CozyClient.js:1132](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1132)

***

### fromDOM

▸ `Static` **fromDOM**(`options?`, `selector?`): [`CozyClient`](CozyClient.md)

When used from an app, CozyClient can be instantiated from the data injected by the stack in
the DOM.

*Parameters*

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `options` | `any` | `{}` | CozyClient constructor options |
| `selector` | `string` | `'[role=application]'` | Options |

*Returns*

[`CozyClient`](CozyClient.md)

*   CozyClient instance

*Defined in*

[packages/cozy-client/src/CozyClient.js:409](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L409)

***

### fromEnv

▸ `Static` **fromEnv**(`envArg`, `options?`): [`CozyClient`](CozyClient.md)

In konnector/service context, CozyClient can be instantiated from
environment variables

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `envArg` | `any` | - |
| `options` | `any` | Options |

*Returns*

[`CozyClient`](CozyClient.md)

*Defined in*

[packages/cozy-client/src/CozyClient.js:380](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L380)

***

### fromOldClient

▸ `Static` **fromOldClient**(`oldClient`, `options`): [`CozyClient`](CozyClient.md)

To help with the transition from cozy-client-js to cozy-client, it is possible to instantiate
a client with a cookie-based instance of cozy-client-js.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `oldClient` | `any` | An instance of the deprecated cozy-client |
| `options` | `any` | CozyStackClient options |

*Returns*

[`CozyClient`](CozyClient.md)

*Defined in*

[packages/cozy-client/src/CozyClient.js:330](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L330)

***

### fromOldOAuthClient

▸ `Static` **fromOldOAuthClient**(`oldClient`, `options`): `Promise`<[`CozyClient`](CozyClient.md)>

To help with the transition from cozy-client-js to cozy-client, it is possible to instantiate
a client with an OAuth-based instance of cozy-client-js.

Warning: unlike other instantiators, this one needs to be awaited.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `oldClient` | `any` | An OAuth instance of the deprecated cozy-client |
| `options` | `any` | CozyStackClient options |

*Returns*

`Promise`<[`CozyClient`](CozyClient.md)>

An instance of a client, configured from the old client

*Defined in*

[packages/cozy-client/src/CozyClient.js:348](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L348)

***

### registerHook

▸ `Static` **registerHook**(`doctype`, `name`, `fn`): `void`

Hooks are an observable system for events on documents.
There are at the moment only 2 hooks available.

*   before:destroy, called just before a document is destroyed via CozyClient::destroy
*   after:destroy, called after a document is destroyed via CozyClient::destroy

**`example`**

    CozyClient.registerHook('io.cozy.bank.accounts', 'before:destroy', () => {
      console.log('A io.cozy.bank.accounts is being destroyed')
    })

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `doctype` | `string` | Doctype on which the hook will be registered |
| `name` | `string` | Name of the hook |
| `fn` | `Function` | Callback to be executed |

*Returns*

`void`

*Defined in*

[packages/cozy-client/src/CozyClient.js:902](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L902)
