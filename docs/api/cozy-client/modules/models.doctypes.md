[cozy-client](../README.md) / [models](models.md) / doctypes

# Namespace: doctypes

[models](models.md).doctypes

## Functions

### listAllDoctypes

▸ **listAllDoctypes**(`client`): `Promise`<`string`\[]>

Fetches the list of all doctypes in the current instance.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `client` | [`CozyClient`](../classes/CozyClient.md) | The CozyClient instance used to make the request. |

*Returns*

`Promise`<`string`\[]>

*   A promise that resolves to an array of strings, each representing a doctype.

*Defined in*

[packages/cozy-client/src/models/doctypes/index.js:11](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/doctypes/index.js#L11)
