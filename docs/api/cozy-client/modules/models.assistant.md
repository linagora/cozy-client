[cozy-client](../README.md) / [models](models.md) / assistant

# Namespace: assistant

[models](models.md).assistant

## Functions

### createAssistant

▸ **createAssistant**(`client`, `assistantData`): `Promise`<`void`>

Creates a new assistant with the provided data.

**`throws`** {Error} - Throws an error if the creation fails

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `client` | [`CozyClient`](../classes/CozyClient.md) | An instance of CozyClient |
| `assistantData` | `Object` | Data for the new assistant |
| `assistantData.apiKey` | `string` | API key for authentication |
| `assistantData.baseUrl` | `string` | Provider's base URL |
| `assistantData.icon` | `string` | - |
| `assistantData.isCustomModel` | `boolean` | Indicates if it's a custom model |
| `assistantData.model` | `string` | Model identifier |
| `assistantData.name` | `string` | Name of the assistant |
| `assistantData.prompt` | `string` | Prompt for the assistant |

*Returns*

`Promise`<`void`>

*   A promise that resolves when the assistant is created

*Defined in*

[packages/cozy-client/src/models/assistant.js:20](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/assistant.js#L20)

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

[packages/cozy-client/src/models/assistant.js:79](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/assistant.js#L79)

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
| `assistantData` | `Object` | Data for the new assistant |
| `assistantData.apiKey` | `string` | - |
| `assistantData.baseUrl` | `string` | Provider's base URL |
| `assistantData.icon` | `string` | - |
| `assistantData.isCustomModel` | `boolean` | Indicates if it's a custom model |
| `assistantData.model` | `string` | Model identifier |
| `assistantData.name` | `string` | Name of the assistant |
| `assistantData.prompt` | `string` | Prompt for the assistant |

*Returns*

`Promise`<`void`>

*   A promise that resolves when the assistant is edited

*Defined in*

[packages/cozy-client/src/models/assistant.js:120](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/assistant.js#L120)
