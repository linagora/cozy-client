import isValid from 'date-fns/isValid'
import parseISO from 'date-fns/parseISO'

import { Q } from '../queries/dsl'
import { getCreatedByApp } from './utils'

export const BANNERS_DOCTYPE = 'io.cozy.banners'

/**
 * The version of the io.cozy.banners shape this code was written against.
 * A document declaring a higher cozyMetadata.doctypeVersion is skipped.
 */
export const SUPPORTED_DOCTYPE_VERSION = 1

/**
 * The severities the doctype defines. A value outside this list is rendered
 * with DEFAULT_SEVERITY. Frozen because the fallbacks read it at call time, so
 * a consumer mutating it would change what every other consumer renders.
 *
 * @type {readonly BannerSeverity[]}
 */
export const KNOWN_SEVERITIES = ['info', 'warning', 'error']
Object.freeze(KNOWN_SEVERITIES)

/**
 * The surfaces the doctype defines. A value outside this list is rendered on
 * DEFAULT_SURFACE. Frozen for the same reason as KNOWN_SEVERITIES.
 *
 * @type {readonly BannerSurface[]}
 */
export const KNOWN_SURFACES = ['banner', 'modal']
Object.freeze(KNOWN_SURFACES)

/** @type {BannerSeverity} */
const DEFAULT_SEVERITY = 'warning'
/** @type {BannerSurface} */
const DEFAULT_SURFACE = 'banner'

const STACK_APP = 'stack'

/**
 * @typedef {object} BannerCta
 * @property {string} label - The label, plain text, in the same language as the banner text
 * @property {string} url - Absolute https URL the label points to
 */

/**
 * @typedef {'quota'|'billing'|'trial'|'account'|'system'} BannerCategory
 */

/**
 * @typedef {'info'|'warning'|'error'} BannerSeverity
 */

/**
 * @typedef {'banner'|'modal'} BannerSurface
 */

/**
 * @typedef {object} VisibleBannersOptions
 * @property {Date} [now] - The current time, defaults to now
 * @property {number} [supportedDoctypeVersion] - The highest version this client handles
 */

/**
 * @typedef {import("../CozyClient").default} BannerClient A CozyClient instance
 */

/**
 * @typedef {object} DismissOptions
 * @property {string} [dismissedAt] - The timestamp to record, defaults to now
 */

/**
 * @typedef {object} Banner An io.cozy.banners document
 * @property {string} [_id] - Identifier of the document, minted by CouchDB
 * @property {string} [_rev] - Revision identifier of the document
 * @property {string} bannerId - Identifier of the banner itself
 * @property {BannerCategory} category - What the banner is about
 * @property {BannerSeverity} severity - info, warning or error
 * @property {BannerSurface} surface - banner or modal
 * @property {string} text - The message, in the language given by lang
 * @property {string} lang - BCP 47 tag of the language text is written in
 * @property {BannerCta|null} [cta] - Optional call to action
 * @property {boolean} dismissible - Whether the client offers a dismiss control
 * @property {string|null} [dismissedAt] - When the user dismissed this banner
 * @property {number} priority - Sort order, highest first
 * @property {string} startsAt - Start of the validity window, inclusive
 * @property {string|null} [endsAt] - End of the validity window, exclusive
 * @property {object} [source] - What produced the document
 * @property {object} [cozyMetadata] - Document lifecycle metadata
 */

/**
 * The name the banners query is stored under. It is namespaced rather than the
 * bare doctype: `client.query` keys the store entry on this name but keys the
 * in-flight promise on the definition, so an unrelated consumer naming its own
 * `io.cozy.banners` query would make this one resolve nothing while that query
 * is loading.
 */
export const BANNERS_QUERY_NAME = `${BANNERS_DOCTYPE}/all`

/**
 * Query for the banners of the current instance.
 *
 * The query is named so every consumer shares one store entry rather than
 * minting a new one per call, and the limit is lifted because the whole
 * collection is read in full.
 *
 * @returns {import('../types').Query} A named query
 */
export const buildBannersQuery = () => ({
  definition: Q(BANNERS_DOCTYPE).UNSAFE_noLimit(),
  options: { as: BANNERS_QUERY_NAME }
})

/**
 * Documents are only trusted when the stack wrote them. Permissions scope by
 * doctype and verb, never by field, so any application allowed to record a
 * dismissal is also able to author a document that looks like a platform
 * message.
 *
 * This is not a security boundary, and should not be read as one. The stack
 * does not own this field: cozy-client keeps whatever `cozyMetadata` the caller
 * passes (CozyClient.js, ensureCozyMetadata spreads it last), so an application
 * can set `createdByApp: 'stack'` on a document it authored itself and pass
 * this check. It catches an application writing under its own name, which is
 * the ordinary mistake, not one deliberately impersonating the stack. Enforcing
 * that needs the doctype to be stack write only on the server side.
 *
 * It also only speaks to who created the document. An application holding write
 * permission can rewrite the fields of a stack authored one, which the platform
 * cannot prevent, so a client escapes text and never interprets markup in it.
 *
 * @param {Banner} banner - The document to check
 * @returns {boolean} True when the stack is the author
 */
export const isTrusted = banner => getCreatedByApp(banner) === STACK_APP

/**
 * cozy-stack writes numbers as strings in places, `cozyMetadata` declares
 * `doctypeVersion` that way platform wide, so a value is parsed rather than
 * compared as it comes. `Number()` alone is not enough: it maps null, "", false
 * and [] to a finite 0, which would read as a real version or a real priority
 * rather than as an unusable value, so only a number or a non blank string is
 * parsed at all.
 *
 * @param {any} value - The value to read
 * @param {number} fallback - What an absent or unusable value means
 * @returns {number} The parsed number, or the fallback
 */
const toNumber = (value, fallback) => {
  const parsed =
    typeof value === 'number' ||
    (typeof value === 'string' && value.trim() !== '')
      ? Number(value)
      : NaN
  return Number.isFinite(parsed) ? parsed : fallback
}

/**
 * @param {Banner} banner - The document to read
 * @returns {number} The version, defaulting to 1 for a missing or unusable one
 */
const doctypeVersion = banner =>
  toNumber(banner?.cozyMetadata?.doctypeVersion, 1)

/**
 * @param {Banner} banner - The document to check
 * @param {number} [supportedVersion] - The highest version this client handles
 * @returns {boolean} True when the shape is one this client can read
 */
export const isSupported = (
  banner,
  supportedVersion = SUPPORTED_DOCTYPE_VERSION
) => doctypeVersion(banner) <= supportedVersion

/**
 * A null value and an absent key mean the same thing for dismissedAt and
 * endsAt, and `new Date(null)` is the Unix epoch rather than "no date", so
 * every date is null checked before being parsed.
 *
 * Returns a timestamp rather than a Date so the comparisons stay primitive,
 * and NaN when the value is present but unparseable, which the callers reject
 * rather than silently treating as "no bound".
 *
 * This is the only date parser in the file. `Date.parse` is deliberately not
 * used anywhere: it accepts implementation defined formats that `parseISO`
 * rejects, and the two disagree by the local UTC offset on a date only value,
 * so mixing them would give one document two different instants.
 *
 * @param {string|null|undefined} value - An ISO 8601 timestamp
 * @returns {number|null} The timestamp, NaN when malformed, null when absent
 */
const toTime = value => {
  if (value === null || value === undefined) return null
  const parsed = parseISO(value)
  return isValid(parsed) ? parsed.getTime() : NaN
}

/**
 * @param {Banner} banner - The document to check
 * @returns {boolean} True when the user dismissed it
 */
export const isDismissed = banner => banner?.dismissedAt != null

/**
 * The window is inclusive on startsAt and exclusive on endsAt, and an absent
 * endsAt is open ended. A malformed bound hides the banner: a document whose
 * window cannot be read is not one a client can decide to show.
 *
 * An absent startsAt hides it too. The doctype makes cta, dismissedAt and
 * endsAt the only fields that may be missing, so a document with no lower bound
 * is not open ended, it is unreadable. Treating it as "no bound" would make the
 * missing field more permissive than a malformed one, and would let anything
 * able to rewrite the document turn a scheduled banner into a permanent one by
 * deleting both bounds.
 *
 * @param {Banner} banner - The document to check
 * @param {Date} [now] - The current time
 * @returns {boolean} True when the banner applies at that time
 */
export const isInWindow = (banner, now = new Date()) => {
  const startsAt = toTime(banner?.startsAt)
  const endsAt = toTime(banner?.endsAt)
  if (startsAt === null || Number.isNaN(startsAt)) return false
  if (Number.isNaN(endsAt)) return false

  const at = now.getTime()
  if (Number.isNaN(at)) return false
  if (at < startsAt) return false
  if (endsAt !== null && at >= endsAt) return false
  return true
}

const priorityOf = banner => toNumber(banner?.priority, 0)

/**
 * Highest priority first, then bannerId ascending so every client orders
 * identically when priorities are equal.
 *
 * The tie break compares code units rather than calling localeCompare, whose
 * result depends on the runtime's locale and ICU build. A missing or non
 * numeric priority sorts as 0 instead of producing NaN, which would make the
 * comparator intransitive and the sort order engine defined.
 *
 * Documents that lost their bannerId fall back on _id, as the deduplication
 * does, so two of them do not compare equal and land in whatever order the
 * database returned them in.
 *
 * @param {Banner} a - A banner
 * @param {Banner} b - Another banner
 * @returns {number} The comparison result
 */
export const byPriority = (a, b) => {
  const byRank = priorityOf(b) - priorityOf(a)
  if (byRank !== 0) return byRank

  const idA = String(a?.bannerId ?? a?._id ?? '')
  const idB = String(b?.bannerId ?? b?._id ?? '')
  if (idA < idB) return -1
  if (idA > idB) return 1
  return 0
}

/**
 * @param {Banner} banner - The document to read
 * @returns {BannerSeverity} The severity to render, falling back when unknown
 */
export const getSeverity = banner =>
  KNOWN_SEVERITIES.includes(banner?.severity)
    ? banner.severity
    : DEFAULT_SEVERITY

/**
 * @param {Banner} banner - The document to read
 * @returns {BannerSurface} The surface to render on, falling back when unknown
 */
export const getSurface = banner =>
  KNOWN_SURFACES.includes(banner?.surface) ? banner.surface : DEFAULT_SURFACE

/**
 * Whitespace plus the zero width characters `trim` leaves behind. A label made
 * only of these renders as a button with nothing on it. They are stripped to
 * decide whether the label is empty, never from the label itself, so a script
 * that uses a zero width joiner between glyphs keeps it.
 */
const BLANK = /[\s\u200B-\u200D\uFEFF]/g

/**
 * A call to action is only rendered when it carries a label and points at
 * https, so a locally authored document cannot turn into a platform styled
 * link on any scheme, and no banner renders a button the user cannot read.
 * The scheme is matched case insensitively since URL schemes are.
 *
 * @param {Banner} banner - The document to read
 * @returns {BannerCta|null} The call to action, or null when there is none to show
 */
export const getCta = banner => {
  const cta = banner?.cta
  if (!cta || typeof cta.url !== 'string') return null
  if (typeof cta.label !== 'string' || cta.label.replace(BLANK, '') === '') {
    return null
  }
  return isHttpsUrl(cta.url) ? cta : null
}

/**
 * A prefix check accepts "https://" and "https:example.org", which do not point
 * where they look like they point, so the value is parsed instead. The parser
 * rejects an https URL with no host outright, so reaching the scheme comparison
 * already means there is one.
 *
 * @param {string} raw - The candidate URL
 * @returns {boolean} True when it is an absolute https URL
 */
const isHttpsUrl = raw => {
  try {
    return new URL(raw).protocol === 'https:'
  } catch (error) {
    return false
  }
}

const updatedAtOf = banner => {
  const at = toTime(banner?.cozyMetadata?.updatedAt)
  return Number.isFinite(at) ? at : 0
}

/**
 * Orders two documents carrying the same bannerId, most relevant first. The
 * highest supported doctypeVersion wins; equal versions fall back on the most
 * recently written document and then on _id, so the winner never depends on
 * the order the rows came back in.
 *
 * @param {Banner} candidate - The document being considered
 * @param {Banner} current - The document currently held
 * @returns {boolean} True when candidate should replace current
 */
const supersedes = (candidate, current) => {
  const byVersion = doctypeVersion(candidate) - doctypeVersion(current)
  if (byVersion !== 0) return byVersion > 0

  const byUpdate = updatedAtOf(candidate) - updatedAtOf(current)
  if (byUpdate !== 0) return byUpdate > 0

  return String(candidate?._id ?? '') < String(current?._id ?? '')
}

/**
 * The identity two documents are grouped and dismissed under. bannerId and _id
 * are kept in separate namespaces: sharing one would let a document whose _id
 * happens to equal another document's bannerId dismiss or supersede it. A
 * document carrying neither keys on itself, so unrelated ones do not collapse
 * onto a single `undefined` key.
 *
 * @param {Banner} banner - The document to key
 * @returns {string|Banner} The grouping key
 */
const groupKey = banner => {
  if (banner?.bannerId != null) return `bannerId:${banner.bannerId}`
  if (banner?._id != null) return `_id:${banner._id}`
  return banner
}

/**
 * Keeps the highest supported version of each bannerId. Without this the
 * documents materialized on both sides of a version bump render twice.
 *
 * @param {Banner[]} banners - The documents to reduce
 * @returns {Banner[]} One document per bannerId
 */
const keepHighestVersion = banners => {
  const best = new Map()
  for (const banner of banners) {
    const key = groupKey(banner)
    const current = best.get(key)
    if (current === undefined || supersedes(banner, current)) {
      best.set(key, banner)
    }
  }
  return Array.from(best.values())
}

/**
 * The banners a client displays, in the order it displays them.
 *
 * A dismissal applies to the bannerId rather than to the single document
 * carrying it, so a banner dismissed against one version stays hidden once the
 * client moves to another. Deduplication runs last, on the documents that are
 * actually renderable, so a newer version sitting outside its validity window
 * never suppresses the older one that is still live.
 *
 * @param {Banner[]} banners - The documents read from the doctype
 * @param {VisibleBannersOptions} [options] - Options
 * @returns {Banner[]} The visible banners, ordered
 */
export const getVisibleBanners = (banners, options = {}) => {
  const now =
    options.now instanceof Date && !Number.isNaN(options.now.getTime())
      ? options.now
      : new Date()
  // Validated rather than defaulted with ??, which only guards null and
  // undefined: a NaN reaching isSupported makes every comparison false and
  // hides every banner with no error.
  const supportedVersion = toNumber(
    options.supportedDoctypeVersion,
    SUPPORTED_DOCTYPE_VERSION
  )

  // Only documents the stack wrote are read at all, dismissals included: a
  // dismissal on a document an application authored must not hide a platform
  // message.
  const trusted = (banners ?? []).filter(isTrusted)

  // Collected before the version filter: a dismissal recorded by a client on a
  // newer version of the document still applies to a client that only reads the
  // older one, which would otherwise render a banner the user has closed.
  const dismissed = new Set(trusted.filter(isDismissed).map(groupKey))

  return keepHighestVersion(
    trusted.filter(
      banner =>
        isSupported(banner, supportedVersion) &&
        !dismissed.has(groupKey(banner)) &&
        isInWindow(banner, now)
    )
  )
    .sort(byPriority)
    .map(resolve)
}

/**
 * Applies every fallback the doctype defines, so a caller renders what it is
 * given instead of reaching for the helpers itself: an unknown severity or
 * surface is already replaced, and a call to action that is not an absolute
 * https URL is already dropped.
 *
 * The doctype guarantees that a non dismissible banner on the modal surface
 * carries a call to action, so the user is never left without a way out.
 * Dropping an unusable one would break that guarantee and paint a blocking
 * dialog with no dismiss control and no button, so the banner falls back to the
 * surface that is never blocking.
 *
 * The document is returned unchanged when no fallback applied. The store relies
 * on referential equality, and copying every banner on every read would make a
 * memoized renderer repaint on every poll tick. An absent cta is not left
 * absent though: the resolved shape always carries the key, so a caller reads
 * one value rather than checking for both null and undefined.
 *
 * @param {Banner} banner - A visible banner
 * @returns {Banner} The same banner, ready to render
 */
const resolve = banner => {
  const severity = getSeverity(banner)
  const cta = getCta(banner)
  const surface =
    getSurface(banner) === 'modal' && cta === null && !banner?.dismissible
      ? DEFAULT_SURFACE
      : getSurface(banner)

  if (
    severity === banner?.severity &&
    surface === banner?.surface &&
    cta === banner?.cta
  ) {
    return banner
  }
  return { ...banner, severity, surface, cta }
}

/**
 * A conflict reaches this code in two shapes: a FetchError from the stack,
 * which carries the HTTP status, and a PouchDB conflict, which the pouch link
 * rewraps into a plain Error that only keeps the message.
 *
 * @param {Error & {status?: number}} error - The error to classify
 * @returns {boolean} True when the write lost a revision race
 */
const isConflict = error =>
  error?.status === 409 || /Document update conflict/.test(error?.message ?? '')

/**
 * `client.query` does not always resolve a response. It resolves undefined when
 * the client was built with an `onError` callback, which swallows the rejection,
 * and when a query named the same as this one is already in flight with a
 * different definition. Both are indistinguishable from an empty collection
 * once the response is read, so they are rejected here instead: reporting a
 * failed read as "there is nothing" hides a banner the user should see, and
 * reports a dismissal that never happened as done.
 *
 * @param {object} response - The response of a query
 * @returns {object} The same response
 * @throws {Error} When the query resolved nothing
 */
const requireResponse = response => {
  if (response === null || response === undefined) {
    throw new Error(
      `The ${BANNERS_DOCTYPE} query resolved nothing. Either the client swallowed the error through its onError option, or another query is registered under the name ${BANNERS_QUERY_NAME}.`
    )
  }
  return response
}

/**
 * The links disagree on how a missing document comes back: the stack link
 * resolves `{data: null}` while the pouch link resolves `{data: []}`, and an
 * empty array is truthy. Both mean there is nothing to write to.
 *
 * @param {object} response - The response of a getById query
 * @returns {Banner|null} The document, or null when there is none
 */
const readOne = response => {
  const data = requireResponse(response)?.data
  const doc = Array.isArray(data) ? data[0] : data
  return doc?._id ? doc : null
}

/**
 * The banners to display, in the order to display them. This is the entry
 * point: it queries the doctype and applies every rule the contract defines,
 * so a caller does not compose the helpers itself.
 *
 * The whole collection is read rather than filtered by a Mango selector. The
 * validity window, the dismissal and the version filter would each need their
 * own index, and the doctype keeps the collection small on purpose: the stack
 * deletes a banner when its condition clears.
 *
 * @param {BannerClient} client - A CozyClient instance
 * @param {VisibleBannersOptions} [options] - Options
 * @returns {Promise<Banner[]>} The banners to display, ready to render
 * @throws {Error} When the doctype cannot be read, a missing permission included
 */
export const getActiveBanners = async (client, options = {}) => {
  const { definition, options: queryOptions } = buildBannersQuery()
  const data = requireResponse(await client.query(definition, queryOptions))
    ?.data
  return getVisibleBanners(Array.isArray(data) ? data : [], options)
}

/**
 * The single banner to display, for a surface that shows one at a time.
 *
 * @param {BannerClient} client - A CozyClient instance
 * @param {VisibleBannersOptions} [options] - Options
 * @returns {Promise<Banner|null>} The highest priority banner, or null
 * @throws {Error} When the doctype cannot be read, a missing permission included
 */
export const getActiveBanner = async (client, options = {}) => {
  const [first] = await getActiveBanners(client, options)
  return first ?? null
}

/**
 * Records a dismissal. The field is idempotent, so a conflict is resolved by
 * reading the document again and writing the value on the fresh revision.
 *
 * The dismissal is written to the document it is given. During a doctypeVersion
 * migration the stack materializes the same bannerId under several versions,
 * and the sibling documents are not reached from here.
 *
 * @param {BannerClient} client - A CozyClient instance
 * @param {Banner & {_id: string}} banner - The banner to dismiss, as stored
 * @param {DismissOptions} [options] - Options
 * @returns {Promise<{data: Banner|null}>} The dismissed document, null when it is gone
 */
export const dismiss = async (client, banner, options = {}) => {
  const dismissedAt = options.dismissedAt ?? new Date().toISOString()
  const id = banner?._id
  if (!id) throw new Error('A banner needs an _id to be dismissed')

  // The doctype requires the dismissal on every version of a bannerId, not
  // only the document the caller happens to hold. Writing one leaves a client
  // that reads an older version still showing a banner the user closed, and
  // the read side only compensates while both siblings are alive.
  const siblings = await findSiblings(client, banner)

  let result = { data: null }
  for (const sibling of siblings) {
    const written = await writeDismissal(client, sibling._id, dismissedAt)
    // The caller is answered with the document it asked about.
    if (sibling._id === id) result = written
  }
  return result
}

/**
 * Every stored document sharing the banner's identity, the one the caller holds
 * included. The whole collection is read because the versions of a bannerId are
 * not reachable by id, and the doctype keeps the collection small on purpose.
 *
 * @param {BannerClient} client - A CozyClient instance
 * @param {Banner} banner - The banner being dismissed
 * @returns {Promise<Banner[]>} The documents to write the dismissal to
 */
const findSiblings = async (client, banner) => {
  const { definition, options: queryOptions } = buildBannersQuery()
  const response = requireResponse(await client.query(definition, queryOptions))
  const data = Array.isArray(response.data) ? response.data : []
  const key = groupKey(banner)
  const siblings = data.filter(doc => doc?._id && groupKey(doc) === key)
  // The document may have been deleted between the read and the click, in which
  // case there is nothing left to write to.
  return siblings.length > 0 ? siblings : []
}

/** How many times the write is attempted before a conflict reaches the caller. */
const DISMISS_ATTEMPTS = 2

const writeDismissal = async (client, id, dismissedAt) => {
  for (let attempt = 1; attempt <= DISMISS_ATTEMPTS; attempt++) {
    const stored = readOne(await client.query(Q(BANNERS_DOCTYPE).getById(id)))
    // The stack deletes a banner when its condition clears, so there can be
    // nothing left to dismiss by the time the user clicks.
    if (!stored) return { data: null }
    // Another client got there first, and the field is idempotent.
    if (isDismissed(stored)) return { data: stored }

    try {
      // _type is written after the document, not before it: a document that
      // carries its own _type would otherwise override the doctype and route
      // the write somewhere else entirely.
      return await client.save({
        ...stored,
        _type: BANNERS_DOCTYPE,
        dismissedAt
      })
    } catch (error) {
      // The write lost a revision race, so the document is read again and the
      // value written on the fresh revision. A second conflict reaches the
      // caller rather than looping.
      if (!isConflict(error) || attempt === DISMISS_ATTEMPTS) throw error
    }
  }
}
