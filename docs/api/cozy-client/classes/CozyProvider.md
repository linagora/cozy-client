[cozy-client](../README.md) / CozyProvider

# Class: CozyProvider

## Hierarchy

*   `Component`

    ↳ **`CozyProvider`**

## Constructors

### constructor

• **new CozyProvider**(`props`, `context`)

*Parameters*

| Name | Type |
| :------ | :------ |
| `props` | `any` |
| `context` | `any` |

*Overrides*

Component.constructor

*Defined in*

[packages/cozy-client/src/Provider.jsx:21](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/Provider.jsx#L21)

## Properties

### childContextTypes

▪ `Static` **childContextTypes**: `Object`

*Type declaration*

| Name | Type |
| :------ | :------ |
| `client` | `Validator`<`object`> |
| `store` | `Requireable`<`object`> |

*Defined in*

[packages/cozy-client/src/Provider.jsx:31](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/Provider.jsx#L31)

***

### contextTypes

▪ `Static` **contextTypes**: `Object`

*Type declaration*

| Name | Type |
| :------ | :------ |
| `store` | `Requireable`<`object`> |

*Defined in*

[packages/cozy-client/src/Provider.jsx:36](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/Provider.jsx#L36)

***

### propTypes

▪ `Static` **propTypes**: `Object`

*Type declaration*

| Name | Type |
| :------ | :------ |
| `children` | `Validator`<`ReactElementLike` | `ReactElementLike`\[]> |
| `client` | `Validator`<`object`> |
| `store` | `Requireable`<`InferProps`<{ `dispatch`: `Validator`<(...`args`: `any`\[]) => `any`> = PropTypes.func.isRequired; `getState`: `Validator`<(...`args`: `any`\[]) => `any`> = PropTypes.func.isRequired; `subscribe`: `Validator`<(...`args`: `any`\[]) => `any`> = PropTypes.func.isRequired }>> |

*Defined in*

[packages/cozy-client/src/Provider.jsx:12](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/Provider.jsx#L12)

## Methods

### getChildContext

▸ **getChildContext**(): `Object`

*Returns*

`Object`

| Name | Type |
| :------ | :------ |
| `client` | `any` |
| `store` | `any` |

*Defined in*

[packages/cozy-client/src/Provider.jsx:40](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/Provider.jsx#L40)

***

### render

▸ **render**(): `Element`

*Returns*

`Element`

*Overrides*

Component.render

*Defined in*

[packages/cozy-client/src/Provider.jsx:47](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/Provider.jsx#L47)
