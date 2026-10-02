export default PouchManager;
/**
 * Handles the lifecycle of several pouches
 *
 * - Creates/Destroys the pouches
 * - Replicates periodically
 */
declare class PouchManager {
    constructor(doctypes: any, options: any);
    options: any;
    doctypes: any;
    storage: PouchLocalStorage;
    queryEngine: any;
    client: any;
    PouchDB: any;
    isOnline: any;
    events: any;
    dbQueryEngines: Map<any, any>;
    loopStops: number;
    /** @type {Promise<Loop | void> | null} */
    pendingLoopStart: Promise<Loop | void> | null;
    init(): Promise<void>;
    pouches: {};
    doctypesReplicationOptions: any;
    /** @type {Record<string, import('./types').SyncInfo>} - Stores synchronization info per doctype */
    syncedDoctypes: Record<string, import('./types').SyncInfo>;
    warmedUpQueries: any;
    getReplicationURL: any;
    listenerLaunched: boolean;
    ensureDatabasesExistDone: boolean;
    /**
     * Starts periodic syncing of the pouches
     *
     * When the databases cannot be reached, the loop is not started and the
     * error goes through `onError`, like an error during a replication: it
     * needs to be started again by the owner of PouchManager.
     *
     * Calls made while a start is pending share that start.
     *
     * @returns {Promise<Loop | void>}
     */
    startReplicationLoop(): Promise<Loop | void>;
    /** Stop periodic syncing of the pouches */
    stopReplicationLoop(): void;
    /**
     * Starts replication
     *
     * @param {object} options - The options
     * @param {boolean|null} [options.waitForReplications=true] - Whether the others replication process should be waited
     * @returns {Promise<any>} the replication result
     */
    replicateOnce({ waitForReplications }?: {
        waitForReplications: boolean | null;
    }): Promise<any>;
    executeQuery: any;
    /** @type {import('./types').CancelablePromise[]} - Stores replication promises */
    replications: import('./types').CancelablePromise[];
    addListeners(): void;
    removeListeners(): void;
    destroy(): Promise<(import("./utils").FulfilledPromise | import("./utils").RejectedPromise)[]>;
    /**
     * Via a call to info() we ensure the database exist on the
     * remote side. This is done only once since after the first
     * call, we are sure that the databases have been created.
     *
     * A database can be busy for an instant, typically while another
     * connection holds a lock on it: the call is tried again a few times
     * before the error is thrown.
     */
    ensureDatabasesExist(): Promise<void>;
    /**
     * @private
     * @returns {Promise<Loop | void>}
     */
    private doStartReplicationLoop;
    replicationLoop: Loop;
    /**
     * If a replication is currently ongoing, will start a replication
     * just after it has finished. Otherwise it will start a replication
     * immediately
     */
    syncImmediately(): void;
    handleReplicationError(err: any): void;
    cancelCurrentReplications(): void;
    waitForCurrentReplications(): Promise<void> | Promise<(import("./utils").FulfilledPromise | import("./utils").RejectedPromise)[]>;
    getPouch(dbName: any): any;
    setQueryEngine(name: any, doctype: any): any;
    getQueryEngine(name: any, doctype: any): any;
    /**
     * Update the Sync info for the specifed doctype
     *
     * @param {string} doctype - The doctype to update
     * @param {import('./types').SyncStatus} status - The new Sync status for the doctype
     */
    updateSyncInfo(doctype: string, status?: import('./types').SyncStatus): Promise<void>;
    /**
     * Get the Sync info for the specified doctype
     *
     * @param {string} doctype - The doctype to check
     * @returns {import('./types').SyncInfo}
     */
    getSyncInfo(doctype: string): import('./types').SyncInfo;
    /**
     * Get the Sync status for the specified doctype
     *
     * @param {string} doctype - The doctype to check
     * @returns {import('./types').SyncStatus}
     */
    getSyncStatus(doctype: string): import('./types').SyncStatus;
    clearSyncedDoctypes(): Promise<void>;
    warmupQueries(doctype: any, queries: any): Promise<void>;
    checkToWarmupDoctype(doctype: any, replicationOptions: any): void;
    areQueriesWarmedUp(doctype: any, queries: any): Promise<any>;
    clearWarmedUpQueries(): Promise<void>;
    /**
     * Adds a new doctype to the list of managed doctypes, sets its replication options,
     * creates a new PouchDB instance for it, and sets up the query engine.
     *
     * @param {string} doctype - The name of the doctype to add.
     * @param {Object} replicationOptions - The replication options for the doctype.
     */
    addDoctype(doctype: string, replicationOptions: any): Promise<void>;
    /**
     * Removes a doctype from the list of managed doctypes, deletes its replication options,
     * destroys its PouchDB instance, and removes it from the pouches.
     *
     * @param {string} doctype - The name of the doctype to remove.
     */
    removeDoctype(doctype: string): Promise<void>;
    /**
     * Persists the names of the PouchDB databases.
     *
     * This method is primarily used to ensure that database names are saved for
     * old browsers that do not support `indexeddb.databases()`. This persistence
     * facilitates cleanup processes. Note that PouchDB automatically adds the
     * `_pouch_` prefix to database names.
     *
     * @returns {Promise<void>}
     */
    persistDatabasesNames(): Promise<void>;
}
import { PouchLocalStorage } from "./localStorage";
import Loop from "./loop";
