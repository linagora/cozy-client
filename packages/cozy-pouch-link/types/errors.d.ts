export function isExpiredTokenError(error: any): any;
export function isMissingSQLiteIndexError(error: any): boolean;
export function isMissingPouchDBIndexError(error: any): boolean;
export function isDocumentNotFoundPouchDBError(error: any): boolean;
/**
 * Thrown by the native SQLite mango translator when a selector uses a feature it
 * cannot express in SQL. Raising it is what keeps the translator from emitting
 * `undefined` SQL: every branch either produces valid SQL or throws.
 */
export class UnsupportedMangoSelectorError extends Error {
    /**
     * @param {string} message - What could not be translated
     */
    constructor(message: string);
}
export function isUnsupportedMangoSelectorError(error: any): boolean;
