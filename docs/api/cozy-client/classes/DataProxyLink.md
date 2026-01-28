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

[packages/cozy-client/src/links/DataProxyLink.js:9](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/links/DataProxyLink.js#L9)

## Properties

### \_drainingRequests

• **\_drainingRequests**: `boolean`

*Defined in*

[packages/cozy-client/src/links/DataProxyLink.js:13](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/links/DataProxyLink.js#L13)

***

### \_queue

• **\_queue**: `any`\[]

*Defined in*

[packages/cozy-client/src/links/DataProxyLink.js:12](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/links/DataProxyLink.js#L12)

***

### dataproxy

• **dataproxy**: `any`

*Defined in*

[packages/cozy-client/src/links/DataProxyLink.js:11](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/links/DataProxyLink.js#L11)

## Methods

### \_flushQueue

▸ **\_flushQueue**(): `Promise`<`void`>

*Returns*

`Promise`<`void`>

*Defined in*

[packages/cozy-client/src/links/DataProxyLink.js:66](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/links/DataProxyLink.js#L66)

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

[packages/cozy-client/src/links/DataProxyLink.js:93](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/links/DataProxyLink.js#L93)

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

[packages/cozy-client/src/links/DataProxyLink.js:51](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/links/DataProxyLink.js#L51)

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

[packages/cozy-client/src/links/DataProxyLink.js:61](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/links/DataProxyLink.js#L61)

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

[packages/cozy-client/src/links/DataProxyLink.js:20](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/links/DataProxyLink.js#L20)

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

[packages/cozy-client/src/links/DataProxyLink.js:31](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/links/DataProxyLink.js#L31)

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

[packages/cozy-client/src/links/DataProxyLink.js:40](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/links/DataProxyLink.js#L40)

***

### reset

▸ **reset**(): `Promise`<`void`>

Reset the link data

*Returns*

`Promise`<`void`>

*Overrides*

[CozyLink](CozyLink.md).[reset](CozyLink.md#reset)

*Defined in*

[packages/cozy-client/src/links/DataProxyLink.js:36](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/links/DataProxyLink.js#L36)
