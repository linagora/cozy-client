import { QueryDefinition } from './queries/dsl'

/**
 * @typedef {import("./models/document/qualification").Qualification} Qualification
 */

/**
 * @typedef {"io.cozy.notes"} NotesDoctype
 * @typedef {"io.cozy.apps"} AppsDoctype
 * @typedef {"io.cozy.settings"} SettingsDoctype
 * @typedef {"io.cozy-oauth.clients"} OAuthClientsDoctype
 * @typedef {"io.cozy.files"} FilesDoctype
 * @typedef {"io.cozy.account"} AccountsDoctype
 * @typedef {"io.cozy.konnectors"} KonnectorsDoctype
 * @typedef {"io.cozy.triggers"} TriggersDoctype
 * @typedef {"io.cozy.remote.nextcloud.files"} NextcloudFilesDoctype
 * @typedef {AccountsDoctype|TriggersDoctype|KonnectorsDoctype|NotesDoctype|AppsDoctype|SettingsDoctype|OAuthClientsDoctype|FilesDoctype} KnownDoctype
 * @typedef {KnownDoctype|string} Doctype
 */

/**
 * @typedef {object} AccountsDocument
 * @property {String} [_id] - document identifier
 * @property {String} account_type - slug of the associated konnector
 * @property {object} auth - user credentials
 * @property {String} [identifier] - Name of the attribute in the auth object that can be used to name the account.
 * @property {Array} [mutedErrors] - list of ignored errors
 * @property {String} [state] - used by harvest and the konnectors to communicate
 * @typedef {CozyClientDocument & AccountsDocument} IOCozyAccount - An io.cozy.accounts document
 */

/**
 * @typedef {object} KonnectorsDocument
 * See https://docs.cozy.io/en/cozy-doctypes/docs/io.cozy.konnectors/
 *
 * @property {object} [aggregator] - object containing aggregator data
 * @property {String[]} [categories] - list of categories (default: ['others'])
 * @property {Boolean} [clientSide] - whether the konnector runs on client or not
 * @property {String[]} [data_types] - list of data types managed by the connector
 * @property {object} [developer] - identity information on the connector developer
 * @property {String} [developer.name] - name of the developer
 * @property {String} [developer.url] - url of the developer
 * @property {String} editor - name of the editor
 * @property {object[]} [features] - list of features added in the konnector
 * @property {ManifestFields} [fields] - konnector fields
 * @property {object[]} [folders] - list of folders required by the konnector to store files according to data types
 * @property {"monthly"|"weekly"|"daily"} [frequency] - interval of time between two runs of the konnector (default: weekly)
 * @property {String} [icon] - path to the icon for the cozy-home
 * @property {string[]} [langs] - available languages (may differ from local)
 * @property {object} [locales] - an object with language slug as property, each name property is an object of localized informations
 * @property {String} [language] - konnector development language used (ex: node)
 * @property {String} [manifest_version] - current manifest version number
 * @property {String[]} [measures] - list of message identifiers, which can be used to display information in known zones
 * @property {String} name - name of the konnector
 * @property {String} [name_prefix] - prefix to display with the name
 * @property {object} [oauth] - object containing oAuth information, like scope
 * @property {object} [parameters] - additional parameters which should be passed to the konnector
 * @property {object} [partnership] - object to provide informations about a partnership related to the konnector
 * @property {object} [permissions] - map of permissions needed by the konnector
 * @property {String[]} [qualification_labels] - list of one or more cozy-client qualification labels that the connector will associate with the files it retrieves
 * @property {String[]} [screenshots] - 	an array of paths to the screenshots of the konnector (paths in the build)
 * @property {String} slug - slug of the konnector
 * @property {String} state -	installation state of the konnector
 * @property {String} [source] - where the files of the konnector can be downloaded (default: build branch)
 * @property {object} [terms] - object defining properties for terms that need to be displayed/accepted by the user when installing the konnector
 * @property {number[]} [time_interval] - list of two values, first is the interval start hour, second is the interval end hour (ex: [15, 21]) based on GMT time zone
 * @property {String} type - type of application (konnector or webapp)
 * @property {String} [vendor_link] - Store the installation state of the konnector
 * @property {String} version - current version number of the konnector
 * @typedef {CozyClientDocument & KonnectorsDocument} IOCozyKonnector - An io.cozy.konnectors document
 */

/**
 * @typedef {Object} Developer - name and url for the developer
 * @property {string} name
 * @property {string} url
 */

/**
 * @typedef {Object} Intent - (application specific) a list of intents provided by this app
 * @property {string} action
 * @property {string[]} type
 * @property {string} href
 */

/**
 * @typedef {Object} Locale - an object with language slug as property, each name property is an object of localized informations
 * @property {string} long_description
 * @property {string[]} screenshots
 * @property {string} short_description
 */

/**
 * @typedef {Object} Permission - a map of permissions needed by the app
 * @property {string} type
 * @property {string} [description]
 * @property {string[]} [verbs]
 * @property {string} [selector]
 * @property {string[]} [values]
 */

/**
 * @typedef {Object} Route - (application specific) a map of routes for the app
 * @property {string} folder
 * @property {string} index
 * @property {boolean} public
 */

/**
 * @typedef {Object} Service - (application specific) a map of the services associated with the app (see cozy-stack services doc for more details)
 * @property {string} type
 * @property {string} file
 * @property {string} [debounce]
 * @property {string} trigger
 * @property {string} trigger_id
 */

/**
 * @typedef {Object} Terms - 	an object defining properties for terms that need to be displayed/accepted by the user when installing the application
 * @property {string} url
 * @property {string} version
 */

/**
 * @typedef {Object} AcceptDocumentsFromFlagship - The acceptance document details from cozy-flagship.
 * @property {string[]} accepted_mime_types
 * @property {number} max_number_of_files
 * @property {number} max_size_per_file_in_MB
 * @property {string} route_to_upload - The route provided by the cozy-app to trigger the upload user flow
 */

/**
 * @typedef {Object} AppsDocument
 * See https://docs.cozy.io/en/cozy-doctypes/docs/io.cozy.apps/
 *
 * @property {AcceptDocumentsFromFlagship} [accept_documents_from_flagship] - The acceptance document details from flagship.
 * @property {boolean} [accept_from_flagship] - Whether to accept file upload from cozy-flagship.
 * @property {string[]} categories - array of categories for your apps (see authorized categories), it will be ['others'] by default if empty
 * @property {string} checksum
 * @property {string} created_at
 * @property {Developer} developer - name and url for the developer
 * @property {string} editor - the editor’s name to display on the cozy-bar
 * @property {string} icon - path to the icon for the home
 * @property {Intent[]} intents - (application specific) a list of intents provided by this app
 * @property {string[]} langs - 	Languages available in the app
 * @property {string} licence - the SPDX license identifier
 * @property {Object.<string, Locale>} locales - an object with language slug as property, each name property is an object of localized informations
 * @property {string} name - the name to display on the home
 * @property {string} name_prefix - the prefix to display with the name
 * @property {null} notifications
 * @property {Object.<string, Permission>} permissions - a map of permissions needed by the app
 * @property {Object.<string, Route>} routes - (application specific) a map of routes for the app
 * @property {string[]} screenshots - an array of paths to the screenshots of the application
 * @property {Object.<string, Service>} services - 	(application specific) a map of the services associated with the app
 * @property {string} slug - the default slug that should never change (alpha-numeric lowercase)
 * @property {string} source - where the files of the app can be downloaded
 * @property {string} state
 * @property {Terms} terms - an object defining properties for terms that need to be displayed/accepted by the user when installing the application
 * @property {"webapp"} type - type of application
 * @property {string} updated_at
 * @property {string} version - the current version number
 * @typedef {CozyClientDocument & AppsDocument} IOCozyApp - An io.cozy.apps document
 */

/**
 * @typedef {object} TriggersDocument
 * @property {String} [_id] - document identifier
 * @property {String} type - type of the trigger. Can be "at", "cron", "event", "every", "in", "webhook", "client"
 * @property {String} worker - type of worker. Can be "konnector" or "sendmail"
 * @property {object} message - Parameters to pass to the the worker. For example, when the worker is set to konnector, message contains the related konnector and the related account.
 * @property {IOCozyAccount['id']} [message.account] - Id of the account associated to this trigger, if any
 * @property {IOCozyKonnector['slug']} [message.konnector] - Slug of the konnector associated to this trigger, if any
 * @property {IOCozyFolder['_id']} [message.folder_to_save] - Id of the destination folder of the konnector associated to this trigger, if any
 * @property {String} [message.Data] - Legacy, same message data but encoded in base64 json string
 * @property {TriggerState} [current_state] - state of the last executed jobs related to this trigger
 * @property {String} [arguments] - Arguments related to the type attribute. For example it's a cron configuration when the type is set to @cron.
 * @typedef {CozyClientDocument & TriggersDocument} IOCozyTrigger - An io.cozy.triggers document
 */

/**
 * @typedef {object} TriggerState
 * @property {'queued'|'running'|'done'|'errored'} status - Global status of the trigger
 * @property {String} last_success - Date  of the last job in success
 * @property {String} last_successful_job_id - ID of the last job in success
 * @property {String} last_execution - Date of the last executed job
 * @property {String} last_executed_job_id - ID of the last executed job
 * @property {String} last_failure - Date of the last job in failure
 * @property {String} last_failed_job_id - ID of the last job in failure
 * @property {String} last_manual_execution - Date of the last job manually executed
 * @property {String} last_manual_job_id - ID of the last job manually executed
 * @property {String} last_error - Content of the last error
 */

/**
 * @typedef {object} Link
 * @typedef {object} Mutation
 * @typedef {object} DocumentCollection
 * @typedef {object} QueryResult
 * @typedef {object} HydratedDocument
 * @typedef {object} ReduxStore
 * @typedef {object} Token
 * @typedef {object} ClientResponse
 * @typedef {object} Manifest
 * @typedef {object} SanitizedManifest
 */

/**
 * @typedef {Object} ManifestField
 * @property {String} [type] - field type : can be "text" or "hidden" or "date" or "dropdown" or "password"
 * @property {String} [role] - field role : with "identifier" value
 * @property {Boolean} [required] - is the field required or not
 * @property {Boolean} [isRequired] - is the field required or not (legacy)
 * @property {Boolean} [encrypted] - encrypted value of the field (legacy)
 */

/**
 * @typedef {object} CozyState
 * @property {DocumentsStateSlice} documents
 * @property {QueriesStateSlice} queries
 */

/**
 * @typedef {object} CozyStore
 * @property {CozyState} cozy
 */

/**
 * @typedef {{
 *   [key: string]: ManifestField;
 * }} ManifestFields
 */

/**
 * @typedef {object} OldCozyClient
 */

/**
 * @typedef {object} NodeEnvironment
 */

/**
 * @typedef {"loading"|"loaded"|"pending"|"failed"} QueryFetchStatus
 */

/**
 * @typedef {Record<Doctype, QueryState>} QueriesStateSlice
 */

/**
 * @typedef {Record<string, CozyClientDocument>} IndexedDocuments
 */

/**
 * @typedef {Record<Doctype, IndexedDocuments>} DocumentsStateSlice
 */

/**
 * @typedef {object} QueryStateWithoutData
 * @property {string} id
 * @property {QueryDefinition} definition
 * @property {QueryFetchStatus} fetchStatus
 * @property {boolean} isFetching
 * @property {number} lastFetch
 * @property {number} lastUpdate
 * @property {number} lastErrorUpdate
 * @property {Error} lastError
 * @property {boolean} hasMore
 * @property {number} count
 * @property {number} fetchedPagesCount
 * @property {string} bookmark
 * @property {object} [execution_stats]
 * @property {Array<string>} relationshipNames - The relationships names, used to check hydrated documents
 * @property {QueryOptions} [options]
 */

/**
 * @typedef {object} QueryStateData
 * @property {object|Array} data - Collection of hydrated documents
 */

/**
 * @typedef {object} QueryStateStoreData
 * @property {object|Array} storeData - Collection of store's documents
 */

/**
 * @typedef {QueryStateWithoutData & QueryStateData & QueryStateStoreData} QueryState
 */

/**
 * @typedef {object} AutoUpdateOptions
 * @param {boolean} update - Should documents be updated in the query (default: true)
 * @param {boolean} add - Should documents be added to the query (default: true)
 * @param {boolean} remove - Should documents be removed from the query (default: true)
 */

/**
 * @typedef {object} QueryOptions
 * @property {string} [as] - Name of the query
 * @property {Function} [fetchPolicy] - Fetch policy to bypass fetching based on what's already inside the state. See "Fetch policies"
 * @property {AutoUpdateOptions} [autoUpdate] - Options for the query auto update
 * @property {string} [update] - Does not seem to be used
 * @property {Function} [onError] - Callback when the query is errored
 * @property {boolean} [enabled=true] - If set to false, the query won't be executed
 * @property {boolean} [backgroundFetching] - If set to true, when the fetchStatus has already been loaded, it won't be updated during future fetches. Instead, a `isFetching` attribute will be used to indicate when background fetching is started.
 * @property {boolean} [hydrated=true] - Whether documents should be returned already hydrated
 * @property {boolean} [singleDocData] - If true, the "data" returned will be
 * a single doc instead of an array for single doc queries. Defaults to false for backward
 * compatibility but will be set to true in the future.
 * @property {boolean} [executeFromStore=false] - If set to true, the query will be run directly on the current store's state
 * @property {boolean} [forceStack] - Deprecated: use forceLink:'stack'. Executes the query through StackLink only.
 * @property {string} [forceLink] - Route this query exclusively to the link whose name matches (e.g. 'dataproxy').
 */

/**
 * @typedef {object} Query
 * @property {QueryDefinition} definition
 * @property {QueryOptions} options
 */

/**
 * @typedef {object} FetchMoreAble
 * @property {Function} fetchMore
 */

/**
 * @typedef {object} FetchAble
 * @property {Function} fetch
 */

/**
 * @typedef {QueryState & FetchMoreAble & FetchAble} UseQueryReturnValue
 */

/**
 * @typedef {object} UseMutationWithoutMutate
 * @property {QueryFetchStatus} mutationStatus - Status of the current mutation
 * @property {object} [error] - Error if the mutation failed
 * @property {object} [data] - Data return after the mutation
 */

/**
 * @typedef {object} UseMutationMutate
 * @property {Function} mutate - Function to save the document
 */

/**
 * @typedef {UseMutationWithoutMutate & UseMutationMutate} UseMutationReturnValue
 */

/**
 * Update the setting with corresponding value and save it.
 *
 * @template {string} T
 *
 * @callback SaveSettingsFunction
 * @param {Partial<Record<T, any>>} items - The new setting's value
 */

/**
 * @template {string} T
 * @typedef {object} UseSettingsReturnValue
 * @property {Record<T, any> | undefined} values - The setting's value
 * @property {SaveSettingsFunction<T>} save - Function to edit the setting
 * @property {QueryStateWithoutData} query - Function to edit the setting
 * @property {UseMutationWithoutMutate} mutation - Status of the current mutation
 */

/**
 * A reference to a document
 *
 * @typedef {object} ReferencedByRelationship
 * @property {RelationshipParent} [parent]
 * @property {ReferencedBy} [referenced_by]
 */

/**
 * @typedef {object} RelationshipParent
 * @property {{related: string}} links
 * @property {Reference} [data]
 */

/**
 * @typedef {object} ReferencedBy
 * @property {{self: string}} links
 * @property {Reference[]|null} data
 */

/**
 * A reference to a document
 * https://docs.cozy.io/en/cozy-doctypes/docs/io.cozy.files/#references
 *
 * @typedef {object} Reference
 * @property {string} id - id of the document
 * @property {string} type - doctype of the document
 */

/**
 * @typedef {Object.<string, Array<Reference>>} ReferenceMap
 */

/**
 * @typedef {object} MutationOptions
 * @property {string} as - Mutation id
   @property  {Function} update - Function to update the document
 * @property  {Function} updateQueries - Function to update queries
 */

/**
 * @typedef {object} UpdatedByApp
 * @property {string} slug - Slug of the app that updated the document
 * @property {string} date - Date of the update
 * @property {number} version - Version of the app that updated the document
 */

/**
 * @typedef {object} CozyMetadata
 * @property {number} [doctypeVersion] - Version of the doctype
 * @property {number} [metadataVersion] - Version of the metadata
 * @property {string} [createdAt] - Date of creation
 * @property {string} [createdByApp] - Slug of the app that created the document
 * @property {string} [createdByAppVersion] - Version of the app that created the document
 * @property {string} [updatedAt] - Date of the last update
 * @property {UpdatedByApp[]} [updatedByApps] - List of apps that updated the document
 * @property {string} [sourceAccount] - Id of the account associated to the document
 * @property {string} [sourceAccountIdentifier] - Identifier of the source account
 * @property {boolean} [favorite] - Whether the document is marked as favorite
 */

/**
 * @typedef {object} UploadedBy
 * @property {string} slug - The slug of the application that has made the upload
 * @property {string} version - The version number of this application
 */

/**
 * @typedef {object} CozyMetadataFile - Extra fields inside cozyMetadata only for io.cozy.files documents
 * @property {string} [createdOn] - The instance URL on which the file has created (useful if the file is shared between several cozy instances)
 * @property {string} [uploadedAt] - The server date/time of the last upload (when the content was changed)
 * @property {string} [uploadedOn] - The instance URL on which the file content was changed the last time
 * @property {UploadedBy[]} [uploadedBy] - Information on which app has made the last upload
 */

/**
 * @typedef {object} CozyClientDocumentMeta - Meta object as specified by JSON-API (https://jsonapi.org/format/#document-meta)
 * @property {string} [rev] - Current revision of the document
 */

/**
 * @typedef {object} CozyClientDocument - A document
 * @property {string} [_id] - Id of the document
 * @property {string} [id] - Id of the document
 * @property {string} [_type] - Type of the document
 * @property {string} [_rev] - Current revision of the document
 * @property {boolean} [_deleted] - When the document has been deleted
 * @property {ReferencedByRelationship} [relationships] - Relationships of the document
 * @property {Reference[]} [referenced_by] - referenced by of another document
 * @property {CozyMetadata} [cozyMetadata] - Cozy Metadata
 * @property {CozyClientDocumentMeta} [meta] - Pouch Metadata
 * @property {boolean} [cozyLocalOnly] - When true the document should NOT be replicated to the remote database
 * @property {string} [driveId] - Id of a shared drive, only for shared io.cozy.files
 */

/**
 * Metadata on io.cozy.files documents
 *
 * This is a first step, to continue
 *
 * Filled according to:
 * https://docs.cozy.io/en/cozy-doctypes/docs/io.cozy.files_metadata/
 * https://docs.cozy.io/en/cozy-doctypes/docs/io.cozy.notes/
 *
 * @typedef {object} FileMetadata - A io.cozy.files document's metadata
 * @property {object} [content] - The Note's content. See https://prosemirror.net/docs/ref/#model for more informations
 * @property {object} [schema] - the schema used by prosemirror (with notes and marks serialized as arrays to preserve the order).
 * @property {string} [title] - the initial title of the note (that will also be used for the file name)
 * @property {string} [description] - A brief description of the file
 * @property {number} [version] - Number of a note
 * @property {Qualification} [qualification] - Qualification of the file
 * @property {string} [country] - Country of the paper
 * @property {string} [expirationDate] - Expiration date of the paper
 * @property {string} [referencedDate] - Reference date of the paper
 * @property {string} [noticePeriod] - Notice period of the paper, in days
 * @property {string} [datetime] - Image EXIF date, if relevant
 * @property {string} [instanceName] - Name of the instance
 * @property {object} [target] - Information of the target of the shortcut
 * @property {string} [target.title] - The title of the application to which the shortcut redirects
 * @property {string} [target.category] - The category of the application
 * @property {string} [icon] - Shortcut icon (base64 encoded image or svg binary if mimetype is not present)
 * @property {string} [iconMimeType] - Shortcut icon mimetype
 * @property {string} [externalId] - An external Id, typically used for external apps
 * @property {object} [externalDataSource] - Additional information to maintain link with external data source
 * @property {string} [externalDataSource.source] - The space to which the application belongs
 * @property {string} [externalDataSource.creator] - The creator of the data source
 */

/**
 * @typedef {object} FileDocument - An io.cozy.files document
 * @property {string} _id - Id of the file
 * @property {string} _rev - Rev of the file
 * @property {FilesDoctype} _type - Doctype of the file
 * @property {string} dir_id - Id of the parent folder
 * @property {string} [path] - Path of the file
 * @property {string} name - Name of the file
 * @property {FileMetadata} metadata - Metadata of the file
 * @property {string} type - Type of the file
 * @property {string} class - Class of the file
 * @property {string} mime - Mime of the file
 * @property {boolean} executable - Whether or not the file is executable
 * @property {boolean} encrypted - Whether or not the file is client-side encrypted
 * @property {string} created_at - Creation date of the file
 * @property {string} updated_at - Last modification date of the file
 * @property {number} size - Size of the file, in bytes
 * @property {boolean} trashed - Whether the folder is in the trash
 * @property {CozyMetadata & CozyMetadataFile} [cozyMetadata] - Cozy Metadata
 * @typedef {CozyClientDocument & FileDocument} IOCozyFile - An io.cozy.files document
 */

/**
 * @typedef {object} FolderDocument - An io.cozy.files document
 * @property {string} _id - Id of the folder
 * @property {string} dir_id - Parent folder
 * @property {FilesDoctype} _type - Doctype of the folder
 * @property {string} name - Name of the folder
 * @property {object} metadata - Metadata of the folder
 * @property {object} type - Type of the folder
 * @property {string} path - Folder path
 * @typedef {CozyClientDocument & FolderDocument} IOCozyFolder - An io.cozy.files document
 */

/**
 * @typedef {object} NextcloudFile - An io.cozy.remote.nextcloud document after normalization
 * @property {string} _id - Id of the file
 * @property {string} id - Id of the file
 * @property {NextcloudFilesDoctype} _type - Doctype of the folder
 * @property {string} name - Name of the file
 * @property {string} path - Path to the file
 * @property {number} size - Size of the file, in bytes
 * @property {string} parentPath - Path to the folder containing the file
 * @property {string} [restore_path] - Old path when the file is in the trash
 * @property {'file'|'directory'} type - Type of the file
 * @property {string} updated_at - Last modification date of the file
 * @property {object} cozyMetadata - Mime of the file
 * @property {string} cozyMetadata.sourceAccount - Id of the io.cozy.account associated to the Nextcloud
 * @property {{self: string}} links - Links to the file into nextcloud server
 */

/**
 * @typedef {object} OAuthClientDocument - An io.cozy.oauth.clients document
 * @property {string} _id - Id of the client
 * @property {OAuthClientsDoctype} _type - Doctype of the client
 * @property {string} software_id
 * @property {string} software_version
 * @property {string} client_id
 * @property {string} client_name
 * @property {string} client_kind
 * @property {string} client_uri
 * @property {string} logo_uri
 * @property {string} policy_uri
 * @property {string} notification_platform
 * @property {string} notification_device_token
 * @property {Array<String>} redirect_uris
 * @typedef {CozyClientDocument & OAuthClientDocument} IOCozyOAuthClient - An io.cozy.oauth.clients document
 */

/**
 * @typedef {object} ContactName
 * @property {string} [familyName] - The family name (example: "House")
 * @property {string} [givenName] - The given name (example: "Gregory")
 * @property {string} [additionalName] - The additional name (example: "J.")
 * @property {string} [namePrefix] - The name prefix (example: "Dr.")
 * @property {string} [nameSuffix] - The name suffix (example: "III")
 */

/**
 * @typedef {object} ContactEmail
 * @property {string} address - Email address
 * @property {string} [type] - A user-provided localized type (example: `"Personal"`, `"Professional"`, `"Other"`)
 * @property {'work'|'home'} [label] - A keyword to identify the type, must be `work|home`
 * @property {boolean} [primary] - Indicates a preferred-use address
 */

/**
 * @typedef {object} ContactExtendedAddress
 * @property {string} [locality] - Locality name
 * @property {string} [building] - Building number
 * @property {string} [stairs] - Stairs number
 * @property {string} [floor] - Apartment floor
 * @property {string} [apartment] - Apartment number
 * @property {string} [entrycode] - Entry code
 */

/**
 * @typedef {object} ContactGeo
 * @property {Array<number>} [geo] - Coordinates of the address, must be [long, lat]
 * @property {"home"|"work"} [cozyCategory] - The category of the address type
 */

/**
 * @typedef {object} ContactAddress
 * @property {string} [id] - Id of the address
 * @property {string} [street] - Street name
 * @property {string} [pobox] - P.O Box number
 * @property {string} [city] - City name
 * @property {string} [region] - Region name
 * @property {string} [number] - Lane number
 * @property {string} [code] - Postal code
 * @property {string} [country] - Country name
 * @property {string} [type] - A user-provided localized type (example: `"Personal"`, `"Professional"`, `"Other"`)
 * @property {'work'|'home'} [label] - A keyword to identify the type, must be `work|home`
 * @property {boolean} [primary] - Indicates a preferred-use address
 * @property {ContactExtendedAddress} [extendedAddress]
 * @property {string} [formattedAddress] - Unstructured version of the address
 * @property {ContactGeo} [geo]
 */

/**
 * @typedef {object} ContactPhone
 * @property {string} number - Phone number
 * @property {string} [type] - A user-provided localized type (example: `"Personal"`, `"Professional"`, `"Other"`), could be provided by Contacts app too as `voice|fax|cell`
 * @property {'work'|'home'} [label] - A keyword to identify the type, must be `work|home`
 * @property {boolean} [primary] - Indicates a preferred-use number
 *
 */

/**
 * @typedef {object} ContactCozy
 * @property {string} url
 * @property {string} [type] - A user-provided localized type (example: `"Personal"`, `"Professional"`, `"Other"`)
 * @property {'work'|'home'} [label] - A keyword to identify the type, must be `work|home`
 * @property {boolean} [primary] - Indicates a preferred-use instance
 *
 */

/**
 * @typedef {object} ContactMetadata
 * @property {boolean} cozy - Whether the contact has been created by cozy
 * @property {object} google - Google metadata
 * @property {number} version - Used for migrations. Current version is 1
 *
 */

/**
 * @typedef {object} ContactDocument
 * @property {object} indexes - Used to sort contacts in different ways
 * @property {string} indexes.byFamilyNameGivenNameEmailCozyUrl - Index for sorting
 * @property {string} displayName - Displayed name in cozy applications
 * @property {string} [fullname] - Unstructured representation of the name (example: "Dr. Gregory House, M.D.")
 * @property {ContactName} [name] - Structured representation of the name
 * @property {string} [birthday] - Birthday (example: "1959-05-15")
 * @property {'male'|'female'} [gender] - Gender (example: "female")
 * @property {string} [note] - Note
 * @property {Array<ContactEmail>} [email] - Email addresses
 * @property {Array<ContactAddress>} [address] - Addresses
 * @property {Array<ContactPhone>} [phone] - Phone numbers
 * @property {Array<ContactCozy>} [cozy] - Cozy instances
 * @property {string} [url] - Cozy instance url (deprecated)
 * @property {string} company - Company
 * @property {string} jobTitle - Job title
 * @property {boolean} [trashed] - true if the contact is marked for removal and will be deleted soon (e.g. after remote deletion is confirmed)
 * @property {boolean} me - Whether the contact matches the cozy owner (defaults to false)
 * @property {Array<string>} [nationalities] - 2-letter iso3166 country codes (can be set in io.cozy.identities for legal reasons in Banks)
 * @property {string} [birthcity] - City of birth of a contact (can be set in io.cozy.identities for legal reasons in Banks)
 * @property {string} [birthcountry] - Country of birth of a contact (can be set in io.cozy.identities for legal reasons in Banks)
 * @property {ContactMetadata} metadata - Previous metadata information
 * @typedef {CozyClientDocument & ContactDocument} IOCozyContact - An io.cozy.contacts document
 */

/**
 * @typedef {object} ClientError
 * @property {string} [status]
 */

/**
 * @typedef FilePlugin
 * @property {object} [externalDataDirectory]
 * @property {object} [cacheDirectory]
 * @property {object} [externalCacheDirectory]
 * @property {object} [dataDirectory]
 */

/**
 * @typedef InAppBrowser
 * @property {Function} open
 */

/**
 * @typedef {object} AppMetadata
 * @property {string} [slug] - slug of the application/konnector which created this data
 * @property {string} [version] - version of the application/konnector which created this data
 * @property {string} [sourceAccount] - id of the account associated to the konnector which created this data
 * @property {string} [sourceAccountIdentifier] - source account identifier account associated to the konnector which created this data
 */

/**
 * @typedef {object} ClientCapabilities
 * @property {boolean} [can_auth_with_oidc] - Whether OIDC login is possible with this Cozy
 * @property {boolean} [can_auth_with_password] - Whether password login is possible with this Cozy
 * @property {boolean} [can_auth_with_magic_links] - Whether magic-link login is possible with this Cozy
 * @property {boolean} [file_versioning] - Whether file versioning is active on this Cozy
 * @property {boolean} [flat_subdomains] - Whether the stack has been configured to use flat subdomains
 * @description Read more about client capabilities here https://docs.cozy.io/en/cozy-stack/settings/#get-settingscapabilities.
 */

/**
 * @typedef {object} CouchDBDocument - A document
 * @property {string} _id - Id of the document
 * @property {string} _rev - Current revision of the document
 * @property {boolean} [_deleted] - When the document has been deleted
 * @property {object} [relationships] - Relationships of the document
 */

/**
 * @typedef {object} CouchDBBulkResult - An item of the CouchDB bulk docs response
 * @property {boolean} ok
 * @property {string} id
 * @property {string} rev
 * @property {string?} error?
 * @property {string?} reason?
 */

/**
 * @typedef {Array<string>|string} ViewKey
 * @typedef {string} DocId
 * @typedef {[ViewKey, DocId]} CouchDBViewCursor
 */

/**
 * @typedef {object} Theme
 * @property {string} id
 * @property {string} label
 * @property {string} icon
 * @property {Array<QualificationAttributes>} items
 * @property {Array<string>} [defaultItems]
 *
 * @typedef {Array<Theme>} ThemesList
 *
 * @typedef {'identity'|'family'|'work_study'|'health'|'home'|'transport'|'finance'|'invoice'|'others'} ThemesLabels
 */

/**
 * @typedef {object} QualificationAttributes
 * @property {string} label
 * @property {string} [purpose]
 * @property {string} [sourceCategory]
 * @property {string} [sourceSubCategory]
 * @property {Array<string>} [subjects]
 */

/**
 * @typedef {'identity_photo'|'national_id_card'|'passport'|'residence_permit'|'family_record_book'|'birth_certificate'|'driver_license'|'other_identity_document'|'citizen_registration_certificate'|'personal_sporting_licence'|'electoral_card'|'note_identity_document'} IdentityLabel
 *
 * @typedef {'family_record_book'|'birth_certificate'|'wedding'|'pacs'|'divorce'|'large_family_card'|'caf'|'other_family_document'|'payment_proof_family_allowance'|'single_parent_benefit'|'note_family_document'|'person_insurance'} FamilyLabel
 *
 * @typedef {'diploma'|'work_contract'|'pay_sheet'|'unemployment_benefit'|'pension'|'gradebook'|'student_card'|'resume'|'motivation_letter'|'other_work_document'|'work_disability_recognition'|'school_attendance_certificate'|'employment_center_certificate'|'school_insurance_certificate'|'note_work_document'|'expense_claim'} WorkStudyLabels
 *
 * @typedef {'health_certificate'|'health_book'|'national_health_insurance_card'|'health_insurance_card'|'prescription'|'health_invoice'|'national_health_insurance_right_certificate'|'work_disability_recognition'|'pregnancy_medical_certificate'|'other_health_document'|'note_health_document'} HealthLabels
 *
 * @typedef {'phone_invoice'|'isp_invoice'|'telecom_invoice'|'energy_invoice'|'water_invoice'|'other_invoice'|'house_sale_agreeement'|'building_permit'|'technical_diagnostic_record'|'lease'|'rent_receipt'|'house_insurance'|'work_quote'|'work_invoice'|'other_house_document'|'unfit_for_habitation_declaration'|'accommodation_proof'|'note_house_document'|'real_estate_insurance'|'condition_report'} HomeLabels
 *
 * @typedef {'driver_license'|'vehicle_registration'|'car_insurance'|'mechanic_invoice'|'transport_invoice'|'other_transport_document'|'transport_card'|'note_transport_document'} TransportLabels
 *
 * @typedef {'fine'|'tax_certificate'|'tax_return'|'tax_notice'|'tax_timetable'|'pay_sheet'|'receipt'|'other_tax_document'|'bank_details'|'bank_statement'|'loan_agreement'|'other_bank_document'|'payment_proof_family_allowance'|'other_revenue'|'single_parent_benefit'|'real_estate_tax'|'note_finance'|'expense_claim'} FinanceLabels
 *
 * @typedef {'phone_invoice'|'isp_invoice'|'telecom_invoice'|'energy_invoice'|'water_invoice'|'appliance_invoice'|'web_service_invoice'|'restaurant_invoice'|'work_invoice'|'transport_invoice'|'health_invoice'|'other_invoice'|'note_invoice'|'expense_claim'|'energy_contract'|'grocery_invoice'} InvoiceLabels
 *
 * @typedef {'personal_sporting_licence'|'other_activity_document'|'fidelity_card'|'note_activity_document'} ActivityLabels
 *
 * @typedef {'other_administrative_document'|'note_other'} OthersLabels
 *
 * @typedef {IdentityLabel|FamilyLabel|WorkStudyLabels|HealthLabels|HomeLabels|TransportLabels|FinanceLabels|InvoiceLabels|ActivityLabels|OthersLabels} ItemsLabels
 */

/**
 * @typedef {'national_id_card'|'other_identity_document'|'resume'|'work_disability_recognition'} iconPeopleLabels
 *
 * @typedef {'employment_center_certificate'|'motivation_letter'|'other_work_document'|'school_attendance_certificate'|'school_insurance_certificate'|'student_card'|'unemployment_benefit'|'work_contract'} iconWorkLabels
 *
 * @typedef {'fine'} iconJusticeLabels
 *
 * @typedef {'residence_permit'} iconGlobeLabels
 *
 * @typedef {'passport'} iconPlaneLabels
 *
 * @typedef {'identity_photo'} iconImageLabels
 *
 * @typedef {'fidelity_card'|'grocery_invoice'} iconShopLabels
 *
 * @typedef {'electoral_card'} iconGouvLabels
 *
 * @typedef {'diploma'|'gradebook'} iconSchoolLabels
 *
 * @typedef {'birth_certificate'} iconChildLabels
 *
 * @typedef {'receipt'} iconEmailLabels
 *
 * @typedef {'appliance_invoice'} iconLaudryLabels
 *
 * @typedef {'accommodation_proof'|'building_permit'|'condition_report'|'house_insurance'|'house_sale_agreeement'|'lease'|'mechanic_invoice'|'other_house_document'|'real_estate_insurance'|'rent_receipt'|'technical_diagnostic_record'|'unfit_for_habitation_declaration'|'work_invoice'|'work_quote'} iconHomeLabels
 *
 * @typedef {'loan_agreement'|'other_revenue'|'pay_sheet'|'payment_proof_family_allowance'|'pension'} iconBenefitLabels
 *
 * @typedef {'other_bank_document'} iconEuroLabels
 *
 * @typedef {'bank_details'} iconBankCheckLabels
 *
 * @typedef {'other_administrative_document'|'other_tax_document'|'real_estate_tax'|'tax_certificate'|'tax_notice'|'tax_return'|'tax_timetable'} iconBankLabels
 *
 * @typedef {'car_insurance'|'driver_license'|'other_transport_document'|'transport_card'|'transport_invoice'|'vehicle_registration'} iconCarLabels
 *
 * @typedef {'energy_contract'|'energy_invoice'} iconLightningLabels
 *
 * @typedef {'isp_invoice'|'telecom_invoice'|'web_service_invoice'} iconTelecomLabels
 *
 * @typedef {'phone_invoice'} iconTelephoneLabels
 *
 * @typedef {'water_invoice'} iconWaterLabels
 *
 * @typedef {'expense_claim'} iconRemboursementLabels
 *
 * @typedef {'restaurant_invoice'} iconRestaurantLabels
 *
 * @typedef {'other_invoice'} iconBillLabels
 *
 * @typedef {'caf'|'citizen_registration_certificate'|'divorce'|'family_record_book'|'large_family_card'|'other_family_document'|'pacs'|'single_parent_benefit'|'wedding'} iconTeamLabels
 *
 * @typedef {'other_activity_document'|'personal_sporting_licence'} iconFitnessLabels
 *
 * @typedef {'health_book'|'health_certificate'|'health_insurance_card'|'health_invoice'|'national_health_insurance_card'|'national_health_insurance_right_certificate'|'other_health_document'|'person_insurance'|'pregnancy_medical_certificate'|'prescription'} iconHeartLabels
 *
 * @typedef {'bank_statement'} iconExchangeLabels
 *
 * @typedef {'note_activity_document'|'note_family_document'|'note_finance'|'note_health_document'|'note_house_document'|'note_identity_document'|'note_invoice'|'note_transport_document'|'note_work_document'} iconFileTypeNoteLabels
 */

/**
 * @typedef {'bank-check'|'bank'|'benefit'|'bill'|'car'|'child'|'email'|'euro'|'exchange'|'file-type-note'|'fitness'|'globe'|'gouv'|'heart'|'home'|'image'|'justice'|'laudry'|'lightning'|'people'|'plane'|'remboursement'|'restaurant'|'school'|'shop'|'team'|'telecom'|'telephone'|'water'|'work'} IconQualificationLabels
 */

/**
 * @typedef {{ icon: IconQualificationLabels, labels: Array<string> }} iconLabelPairs
 */

/**
 * @typedef {object} DACCMeasure
 * See https://github.com/cozy/DACC
 *
 * @property {string} measureName - It must match an existing measure name on the DACC server
 * @property {string} startDate - Start of the aggregation period. Should be in YYYY-MM-DD format
 * @property {number} value - The measured value on the aggregation period
 * @property {string} createdBy - The slug of the app creating the measure
 * @property {object} group1 - Should be a {key: value} where the key is set in the measure definition.
 * @property {object} group2 - Should be a {key: value} where the key is set in the measure definition.
 * @property {object} group3 - Should be a {key: value} where the key is set in the measure definition.
 */

/**
 * @typedef {object} DACCAggregatesParams
 * See https://github.com/cozy/DACC
 *
 * @property {string} measureName - It must match an existing measure name on the DACC server
 * @property {string} startDate - Start of the aggregation period. Should be in YYYY-MM-DD format
 * @property {string} endDate - End of the aggregation period. Should be in YYYY-MM-DD format
 */

/**
 * @typedef {Array<DACCAggregate>} DACCAggregatesResponse
 * See https://github.com/cozy/DACC
 */

/**
 * @typedef {object} DACCAggregate
 * See https://github.com/cozy/DACC
 *
 * @property {string} measureName - The name of the measures aggregate
 * @property {string} startDate - The aggregation start date
 * @property {number} sum - The aggregate sum
 * @property {number} count - The aggregate count
 * @property {number} countNotZero - The aggregate count of values different from zero
 * @property {number} avg - The aggregate average
 * @property {number} min - The aggregate min
 * @property {number} max - The aggregate max
 * @property {number} std - The aggregate standard deviation
 *
 */

/**
 * @typedef {object} Coordinates
 * @property {number} lat - The latitude, in decimal degrees
 * @property {number} lon - The longitude, in decimal degrees
 */

/**
 * Receives the URL to present to the user as a parameter, and should return a promise that resolves with the URL the user was redirected to after accepting the permissions.
 *
 * @callback OpenURLCallback
 * @param {string} url - URL to present to the user
 */

/**
 * A session code generated by the cozy-stack that can be used to create a session
 *
 * More information: https://docs.cozy.io/en/cozy-stack/auth/#post-authsession_code
 *
 * @typedef {string} SessionCode
 */

/**
 * An object containing a code verifier and a code challenge that can be used in a
 * PKCE verification process
 *
 * More information: https://docs.cozy.io/en/cozy-stack/auth/#pkce-extension
 *
 * @typedef {object} PKCECodes
 * @property {string} [codeVerifier]
 * @property {string} [codeChallenge]
 */

/**
 * Subdomain type for a Cozy. Can be flat or nested subdomains
 *
 * Example of 'flat' domain: https://claude-notes.somedomain.fr
 * Example of 'nested' domain: https://notes.claude.somedomain.fr
 *
 * @typedef {'flat'|'nested'} SubdomainType
 */

/**
 * Represents the different parts of a deconstructed Cozy link
 *
 * @typedef {object} CozyLinkData
 * @property {string} cozyBaseDomain - The Cozy's domain (i.e. 'mycozy.cloud')
 * @property {string} cozyName - The Cozy's name (i.e. 'claude')
 * @property {string} [hash] - The link's path (i.e. '#/folder/SOME_FOLDER_ID')
 * @property {string} [pathname] - The link's path (i.e. '/public/')
 * @property {string} protocol - The link's protocol (i.e. 'https')
 * @property {string} [searchParams] - The link's searchParams (i.e. 'id=SOME_FOLDER_ID&sharecode=SOME_SHARECODE')
 * @property {string} slug - The link's slug (i.e. 'drive' or 'notes)
 */

/**
 * Represents the different parts of a deconstructed redirect link
 *
 * @typedef {object} RedirectLinkData
 * @property {string} slug - The redirect link's slug (i.e. 'drive')
 * @property {string} pathname - The redirect link's path (i.e. 'public')
 * @property {string} hash - The redirect link's path (i.e. '/folder/SOME_FOLDER_ID')
 */

/**
 * Represents available options of generateNewFileNameOnConflict method
 *
 * @typedef {object} ConflictOptions
 * @property {string} [delimiter] - Custom delimiter before the incremented number. Defaults to parenthesized copy counters.
 */

/**
 * Template to type useState
 *
 * @template T
 * @typedef {[T, import('react').Dispatch<import('react').SetStateAction<T>>]} useState
 */

/**
 * Represents the Cozy's instance parameters
 *
 * @typedef {object} InstanceData
 * @property {string} email - The email of the instance
 * @property {string} locale - The locale used on the server
 * @property {string} [public_name] - The public displayed name of the instance
 * @property {string} [uuid] - UUID associated with the instance
 * @property {string} [context] - The name of the context attached to the instance
 * @property {string} [default_redirection] - Redirect to a specific route after the login (format: 'appslug/#/path/to/route'). This value has priority over the Context's default_redirection
 * @property {boolean} [onboarding_finished] - Whether or not the onboarding is complete
 * @property {boolean} [password_defined] - Whether or not the Cozy has a password defined (i.e. may be false for OIDC instances)
 * @property {'basic' | 'two_factor_mail'} [auth_mode] - Authentication type (basic or 2FA)
 * @property {string} [oidc_id] - An identifier to check authentication from OIDC
 * @property {string} [tos] - Terms of Service signed version
 * @property {string} [tos_latest] - Terms of Service latest version
 * @property {string} [legal_notice_url] - URL of the legal notice (given by cozy-stack)
 */

/**
 * Represents the Cozy's instance parameters
 *
 * @typedef {object} Instance
 * @property {InstanceData} data - data from Instance Query
 */

/**
 * Represents the Cozy's context parameters
 *
 * @typedef {object} ContextData
 * @property {string} [default_redirection] - Redirect to a specific route after the login (format: 'appslug/#/path/to/route')
 * @property {string} [onboarded_redirection] - Redirect to a specific route after the onboarding (format: appslug/#/path/to/route')
 * @property {string} [help_link] - Link that the user can use to get help (i.e. 'https://forum.cozy.io/')
 * @property {string} [manager_url] - Url of the instance's Manager that can be use to enable/disable premium features
 * @property {boolean} [enable_premium_links] - Whether or not the Cozy can show links to the Manager in order to enable/disable premium features
 */

/**
 * Represents the Cozy's context parameters
 *
 * @typedef {object} Context
 * @property {ContextData} data - data from Context Query
 */

/**
 * Represents the Cozy's disk usage
 *
 * @typedef {object} DiskUsageData
 * @property {string} [quota] - Value in bytes representing the maximum space available. Omitted means unlimited
 * @property {string} used - Value in bytes representing the space used
 * @property {string} files - Value in bytes representing the space used by files in their last version
 * @property {string} versions - Value in bytes representing the space used by files in their older version
 * @property {string} [trash] - Value in bytes representing the space used by files in the trash
 */

/**
 * Represents the Cozy's disk usage
 *
 * @typedef {object} DiskUsage
 * @property {DiskUsageData} data - data from DiskUsage Query
 */

/**
 * Represents the Cozy's instance info (instance level parameters, context level parameters and disk usage)
 *
 * @typedef {object} InstanceInfo
 * @property {boolean} isLoaded - Whether or not the queries have been loaded
 * @property {Instance} instance - The Cozy's instance parameters
 * @property {Context} context - The Cozy's context parameters
 * @property {DiskUsage} diskUsage - The Cozy's disk usage
 */

/**
 * @typedef {Object} CountryISO
 * @property {string} code2 - ISO 3166-1 alpha-2
 * @property {string} code3 - ISO 3166-1 alpha-3
 * @property {string} number - ISO 3166-1 numeric
 */

/**
 * @typedef {Object} Country
 * @property {string} code2 - ISO 3166-1 alpha-2
 * @property {string} code3 - ISO 3166-1 alpha-3
 * @property {string} number - ISO 3166-1 numeric
 * @property {string} name - Country name
 * @property {string} nationality - Nationality name
 */

export default {}
