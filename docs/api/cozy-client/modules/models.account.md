[cozy-client](../README.md) / [models](models.md) / account

# Namespace: account

[models](models.md).account

## Functions

### buildAccount

▸ **buildAccount**(`konnector`, `authData`): `IOCozyAccount`

Transforms account auth data to io.cozy.accounts document

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `konnector` | `IOCozyKonnector` | Konnector related to account |
| `authData` | `any` | Authentication data |

*Returns*

`IOCozyAccount`

io.cozy.accounts attributes

*Defined in*

[packages/cozy-client/src/models/account.js:113](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/account.js#L113)

***

### getAccountLogin

▸ **getAccountLogin**(`account`): `string`

Get the account login field value from a given account

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `account` | `IOCozyAccount` | the given cozy account |

*Returns*

`string`

*   Account login

*Defined in*

[packages/cozy-client/src/models/account.js:79](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/account.js#L79)

***

### getAccountName

▸ **getAccountName**(`account`): `string`

Get the account name from a given account

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `account` | `IOCozyAccount` | the given cozy account |

*Returns*

`string`

*   Account name

*Defined in*

[packages/cozy-client/src/models/account.js:97](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/account.js#L97)

***

### getContractSyncStatusFromAccount

▸ **getContractSyncStatusFromAccount**(`account`, `contractId`): `boolean`

Returns whether a contract is synced from account relationship

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `account` | `IOCozyAccount` | Cozy account |
| `contractId` | `string` | contract identifier |

*Returns*

`boolean`

synchronisation status

*Defined in*

[packages/cozy-client/src/models/account.js:44](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/account.js#L44)

***

### getMutedErrors

▸ **getMutedErrors**(`account`): `any`\[]

getMutedErrors - Returns the list of errors that have been muted for the given account

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `account` | `IOCozyAccount` | io.cozy.accounts |

*Returns*

`any`\[]

An array of errors with a `type` and `mutedAt` field

*Defined in*

[packages/cozy-client/src/models/account.js:15](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/account.js#L15)

***

### isAccountWithTrigger

▸ **isAccountWithTrigger**(`client`, `account`): `Promise`<`boolean`>

Look if the given account has an associated trigger or not.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `client` | [`CozyClient`](../classes/CozyClient.md) | CozyClient instance |
| `account` | `IOCozyAccount` | account document |

*Returns*

`Promise`<`boolean`>

*Defined in*

[packages/cozy-client/src/models/account.js:129](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/account.js#L129)

***

### muteError

▸ **muteError**(`account`, `errorType`): `IOCozyAccount`

muteError - Adds an error to the list of muted errors for the given account

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `account` | `IOCozyAccount` | io.cozy.accounts |
| `errorType` | `string` | The type of the error to mute |

*Returns*

`IOCozyAccount`

An updated io.cozy.accounts

*Defined in*

[packages/cozy-client/src/models/account.js:25](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/account.js#L25)

***

### setContractSyncStatusInAccount

▸ **setContractSyncStatusInAccount**(`account`, `contractId`, `syncStatus`): `IOCozyAccount`

Sets contract sync status into account relationship

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `account` | `IOCozyAccount` | Cozy account |
| `contractId` | `string` | contract identifier |
| `syncStatus` | `string` | synchronisation status |

*Returns*

`IOCozyAccount`

*Defined in*

[packages/cozy-client/src/models/account.js:60](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/account.js#L60)
