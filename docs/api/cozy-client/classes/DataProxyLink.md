[cozy-client](../README.md) / DataProxyLink

# Class: DataProxyLink

## Hierarchy

*   [`CozyLink`](CozyLink.md)

    ↳ **`DataProxyLink`**

## Constructors

### constructor

• **new DataProxyLink**(`[options]?`)

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `[options]` | `Object` | Options |
| `[options].dataproxy` | `any` | - |

*Overrides*

[CozyLink](CozyLink.md).[constructor](CozyLink.md#constructor)

*Defined in*

[packages/cozy-client/src/links/DataProxyLink.js:10](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/links/DataProxyLink.js#L10)

## Properties

### \_drainingRequests

• **\_drainingRequests**: `boolean`

*Defined in*

[packages/cozy-client/src/links/DataProxyLink.js:14](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/links/DataProxyLink.js#L14)

***

### \_queue

• **\_queue**: `any`\[]

*Defined in*

[packages/cozy-client/src/links/DataProxyLink.js:13](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/links/DataProxyLink.js#L13)

***

### dataproxy

• **dataproxy**: `any`

*Defined in*

[packages/cozy-client/src/links/DataProxyLink.js:12](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/links/DataProxyLink.js#L12)

## Accessors

### name

• `get` **name**(): `string`

*Returns*

`string`

*Overrides*

CozyLink.name

*Defined in*

[packages/cozy-client/src/links/DataProxyLink.js:21](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/links/DataProxyLink.js#L21)

## Methods

### \_flushQueue

▸ **\_flushQueue**(): `Promise`<`void`>

*Returns*

`Promise`<`void`>

*Defined in*

[packages/cozy-client/src/links/DataProxyLink.js:75](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/links/DataProxyLink.js#L75)

***

### \_onReceiveMessage

▸ **\_onReceiveMessage**(`event`): `void`

*Parameters*

| Name | Type |
| :------ | :------ |
| `event` | `any` |

*Returns*

`void`

*Defined in*

[packages/cozy-client/src/links/DataProxyLink.js:102](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/links/DataProxyLink.js#L102)

***

### doRequest

▸ **doRequest**(`operation`, `options`): `Promise`<`any`>

*Parameters*

| Name | Type |
| :------ | :------ |
| `operation` | `any` |
| `options` | `any` |

*Returns*

`Promise`<`any`>

*Defined in*

[packages/cozy-client/src/links/DataProxyLink.js:60](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/links/DataProxyLink.js#L60)

***

### persistCozyData

▸ **persistCozyData**(`data`, `forward`): `Promise`<`void`>

Persist the given data into the links storage

*Parameters*

| Name | Type |
| :------ | :------ |
| `data` | `any` |
| `forward` | `any` |

*Returns*

`Promise`<`void`>

*Overrides*

[CozyLink](CozyLink.md).[persistCozyData](CozyLink.md#persistcozydata)

*Defined in*

[packages/cozy-client/src/links/DataProxyLink.js:70](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/links/DataProxyLink.js#L70)

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

[packages/cozy-client/src/links/DataProxyLink.js:25](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/links/DataProxyLink.js#L25)

***

### registerDataProxy

▸ **registerDataProxy**(`dataproxy`): `void`

When the link is given to a cozy-client instance, the dataproxy might not be ready yet.
Thus, this method will be typically called afterwards by the DataProxyProvider once
the dataproxy is ready and set

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `dataproxy` | `any` | The dataproxy instance |

*Returns*

`void`

*Defined in*

[packages/cozy-client/src/links/DataProxyLink.js:36](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/links/DataProxyLink.js#L36)

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

[packages/cozy-client/src/links/DataProxyLink.js:45](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/links/DataProxyLink.js#L45)

***

### reset

▸ **reset**(): `Promise`<`void`>

Reset the link data

*Returns*

`Promise`<`void`>

*Overrides*

[CozyLink](CozyLink.md).[reset](CozyLink.md#reset)

*Defined in*

[packages/cozy-client/src/links/DataProxyLink.js:41](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/links/DataProxyLink.js#L41)
