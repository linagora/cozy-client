[cozy-client](../README.md) / Query

# Class: Query

## Hierarchy

*   `Component`

    ↳ **`Query`**

## Constructors

### constructor

• **new Query**(`props`, `context`)

*Parameters*

| Name | Type |
| :------ | :------ |
| `props` | `any` |
| `context` | `any` |

*Overrides*

Component.constructor

*Defined in*

[packages/cozy-client/src/Query.jsx:93](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/Query.jsx#L93)

## Properties

### childrenArgs

• **childrenArgs**: `any`\[]

*Defined in*

[packages/cozy-client/src/Query.jsx:165](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/Query.jsx#L165)

***

### client

• **client**: [`CozyClient`](CozyClient.md)

Current client

*Defined in*

[packages/cozy-client/src/Query.jsx:107](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/Query.jsx#L107)

***

### observableQuery

• **observableQuery**: `default`

Observable query to connect store to query

*Defined in*

[packages/cozy-client/src/Query.jsx:113](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/Query.jsx#L113)

***

### queryUnsubscribe

• **queryUnsubscribe**: `Function`

Callback to unsubscribe from observable query

*Defined in*

[packages/cozy-client/src/Query.jsx:119](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/Query.jsx#L119)

***

### contextTypes

▪ `Static` **contextTypes**: `Object`

*Type declaration*

| Name | Type |
| :------ | :------ |
| `client` | `Requireable`<`object`> |
| `store` | `Requireable`<`object`> |

***

### defaultProps

▪ `Static` **defaultProps**: `Object`

*Type declaration*

| Name | Type |
| :------ | :------ |
| `enabled` | `boolean` |

***

### propTypes

▪ `Static` **propTypes**: `Object`

*Type declaration*

| Name | Type |
| :------ | :------ |
| `as` | `Requireable`<`string`> |
| `children` | `Validator`<(...`args`: `any`\[]) => `any`> |
| `enabled` | `Requireable`<`boolean`> |
| `fetchPolicy` | `Requireable`<(...`args`: `any`\[]) => `any`> |
| `query` | `Validator`<`object`> |

## Methods

### componentDidMount

▸ **componentDidMount**(): `void`

*Returns*

`void`

*Overrides*

Component.componentDidMount

*Defined in*

[packages/cozy-client/src/Query.jsx:125](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/Query.jsx#L125)

***

### componentDidUpdate

▸ **componentDidUpdate**(`prevProps`): `void`

*Parameters*

| Name | Type |
| :------ | :------ |
| `prevProps` | `any` |

*Returns*

`void`

*Overrides*

Component.componentDidUpdate

*Defined in*

[packages/cozy-client/src/Query.jsx:147](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/Query.jsx#L147)

***

### componentWillUnmount

▸ **componentWillUnmount**(): `void`

*Returns*

`void`

*Overrides*

Component.componentWillUnmount

*Defined in*

[packages/cozy-client/src/Query.jsx:153](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/Query.jsx#L153)

***

### executeQueryRespectingFetchPolicy

▸ **executeQueryRespectingFetchPolicy**(): `void`

*Returns*

`void`

*Defined in*

[packages/cozy-client/src/Query.jsx:132](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/Query.jsx#L132)

***

### onQueryChange

▸ **onQueryChange**(): `void`

*Returns*

`void`

*Defined in*

[packages/cozy-client/src/Query.jsx:159](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/Query.jsx#L159)

***

### recomputeChildrenArgs

▸ **recomputeChildrenArgs**(): `void`

*Returns*

`void`

*Defined in*

[packages/cozy-client/src/Query.jsx:164](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/Query.jsx#L164)

***

### render

▸ **render**(): `any`

*Returns*

`any`

*Overrides*

Component.render

*Defined in*

[packages/cozy-client/src/Query.jsx:168](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/Query.jsx#L168)
