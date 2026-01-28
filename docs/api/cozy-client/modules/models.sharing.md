[cozy-client](../README.md) / [models](models.md) / sharing

# Namespace: sharing

[models](models.md).sharing

## Functions

### makeSharingLink

▸ **makeSharingLink**(`client`, `filesIds`, `options?`): `Promise`<`string`>

Generate Sharing link for one or many files

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `client` | [`CozyClient`](../classes/CozyClient.md) | Instance of CozyClient |
| `filesIds` | `string`\[] | Array of io.cozy.files ids |
| `options` | `Object` | Options |
| `options.password` | `string` | - |
| `options.ttl` | `string` | - |
| `options.verbs` | `string`\[] | - |

*Returns*

`Promise`<`string`>

Shared link

*Defined in*

[packages/cozy-client/src/models/sharing.js:16](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/sharing.js#L16)
