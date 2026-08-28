import { Q } from '../queries/dsl'

export const BANNERS_DOCTYPE = 'io.cozy.banners'

const KNOWN_SEVERITIES = ['info', 'warning', 'error']
const KNOWN_SURFACES = ['banner', 'modal']

/**
 * @typedef {object} BannerCta
 * @property {string} label - The label, plain text
 * @property {string} url - Where the label points
 */

/**
 * @typedef {object} Banner An io.cozy.banners document
 * @property {string} [_id] - Identifier of the document
 * @property {string} bannerId - Identifier of the banner itself
 * @property {string} category - What the banner is about
 * @property {'info'|'warning'|'error'} severity - How loudly to render it
 * @property {'banner'|'modal'} surface - Where to render it
 * @property {string} [title] - Optional heading, used on the modal surface
 * @property {string} text - The message, already localized
 * @property {string} lang - BCP 47 tag of the language `text` and `cta.label` are in
 * @property {BannerCta} [cta] - Optional call to action
 * @property {boolean} dismissible - Whether the client offers a dismiss control
 * @property {string} [dismissedAt] - When the user dismissed it
 * @property {number} priority - Sort order, highest first
 * @property {string} startsAt - Start of the validity window, inclusive
 * @property {string} [endsAt] - End of the validity window, exclusive
 */

/**
 * The doctype writes an ISO 8601 timestamp with an explicit offset, and nothing
 * else parses. `Date.parse` on its own falls back to the engine's legacy parser
 * for anything it does not recognise, so a malformed bound would resolve to a
 * real instant in one browser and to NaN in another, and the shared contract
 * vectors could no longer say what every client displays.
 */
const ISO_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/

/** A bound that is absent leaves that end of the window open, unlike an unparseable one. */
const toTime = value => {
  if (value == null) return null
  if (typeof value !== 'string' || !ISO_TIMESTAMP.test(value)) return NaN
  return Date.parse(value)
}

const isDismissed = banner => banner?.dismissedAt != null

/** The window is inclusive on startsAt, exclusive on endsAt, open when absent. */
const isInWindow = (banner, now) => {
  const startsAt = toTime(banner?.startsAt)
  const endsAt = toTime(banner?.endsAt)
  if (startsAt === null || Number.isNaN(startsAt) || Number.isNaN(endsAt)) {
    return false
  }

  const at = now.getTime()
  if (at < startsAt) return false
  return endsAt === null || at < endsAt
}

/**
 * Highest priority first, then bannerId, compared code unit by code unit so
 * that every client orders equal priorities the same way. `localeCompare`
 * would depend on the runtime locale.
 */
const rankOf = banner =>
  Number.isFinite(banner?.priority) ? banner.priority : 0

const byPriority = (a, b) => {
  const byRank = rankOf(b) - rankOf(a)
  if (byRank !== 0) return byRank
  if (a.bannerId < b.bannerId) return -1
  if (a.bannerId > b.bannerId) return 1
  return 0
}

/**
 * The doctype specifies an absolute `https://` URL, so anything else is dropped
 * rather than handed to a client that would put it in an `href`: the documents
 * live in a database the applications can write, and a `javascript:` URL there
 * would run in the origin of whichever application rendered the banner.
 */
const isSafeCta = cta =>
  typeof cta?.url === 'string' && /^https:\/\//i.test(cta.url)

/**
 * The doctype allows a new severity or surface without a version bump, so a
 * value this client does not know is rendered rather than dropped.
 */
const withFallbacks = banner => ({
  ...banner,
  severity: KNOWN_SEVERITIES.includes(banner.severity)
    ? banner.severity
    : 'warning',
  surface: KNOWN_SURFACES.includes(banner.surface) ? banner.surface : 'banner',
  cta: isSafeCta(banner.cta) ? banner.cta : undefined
})

/**
 * `client.query` resolves undefined instead of rejecting when the client has an
 * `onError` callback, which would otherwise read as "no banners apply".
 */
const readData = response => {
  if (response === null || response === undefined) {
    throw new Error(`The ${BANNERS_DOCTYPE} query resolved nothing`)
  }
  return response.data
}

/** The stack link answers a missing document with null, the pouch link with []. */
const readOne = response => {
  const data = readData(response)
  const doc = Array.isArray(data) ? data[0] : data
  return doc?._id ? doc : null
}

const isConflict = error =>
  error?.status === 409 || /Document update conflict/.test(error?.message ?? '')

/**
 * The banners to display, in order.
 *
 * @param {object} client - A CozyClient instance
 * @param {object} [options] - Options
 * @param {Date} [options.now] - The current time
 * @returns {Promise<Banner[]>} The banners to render
 */
export const getActiveBanners = async (client, { now = new Date() } = {}) => {
  const data = readData(
    await client.query(Q(BANNERS_DOCTYPE).UNSAFE_noLimit(), {
      as: `${BANNERS_DOCTYPE}/all`
    })
  )
  return (Array.isArray(data) ? data : [])
    .filter(banner => !isDismissed(banner) && isInWindow(banner, now))
    .sort(byPriority)
    .map(withFallbacks)
}

/**
 * The single banner to display, for a surface that shows one at a time.
 *
 * A native client rendering one slot reads this rather than taking the head of
 * the list itself, so the ordering rules stay in one place.
 *
 * @param {object} client - A CozyClient instance
 * @param {object} [options] - Options
 * @param {Date} [options.now] - The current time
 * @returns {Promise<Banner|null>} The highest priority banner, or null
 */
export const getActiveBanner = async (client, options) =>
  (await getActiveBanners(client, options))[0] ?? null

/**
 * Records a dismissal on the stored document, retrying once on a conflict.
 *
 * The stored document is written back rather than the one the caller holds,
 * whose severity and surface have had the fallbacks applied.
 *
 * @param {object} client - A CozyClient instance
 * @param {Banner} banner - The banner to dismiss
 * @param {object} [options] - Options
 * @param {string} [options.dismissedAt] - The timestamp to record
 * @returns {Promise<{data: Banner|null}>} The dismissed document, null when gone
 */
export const dismiss = async (client, banner, { dismissedAt } = {}) => {
  if (!banner?._id) throw new Error('A banner needs an _id to be dismissed')
  const at = dismissedAt ?? new Date().toISOString()

  const write = async () => {
    const stored = readOne(
      await client.query(Q(BANNERS_DOCTYPE).getById(banner._id))
    )
    // The stack deletes a banner when its condition clears.
    if (!stored) return { data: null }
    // Another client got there first, and the field is idempotent.
    if (isDismissed(stored)) return { data: stored }

    // _type after the document: one carrying its own would route the write to
    // another doctype.
    return client.save({ ...stored, _type: BANNERS_DOCTYPE, dismissedAt: at })
  }

  try {
    return await write()
  } catch (error) {
    if (!isConflict(error)) throw error
    // The write lost a revision race, so it is read again and written once more.
    return write()
  }
}
