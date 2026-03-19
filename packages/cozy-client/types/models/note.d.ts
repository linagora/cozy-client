export function generatePrivateUrl(notesAppUrl: string, file: object, options?: {}): string;
export function generateUrlForNote(notesAppUrl: any, file: any): string;
export function fetchURL(client: object, file: object, { pathname, driveId, returnUrl }?: FetchURLOptions): Promise<string>;
export type FetchURLOptions = {
    /**
     * - Pathname to use in the URL
     */
    pathname?: string;
    /**
     * - Shared drive ID used to fetch the URL
     */
    driveId?: string;
    /**
     * - Return URL to add in query string
     */
    returnUrl?: string;
};
