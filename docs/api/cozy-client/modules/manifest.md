[cozy-client](../README.md) / manifest

# Namespace: manifest

## Variables

### ROLE_IDENTIFIER

• `Const` **ROLE_IDENTIFIER**: `"identifier"`

*Defined in*

[packages/cozy-client/src/models/manifest.js:6](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/manifest.js#L6)

***

### legacyLoginFields

• `Const` **legacyLoginFields**: `string`\[]

Legacy login fields declared by some konnectors

*Defined in*

[packages/cozy-client/src/models/manifest.js:11](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/manifest.js#L11)

## Functions

### areTermsValid

▸ **areTermsValid**(`terms`): `boolean`

*Parameters*

| Name | Type |
| :------ | :------ |
| `terms` | `any` |

*Returns*

`boolean`

*Defined in*

[packages/cozy-client/src/models/manifest.js:63](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/manifest.js#L63)

***

### getIdentifier

▸ **getIdentifier**(`fields?`): `string`

Returns the key for the field having the role=identifier attribute

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `fields` | `ManifestFields` | Konnector fields |

*Returns*

`string`

The key for the identifier field, example 'login'

*Defined in*

[packages/cozy-client/src/models/manifest.js:161](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/manifest.js#L161)

***

### isPartnershipValid

▸ **isPartnershipValid**(`partnership`): `boolean`

*Parameters*

| Name | Type |
| :------ | :------ |
| `partnership` | `any` |

*Returns*

`boolean`

*Defined in*

[packages/cozy-client/src/models/manifest.js:67](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/manifest.js#L67)

***

### sanitize

▸ **sanitize**(`manifest`): `any`

Normalize app manifest, retro-compatibility for old manifests

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `manifest` | `any` | app manifest to normalize |

*Returns*

`any`

*Defined in*

[packages/cozy-client/src/models/manifest.js:77](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/manifest.js#L77)

***

### sanitizeCategories

▸ **sanitizeCategories**(`categories`): `any`\[]

Filters unauthorized categories. Defaults to \['others'] if no suitable category.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `categories` | `any`\[] | Array of categories |

*Returns*

`any`\[]

sanitized categories

*Defined in*

[packages/cozy-client/src/models/manifest.js:56](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/manifest.js#L56)

***

### sanitizeIdentifier

▸ **sanitizeIdentifier**(`fields`): `ManifestFields`

Ensures that fields has at least one field with the role 'identifier'

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `fields` | `ManifestFields` | Manifest fields |

*Returns*

`ManifestFields`

*   Sanitized manifest fields

*Defined in*

[packages/cozy-client/src/models/manifest.js:130](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/manifest.js#L130)
