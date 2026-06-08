declare var _default: {};
export default _default;
export type Qualification = import("./models/document/qualification").Qualification;
export type NotesDoctype = "io.cozy.notes";
export type AppsDoctype = "io.cozy.apps";
export type SettingsDoctype = "io.cozy.settings";
export type OAuthClientsDoctype = "io.cozy-oauth.clients";
export type FilesDoctype = "io.cozy.files";
export type AccountsDoctype = "io.cozy.account";
export type KonnectorsDoctype = "io.cozy.konnectors";
export type TriggersDoctype = "io.cozy.triggers";
export type NextcloudFilesDoctype = "io.cozy.remote.nextcloud.files";
export type KnownDoctype = "io.cozy.files" | "io.cozy.account" | "io.cozy.triggers" | "io.cozy.konnectors" | "io.cozy.notes" | "io.cozy.apps" | "io.cozy.settings" | "io.cozy-oauth.clients";
export type Doctype = string;
export type AccountsDocument = {
    /**
     * - document identifier
     */
    _id?: string;
    /**
     * - slug of the associated konnector
     */
    account_type: string;
    /**
     * - user credentials
     */
    auth: object;
    /**
     * - Name of the attribute in the auth object that can be used to name the account.
     */
    identifier?: string;
    /**
     * - list of ignored errors
     */
    mutedErrors?: any[];
    /**
     * - used by harvest and the konnectors to communicate
     */
    state?: string;
};
/**
 * - An io.cozy.accounts document
 */
export type IOCozyAccount = CozyClientDocument & AccountsDocument;
/**
 * See https://docs.cozy.io/en/cozy-doctypes/docs/io.cozy.konnectors/
 */
export type KonnectorsDocument = {
    /**
     * - object containing aggregator data
     */
    aggregator?: object;
    /**
     * - list of categories (default: ['others'])
     */
    categories?: string[];
    /**
     * - whether the konnector runs on client or not
     */
    clientSide?: boolean;
    /**
     * - list of data types managed by the connector
     */
    data_types?: string[];
    /**
     * - identity information on the connector developer
     */
    developer?: {
        name: string;
        url: string;
    };
    /**
     * - name of the editor
     */
    editor: string;
    /**
     * - list of features added in the konnector
     */
    features?: object[];
    /**
     * - konnector fields
     */
    fields?: ManifestFields;
    /**
     * - list of folders required by the konnector to store files according to data types
     */
    folders?: object[];
    /**
     * - interval of time between two runs of the konnector (default: weekly)
     */
    frequency?: "monthly" | "weekly" | "daily";
    /**
     * - path to the icon for the cozy-home
     */
    icon?: string;
    /**
     * - available languages (may differ from local)
     */
    langs?: string[];
    /**
     * - an object with language slug as property, each name property is an object of localized informations
     */
    locales?: object;
    /**
     * - konnector development language used (ex: node)
     */
    language?: string;
    /**
     * - current manifest version number
     */
    manifest_version?: string;
    /**
     * - list of message identifiers, which can be used to display information in known zones
     */
    measures?: string[];
    /**
     * - name of the konnector
     */
    name: string;
    /**
     * - prefix to display with the name
     */
    name_prefix?: string;
    /**
     * - object containing oAuth information, like scope
     */
    oauth?: object;
    /**
     * - additional parameters which should be passed to the konnector
     */
    parameters?: object;
    /**
     * - object to provide informations about a partnership related to the konnector
     */
    partnership?: object;
    /**
     * - map of permissions needed by the konnector
     */
    permissions?: object;
    /**
     * - list of one or more cozy-client qualification labels that the connector will associate with the files it retrieves
     */
    qualification_labels?: string[];
    /**
     * - 	an array of paths to the screenshots of the konnector (paths in the build)
     */
    screenshots?: string[];
    /**
     * - slug of the konnector
     */
    slug: string;
    /**
     * -	installation state of the konnector
     */
    state: string;
    /**
     * - where the files of the konnector can be downloaded (default: build branch)
     */
    source?: string;
    /**
     * - object defining properties for terms that need to be displayed/accepted by the user when installing the konnector
     */
    terms?: object;
    /**
     * - list of two values, first is the interval start hour, second is the interval end hour (ex: [15, 21]) based on GMT time zone
     */
    time_interval?: number[];
    /**
     * - type of application (konnector or webapp)
     */
    type: string;
    /**
     * - Store the installation state of the konnector
     */
    vendor_link?: string;
    /**
     * - current version number of the konnector
     */
    version: string;
};
/**
 * - An io.cozy.konnectors document
 */
export type IOCozyKonnector = CozyClientDocument & KonnectorsDocument;
/**
 * - name and url for the developer
 */
export type Developer = {
    name: string;
    url: string;
};
/**
 * - (application specific) a list of intents provided by this app
 */
export type Intent = {
    action: string;
    type: string[];
    href: string;
};
/**
 * - an object with language slug as property, each name property is an object of localized informations
 */
export type Locale = {
    long_description: string;
    screenshots: string[];
    short_description: string;
};
/**
 * - a map of permissions needed by the app
 */
export type Permission = {
    type: string;
    description?: string;
    verbs?: string[];
    selector?: string;
    values?: string[];
};
/**
 * - (application specific) a map of routes for the app
 */
export type Route = {
    folder: string;
    index: string;
    public: boolean;
};
/**
 * - (application specific) a map of the services associated with the app (see cozy-stack services doc for more details)
 */
export type Service = {
    type: string;
    file: string;
    debounce?: string;
    trigger: string;
    trigger_id: string;
};
/**
 * - 	an object defining properties for terms that need to be displayed/accepted by the user when installing the application
 */
export type Terms = {
    url: string;
    version: string;
};
/**
 * - The acceptance document details from cozy-flagship.
 */
export type AcceptDocumentsFromFlagship = {
    accepted_mime_types: string[];
    max_number_of_files: number;
    max_size_per_file_in_MB: number;
    /**
     * - The route provided by the cozy-app to trigger the upload user flow
     */
    route_to_upload: string;
};
/**
 * See https://docs.cozy.io/en/cozy-doctypes/docs/io.cozy.apps/
 */
export type AppsDocument = {
    /**
     * - The acceptance document details from flagship.
     */
    accept_documents_from_flagship?: AcceptDocumentsFromFlagship;
    /**
     * - Whether to accept file upload from cozy-flagship.
     */
    accept_from_flagship?: boolean;
    /**
     * - array of categories for your apps (see authorized categories), it will be ['others'] by default if empty
     */
    categories: string[];
    checksum: string;
    created_at: string;
    /**
     * - name and url for the developer
     */
    developer: Developer;
    /**
     * - the editor’s name to display on the cozy-bar
     */
    editor: string;
    /**
     * - path to the icon for the home
     */
    icon: string;
    /**
     * - (application specific) a list of intents provided by this app
     */
    intents: Intent[];
    /**
     * - 	Languages available in the app
     */
    langs: string[];
    /**
     * - the SPDX license identifier
     */
    licence: string;
    /**
     * - an object with language slug as property, each name property is an object of localized informations
     */
    locales: {
        [x: string]: Locale;
    };
    /**
     * - the name to display on the home
     */
    name: string;
    /**
     * - the prefix to display with the name
     */
    name_prefix: string;
    notifications: null;
    /**
     * - a map of permissions needed by the app
     */
    permissions: {
        [x: string]: Permission;
    };
    /**
     * - (application specific) a map of routes for the app
     */
    routes: {
        [x: string]: Route;
    };
    /**
     * - an array of paths to the screenshots of the application
     */
    screenshots: string[];
    /**
     * - 	(application specific) a map of the services associated with the app
     */
    services: {
        [x: string]: Service;
    };
    /**
     * - the default slug that should never change (alpha-numeric lowercase)
     */
    slug: string;
    /**
     * - where the files of the app can be downloaded
     */
    source: string;
    state: string;
    /**
     * - an object defining properties for terms that need to be displayed/accepted by the user when installing the application
     */
    terms: Terms;
    /**
     * - type of application
     */
    type: "webapp";
    updated_at: string;
    /**
     * - the current version number
     */
    version: string;
};
/**
 * - An io.cozy.apps document
 */
export type IOCozyApp = CozyClientDocument & AppsDocument;
export type TriggersDocument = {
    /**
     * - document identifier
     */
    _id?: string;
    /**
     * - type of the trigger. Can be "at", "cron", "event", "every", "in", "webhook", "client"
     */
    type: string;
    /**
     * - type of worker. Can be "konnector" or "sendmail"
     */
    worker: string;
    /**
     * - Parameters to pass to the the worker. For example, when the worker is set to konnector, message contains the related konnector and the related account.
     */
    message: {
        account: IOCozyAccount['id'];
        konnector: IOCozyKonnector['slug'];
        folder_to_save: IOCozyFolder['_id'];
        Data: string;
    };
    /**
     * - state of the last executed jobs related to this trigger
     */
    current_state?: TriggerState;
    /**
     * - Arguments related to the type attribute. For example it's a cron configuration when the type is set to
     */
    arguments?: string;
};
/**
 * - An io.cozy.triggers document
 */
export type IOCozyTrigger = CozyClientDocument & TriggersDocument;
export type TriggerState = {
    /**
     * - Global status of the trigger
     */
    status: 'queued' | 'running' | 'done' | 'errored';
    /**
     * - Date  of the last job in success
     */
    last_success: string;
    /**
     * - ID of the last job in success
     */
    last_successful_job_id: string;
    /**
     * - Date of the last executed job
     */
    last_execution: string;
    /**
     * - ID of the last executed job
     */
    last_executed_job_id: string;
    /**
     * - Date of the last job in failure
     */
    last_failure: string;
    /**
     * - ID of the last job in failure
     */
    last_failed_job_id: string;
    /**
     * - Date of the last job manually executed
     */
    last_manual_execution: string;
    /**
     * - ID of the last job manually executed
     */
    last_manual_job_id: string;
    /**
     * - Content of the last error
     */
    last_error: string;
};
export type Link = any;
export type Mutation = any;
export type DocumentCollection = any;
export type QueryResult = any;
export type HydratedDocument = any;
export type ReduxStore = any;
export type Token = any;
export type ClientResponse = any;
export type Manifest = any;
export type SanitizedManifest = any;
export type ManifestField = {
    /**
     * - field type : can be "text" or "hidden" or "date" or "dropdown" or "password"
     */
    type?: string;
    /**
     * - field role : with "identifier" value
     */
    role?: string;
    /**
     * - is the field required or not
     */
    required?: boolean;
    /**
     * - is the field required or not (legacy)
     */
    isRequired?: boolean;
    /**
     * - encrypted value of the field (legacy)
     */
    encrypted?: boolean;
};
export type CozyState = {
    documents: DocumentsStateSlice;
    queries: QueriesStateSlice;
};
export type CozyStore = {
    cozy: CozyState;
};
export type ManifestFields = {
    [key: string]: ManifestField;
};
export type OldCozyClient = any;
export type NodeEnvironment = any;
export type QueryFetchStatus = "loading" | "loaded" | "pending" | "failed";
export type QueriesStateSlice = {
    [x: string]: QueryState;
};
export type IndexedDocuments = {
    [x: string]: CozyClientDocument;
};
export type DocumentsStateSlice = {
    [x: string]: Record<string, CozyClientDocument>;
};
export type QueryStateWithoutData = {
    id: string;
    definition: QueryDefinition;
    fetchStatus: QueryFetchStatus;
    isFetching: boolean;
    lastFetch: number;
    lastUpdate: number;
    lastErrorUpdate: number;
    lastError: Error;
    hasMore: boolean;
    count: number;
    fetchedPagesCount: number;
    bookmark: string;
    execution_stats?: object;
    /**
     * - The relationships names, used to check hydrated documents
     */
    relationshipNames: Array<string>;
    options?: QueryOptions;
};
export type QueryStateData = {
    /**
     * - Collection of hydrated documents
     */
    data: object | any[];
};
export type QueryStateStoreData = {
    /**
     * - Collection of store's documents
     */
    storeData: object | any[];
};
export type QueryState = QueryStateWithoutData & QueryStateData & QueryStateStoreData;
export type AutoUpdateOptions = any;
export type QueryOptions = {
    /**
     * - Name of the query
     */
    as?: string;
    /**
     * - Fetch policy to bypass fetching based on what's already inside the state. See "Fetch policies"
     */
    fetchPolicy?: Function;
    /**
     * - Options for the query auto update
     */
    autoUpdate?: AutoUpdateOptions;
    /**
     * - Does not seem to be used
     */
    update?: string;
    /**
     * - Callback when the query is errored
     */
    onError?: Function;
    /**
     * - If set to false, the query won't be executed
     */
    enabled?: boolean;
    /**
     * - If set to true, when the fetchStatus has already been loaded, it won't be updated during future fetches. Instead, a `isFetching` attribute will be used to indicate when background fetching is started.
     */
    backgroundFetching?: boolean;
    /**
     * - Whether documents should be returned already hydrated
     */
    hydrated?: boolean;
    /**
     * - If true, the "data" returned will be
     * a single doc instead of an array for single doc queries. Defaults to false for backward
     * compatibility but will be set to true in the future.
     */
    singleDocData?: boolean;
    /**
     * - If set to true, the query will be run directly on the current store's state
     */
    executeFromStore?: boolean;
    /**
     * - If set to true, the query will be executed through StackLink only even if there are other links available
     */
    forceStack?: boolean;
};
export type Query = {
    definition: QueryDefinition;
    options: QueryOptions;
};
export type FetchMoreAble = {
    fetchMore: Function;
};
export type FetchAble = {
    fetch: Function;
};
export type UseQueryReturnValue = QueryStateWithoutData & QueryStateData & QueryStateStoreData & FetchMoreAble & FetchAble;
export type UseMutationWithoutMutate = {
    /**
     * - Status of the current mutation
     */
    mutationStatus: QueryFetchStatus;
    /**
     * - Error if the mutation failed
     */
    error?: object;
    /**
     * - Data return after the mutation
     */
    data?: object;
};
export type UseMutationMutate = {
    /**
     * - Function to save the document
     */
    mutate: Function;
};
export type UseMutationReturnValue = UseMutationWithoutMutate & UseMutationMutate;
/**
 * Update the setting with corresponding value and save it.
 */
export type SaveSettingsFunction<T extends string> = (items: Partial<Record<T, any>>) => any;
export type UseSettingsReturnValue<T extends string> = {
    /**
     * - The setting's value
     */
    values: Record<T, any>;
    /**
     * - Function to edit the setting
     */
    save: SaveSettingsFunction<T>;
    /**
     * - Function to edit the setting
     */
    query: QueryStateWithoutData;
    /**
     * - Status of the current mutation
     */
    mutation: UseMutationWithoutMutate;
};
/**
 * A reference to a document
 */
export type ReferencedByRelationship = {
    parent?: RelationshipParent;
    referenced_by?: ReferencedBy;
};
export type RelationshipParent = {
    links: {
        related: string;
    };
    data?: Reference;
};
export type ReferencedBy = {
    links: {
        self: string;
    };
    data: Reference[] | null;
};
/**
 * A reference to a document
 * https://docs.cozy.io/en/cozy-doctypes/docs/io.cozy.files/#references
 */
export type Reference = {
    /**
     * - id of the document
     */
    id: string;
    /**
     * - doctype of the document
     */
    type: string;
};
export type ReferenceMap = {
    [x: string]: Reference[];
};
export type MutationOptions = {
    /**
     * - Mutation id
     */
    as: string;
    /**
     * - Function to update the document
     */
    update: Function;
    /**
     * - Function to update queries
     */
    updateQueries: Function;
};
export type UpdatedByApp = {
    /**
     * - Slug of the app that updated the document
     */
    slug: string;
    /**
     * - Date of the update
     */
    date: string;
    /**
     * - Version of the app that updated the document
     */
    version: number;
};
export type CozyMetadata = {
    /**
     * - Version of the doctype
     */
    doctypeVersion?: number;
    /**
     * - Version of the metadata
     */
    metadataVersion?: number;
    /**
     * - Date of creation
     */
    createdAt?: string;
    /**
     * - Slug of the app that created the document
     */
    createdByApp?: string;
    /**
     * - Version of the app that created the document
     */
    createdByAppVersion?: string;
    /**
     * - Date of the last update
     */
    updatedAt?: string;
    /**
     * - List of apps that updated the document
     */
    updatedByApps?: UpdatedByApp[];
    /**
     * - Id of the account associated to the document
     */
    sourceAccount?: string;
    /**
     * - Identifier of the source account
     */
    sourceAccountIdentifier?: string;
    /**
     * - Whether the document is marked as favorite
     */
    favorite?: boolean;
};
export type UploadedBy = {
    /**
     * - The slug of the application that has made the upload
     */
    slug: string;
    /**
     * - The version number of this application
     */
    version: string;
};
/**
 * - Extra fields inside cozyMetadata only for io.cozy.files documents
 */
export type CozyMetadataFile = {
    /**
     * - The instance URL on which the file has created (useful if the file is shared between several cozy instances)
     */
    createdOn?: string;
    /**
     * - The server date/time of the last upload (when the content was changed)
     */
    uploadedAt?: string;
    /**
     * - The instance URL on which the file content was changed the last time
     */
    uploadedOn?: string;
    /**
     * - Information on which app has made the last upload
     */
    uploadedBy?: UploadedBy[];
};
/**
 * - Meta object as specified by JSON-API (https://jsonapi.org/format/#document-meta)
 */
export type CozyClientDocumentMeta = {
    /**
     * - Current revision of the document
     */
    rev?: string;
};
/**
 * - A document
 */
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
    relationships?: ReferencedByRelationship;
    /**
     * - referenced by of another document
     */
    referenced_by?: Reference[];
    /**
     * - Cozy Metadata
     */
    cozyMetadata?: CozyMetadata;
    /**
     * - Pouch Metadata
     */
    meta?: CozyClientDocumentMeta;
    /**
     * - When true the document should NOT be replicated to the remote database
     */
    cozyLocalOnly?: boolean;
    /**
     * - Id of a shared drive, only for shared io.cozy.files
     */
    driveId?: string;
};
/**
 * - A io.cozy.files document's metadata
 */
export type FileMetadata = {
    /**
     * - The Note's content. See https://prosemirror.net/docs/ref/#model for more informations
     */
    content?: object;
    /**
     * - the schema used by prosemirror (with notes and marks serialized as arrays to preserve the order).
     */
    schema?: object;
    /**
     * - the initial title of the note (that will also be used for the file name)
     */
    title?: string;
    /**
     * - A brief description of the file
     */
    description?: string;
    /**
     * - Number of a note
     */
    version?: number;
    /**
     * - Qualification of the file
     */
    qualification?: Qualification;
    /**
     * - Country of the paper
     */
    country?: string;
    /**
     * - Expiration date of the paper
     */
    expirationDate?: string;
    /**
     * - Reference date of the paper
     */
    referencedDate?: string;
    /**
     * - Notice period of the paper, in days
     */
    noticePeriod?: string;
    /**
     * - Image EXIF date, if relevant
     */
    datetime?: string;
    /**
     * - Name of the instance
     */
    instanceName?: string;
    /**
     * - Information of the target of the shortcut
     */
    target?: {
        title: string;
        category: string;
    };
    /**
     * - Shortcut icon (base64 encoded image or svg binary if mimetype is not present)
     */
    icon?: string;
    /**
     * - Shortcut icon mimetype
     */
    iconMimeType?: string;
    /**
     * - An external Id, typically used for external apps
     */
    externalId?: string;
    /**
     * - Additional information to maintain link with external data source
     */
    externalDataSource?: {
        source: string;
        creator: string;
    };
};
/**
 * - An io.cozy.files document
 */
export type FileDocument = {
    /**
     * - Id of the file
     */
    _id: string;
    /**
     * - Rev of the file
     */
    _rev: string;
    /**
     * - Doctype of the file
     */
    _type: FilesDoctype;
    /**
     * - Id of the parent folder
     */
    dir_id: string;
    /**
     * - Path of the file
     */
    path?: string;
    /**
     * - Name of the file
     */
    name: string;
    /**
     * - Metadata of the file
     */
    metadata: FileMetadata;
    /**
     * - Type of the file
     */
    type: string;
    /**
     * - Class of the file
     */
    class: string;
    /**
     * - Mime of the file
     */
    mime: string;
    /**
     * - Whether or not the file is executable
     */
    executable: boolean;
    /**
     * - Whether or not the file is client-side encrypted
     */
    encrypted: boolean;
    /**
     * - Creation date of the file
     */
    created_at: string;
    /**
     * - Last modification date of the file
     */
    updated_at: string;
    /**
     * - Size of the file, in bytes
     */
    size: number;
    /**
     * - Whether the folder is in the trash
     */
    trashed: boolean;
    /**
     * - Cozy Metadata
     */
    cozyMetadata?: CozyMetadata & CozyMetadataFile;
};
/**
 * - An io.cozy.files document
 */
export type IOCozyFile = CozyClientDocument & FileDocument;
/**
 * - An io.cozy.files document
 */
export type FolderDocument = {
    /**
     * - Id of the folder
     */
    _id: string;
    /**
     * - Parent folder
     */
    dir_id: string;
    /**
     * - Doctype of the folder
     */
    _type: FilesDoctype;
    /**
     * - Name of the folder
     */
    name: string;
    /**
     * - Metadata of the folder
     */
    metadata: object;
    /**
     * - Type of the folder
     */
    type: object;
    /**
     * - Folder path
     */
    path: string;
};
/**
 * - An io.cozy.files document
 */
export type IOCozyFolder = CozyClientDocument & FolderDocument;
/**
 * - An io.cozy.remote.nextcloud document after normalization
 */
export type NextcloudFile = {
    /**
     * - Id of the file
     */
    _id: string;
    /**
     * - Id of the file
     */
    id: string;
    /**
     * - Doctype of the folder
     */
    _type: NextcloudFilesDoctype;
    /**
     * - Name of the file
     */
    name: string;
    /**
     * - Path to the file
     */
    path: string;
    /**
     * - Size of the file, in bytes
     */
    size: number;
    /**
     * - Path to the folder containing the file
     */
    parentPath: string;
    /**
     * - Old path when the file is in the trash
     */
    restore_path?: string;
    /**
     * - Type of the file
     */
    type: 'file' | 'directory';
    /**
     * - Last modification date of the file
     */
    updated_at: string;
    /**
     * - Mime of the file
     */
    cozyMetadata: {
        sourceAccount: string;
    };
    /**
     * - Links to the file into nextcloud server
     */
    links: {
        self: string;
    };
};
/**
 * - An io.cozy.oauth.clients document
 */
export type OAuthClientDocument = {
    /**
     * - Id of the client
     */
    _id: string;
    /**
     * - Doctype of the client
     */
    _type: OAuthClientsDoctype;
    software_id: string;
    software_version: string;
    client_id: string;
    client_name: string;
    client_kind: string;
    client_uri: string;
    logo_uri: string;
    policy_uri: string;
    notification_platform: string;
    notification_device_token: string;
    redirect_uris: Array<string>;
};
/**
 * - An io.cozy.oauth.clients document
 */
export type IOCozyOAuthClient = CozyClientDocument & OAuthClientDocument;
export type ContactName = {
    /**
     * - The family name (example: "House")
     */
    familyName?: string;
    /**
     * - The given name (example: "Gregory")
     */
    givenName?: string;
    /**
     * - The additional name (example: "J.")
     */
    additionalName?: string;
    /**
     * - The name prefix (example: "Dr.")
     */
    namePrefix?: string;
    /**
     * - The name suffix (example: "III")
     */
    nameSuffix?: string;
};
export type ContactEmail = {
    /**
     * - Email address
     */
    address: string;
    /**
     * - A user-provided localized type (example: `"Personal"`, `"Professional"`, `"Other"`)
     */
    type?: string;
    /**
     * - A keyword to identify the type, must be `work|home`
     */
    label?: 'work' | 'home';
    /**
     * - Indicates a preferred-use address
     */
    primary?: boolean;
};
export type ContactExtendedAddress = {
    /**
     * - Locality name
     */
    locality?: string;
    /**
     * - Building number
     */
    building?: string;
    /**
     * - Stairs number
     */
    stairs?: string;
    /**
     * - Apartment floor
     */
    floor?: string;
    /**
     * - Apartment number
     */
    apartment?: string;
    /**
     * - Entry code
     */
    entrycode?: string;
};
export type ContactGeo = {
    /**
     * - Coordinates of the address, must be [long, lat]
     */
    geo?: Array<number>;
    /**
     * - The category of the address type
     */
    cozyCategory?: "home" | "work";
};
export type ContactAddress = {
    /**
     * - Id of the address
     */
    id?: string;
    /**
     * - Street name
     */
    street?: string;
    /**
     * - P.O Box number
     */
    pobox?: string;
    /**
     * - City name
     */
    city?: string;
    /**
     * - Region name
     */
    region?: string;
    /**
     * - Lane number
     */
    number?: string;
    /**
     * - Postal code
     */
    code?: string;
    /**
     * - Country name
     */
    country?: string;
    /**
     * - A user-provided localized type (example: `"Personal"`, `"Professional"`, `"Other"`)
     */
    type?: string;
    /**
     * - A keyword to identify the type, must be `work|home`
     */
    label?: 'work' | 'home';
    /**
     * - Indicates a preferred-use address
     */
    primary?: boolean;
    extendedAddress?: ContactExtendedAddress;
    /**
     * - Unstructured version of the address
     */
    formattedAddress?: string;
    geo?: ContactGeo;
};
export type ContactPhone = {
    /**
     * - Phone number
     */
    number: string;
    /**
     * - A user-provided localized type (example: `"Personal"`, `"Professional"`, `"Other"`), could be provided by Contacts app too as `voice|fax|cell`
     */
    type?: string;
    /**
     * - A keyword to identify the type, must be `work|home`
     */
    label?: 'work' | 'home';
    /**
     * - Indicates a preferred-use number
     */
    primary?: boolean;
};
export type ContactCozy = {
    url: string;
    /**
     * - A user-provided localized type (example: `"Personal"`, `"Professional"`, `"Other"`)
     */
    type?: string;
    /**
     * - A keyword to identify the type, must be `work|home`
     */
    label?: 'work' | 'home';
    /**
     * - Indicates a preferred-use instance
     */
    primary?: boolean;
};
export type ContactMetadata = {
    /**
     * - Whether the contact has been created by cozy
     */
    cozy: boolean;
    /**
     * - Google metadata
     */
    google: object;
    /**
     * - Used for migrations. Current version is 1
     */
    version: number;
};
export type ContactDocument = {
    /**
     * - Used to sort contacts in different ways
     */
    indexes: {
        byFamilyNameGivenNameEmailCozyUrl: string;
    };
    /**
     * - Displayed name in cozy applications
     */
    displayName: string;
    /**
     * - Unstructured representation of the name (example: "Dr. Gregory House, M.D.")
     */
    fullname?: string;
    /**
     * - Structured representation of the name
     */
    name?: ContactName;
    /**
     * - Birthday (example: "1959-05-15")
     */
    birthday?: string;
    /**
     * - Gender (example: "female")
     */
    gender?: 'male' | 'female';
    /**
     * - Note
     */
    note?: string;
    /**
     * - Email addresses
     */
    email?: Array<ContactEmail>;
    /**
     * - Addresses
     */
    address?: Array<ContactAddress>;
    /**
     * - Phone numbers
     */
    phone?: Array<ContactPhone>;
    /**
     * - Cozy instances
     */
    cozy?: Array<ContactCozy>;
    /**
     * - Cozy instance url (deprecated)
     */
    url?: string;
    /**
     * - Company
     */
    company: string;
    /**
     * - Job title
     */
    jobTitle: string;
    /**
     * - true if the contact is marked for removal and will be deleted soon (e.g. after remote deletion is confirmed)
     */
    trashed?: boolean;
    /**
     * - Whether the contact matches the cozy owner (defaults to false)
     */
    me: boolean;
    /**
     * - 2-letter iso3166 country codes (can be set in io.cozy.identities for legal reasons in Banks)
     */
    nationalities?: Array<string>;
    /**
     * - City of birth of a contact (can be set in io.cozy.identities for legal reasons in Banks)
     */
    birthcity?: string;
    /**
     * - Country of birth of a contact (can be set in io.cozy.identities for legal reasons in Banks)
     */
    birthcountry?: string;
    /**
     * - Previous metadata information
     */
    metadata: ContactMetadata;
};
/**
 * - An io.cozy.contacts document
 */
export type IOCozyContact = CozyClientDocument & ContactDocument;
export type ClientError = {
    status?: string;
};
export type FilePlugin = {
    externalDataDirectory?: object;
    cacheDirectory?: object;
    externalCacheDirectory?: object;
    dataDirectory?: object;
};
export type InAppBrowser = {
    open: Function;
};
export type AppMetadata = {
    /**
     * - slug of the application/konnector which created this data
     */
    slug?: string;
    /**
     * - version of the application/konnector which created this data
     */
    version?: string;
    /**
     * - id of the account associated to the konnector which created this data
     */
    sourceAccount?: string;
    /**
     * - source account identifier account associated to the konnector which created this data
     */
    sourceAccountIdentifier?: string;
};
export type ClientCapabilities = {
    /**
     * - Whether OIDC login is possible with this Cozy
     */
    can_auth_with_oidc?: boolean;
    /**
     * - Whether password login is possible with this Cozy
     */
    can_auth_with_password?: boolean;
    /**
     * - Whether magic-link login is possible with this Cozy
     */
    can_auth_with_magic_links?: boolean;
    /**
     * - Whether file versioning is active on this Cozy
     */
    file_versioning?: boolean;
    /**
     * - Whether the stack has been configured to use flat subdomains
     */
    flat_subdomains?: boolean;
};
/**
 * - A document
 */
export type CouchDBDocument = {
    /**
     * - Id of the document
     */
    _id: string;
    /**
     * - Current revision of the document
     */
    _rev: string;
    /**
     * - When the document has been deleted
     */
    _deleted?: boolean;
    /**
     * - Relationships of the document
     */
    relationships?: object;
};
/**
 * - An item of the CouchDB bulk docs response
 */
export type CouchDBBulkResult = {
    ok: boolean;
    id: string;
    rev: string;
    /**
     * ?
     */
    error: string | null;
    /**
     * ?
     */
    reason: string | null;
};
export type ViewKey = string | string[];
export type DocId = string;
export type CouchDBViewCursor = [ViewKey, string];
export type Theme = {
    id: string;
    label: string;
    icon: string;
    items: Array<QualificationAttributes>;
    defaultItems?: Array<string>;
};
export type ThemesList = Theme[];
export type ThemesLabels = "identity" | "family" | "transport" | "health" | "invoice" | "home" | "work_study" | "finance" | "others";
export type QualificationAttributes = {
    label: string;
    purpose?: string;
    sourceCategory?: string;
    sourceSubCategory?: string;
    subjects?: Array<string>;
};
export type IdentityLabel = "identity_photo" | "national_id_card" | "passport" | "residence_permit" | "family_record_book" | "birth_certificate" | "driver_license" | "other_identity_document" | "electoral_card" | "citizen_registration_certificate" | "personal_sporting_licence" | "note_identity_document";
export type FamilyLabel = "family_record_book" | "birth_certificate" | "wedding" | "pacs" | "divorce" | "large_family_card" | "caf" | "other_family_document" | "single_parent_benefit" | "payment_proof_family_allowance" | "person_insurance" | "note_family_document";
export type WorkStudyLabels = "diploma" | "work_contract" | "pay_sheet" | "employment_center_certificate" | "unemployment_benefit" | "pension" | "gradebook" | "student_card" | "resume" | "motivation_letter" | "other_work_document" | "work_disability_recognition" | "school_attendance_certificate" | "school_insurance_certificate" | "expense_claim" | "note_work_document";
export type HealthLabels = "health_book" | "health_certificate" | "pregnancy_medical_certificate" | "work_disability_recognition" | "national_health_insurance_card" | "national_health_insurance_right_certificate" | "health_insurance_card" | "prescription" | "health_invoice" | "other_health_document" | "note_health_document";
export type HomeLabels = "house_sale_agreeement" | "building_permit" | "technical_diagnostic_record" | "lease" | "rent_receipt" | "house_insurance" | "work_quote" | "work_invoice" | "other_house_document" | "phone_invoice" | "isp_invoice" | "telecom_invoice" | "energy_invoice" | "water_invoice" | "other_invoice" | "unfit_for_habitation_declaration" | "accommodation_proof" | "real_estate_insurance" | "condition_report" | "note_house_document";
export type TransportLabels = "driver_license" | "transport_card" | "vehicle_registration" | "car_insurance" | "mechanic_invoice" | "transport_invoice" | "other_transport_document" | "note_transport_document";
export type FinanceLabels = "pay_sheet" | "single_parent_benefit" | "other_revenue" | "real_estate_tax" | "tax_certificate" | "tax_return" | "tax_notice" | "tax_timetable" | "other_tax_document" | "bank_details" | "bank_statement" | "loan_agreement" | "other_bank_document" | "receipt" | "payment_proof_family_allowance" | "expense_claim" | "fine" | "note_finance";
export type InvoiceLabels = "health_invoice" | "transport_invoice" | "work_invoice" | "phone_invoice" | "isp_invoice" | "telecom_invoice" | "energy_invoice" | "water_invoice" | "energy_contract" | "appliance_invoice" | "web_service_invoice" | "restaurant_invoice" | "grocery_invoice" | "other_invoice" | "expense_claim" | "note_invoice";
export type ActivityLabels = "fidelity_card" | "personal_sporting_licence" | "other_activity_document" | "note_activity_document";
export type OthersLabels = "other_administrative_document" | "note_other";
export type ItemsLabels = "identity_photo" | "national_id_card" | "passport" | "residence_permit" | "family_record_book" | "birth_certificate" | "driver_license" | "other_identity_document" | "wedding" | "pacs" | "divorce" | "large_family_card" | "caf" | "other_family_document" | "diploma" | "work_contract" | "pay_sheet" | "fidelity_card" | "single_parent_benefit" | "transport_card" | "electoral_card" | "employment_center_certificate" | "unemployment_benefit" | "pension" | "other_revenue" | "gradebook" | "student_card" | "resume" | "motivation_letter" | "other_work_document" | "health_book" | "health_certificate" | "pregnancy_medical_certificate" | "work_disability_recognition" | "national_health_insurance_card" | "national_health_insurance_right_certificate" | "health_insurance_card" | "prescription" | "health_invoice" | "other_health_document" | "vehicle_registration" | "car_insurance" | "mechanic_invoice" | "transport_invoice" | "other_transport_document" | "house_sale_agreeement" | "real_estate_tax" | "building_permit" | "technical_diagnostic_record" | "lease" | "rent_receipt" | "house_insurance" | "work_quote" | "work_invoice" | "other_house_document" | "phone_invoice" | "isp_invoice" | "telecom_invoice" | "energy_invoice" | "water_invoice" | "energy_contract" | "appliance_invoice" | "web_service_invoice" | "restaurant_invoice" | "grocery_invoice" | "other_invoice" | "tax_certificate" | "tax_return" | "tax_notice" | "tax_timetable" | "other_tax_document" | "bank_details" | "bank_statement" | "loan_agreement" | "other_bank_document" | "receipt" | "payment_proof_family_allowance" | "school_attendance_certificate" | "school_insurance_certificate" | "unfit_for_habitation_declaration" | "accommodation_proof" | "citizen_registration_certificate" | "personal_sporting_licence" | "other_activity_document" | "real_estate_insurance" | "person_insurance" | "other_administrative_document" | "expense_claim" | "fine" | "condition_report" | "note_identity_document" | "note_family_document" | "note_work_document" | "note_health_document" | "note_house_document" | "note_transport_document" | "note_activity_document" | "note_finance" | "note_invoice" | "note_other";
export type iconPeopleLabels = "national_id_card" | "other_identity_document" | "resume" | "work_disability_recognition";
export type iconWorkLabels = "work_contract" | "employment_center_certificate" | "unemployment_benefit" | "student_card" | "motivation_letter" | "other_work_document" | "school_attendance_certificate" | "school_insurance_certificate";
export type iconJusticeLabels = "fine";
export type iconGlobeLabels = "residence_permit";
export type iconPlaneLabels = "passport";
export type iconImageLabels = "identity_photo";
export type iconShopLabels = "fidelity_card" | "grocery_invoice";
export type iconGouvLabels = "electoral_card";
export type iconSchoolLabels = "diploma" | "gradebook";
export type iconChildLabels = "birth_certificate";
export type iconEmailLabels = "receipt";
export type iconLaudryLabels = "appliance_invoice";
export type iconHomeLabels = "mechanic_invoice" | "house_sale_agreeement" | "building_permit" | "technical_diagnostic_record" | "lease" | "rent_receipt" | "house_insurance" | "work_quote" | "work_invoice" | "other_house_document" | "unfit_for_habitation_declaration" | "accommodation_proof" | "real_estate_insurance" | "condition_report";
export type iconBenefitLabels = "pay_sheet" | "pension" | "other_revenue" | "loan_agreement" | "payment_proof_family_allowance";
export type iconEuroLabels = "other_bank_document";
export type iconBankCheckLabels = "bank_details";
export type iconBankLabels = "real_estate_tax" | "tax_certificate" | "tax_return" | "tax_notice" | "tax_timetable" | "other_tax_document" | "other_administrative_document";
export type iconCarLabels = "driver_license" | "transport_card" | "vehicle_registration" | "car_insurance" | "transport_invoice" | "other_transport_document";
export type iconLightningLabels = "energy_invoice" | "energy_contract";
export type iconTelecomLabels = "isp_invoice" | "telecom_invoice" | "web_service_invoice";
export type iconTelephoneLabels = "phone_invoice";
export type iconWaterLabels = "water_invoice";
export type iconRemboursementLabels = "expense_claim";
export type iconRestaurantLabels = "restaurant_invoice";
export type iconBillLabels = "other_invoice";
export type iconTeamLabels = "family_record_book" | "wedding" | "pacs" | "divorce" | "large_family_card" | "caf" | "other_family_document" | "single_parent_benefit" | "citizen_registration_certificate";
export type iconFitnessLabels = "personal_sporting_licence" | "other_activity_document";
export type iconHeartLabels = "health_book" | "health_certificate" | "pregnancy_medical_certificate" | "national_health_insurance_card" | "national_health_insurance_right_certificate" | "health_insurance_card" | "prescription" | "health_invoice" | "other_health_document" | "person_insurance";
export type iconExchangeLabels = "bank_statement";
export type iconFileTypeNoteLabels = "note_identity_document" | "note_family_document" | "note_work_document" | "note_health_document" | "note_house_document" | "note_transport_document" | "note_activity_document" | "note_finance" | "note_invoice";
export type IconQualificationLabels = "work" | "car" | "telecom" | "water" | "bank" | "child" | "bank-check" | "benefit" | "bill" | "email" | "euro" | "exchange" | "file-type-note" | "fitness" | "globe" | "gouv" | "heart" | "home" | "image" | "justice" | "laudry" | "lightning" | "people" | "plane" | "remboursement" | "restaurant" | "school" | "shop" | "team" | "telephone";
export type iconLabelPairs = {
    icon: IconQualificationLabels;
    labels: Array<string>;
};
/**
 * See https://github.com/cozy/DACC
 */
export type DACCMeasure = {
    /**
     * - It must match an existing measure name on the DACC server
     */
    measureName: string;
    /**
     * - Start of the aggregation period. Should be in YYYY-MM-DD format
     */
    startDate: string;
    /**
     * - The measured value on the aggregation period
     */
    value: number;
    /**
     * - The slug of the app creating the measure
     */
    createdBy: string;
    /**
     * - Should be a {key: value} where the key is set in the measure definition.
     */
    group1: object;
    /**
     * - Should be a {key: value} where the key is set in the measure definition.
     */
    group2: object;
    /**
     * - Should be a {key: value} where the key is set in the measure definition.
     */
    group3: object;
};
/**
 * See https://github.com/cozy/DACC
 */
export type DACCAggregatesParams = {
    /**
     * - It must match an existing measure name on the DACC server
     */
    measureName: string;
    /**
     * - Start of the aggregation period. Should be in YYYY-MM-DD format
     */
    startDate: string;
    /**
     * - End of the aggregation period. Should be in YYYY-MM-DD format
     */
    endDate: string;
};
/**
 * See https://github.com/cozy/DACC
 */
export type DACCAggregatesResponse = DACCAggregate[];
/**
 * See https://github.com/cozy/DACC
 */
export type DACCAggregate = {
    /**
     * - The name of the measures aggregate
     */
    measureName: string;
    /**
     * - The aggregation start date
     */
    startDate: string;
    /**
     * - The aggregate sum
     */
    sum: number;
    /**
     * - The aggregate count
     */
    count: number;
    /**
     * - The aggregate count of values different from zero
     */
    countNotZero: number;
    /**
     * - The aggregate average
     */
    avg: number;
    /**
     * - The aggregate min
     */
    min: number;
    /**
     * - The aggregate max
     */
    max: number;
    /**
     * - The aggregate standard deviation
     */
    std: number;
};
export type Coordinates = {
    /**
     * - The latitude, in decimal degrees
     */
    lat: number;
    /**
     * - The longitude, in decimal degrees
     */
    lon: number;
};
/**
 * Receives the URL to present to the user as a parameter, and should return a promise that resolves with the URL the user was redirected to after accepting the permissions.
 */
export type OpenURLCallback = (url: string) => any;
/**
 * A session code generated by the cozy-stack that can be used to create a session
 *
 * More information: https://docs.cozy.io/en/cozy-stack/auth/#post-authsession_code
 */
export type SessionCode = string;
/**
 * An object containing a code verifier and a code challenge that can be used in a
 * PKCE verification process
 *
 * More information: https://docs.cozy.io/en/cozy-stack/auth/#pkce-extension
 */
export type PKCECodes = {
    codeVerifier?: string;
    codeChallenge?: string;
};
/**
 * Subdomain type for a Cozy. Can be flat or nested subdomains
 *
 * Example of 'flat' domain: https://claude-notes.somedomain.fr
 * Example of 'nested' domain: https://notes.claude.somedomain.fr
 */
export type SubdomainType = "flat" | "nested";
/**
 * Represents the different parts of a deconstructed Cozy link
 */
export type CozyLinkData = {
    /**
     * - The Cozy's domain (i.e. 'mycozy.cloud')
     */
    cozyBaseDomain: string;
    /**
     * - The Cozy's name (i.e. 'claude')
     */
    cozyName: string;
    /**
     * - The link's path (i.e. '#/folder/SOME_FOLDER_ID')
     */
    hash?: string;
    /**
     * - The link's path (i.e. '/public/')
     */
    pathname?: string;
    /**
     * - The link's protocol (i.e. 'https')
     */
    protocol: string;
    /**
     * - The link's searchParams (i.e. 'id=SOME_FOLDER_ID&sharecode=SOME_SHARECODE')
     */
    searchParams?: string;
    /**
     * - The link's slug (i.e. 'drive' or 'notes)
     */
    slug: string;
};
/**
 * Represents the different parts of a deconstructed redirect link
 */
export type RedirectLinkData = {
    /**
     * - The redirect link's slug (i.e. 'drive')
     */
    slug: string;
    /**
     * - The redirect link's path (i.e. 'public')
     */
    pathname: string;
    /**
     * - The redirect link's path (i.e. '/folder/SOME_FOLDER_ID')
     */
    hash: string;
};
/**
 * Represents available options of generateNewFileNameOnConflict method
 */
export type ConflictOptions = {
    /**
     * - Custom delimiter before the incremented number. Defaults to parenthesized copy counters.
     */
    delimiter?: string;
};
/**
 * Template to type useState
 */
export type useState<T> = [T, import("react").Dispatch<import("react").SetStateAction<T>>];
/**
 * Represents the Cozy's instance parameters
 */
export type InstanceData = {
    /**
     * - The email of the instance
     */
    email: string;
    /**
     * - The locale used on the server
     */
    locale: string;
    /**
     * - The public displayed name of the instance
     */
    public_name?: string;
    /**
     * - UUID associated with the instance
     */
    uuid?: string;
    /**
     * - The name of the context attached to the instance
     */
    context?: string;
    /**
     * - Redirect to a specific route after the login (format: 'appslug/#/path/to/route'). This value has priority over the Context's default_redirection
     */
    default_redirection?: string;
    /**
     * - Whether or not the onboarding is complete
     */
    onboarding_finished?: boolean;
    /**
     * - Whether or not the Cozy has a password defined (i.e. may be false for OIDC instances)
     */
    password_defined?: boolean;
    /**
     * - Authentication type (basic or 2FA)
     */
    auth_mode?: 'basic' | 'two_factor_mail';
    /**
     * - An identifier to check authentication from OIDC
     */
    oidc_id?: string;
    /**
     * - Terms of Service signed version
     */
    tos?: string;
    /**
     * - Terms of Service latest version
     */
    tos_latest?: string;
    /**
     * - URL of the legal notice (given by cozy-stack)
     */
    legal_notice_url?: string;
};
/**
 * Represents the Cozy's instance parameters
 */
export type Instance = {
    /**
     * - data from Instance Query
     */
    data: InstanceData;
};
/**
 * Represents the Cozy's context parameters
 */
export type ContextData = {
    /**
     * - Redirect to a specific route after the login (format: 'appslug/#/path/to/route')
     */
    default_redirection?: string;
    /**
     * - Redirect to a specific route after the onboarding (format: appslug/#/path/to/route')
     */
    onboarded_redirection?: string;
    /**
     * - Link that the user can use to get help (i.e. 'https://forum.cozy.io/')
     */
    help_link?: string;
    /**
     * - Url of the instance's Manager that can be use to enable/disable premium features
     */
    manager_url?: string;
    /**
     * - Whether or not the Cozy can show links to the Manager in order to enable/disable premium features
     */
    enable_premium_links?: boolean;
};
/**
 * Represents the Cozy's context parameters
 */
export type Context = {
    /**
     * - data from Context Query
     */
    data: ContextData;
};
/**
 * Represents the Cozy's disk usage
 */
export type DiskUsageData = {
    /**
     * - Value in bytes representing the maximum space available. Omitted means unlimited
     */
    quota?: string;
    /**
     * - Value in bytes representing the space used
     */
    used: string;
    /**
     * - Value in bytes representing the space used by files in their last version
     */
    files: string;
    /**
     * - Value in bytes representing the space used by files in their older version
     */
    versions: string;
    /**
     * - Value in bytes representing the space used by files in the trash
     */
    trash?: string;
};
/**
 * Represents the Cozy's disk usage
 */
export type DiskUsage = {
    /**
     * - data from DiskUsage Query
     */
    data: DiskUsageData;
};
/**
 * Represents the Cozy's instance info (instance level parameters, context level parameters and disk usage)
 */
export type InstanceInfo = {
    /**
     * - Whether or not the queries have been loaded
     */
    isLoaded: boolean;
    /**
     * - The Cozy's instance parameters
     */
    instance: Instance;
    /**
     * - The Cozy's context parameters
     */
    context: Context;
    /**
     * - The Cozy's disk usage
     */
    diskUsage: DiskUsage;
};
export type CountryISO = {
    /**
     * - ISO 3166-1 alpha-2
     */
    code2: string;
    /**
     * - ISO 3166-1 alpha-3
     */
    code3: string;
    /**
     * - ISO 3166-1 numeric
     */
    number: string;
};
export type Country = {
    /**
     * - ISO 3166-1 alpha-2
     */
    code2: string;
    /**
     * - ISO 3166-1 alpha-3
     */
    code3: string;
    /**
     * - ISO 3166-1 numeric
     */
    number: string;
    /**
     * - Country name
     */
    name: string;
    /**
     * - Nationality name
     */
    nationality: string;
};
import { QueryDefinition } from "./queries/dsl";
