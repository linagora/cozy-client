[cozy-client](../README.md) / [models](models.md) / document

# Namespace: document

[models](models.md).document

## Namespaces

*   [helpers](models.document.helpers.md)
*   [locales](models.document.locales.md)
*   [themes](models.document.themes.md)

## Classes

*   [Qualification](../classes/models.document.Qualification.md)

## Functions

### getQualification

▸ **getQualification**(`document`): [`Qualification`](../classes/models.document.Qualification.md)

Helper to get the qualification from a document

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `document` | `any` | The document |

*Returns*

[`Qualification`](../classes/models.document.Qualification.md)

*   The document qualification

*Defined in*

[packages/cozy-client/src/models/document/qualification.js:288](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/document/qualification.js#L288)

***

### setQualification

▸ **setQualification**(`document`, `qualification`): `any`

Set the qualification to the document metadata

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `document` | `any` | The document to set the qualification |
| `qualification` | [`Qualification`](../classes/models.document.Qualification.md) | The qualification to set |

*Returns*

`any`

*   The qualified document

*Defined in*

[packages/cozy-client/src/models/document/qualification.js:264](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/document/qualification.js#L264)
