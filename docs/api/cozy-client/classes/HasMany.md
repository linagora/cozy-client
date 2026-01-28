[cozy-client](../README.md) / HasMany

# Class: HasMany

Related documents are stored in the relationships attribute of the object,
following the JSON API spec.

Responsible for

*   Creating relationships
*   Removing relationships

**`description`**

    const schema = {
      todos: {
         doctype: 'io.cozy.todos',
         relationships: {
           tasks: {
             doctype: 'io.cozy.tasks',
             type: 'has-many'
           }
         }
       }
    }

    const todo = {
      label: "Protect people's privacy",
      relationships: {
        tasks: {
          data: [
            {_id: 1, _type: 'io.cozy.tasks'},
            {_id: 2, _type: 'io.cozy.tasks'}
          ]
        }
      }
    }

## Hierarchy

*   [`Association`](Association.md)

    ↳ **`HasMany`**

    ↳↳ [`HasManyTriggers`](HasManyTriggers.md)

## Constructors

### constructor

• **new HasMany**(`target`, `name`, `doctype`, `options`)

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

### count

• `get` **count**(): `number`

Returns the total number of documents in the relationship.
Does not handle documents absent from the store. If you want
to do that, you can use .data.length.

*Returns*

`number`

*   Total number of documents in the relationships

*Defined in*

[packages/cozy-client/src/associations/HasMany.js:93](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/associations/HasMany.js#L93)

***

### data

• `get` **data**(): `any`

Returns store documents

*Returns*

`any`

*Overrides*

Association.data

*Defined in*

[packages/cozy-client/src/associations/HasMany.js:76](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/associations/HasMany.js#L76)

***

### hasMore

• `get` **hasMore**(): `any`

*Returns*

`any`

*Defined in*

[packages/cozy-client/src/associations/HasMany.js:82](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/associations/HasMany.js#L82)

***

### raw

• `get` **raw**(): `any`

*Returns*

`any`

*Overrides*

Association.raw

*Defined in*

[packages/cozy-client/src/associations/HasMany.js:69](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/associations/HasMany.js#L69)

## Methods

### add

▸ **add**(`docsArg`): `CozyClientDocument`

Add the relationships to the target document

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `docsArg` | `CozyClientDocument`\[] | Documents to add as relationships |

*Returns*

`CozyClientDocument`

The saved target document

*Defined in*

[packages/cozy-client/src/associations/HasMany.js:124](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/associations/HasMany.js#L124)

***

### addById

▸ **addById**(`idsArg`): `any`

Add a referenced document by id. You need to call save()
in order to synchronize your document with the store.

**`todo`** We shouldn't create the array of relationship manually since
it'll not be present in the store as well.
We certainly should use something like `updateRelationship`

*Parameters*

| Name | Type |
| :------ | :------ |
| `idsArg` | `any` |

*Returns*

`any`

*Defined in*

[packages/cozy-client/src/associations/HasMany.js:174](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/associations/HasMany.js#L174)

***

### addTargetRelationships

▸ **addTargetRelationships**(`idsArg`): `void`

Update target document with relationships

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `idsArg` | `string`\[] | The ids to add as a relationship |

*Returns*

`void`

*Defined in*

[packages/cozy-client/src/associations/HasMany.js:147](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/associations/HasMany.js#L147)

***

### containsById

▸ **containsById**(`id`): `boolean`

*Parameters*

| Name | Type |
| :------ | :------ |
| `id` | `any` |

*Returns*

`boolean`

*Defined in*

[packages/cozy-client/src/associations/HasMany.js:108](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/associations/HasMany.js#L108)

***

### dehydrate

▸ **dehydrate**(`doc`): `any`

*Parameters*

| Name | Type |
| :------ | :------ |
| `doc` | `any` |

*Returns*

`any`

*Defined in*

[packages/cozy-client/src/associations/HasMany.js:256](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/associations/HasMany.js#L256)

***

### exists

▸ **exists**(`document`): `boolean`

*Parameters*

| Name | Type |
| :------ | :------ |
| `document` | `any` |

*Returns*

`boolean`

*Defined in*

[packages/cozy-client/src/associations/HasMany.js:104](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/associations/HasMany.js#L104)

***

### existsById

▸ **existsById**(`id`): `boolean`

*Parameters*

| Name | Type |
| :------ | :------ |
| `id` | `any` |

*Returns*

`boolean`

*Defined in*

[packages/cozy-client/src/associations/HasMany.js:114](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/associations/HasMany.js#L114)

***

### fetchMore

▸ **fetchMore**(): `void`

*Returns*

`void`

*Defined in*

[packages/cozy-client/src/associations/HasMany.js:100](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/associations/HasMany.js#L100)

***

### getRelationship

▸ **getRelationship**(): `any`

*Returns*

`any`

*Defined in*

[packages/cozy-client/src/associations/HasMany.js:207](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/associations/HasMany.js#L207)

***

### remove

▸ **remove**(`docsArg`): `CozyClientDocument`

Remove the relationships from the target document

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `docsArg` | `CozyClientDocument`\[] | Documents to remove as relationships |

*Returns*

`CozyClientDocument`

The saved target document

*Defined in*

[packages/cozy-client/src/associations/HasMany.js:136](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/associations/HasMany.js#L136)

***

### removeById

▸ **removeById**(`idsArg`): `any`

*Parameters*

| Name | Type |
| :------ | :------ |
| `idsArg` | `any` |

*Returns*

`any`

*Defined in*

[packages/cozy-client/src/associations/HasMany.js:193](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/associations/HasMany.js#L193)

***

### removeTargetRelationships

▸ **removeTargetRelationships**(`idsArg`): `void`

Remove relationships from target document

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `idsArg` | `string`\[] | The ids to remove from the target relationships |

*Returns*

`void`

*Defined in*

[packages/cozy-client/src/associations/HasMany.js:184](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/associations/HasMany.js#L184)

***

### updateMetaCount

▸ **updateMetaCount**(): `void`

*Returns*

`void`

*Defined in*

[packages/cozy-client/src/associations/HasMany.js:198](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/associations/HasMany.js#L198)

***

### updateRelationship

▸ **updateRelationship**(`target`, `updateFn`): `any`

*Parameters*

| Name | Type |
| :------ | :------ |
| `target` | `any` |
| `updateFn` | `any` |

*Returns*

`any`

*Defined in*

[packages/cozy-client/src/associations/HasMany.js:228](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/associations/HasMany.js#L228)

***

### updateRelationshipData

▸ **updateRelationshipData**(`getUpdatedRelationshipData`): (`dispatch`: `any`, `getState`: `any`) => `void`

*Parameters*

| Name | Type |
| :------ | :------ |
| `getUpdatedRelationshipData` | `any` |

*Returns*

`fn`

▸ (`dispatch`, `getState`): `void`

*Parameters*

| Name | Type |
| :------ | :------ |
| `dispatch` | `any` |
| `getState` | `any` |

*Returns*

`void`

*Defined in*

[packages/cozy-client/src/associations/HasMany.js:232](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/associations/HasMany.js#L232)

***

### updateTargetRelationship

▸ **updateTargetRelationship**(`store`, `updateFn`): `void`

*Parameters*

| Name | Type |
| :------ | :------ |
| `store` | `any` |
| `updateFn` | `any` |

*Returns*

`void`

*Defined in*

[packages/cozy-client/src/associations/HasMany.js:221](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/associations/HasMany.js#L221)

***

### getHasManyItem

▸ `Static` **getHasManyItem**(`doc`, `relName`, `relItemId`): `any`

*Parameters*

| Name | Type |
| :------ | :------ |
| `doc` | `any` |
| `relName` | `string` |
| `relItemId` | `string` |

*Returns*

`any`

*Defined in*

[packages/cozy-client/src/associations/HasMany.js:289](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/associations/HasMany.js#L289)

***

### getHasManyItems

▸ `Static` **getHasManyItems**(`doc`, `relName`): `any`

*Parameters*

| Name | Type |
| :------ | :------ |
| `doc` | `any` |
| `relName` | `any` |

*Returns*

`any`

*Defined in*

[packages/cozy-client/src/associations/HasMany.js:298](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/associations/HasMany.js#L298)

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

[packages/cozy-client/src/associations/HasMany.js:275](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/associations/HasMany.js#L275)

***

### removeHasManyItem

▸ `Static` **removeHasManyItem**(`doc`, `relName`, `relItemId`): `any`

*Parameters*

| Name | Type |
| :------ | :------ |
| `doc` | `any` |
| `relName` | `string` |
| `relItemId` | `string` |

*Returns*

`any`

*Defined in*

[packages/cozy-client/src/associations/HasMany.js:336](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/associations/HasMany.js#L336)

***

### setHasManyItem

▸ `Static` **setHasManyItem**(`doc`, `relName`, `relItemId`, `relItemAttrs`): `any`

*Parameters*

| Name | Type |
| :------ | :------ |
| `doc` | `any` |
| `relName` | `string` |
| `relItemId` | `string` |
| `relItemAttrs` | `any` |

*Returns*

`any`

*Defined in*

[packages/cozy-client/src/associations/HasMany.js:310](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/associations/HasMany.js#L310)

***

### updateHasManyItem

▸ `Static` **updateHasManyItem**(`doc`, `relName`, `relItemId`, `updater`): `any`

*Parameters*

| Name | Type |
| :------ | :------ |
| `doc` | `any` |
| `relName` | `string` |
| `relItemId` | `string` |
| `updater` | `Function` |

*Returns*

`any`

*Defined in*

[packages/cozy-client/src/associations/HasMany.js:360](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/associations/HasMany.js#L360)

***

### updateRelationship

▸ `Static` **updateRelationship**(`doc`, `relName`, `updateFn`): `any`

*Parameters*

| Name | Type |
| :------ | :------ |
| `doc` | `any` |
| `relName` | `any` |
| `updateFn` | `any` |

*Returns*

`any`

*Defined in*

[packages/cozy-client/src/associations/HasMany.js:371](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/associations/HasMany.js#L371)
