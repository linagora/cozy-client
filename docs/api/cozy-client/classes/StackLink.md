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

[packages/cozy-client/src/links/StackLink.js:75](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/links/StackLink.js#L75)

## Properties

### isOnline

• **isOnline**: `any`

*Defined in*

[packages/cozy-client/src/links/StackLink.js:83](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/links/StackLink.js#L83)

***

### performanceApi

• **performanceApi**: `PerformanceAPI`

*Defined in*

[packages/cozy-client/src/links/StackLink.js:86](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/links/StackLink.js#L86)

***

### stackClient

• **stackClient**: `any`

*Defined in*

[packages/cozy-client/src/links/StackLink.js:82](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/links/StackLink.js#L82)

## Accessors

### name

• `get` **name**(): `string`

*Returns*

`string`

*Overrides*

CozyLink.name

*Defined in*

[packages/cozy-client/src/links/StackLink.js:89](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/links/StackLink.js#L89)

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

[packages/cozy-client/src/links/StackLink.js:210](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/links/StackLink.js#L210)

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

[packages/cozy-client/src/links/StackLink.js:136](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/links/StackLink.js#L136)

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

[packages/cozy-client/src/links/StackLink.js:128](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/links/StackLink.js#L128)

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

[packages/cozy-client/src/links/StackLink.js:93](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/links/StackLink.js#L93)

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

[packages/cozy-client/src/links/StackLink.js:101](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/links/StackLink.js#L101)

***

### reset

▸ **reset**(): `Promise`<`void`>

Reset the link data

*Returns*

`Promise`<`void`>

*Overrides*

[CozyLink](CozyLink.md).[reset](CozyLink.md#reset)

*Defined in*

[packages/cozy-client/src/links/StackLink.js:97](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/links/StackLink.js#L97)
