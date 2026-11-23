[cozy-client](../README.md) / [models](models.md) / permission

# Namespace: permission

[models](models.md).permission

## Interfaces

*   [Document](../interfaces/models.permission.Document.md)
*   [Permission](../interfaces/models.permission.Permission.md)
*   [PermissionItem](../interfaces/models.permission.PermissionItem.md)

## Type aliases

### PermissionVerb

Ƭ **PermissionVerb**<>: `"ALL"` | `"GET"` | `"PATCH"` | `"POST"` | `"PUT"` | `"DELETE"`

*Defined in*

[packages/cozy-client/src/models/permission.js:19](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/permission.js#L19)

## Functions

### fetchOwn

▸ **fetchOwn**(`client`): `Promise`<[`PermissionItem`](../interfaces/models.permission.PermissionItem.md)\[]>

Fetches the list of permissions blocks

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `client` | [`CozyClient`](../classes/CozyClient.md) | - |

*Returns*

`Promise`<[`PermissionItem`](../interfaces/models.permission.PermissionItem.md)\[]>

list of permissions

*Defined in*

[packages/cozy-client/src/models/permission.js:54](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/permission.js#L54)

***

### isDocumentReadOnly

▸ **isDocumentReadOnly**(`args`): `Promise`<`boolean`>

*Parameters*

| Name | Type |
| :------ | :------ |
| `args` | `any` |

*Returns*

`Promise`<`boolean`>

*Defined in*

[packages/cozy-client/src/models/permission.js:130](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/permission.js#L130)

***

### isForType

▸ **isForType**(`permission`, `type`): `boolean`

Checks if the permission item is about a specific doctype

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `permission` | [`PermissionItem`](../interfaces/models.permission.PermissionItem.md) | - |
| `type` | `string` | doctype |

*Returns*

`boolean`

*Defined in*

[packages/cozy-client/src/models/permission.js:68](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/permission.js#L68)

***

### isShortcutCreatedOnTheRecipientCozy

▸ **isShortcutCreatedOnTheRecipientCozy**(`permission`): `boolean`

When a cozy to cozy sharing is created Cozy's stack creates a
shortcut in `/Inbox of sharing` on the recipient's cozy to have a
quick access even when the sharing is not accepted yet.

However, this file is created only if the stack knows the URL of the cozy.
This is not always the case.

This method is here to tell us if the shortcut's file is created
on the recipient's cozy. It can be used to make an UI distinction between the
both situation.

**`property`** {object} data Permission document

**`property`** {Array} included Member information from the sharing

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `permission` | [`Permission`](../interfaces/models.permission.Permission.md) | From getOwnPermissions mainly |

*Returns*

`boolean`

*Defined in*

[packages/cozy-client/src/models/permission.js:168](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/permission.js#L168)
