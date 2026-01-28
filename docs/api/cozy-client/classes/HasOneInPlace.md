[cozy-client](../README.md) / HasOneInPlace

# Class: HasOneInPlace

Here the id of the document is directly set in the attribute
of the document, not in the relationships attribute

## Hierarchy

*   [`Association`](Association.md)

    ↳ **`HasOneInPlace`**

## Constructors

### constructor

• **new HasOneInPlace**(`target`, `name`, `doctype`, `options`)

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | `any` | Original object containing raw data |
| `name` | `string` | Attribute under which the association is stored |
| `doctype` | `string` | Doctype of the documents managed by the association |
| `options` | `Object` | Options passed from the client |
| `options.dispatch` | `Function` | Store's dispatch, comes from the client |
| `options.get` | `Function` | Get a document from the store |
| `options.mutate` | `Function` | Execute client mutate |
| `options.query` | `Function` | Execute client query |
| `options.save` | `Function` | Execute client save |

*Inherited from*

[Association](Association.md).[constructor](Association.md#constructor)

*Defined in*

[packages/cozy-client/src/associations/Association.js:87](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/associations/Association.js#L87)

## Properties

### dispatch

• **dispatch**: `Function`

Dispatch an action on the store.

*Inherited from*

[Association](Association.md).[dispatch](Association.md#dispatch)

*Defined in*

[packages/cozy-client/src/associations/Association.js:144](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/associations/Association.js#L144)

***

### doctype

• **doctype**: `string`

Doctype of the relationship

**`example`** 'io.cozy.authors'

*Inherited from*

[Association](Association.md).[doctype](Association.md#doctype)

*Defined in*

[packages/cozy-client/src/associations/Association.js:109](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/associations/Association.js#L109)

***

### get

• **get**: `Function`

Returns the document from the store

*Inherited from*

[Association](Association.md).[get](Association.md#get)

*Defined in*

[packages/cozy-client/src/associations/Association.js:116](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/associations/Association.js#L116)

***

### mutate

• **mutate**: `Function`

Performs a mutation on the relationship.

**`function`**

*Inherited from*

[Association](Association.md).[mutate](Association.md#mutate)

*Defined in*

[packages/cozy-client/src/associations/Association.js:131](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/associations/Association.js#L131)

***

### name

• **name**: `string`

The name of the relationship.

**`example`** 'author'

*Inherited from*

[Association](Association.md).[name](Association.md#name)

*Defined in*

[packages/cozy-client/src/associations/Association.js:101](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/associations/Association.js#L101)

***

### query

• **query**: `Function`

Performs a query to retrieve relationship documents.

**`param`**

**`function`**

*Inherited from*

[Association](Association.md).[query](Association.md#query)

*Defined in*

[packages/cozy-client/src/associations/Association.js:124](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/associations/Association.js#L124)

***

### save

• **save**: `Function`

Saves the relationship in store.

*Inherited from*

[Association](Association.md).[save](Association.md#save)

*Defined in*

[packages/cozy-client/src/associations/Association.js:138](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/associations/Association.js#L138)

***

### target

• **target**: `any`

The original document declaring the relationship

*Inherited from*

[Association](Association.md).[target](Association.md#target)

*Defined in*

[packages/cozy-client/src/associations/Association.js:94](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/associations/Association.js#L94)

## Accessors

### data

• `get` **data**(): `any`

*Returns*

`any`

*Overrides*

Association.data

*Defined in*

[packages/cozy-client/src/associations/HasOneInPlace.js:13](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/associations/HasOneInPlace.js#L13)

***

### raw

• `get` **raw**(): `any`

*Returns*

`any`

*Overrides*

Association.raw

*Defined in*

[packages/cozy-client/src/associations/HasOneInPlace.js:9](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/associations/HasOneInPlace.js#L9)

## Methods

### dehydrate

▸ **dehydrate**(`doc`): `any`

*Parameters*

| Name | Type |
| :------ | :------ |
| `doc` | `any` |

*Returns*

`any`

*Defined in*

[packages/cozy-client/src/associations/HasOneInPlace.js:32](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/associations/HasOneInPlace.js#L32)

***

### query

▸ `Static` **query**(`document`, `client`, `assoc`): `CozyClientDocument` | [`QueryDefinition`](QueryDefinition.md)

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `document` | `CozyClientDocument` | Document to query |
| `client` | `any` | The CozyClient instance |
| `assoc` | [`Association`](Association.md) | The query params |

*Returns*

`CozyClientDocument` | [`QueryDefinition`](QueryDefinition.md)

*Overrides*

[Association](Association.md).[query](Association.md#query)

*Defined in*

[packages/cozy-client/src/associations/HasOneInPlace.js:24](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/associations/HasOneInPlace.js#L24)
