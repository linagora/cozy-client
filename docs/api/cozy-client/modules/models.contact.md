[cozy-client](../README.md) / [models](models.md) / contact

# Namespace: contact

[models](models.md).contact

## Type aliases

### FullnameAttributes

Ƭ **FullnameAttributes**<>: `"namePrefix"` | `"givenName"` | `"additionalName"` | `"familyName"` | `"nameSuffix"`

*Defined in*

[packages/cozy-client/src/models/contact.js:9](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/contact.js#L9)

## Variables

### CONTACTS_DOCTYPE

• `Const` **CONTACTS_DOCTYPE**: `"io.cozy.contacts"`

*Defined in*

[packages/cozy-client/src/models/contact.js:6](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/contact.js#L6)

## Functions

### cleanFormattedAddress

▸ **cleanFormattedAddress**(`formattedAddress`): `string`

Removed unwanted characters on contact's formatted address

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `formattedAddress` | `string` | The contact's formatted address |

*Returns*

`string`

*Defined in*

[packages/cozy-client/src/models/contact.js:257](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/contact.js#L257)

***

### getDefaultSortIndexValue

▸ **getDefaultSortIndexValue**(`contact`): `string`

Returns 'byFamilyNameGivenNameEmailCozyUrl' index of a contact

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `contact` | `IOCozyContact` | A contact |

*Returns*

`string`

*   the contact's 'byFamilyNameGivenNameEmailCozyUrl' index

*Defined in*

[packages/cozy-client/src/models/contact.js:214](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/contact.js#L214)

***

### getDisplayName

▸ **getDisplayName**(`contact`): `string`

Returns a display name for the contact

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `contact` | `IOCozyContact` | A contact |

*Returns*

`string`

*   the contact's display name

*Defined in*

[packages/cozy-client/src/models/contact.js:176](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/contact.js#L176)

***

### getFormattedAddress

▸ **getFormattedAddress**(`address`, `t`): `string`

Returns the contact's formatted address

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `address` | `any` | A contact address |
| `t` | `Function` | Translate function |

*Returns*

`string`

*   The contact's formatted address

*Defined in*

[packages/cozy-client/src/models/contact.js:292](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/contact.js#L292)

***

### getFullname

▸ **getFullname**(`contact`): `string`

Returns the contact's fullname

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `contact` | `IOCozyContact` | A contact |

*Returns*

`string`

*   The contact's fullname

*Defined in*

[packages/cozy-client/src/models/contact.js:137](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/contact.js#L137)

***

### getIndexByFamilyNameGivenNameEmailCozyUrl

▸ **getIndexByFamilyNameGivenNameEmailCozyUrl**(`contact`): `string`

Returns 'byFamilyNameGivenNameEmailCozyUrl' index of a contact

**`deprecated`** Prefer to use getDefaultSortIndexValue.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `contact` | `IOCozyContact` | A contact |

*Returns*

`string`

*   the contact's 'byFamilyNameGivenNameEmailCozyUrl' index

*Defined in*

[packages/cozy-client/src/models/contact.js:235](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/contact.js#L235)

***

### getInitials

▸ **getInitials**(`contact`): `string`

Returns the initials of the contact.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `contact` | `IOCozyContact` | A contact |

*Returns*

`string`

*   the contact's initials

*Defined in*

[packages/cozy-client/src/models/contact.js:23](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/contact.js#L23)

***

### getPrimaryAddress

▸ **getPrimaryAddress**(`contact`): `string`

Returns the contact's main address

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `contact` | `IOCozyContact` | A contact |

*Returns*

`string`

*   The contact's main address

*Defined in*

[packages/cozy-client/src/models/contact.js:96](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/contact.js#L96)

***

### getPrimaryCozy

▸ **getPrimaryCozy**(`contact`): `string`

Returns the contact's main cozy

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `contact` | `IOCozyContact` | A contact |

*Returns*

`string`

*   The contact's main cozy

*Defined in*

[packages/cozy-client/src/models/contact.js:61](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/contact.js#L61)

***

### getPrimaryCozyDomain

▸ **getPrimaryCozyDomain**(`contact`): `string`

Returns the contact's main cozy url without protocol

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `contact` | `IOCozyContact` | A contact |

*Returns*

`string`

*   The contact's main cozy url

*Defined in*

[packages/cozy-client/src/models/contact.js:72](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/contact.js#L72)

***

### getPrimaryEmail

▸ **getPrimaryEmail**(`contact`): `string`

Returns the contact's main email

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `contact` | `IOCozyContact` | A contact |

*Returns*

`string`

*   The contact's main email

*Defined in*

[packages/cozy-client/src/models/contact.js:50](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/contact.js#L50)

***

### getPrimaryOrFirst

▸ **getPrimaryOrFirst**(`property`): (`obj`: `any`) => `any`

*Parameters*

| Name | Type |
| :------ | :------ |
| `property` | `any` |

*Returns*

`fn`

▸ (`obj`): `any`

*Parameters*

| Name | Type |
| :------ | :------ |
| `obj` | `any` |

*Returns*

`any`

*Defined in*

[packages/cozy-client/src/models/contact.js:12](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/contact.js#L12)

***

### getPrimaryPhone

▸ **getPrimaryPhone**(`contact`): `string`

Returns the contact's main phone number

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `contact` | `IOCozyContact` | A contact |

*Returns*

`string`

*   The contact's main phone number

*Defined in*

[packages/cozy-client/src/models/contact.js:87](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/contact.js#L87)

***

### isContact

▸ **isContact**(`doc`): `boolean`

Whether the document is a contact

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `doc` | `any` | A document (from io.cozy.something, or com.bitwarden or anything else) |

*Returns*

`boolean`

*Defined in*

[packages/cozy-client/src/models/contact.js:249](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/contact.js#L249)

***

### makeDefaultSortIndexValue

▸ **makeDefaultSortIndexValue**(`contact`): `string`

Makes 'byFamilyNameGivenNameEmailCozyUrl' index of a contact

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `contact` | `IOCozyContact` | A contact |

*Returns*

`string`

*   the contact's 'byFamilyNameGivenNameEmailCozyUrl' index

*Defined in*

[packages/cozy-client/src/models/contact.js:190](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/contact.js#L190)

***

### makeDisplayName

▸ **makeDisplayName**(`contact`, `opts`): `string`

Makes displayName from contact data

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `contact` | `IOCozyContact` | A contact |
| `opts` | `Object` | - |
| `opts.attributesFullname` | [`FullnameAttributes`](models.contact.md#fullnameattributes)\[] | - |

*Returns*

`string`

*   The contact's displayName

*Defined in*

[packages/cozy-client/src/models/contact.js:152](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/contact.js#L152)

***

### makeFullname

▸ **makeFullname**(`contact`, `opts`): `string`

Makes fullname from contact name

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `contact` | `IOCozyContact` | A contact |
| `opts` | `Object` | - |
| `opts.attributesFullname` | [`FullnameAttributes`](models.contact.md#fullnameattributes)\[] | - |

*Returns*

`string`

*   The contact's fullname

*Defined in*

[packages/cozy-client/src/models/contact.js:117](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/contact.js#L117)

***

### updateIndexFullNameAndDisplayName

▸ **updateIndexFullNameAndDisplayName**(`contact`): `any`

Update fullname, displayName and Index values of a contact

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `contact` | `any` | an io.cozy.contact document |

*Returns*

`any`

an io.cozy.contact document

*Defined in*

[packages/cozy-client/src/models/contact.js:315](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/contact.js#L315)
