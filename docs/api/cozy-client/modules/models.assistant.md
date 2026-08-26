[cozy-client](../README.md) / [models](models.md) / assistant

# Namespace: assistant

[models](models.md).assistant

## Interfaces

*   [Assistant](../interfaces/models.assistant.Assistant.md)

## Functions

### createAssistant

▸ **createAssistant**(`client`, `assistantData`): `Promise`<[`Assistant`](../interfaces/models.assistant.Assistant.md)>

Creates a new assistant with the provided data.

**`throws`** {Error} - Throws an error if the creation fails

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `client` | [`CozyClient`](../classes/CozyClient.md) | An instance of CozyClient |
| `assistantData` | [`Assistant`](../interfaces/models.assistant.Assistant.md) | Data for the new assistant |

*Returns*

`Promise`<[`Assistant`](../interfaces/models.assistant.Assistant.md)>

*   A promise that resolves with the created assistant document

*Defined in*

[packages/cozy-client/src/models/assistant.js:66](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/assistant.js#L66)

***

### deleteAssistant

▸ **deleteAssistant**(`client`, `assistantId`): `Promise`<`void`>

Deletes an assistant by its ID.

**`throws`** {Error} - Throws an error if the deletion fails

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `client` | [`CozyClient`](../classes/CozyClient.md) | An instance of CozyClient |
| `assistantId` | `string` | The ID of the assistant to delete |

*Returns*

`Promise`<`void`>

*   A promise that resolves when the assistant is deleted

*Defined in*

[packages/cozy-client/src/models/assistant.js:119](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/assistant.js#L119)

***

### editAssistant

▸ **editAssistant**(`client`, `assistantId`, `assistantData`): `Promise`<`void`>

Edit assistant with the provided data.

**`throws`** {Error} - Throws an error if the edition fails

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `client` | [`CozyClient`](../classes/CozyClient.md) | An instance of CozyClient |
| `assistantId` | `string` | ID of existed assistant |
| `assistantData` | [`Assistant`](../interfaces/models.assistant.Assistant.md) | Data for the editted assistant |

*Returns*

`Promise`<`void`>

*   A promise that resolves when the assistant is edited

*Defined in*

[packages/cozy-client/src/models/assistant.js:146](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/assistant.js#L146)
