[cozy-client](../README.md) / [models](../modules/models.md) / [permission](../modules/models.permission.md) / PermissionItem

# Interface: PermissionItem<>

[models](../modules/models.md).[permission](../modules/models.permission.md).PermissionItem

## Properties

### selector

• **selector**: `string`

defaults to `id`

*Defined in*

[packages/cozy-client/src/models/permission.js:24](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/permission.js#L24)

***

### type

• **type**: `string`

a couch db database like 'io.cozy.files'

*Defined in*

[packages/cozy-client/src/models/permission.js:26](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/permission.js#L26)

***

### values

• **values**: `string`\[]

*Defined in*

[packages/cozy-client/src/models/permission.js:25](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/permission.js#L25)

***

### verbs

• **verbs**: [`PermissionVerb`](../modules/models.permission.md#permissionverb)\[]

ALL, GET, PUT, PATCH, DELETE, POST…

*Defined in*

[packages/cozy-client/src/models/permission.js:23](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/permission.js#L23)
