export function getReplicationURL(uri: string, token: any, doctype: string, replicationOptions?: {
    driveId: string;
}): string;
export default PouchLink;
export type CozyPouchDocument = any;
export type ReplicationStatus = "idle" | "replicating";
export type PouchLinkOptions = {
    /**
     * Whether or not a replication process should be started. Default is false
     */
    initialSync: boolean;
    /**
     * Whether or not the replication should be periodic. Default is true
     */
    periodicSync: boolean;
    /**
     * Debounce delay (in ms) when calling `startReplicationWithDebounce()` method. Should be used only when periodicSync is false. Default is 10 seconds
     */
    syncDebounceDelayInMs?: number;
    /**
     * The maximum duration (in ms) the `startReplicationWithDebounce()` method can be delayed. Should be used only when periodicSync is false. Default is 10 minutes
     */
    syncDebounceMaxDelayInMs?: number;
    /**
     * Milliseconds between periodic replications
     */
    replicationInterval?: number;
    /**
     * Doctypes to replicate
     */
    doctypes: string[];
    /**
     * Whether or not the link is read-only and should forward any write operation
     */
    isReadOnly: boolean;
    /**
     * A mapping from doctypes to replication options. All pouch replication options can be used, as well as the "strategy" option that determines which way the replication is done (can be "sync", "fromRemote" or "toRemote")
     */
    doctypesReplicationOptions: Record<string, object>;
    /**
     * Platform specific adapters and methods
     */
    platform: import('./types').LinkPlatform;
    /**
     * - The performance API that can be used to measure performances
     */
    performanceApi?: any;
};
/**
 * @typedef {import('cozy-client/src/types').CozyClientDocument & { cozyPouchData: any }} CozyPouchDocument *
 * @typedef {"idle"|"replicating"} ReplicationStatus
 */
/**
 * @typedef {object} PouchLinkOptions
 * @property {boolean} initialSync Whether or not a replication process should be started. Default is false
 * @property {boolean} periodicSync Whether or not the replication should be periodic. Default is true
 * @property {number} [syncDebounceDelayInMs] Debounce delay (in ms) when calling `startReplicationWithDebounce()` method. Should be used only when periodicSync is false. Default is 10 seconds
 * @property {number} [syncDebounceMaxDelayInMs] The maximum duration (in ms) the `startReplicationWithDebounce()` method can be delayed. Should be used only when periodicSync is false. Default is 10 minutes
 * @property {number} [replicationInterval] Milliseconds between periodic replications
 * @property {string[]} doctypes Doctypes to replicate
 * @property {boolean} isReadOnly Whether or not the link is read-only and should forward any write operation
 * @property {Record<string, object>} doctypesReplicationOptions A mapping from doctypes to replication options. All pouch replication options can be used, as well as the "strategy" option that determines which way the replication is done (can be "sync", "fromRemote" or "toRemote")
 * @property {import('./types').LinkPlatform} platform Platform specific adapters and methods
 * @property {import('cozy-client/src/performances/types').PerformanceAPI} [performanceApi] - The performance API that can be used to measure performances
 */
/**
 * Link to be passed to a `CozyClient` instance to support CouchDB. It instantiates
 * PouchDB collections for each doctype that it supports and knows how
 * to respond to queries and mutations.
 */
declare class PouchLink extends CozyLink {
    /**
     * Return the PouchDB adapter name.
     * Should be IndexedDB for newest adapters.
     *
     * @param {import('./types').LocalStorage} localStorage Methods to access local storage
     * @returns {Promise<string>} The adapter name
     */
    static getPouchAdapterName: (localStorage: import('./types').LocalStorage) => Promise<string>;
    /**
     * constructor - Initializes a new PouchLink
     *
     * @param {PouchLinkOptions} [opts={}]
     */
    constructor(opts?: PouchLinkOptions);
    options: {
        replicationInterval: number;
    } & PouchLinkOptions;
    doctypes: string[];
    doctypesReplicationOptions: Record<string, any>;
    indexes: {};
    /** @private Cache of per-drive logical-typed query engines, keyed by `dbDoctype::logicalDoctype`. */
    private _driveQueryEngines;
    storage: PouchLocalStorage;
    initialSync: boolean;
    periodicSync: boolean;
    /** @type {Record<string, ReplicationStatus>} - Stores replication states per doctype */
    replicationStatus: Record<string, ReplicationStatus>;
    /** @private */
    private startReplicationDebounced;
    /** @type {import('cozy-client/src/performances/types').PerformanceAPI} */
    performanceApi: any;
    /**
     * Get the authenticated replication URL for a specific doctype
     *
     * @param {string} doctype - The document type to replicate (e.g., 'io.cozy.files')
     * @param {object} [replicationOptions={}] - Replication options
     * @param {string} [replicationOptions.driveId] - The ID of the shared drive to replicate (for shared drives)
     * @returns {string} The authenticated replication URL
     */
    getReplicationURL(doctype: string, replicationOptions?: {
        driveId: string;
    }): string;
    registerClient(client: any): Promise<void>;
    client: any;
    /**
     * Migrate the current adapter
     *
     * @typedef {object} MigrationParams
     * @property {string} [fromAdapter] - The current adapter type, e.g. 'idb'
     * @property {string} [toAdapter] - The new adapter type, e.g. 'indexeddb'
     * @property {string} [url] - The Cozy URL
     * @property {Array<object>} [plugins] - The PouchDB plugins
     *
     * @param {MigrationParams} params - Migration params
     */
    migrateAdapter({ fromAdapter, toAdapter, url, plugins }: {
        /**
         * - The current adapter type, e.g. 'idb'
         */
        fromAdapter?: string;
        /**
         * - The new adapter type, e.g. 'indexeddb'
         */
        toAdapter?: string;
        /**
         * - The Cozy URL
         */
        url?: string;
        /**
         * - The PouchDB plugins
         */
        plugins?: Array<object>;
    }): Promise<void>;
    onLogin(): Promise<void>;
    queryEngine: import("./db/dbInterface").default | typeof PouchDBQueryEngine;
    pouches: PouchManager;
    /**
     * Receives PouchDB updates (documents grouped by doctype).
     * Normalizes the data (.id -> ._id, .rev -> _rev).
     * Passes the data to the client and to the onSync handler.
     *
     * Emits an event (pouchlink:sync:end) when the sync (all doctypes) is done
     */
    handleOnSync(doctypeUpdates: any): void;
    handleDoctypeSyncStart(doctype: any): void;
    handleDoctypeSyncEnd(doctype: any): void;
    /**
     * @private
     */
    private _startReplication;
    /**
     * User of the link can call this to start ongoing replications.
     * Typically, it can be used when the application regains focus.
     *
     * Emits pouchlink:sync:start event when the replication begins
     *
     * @public
     *
     * @param {object} options - The options
     * @param {boolean|null} [options.waitForReplications=true] - Whether the others replication process should be waited
     * @returns {void}
     */
    public startReplication({ waitForReplications }?: {
        waitForReplications: boolean | null;
    }): void;
    /**
     * Debounced version of startReplication() method
     *
     * Debounce delay can be configured through constructor's `syncDebounceDelayInMs` option
     *
     * @public
     * @param {object} options - The options
     * @param {boolean|null} [options.waitForReplications=true] - Whether the others replication process should be waited
     * @returns {void}
     */
    public startReplicationWithDebounce({ waitForReplications }?: {
        waitForReplications: boolean | null;
    }): void;
    /**
     * User of the link can call this to stop ongoing replications.
     * Typically, it can be used when the applications loses focus.
     *
     * Emits pouchlink:sync:stop event
     *
     * @public
     * @returns {void}
     */
    public stopReplication(): void;
    onSyncError(error: any): Promise<void>;
    getSyncInfo(doctype: any): import("./types").SyncInfo;
    /**
     * Returns the registered physical doctype for a given logical doctype and query options.
     *
     * @param {any} logicalDoctype - The logical doctype
     * @param {object} [options] - Optional query options
     */
    getDbDoctype(logicalDoctype: any, options?: object): any;
    /**
     * @param {any} doctype - The doctype
     * @param {object} [options] - Optional query options
     */
    getQueryEngineFromDoctype(doctype: any, options?: object): any;
    getPouch(doctype: any): any;
    supportsOperation(operation: any, options: any): boolean;
    /**
     * Get PouchDB changes
     * See https://pouchdb.com/api.html#changes
     *
     * @param {string} doctype - The PouchDB database's doctype
     * @param {object} options - The changes options. See https://pouchdb.com/api.html#changes
     * @returns {Promise<import('./types').PouchDBChangesResults>} The changes
     */
    getChanges(doctype: string, options: object): Promise<import('./types').PouchDBChangesResults>;
    /**
     * Get PouchDB database info
     * See https://pouchdb.com/api.html#database_information
     *
     * @param {string} doctype - The PouchDB database's doctype
     * @returns {Promise<import('./types').PouchDBInfo>} The db info
     */
    getDbInfo(doctype: string): Promise<import('./types').PouchDBInfo>;
    /**
     *
     * Check if there is warmup queries for this doctype
     * and return if those queries are already warmed up or not
     *
     * @param {string} doctype - Doctype to check
     * @returns {Promise<boolean>} the need to wait for the warmup
     */
    needsToWaitWarmup(doctype: string): Promise<boolean>;
    hasIndex(name: any): boolean;
    /**
     * @param {object} operation - The query operation
     * @param {object} [options] - Optional query options
     */
    executeQuery({ doctype, selector, sort, fields, limit, id, ids, skip, indexedFields, partialFilter, sharingId }: object, options?: object): Promise<any>;
    executeMutation(mutation: any, options: any, result: any, forward: any): Promise<any>;
    createDocument(mutation: any): Promise<any>;
    createDocuments(mutation: any): Promise<any[]>;
    updateDocument(mutation: any): Promise<any>;
    updateDocuments(mutation: any): Promise<any[]>;
    deleteDocument(mutation: any): Promise<any>;
    deleteDocuments(mutation: any): Promise<any[]>;
    bulkMutation(mutation: any): Promise<any[]>;
    addReferencesTo(mutation: any): Promise<void>;
    dbMethod(method: any, mutation: any): Promise<any>;
    syncImmediately(): Promise<void>;
    /**
     * Adds a new doctype to the list of managed doctypes, sets its replication options,
     * adds it to the pouches, and starts replication. Does nothing when the doctype is
     * already managed, so the list stays free of duplicates.
     *
     * @param {string} doctype - The name of the doctype to add.
     * @param {Object} replicationOptions - The replication options for the doctype.
     * @param {Object} options - The replication options for the doctype.
     * @param {boolean} [options.shouldStartReplication=true] - Whether the replication should be started.
     */
    addDoctype(doctype: string, replicationOptions: any, options: {
        shouldStartReplication: boolean;
    }): Promise<void>;
    /**
     * Removes a doctype from the list of managed doctypes, deletes its replication options,
     * and removes it from the pouches.
     *
     * @param {string} doctype - The name of the doctype to remove.
     */
    removeDoctype(doctype: string): Promise<void>;
    getSharedDriveDoctypes(): string[];
}
import { CozyLink } from "cozy-client";
import { PouchLocalStorage } from "./localStorage";
import PouchDBQueryEngine from "./db/pouchdb/pouchdb";
import PouchManager from "./PouchManager";
