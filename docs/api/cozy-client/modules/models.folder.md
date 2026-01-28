[cozy-client](../README.md) / [models](models.md) / folder

# Namespace: folder

[models](models.md).folder

## Variables

### MAGIC_FOLDERS

• `Const` **MAGIC_FOLDERS**: `Object`

*Type declaration*

| Name | Type |
| :------ | :------ |
| `ADMINISTRATIVE` | `string` |
| `COACH_CO2` | `string` |
| `HOME` | `string` |
| `NOTES` | `string` |
| `PAPERS` | `string` |
| `PHOTOS` | `string` |
| `PHOTOS_BACKUP` | `string` |
| `PHOTOS_UPLOAD` | `string` |

*Defined in*

[packages/cozy-client/src/models/folder.js:11](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/folder.js#L11)

## Functions

### createFolderWithReference

▸ **createFolderWithReference**(`client`, `path`, `document`): `Promise`<`IOCozyFolder`>

Create a folder with a reference to the given document

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `client` | [`CozyClient`](../classes/CozyClient.md) | cozy-client instance |
| `path` | `string` | Folder path |
| `document` | `CozyClientDocument` | Document to make reference to. Any doctype. |

*Returns*

`Promise`<`IOCozyFolder`>

Folder document

*Defined in*

[packages/cozy-client/src/models/folder.js:71](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/folder.js#L71)

***

### ensureMagicFolder

▸ **ensureMagicFolder**(`client`, `id`, `path`): `Promise`<`IOCozyFolder`>

Returns a "Magic Folder", given its id. See https://docs.cozy.io/en/cozy-doctypes/docs/io.cozy.apps/#special-iocozyapps-doctypes

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `client` | [`CozyClient`](../classes/CozyClient.md) | cozy-client instance |
| `id` | `string` | Magic Folder id. `CozyFolder.magicFolders` contains the ids of folders that can be magic folders. |
| `path` | `string` | Default path to use if magic folder does not exist |

*Returns*

`Promise`<`IOCozyFolder`>

Folder document

*Defined in*

[packages/cozy-client/src/models/folder.js:31](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/folder.js#L31)

***

### getReferencedFolder

▸ **getReferencedFolder**(`client`, `document`): `Promise`<`IOCozyFolder`>

Returns the most recent folder referenced by the given document

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `client` | [`CozyClient`](../classes/CozyClient.md) | cozy-client instance |
| `document` | `CozyClientDocument` | Document to get references from |

*Returns*

`Promise`<`IOCozyFolder`>

Folder referenced by the given document

*Defined in*

[packages/cozy-client/src/models/folder.js:92](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/folder.js#L92)
