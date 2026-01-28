[cozy-client](../README.md) / [models](models.md) / file

# Namespace: file

[models](models.md).file

## Interfaces

*   [FileUploadOptions](../interfaces/models.file.FileUploadOptions.md)

## Variables

### ALBUMS_DOCTYPE

• `Const` **ALBUMS_DOCTYPE**: `"io.cozy.photos.albums"`

*Defined in*

[packages/cozy-client/src/models/file.js:16](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/file.js#L16)

## Functions

### copy

▸ **copy**(`client`, `file`, `destination`, `[params]?`): `Promise`<`any`>

Copies a file to a specified destination.

**`throws`** {Error} - If an error occurs during the API request.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `client` | `any` | The client object used for making API requests. |
| `file` | `any` | The file object to be copied. |
| `destination` | `any` | The destination object where the file will be copied to. |
| `[params]` | `Object` | Parameters |
| `[params].driveId` | `string` | - |

*Returns*

`Promise`<`any`>

*   A promise that resolves with the response from the API.

*Defined in*

[packages/cozy-client/src/models/file.js:737](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/file.js#L737)

***

### downloadFile

▸ **downloadFile**(`params`): `Promise`<`any`>

Download the requested file

This method can be used in a web page context or in a WebView hosted by a Flagship app

When used in a FlagshipApp WebView context, then the action is redirected to the host app
that will process the download

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `params` | `Object` | The download parameters |
| `params.client` | [`CozyClient`](../classes/CozyClient.md) | Instance of CozyClient |
| `params.driveId` | `string` | - |
| `params.file` | `IOCozyFile` | io.cozy.files metadata of the document to downloaded |
| `params.url` | `string` | - |
| `params.webviewIntent` | `WebviewService` | - |

*Returns*

`Promise`<`any`>

*Defined in*

[packages/cozy-client/src/models/file.js:792](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/file.js#L792)

***

### ensureFilePath

▸ **ensureFilePath**(`file`, `parent`): `any`

Ensure the file has a `path` attribute, or build it

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `file` | `any` | object representing the file |
| `parent` | `any` | parent directory for the file |

*Returns*

`any`

file object with path attribute

*Defined in*

[packages/cozy-client/src/models/file.js:201](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/file.js#L201)

***

### fetchBlobFileById

▸ **fetchBlobFileById**(`client`, `fileId`, `[params]?`): `Promise`<`Blob`>

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `client` | [`CozyClient`](../classes/CozyClient.md) | Instance of CozyClient |
| `fileId` | `string` | Id of io.cozy.files document |
| `[params]` | `Object` | Parameters |
| `[params].driveId` | `string` | - |

*Returns*

`Promise`<`Blob`>

*Defined in*

[packages/cozy-client/src/models/file.js:718](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/file.js#L718)

***

### fetchFilesByQualificationRules

▸ **fetchFilesByQualificationRules**(`client`, `docRules`): `Promise`<`any`>

Helper to query files based on qualification rules

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `client` | `any` | The CozyClient instance |
| `docRules` | `any` | the rules containing the searched qualification and the count |

*Returns*

`Promise`<`any`>

The files found by the rules

*Defined in*

[packages/cozy-client/src/models/file.js:328](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/file.js#L328)

***

### generateFileNameForRevision

▸ **generateFileNameForRevision**(`file`, `revision`, `f`): `string`

Generate a file name for a revision

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `file` | `IOCozyFile` | io.cozy.files document |
| `revision` | `any` | The revision containing the updated_at |
| `f` | `Function` | A function taking a a date and a format as arguments to generate the name. |

*Returns*

`string`

*Defined in*

[packages/cozy-client/src/models/file.js:604](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/file.js#L604)

***

### generateNewFileNameOnConflict

▸ **generateNewFileNameOnConflict**(`filenameWithoutExtension`, `conflictOptions`): `string`

Method to generate a new filename if there is a conflict

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `filenameWithoutExtension` | `string` | A filename without the extension |
| `conflictOptions` | `ConflictOptions` | - |

*Returns*

`string`

A filename with the right suffix

*Defined in*

[packages/cozy-client/src/models/file.js:574](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/file.js#L574)

***

### getEncryptiondRef

▸ **getEncryptiondRef**(`dir`): `boolean`

Returns folder encryption reference

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `dir` | `IOCozyFile` | io.cozy.files document |

*Returns*

`boolean`

*Defined in*

[packages/cozy-client/src/models/file.js:96](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/file.js#L96)

***

### getFullpath

▸ **getFullpath**(`client`, `dirId`, `name`, `driveId?`): `Promise`<`string`>

async getFullpath - Gets a file's path

*Parameters*

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `client` | [`CozyClient`](../classes/CozyClient.md) | `undefined` | The CozyClient instance |
| `dirId` | `string` | `undefined` | The id of the parent directory |
| `name` | `string` | `undefined` | The file's name |
| `driveId` | `any` | `undefined` | - |

*Returns*

`Promise`<`string`>

The full path of the file in the cozy

*Defined in*

[packages/cozy-client/src/models/file.js:363](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/file.js#L363)

***

### getParentFolderId

▸ **getParentFolderId**(`file`): `string`

Get the id of the parent folder (`null` for the root folder)

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `file` | `any` | io.cozy.files document |

*Returns*

`string`

id of the parent folder, if any

*Defined in*

[packages/cozy-client/src/models/file.js:215](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/file.js#L215)

***

### getSharingShortcutStatus

▸ **getSharingShortcutStatus**(`file`): `string`

Returns the status of a sharing shortcut.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `file` | `IOCozyFile` | io.cozy.files document |

*Returns*

`string`

A description of the status

*Defined in*

[packages/cozy-client/src/models/file.js:227](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/file.js#L227)

***

### getSharingShortcutTargetDoctype

▸ **getSharingShortcutTargetDoctype**(`file`): `string`

Returns the doctype of the target of the sharing shortcut.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `file` | `IOCozyFile` | io.cozy.files document |

*Returns*

`string`

A doctype

*Defined in*

[packages/cozy-client/src/models/file.js:247](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/file.js#L247)

***

### getSharingShortcutTargetMime

▸ **getSharingShortcutTargetMime**(`file`): `string`

Returns the mime type of the target of the sharing shortcut, if it is a file.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `file` | `IOCozyFile` | io.cozy.files document |

*Returns*

`string`

The mime-type of the target file, or an empty string is the target is not a file.

*Defined in*

[packages/cozy-client/src/models/file.js:237](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/file.js#L237)

***

### getShortcutImgSrc

▸ **getShortcutImgSrc**(`file`): `string`

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `file` | `IOCozyFile` | io.cozy.files document |

*Returns*

`string`

image src that can be used in an <img> tag

*Defined in*

[packages/cozy-client/src/models/file.js:161](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/file.js#L161)

***

### hasCertifications

▸ **hasCertifications**(`file`): `boolean`

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `file` | `IOCozyFile` | io.cozy.files document |

*Returns*

`boolean`

*Defined in*

[packages/cozy-client/src/models/file.js:696](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/file.js#L696)

***

### hasMetadataAttribute

▸ **hasMetadataAttribute**(`params`): `boolean`

Whether the file's metadata attribute exists

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `params` | `Object` | Param |
| `params.attribute` | `string` | Metadata attribute to check |
| `params.file` | `IOCozyFile` | An io.cozy.files document |

*Returns*

`boolean`

*Defined in*

[packages/cozy-client/src/models/file.js:352](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/file.js#L352)

***

### hasQualifications

▸ **hasQualifications**(`file`): `boolean`

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `file` | `IOCozyFile` | io.cozy.files document |

*Returns*

`boolean`

*Defined in*

[packages/cozy-client/src/models/file.js:688](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/file.js#L688)

***

### isDirectory

▸ **isDirectory**(`file`): `boolean`

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `file` | `IOCozyFile` | io.cozy.files |

*Returns*

`boolean`

*Defined in*

[packages/cozy-client/src/models/file.js:48](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/file.js#L48)

***

### isDocs

▸ **isDocs**(`file`): `boolean`

Is the given file a Docs note

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `file` | `IOCozyFile` | The io.cozy.files |

*Returns*

`boolean`

*Defined in*

[packages/cozy-client/src/models/file.js:76](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/file.js#L76)

***

### isEncrypted

▸ **isEncrypted**(`file`): `boolean`

Whether the file is client-side encrypted

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `file` | `IOCozyFile` | io.cozy.files document |

*Returns*

`boolean`

*Defined in*

[packages/cozy-client/src/models/file.js:86](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/file.js#L86)

***

### isEncryptedFileOrFolder

▸ **isEncryptedFileOrFolder**(`fileOrdir`): `boolean`

Whether the file or folder is client-side encrypted

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `fileOrdir` | `IOCozyFile` | io.cozy.files document |

*Returns*

`boolean`

*Defined in*

[packages/cozy-client/src/models/file.js:117](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/file.js#L117)

***

### isEncryptedFolder

▸ **isEncryptedFolder**(`dir`): `boolean`

Whether the folder is client-side encrypted

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `dir` | `IOCozyFile` | io.cozy.files document |

*Returns*

`boolean`

*Defined in*

[packages/cozy-client/src/models/file.js:107](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/file.js#L107)

***

### isFile

▸ **isFile**(`file`): `boolean`

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `file` | `IOCozyFile` | io.cozy.files |

*Returns*

`boolean`

*Defined in*

[packages/cozy-client/src/models/file.js:42](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/file.js#L42)

***

### isFromKonnector

▸ **isFromKonnector**(`file`): `boolean`

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `file` | `IOCozyFile` | io.cozy.files document |

*Returns*

`boolean`

*Defined in*

[packages/cozy-client/src/models/file.js:707](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/file.js#L707)

***

### isNote

▸ **isNote**(`file`): `boolean`

Is file param a correct note

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `file` | `IOCozyFile` | io.cozy.files |

*Returns*

`boolean`

*Defined in*

[packages/cozy-client/src/models/file.js:56](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/file.js#L56)

***

### isOnlyOfficeFile

▸ **isOnlyOfficeFile**(`file`): `boolean`

Whether the file is supported by Only Office

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `file` | `IOCozyFile` | io.cozy.file document |

*Returns*

`boolean`

*Defined in*

[packages/cozy-client/src/models/file.js:127](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/file.js#L127)

***

### isPlainText

▸ **isPlainText**(`mimeType?`, `fileName?`): `boolean`

*Parameters*

| Name | Type | Default value |
| :------ | :------ | :------ |
| `mimeType` | `string` | `''` |
| `fileName` | `string` | `''` |

*Returns*

`boolean`

*Defined in*

[packages/cozy-client/src/models/file.js:680](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/file.js#L680)

***

### isSharingShorcut

▸ **isSharingShorcut**(`file`): `boolean`

Returns whether the file is a shortcut to a sharing

**`deprecated`** Prefer to use isSharingShortcut.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `file` | `IOCozyFile` | io.cozy.files document |

*Returns*

`boolean`

*Defined in*

[packages/cozy-client/src/models/file.js:267](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/file.js#L267)

***

### isSharingShorcutNew

▸ **isSharingShorcutNew**(`file`): `boolean`

Returns whether the sharing shortcut is new

**`deprecated`** Prefer to use isSharingShortcutNew.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `file` | `any` | io.cozy.files document |

*Returns*

`boolean`

*Defined in*

[packages/cozy-client/src/models/file.js:292](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/file.js#L292)

***

### isSharingShortcut

▸ **isSharingShortcut**(`file`): `boolean`

Returns whether the file is a shortcut to a sharing

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `file` | `IOCozyFile` | io.cozy.files document |

*Returns*

`boolean`

*Defined in*

[packages/cozy-client/src/models/file.js:257](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/file.js#L257)

***

### isSharingShortcutNew

▸ **isSharingShortcutNew**(`file`): `boolean`

Returns whether the sharing shortcut is new

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `file` | `IOCozyFile` | io.cozy.files document |

*Returns*

`boolean`

*Defined in*

[packages/cozy-client/src/models/file.js:281](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/file.js#L281)

***

### isShortcut

▸ **isShortcut**(`file`): `boolean`

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `file` | `IOCozyFile` | io.cozy.files document |

*Returns*

`boolean`

true if the file is a shortcut

*Defined in*

[packages/cozy-client/src/models/file.js:152](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/file.js#L152)

***

### move

▸ **move**(`client`, `file`, `destination`, `[options]?`): `Promise`<{ `deleted`: `string`\[] ; `moved`: `IOCozyFile`  }>

Move file to destination.
Manage 4 cases :

*   Move inside a Cozy server
*   Move inside a Nextcloud server
*   Move from a Nextcloud server to Cozy
*   Move from Cozy to a Nextcloud server

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `client` | [`CozyClient`](../classes/CozyClient.md) | The CozyClient instance |
| `file` | `IOCozyFile` | `NextcloudFile` | The file to move (required) |
| `destination` | `NextcloudFile` | `IOCozyFolder` | The destination folder (required) |
| `[options]` | `Object` | The options |
| `[options].driveId` | `string` | - |
| `[options].force` | `boolean` | - |

*Returns*

`Promise`<{ `deleted`: `string`\[] ; `moved`: `IOCozyFile`  }>

> } - A promise that returns the move action response (if any)
> and the deleted file id (if any) if resolved or an Error if rejected

*Defined in*

[packages/cozy-client/src/models/file.js:398](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/file.js#L398)

***

### moveRelateToSharedDrive

▸ **moveRelateToSharedDrive**(`client`, `source`, `dest`, `isCopy`): `Promise`<{ `deleted`: `string`\[] ; `moved`: `IOCozyFile`  }>

Move or copy a file or a directory between locations (personal drive and/or shared drives).
Manage 3 cases :

*   From a shared drive to another shared drive (same stack or cross-stack)
*   From a shared drive to a personal drive
*   From a personal drive to a shared drive

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `client` | [`CozyClient`](../classes/CozyClient.md) | The CozyClient instance. |
| `source` | `Object` | The source file/folder to move/copy (required) At least one side (source or destination) must be a shared drive. |
| `source.dir_id` | `string` | - |
| `source.file_id` | `string` | - |
| `source.instance` | `string` | - |
| `source.sharing_id` | `string` | - |
| `dest` | `Object` | The destination folder (required) |
| `dest.dir_id` | `string` | destination directory id (required) |
| `dest.instance` | `string` | - |
| `dest.sharing_id` | `string` | - |
| `isCopy` | `boolean` | controls whether the operation is a move (default) or copy. When `copy: false` (default): The source file/directory is moved to the destination and deleted from the source. When `copy: true`: The source file/directory is copied to the destination but remains in the source location. |

*Returns*

`Promise`<{ `deleted`: `string`\[] ; `moved`: `IOCozyFile`  }>

> } - A promise that returns the move/copy action response (if any)

*Defined in*

[packages/cozy-client/src/models/file.js:504](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/file.js#L504)

***

### normalize

▸ **normalize**(`file`): `any`

Normalizes an object representing a io.cozy.files object

Ensures existence of `_id` and `_type`

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `file` | `any` | object representing the file |

*Returns*

`any`

full normalized object

*Defined in*

[packages/cozy-client/src/models/file.js:187](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/file.js#L187)

***

### overrideFileForPath

▸ **overrideFileForPath**(`client`, `dirPath`, `file`, `metadata`, `[params]?`): `Promise`<`IOCozyFile`>

Method to upload a file even if a file with the same name already exists.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `client` | [`CozyClient`](../classes/CozyClient.md) | The CozyClient instance |
| `dirPath` | `string` | Fullpath of directory to upload to ex: path/to/ |
| `file` | `any` | HTML Object file |
| `metadata` | `any` | An object containing the wanted metadata to attach |
| `[params]` | `Object` | Parameters |
| `[params].driveId` | `string` | - |

*Returns*

`Promise`<`IOCozyFile`>

The overrided file

*Defined in*

[packages/cozy-client/src/models/file.js:534](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/file.js#L534)

***

### saveFileQualification

▸ **saveFileQualification**(`client`, `file`, `qualification`, `[params]?`): `Promise`<`IOCozyFile`>

Save the file with the given qualification

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `client` | [`CozyClient`](../classes/CozyClient.md) | The CozyClient instance |
| `file` | `IOCozyFile` | The file to qualify |
| `qualification` | `any` | The file qualification |
| `[params]` | `Object` | Parameters |
| `[params].driveId` | `string` | - |

*Returns*

`Promise`<`IOCozyFile`>

The saved file

*Defined in*

[packages/cozy-client/src/models/file.js:309](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/file.js#L309)

***

### shouldBeOpenedByOnlyOffice

▸ **shouldBeOpenedByOnlyOffice**(`file`): `boolean`

Whether the file should be opened by only office
We want to be consistent with the stack so we check the class attributes
But we want to exclude .txt and .md because the CozyUI Viewer can already show them

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `file` | `IOCozyFile` | io.cozy.file document |

*Returns*

`boolean`

*Defined in*

[packages/cozy-client/src/models/file.js:142](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/file.js#L142)

***

### splitFilename

▸ **splitFilename**(`file`): `Object`

Returns base filename and extension

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `file` | `IOCozyFile` | An io.cozy.files |

*Returns*

`Object`

| Name | Type |
| :------ | :------ |
| `extension` | `string` |
| `filename` | `string` |

*Defined in*

[packages/cozy-client/src/models/file.js:26](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/file.js#L26)

***

### uploadFileWithConflictStrategy

▸ **uploadFileWithConflictStrategy**(`client`, `file`, `options`): `any`

The goal of this method is to upload a file based on a conflict strategy.
Be careful: We need to check if the file exists by doing a statByPath query
before trying to upload the file since if we post and the stack return a
409 conflict, we will get a SPDY_ERROR_PROTOCOL on Chrome. This is the only
viable workaround
If there is no conflict, then we upload the file.
If there is a conflict, then we apply the conflict strategy : `erase` or `rename`:

*   The `erase` strategy means an upload with a new version
*   The `rename` strategy means a new upload with a new name

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `client` | [`CozyClient`](../classes/CozyClient.md) | The CozyClient instance |
| `file` | `string` | `ArrayBuffer` | Can be the file path (file://) or the binary itself |
| `options` | [`FileUploadOptions`](../interfaces/models.file.FileUploadOptions.md) | The upload options |

*Returns*

`any`

*Defined in*

[packages/cozy-client/src/models/file.js:638](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/file.js#L638)
