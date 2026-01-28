[cozy-client](../README.md) / [models](models.md) / ai

# Namespace: ai

[models](models.md).ai

## Interfaces

*   [ChatCompletionChoice](../interfaces/models.ai.ChatCompletionChoice.md)
*   [ChatCompletionMessage](../interfaces/models.ai.ChatCompletionMessage.md)
*   [ChatCompletionOptions](../interfaces/models.ai.ChatCompletionOptions.md)
*   [ChatCompletionResponse](../interfaces/models.ai.ChatCompletionResponse.md)
*   [ChatCompletionUsage](../interfaces/models.ai.ChatCompletionUsage.md)
*   [ChatMessage](../interfaces/models.ai.ChatMessage.md)
*   [FileMetadata](../interfaces/models.ai.FileMetadata.md)

## Functions

### chatCompletion

▸ **chatCompletion**(`client`, `messages`, `options?`): `Promise`<[`ChatCompletionResponse`](../interfaces/models.ai.ChatCompletionResponse.md)>

Generate AI chat completion

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `client` | [`CozyClient`](../classes/CozyClient.md) | Instance of CozyClient |
| `messages` | [`ChatMessage`](../interfaces/models.ai.ChatMessage.md)\[] | Array of message objects with role and content |
| `options` | [`ChatCompletionOptions`](../interfaces/models.ai.ChatCompletionOptions.md) | - |

*Returns*

`Promise`<[`ChatCompletionResponse`](../interfaces/models.ai.ChatCompletionResponse.md)>

AI response following OpenAI chat completion format

*Defined in*

[packages/cozy-client/src/models/ai.js:112](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/ai.js#L112)

***

### extractText

▸ **extractText**(`client`, `fileBlob`, `fileMetadata`): `Promise`<`string`>

Extract text from a file using AI tools

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `client` | [`CozyClient`](../classes/CozyClient.md) | Instance of CozyClient |
| `fileBlob` | `Blob` | File content as Blob |
| `fileMetadata` | [`FileMetadata`](../interfaces/models.ai.FileMetadata.md) | File metadata (name, mime) |

*Returns*

`Promise`<`string`>

Extracted text content

*Defined in*

[packages/cozy-client/src/models/ai.js:72](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/ai.js#L72)
