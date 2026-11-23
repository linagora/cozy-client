[cozy-client](../README.md) / Registry

# Class: Registry

## Constructors

### constructor

• **new Registry**(`options`)

*Parameters*

| Name | Type |
| :------ | :------ |
| `options` | `any` |

*Defined in*

[packages/cozy-client/src/registry.js:41](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/registry.js#L41)

## Properties

### client

• **client**: `any`

*Defined in*

[packages/cozy-client/src/registry.js:45](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/registry.js#L45)

## Methods

### fetchApp

▸ **fetchApp**(`slug`): `Promise`<`RegistryApp`>

Fetch the status of a single app on the registry

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `slug` | `string` | The slug of the app to fetch |

*Returns*

`Promise`<`RegistryApp`>

*Defined in*

[packages/cozy-client/src/registry.js:133](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/registry.js#L133)

***

### fetchAppVersion

▸ **fetchAppVersion**(`params`): `Promise`<`RegistryApp`>

Fetch the latest version of an app for the given channel and slug

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `params` | `Object` | Fetching parameters |
| `params.channel` | `RegistryAppChannel` | The channel of the app to fetch |
| `params.slug` | `string` | The slug of the app to fetch |
| `params.version` | `string` | The version of the app to fetch. Can also be "latest" |

*Returns*

`Promise`<`RegistryApp`>

*Defined in*

[packages/cozy-client/src/registry.js:147](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/registry.js#L147)

***

### fetchApps

▸ **fetchApps**(`params`): `Promise`<`RegistryApp`\[]>

Fetch at most 200 apps from the channel

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `params` | `Object` | Fetching parameters |
| `params.channel` | `RegistryAppChannel` | The channel of the apps to fetch |
| `params.limit` | `string` | maximum number of fetched apps - defaults to 200 |
| `params.type` | `string` | "webapp" or "konnector" |

*Returns*

`Promise`<`RegistryApp`\[]>

*Defined in*

[packages/cozy-client/src/registry.js:97](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/registry.js#L97)

***

### fetchAppsInMaintenance

▸ **fetchAppsInMaintenance**(): `Promise`<`RegistryApp`\[]>

Fetch the list of apps that are in maintenance mode

*Returns*

`Promise`<`RegistryApp`\[]>

*Defined in*

[packages/cozy-client/src/registry.js:122](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/registry.js#L122)

***

### installApp

▸ **installApp**(`app`, `source`): `Promise`<`any`>

Installs or updates an app from a source.

Accepts the terms if the app has them.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `app` | `RegistryApp` | App to be installed |
| `source` | `string` | String (ex: registry://drive/stable) |

*Returns*

`Promise`<`any`>

*Defined in*

[packages/cozy-client/src/registry.js:57](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/registry.js#L57)

***

### uninstallApp

▸ **uninstallApp**(`app`): `Promise`<`any`>

Uninstalls an app.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `app` | `RegistryApp` | App to be installed |

*Returns*

`Promise`<`any`>

*Defined in*

[packages/cozy-client/src/registry.js:81](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/registry.js#L81)
