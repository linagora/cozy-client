[cozy-client](../README.md) / [models](models.md) / trigger

# Namespace: trigger

[models](models.md).trigger

## Variables

### triggerStates

• `Const` **triggerStates**: `Object`

Trigger states come from /jobs/triggers

*Type declaration*

| Name | Type |
| :------ | :------ |
| `getLastErrorType` | (`trigger`: `IOCozyTrigger`) => `string` |
| `getLastExecution` | (`trigger`: `IOCozyTrigger`) => `string` |
| `getLastSuccess` | (`trigger`: `IOCozyTrigger`) => `string` |
| `getLastsuccess` | (`trigger`: `IOCozyTrigger`) => `string` |
| `isErrored` | (`trigger`: `IOCozyTrigger`) => `boolean` |

*Defined in*

[packages/cozy-client/src/models/trigger.js:17](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/trigger.js#L17)

***

### triggers

• `Const` **triggers**: `Object`

*Type declaration*

| Name | Type |
| :------ | :------ |
| `buildTriggerAttributes` | (`options`: { `account`: `IOCozyAccount` ; `cron`: `string` ; `folder`: `any` ; `konnector`: `IOCozyKonnector`  }) => `IOCozyTrigger` |
| `getAccountId` | (`trigger`: `IOCozyTrigger`) => `string` |
| `getKonnector` | (`trigger`: `IOCozyTrigger`) => `string` | `void` |
| `hasActionableError` | (`trigger`: `IOCozyTrigger`) => `boolean` |
| `isKonnector` | (`trigger`: `any`) => `boolean` |
| `isKonnectorWorker` | (`trigger`: `IOCozyTrigger`) => `boolean` |
| `isLatestErrorMuted` | (`trigger`: `IOCozyTrigger`, `account`: `IOCozyAccount`) => `boolean` |

*Defined in*

[packages/cozy-client/src/models/trigger.js:66](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/trigger.js#L66)
