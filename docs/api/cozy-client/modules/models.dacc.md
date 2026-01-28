[cozy-client](../README.md) / [models](models.md) / dacc

# Namespace: dacc

[models](models.md).dacc

## Interfaces

*   [Params](../interfaces/models.dacc.Params.md)

## Functions

### buildAggregateParams

▸ **buildAggregateParams**(`params`): `DACCAggregatesParams`

Build parameters to request DACC aggregate

**`property`** {string} \[measureName] - The measure name

**`property`** {string} \[startDate]   - The measure start date

**`property`** {string} \[endDate]     - The measure end date

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `params` | [`Params`](../interfaces/models.dacc.Params.md) | The unformatted DACC aggregate params |

*Returns*

`DACCAggregatesParams`

*Defined in*

[packages/cozy-client/src/models/dacc.js:102](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/dacc.js#L102)

***

### checkMeasureParams

▸ **checkMeasureParams**(`measure`): `void`

Throw an errror if a DACC parameter is incorrect.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `measure` | `DACCMeasure` | The DACC measure |

*Returns*

`void`

*Defined in*

[packages/cozy-client/src/models/dacc.js:24](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/dacc.js#L24)

***

### fetchAggregatesFromDACC

▸ **fetchAggregatesFromDACC**(`client`, `remoteDoctype`, `params`): `Promise`<`DACCAggregatesResponse`>

Send measures to a DACC through a remote doctype

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `client` | [`CozyClient`](../classes/CozyClient.md) | The CozyClient instance |
| `remoteDoctype` | `string` | The remote doctype to use |
| `params` | `DACCAggregatesParams` | The request params |

*Returns*

`Promise`<`DACCAggregatesResponse`>

*Defined in*

[packages/cozy-client/src/models/dacc.js:127](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/dacc.js#L127)

***

### isCorrectDateFormat

▸ **isCorrectDateFormat**(`date`): `boolean`

Check whether or not the given date is in YYYY-MM-DD format

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `date` | `string` | The date to check |

*Returns*

`boolean`

*Defined in*

[packages/cozy-client/src/models/dacc.js:10](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/dacc.js#L10)

***

### sendMeasureToDACC

▸ **sendMeasureToDACC**(`client`, `remoteDoctype`, `measure`): `Promise`<`void`>

Send measures to a DACC through a remote doctype

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `client` | [`CozyClient`](../classes/CozyClient.md) | The CozyClient instance |
| `remoteDoctype` | `string` | The remote doctype to use |
| `measure` | `DACCMeasure` | The DACC measure |

*Returns*

`Promise`<`void`>

*Defined in*

[packages/cozy-client/src/models/dacc.js:71](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/dacc.js#L71)
