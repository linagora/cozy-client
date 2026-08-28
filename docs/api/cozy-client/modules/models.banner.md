[cozy-client](../README.md) / [models](models.md) / banner

# Namespace: banner

[models](models.md).banner

## Interfaces

*   [Banner](../interfaces/models.banner.Banner.md)
*   [BannerCta](../interfaces/models.banner.BannerCta.md)

## Variables

### BANNERS_DOCTYPE

• `Const` **BANNERS_DOCTYPE**: `"io.cozy.banners"`

*Defined in*

[packages/cozy-client/src/models/banner.js:6](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/banner.js#L6)

## Functions

### dismiss

▸ **dismiss**(`client`, `banner`, `[options]?`): `Promise`<{ `data`: [`Banner`](../interfaces/models.banner.Banner.md)  }>

Records a dismissal on the stored document, retrying once on a conflict.

The stored document is written back rather than the one the caller holds,
whose severity and surface have had the fallbacks applied.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `client` | `any` | A CozyClient instance |
| `banner` | [`Banner`](../interfaces/models.banner.Banner.md) | The banner to dismiss |
| `[options]` | `Object` | Options |
| `[options].dismissedAt` | `string` | - |

*Returns*

`Promise`<{ `data`: [`Banner`](../interfaces/models.banner.Banner.md)  }>

> } The dismissed document, null when gone

*Defined in*

[packages/cozy-client/src/models/banner.js:150](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/banner.js#L150)

***

### getActiveBanner

▸ **getActiveBanner**(`client`, `options`): `Promise`<[`Banner`](../interfaces/models.banner.Banner.md)>

The single banner to display, for a surface that shows one at a time.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `client` | `any` | A CozyClient instance |
| `options` | `Object` | - |
| `options.now` | `Date` | - |

*Returns*

`Promise`<[`Banner`](../interfaces/models.banner.Banner.md)>

The highest priority banner, or null

*Defined in*

[packages/cozy-client/src/models/banner.js:135](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/banner.js#L135)

***

### getActiveBanners

▸ **getActiveBanners**(`client`, `[options]?`): `Promise`<[`Banner`](../interfaces/models.banner.Banner.md)\[]>

The banners to display, in order.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `client` | `any` | A CozyClient instance |
| `[options]` | `Object` | Options |
| `[options].now` | `Date` | - |

*Returns*

`Promise`<[`Banner`](../interfaces/models.banner.Banner.md)\[]>

The banners to render

*Defined in*

[packages/cozy-client/src/models/banner.js:121](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/banner.js#L121)
