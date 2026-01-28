[cozy-client](../README.md) / [models](../modules/models.md) / [ai](../modules/models.ai.md) / ChatCompletionResponse

# Interface: ChatCompletionResponse<>

[models](../modules/models.md).[ai](../modules/models.ai.md).ChatCompletionResponse

## Properties

### choices

• **choices**: [`ChatCompletionChoice`](models.ai.ChatCompletionChoice.md)\[]

Array of completion choices

*Defined in*

[packages/cozy-client/src/models/ai.js:46](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/ai.js#L46)

***

### created

• **created**: `number`

Creation timestamp

*Defined in*

[packages/cozy-client/src/models/ai.js:42](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/ai.js#L42)

***

### extra

• **extra**: `string`

Extra data (e.g., sources)

*Defined in*

[packages/cozy-client/src/models/ai.js:50](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/ai.js#L50)

***

### id

• **id**: `string`

Completion ID

*Defined in*

[packages/cozy-client/src/models/ai.js:41](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/ai.js#L41)

***

### model

• **model**: `string`

Model used (may be null)

*Defined in*

[packages/cozy-client/src/models/ai.js:43](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/ai.js#L43)

***

### object

• **object**: `string`

Object type

*Defined in*

[packages/cozy-client/src/models/ai.js:44](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/ai.js#L44)

***

### prompt_logprobs

• **prompt_logprobs**: `any`

Prompt log probabilities

*Defined in*

[packages/cozy-client/src/models/ai.js:49](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/ai.js#L49)

***

### service_tier

• **service_tier**: `string`

Service tier

*Defined in*

[packages/cozy-client/src/models/ai.js:48](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/ai.js#L48)

***

### system_fingerprint

• **system_fingerprint**: `string`

System fingerprint

*Defined in*

[packages/cozy-client/src/models/ai.js:45](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/ai.js#L45)

***

### usage

• **usage**: [`ChatCompletionUsage`](models.ai.ChatCompletionUsage.md)

Token usage statistics

*Defined in*

[packages/cozy-client/src/models/ai.js:47](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/ai.js#L47)
