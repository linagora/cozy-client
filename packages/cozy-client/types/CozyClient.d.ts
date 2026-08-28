export default CozyClient;
export type CozyClientDocument = {
    /**
     * - Id of the document
     */
    _id?: string;
    /**
     * - Id of the document
     */
    id?: string;
    /**
     * - Type of the document
     */
    _type?: string;
    /**
     * - Current revision of the document
     */
    _rev?: string;
    /**
     * - When the document has been deleted
     */
    _deleted?: boolean;
    /**
     * - Relationships of the document
     */
    relationships?: import("./types").ReferencedByRelationship;
    /**
     * - referenced by of another document
     */
    referenced_by?: import("./types").Reference[];
    /**
     * - Cozy Metadata
     */
    cozyMetadata?: import("./types").CozyMetadata;
    /**
     * - Pouch Metadata
     */
    meta?: import("./types").CozyClientDocumentMeta;
    /**
     * - When true the document should NOT be replicated to the remote database
     */
    cozyLocalOnly?: boolean;
    /**
     * - Id of a shared drive, only for shared io.cozy.files
     */
    driveId?: string;
};
export type ClientOptions = {
    client?: object;
    link?: object;
    links?: object;
    token?: import("./types").Token;
    uri?: string;
    stackClient?: object;
    warningForCustomHandlers?: boolean;
    /**
     * - If set to true, all documents will be hydrated w.r.t. the provided schema's relationships, even if the relationship does not exist on the doc.
     */
    autoHydrate?: boolean;
    /**
     * - If set to true, backgroundFetching will be enabled by default on every query. Meaning that, when the fetchStatus has already been loaded, it won't be updated during future fetches. Instead, a `isFetching` attribute will be used to indicate when background fetching is started.
     */
    backgroundFetching?: boolean;
    oauth?: object;
    onTokenRefresh?: Function;
    /**
     * - Default callback if a query is errored
     */
    onError?: Function;
    /**
     * - Schema description for each doctypes
     */
    schema?: object;
    /**
     * - Metadata about the application that will be used in ensureCozyMetadata
     */
    appMetadata?: import("./types").AppMetadata;
    /**
     * - Capabilities sent by the stack
     */
    capabilities?: import("./types").ClientCapabilities;
    /**
     * - If set to true, the client will not instantiate a Redux store automatically. Use this if you want to merge cozy-client's store with your own redux store. Note will have to call `setStore` eventually. See [here](https://docs.cozy.io/en/cozy-client/react-integration/#1b-use-your-own-redux-store) for more information.
     */
    useCustomStore?: boolean;
    /**
     * - If set to true, the client will not leverage the redux store to execute queries and store data.
     */
    disableStoreForQueries?: boolean;
    /**
     * - The performance API that can be used to measure performances
     */
    performanceApi?: import('./performances/types').PerformanceAPI;
};
/**
 * @typedef {import("./types").CozyClientDocument} CozyClientDocument
 *
 * @typedef {object} ClientOptions
 * @property {object} [client]
 * @property {object} [link]
 * @property {object} [links]
 * @property {import("./types").Token} [token]
 * @property {string} [uri]
 * @property {object} [stackClient]
 * @property {boolean} [warningForCustomHandlers]
 * @property {boolean} [autoHydrate] - If set to true, all documents will be hydrated w.r.t. the provided schema's relationships, even if the relationship does not exist on the doc.
 * @property {boolean} [backgroundFetching] - If set to true, backgroundFetching will be enabled by default on every query. Meaning that, when the fetchStatus has already been loaded, it won't be updated during future fetches. Instead, a `isFetching` attribute will be used to indicate when background fetching is started.
 * @property {object} [oauth]
 * @property {Function} [onTokenRefresh]
 * @property {Function} [onError] - Default callback if a query is errored
 * @property  {import("./types").Link}         [link]   - Backward compatibility
 * @property  {Array<import("./types").Link>}  [links]  - List of links
 * @property  {object}       [schema] - Schema description for each doctypes
 * @property  {import("./types").AppMetadata}  [appMetadata] - Metadata about the application that will be used in ensureCozyMetadata
 * @property  {import("./types").ClientCapabilities} [capabilities] - Capabilities sent by the stack
 * @property  {boolean} [useCustomStore=false] - If set to true, the client will not instantiate a Redux store automatically. Use this if you want to merge cozy-client's store with your own redux store. Note will have to call `setStore` eventually. See [here](https://docs.cozy.io/en/cozy-client/react-integration/#1b-use-your-own-redux-store) for more information.
 * @property  {boolean} [disableStoreForQueries=false] - If set to true, the client will not leverage the redux store to execute queries and store data.
 * @property {import('./performances/types').PerformanceAPI} [performanceApi] - The performance API that can be used to measure performances
 */
/**
 * Responsible for
 *
 * - Creating observable queries
 * - Hydration
 * - Creating plan for saving documents
 * - Associations
 */
declare class CozyClient {
    /**
     * To help with the transition from cozy-client-js to cozy-client, it is possible to instantiate
     * a client with a cookie-based instance of cozy-client-js.
     *
     * @param {import("./types").OldCozyClient} oldClient - An instance of the deprecated cozy-client
     * @param {object} options - CozyStackClient options
     * @returns {CozyClient}
     */
    static fromOldClient(oldClient: import("./types").OldCozyClient, options: object): CozyClient;
    /**
     * To help with the transition from cozy-client-js to cozy-client, it is possible to instantiate
     * a client with an OAuth-based instance of cozy-client-js.
     *
     * Warning: unlike other instantiators, this one needs to be awaited.
     *
     * @param {import("./types").OldCozyClient} oldClient - An OAuth instance of the deprecated cozy-client
     * @param {object} options - CozyStackClient options
     * @returns {Promise<CozyClient>} An instance of a client, configured from the old client
     */
    static fromOldOAuthClient(oldClient: import("./types").OldCozyClient, options: object): Promise<CozyClient>;
    /**
     * In konnector/service context, CozyClient can be instantiated from
     * environment variables
     *
     * @param  {import("./types").NodeEnvironment} [envArg]  - The environment
     * @param  {object} options - Options
     * @returns {CozyClient}
     */
    static fromEnv(envArg?: import("./types").NodeEnvironment, options?: object): CozyClient;
    /**
     * When used from an app, CozyClient can be instantiated from the data injected by the stack in
     * the DOM.
     *
     * @param  {object}   options  - CozyClient constructor options
     * @param  {string}   selector - Options
     * @returns {CozyClient} - CozyClient instance
     */
    static fromDOM(options?: object, selector?: string): CozyClient;
    /**
     * Hooks are an observable system for events on documents.
     * There are at the moment only 2 hooks available.
     *
     * - before:destroy, called just before a document is destroyed via CozyClient::destroy
     * - after:destroy, called after a document is destroyed via CozyClient::destroy
     *
     * @example
     * ```
     * CozyClient.registerHook('io.cozy.bank.accounts', 'before:destroy', () => {
     *   console.log('A io.cozy.bank.accounts is being destroyed')
     * })
     * ```
     *
     * @param  {string}   doctype - Doctype on which the hook will be registered
     * @param  {string}   name    - Name of the hook
     * @param  {Function} fn      - Callback to be executed
     */
    static registerHook(doctype: string, name: string, fn: Function): void;
    /**
     * @param  {ClientOptions} rawOptions - Options
     *
     * @example
     * ```js
     * const client = new CozyClient({
     *   schema: {
     *     todos: {
     *       doctype: 'io.cozy.todos',
     *       relationships: {
     *         authors: {
     *           type: 'has-many',
     *           doctype: 'io.cozy.persons'
     *         }
     *       }
     *     }
     *   }
     * })
     * ```
     *
     * Cozy-Client will automatically call `this.login()` if provided with a token and an uri
     */
    constructor(rawOptions?: ClientOptions);
    /** @type {import('./performances/types').PerformanceAPI} */
    performanceApi: import('./performances/types').PerformanceAPI;
    appMetadata: import("./types").AppMetadata;
    loginPromise: Promise<void>;
    options: {
        client?: object;
        token?: import("./types").Token;
        uri?: string;
        stackClient?: object;
        warningForCustomHandlers?: boolean;
        /**
         * - If set to true, all documents will be hydrated w.r.t. the provided schema's relationships, even if the relationship does not exist on the doc.
         */
        autoHydrate?: boolean;
        /**
         * - If set to true, backgroundFetching will be enabled by default on every query. Meaning that, when the fetchStatus has already been loaded, it won't be updated during future fetches. Instead, a `isFetching` attribute will be used to indicate when background fetching is started.
         */
        backgroundFetching?: boolean;
        oauth?: object;
        onTokenRefresh?: Function;
        /**
         * - Default callback if a query is errored
         */
        onError?: Function;
        /**
         * - If set to true, the client will not instantiate a Redux store automatically. Use this if you want to merge cozy-client's store with your own redux store. Note will have to call `setStore` eventually. See [here](https://docs.cozy.io/en/cozy-client/react-integration/#1b-use-your-own-redux-store) for more information.
         */
        useCustomStore?: boolean;
        /**
         * - If set to true, the client will not leverage the redux store to execute queries and store data.
         */
        disableStoreForQueries?: boolean;
    };
    queryIdGenerator: QueryIDGenerator;
    isLogged: boolean;
    instanceOptions: {};
    /** Sets public attribute and emits event related to revocation */
    handleRevocationChange(state: any): void;
    /** Emits event when token is refreshed */
    handleTokenRefresh(token: any): void;
    schema: Schema;
    /**
     * @type {import("./types").ClientCapabilities}
     */
    capabilities: import("./types").ClientCapabilities;
    plugins: {};
    /**
     * Holds in-flight promises for deduplication purpose
     *
     * @private
     * @type {PromiseCache}
     */
    private _promiseCache;
    /**
     * @type {object}
     */
    storeAccesors: object;
    useCustomStore: boolean;
    autoHydrate: boolean;
    disableStoreForQueries: boolean;
    /**
     * Gets overrided by MicroEE.mixin
     * This is here just so typescript does not scream
     *
     * TODO Find a better way to make TS understand that emit is
     * a method from cozy-client
     */
    emit(...args: any[]): void;
    on(...args: any[]): void;
    removeListener(...args: any[]): void;
    /**
     * A plugin is a class whose constructor receives the client as first argument.
     * The main mean of interaction with the client should be with events
     * like "login"/"logout".
     *
     * The plugin system is meant to encourage separation of concerns, modularity
     * and testability : instead of registering events at module level, please
     * create a plugin that subscribes to events.
     *
     * Plugin instances are stored internally in the `plugins` attribute of the client
     * and can be accessed via this mean. A plugin class must have the attribute
     * `pluginName` that will be use as the key in the `plugins` object.
     *
     * Two plugins with the same `pluginName` cannot co-exist.
     *
     * @example
     * ```js
     * class AlertPlugin {
     *   constructor(client, options) {
     *     this.client = client
     *     this.options = options
     *     this.handleLogin = this.handleLogin.bind(this)
     *     this.handleLogout = this.handleLogout.bind(this)
     *     this.client.on("login", this.handleLogin)
     *     this.client.on("logout", this.handleLogout)
     *   }
     *
     *   handleLogin() {
     *     alert(this.options.onLoginAlert)
     *   }
     *
     *   handleLogout() {
     *     alert(this.options.onLogoutAlert)
     *   }
     * }
     *
     * AlertPlugin.pluginName = 'alerts'
     *
     * client.registerPlugin(AlertPlugin, {
     *   onLoginAlert: 'client has logged in !',
     *   onLogoutAlert: 'client has logged out !'
     * })
     *
     * // the instance of the plugin is accessible via
     * client.plugins.alerts
     * ```
     */
    registerPlugin(Plugin: any, options: any): any;
    addSchema(schemaDefinition: any): void;
    registerClientOnLinks(): void;
    /**
     * Notify the links that they can start and set isLogged to true.
     *
     * On mobile, where url/token are set after instantiation, use this method
     * to set the token and uri via options.
     *
     * Emits
     *
     * - "beforeLogin" at the beginning, before links have been set up
     * - "login" when the client is fully logged in and links have been set up
     *
     * @param  {object}   [options] - Options
     * @param  {string}   options.token  - If passed, the token is set on the client
     * @param  {string}   options.uri  - If passed, the uri is set on the client
     * @returns {Promise} - Resolves when all links have been setup and client is fully logged in
     *
     */
    login(options?: {
        token: string;
        uri: string;
    }): Promise<any>;
    _login(options: any): Promise<void>;
    isRevoked: boolean;
    /**
     * Logs out the client and reset all the links
     *
     * Emits
     *
     * - "beforeLogout" at the beginning, before links have been reset
     * - "logout" when the client is fully logged out and links have been reset
     *
     * @returns {Promise} - Resolves when all links have been reset and client is fully logged out
     */
    logout(): Promise<any>;
    /**
     * Forwards to a stack client instance and returns
     * a [DocumentCollection]{@link https://docs.cozy.io/en/cozy-client/api/cozy-stack-client/#DocumentCollection} instance.
     *
     * @param  {string} doctype The collection doctype.
     * @param  {object} options Options to pass to the collection
     * @returns {import("./types").DocumentCollection} Collection corresponding to the doctype
     */
    collection(doctype: string, options?: object): import("./types").DocumentCollection;
    fetch(method: any, path: any, body: any, options?: {}): any;
    all(doctype: any): QueryDefinition;
    find(doctype: any, selector?: any): QueryDefinition;
    get(doctype: any, id: any): QueryDefinition;
    validate(document: any): Promise<{}>;
    /**
     * Creates a document and saves it on the server
     *
     * @param  {string} type - Doctype of the document
     * @param  {object} doc - Document to save
     * @param  {import("./types").ReferenceMap} [references] - References are a special kind of relationship
     * that is not stored inside the referencer document, they are used for example between a photo
     * and its album. You should not need to use it normally.
     * @param  {object} options - Mutation options
     *
     * @example
     * ```js
     * await client.create('io.cozy.todos', {
     *   label: 'My todo',
     *   relationships: {
     *     authors: {
     *       data: [{_id: 1, _type: 'io.cozy.persons'}]
     *     }
     *   }
     * })
     * ```
     *
     * @returns {Promise}
     */
    create(type: string, doc: object, references?: import("./types").ReferenceMap, options?: object): Promise<any>;
    /**
     * Create multiple documents in one batch.
     * WARNING: this method is currently not supported by the stack, but
     * works with PouchDB
     *
     * @param  {import("./types").CozyClientDocument[]} docs - Documents to create. Should not have _id nor _rev
     * @param {object} [options] - options
     * @returns {Promise}
     */
    createAll(docs: import("./types").CozyClientDocument[], options?: object): Promise<any>;
    /**
     * Create or update a document
     *
     * @param  {object} doc - Document to save
     * @param {object} [options] - options
     * @returns {Promise}
     */
    save(doc: object, options?: object): Promise<any>;
    /**
     * Updates multiple documents in one batch. Should have _id and _rev
     *
     * @param  {import("./types").CozyClientDocument[]} docs - Documents from the same doctype
     * @param {object} [options] - options
     * @returns {Promise<void>}
     */
    updateAll(docs: import("./types").CozyClientDocument[], options?: object): Promise<void>;
    /**
     * Create or update multiple documents in one batch
     * - Can only be called with documents from the same doctype
     * - Can either be creation (no _id nor _rev) or update, not both
     * - Does not support automatic creation of references
     *
     * WARNING: multiple creations is currently not supported by the stack, but
     * works with PouchDB
     *
     * @param  {import("./types").CozyClientDocument[]} docs - Documents from the same doctype
     * @param {object} [options] - options
     * @returns {Promise<void>}
     */
    saveAll(docs: import("./types").CozyClientDocument[], options?: object): Promise<void>;
    /**
     * @param  {import("./types").CozyClientDocument} document - Document that will be saved
     * @param {object} [options={event: DOC_CREATION}] - Event
     * @param {string} [options.event] - Mutation type
     * @returns {import("./types").CozyClientDocument}
     */
    ensureCozyMetadata(document: import("./types").CozyClientDocument, options?: {
        event?: string;
    }): import("./types").CozyClientDocument;
    /**
     * Dehydrates and adds metadata before saving a document
     *
     * @param  {import("./types").CozyClientDocument} doc - Document that will be saved
     * @returns {import("./types").CozyClientDocument}
     */
    prepareDocumentForSave(doc: import("./types").CozyClientDocument): import("./types").CozyClientDocument;
    /**
     * Creates a list of mutations to execute to create a document and its relationships.
     *
     * ```js
     * const baseDoc = { _type: 'io.cozy.todo', label: 'Go hiking' }
     * // relations can be arrays or single objects
     * const relationships = {
     *   attachments: [{ _id: 12345, _type: 'io.cozy.files' }, { _id: 6789, _type: 'io.cozy.files' }],
     *   bills: { _id: 9999, _type: 'io.cozy.bills' }
     * }
     * client.getDocumentSavePlan(baseDoc, relationships)
     * ```
     *
     *
     * @param  {import("./types").CozyClientDocument} document - Document to create
     * @param  {import("./types").ReferenceMap} [referencesByName] - References to the created document. The
     * relationship class associated to each reference list should support references, otherwise this
     * method will throw.
     *
     * @returns {import("./types").Mutation[]|import("./types").Mutation}  One or more mutation to execute
     */
    getDocumentSavePlan(document: import("./types").CozyClientDocument, referencesByName?: import("./types").ReferenceMap): import("./types").Mutation[] | import("./types").Mutation;
    triggerHook(name: any, document: any): void;
    /**
     * Destroys a document. {before,after}:destroy hooks will be fired.
     *
     * @param  {import("./types").CozyClientDocument} document - Document to be deleted
     * @param {object} [options] - options
     * @returns {Promise<import("./types").CozyClientDocument>} The document that has been deleted
     */
    destroy(document: import("./types").CozyClientDocument, options?: object): Promise<import("./types").CozyClientDocument>;
    /**
     * Destroy multiple documents
     *
     * @param  {Array<import("./types").CozyClientDocument>} documents - Documents to be deleted
     * @param {object} [options] - options
     * @returns {Promise<Array<import("./types").CozyClientDocument>>} The deleted documents
     */
    destroyAll(documents: Array<import("./types").CozyClientDocument>, options?: object): Promise<Array<import("./types").CozyClientDocument>>;
    /**
     * Upload a file
     *
     * @param  {File|Blob|import('cozy-stack-client/dist/FileCollection').Stream|string|ArrayBuffer} file - File to be uploaded
     * @param {string} dirPath - Path to upload the file to. ie : /Administative/XXX/
     * @param {object} [options] - Optionnal request options
     * @returns {Promise<object>} Created io.cozy.files
     */
    upload(file: File | Blob | import('cozy-stack-client/dist/FileCollection').Stream | string | ArrayBuffer, dirPath: string, options?: object): Promise<object>;
    /**
     * Makes sure that the query exists in the store
     *
     * @param  {string} queryId - Id of the query
     * @param  {QueryDefinition} queryDefinition - Definition of the query
     * @param  {import("./types").QueryOptions} [options] - Additional options
     */
    ensureQueryExists(queryId: string, queryDefinition: QueryDefinition, options?: import("./types").QueryOptions): void;
    /**
     * Executes a query and returns its results.
     *
     * Results from the query will be saved internally and can be retrieved via
     * `getQueryFromState` or directly using `<Query />`. `<Query />` automatically
     * executes its query when mounted if no fetch policy has been indicated.
     *
     * If the query is called under the fetch policy's delay, then the query
     * is not executed and nothing is returned. If you need a result anyway,
     * please use `fetchQueryAndGetFromState` instead
     *
     * @param  {QueryDefinition} queryDefinition - Definition that will be executed
     * @param  {import("./types").QueryOptions} [options] - Options
     * @returns {Promise<import("./types").QueryResult>}
     */
    query(queryDefinition: QueryDefinition, { update, executeFromStore, ...options }?: import("./types").QueryOptions): Promise<import("./types").QueryResult>;
    /**
     * Will fetch all documents for a `queryDefinition`, automatically fetching more
     * documents if the total of documents is superior to the pagination limit. Can
     * result in a lot of network requests.
     *
     * @param  {QueryDefinition} queryDefinition - Definition to be executed
     * @param {import("./types").QueryOptions} [options] - Options
     * @returns {Promise<import("./types").QueryResult>} All documents matching the query
     */
    queryAll(queryDefinition: QueryDefinition, options?: import("./types").QueryOptions): Promise<import("./types").QueryResult>;
    watchQuery(...args: any[]): ObservableQuery;
    makeObservableQuery(queryDefinition: any, options?: {}): ObservableQuery;
    /**
     * Mutate a document
     *
     * @param  {object} mutationDefinition - Describe the mutation
     * @param {object} [params] The mutation params
     * @param {function} [params.update] - update function from MutationOptions
     * @param {function} [params.updateQueries] - updateQueries function from MutationOptions
     * @param {string} [params.as] - Mutation id
     * @param {Object} [params.options={}] - Additional options
     * @returns {Promise}
     */
    mutate(mutationDefinition: object, { update, updateQueries, ...options }?: {
        update?: Function;
        updateQueries?: Function;
        as?: string;
        options?: any;
    }): Promise<any>;
    /**
     * Executes a query through links and fetches relationships
     *
     * @private
     * @param  {QueryDefinition} definition QueryDefinition to be executed
     * @returns {Promise<import("./types").ClientResponse>}
     */
    private requestQuery;
    /**
     * Fetch relationships for a response (can be several docs).
     * Fills the `relationships` attribute of each documents.
     *
     * Can potentially result in several fetch requests.
     * Queries are optimized before being sent (multiple single documents queries can be packed into
     * one multiple document query) for example.
     *
     * @private
     */
    private fetchRelationships;
    requestMutation(definition: any, options: any): any;
    getIncludesRelationships(queryDefinition: any): import("lodash").Dictionary<any>;
    /**
     * Returns documents with their relationships resolved according to their schema.
     * If related documents are not in the store, they will not be fetched automatically.
     * Instead, the relationships will have null documents.
     *
     * @param  {string} doctype - Doctype of the documents being hydrated
     * @param  {Array<import("./types").CozyClientDocument>} documents - Documents to be hydrated
     * @param  {object} [options] - Options
     * @param  {boolean} [options.forceHydratation=false] - If set to true, all documents will be hydrated w.r.t. the provided schema's relationships, even if the relationship does not exist on the doc.
     * @returns {Array<import("./types").HydratedDocument>}
     */
    hydrateDocuments(doctype: string, documents: Array<import("./types").CozyClientDocument>, { forceHydratation }?: {
        forceHydratation?: boolean;
    }): Array<import("./types").HydratedDocument>;
    /**
     * Resolves relationships on a document.
     *
     * The original document is kept in the target attribute of
     * the relationship.
     *
     * @param  {import("./types").CozyClientDocument} document - for which relationships must be resolved
     * @param  {Schema} [schemaArg] - The schema describing the relationships
     * @param  {object} [options] - Options
     * @param  {boolean} [options.forceHydratation=false] - If set to true, the doc will be hydrated w.r.t. the provided schema's relationships, even if the relationship does not exist on the doc.
     * @returns {import("./types").HydratedDocument}
     */
    hydrateDocument(document: import("./types").CozyClientDocument, schemaArg?: Schema, { forceHydratation }?: {
        forceHydratation?: boolean;
    }): import("./types").HydratedDocument;
    hydrateRelationships(document: any, schemaRelationships: any, { forceHydratation }?: {
        forceHydratation?: boolean;
    }): {
        [x: string]: any;
    };
    generateRandomId(): string;
    /**
     * Creates an association that is linked to the store.
     */
    getAssociation(document: any, associationName: any): any;
    /**
     * Returns the accessors that are given to the relationships for them
     * to deal with the stores.
     *
     * Relationships need to have access to the store to ping it when
     * a modification (addById/removeById etc...) has been done. This wakes
     * the store up, which in turn will update the `<Query>`s and re-render the data.
     */
    getRelationshipStoreAccessors(): {
        get: any;
        save: (document: any, opts: any) => any;
        dispatch: any;
        query: (def: any, opts: any) => any;
        mutate: (def: any, opts: any) => any;
    };
    storeAccessors: {
        get: any;
        save: (document: any, opts: any) => any;
        dispatch: any;
        query: (def: any, opts: any) => any;
        mutate: (def: any, opts: any) => any;
    };
    /**
     * Get a collection of documents from the internal store.
     *
     * @param {string} type - Doctype of the collection
     *
     * @returns {import("./types").CozyClientDocument[]} Array of documents or null if the collection does not exist.
     */
    getCollectionFromState(type: string): import("./types").CozyClientDocument[];
    /**
     * Get a document from the internal store.
     *
     * @param {string} type - Doctype of the document
     * @param {string} id   - Id of the document
     *
     * @returns {import("./types").CozyClientDocument} Document or null if the object does not exist.
     */
    getDocumentFromState(type: string, id: string): import("./types").CozyClientDocument;
    /**
     * Get a query from the internal store.
     *
     * @param {string} id - Id of the query (set via Query.props.as)
     * @param {object} options - Options
     * @param {boolean} [options.hydrated] - Whether documents should be returned already hydrated
     * @param  {object} [options.singleDocData] - If true, the "data" returned will be
     * a single doc instead of an array for single doc queries. Defaults to false for backward
     * compatibility but will be set to true in the future.
     *
     * @returns {import("./types").QueryState} - Query state or null if it does not exist.
     */
    getQueryFromState(id: string, options?: {
        hydrated?: boolean;
        singleDocData?: object;
    }): import("./types").QueryState;
    /**
     * Executes a query and returns the results from internal store.
     *
     * Can be useful in pure JS context (without React)
     * Has a behavior close to <Query /> or useQuery
     *
     * @param {object} query - Query with definition and options
     * @param {QueryDefinition} query.definition - Query Definition
     * @param {import("./types").QueryOptions} query.options - Query Options
     * @returns {Promise<import("./types").QueryState>} Query state
     */
    fetchQueryAndGetFromState: ({ definition, options }: {
        definition: QueryDefinition;
        options: import("./types").QueryOptions;
    }) => Promise<import("./types").QueryState>;
    /**
     * Performs a complete OAuth flow using a React Native WebView for auth.
     * The `register` method's name has been chosen for compat reasons with the Authentication compo.
     *
     * @param   {string} cozyURL Receives the URL of the cozy instance.
     * @returns {object}   Contains the fetched token and the client information.
     */
    register(cozyURL: string): object;
    isReactNative(): boolean;
    /**
     * Performs a complete OAuth flow, including updating the internal token at the end.
     *
     * @param   {import("./types").OpenURLCallback} openURLCallback Receives the URL to present to the user as a parameter, and should return a promise that resolves with the URL the user was redirected to after accepting the permissions.
     * @returns {Promise<object>} Contains the fetched token and the client information. These should be stored and used to restore the client.
     */
    startOAuthFlow(openURLCallback: import("./types").OpenURLCallback): Promise<object>;
    /**
     * Perform the Flagship certification process for verifying that the current running app is a genuine Cozy application
     *
     * This mechanism is described in https://github.com/cozy/cozy-client/blob/master/packages/cozy-client/src/flagship-certification/README.md
     */
    certifyFlagship(): Promise<void>;
    /**
     * Creates an OAuth token with needed permissions for the current client.
     * The authorization page URL generation can be overriding by passing a function pointer as `openURLCallback` parameter
     * It is possible to skip the session creation process (when using an in-app browser) by passing a sessionCode (see https://docs.cozy.io/en/cozy-stack/auth/#post-authsession_code)
     *
     * @param {object} [options] - Authorization options
     * @param {import("./types").OpenURLCallback} [options.openURLCallback] - Receives the URL to present to the user as a parameter, and should return a promise that resolves with the URL the user was redirected to after accepting the permissions.
     * @param {import("./types").SessionCode} [options.sessionCode] - session code than can be added to the authorization URL to automatically create the session.
     * @param {import("./types").PKCECodes} [options.pkceCodes] - code verifier and a code challenge that should be used in the PKCE verification process.
     * @returns {Promise<object>} Contains the fetched token and the client information. These should be stored and used to restore the client.
     */
    authorize({ openURLCallback, sessionCode, pkceCodes }?: {
        openURLCallback?: import("./types").OpenURLCallback;
        sessionCode?: import("./types").SessionCode;
        pkceCodes?: import("./types").PKCECodes;
    }): Promise<object>;
    /**
     * Renews the token if, for instance, new permissions are required or token
     * has expired.
     *
     * @returns {object}   Contains the fetched token and the client information.
     */
    renewAuthorization(): object;
    /**
     * Sets the internal store of the client. Use this when you want to have cozy-client's
     * internal store colocated with your existing Redux store.
     *
     * Typically, you would need to do this only once in your application, this is why
     * setStore throws if you do it twice. If you really need to set the store again,
     * use options.force = true.
     *
     * @example
     * ```
     * const client = new CozyClient()
     * const store = createStore(combineReducers({
     *   todos: todoReducer,
     *   cozy: client.reducer()
     * })
     * client.setStore(store)
     * ```
     *
     * @param {import("./types").ReduxStore} store - A redux store
     * @param {object} [options] - Options
     * @param {boolean} [options.force] - Will deactivate throwing when client's store already exists
     */
    setStore(store: import("./types").ReduxStore, { force }?: {
        force?: boolean;
    }): void;
    store: any;
    ensureStore(): void;
    /**
     * Returns whether the client has been revoked on the server
     */
    checkForRevocation(): Promise<any>;
    /**
     * If no stack client has been passed in options, creates a default stack
     * client and attaches handlers for revocation and token refresh.
     * If a stackClient has been passed in options, ensure it has handlers for
     * revocation and token refresh.
     *
     * If `oauth` options are passed, stackClient is an OAuthStackClient.
     */
    createClient(): void;
    stackClient: any;
    client: any;
    getClient(): any;
    getStackClient(): any;
    reducer(): (state: {
        documents: {};
        queries: {};
    }, action: any) => {
        documents: any;
        queries: Record<string, import("./types").QueryState>;
    };
    dispatch(action: any): any;
    /**
     * getInstanceOptions - Returns current instance options, such as domain or app slug
     *
     * @returns {object}
     */
    getInstanceOptions(): object;
    /**
     * loadInstanceOptionsFromDOM - Loads the dataset injected by the Stack in web pages and exposes it through getInstanceOptions
     *
     * @param {string} [selector=[role=application]] A selector for the node that holds the dataset to load
     *
     * @returns {void}
     */
    loadInstanceOptionsFromDOM(selector?: string): void;
    /**
     * loadInstanceOptionsFromStack - Loads the instance options from cozy-stack and exposes it through getInstanceOptions
     *
     * This method is not iso with loadInstanceOptionsFromDOM for now.
     *
     * @returns {Promise<void>}
     */
    loadInstanceOptionsFromStack(): Promise<void>;
    /**
     * Directly set the data in the store, without using a query
     * This is useful for cases like Pouch replication, which wants to
     * set some data in the store.
     *
     * @param {object} data - Data that is inserted in the store. Shape: { doctype: [data] }
     */
    setData(data: object): void;
    /**
     * At any time put an error function
     *
     * @param {Function} [onError] - Set a callback for queries which are errored
     * @throws {Error} onError should not have been defined yet
     */
    setOnError(onError?: Function): void;
    toJSON(): SnapshotClient;
    /**
     *
     * @param {import("./types").AppMetadata} newAppMetadata AppMetadata to update
     */
    setAppMetadata(newAppMetadata: import("./types").AppMetadata): void;
    /**
     * Set links, e.g. PouchLink or StackLink.
     * When this method is called manually, i.e. after a client instanciation,
     * we manually call the links onLogin methods
     *
     * @param {Array<object>} links - The links to handle
     */
    setLinks(links: Array<object>): Promise<void>;
    links: any[];
    chain: any;
    /**
     * Query the cozy-app settings corresponding to the given slug and
     * extract the value corresponding to the given `key`
     *
     * @template {string} T
     *
     * @param {string} slug - the cozy-app's slug containing the setting (can be 'instance' for global settings)
     * @param {T[]} keys - The names of the settings to retrieve
     * @returns {Promise<Record<T, any>>} - The value of the requested setting
     */
    getSettings<T extends string>(slug: string, keys: T[]): Promise<Record<T, any>>;
    /**
     * Save the given value into the corresponding cozy-app setting
     *
     * This methods will first query the cozy-app's settings before injecting the new value and then
     * save the new resulting settings into database
     *
     * @template {string} T
     *
     * @param {string} slug - the cozy-app's slug containing the setting (can be 'instance' for global settings)
     * @param {Record<string, any> | ((oldValue) => Record<T, any>)} itemsOrSetter - The new values of the settings to save. It can be a raw dictionary, or a callback that should return a new dictionary
     * @param {T[]=} setterKeys - The new values of the settings to save. It can be a raw dictionary, or a callback that should return a new dictionary
     * @returns {Promise<any>} - The result of the `client.save()` call
     */
    saveAfterFetchSettings<T_2 extends string>(slug: string, itemsOrSetter: Record<string, any> | ((oldValue: any) => Record<T_2, any>), setterKeys?: T_2[]): Promise<any>;
    /**
     * Reset a query
     *
     * This method will reset the query state to its initial state and refetch it.
     *
     * @param {string} queryId - Query id
     * @returns {Promise<import("./types").QueryState|null>} - Query state or null if the query does not exist
     */
    resetQuery(queryId: string): Promise<import("./types").QueryState | null>;
}
declare namespace CozyClient {
    export const hooks: {};
    export { fetchPolicies };
    export const version: string;
}
import { QueryIDGenerator } from "./store/queries";
import Schema from "./Schema";
import { QueryDefinition } from "./queries/dsl";
import ObservableQuery from "./ObservableQuery";
import { CozyClient as SnapshotClient } from "./testing/snapshots";
import fetchPolicies from "./policies";
