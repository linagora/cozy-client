[cozy-client](../README.md) / [models](models.md) / applications

# Namespace: applications

[models](models.md).applications

## Interfaces

*   [Entrypoint](../interfaces/models.applications.Entrypoint.md)
*   [EntrypointCondition](../interfaces/models.applications.EntrypointCondition.md)
*   [EntrypointTitle](../interfaces/models.applications.EntrypointTitle.md)

## Functions

### checkEntrypointCondition

▸ **checkEntrypointCondition**(`entrypointCondition`): `boolean`

Checks if an entrypoint condition is satisfied

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `entrypointCondition` | [`EntrypointCondition`](../interfaces/models.applications.EntrypointCondition.md) | The condition to check |

*Returns*

`boolean`

True if the condition is satisfied

*Defined in*

[packages/cozy-client/src/models/applications.js:141](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/applications.js#L141)

***

### filterEntrypoints

▸ **filterEntrypoints**(`entrypoints`): [`Entrypoint`](../interfaces/models.applications.Entrypoint.md)\[]

Filters entrypoints based on whether they should be displayed

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `entrypoints` | [`Entrypoint`](../interfaces/models.applications.Entrypoint.md)\[] | Array of entrypoints |

*Returns*

[`Entrypoint`](../interfaces/models.applications.Entrypoint.md)\[]

Filtered array of entrypoints that should be displayed

*Defined in*

[packages/cozy-client/src/models/applications.js:178](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/applications.js#L178)

***

### getAppDisplayName

▸ **getAppDisplayName**(`app`, `lang`): `string`

getAppDisplayName - Combines the translated prefix and name of the app into a single string.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `app` | `any` | io.cozy.apps or io.cozy.konnectors document |
| `lang` | `string` | Locale to use |

*Returns*

`string`

Name of the app suitable for display

*Defined in*

[packages/cozy-client/src/models/applications.js:73](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/applications.js#L73)

***

### getStoreInstallationURL

▸ **getStoreInstallationURL**(`appData?`, `app?`): `string`

Returns the store URL to install/update an app/konnector

*Parameters*

| Name | Type | Default value |
| :------ | :------ | :------ |
| `appData` | `any`\[] | `[]` |
| `app` | `any` | `{}` |

*Returns*

`string`

URL as string

*Defined in*

[packages/cozy-client/src/models/applications.js:36](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/applications.js#L36)

***

### getStoreURL

▸ **getStoreURL**(`appData?`, `app?`): `string`

Returns the store URL of an app/konnector

*Parameters*

| Name | Type | Default value |
| :------ | :------ | :------ |
| `appData` | `any`\[] | `[]` |
| `app` | `any` | `{}` |

*Returns*

`string`

URL as string

*Defined in*

[packages/cozy-client/src/models/applications.js:13](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/applications.js#L13)

***

### getUrl

▸ **getUrl**(`app`): `string`

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `app` | `any` | io.cozy.apps document |

*Returns*

`string`

url to the app

*Defined in*

[packages/cozy-client/src/models/applications.js:61](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/applications.js#L61)

***

### isInstalled

▸ **isInstalled**(`apps?`, `wantedApp?`): `any`

*Parameters*

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `apps` | `any`\[] | `[]` | Array of apps returned by /apps /konnectors |
| `wantedApp` | `any` | `{}` | io.cozy.app with at least a slug |

*Returns*

`any`

The io.cozy.app is installed or undefined if not

*Defined in*

[packages/cozy-client/src/models/applications.js:52](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/applications.js#L52)

***

### selectEntrypoints

▸ **selectEntrypoints**(`entrypoints`, `names`): [`Entrypoint`](../interfaces/models.applications.Entrypoint.md)\[]

Selects entrypoints by their names

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `entrypoints` | [`Entrypoint`](../interfaces/models.applications.Entrypoint.md)\[] | Array of entrypoints |
| `names` | `string`\[] | Array of entrypoint names to select |

*Returns*

[`Entrypoint`](../interfaces/models.applications.Entrypoint.md)\[]

Filtered array of entrypoints

*Defined in*

[packages/cozy-client/src/models/applications.js:168](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/applications.js#L168)

***

### shouldDisplayEntrypoint

▸ **shouldDisplayEntrypoint**(`entrypoint`): `boolean`

Checks if an entrypoint should be displayed based on its conditions

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `entrypoint` | [`Entrypoint`](../interfaces/models.applications.Entrypoint.md) | The entrypoint to check |

*Returns*

`boolean`

True if all conditions are satisfied

*Defined in*

[packages/cozy-client/src/models/applications.js:155](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/applications.js#L155)

***

### sortApplicationsList

▸ **sortApplicationsList**(`apps`, `slugsOrder`): `any`\[]

sortApplicationsList - Sort the apps based on the slugs in parameters. Apps listed in the slugsOrder array will be added first
and will respect the order defined by slugsOrder and other apps will be added after.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `apps` | `any`\[] | io.cozy.apps array |
| `slugsOrder` | `string`\[] | slugs array |

*Returns*

`any`\[]

io.cozy.apps array

*Defined in*

[packages/cozy-client/src/models/applications.js:99](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/applications.js#L99)
