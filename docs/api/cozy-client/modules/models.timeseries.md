[cozy-client](../README.md) / [models](models.md) / timeseries

# Namespace: timeseries

[models](models.md).timeseries

## Interfaces

*   [TimeSeries](../interfaces/models.timeseries.TimeSeries.md)
*   [TimeSeriesJSONAPI](../interfaces/models.timeseries.TimeSeriesJSONAPI.md)

## Functions

### fetchTimeSeriesByIntervalAndSource

▸ **fetchTimeSeriesByIntervalAndSource**(`client`, `params`): `Promise`<[`TimeSeriesJSONAPI`](../interfaces/models.timeseries.TimeSeriesJSONAPI.md)>

Helper to retrieve time series by their date interval and source.

**`property`** data {Array<TimeSeries>} - The JSON-API data response

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `client` | `any` | The CozyClient instance |
| `params` | `Object` | The query params |
| `params.dataType` | `string` | The type of time series, e.g. 'electricity' |
| `params.endDate` | `Date` | The end date of the series |
| `params.limit` | `number` | Number of serie items to retrieve |
| `params.source` | `string` | The data source, e.g. 'enedis.fr' |
| `params.startDate` | `Date` | The starting date of the series |

*Returns*

`Promise`<[`TimeSeriesJSONAPI`](../interfaces/models.timeseries.TimeSeriesJSONAPI.md)>

The TimeSeries found by the query in JSON-API format

*Defined in*

[packages/cozy-client/src/models/timeseries.js:77](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/timeseries.js#L77)

***

### saveTimeSeries

▸ **saveTimeSeries**(`client`, `timeseriesOption`): `Promise`<`any`>

Helper to save a time series document.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `client` | `any` | The CozyClient instance |
| `timeseriesOption` | [`TimeSeries`](../interfaces/models.timeseries.TimeSeries.md) | The time series to save |

*Returns*

`Promise`<`any`>

*Defined in*

[packages/cozy-client/src/models/timeseries.js:39](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/timeseries.js#L39)
