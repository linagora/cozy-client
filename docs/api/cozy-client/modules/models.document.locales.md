[cozy-client](../README.md) / [models](models.md) / [document](models.document.md) / locales

# Namespace: locales

[models](models.md).[document](models.document.md).locales

## Functions

### getBoundT

▸ **getBoundT**(`lang`): (`label`: `string`, `opts?`: { `country?`: `string` ; `smart_count?`: `number`  }) => `string`

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `lang` | `string` | fr, en, etc |

*Returns*

`fn`

) => string}

▸ (`label`, `opts?`): `string`

*Parameters*

| Name | Type |
| :------ | :------ |
| `label` | `string` |
| `opts?` | `Object` |
| `opts.country?` | `string` |
| `opts.smart_count?` | `number` |

*Returns*

`string`

*Defined in*

[packages/cozy-client/src/models/document/locales/index.js:30](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/document/locales/index.js#L30)

***

### getLocalizer

▸ **getLocalizer**(`lang`): `Function`

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `lang` | `string` | fr, en, etc |

*Returns*

`Function`

*   localization function

*Defined in*

[packages/cozy-client/src/models/document/locales/index.js:54](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/document/locales/index.js#L54)
