cozy-client

# cozy-client

## Namespaces

*   [manifest](modules/manifest.md)
*   [models](modules/models.md)
*   [useMutation](modules/useMutation.md)

## Classes

*   [Association](classes/Association.md)
*   [BlockedCozyError](classes/BlockedCozyError.md)
*   [BulkEditError](classes/BulkEditError.md)
*   [CozyClient](classes/CozyClient.md)
*   [CozyLink](classes/CozyLink.md)
*   [CozyProvider](classes/CozyProvider.md)
*   [DataProxyLink](classes/DataProxyLink.md)
*   [HasMany](classes/HasMany.md)
*   [HasManyInPlace](classes/HasManyInPlace.md)
*   [HasManyTriggers](classes/HasManyTriggers.md)
*   [HasOne](classes/HasOne.md)
*   [HasOneInPlace](classes/HasOneInPlace.md)
*   [InvalidCozyUrlError](classes/InvalidCozyUrlError.md)
*   [InvalidProtocolError](classes/InvalidProtocolError.md)
*   [InvalidRedirectLinkError](classes/InvalidRedirectLinkError.md)
*   [Query](classes/Query.md)
*   [QueryDefinition](classes/QueryDefinition.md)
*   [Registry](classes/Registry.md)
*   [StackLink](classes/StackLink.md)
*   [WebFlagshipLink](classes/WebFlagshipLink.md)

## Properties

### RealTimeQueries

• **RealTimeQueries**: `MemoExoticComponent`<(`options`: { `doctype`: `string`  }) => `null`>

## Variables

### MutationTypes

• `Const` **MutationTypes**: `Object`

*Type declaration*

| Name | Type |
| :------ | :------ |
| `ADD_REFERENCED_BY` | `string` |
| `ADD_REFERENCES_TO` | `string` |
| `CREATE_DOCUMENT` | `string` |
| `CREATE_DOCUMENTS` | `string` |
| `DELETE_DOCUMENT` | `string` |
| `DELETE_DOCUMENTS` | `string` |
| `REMOVE_REFERENCED_BY` | `string` |
| `REMOVE_REFERENCES_TO` | `string` |
| `UPDATE_DOCUMENT` | `string` |
| `UPDATE_DOCUMENTS` | `string` |
| `UPLOAD_FILE` | `string` |

*Defined in*

[packages/cozy-client/src/queries/dsl.js:541](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/queries/dsl.js#L541)

***

### Mutations

• `Const` **Mutations**: `Object`

*Type declaration*

| Name | Type |
| :------ | :------ |
| `addReferencedBy` | (`document`: `any`, `referencedDocuments`: `any`) => { `document`: `any` ; `mutationType`: `string` = MutationTypes.ADD_REFERENCED_BY; `referencedDocuments`: `any`  } |
| `addReferencesTo` | (`document`: `any`, `referencedDocuments`: `any`) => { `document`: `any` ; `mutationType`: `string` = MutationTypes.ADD_REFERENCES_TO; `referencedDocuments`: `any`  } |
| `createDocument` | (`document`: `any`) => { `document`: `any` ; `mutationType`: `string` = MutationTypes.CREATE_DOCUMENT } |
| `createDocuments` | (`documents`: `any`) => { `documents`: `any` ; `mutationType`: `string` = MutationTypes.CREATE_DOCUMENTS } |
| `deleteDocument` | (`document`: `any`) => { `document`: `any` ; `mutationType`: `string` = MutationTypes.DELETE_DOCUMENT } |
| `deleteDocuments` | (`documents`: `any`) => { `documents`: `any` ; `mutationType`: `string` = MutationTypes.DELETE_DOCUMENTS } |
| `removeReferencedBy` | (`document`: `any`, `referencedDocuments`: `any`) => { `document`: `any` ; `mutationType`: `string` = MutationTypes.REMOVE_REFERENCED_BY; `referencedDocuments`: `any`  } |
| `removeReferencesTo` | (`document`: `any`, `referencedDocuments`: `any`) => { `document`: `any` ; `mutationType`: `string` = MutationTypes.REMOVE_REFERENCES_TO; `referencedDocuments`: `any`  } |
| `updateDocument` | (`document`: `any`) => { `document`: `any` ; `mutationType`: `string` = MutationTypes.UPDATE_DOCUMENT } |
| `updateDocuments` | (`documents`: `any`) => { `documents`: `any` ; `mutationType`: `string` = MutationTypes.UPDATE_DOCUMENTS } |
| `uploadFile` | (`file`: `any`, `dirPath`: `any`) => { `dirPath`: `any` ; `file`: `any` ; `mutationType`: `string` = MutationTypes.UPLOAD_FILE } |

*Defined in*

[packages/cozy-client/src/queries/dsl.js:527](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/queries/dsl.js#L527)

***

### defaultPerformanceApi

• `Const` **defaultPerformanceApi**: `PerformanceAPI`

*Defined in*

[packages/cozy-client/src/performances/defaultPerformanceApi.js:2](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/performances/defaultPerformanceApi.js#L2)

***

### fetchPolicies

• `Const` **fetchPolicies**: `Object`

Use those fetch policies with `<Query />` to limit the number of re-fetch.

**`example`**

    import { fetchPolicies } from 'cozy-client'
    const olderThan30s = fetchPolicies.olderThan(30 * 1000)
    <Query fetchPolicy={olderThan30s} />

*Type declaration*

| Name | Type |
| :------ | :------ |
| `noFetch` | () => `boolean` |
| `olderThan` | (`delay`: `number`) => `Function` |

*Defined in*

[packages/cozy-client/src/policies.js:11](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/policies.js#L11)

***

### useMutation

• `Const` **useMutation**: `Object`

#### Call signature

▸ (`__namedParameters?`): `UseMutationReturnValue`

This hook manages the state during the saving of a document

*Parameters*

| Name | Type |
| :------ | :------ |
| `__namedParameters` | `Object` |
| `__namedParameters.onError` | `any` |
| `__namedParameters.onSuccess` | `any` |

*Returns*

`UseMutationReturnValue`

*Type declaration*

| Name | Type |
| :------ | :------ |
| `propTypes` | { `onError`: `Requireable`<(...`args`: `any`\[]) => `any`> = PropTypes.func; `onSuccess`: `Requireable`<(...`args`: `any`\[]) => `any`> = PropTypes.func } |
| `propTypes.onError` | `Requireable`<(...`args`: `any`\[]) => `any`> |
| `propTypes.onSuccess` | `Requireable`<(...`args`: `any`\[]) => `any`> |

*Defined in*

[packages/cozy-client/src/hooks/useMutation.jsx:11](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/hooks/useMutation.jsx#L11)

***

### webPerformanceApi

• `Const` **webPerformanceApi**: `PerformanceAPI`

*Defined in*

[packages/cozy-client/src/performances/webPerformanceApi.js:42](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/performances/webPerformanceApi.js#L42)

## Functions

### Q

▸ **Q**(`doctype`): [`QueryDefinition`](classes/QueryDefinition.md)

Helper to create a QueryDefinition. Recommended way to create
query definitions.

**`example`**

    import { Q } from 'cozy-client'

    const qDef = Q('io.cozy.todos').where({ _id: '1234' })

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `doctype` | `string` | Doctype of the query definition |

*Returns*

[`QueryDefinition`](classes/QueryDefinition.md)

*Defined in*

[packages/cozy-client/src/queries/dsl.js:407](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/queries/dsl.js#L407)

***

### cancelable

▸ **cancelable**(`promise`): `CancelablePromise`

Wraps a promise so that it can be canceled

Rejects with canceled: true as soon as cancel is called

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `promise` | `Promise`<`any`> | Promise |

*Returns*

`CancelablePromise`

*   Promise with .cancel method

*Defined in*

[packages/cozy-client/src/utils.js:17](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/utils.js#L17)

***

### createFakeClient

▸ **createFakeClient**(`options?`): [`CozyClient`](classes/CozyClient.md)

Creates a client with pre-filled store
This can be useful for demo in documentation (e.g. storybook)

*   client.{query,save} are replaced with empty functions
*   client.stackClient.fetchJSON is replaced with empty functions

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | `Object` | Options |
| `options.clientFunctions` | `any` | - |
| `options.clientOptions` | `any` | - |
| `options.queries` | `any` | - |
| `options.remote` | `any` | - |

*Returns*

[`CozyClient`](classes/CozyClient.md)

*Defined in*

[packages/cozy-client/src/mock.js:92](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/mock.js#L92)

***

### createMockClient

▸ **createMockClient**(`options?`): [`CozyClient`](classes/CozyClient.md)

Creates a client suitable for use in tests

*   client.{query,save} are mocked
*   client.stackClient.fetchJSON is mocked

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | `Object` | Options |
| `options.clientFunctions` | `any` | - |
| `options.clientOptions` | `any` | - |
| `options.queries` | `any` | - |
| `options.remote` | `any` | - |

*Returns*

[`CozyClient`](classes/CozyClient.md)

*Defined in*

[packages/cozy-client/src/mock.js:48](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/mock.js#L48)

***

### deconstructCozyWebLinkWithSlug

▸ **deconstructCozyWebLinkWithSlug**(`webLink`, `subDomainType?`): `CozyLinkData`

Deconstruct the given link in order to retrieve useful data like Cozy's name, domain, or slug

The given link MUST contain a slug

*Parameters*

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `webLink` | `string` | `undefined` | link to deconstruct. It should be a link from a Cozy and containing a slug |
| `subDomainType` | `SubdomainType` | `'flat'` | - |

*Returns*

`CozyLinkData`

Deconstructed link

*Defined in*

[packages/cozy-client/src/helpers/urlHelper.js:64](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/helpers/urlHelper.js#L64)

***

### deconstructRedirectLink

▸ **deconstructRedirectLink**(`redirectLink`): `RedirectLinkData`

Deconstruct the given redirect link in order to retrieve slug, pathname and hash

**`throws`** {InvalidRedirectLinkError} Thrown when redirect link is invalid

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `redirectLink` | `string` | redirect link to deconstruct (i.e. 'drive/public/#/folder/SOME_ID') |

*Returns*

`RedirectLinkData`

Deconstructed link

*Defined in*

[packages/cozy-client/src/helpers/urlHelper.js:106](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/helpers/urlHelper.js#L106)

***

### dehydrate

▸ **dehydrate**(`document`): `Object`

*Parameters*

| Name | Type |
| :------ | :------ |
| `document` | `any` |

*Returns*

`Object`

*Defined in*

[packages/cozy-client/src/helpers/dehydrateHelper.js:3](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/helpers/dehydrateHelper.js#L3)

***

### dispatchCreate

▸ **dispatchCreate**(`client`, `doctype`, `couchDBDoc`, `options?`): `Promise`<`void`>

Dispatches a create action for a document to update CozyClient store from realtime callbacks.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `client` | `any` | CozyClient instance |
| `doctype` | `string` | Doctype of the document to create |
| `couchDBDoc` | `CouchDBDocument` | Document to create |
| `options` | `DispatchOptions` | - |

*Returns*

`Promise`<`void`>

*Defined in*

[packages/cozy-client/src/store/realtime.js:76](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/store/realtime.js#L76)

***

### dispatchDelete

▸ **dispatchDelete**(`client`, `doctype`, `couchDBDoc`, `options?`): `Promise`<`void`>

Dispatches a delete action for a document to update CozyClient store from realtime callbacks.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `client` | `any` | CozyClient instance |
| `doctype` | `string` | Doctype of the document to create |
| `couchDBDoc` | `CouchDBDocument` | Document to create |
| `options` | `DispatchOptions` | - |

*Returns*

`Promise`<`void`>

*Defined in*

[packages/cozy-client/src/store/realtime.js:120](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/store/realtime.js#L120)

***

### dispatchUpdate

▸ **dispatchUpdate**(`client`, `doctype`, `couchDBDoc`, `options?`): `Promise`<`void`>

Dispatches a update action for a document to update CozyClient store from realtime callbacks.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `client` | `any` | CozyClient instance |
| `doctype` | `string` | Doctype of the document to create |
| `couchDBDoc` | `CouchDBDocument` | Document to create |
| `options` | `DispatchOptions` | - |

*Returns*

`Promise`<`void`>

*Defined in*

[packages/cozy-client/src/store/realtime.js:98](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/store/realtime.js#L98)

***

### ensureFirstSlash

▸ **ensureFirstSlash**(`path`): `any`

*Parameters*

| Name | Type |
| :------ | :------ |
| `path` | `any` |

*Returns*

`any`

*Defined in*

[packages/cozy-client/src/helpers/urlHelper.js:1](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/helpers/urlHelper.js#L1)

***

### fetchRegistrationDetails

▸ **fetchRegistrationDetails**(`url`): `Promise`<`RegistrationDetails`>

registrationDetails - Get the root URL and prelogin info of a Cozy from more
precise ones

The goal is to allow users to use any URL copied from their browser as their
Cozy URL rather than trying to explain to them what we expect (e.g. when
requesting the Cozy URL to connect an app).
If we can't get the root URL either because there's no Cozy or the domain
does not exist or anything else, we'll throw an InvalidCozyUrlError.
Also, since we communicate only via HTTP or HTTPS, we'll throw an
InvalidProtocolError if any other protocol is used.

This function expects a fully qualified URL thus with a protocol and a valid
hostname. If your application accepts Cozy intances as input (e.g. `claude`
when the Cozy can be found at `https://claude.mycozy.cloud`), it is your
responsibility to add the appropriate domain to the hostname before calling
this function.

Examples:

1.  getting the root URL when your user gives you its instance name

const userInput = 'claude'
const details = await fetchRegistrationDetails(new URL(`https://${userInput}.mycozy.cloud`))
// → returns { rootUrl: new URL('https://claude.mycozy.cloud'), isOIDC: false }

2.  getting the root URL when your user gives you a Cozy Drive URL

const userInput = 'https://claude-drive.mycozy.cloud/#/folder/io.cozy.files.root-dir'
const rootUrl = await fetchRegistrationDetails(new URL(userInput))
// → returns { rootUrl: new URL('https://claude.mycozy.cloud'), isOIDC: false }

3.  getting the root URL when the Cozy uses nested sub-domains

const userInput = 'http://photos.camille.nimbus.com:8080/#/album/1234567890'
const rootCozyUrl = await fetchRegistrationDetails(new URL(userInput))
// → returns { rootUrl: new URL('http://camille.nimbus.com:8080'), isOIDC: false }

4.  getting the root URL when your user gives you an instance from OIDC partners

const details = await fetchRegistrationDetails(new URL(`https://alice.someoidcpartener.com`))
// → returns { rootUrl: new URL('https://alice.someoidcpartener.com'), isOIDC: true }

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `url` | `URL` | The URL from which we'll try to get the root Cozy URL |

*Returns*

`Promise`<`RegistrationDetails`>

The root Cozy URL

*Defined in*

[packages/cozy-client/src/helpers/urlHelper.js:394](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/helpers/urlHelper.js#L394)

***

### generateWebLink

▸ **generateWebLink**(`options`): `string`

generateWebLink - Construct a link to a web app

This function does not get its cozy url from a CozyClient instance so it can
be used to build urls that point to other Cozies than the user's own Cozy.
This is useful when pointing to the Cozy of the owner of a shared note for
example.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | `Object` | Object of options |
| `options.cozyUrl` | `string` | Base URL of the cozy, eg. cozy.tools or test.mycozy.cloud |
| `options.hash` | `string` | - |
| `options.pathname` | `string` | - |
| `options.searchParams` | `any`\[] | - |
| `options.slug` | `string` | - |
| `options.subDomainType` | `string` | - |

*Returns*

`string`

Generated URL

*Defined in*

[packages/cozy-client/src/helpers/urlHelper.js:27](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/helpers/urlHelper.js#L27)

***

### getDoctypeFromOperation

▸ **getDoctypeFromOperation**(`operation`): `any`

*Parameters*

| Name | Type |
| :------ | :------ |
| `operation` | `any` |

*Returns*

`any`

*Defined in*

[packages/cozy-client/src/queries/dsl.js:499](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/queries/dsl.js#L499)

***

### getQueryFromState

▸ **getQueryFromState**(`state`, `queryId`): `any`

*Parameters*

| Name | Type |
| :------ | :------ |
| `state` | `any` |
| `queryId` | `any` |

*Returns*

`any`

*Defined in*

[packages/cozy-client/src/store/stateHelpers.js:22](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/store/stateHelpers.js#L22)

***

### getReferencedBy

▸ **getReferencedBy**(`file`, `referencedBy`): `Reference`\[]

Get array of reference by an specific doctype

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `file` | `IOCozyFile` | io.cozy.files document |
| `referencedBy` | `string` | Doctype where document is referenced |

*Returns*

`Reference`\[]

Array of references found

*Defined in*

[packages/cozy-client/src/associations/helpers.js:133](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/associations/helpers.js#L133)

***

### getReferencedById

▸ **getReferencedById**(`file`, `referencedBy`, `referencedId`): `Reference`\[]

Get array of reference by an specific doctype and a specific Id of that reference

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `file` | `IOCozyFile` | io.cozy.files document |
| `referencedBy` | `string` | Doctype where document is referenced |
| `referencedId` | `string` | Id of the referenced document |

*Returns*

`Reference`\[]

Array of the reference found

*Defined in*

[packages/cozy-client/src/associations/helpers.js:147](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/associations/helpers.js#L147)

***

### hasQueriesBeenLoaded

▸ **hasQueriesBeenLoaded**(`queriesResults`): `boolean`

Returns whether queries have been loaded at least once

*Parameters*

| Name | Type |
| :------ | :------ |
| `queriesResults` | `any` |

*Returns*

`boolean`

*Defined in*

[packages/cozy-client/src/utils.js:67](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/utils.js#L67)

***

### hasQueryBeenLoaded

▸ **hasQueryBeenLoaded**(`col`): `any`

Returns whether a query has been loaded at least once

*Parameters*

| Name | Type |
| :------ | :------ |
| `col` | `any` |

*Returns*

`any`

*Defined in*

[packages/cozy-client/src/utils.js:51](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/utils.js#L51)

***

### isQueriesLoading

▸ **isQueriesLoading**(`queriesResults`): `boolean`

Returns whether the result of queries are loading

*Parameters*

| Name | Type |
| :------ | :------ |
| `queriesResults` | `any` |

*Returns*

`boolean`

*Defined in*

[packages/cozy-client/src/utils.js:58](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/utils.js#L58)

***

### isQueryLoading

▸ **isQueryLoading**(`col`): `boolean`

Returns whether the result of a query (given via queryConnect or Query)
is loading.

*Parameters*

| Name | Type |
| :------ | :------ |
| `col` | `any` |

*Returns*

`boolean`

*Defined in*

[packages/cozy-client/src/utils.js:40](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/utils.js#L40)

***

### isReferencedBy

▸ **isReferencedBy**(`file`, `referencedBy`): `boolean`

Checks if the file is referenced by a specific doctype

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `file` | `IOCozyFile` | io.cozy.files document |
| `referencedBy` | `string` | Doctype where document is referenced |

*Returns*

`boolean`

If a reference is found

*Defined in*

[packages/cozy-client/src/associations/helpers.js:101](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/associations/helpers.js#L101)

***

### isReferencedById

▸ **isReferencedById**(`file`, `referencedBy`, `referencedId`): `boolean`

Checks if the file is referenced by a specific doctype and a specific Id of that reference

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `file` | `IOCozyFile` | io.cozy.files document |
| `referencedBy` | `string` | Doctype where document is referenced |
| `referencedId` | `string` | Id of the referenced document |

*Returns*

`boolean`

If a reference is found

*Defined in*

[packages/cozy-client/src/associations/helpers.js:116](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/associations/helpers.js#L116)

***

### queryConnect

▸ **queryConnect**(`querySpecs`): `Function`

**`function`**

**`description`** HOC creator to connect component to several queries in a declarative manner

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `querySpecs` | `any` | Definition of the queries |

*Returns*

`Function`

*   HOC to apply to a component

*Defined in*

[packages/cozy-client/src/hoc.jsx:74](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/hoc.jsx#L74)

***

### queryConnectFlat

▸ **queryConnectFlat**(`querySpecs`): `Function`

**`function`**

**`description`** HOC creator to connect component to several queries in a declarative manner
The only difference with queryConnect is that it does not wrap the component in N component
if there are N queries, only 1 extra level of nesting is introduced.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `querySpecs` | `any` | Definition of the queries |

*Returns*

`Function`

*   HOC to apply to a component

*Defined in*

[packages/cozy-client/src/hoc.jsx:90](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/hoc.jsx#L90)

***

### rootCozyUrl

▸ **rootCozyUrl**(`url`): `Promise`<`URL`>

rootCozyUrl - Get the root URL of a Cozy from more precise ones

The goal is to allow users to use any URL copied from their browser as their
Cozy URL rather than trying to explain to them what we expect (e.g. when
requesting the Cozy URL to connect an app).
If we can't get the root URL either because there's no Cozy or the domain
does not exist or anything else, we'll throw an InvalidCozyUrlError.
Also, since we communicate only via HTTP or HTTPS, we'll throw an
InvalidProtocolError if any other protocol is used.

This function expects a fully qualified URL thus with a protocol and a valid
hostname. If your application accepts Cozy intances as input (e.g. `claude`
when the Cozy can be found at `https://claude.mycozy.cloud`), it is your
responsibility to add the appropriate domain to the hostname before calling
this function.

Examples:

1.  getting the root URL when your user gives you its instance name

const userInput = 'claude'
const rootUrl = await rootCozyUrl(new URL(`https://${userInput}.mycozy.cloud`))
// → returns new URL('https://claude.mycozy.cloud')

2.  getting the root URL when your user gives you a Cozy Drive URL

const userInput = 'https://claude-drive.mycozy.cloud/#/folder/io.cozy.files.root-dir'
const rootUrl = await rootCozyUrl(new URL(userInput))
// → returns new URL('https://claude.mycozy.cloud')

3.  getting the root URL when the Cozy uses nested sub-domains

const userInput = 'http://photos.camille.nimbus.com:8080/#/album/1234567890'
const rootCozyUrl = await rootCozyUrl(new URL(userInput))
// → returns new URL('http://camille.nimbus.com:8080')

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `url` | `URL` | The URL from which we'll try to get the root Cozy URL |

*Returns*

`Promise`<`URL`>

The root Cozy URL

*Defined in*

[packages/cozy-client/src/helpers/urlHelper.js:280](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/helpers/urlHelper.js#L280)

***

### useAppLinkWithStoreFallback

▸ **useAppLinkWithStoreFallback**(`slug`, `client`, `path?`): `Object`

*Parameters*

| Name | Type | Default value |
| :------ | :------ | :------ |
| `slug` | `any` | `undefined` |
| `client` | `any` | `undefined` |
| `path` | `string` | `''` |

*Returns*

`Object`

| Name | Type |
| :------ | :------ |
| `fetchStatus` | `string` |
| `isInstalled` | `boolean` |
| `url` | `any` |

*Defined in*

[packages/cozy-client/src/hooks/useAppLinkWithStoreFallback.jsx:9](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/hooks/useAppLinkWithStoreFallback.jsx#L9)

***

### useAppsInMaintenance

▸ **useAppsInMaintenance**(): `"io.cozy.apps"`\[]

Returns all apps in maintenance

*Returns*

`"io.cozy.apps"`\[]

An array with all apps in maintenance

*Defined in*

[packages/cozy-client/src/hooks/useAppsInMaintenance.jsx:12](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/hooks/useAppsInMaintenance.jsx#L12)

***

### useCapabilities

▸ **useCapabilities**(`client`): `Object`

*Parameters*

| Name | Type |
| :------ | :------ |
| `client` | `any` |

*Returns*

`Object`

| Name | Type |
| :------ | :------ |
| `capabilities` | `undefined` |
| `fetchStatus` | `string` |

*Defined in*

[packages/cozy-client/src/hooks/useCapabilities.jsx:5](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/hooks/useCapabilities.jsx#L5)

***

### useClient

▸ **useClient**(): [`CozyClient`](classes/CozyClient.md)

Returns the cozy client from the context

*Returns*

[`CozyClient`](classes/CozyClient.md)

*   Current cozy client

*Defined in*

[packages/cozy-client/src/hooks/useClient.js:10](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/hooks/useClient.js#L10)

***

### useFetchHomeShortcuts

▸ **useFetchHomeShortcuts**(): `any`

*Returns*

`any`

*Defined in*

[packages/cozy-client/src/hooks/useFetchHomeShortcuts.jsx:27](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/hooks/useFetchHomeShortcuts.jsx#L27)

***

### useFetchShortcut

▸ **useFetchShortcut**(`client`, `id`): `Object`

*Parameters*

| Name | Type |
| :------ | :------ |
| `client` | `any` |
| `id` | `any` |

*Returns*

`Object`

| Name | Type |
| :------ | :------ |
| `fetchStatus` | `string` |
| `shortcutImg` | `any` |
| `shortcutInfos` | `any` |

*Defined in*

[packages/cozy-client/src/hooks/useFetchShortcut.jsx:8](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/hooks/useFetchShortcut.jsx#L8)

***

### useInstanceInfo

▸ **useInstanceInfo**(): `InstanceInfo`

Retrieve intance info like context, uuid, disk usage etc

*Returns*

`InstanceInfo`

*Defined in*

[packages/cozy-client/src/hooks/useInstanceInfo.js:11](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/hooks/useInstanceInfo.js#L11)

***

### useQueries

▸ **useQueries**(`querySpecs`): `Object`

*Parameters*

| Name | Type |
| :------ | :------ |
| `querySpecs` | `any` |

*Returns*

`Object`

*Defined in*

[packages/cozy-client/src/hooks/useQuery.js:95](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/hooks/useQuery.js#L95)

***

### useQuery

▸ **useQuery**(`queryDefinition`, `options`): `UseQueryReturnValue`

Fetches a queryDefinition and returns the queryState

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `queryDefinition` | [`QueryDefinition`](classes/QueryDefinition.md) | () => [`QueryDefinition`](classes/QueryDefinition.md) | Definition created with Q() |
| `options` | `QueryOptions` | Options created with Q() |

*Returns*

`UseQueryReturnValue`

*Defined in*

[packages/cozy-client/src/hooks/useQuery.js:30](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/hooks/useQuery.js#L30)

***

### useQueryAll

▸ **useQueryAll**(`queryDefinition`, `options`): `UseQueryReturnValue`

Fetches a queryDefinition and run fetchMore on the query until the query is fully loaded

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `queryDefinition` | [`QueryDefinition`](classes/QueryDefinition.md) | Definition created with Q() |
| `options` | `QueryOptions` | Options created with Q() |

*Returns*

`UseQueryReturnValue`

*Defined in*

[packages/cozy-client/src/hooks/useQueryAll.jsx:14](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/hooks/useQueryAll.jsx#L14)

***

### useSettings

▸ **useSettings**<`T`>(`slug`, `keys`): `UseSettingsReturnValue`<`T`>

Query the cozy-app settings corresponding to the given slug and
return:

*   the values corresponding to the given `keys`
*   the `save()` method that can be used to edit the setting's value
*   the query that manages the state during the fetching of the setting
*   the mutation that manages the state during the saving of the setting

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `string` |

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `slug` | `string` | the cozy-app's slug containing the setting (special cases are: 'instance' for global settings and 'passwords' for bitwarden settings) |
| `keys` | `T`\[] | The name of the setting to retrieve |

*Returns*

`UseSettingsReturnValue`<`T`>

*Defined in*

[packages/cozy-client/src/hooks/useSetting.js:24](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/hooks/useSetting.js#L24)

***

### withClient

▸ **withClient**(`WrappedComponent`): `Function`

**`function`**

**`description`** HOC to provide client from context as prop

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `WrappedComponent` | `Component`<`any`, `any`, `any`> | wrapped component |

*Returns*

`Function`

*   Component that will receive client as prop

*Defined in*

[packages/cozy-client/src/hoc.jsx:16](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/hoc.jsx#L16)

***

### withMutation

▸ **withMutation**(`mutation`, `options?`): `Function`

*Parameters*

| Name | Type |
| :------ | :------ |
| `mutation` | `any` |
| `options` | `Object` |

*Returns*

`Function`

*Defined in*

[packages/cozy-client/src/withMutation.jsx:8](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/withMutation.jsx#L8)

***

### withMutations

▸ **withMutations**(...`mutations`): `Function`

**`function`**

**`description`** HOC to provide mutations to components. Needs client in context or as prop.

**`deprecated`** Prefer to use withClient and access directly the client.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `...mutations` | `Function`\[] | One ore more mutations, which are function taking CozyClient as parameter and returning an object containing one or more mutations as attributes. |

*Returns*

`Function`

*   Component that will receive mutations as props

*Defined in*

[packages/cozy-client/src/withMutations.jsx:24](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/withMutations.jsx#L24)
