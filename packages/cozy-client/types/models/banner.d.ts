export const BANNERS_DOCTYPE: "io.cozy.banners";
/**
 * The version of the io.cozy.banners shape this code was written against.
 * A document declaring a higher cozyMetadata.doctypeVersion is skipped.
 */
export const SUPPORTED_DOCTYPE_VERSION: 1;
/**
 * The severities the doctype defines. A value outside this list is rendered
 * with DEFAULT_SEVERITY. Frozen because the fallbacks read it at call time, so
 * a consumer mutating it would change what every other consumer renders.
 *
 * @type {readonly BannerSeverity[]}
 */
export const KNOWN_SEVERITIES: readonly BannerSeverity[];
/**
 * The surfaces the doctype defines. A value outside this list is rendered on
 * DEFAULT_SURFACE. Frozen for the same reason as KNOWN_SEVERITIES.
 *
 * @type {readonly BannerSurface[]}
 */
export const KNOWN_SURFACES: readonly BannerSurface[];
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
export const BANNERS_QUERY_NAME: string;
export function buildBannersQuery(): import('../types').Query;
export function isTrusted(banner: Banner): boolean;
export function isSupported(banner: Banner, supportedVersion?: number): boolean;
export function isDismissed(banner: Banner): boolean;
export function isInWindow(banner: Banner, now?: Date): boolean;
export function byPriority(a: Banner, b: Banner): number;
export function getSeverity(banner: Banner): BannerSeverity;
export function getSurface(banner: Banner): BannerSurface;
export function getCta(banner: Banner): BannerCta | null;
export function getVisibleBanners(banners: Banner[], options?: VisibleBannersOptions): Banner[];
export function getActiveBanners(client: BannerClient, options?: VisibleBannersOptions): Promise<Banner[]>;
export function getActiveBanner(client: BannerClient, options?: VisibleBannersOptions): Promise<Banner | null>;
export function dismiss(client: BannerClient, banner: Banner & {
    _id: string;
}, options?: DismissOptions): Promise<{
    data: Banner | null;
}>;
export type BannerCta = {
    /**
     * - The label, plain text, in the same language as the banner text
     */
    label: string;
    /**
     * - Absolute https URL the label points to
     */
    url: string;
};
export type BannerCategory = "account" | "quota" | "billing" | "trial" | "system";
export type BannerSeverity = "info" | "error" | "warning";
export type BannerSurface = "banner" | "modal";
export type VisibleBannersOptions = {
    /**
     * - The current time, defaults to now
     */
    now?: Date;
    /**
     * - The highest version this client handles
     */
    supportedDoctypeVersion?: number;
};
/**
 * A CozyClient instance
 */
export type BannerClient = import("../CozyClient").default;
export type DismissOptions = {
    /**
     * - The timestamp to record, defaults to now
     */
    dismissedAt?: string;
};
/**
 * An io.cozy.banners document
 */
export type Banner = {
    /**
     * - Identifier of the document, minted by CouchDB
     */
    _id?: string;
    /**
     * - Revision identifier of the document
     */
    _rev?: string;
    /**
     * - Identifier of the banner itself
     */
    bannerId: string;
    /**
     * - What the banner is about
     */
    category: BannerCategory;
    /**
     * - info, warning or error
     */
    severity: BannerSeverity;
    /**
     * - banner or modal
     */
    surface: BannerSurface;
    /**
     * - The message, in the language given by lang
     */
    text: string;
    /**
     * - BCP 47 tag of the language text is written in
     */
    lang: string;
    /**
     * - Optional call to action
     */
    cta?: BannerCta | null;
    /**
     * - Whether the client offers a dismiss control
     */
    dismissible: boolean;
    /**
     * - When the user dismissed this banner
     */
    dismissedAt?: string | null;
    /**
     * - Sort order, highest first
     */
    priority: number;
    /**
     * - Start of the validity window, inclusive
     */
    startsAt: string;
    /**
     * - End of the validity window, exclusive
     */
    endsAt?: string | null;
    /**
     * - What produced the document
     */
    source?: object;
    /**
     * - Document lifecycle metadata
     */
    cozyMetadata?: object;
};
