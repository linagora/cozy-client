[cozy-client](../README.md) / [models](models.md) / banner

# Namespace: banner

[models](models.md).banner

## Interfaces

*   [Banner](../interfaces/models.banner.Banner.md)
*   [BannerCta](../interfaces/models.banner.BannerCta.md)
*   [DismissOptions](../interfaces/models.banner.DismissOptions.md)
*   [VisibleBannersOptions](../interfaces/models.banner.VisibleBannersOptions.md)

## Type aliases

### BannerCategory

Ƭ **BannerCategory**<>: `"quota"` | `"billing"` | `"trial"` | `"account"` | `"system"`

*Defined in*

[packages/cozy-client/src/models/banner.js:48](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/banner.js#L48)

***

### BannerClient

Ƭ **BannerClient**<>: `default`

A CozyClient instance

*Defined in*

[packages/cozy-client/src/models/banner.js:66](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/banner.js#L66)

***

### BannerSeverity

Ƭ **BannerSeverity**<>: `"info"` | `"warning"` | `"error"`

*Defined in*

[packages/cozy-client/src/models/banner.js:52](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/banner.js#L52)

***

### BannerSurface

Ƭ **BannerSurface**<>: `"banner"` | `"modal"`

*Defined in*

[packages/cozy-client/src/models/banner.js:56](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/banner.js#L56)

## Variables

### BANNERS_DOCTYPE

• `Const` **BANNERS_DOCTYPE**: `"io.cozy.banners"`

*Defined in*

[packages/cozy-client/src/models/banner.js:7](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/banner.js#L7)

***

### BANNERS_QUERY_NAME

• `Const` **BANNERS_QUERY_NAME**: `string`

The name the banners query is stored under. It is namespaced rather than the
bare doctype: `client.query` keys the store entry on this name but keys the
in-flight promise on the definition, so an unrelated consumer naming its own
`io.cozy.banners` query would make this one resolve nothing while that query
is loading.

*Defined in*

[packages/cozy-client/src/models/banner.js:101](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/banner.js#L101)

***

### KNOWN_SEVERITIES

• `Const` **KNOWN_SEVERITIES**: readonly [`BannerSeverity`](models.banner.md#bannerseverity)\[]

The severities the doctype defines. A value outside this list is rendered
with DEFAULT_SEVERITY. Frozen because the fallbacks read it at call time, so
a consumer mutating it would change what every other consumer renders.

*Defined in*

[packages/cozy-client/src/models/banner.js:22](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/banner.js#L22)

***

### KNOWN_SURFACES

• `Const` **KNOWN_SURFACES**: readonly [`BannerSurface`](models.banner.md#bannersurface)\[]

The surfaces the doctype defines. A value outside this list is rendered on
DEFAULT_SURFACE. Frozen for the same reason as KNOWN_SEVERITIES.

*Defined in*

[packages/cozy-client/src/models/banner.js:31](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/banner.js#L31)

***

### SUPPORTED_DOCTYPE_VERSION

• `Const` **SUPPORTED_DOCTYPE_VERSION**: `1`

The version of the io.cozy.banners shape this code was written against.
A document declaring a higher cozyMetadata.doctypeVersion is skipped.

*Defined in*

[packages/cozy-client/src/models/banner.js:13](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/banner.js#L13)

## Functions

### buildBannersQuery

▸ **buildBannersQuery**(): `Query`

Query for the banners of the current instance.

The query is named so every consumer shares one store entry rather than
minting a new one per call, and the limit is lifted because the whole
collection is read in full.

*Returns*

`Query`

A named query

*Defined in*

[packages/cozy-client/src/models/banner.js:112](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/banner.js#L112)

***

### byPriority

▸ **byPriority**(`a`, `b`): `number`

Highest priority first, then bannerId ascending so every client orders
identically when priorities are equal.

The tie break compares code units rather than calling localeCompare, whose
result depends on the runtime's locale and ICU build. A missing or non
numeric priority sorts as 0 instead of producing NaN, which would make the
comparator intransitive and the sort order engine defined.

Documents that lost their bannerId fall back on \_id, as the deduplication
does, so two of them do not compare equal and land in whatever order the
database returned them in.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `a` | [`Banner`](../interfaces/models.banner.Banner.md) | A banner |
| `b` | [`Banner`](../interfaces/models.banner.Banner.md) | Another banner |

*Returns*

`number`

The comparison result

*Defined in*

[packages/cozy-client/src/models/banner.js:255](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/banner.js#L255)

***

### dismiss

▸ **dismiss**(`client`, `banner`, `options?`): `Promise`<{ `data`: [`Banner`](../interfaces/models.banner.Banner.md)  }>

Records a dismissal. The field is idempotent, so a conflict is resolved by
reading the document again and writing the value on the fresh revision.

The dismissal is written to the document it is given. During a doctypeVersion
migration the stack materializes the same bannerId under several versions,
and the sibling documents are not reached from here.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `client` | [`CozyClient`](../classes/CozyClient.md) | A CozyClient instance |
| `banner` | [`Banner`](../interfaces/models.banner.Banner.md) & { `_id`: `string`  } | The banner to dismiss, as stored |
| `options` | [`DismissOptions`](../interfaces/models.banner.DismissOptions.md) | - |

*Returns*

`Promise`<{ `data`: [`Banner`](../interfaces/models.banner.Banner.md)  }>

> } The dismissed document, null when it is gone

*Defined in*

[packages/cozy-client/src/models/banner.js:567](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/banner.js#L567)

***

### getActiveBanner

▸ **getActiveBanner**(`client`, `options?`): `Promise`<[`Banner`](../interfaces/models.banner.Banner.md)>

The single banner to display, for a surface that shows one at a time.

**`throws`** {Error} When the doctype cannot be read, a missing permission included

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `client` | [`CozyClient`](../classes/CozyClient.md) | A CozyClient instance |
| `options` | [`VisibleBannersOptions`](../interfaces/models.banner.VisibleBannersOptions.md) | - |

*Returns*

`Promise`<[`Banner`](../interfaces/models.banner.Banner.md)>

The highest priority banner, or null

*Defined in*

[packages/cozy-client/src/models/banner.js:549](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/banner.js#L549)

***

### getActiveBanners

▸ **getActiveBanners**(`client`, `options?`): `Promise`<[`Banner`](../interfaces/models.banner.Banner.md)\[]>

The banners to display, in the order to display them. This is the entry
point: it queries the doctype and applies every rule the contract defines,
so a caller does not compose the helpers itself.

The whole collection is read rather than filtered by a Mango selector. The
validity window, the dismissal and the version filter would each need their
own index, and the doctype keeps the collection small on purpose: the stack
deletes a banner when its condition clears.

**`throws`** {Error} When the doctype cannot be read, a missing permission included

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `client` | [`CozyClient`](../classes/CozyClient.md) | A CozyClient instance |
| `options` | [`VisibleBannersOptions`](../interfaces/models.banner.VisibleBannersOptions.md) | - |

*Returns*

`Promise`<[`Banner`](../interfaces/models.banner.Banner.md)\[]>

The banners to display, ready to render

*Defined in*

[packages/cozy-client/src/models/banner.js:534](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/banner.js#L534)

***

### getCta

▸ **getCta**(`banner`): [`BannerCta`](../interfaces/models.banner.BannerCta.md)

A call to action is only rendered when it carries a label and points at
https, so a locally authored document cannot turn into a platform styled
link on any scheme, and no banner renders a button the user cannot read.
The scheme is matched case insensitively since URL schemes are.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `banner` | [`Banner`](../interfaces/models.banner.Banner.md) | The document to read |

*Returns*

[`BannerCta`](../interfaces/models.banner.BannerCta.md)

The call to action, or null when there is none to show

*Defined in*

[packages/cozy-client/src/models/banner.js:299](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/banner.js#L299)

***

### getSeverity

▸ **getSeverity**(`banner`): [`BannerSeverity`](models.banner.md#bannerseverity)

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `banner` | [`Banner`](../interfaces/models.banner.Banner.md) | The document to read |

*Returns*

[`BannerSeverity`](models.banner.md#bannerseverity)

The severity to render, falling back when unknown

*Defined in*

[packages/cozy-client/src/models/banner.js:270](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/banner.js#L270)

***

### getSurface

▸ **getSurface**(`banner`): [`BannerSurface`](models.banner.md#bannersurface)

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `banner` | [`Banner`](../interfaces/models.banner.Banner.md) | The document to read |

*Returns*

[`BannerSurface`](models.banner.md#bannersurface)

The surface to render on, falling back when unknown

*Defined in*

[packages/cozy-client/src/models/banner.js:279](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/banner.js#L279)

***

### getVisibleBanners

▸ **getVisibleBanners**(`banners`, `options?`): [`Banner`](../interfaces/models.banner.Banner.md)\[]

The banners a client displays, in the order it displays them.

A dismissal applies to the bannerId rather than to the single document
carrying it, so a banner dismissed against one version stays hidden once the
client moves to another. Deduplication runs last, on the documents that are
actually renderable, so a newer version sitting outside its validity window
never suppresses the older one that is still live.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `banners` | [`Banner`](../interfaces/models.banner.Banner.md)\[] | The documents read from the doctype |
| `options` | [`VisibleBannersOptions`](../interfaces/models.banner.VisibleBannersOptions.md) | - |

*Returns*

[`Banner`](../interfaces/models.banner.Banner.md)\[]

The visible banners, ordered

*Defined in*

[packages/cozy-client/src/models/banner.js:398](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/banner.js#L398)

***

### isDismissed

▸ **isDismissed**(`banner`): `boolean`

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `banner` | [`Banner`](../interfaces/models.banner.Banner.md) | The document to check |

*Returns*

`boolean`

True when the user dismissed it

*Defined in*

[packages/cozy-client/src/models/banner.js:205](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/banner.js#L205)

***

### isInWindow

▸ **isInWindow**(`banner`, `now?`): `boolean`

The window is inclusive on startsAt and exclusive on endsAt, and an absent
endsAt is open ended. A malformed bound hides the banner: a document whose
window cannot be read is not one a client can decide to show.

An absent startsAt hides it too. The doctype makes cta, dismissedAt and
endsAt the only fields that may be missing, so a document with no lower bound
is not open ended, it is unreadable. Treating it as "no bound" would make the
missing field more permissive than a malformed one, and would let anything
able to rewrite the document turn a scheduled banner into a permanent one by
deleting both bounds.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `banner` | [`Banner`](../interfaces/models.banner.Banner.md) | The document to check |
| `now` | `Date` | - |

*Returns*

`boolean`

True when the banner applies at that time

*Defined in*

[packages/cozy-client/src/models/banner.js:223](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/banner.js#L223)

***

### isSupported

▸ **isSupported**(`banner`, `supportedVersion?`): `boolean`

*Parameters*

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `banner` | [`Banner`](../interfaces/models.banner.Banner.md) | `undefined` | The document to check |
| `supportedVersion` | `number` | `SUPPORTED_DOCTYPE_VERSION` | - |

*Returns*

`boolean`

True when the shape is one this client can read

*Defined in*

[packages/cozy-client/src/models/banner.js:173](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/banner.js#L173)

***

### isTrusted

▸ **isTrusted**(`banner`): `boolean`

Documents are only trusted when the stack wrote them. Permissions scope by
doctype and verb, never by field, so any application allowed to record a
dismissal is also able to author a document that looks like a platform
message.

This is not a security boundary, and should not be read as one. The stack
does not own this field: cozy-client keeps whatever `cozyMetadata` the caller
passes (CozyClient.js, ensureCozyMetadata spreads it last), so an application
can set `createdByApp: 'stack'` on a document it authored itself and pass
this check. It catches an application writing under its own name, which is
the ordinary mistake, not one deliberately impersonating the stack. Enforcing
that needs the doctype to be stack write only on the server side.

It also only speaks to who created the document. An application holding write
permission can rewrite the fields of a stack authored one, which the platform
cannot prevent, so a client escapes text and never interprets markup in it.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `banner` | [`Banner`](../interfaces/models.banner.Banner.md) | The document to check |

*Returns*

`boolean`

True when the stack is the author

*Defined in*

[packages/cozy-client/src/models/banner.js:138](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/banner.js#L138)
