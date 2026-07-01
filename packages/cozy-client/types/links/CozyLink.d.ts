export default class CozyLink {
    constructor(requestHandler: any, persistHandler: any);
    /**
     * Request the given operation from the link
     *
     * @param {any} operation - The operation to request
     * @param {any} options - The request options
     * @param {any} result - The result from the previous request of the chain
     * @param {any} forward - The next request of the chain
     * @returns {Promise<any>}
     */
    request(operation: any, options: any, result: any, forward: any): Promise<any>;
    /**
     * Persist the given data into the links storage
     *
     * @param {any} data - The document to persist
     * @param {any} forward - The next persistCozyData of the chain
     * @returns {Promise<any>}
     */
    persistCozyData(data: any, forward: any): Promise<any>;
    /**
     * Reset the link data
     *
     * @returns {Promise<any>}
     */
    reset(): Promise<any>;
    /**
     * Stable name used to target this link via the `forceLink` query option.
     *
     * @returns {string|undefined}
     */
    get name(): string;
}
export function chain(links: any): any;
