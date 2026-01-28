[cozy-client](../README.md) / [models](models.md) / utils

# Namespace: utils

[models](models.md).utils

## Functions

### getCreatedByApp

▸ **getCreatedByApp**(`doc`): `string`

Gets the app that created a document

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `doc` | `any` | The document to check |

*Returns*

`string`

*   The slug of the app that created the document

*Defined in*

[packages/cozy-client/src/models/utils.js:23](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/utils.js#L23)

***

### getFlagshipDownloadLink

▸ **getFlagshipDownloadLink**(`lang`): `string`

Gets the download link for the Cozy Flagship app and his white-labels versions

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `lang` | `string` | The language code for the download page |

*Returns*

`string`

*   The URL of the download page

*Defined in*

[packages/cozy-client/src/models/utils.js:31](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/utils.js#L31)

***

### hasBeenUpdatedByApp

▸ **hasBeenUpdatedByApp**(`doc`, `appSlug`): `boolean`

Checks if a document has been updated by a specific app

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `doc` | `any` | The document to check |
| `appSlug` | `string` | The slug of the app to check |

*Returns*

`boolean`

*   True if the document has been updated by the app, false otherwise

*Defined in*

[packages/cozy-client/src/models/utils.js:12](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/utils.js#L12)
