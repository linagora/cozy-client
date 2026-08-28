[cozy-client](../README.md) / [models](../modules/models.md) / [banner](../modules/models.banner.md) / Banner

# Interface: Banner<>

[models](../modules/models.md).[banner](../modules/models.banner.md).Banner

An io.cozy.banners document

## Properties

### \_id

• **\_id**: `string`

Identifier of the document

*Defined in*

[packages/cozy-client/src/models/banner.js:16](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/banner.js#L16)

***

### bannerId

• **bannerId**: `string`

Identifier of the banner itself

*Defined in*

[packages/cozy-client/src/models/banner.js:17](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/banner.js#L17)

***

### category

• **category**: `string`

What the banner is about

*Defined in*

[packages/cozy-client/src/models/banner.js:18](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/banner.js#L18)

***

### cta

• **cta**: [`BannerCta`](models.banner.BannerCta.md)

Optional call to action

*Defined in*

[packages/cozy-client/src/models/banner.js:24](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/banner.js#L24)

***

### dismissedAt

• **dismissedAt**: `string`

When the user dismissed it

*Defined in*

[packages/cozy-client/src/models/banner.js:26](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/banner.js#L26)

***

### dismissible

• **dismissible**: `boolean`

Whether the client offers a dismiss control

*Defined in*

[packages/cozy-client/src/models/banner.js:25](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/banner.js#L25)

***

### endsAt

• **endsAt**: `string`

End of the validity window, exclusive

*Defined in*

[packages/cozy-client/src/models/banner.js:29](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/banner.js#L29)

***

### lang

• **lang**: `string`

BCP 47 tag of the language `text` and `cta.label` are in

*Defined in*

[packages/cozy-client/src/models/banner.js:23](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/banner.js#L23)

***

### priority

• **priority**: `number`

Sort order, highest first

*Defined in*

[packages/cozy-client/src/models/banner.js:27](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/banner.js#L27)

***

### severity

• **severity**: `"info"` | `"warning"` | `"error"`

How loudly to render it

*Defined in*

[packages/cozy-client/src/models/banner.js:19](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/banner.js#L19)

***

### startsAt

• **startsAt**: `string`

Start of the validity window, inclusive

*Defined in*

[packages/cozy-client/src/models/banner.js:28](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/banner.js#L28)

***

### surface

• **surface**: `"banner"` | `"modal"`

Where to render it

*Defined in*

[packages/cozy-client/src/models/banner.js:20](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/banner.js#L20)

***

### text

• **text**: `string`

The message, already localized

*Defined in*

[packages/cozy-client/src/models/banner.js:22](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/banner.js#L22)

***

### title

• **title**: `string`

Optional heading, used on the modal surface

*Defined in*

[packages/cozy-client/src/models/banner.js:21](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/banner.js#L21)
