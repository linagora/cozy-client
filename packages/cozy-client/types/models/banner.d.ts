export const BANNERS_DOCTYPE: "io.cozy.banners";
export function getActiveBanners(client: object, { now }?: {
    now: Date;
}): Promise<Banner[]>;
export function getActiveBanner(client: object, options?: {
    now: Date;
}): Promise<Banner | null>;
export function dismiss(client: object, banner: Banner, { dismissedAt }?: {
    dismissedAt: string;
}): Promise<{
    data: Banner | null;
}>;
export type BannerCta = {
    /**
     * - The label, plain text
     */
    label: string;
    /**
     * - Where the label points
     */
    url: string;
};
/**
 * An io.cozy.banners document
 */
export type Banner = {
    /**
     * - Identifier of the document
     */
    _id?: string;
    /**
     * - Identifier of the banner itself
     */
    bannerId: string;
    /**
     * - What the banner is about
     */
    category: string;
    /**
     * - How loudly to render it
     */
    severity: 'info' | 'warning' | 'error';
    /**
     * - Where to render it
     */
    surface: 'banner' | 'modal';
    /**
     * - Optional heading, used on the modal surface
     */
    title?: string;
    /**
     * - The message, already localized
     */
    text: string;
    /**
     * - Optional call to action
     */
    cta?: BannerCta;
    /**
     * - Whether the client offers a dismiss control
     */
    dismissible: boolean;
    /**
     * - When the user dismissed it
     */
    dismissedAt?: string;
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
    endsAt?: string;
};
