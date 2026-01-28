[cozy-client](../README.md) / Association

# Class: Association

Associations are used by components to access related store documents that are
linked in a document. They are also responsible for building the `QueryDefinition` that is
used by the client to automatically fetch relationship data.

Hydrated documents used by components come with Association instances.

**`interface`**

**`description`**
Example: The schema defines an `author` relationship :

```js
const BOOK_SCHEMA = {
  relationships: {
     author: 'has-one'
  }
}
```

Hydrated `books` will have the `author` association instance under the `author` key.
Accessing `hydratedBook.author.data` gives you the author from the store, for example :

```json
{
  "name": "St-Exupery",
  "firstName": "Antoine",
  "_id": "antoine"
}
```

It is the responsibility of the relationship to decide how the relationship data is stored.
For example, here since we use the default `has-one` relationship, the relationship data
is stored in the `relationships` attribute of the original document (in our case here, our book
would be

```json
{
  "title": "Le petit prince",
  "relationships": {
    "author": {
      "data": {
        "doctype": "io.cozy.authors",
        "_id": "antoine"
      }
    }
  }
}
```

In the case of an "in-place" relationship, the relationship data is stored directly under the attribute named
by the relationship (in our case `author`). Our book would be

```json
{
    "title": "Le petit prince",
    "author": "antoine"
}
```

***

Each different type of Association may change:

*   `get raw`: how the relationship data is stored (either as per the JSON API spec or
    in a custom way)
*   `get data`: how the store documents are then fetched from the store to be added to
    the hydrated document (.data method). View components will access
    `hydratedDoc[relationshipName].data`.
*   `get query`: how to build the query to fetch related documents

## Hierarchy

*   **`Association`**

    ↳ [`HasMany`](HasMany.md)

    ↳ [`HasOne`](HasOne.md)

    ↳ [`HasOneInPlace`](HasOneInPlace.md)

    ↳ [`HasManyInPlace`](HasManyInPlace.md)

## Constructors

### constructor

• **new Association**(`target`, `name`, `doctype`, `options`)

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

*Defined in*

[packages/cozy-client/src/associations/Association.js:87](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/associations/Association.js#L87)

## Properties

### dispatch

• **dispatch**: `Function`

Dispatch an action on the store.

*Defined in*

[packages/cozy-client/src/associations/Association.js:144](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/associations/Association.js#L144)

***

### doctype

• **doctype**: `string`

Doctype of the relationship

**`example`** 'io.cozy.authors'

*Defined in*

[packages/cozy-client/src/associations/Association.js:109](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/associations/Association.js#L109)

***

### get

• **get**: `Function`

Returns the document from the store

*Defined in*

[packages/cozy-client/src/associations/Association.js:116](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/associations/Association.js#L116)

***

### mutate

• **mutate**: `Function`

Performs a mutation on the relationship.

**`function`**

*Defined in*

[packages/cozy-client/src/associations/Association.js:131](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/associations/Association.js#L131)

***

### name

• **name**: `string`

The name of the relationship.

**`example`** 'author'

*Defined in*

[packages/cozy-client/src/associations/Association.js:101](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/associations/Association.js#L101)

***

### query

• **query**: `Function`

Performs a query to retrieve relationship documents.

**`param`**

**`function`**

*Defined in*

[packages/cozy-client/src/associations/Association.js:124](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/associations/Association.js#L124)

***

### save

• **save**: `Function`

Saves the relationship in store.

*Defined in*

[packages/cozy-client/src/associations/Association.js:138](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/associations/Association.js#L138)

***

### target

• **target**: `any`

The original document declaring the relationship

*Defined in*

[packages/cozy-client/src/associations/Association.js:94](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/associations/Association.js#L94)

## Accessors

### data

• `get` **data**(): `any`

Returns the document(s) from the store

For document with relationships stored as JSON API spec :

```js
const book = {
  title: 'Moby Dick',
  relationships: {
    author: {
      data: {
        doctype: 'io.cozy.authors',
        id: 'herman'
      }
    }
  }
 }
```

`data` will be

```json
{
  "_id": "herman"
  "_type": "io.cozy.authors",
  "firstName": "herman",
  "name": "Melville"
}
```

Derived `Association`s need to implement this method.

*Returns*

`any`

*Defined in*

[packages/cozy-client/src/associations/Association.js:218](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/associations/Association.js#L218)

***

### raw

• `get` **raw**(): `any`

Returns the raw relationship data as stored in the original document

For a document with relationships stored as JSON API spec:

```js
const book = {
  title: 'Moby Dick',
  relationships: {
    author: {
      data: {
        doctype: 'io.cozy.authors',
        id: 'herman'
      }
    }
  }
 }
```

Raw value will be

```json
{
  "doctype": "io.cozy.authors",
  "id": "herman"
}
```

Derived `Association`s need to implement this method.

*Returns*

`any`

*Defined in*

[packages/cozy-client/src/associations/Association.js:180](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/associations/Association.js#L180)

## Methods

### query

▸ `Static` **query**(`document`, `client`, `assoc`): `CozyClientDocument` | [`QueryDefinition`](QueryDefinition.md)

Derived `Association`s need to implement this method.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `document` | `CozyClientDocument` | Document to query |
| `client` | `any` | The CozyClient instance |
| `assoc` | [`Association`](Association.md) | Association containing info on how to build the query to fetch related documents |

*Returns*

`CozyClientDocument` | [`QueryDefinition`](QueryDefinition.md)

*Defined in*

[packages/cozy-client/src/associations/Association.js:231](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/associations/Association.js#L231)
