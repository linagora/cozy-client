[cozy-client](../README.md) / [models](../modules/models.md) / [banner](../modules/models.banner.md) / Banner

# Interface: Banner<>

[models](../modules/models.md).[banner](../modules/models.banner.md).Banner

An io.cozy.banners document

## Properties

### \_id

• **\_id**: `string`

Identifier of the document, minted by CouchDB

*Defined in*

[packages/cozy-client/src/models/banner.js:76](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/banner.js#L76)

***

### \_rev

• **\_rev**: `string`

Revision identifier of the document

*Defined in*

[packages/cozy-client/src/models/banner.js:77](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/banner.js#L77)

***

### bannerId

• **bannerId**: `string`

Identifier of the banner itself

*Defined in*

[packages/cozy-client/src/models/banner.js:78](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/banner.js#L78)

***

### category

• **category**: [`BannerCategory`](../modules/models.banner.md#bannercategory)

What the banner is about

*Defined in*

[packages/cozy-client/src/models/banner.js:79](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/banner.js#L79)

***

### cozyMetadata

• **cozyMetadata**: `any`

Document lifecycle metadata

*Defined in*

[packages/cozy-client/src/models/banner.js:91](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/banner.js#L91)

***

### cta

• **cta**: [`BannerCta`](models.banner.BannerCta.md)

Optional call to action

*Defined in*

[packages/cozy-client/src/models/banner.js:84](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/banner.js#L84)

***

### dismissedAt

• **dismissedAt**: `string`

When the user dismissed this banner

*Defined in*

[packages/cozy-client/src/models/banner.js:86](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/banner.js#L86)

***

### dismissible

• **dismissible**: `boolean`

Whether the client offers a dismiss control

*Defined in*

[packages/cozy-client/src/models/banner.js:85](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/banner.js#L85)

***

### endsAt

• **endsAt**: `string`

End of the validity window, exclusive

*Defined in*

[packages/cozy-client/src/models/banner.js:89](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/banner.js#L89)

***

### lang

• **lang**: `string`

BCP 47 tag of the language text is written in

*Defined in*

[packages/cozy-client/src/models/banner.js:83](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/banner.js#L83)

***

### priority

• **priority**: `number`

Sort order, highest first

*Defined in*

[packages/cozy-client/src/models/banner.js:87](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/banner.js#L87)

***

### severity

• **severity**: [`BannerSeverity`](../modules/models.banner.md#bannerseverity)

info, warning or error

*Defined in*

[packages/cozy-client/src/models/banner.js:80](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/banner.js#L80)

***

### source

• **source**: `any`

What produced the document

*Defined in*

[packages/cozy-client/src/models/banner.js:90](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/banner.js#L90)

***

### startsAt

• **startsAt**: `string`

Start of the validity window, inclusive

*Defined in*

[packages/cozy-client/src/models/banner.js:88](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/banner.js#L88)

***

### surface

• **surface**: [`BannerSurface`](../modules/models.banner.md#bannersurface)

banner or modal

*Defined in*

[packages/cozy-client/src/models/banner.js:81](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/banner.js#L81)

***

### text

• **text**: `string`

The message, in the language given by lang

*Defined in*

[packages/cozy-client/src/models/banner.js:82](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/banner.js#L82)
