[cozy-client](../README.md) / [models](models.md) / instance

# Namespace: instance

[models](models.md).instance

## Interfaces

*   [DiskInfos](../interfaces/models.instance.DiskInfos.md)
*   [DiskInfosRaw](../interfaces/models.instance.DiskInfosRaw.md)
*   [SettingsInfo](../interfaces/models.instance.SettingsInfo.md)

## Type aliases

### ContextInfo

Ƭ **ContextInfo**<>: `object`

*Defined in*

[packages/cozy-client/src/models/instance.js:10](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/instance.js#L10)

***

### DiskUsageInfo

Ƭ **DiskUsageInfo**<>: `object`

*Defined in*

[packages/cozy-client/src/models/instance.js:11](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/instance.js#L11)

***

### InstanceInfo

Ƭ **InstanceInfo**<>: `object`

*Defined in*

[packages/cozy-client/src/models/instance.js:9](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/instance.js#L9)

## Functions

### arePremiumLinksEnabled

▸ **arePremiumLinksEnabled**(`instanceInfo`): `boolean`

*Parameters*

| Name | Type |
| :------ | :------ |
| `instanceInfo` | `any` |

*Returns*

`boolean`

*Defined in*

[packages/cozy-client/src/models/instance.js:25](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/instance.js#L25)

***

### buildPremiumLink

▸ **buildPremiumLink**(`instanceInfo`): `string`

Returns the link to the Premium page on the Cozy's Manager

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `instanceInfo` | `any` | Instance information |

*Returns*

`string`

*Defined in*

[packages/cozy-client/src/models/instance.js:70](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/instance.js#L70)

***

### getUuid

▸ **getUuid**(`instanceInfo`): `any`

*Parameters*

| Name | Type |
| :------ | :------ |
| `instanceInfo` | `any` |

*Returns*

`any`

*Defined in*

[packages/cozy-client/src/models/instance.js:32](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/instance.js#L32)

***

### hasAnOffer

▸ **hasAnOffer**(`data`): `boolean`

Returns if an instance has subscribed to one of our offers

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `data` | [`SettingsInfo`](../interfaces/models.instance.SettingsInfo.md) | Object containing all the results from /settings/\* |

*Returns*

`boolean`

Does the cozy have offers

*Defined in*

[packages/cozy-client/src/models/instance.js:56](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/instance.js#L56)

***

### hasPasswordDefinedAttribute

▸ **hasPasswordDefinedAttribute**(`client`): `Promise`<`boolean`>

Checks the value of the password_defined attribute

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `client` | [`CozyClient`](../classes/CozyClient.md) | The CozyClient instance |

*Returns*

`Promise`<`boolean`>

*   Returns the value of the password_defined attribute

*Defined in*

[packages/cozy-client/src/models/instance.js:87](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/instance.js#L87)

***

### isFreemiumUser

▸ **isFreemiumUser**(`instanceInfo`): `boolean`

*Parameters*

| Name | Type |
| :------ | :------ |
| `instanceInfo` | `any` |

*Returns*

`boolean`

*Defined in*

[packages/cozy-client/src/models/instance.js:28](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/instance.js#L28)

***

### isSelfHosted

▸ **isSelfHosted**(`instanceInfo`): `boolean`

**`property`** {ContextInfo} context - Object returned by /settings/context

**`property`** {InstanceInfo} instance - Object returned by /settings/instance

**`property`** {DiskUsageInfo} diskUsage - Object returned by /settings/disk-usage

*Parameters*

| Name | Type |
| :------ | :------ |
| `instanceInfo` | `any` |

*Returns*

`boolean`

*Defined in*

[packages/cozy-client/src/models/instance.js:22](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/instance.js#L22)

***

### makeDiskInfos

▸ **makeDiskInfos**(`usage`, `quota`): [`DiskInfos`](../interfaces/models.instance.DiskInfos.md)

Make human readable information from disk information (usage, quota)

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `usage` | `string` | `number` | Value in bytes representing the space used |
| `quota` | `string` | `number` | - |

*Returns*

[`DiskInfos`](../interfaces/models.instance.DiskInfos.md)

*   Return a set of human readable information about disk

*Defined in*

[packages/cozy-client/src/models/instance.js:157](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/instance.js#L157)

***

### shouldDisplayOffers

▸ **shouldDisplayOffers**(`data`): `boolean`

Returns whether an instance is concerned by our offers

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `data` | [`SettingsInfo`](../interfaces/models.instance.SettingsInfo.md) | Object containing all the results from /settings/\* |

*Returns*

`boolean`

Should we display offers

*Defined in*

[packages/cozy-client/src/models/instance.js:42](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/instance.js#L42)
