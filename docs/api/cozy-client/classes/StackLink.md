[cozy-client](../README.md) / StackLink

# Class: StackLink

Transfers queries and mutations to a remote stack

## Hierarchy

*   [`CozyLink`](CozyLink.md)

    ↳ **`StackLink`**

## Constructors

### constructor

• **new StackLink**(`[options]?`)

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `[options]` | `StackLinkOptions` | Options |

*Overrides*

[CozyLink](CozyLink.md).[constructor](CozyLink.md#constructor)

*Defined in*

[packages/cozy-client/src/links/StackLink.js:71](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/links/StackLink.js#L71)

## Properties

### isOnline

• **isOnline**: `any`

*Defined in*

[packages/cozy-client/src/links/StackLink.js:79](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/links/StackLink.js#L79)

***

### performanceApi

• **performanceApi**: `PerformanceAPI`

*Defined in*

[packages/cozy-client/src/links/StackLink.js:82](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/links/StackLink.js#L82)

***

### stackClient

• **stackClient**: `any`

*Defined in*

[packages/cozy-client/src/links/StackLink.js:78](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/links/StackLink.js#L78)

## Accessors

### name

• `get` **name**(): `string`

*Returns*

`string`

*Overrides*

CozyLink.name

*Defined in*

[packages/cozy-client/src/links/StackLink.js:85](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/links/StackLink.js#L85)

## Methods

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

[packages/cozy-client/src/links/StackLink.js:203](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/links/StackLink.js#L203)

***

### executeQuery

▸ **executeQuery**(`query`): `Promise`<`any`>

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `query` | [`QueryDefinition`](QueryDefinition.md) | Query to execute |

*Returns*

`Promise`<`any`>

*Defined in*

[packages/cozy-client/src/links/StackLink.js:132](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/links/StackLink.js#L132)

***

### persistCozyData

▸ **persistCozyData**(`data`, `forward`): `Promise`<`any`>

Persist the given data into the links storage

*Parameters*

| Name | Type |
| :------ | :------ |
| `data` | `any` |
| `forward` | `any` |

*Returns*

`Promise`<`any`>

*Overrides*

[CozyLink](CozyLink.md).[persistCozyData](CozyLink.md#persistcozydata)

*Defined in*

[packages/cozy-client/src/links/StackLink.js:124](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/links/StackLink.js#L124)

***

### registerClient

▸ **registerClient**(`client`): `void`

*Parameters*

| Name | Type |
| :------ | :------ |
| `client` | `any` |

*Returns*

`void`

*Defined in*

[packages/cozy-client/src/links/StackLink.js:89](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/links/StackLink.js#L89)

***

### request

▸ **request**(`operation`, `options`, `result`, `forward`): `Promise`<`any`>

Request the given operation from the link

*Parameters*

| Name | Type |
| :------ | :------ |
| `operation` | `any` |
| `options` | `any` |
| `result` | `any` |
| `forward` | `any` |

*Returns*

`Promise`<`any`>

*Overrides*

[CozyLink](CozyLink.md).[request](CozyLink.md#request)

*Defined in*

[packages/cozy-client/src/links/StackLink.js:97](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/links/StackLink.js#L97)

***

### reset

▸ **reset**(): `Promise`<`void`>

Reset the link data

*Returns*

`Promise`<`void`>

*Overrides*

[CozyLink](CozyLink.md).[reset](CozyLink.md#reset)

*Defined in*

[packages/cozy-client/src/links/StackLink.js:93](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/links/StackLink.js#L93)
