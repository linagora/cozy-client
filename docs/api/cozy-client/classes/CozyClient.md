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

[packages/cozy-client/src/CozyClient.js:167](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L167)

## Properties

### appMetadata

• **appMetadata**: `AppMetadata`

*Defined in*

[packages/cozy-client/src/CozyClient.js:184](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L184)

***

### autoHydrate

• **autoHydrate**: `boolean`

*Defined in*

[packages/cozy-client/src/CozyClient.js:246](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L246)

***

### capabilities

• **capabilities**: `ClientCapabilities`

*Defined in*

[packages/cozy-client/src/CozyClient.js:212](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L212)

***

### chain

• **chain**: `any`

*Defined in*

[packages/cozy-client/src/CozyClient.js:1910](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1910)

***

### client

• **client**: `any`

*Defined in*

[packages/cozy-client/src/CozyClient.js:1770](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1770)

***

### disableStoreForQueries

• **disableStoreForQueries**: `boolean`

*Defined in*

[packages/cozy-client/src/CozyClient.js:247](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L247)

***

### instanceOptions

• **instanceOptions**: `Object`

*Defined in*

[packages/cozy-client/src/CozyClient.js:192](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L192)

***

### isLogged

• **isLogged**: `boolean`

*Defined in*

[packages/cozy-client/src/CozyClient.js:191](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L191)

***

### isRevoked

• **isRevoked**: `boolean`

*Defined in*

[packages/cozy-client/src/CozyClient.js:509](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L509)

***

### links

• **links**: `any`\[]

*Defined in*

[packages/cozy-client/src/CozyClient.js:1906](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1906)

***

### loginPromise

• **loginPromise**: `Promise`<`void`>

*Defined in*

[packages/cozy-client/src/CozyClient.js:185](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L185)

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

[packages/cozy-client/src/CozyClient.js:188](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L188)

***

### performanceApi

• **performanceApi**: `PerformanceAPI`

*Defined in*

[packages/cozy-client/src/CozyClient.js:182](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L182)

***

### plugins

• **plugins**: `Object`

*Defined in*

[packages/cozy-client/src/CozyClient.js:215](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L215)

***

### queryIdGenerator

• **queryIdGenerator**: `QueryIDGenerator`

*Defined in*

[packages/cozy-client/src/CozyClient.js:190](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L190)

***

### schema

• **schema**: `Schema`

*Defined in*

[packages/cozy-client/src/CozyClient.js:207](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L207)

***

### stackClient

• **stackClient**: `any`

*Defined in*

[packages/cozy-client/src/CozyClient.js:1745](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1745)

***

### store

• **store**: `any`

*Defined in*

[packages/cozy-client/src/CozyClient.js:1675](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1675)

***

### storeAccesors

• **storeAccesors**: `any`

*Defined in*

[packages/cozy-client/src/CozyClient.js:240](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L240)

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

[packages/cozy-client/src/CozyClient.js:1413](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1413)

***

### useCustomStore

• **useCustomStore**: `boolean`

*Defined in*

[packages/cozy-client/src/CozyClient.js:242](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L242)

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

[packages/cozy-client/src/CozyClient.js:488](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L488)

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

[packages/cozy-client/src/CozyClient.js:444](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L444)

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

[packages/cozy-client/src/CozyClient.js:590](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L590)

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

[packages/cozy-client/src/CozyClient.js:1591](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1591)

***

### certifyFlagship

▸ **certifyFlagship**(): `Promise`<`void`>

Perform the Flagship certification process for verifying that the current running app is a genuine Cozy application

This mechanism is described in https://github.com/cozy/cozy-client/blob/master/packages/cozy-client/src/flagship-certification/README.md

*Returns*

`Promise`<`void`>

*Defined in*

[packages/cozy-client/src/CozyClient.js:1572](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1572)

***

### checkForRevocation

▸ **checkForRevocation**(): `Promise`<`any`>

Returns whether the client has been revoked on the server

*Returns*

`Promise`<`any`>

*Defined in*

[packages/cozy-client/src/CozyClient.js:1687](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1687)

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

[packages/cozy-client/src/CozyClient.js:582](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L582)

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

[packages/cozy-client/src/CozyClient.js:641](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L641)

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

[packages/cozy-client/src/CozyClient.js:665](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L665)

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

[packages/cozy-client/src/CozyClient.js:1725](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1725)

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

[packages/cozy-client/src/CozyClient.js:926](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L926)

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

[packages/cozy-client/src/CozyClient.js:940](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L940)

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

[packages/cozy-client/src/CozyClient.js:1796](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1796)

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

[packages/cozy-client/src/CozyClient.js:257](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L257)

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

[packages/cozy-client/src/CozyClient.js:740](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L740)

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

[packages/cozy-client/src/CozyClient.js:963](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L963)

***

### ensureStore

▸ **ensureStore**(): `void`

*Returns*

`void`

*Defined in*

[packages/cozy-client/src/CozyClient.js:1678](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1678)

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

[packages/cozy-client/src/CozyClient.js:586](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L586)

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

[packages/cozy-client/src/CozyClient.js:1530](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1530)

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

[packages/cozy-client/src/CozyClient.js:599](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L599)

***

### generateRandomId

▸ **generateRandomId**(): `string`

*Returns*

`string`

*Defined in*

[packages/cozy-client/src/CozyClient.js:1388](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1388)

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

[packages/cozy-client/src/CozyClient.js:606](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L606)

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

[packages/cozy-client/src/CozyClient.js:1395](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1395)

***

### getClient

▸ **getClient**(): `any`

*Returns*

`any`

*Defined in*

[packages/cozy-client/src/CozyClient.js:1778](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1778)

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

[packages/cozy-client/src/CozyClient.js:1431](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1431)

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

[packages/cozy-client/src/CozyClient.js:1448](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1448)

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

[packages/cozy-client/src/CozyClient.js:835](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L835)

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

[packages/cozy-client/src/CozyClient.js:1312](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1312)

***

### getInstanceOptions

▸ **getInstanceOptions**(): `any`

getInstanceOptions - Returns current instance options, such as domain or app slug

*Returns*

`any`

*Defined in*

[packages/cozy-client/src/CozyClient.js:1805](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1805)

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

[packages/cozy-client/src/CozyClient.js:1469](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1469)

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

[packages/cozy-client/src/CozyClient.js:1411](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1411)

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

[packages/cozy-client/src/CozyClient.js:1934](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1934)

***

### getStackClient

▸ **getStackClient**(): `any`

*Returns*

`any`

*Defined in*

[packages/cozy-client/src/CozyClient.js:1785](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1785)

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

[packages/cozy-client/src/CozyClient.js:1696](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1696)

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

[packages/cozy-client/src/CozyClient.js:1707](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1707)

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

[packages/cozy-client/src/CozyClient.js:1358](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1358)

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

[packages/cozy-client/src/CozyClient.js:1334](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1334)

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

[packages/cozy-client/src/CozyClient.js:1375](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1375)

***

### isReactNative

▸ **isReactNative**(): `boolean`

*Returns*

`boolean`

*Defined in*

[packages/cozy-client/src/CozyClient.js:1548](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1548)

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

[packages/cozy-client/src/CozyClient.js:1816](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1816)

***

### loadInstanceOptionsFromStack

▸ **loadInstanceOptionsFromStack**(): `Promise`<`void`>

loadInstanceOptionsFromStack - Loads the instance options from cozy-stack and exposes it through getInstanceOptions

This method is not iso with loadInstanceOptionsFromDOM for now.

*Returns*

`Promise`<`void`>

*Defined in*

[packages/cozy-client/src/CozyClient.js:1837](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1837)

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

[packages/cozy-client/src/CozyClient.js:477](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L477)

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

[packages/cozy-client/src/CozyClient.js:528](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L528)

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

[packages/cozy-client/src/CozyClient.js:1141](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1141)

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

[packages/cozy-client/src/CozyClient.js:1159](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1159)

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

[packages/cozy-client/src/CozyClient.js:258](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L258)

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

[packages/cozy-client/src/CozyClient.js:806](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L806)

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

[packages/cozy-client/src/CozyClient.js:990](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L990)

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

[packages/cozy-client/src/CozyClient.js:1101](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1101)

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

[packages/cozy-client/src/CozyClient.js:1792](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1792)

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

[packages/cozy-client/src/CozyClient.js:1542](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1542)

***

### registerClientOnLinks

▸ **registerClientOnLinks**(): `void`

*Returns*

`void`

*Defined in*

[packages/cozy-client/src/CozyClient.js:448](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L448)

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

[packages/cozy-client/src/CozyClient.js:308](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L308)

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

[packages/cozy-client/src/CozyClient.js:259](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L259)

***

### renewAuthorization

▸ **renewAuthorization**(): `any`

Renews the token if, for instance, new permissions are required or token
has expired.

*Returns*

`any`

Contains the fetched token and the client information.

*Defined in*

[packages/cozy-client/src/CozyClient.js:1637](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1637)

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

[packages/cozy-client/src/CozyClient.js:1296](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1296)

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

[packages/cozy-client/src/CozyClient.js:1963](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1963)

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

[packages/cozy-client/src/CozyClient.js:676](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L676)

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

[packages/cozy-client/src/CozyClient.js:1951](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1951)

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

[packages/cozy-client/src/CozyClient.js:709](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L709)

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

[packages/cozy-client/src/CozyClient.js:1891](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1891)

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

[packages/cozy-client/src/CozyClient.js:1864](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1864)

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

[packages/cozy-client/src/CozyClient.js:1905](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1905)

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

[packages/cozy-client/src/CozyClient.js:1877](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1877)

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

[packages/cozy-client/src/CozyClient.js:1663](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1663)

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

[packages/cozy-client/src/CozyClient.js:1558](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1558)

***

### toJSON

▸ **toJSON**(): `CozyClient`

*Returns*

`CozyClient`

*Defined in*

[packages/cozy-client/src/CozyClient.js:1884](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1884)

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

[packages/cozy-client/src/CozyClient.js:910](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L910)

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

[packages/cozy-client/src/CozyClient.js:692](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L692)

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

[packages/cozy-client/src/CozyClient.js:952](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L952)

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

[packages/cozy-client/src/CozyClient.js:613](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L613)

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

[packages/cozy-client/src/CozyClient.js:1134](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L1134)

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

[packages/cozy-client/src/CozyClient.js:411](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L411)

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

[packages/cozy-client/src/CozyClient.js:382](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L382)

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

[packages/cozy-client/src/CozyClient.js:332](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L332)

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

[packages/cozy-client/src/CozyClient.js:350](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L350)

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

[packages/cozy-client/src/CozyClient.js:904](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/CozyClient.js#L904)
