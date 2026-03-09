## Classes

<dl>
<dt><a href="#AppCollection">AppCollection</a></dt>
<dd><p>Extends <code>DocumentCollection</code> API along with specific methods for <code>io.cozy.apps</code>.</p>
</dd>
<dt><a href="#AppsRegistryCollection">AppsRegistryCollection</a></dt>
<dd><p>Extends <code>DocumentCollection</code> API along with specific methods for <code>io.cozy.apps_registry</code>.</p>
</dd>
<dt><a href="#Collection">Collection</a></dt>
<dd><p>Utility class to abstract an regroup identical methods and logics for
specific collections.</p>
</dd>
<dt><a href="#CozyStackClient">CozyStackClient</a></dt>
<dd><p>Main API against the <code>cozy-stack</code> server.</p>
</dd>
<dt><a href="#DocumentCollection">DocumentCollection</a></dt>
<dd><p>Abstracts a collection of documents of the same doctype, providing CRUD methods and other helpers.</p>
</dd>
<dt><a href="#FileCollection">FileCollection</a></dt>
<dd><p>Implements <code>DocumentCollection</code> API along with specific methods for
<code>io.cozy.files</code>.</p>
<p>Files are a special type of documents and are handled differently by the stack:
special routes are to be used, and there is a notion of referenced files, aka
files associated to a specific document</p>
</dd>
<dt><a href="#NotesCollection">NotesCollection</a></dt>
<dd><p>Implements <code>DocumentCollection</code> API to interact with the /notes endpoint of the stack</p>
</dd>
<dt><a href="#OAuthClient">OAuthClient</a></dt>
<dd><p>Specialized <code>CozyStackClient</code> for mobile, implementing stack registration
through OAuth.</p>
</dd>
<dt><a href="#OAuthClientsCollection">OAuthClientsCollection</a></dt>
<dd><p>Implements <code>DocumentCollection</code> API to interact with the /settings/clients endpoint of the stack</p>
</dd>
<dt><a href="#PermissionCollection">PermissionCollection</a></dt>
<dd><p>Implements <code>DocumentCollection</code> API along with specific methods for <code>io.cozy.permissions</code>.</p>
</dd>
<dt><a href="#PromiseCache">PromiseCache</a></dt>
<dd><p>Caches promises while they are pending
Serves to dedupe equal queries requested at the same time</p>
</dd>
<dt><a href="#SettingsCollection">SettingsCollection</a></dt>
<dd><p>Implements <code>DocumentCollection</code> API to interact with the /settings endpoint of the stack</p>
</dd>
<dt><a href="#SharingCollection">SharingCollection</a></dt>
<dd><p>Implements the <code>DocumentCollection</code> API along with specific methods for
<code>io.cozy.sharings</code>.</p>
</dd>
<dt><a href="#ShortcutsCollection">ShortcutsCollection</a></dt>
<dd><p>Provides helpers to interact with shortcuts documents on the Cozy stack.</p>
</dd>
<dt><a href="#TriggerCollection">TriggerCollection</a></dt>
<dd><p>Implements <code>DocumentCollection</code> API along with specific methods for <code>io.cozy.triggers</code>.</p>
</dd>
</dl>

## Constants

<dl>
<dt><a href="#dontThrowNotFoundError">dontThrowNotFoundError</a> ⇒ <code>object</code></dt>
<dd><p>Handler for error response which return a empty value for &quot;not found&quot; error</p>
</dd>
<dt><a href="#isIndexNotFoundError">isIndexNotFoundError</a> ⇒ <code>Array</code> | <code>null</code></dt>
<dd><p>Helper to identify an index not found error</p>
</dd>
<dt><a href="#isIndexConflictError">isIndexConflictError</a> ⇒ <code>Array</code> | <code>null</code></dt>
<dd><p>Helper to identify an index conflict</p>
</dd>
<dt><a href="#isIndexNotUsedWarning">isIndexNotUsedWarning</a> ⇒ <code>Array</code> | <code>null</code></dt>
<dd><p>Helper to identify a not used index</p>
</dd>
<dt><a href="#isNoUsableIndexError">isNoUsableIndexError</a> ⇒ <code>Array</code> | <code>null</code></dt>
<dd><p>Helper to identify a no usable index error</p>
</dd>
<dt><a href="#isTimeoutError">isTimeoutError</a> ⇒ <code>Array</code> | <code>null</code></dt>
<dd><p>Helper to identify timeout error
See cozy-stack&#39;s timeout value for couchdb request: <a href="https://github.com/cozy/cozy-stack/blob/669cd694132388ef6b7d1a58cf3d1b5dfb52896a/pkg/config/config/config.go#L963">https://github.com/cozy/cozy-stack/blob/669cd694132388ef6b7d1a58cf3d1b5dfb52896a/pkg/config/config/config.go#L963</a></p>
</dd>
<dt><a href="#isDocumentUpdateConflict">isDocumentUpdateConflict</a> ⇒ <code>Array</code> | <code>null</code></dt>
<dd><p>Helper to identify a document conflict</p>
</dd>
<dt><a href="#isFile">isFile</a> ⇒ <code>boolean</code></dt>
<dd><p>Returns true when parameter has type directory, file or has _type io.cozy.files</p>
</dd>
<dt><a href="#isDirectory">isDirectory</a> ⇒ <code>boolean</code></dt>
<dd><p>Returns true when parameters has type directory</p>
</dd>
<dt><a href="#getIllegalCharacters">getIllegalCharacters</a> ⇒ <code>string</code></dt>
<dd><p>Get the list of illegal characters in the file name</p>
</dd>
<dt><a href="#makeKeyFromPartialFilter">makeKeyFromPartialFilter</a> ⇒ <code>string</code></dt>
<dd><p>Process a partial filter to generate a string key</p>
<p>/!\ Warning: this method is similar to cozy-pouch-link mango.makeKeyFromPartialFilter()
If you edit this method, please check if the change is also needed in mango file</p>
</dd>
<dt><a href="#getIndexNameFromFields">getIndexNameFromFields</a> ⇒ <code>string</code></dt>
<dd><p>Name an index, based on its indexed fields and partial filter.</p>
<p>It follows this naming convention:
<code>by_{indexed_field1}_and_{indexed_field2}_filter_({partial_filter.key1}_{partial_filter.value1})_and_({partial_filter.key2}_{partial_filter.value2})</code></p>
<p>/!\ Warning: this method is similar to cozy-pouch-link mango.getIndexNameFromFields()
If you edit this method, please check if the change is also needed in mango file</p>
</dd>
<dt><a href="#transformSort">transformSort</a> ⇒ <code><a href="#MangoSort">MangoSort</a></code></dt>
<dd><p>Transform sort into Array</p>
</dd>
<dt><a href="#getIndexFields">getIndexFields</a> ⇒ <code>Array</code></dt>
<dd><p>Compute fields that should be indexed for a mango
query to work</p>
</dd>
<dt><a href="#isMatchingIndex">isMatchingIndex</a> ⇒ <code>boolean</code></dt>
<dd><p>Check if an index is matching the given fields</p>
</dd>
<dt><a href="#makeOperatorsExplicit">makeOperatorsExplicit</a> ⇒ <code>object</code></dt>
<dd><p>Transform a query to make all operators explicit</p>
</dd>
<dt><a href="#getPermissionsFor">getPermissionsFor</a> ⇒ <code>object</code></dt>
<dd><p>Build a permission set</p>
</dd>
<dt><a href="#normalizeSettings">normalizeSettings</a> ⇒ <code>object</code></dt>
<dd><p>Normalizing a document for SettingsCollection context</p>
</dd>
<dt><a href="#getSharingRules">getSharingRules</a> ⇒ <code><a href="#Rule">Array.&lt;Rule&gt;</a></code></dt>
<dd><p>Rules determine the behavior of the sharing when changes are made to the shared document
See <a href="https://docs.cozy.io/en/cozy-stack/sharing-design/#description-of-a-sharing">https://docs.cozy.io/en/cozy-stack/sharing-design/#description-of-a-sharing</a></p>
</dd>
<dt><a href="#SHORTCUTS_DOCTYPE">SHORTCUTS_DOCTYPE</a> : <code>string</code></dt>
<dd><p>Doctype for shortcuts documents.</p>
</dd>
<dt><a href="#forceDownload">forceDownload</a></dt>
<dd><p>Force a download from the given href</p>
</dd>
<dt><a href="#encodePath">encodePath</a> ⇒ <code>string</code></dt>
<dd><p>Encode a path for use in a URL by encoding special characters but keeping slashes</p>
</dd>
<dt><a href="#sharedDriveApiPrefix">sharedDriveApiPrefix</a> ⇒ <code>string</code></dt>
<dd><p>Returns a FileCollection API prefix for manipulating a shared
drive&#39;s files.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#getAccessToken">getAccessToken()</a> ⇒ <code>string</code></dt>
<dd><p>Get the access token string</p>
</dd>
<dt><a href="#getAccessToken">getAccessToken()</a> ⇒ <code>string</code></dt>
<dd><p>Get the app token string</p>
</dd>
<dt><a href="#getIconURL">getIconURL()</a></dt>
<dd><p>Get Icon URL using blob mechanism if OAuth connected
or using preloaded url when blob not needed</p>
</dd>
<dt><a href="#handleNorOperator">handleNorOperator(conditions)</a> ⇒ <code>Array</code></dt>
<dd><p>Handle the $nor operator in a query
CouchDB transforms $nor into $and with $ne operators</p>
</dd>
<dt><a href="#sortObjectByKey">sortObjectByKey(a, b)</a> ⇒ <code>number</code></dt>
<dd><p>Compares two objects based on their first key to determine their order.</p>
</dd>
<dt><a href="#garbageCollect">garbageCollect()</a></dt>
<dd><p>Delete outdated results from cache</p>
</dd>
<dt><a href="#memoize">memoize()</a></dt>
<dd><p>Memoize with maxDuration and custom key</p>
</dd>
<dt><a href="#normalizeDoctypeJsonApi">normalizeDoctypeJsonApi(doctype)</a> ⇒ <code>function</code></dt>
<dd><p>Normalizes a document in JSON API format for a specific doctype</p>
</dd>
<dt><a href="#getSharingRulesForPhotosAlbum">getSharingRulesForPhotosAlbum(document)</a> ⇒ <code><a href="#Rule">Array.&lt;Rule&gt;</a></code></dt>
<dd><p>Compute the rules that define how to share a Photo Album. See <a href="https://docs.cozy.io/en/cozy-stack/sharing-design/#description-of-a-sharing">https://docs.cozy.io/en/cozy-stack/sharing-design/#description-of-a-sharing</a></p>
</dd>
<dt><a href="#getSharingPolicyForReferencedFiles">getSharingPolicyForReferencedFiles()</a> ⇒ <code><a href="#SharingPolicy">SharingPolicy</a></code></dt>
<dd><p>Compute the sharing policy for a ReferencedFile based on its sharing type</p>
</dd>
<dt><a href="#getSharingPolicyForAlbum">getSharingPolicyForAlbum()</a> ⇒ <code><a href="#Rule">Array.&lt;Rule&gt;</a></code></dt>
<dd><p>Compute the sharing policy for an Album based on its sharing type</p>
</dd>
<dt><a href="#getSharingRulesForFile">getSharingRulesForFile(document)</a> ⇒ <code><a href="#Rule">Array.&lt;Rule&gt;</a></code></dt>
<dd><p>Compute the rules that define how to share a File. See <a href="https://docs.cozy.io/en/cozy-stack/sharing-design/#description-of-a-sharing">https://docs.cozy.io/en/cozy-stack/sharing-design/#description-of-a-sharing</a></p>
</dd>
<dt><a href="#getSharingRulesForSharedDrive">getSharingRulesForSharedDrive(document)</a> ⇒ <code><a href="#Rule">Array.&lt;Rule&gt;</a></code></dt>
<dd><p>Compute the rules that define a shared drive.</p>
</dd>
<dt><a href="#getSharingPolicyForFile">getSharingPolicyForFile(document)</a> ⇒ <code><a href="#SharingPolicy">SharingPolicy</a></code></dt>
<dd><p>Compute the sharing policy for a File based on its sharing type</p>
</dd>
<dt><a href="#getSharingRulesForOrganizations">getSharingRulesForOrganizations(document)</a> ⇒ <code><a href="#Rule">Array.&lt;Rule&gt;</a></code></dt>
<dd><p>Compute the rules that define how to share an Organization. See <a href="https://docs.cozy.io/en/cozy-stack/sharing-design/#description-of-a-sharing">https://docs.cozy.io/en/cozy-stack/sharing-design/#description-of-a-sharing</a></p>
</dd>
<dt><a href="#toRelationshipItem">toRelationshipItem(item)</a> ⇒ <code><a href="#RelationshipItem">RelationshipItem</a></code></dt>
<dd><p>Compute the RelationshipItem that can be referenced as a sharing recipient</p>
</dd>
<dt><a href="#getCozyURL">getCozyURL()</a></dt>
<dd><p>Get a uniform formatted URL and SSL information according to a provided URL</p>
</dd>
<dt><a href="#joinPath">joinPath(start, end)</a> ⇒ <code>string</code></dt>
<dd><p>Join two paths together ensuring there is only one slash between them</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#FetchChangesReturnValue">FetchChangesReturnValue</a> ⇒ <code><a href="#FetchChangesReturnValue">Promise.&lt;FetchChangesReturnValue&gt;</a></code></dt>
<dd><p>Use Couch _changes API
Deleted and design docs are filtered by default, thus documents are retrieved in the response
(include_docs is set to true in the parameters of _changes).</p>
<p>You should use fetchChangesRaw to have low level control on _changes parameters.</p>
</dd>
<dt><a href="#CozyStackClient">CozyStackClient</a> : <code>module:&quot;./CozyStackClient.js&quot;</code></dt>
<dd></dd>
<dt><a href="#IOCozyFolder">IOCozyFolder</a> : <code>object</code></dt>
<dd><p>Folder</p>
</dd>
<dt><a href="#SpecificFileAttributesForKonnector">SpecificFileAttributesForKonnector</a> : <code>object</code></dt>
<dd><p>Specific file attributes for creation for konnector</p>
</dd>
<dt><a href="#CouchDBViewCursor">CouchDBViewCursor</a> : <code>Array.&lt;string&gt;</code> | <code>string</code></dt>
<dd><p>Cursor used for Mango queries pagination</p>
</dd>
<dt><a href="#DirectoryAttributes">DirectoryAttributes</a> : <code>object</code></dt>
<dd><p>Attributes used for directory creation</p>
</dd>
<dt><a href="#FileAttributes">FileAttributes</a> : <code>object</code></dt>
<dd><p>Attributes used for file creation</p>
</dd>
<dt><a href="#FileDocument">FileDocument</a> : <code>object</code></dt>
<dd><p>Document representing a io.cozy.files</p>
</dd>
<dt><a href="#Stream">Stream</a> : <code>object</code></dt>
<dd><p>Stream is not defined in a browser, but is on NodeJS environment</p>
</dd>
<dt><a href="#OAuthClient">OAuthClient</a> : <code>object</code></dt>
<dd><p>Document representing a io.cozy.oauth.clients</p>
</dd>
<dt><a href="#FileCollectionOptions">FileCollectionOptions</a> : <code>object</code></dt>
<dd><p>Options that can be passed to FileCollection&#39;s constructor</p>
</dd>
<dt><a href="#ArchivePages">ArchivePages</a> : <code>object</code></dt>
<dd><p>Attributes used for create archive link by ids</p>
</dd>
<dt><a href="#FetchChangesReturnValue">FetchChangesReturnValue</a> ⇒ <code><a href="#FetchChangesReturnValue">FetchChangesReturnValue</a></code></dt>
<dd><p>Use cozy-stack&#39;s _changes API for io.cozy.files
Design docs are filtered by default, thus documents are retrieved in the
response (includeDocs is set to true in the parameters of _changes).
Deleted and trashed documents can be filtered on demand and files&#39; paths
can be requested as well.</p>
<p>Since deleted and trashed documents are skipped by cozy-stack rather than
CouchDB, when either option is set to true, the response can contain less
documents than the defined limit. Thus one should rely solely on the
<code>pending</code> result attribute to determine if more documents can be fetched or
not.</p>
<p>You should use fetchChangesRaw to call CouchDB&#39;s _changes API.</p>
</dd>
<dt><a href="#JobDocument">JobDocument</a> : <code>object</code></dt>
<dd><p>Document representing a io.cozy.jobs</p>
</dd>
<dt><a href="#MangoPartialFilter">MangoPartialFilter</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#MangoSelector">MangoSelector</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#MangoSort">MangoSort</a> : <code>Array.&lt;object&gt;</code></dt>
<dd></dd>
<dt><a href="#MangoQueryOptions">MangoQueryOptions</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#DesignDoc">DesignDoc</a> : <code>object</code></dt>
<dd><p>Attributes representing a design doc</p>
</dd>
<dt><a href="#CozyStackClient">CozyStackClient</a> : <code>module:&quot;./CozyStackClient.js&quot;</code></dt>
<dd></dd>
<dt><a href="#NotesCollectionOptions">NotesCollectionOptions</a> : <code>object</code></dt>
<dd><p>Options that can be passed to NotesCollection&#39;s constructor</p>
</dd>
<dt><a href="#SessionCode">SessionCode</a> : <code>string</code></dt>
<dd></dd>
<dt><a href="#SessionCodeRes">SessionCodeRes</a></dt>
<dd></dd>
<dt><a href="#AccessTokenRes">AccessTokenRes</a></dt>
<dd></dd>
<dt><a href="#TwoFactorNeededRes">TwoFactorNeededRes</a></dt>
<dd></dd>
<dt><a href="#PermissionCollectionOptions">PermissionCollectionOptions</a> : <code>object</code></dt>
<dd><p>Options that can be passed to PermissionCollection&#39;s constructor</p>
</dd>
<dt><a href="#Permission">Permission</a> ⇒ <code><a href="#Permission">Permission</a></code></dt>
<dd><p>async getOwnPermissions - deprecated: please use fetchOwnPermissions instead</p>
</dd>
<dt><a href="#Permission">Permission</a> ⇒ <code><a href="#Permission">Permission</a></code></dt>
<dd><p>async fetchOwnPermissions - Fetches permissions</p>
</dd>
<dt><a href="#Rule">Rule</a> : <code>object</code></dt>
<dd><p>A sharing rule</p>
</dd>
<dt><a href="#SharingRulesOptions">SharingRulesOptions</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#Recipient">Recipient</a> : <code>object</code></dt>
<dd><p>An io.cozy.contact</p>
</dd>
<dt><a href="#Sharing">Sharing</a> : <code>object</code></dt>
<dd><p>An io.cozy.sharings document</p>
</dd>
<dt><a href="#SharingPolicy">SharingPolicy</a> : <code>object</code></dt>
<dd><p>Define the add/update/remove policies for a sharing</p>
</dd>
<dt><a href="#SharingType">SharingType</a> : <code>undefined</code> | <code>&#x27;one-way&#x27;</code> | <code>&#x27;two-way&#x27;</code></dt>
<dd><p>Define how a document is synced between sharing&#39;s owner and receivers.</p>
</dd>
<dt><a href="#RelationshipItem">RelationshipItem</a> : <code>object</code></dt>
<dd><p>Define a recipient that can be used as target of a sharing</p>
</dd>
<dt><a href="#CozyStackClient">CozyStackClient</a> : <code>object</code></dt>
<dd></dd>
</dl>

<a name="AppCollection"></a>

## AppCollection
Extends `DocumentCollection` API along with specific methods for `io.cozy.apps`.

**Kind**: global class  
<a name="AppCollection+all"></a>

### appCollection.all() ⇒ <code>Object</code>
Lists all apps, without filters.

The returned documents are not paginated by the stack.

**Kind**: instance method of [<code>AppCollection</code>](#AppCollection)  
**Returns**: <code>Object</code> - The JSON API conformant response.  
**Throws**:

- <code>FetchError</code> 

<a name="AppsRegistryCollection"></a>

## AppsRegistryCollection
Extends `DocumentCollection` API along with specific methods for `io.cozy.apps_registry`.

**Kind**: global class  
<a name="AppsRegistryCollection+get"></a>

### appsRegistryCollection.get(slug) ⇒ <code>Promise.&lt;{data: object}&gt;</code>
Fetches an app from the registry.

**Kind**: instance method of [<code>AppsRegistryCollection</code>](#AppsRegistryCollection)  
**Returns**: <code>Promise.&lt;{data: object}&gt;</code> - JsonAPI response containing normalized document as data attribute  
**Throws**:

- <code>FetchError</code> 


| Param | Type | Description |
| --- | --- | --- |
| slug | <code>string</code> | Slug of the app |

<a name="Collection"></a>

## Collection
Utility class to abstract an regroup identical methods and logics for
specific collections.

**Kind**: global class  
<a name="Collection.get"></a>

### Collection.get(stackClient, endpoint, options) ⇒ <code>Promise.&lt;object&gt;</code>
Utility method aimed to return only one document.

**Kind**: static method of [<code>Collection</code>](#Collection)  
**Returns**: <code>Promise.&lt;object&gt;</code> - JsonAPI response containing normalized
document as data attribute  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| stackClient | [<code>CozyStackClient</code>](#CozyStackClient) |  | CozyStackClient |
| endpoint | <code>string</code> |  | Stack endpoint |
| options | <code>object</code> |  | Options of the collection |
| options.normalize | <code>function</code> |  | Callback to normalize response data (default `data => data`) |
| [options.method] | <code>string</code> | <code>&quot;GET&quot;</code> | HTTP method |

<a name="CozyStackClient"></a>

## CozyStackClient
Main API against the `cozy-stack` server.

**Kind**: global class  

* [CozyStackClient](#CozyStackClient)
    * [.collection(doctype, options)](#CozyStackClient+collection) ⇒ [<code>DocumentCollection</code>](#DocumentCollection)
    * [.fetch(method, path, [body], [opts])](#CozyStackClient+fetch) ⇒ <code>object</code>
    * [.refreshToken()](#CozyStackClient+refreshToken) ⇒ <code>Promise</code>
    * [.fetchJSON(method, path, body, options)](#CozyStackClient+fetchJSON) ⇒ <code>object</code>
    * [.setToken(token)](#CozyStackClient+setToken)
    * [.getAccessToken()](#CozyStackClient+getAccessToken) ⇒ <code>string</code>

<a name="CozyStackClient+collection"></a>

### cozyStackClient.collection(doctype, options) ⇒ [<code>DocumentCollection</code>](#DocumentCollection)
Creates a [DocumentCollection](#DocumentCollection) instance.

**Kind**: instance method of [<code>CozyStackClient</code>](#CozyStackClient)  

| Param | Type | Description |
| --- | --- | --- |
| doctype | <code>string</code> | The collection doctype. |
| options | <code>object</code> | Options to pass to the collection. |

<a name="CozyStackClient+fetch"></a>

### cozyStackClient.fetch(method, path, [body], [opts]) ⇒ <code>object</code>
Fetches an endpoint in an authorized way.

**Kind**: instance method of [<code>CozyStackClient</code>](#CozyStackClient)  
**Throws**:

- <code>FetchError</code> 


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| method | <code>string</code> |  | The HTTP method. |
| path | <code>string</code> |  | The URI. |
| [body] | <code>object</code> |  | The payload. |
| [opts] | <code>object</code> | <code>{}</code> | Options for fetch |

<a name="CozyStackClient+refreshToken"></a>

### cozyStackClient.refreshToken() ⇒ <code>Promise</code>
Retrieves a new app token by refreshing the currently used token.

**Kind**: instance method of [<code>CozyStackClient</code>](#CozyStackClient)  
**Returns**: <code>Promise</code> - A promise that resolves with a new AccessToken object  
**Throws**:

- <code>Error</code> The client should already have an access token to use this function
- <code>Error</code> The client couldn't fetch a new token

<a name="CozyStackClient+fetchJSON"></a>

### cozyStackClient.fetchJSON(method, path, body, options) ⇒ <code>object</code>
Fetches JSON in an authorized way.

**Kind**: instance method of [<code>CozyStackClient</code>](#CozyStackClient)  
**Throws**:

- <code>FetchError</code> 


| Param | Type | Description |
| --- | --- | --- |
| method | <code>string</code> | The HTTP method. |
| path | <code>string</code> | The URI. |
| body | <code>object</code> | The payload. |
| options | <code>object</code> | Options |

<a name="CozyStackClient+setToken"></a>

### cozyStackClient.setToken(token)
Change or set the API token

**Kind**: instance method of [<code>CozyStackClient</code>](#CozyStackClient)  

| Param | Type | Description |
| --- | --- | --- |
| token | <code>string</code> \| <code>AppToken</code> \| <code>AccessToken</code> | Stack API token |

<a name="CozyStackClient+getAccessToken"></a>

### cozyStackClient.getAccessToken() ⇒ <code>string</code>
Get the access token string, being an oauth token or an app token

**Kind**: instance method of [<code>CozyStackClient</code>](#CozyStackClient)  
**Returns**: <code>string</code> - token  
<a name="DocumentCollection"></a>

## DocumentCollection
Abstracts a collection of documents of the same doctype, providing CRUD methods and other helpers.

**Kind**: global class  

* [DocumentCollection](#DocumentCollection)
    * _instance_
        * [.all(options)](#DocumentCollection+all) ⇒ <code>Promise.&lt;{data, meta, skip, bookmark, next}&gt;</code>
        * [.fetchDocumentsWithMango(path, selector, options)](#DocumentCollection+fetchDocumentsWithMango)
        * [.findWithMango(path, selector, options)](#DocumentCollection+findWithMango) ⇒ <code>Promise.&lt;object&gt;</code>
        * [.find(selector, options)](#DocumentCollection+find) ⇒ <code>Promise.&lt;{data, skip, bookmark, next, execution\_stats}&gt;</code>
        * [.findAll(selector, options)](#DocumentCollection+findAll) ⇒ <code>Promise.&lt;Array.&lt;{data}&gt;&gt;</code>
        * [.get(id)](#DocumentCollection+get) ⇒ <code>Promise.&lt;object&gt;</code>
        * [.getAll()](#DocumentCollection+getAll)
        * [.create(doc)](#DocumentCollection+create)
        * [.update(document)](#DocumentCollection+update)
        * [.destroy(doc)](#DocumentCollection+destroy)
        * [.updateAll(rawDocs)](#DocumentCollection+updateAll)
        * [.destroyAll(docs)](#DocumentCollection+destroyAll)
        * [.toMangoOptions(selector, options)](#DocumentCollection+toMangoOptions) ⇒ [<code>MangoQueryOptions</code>](#MangoQueryOptions)
        * [.createIndex(fields, indexOption)](#DocumentCollection+createIndex) ⇒ <code>Promise.&lt;{id, fields}&gt;</code>
        * [.fetchAllMangoIndexes()](#DocumentCollection+fetchAllMangoIndexes) ⇒ <code>Promise.&lt;Array.&lt;DesignDoc&gt;&gt;</code>
        * [.destroyIndex(index)](#DocumentCollection+destroyIndex) ⇒ <code>Promise.&lt;object&gt;</code>
        * [.copyIndex(existingIndex, newIndexName)](#DocumentCollection+copyIndex) ⇒ [<code>Promise.&lt;DesignDoc&gt;</code>](#DesignDoc)
        * [.fetchChangesRaw(couchOptions)](#DocumentCollection+fetchChangesRaw)
    * _static_
        * [.normalizeDoctype(doctype)](#DocumentCollection.normalizeDoctype) ⇒ <code>function</code>

<a name="DocumentCollection+all"></a>

### documentCollection.all(options) ⇒ <code>Promise.&lt;{data, meta, skip, bookmark, next}&gt;</code>
Lists all documents of the collection, without filters.

The returned documents are paginated by the stack.

**Kind**: instance method of [<code>DocumentCollection</code>](#DocumentCollection)  
**Returns**: <code>Promise.&lt;{data, meta, skip, bookmark, next}&gt;</code> - The JSON API conformant response.  
**Throws**:

- <code>FetchError</code> 


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>object</code> |  | The fetch options: pagination & fetch of specific docs. |
| [options.limit] | <code>number</code> \| <code>null</code> | <code>100</code> | Pagination limit |
| [options.skip] | <code>number</code> | <code>0</code> | Pagination Skip |
| [options.bookmark] | <code>string</code> |  | Pagination bookmark |
| [options.keys] | <code>Array.&lt;string&gt;</code> |  | Keys to query |

<a name="DocumentCollection+fetchDocumentsWithMango"></a>

### documentCollection.fetchDocumentsWithMango(path, selector, options)
Fetch Documents with Mango

**Kind**: instance method of [<code>DocumentCollection</code>](#DocumentCollection)  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | path to fetch |
| selector | [<code>MangoSelector</code>](#MangoSelector) | selector |
| options | [<code>MangoQueryOptions</code>](#MangoQueryOptions) | request options |

<a name="DocumentCollection+findWithMango"></a>

### documentCollection.findWithMango(path, selector, options) ⇒ <code>Promise.&lt;object&gt;</code>
Find documents with the mango selector and create index
if missing.

We adopt an optimistic approach for index creation:
we run the query first, and only if an index missing
error is returned, the index is created and
the query run again.

**Kind**: instance method of [<code>DocumentCollection</code>](#DocumentCollection)  
**Returns**: <code>Promise.&lt;object&gt;</code> - - The find response  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | The route path |
| selector | [<code>MangoSelector</code>](#MangoSelector) | The mango selector |
| options | [<code>MangoQueryOptions</code>](#MangoQueryOptions) | The find options |

<a name="DocumentCollection+find"></a>

### documentCollection.find(selector, options) ⇒ <code>Promise.&lt;{data, skip, bookmark, next, execution\_stats}&gt;</code>
Returns a filtered list of documents using a Mango selector.
   
The returned documents are paginated by the stack.

**Kind**: instance method of [<code>DocumentCollection</code>](#DocumentCollection)  
**Returns**: <code>Promise.&lt;{data, skip, bookmark, next, execution\_stats}&gt;</code> - The JSON API conformant response.  
**Throws**:

- <code>FetchError</code> 


| Param | Type | Description |
| --- | --- | --- |
| selector | [<code>MangoSelector</code>](#MangoSelector) | The Mango selector. |
| options | [<code>MangoQueryOptions</code>](#MangoQueryOptions) | MangoQueryOptions |

<a name="DocumentCollection+findAll"></a>

### documentCollection.findAll(selector, options) ⇒ <code>Promise.&lt;Array.&lt;{data}&gt;&gt;</code>
Returns a filtered list with all documents using a Mango selector,
automatically fetching more documents if the total of documents is
superior to the pagination limit.
Can result in a lot of network requests.

   The returned documents are paginated by the stack.

**Kind**: instance method of [<code>DocumentCollection</code>](#DocumentCollection)  
**Returns**: <code>Promise.&lt;Array.&lt;{data}&gt;&gt;</code> - Documents fetched  
**Throws**:

- <code>FetchError</code> 


| Param | Type | Description |
| --- | --- | --- |
| selector | [<code>MangoSelector</code>](#MangoSelector) | The Mango selector. |
| options | [<code>MangoQueryOptions</code>](#MangoQueryOptions) | MangoQueryOptions |

<a name="DocumentCollection+get"></a>

### documentCollection.get(id) ⇒ <code>Promise.&lt;object&gt;</code>
Get a document by id

**Kind**: instance method of [<code>DocumentCollection</code>](#DocumentCollection)  
**Returns**: <code>Promise.&lt;object&gt;</code> - JsonAPI response containing normalized document as data attribute  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | The document id. |

<a name="DocumentCollection+getAll"></a>

### documentCollection.getAll()
Get many documents by id

**Kind**: instance method of [<code>DocumentCollection</code>](#DocumentCollection)  
<a name="DocumentCollection+create"></a>

### documentCollection.create(doc)
Creates a document

**Kind**: instance method of [<code>DocumentCollection</code>](#DocumentCollection)  

| Param | Type | Description |
| --- | --- | --- |
| doc | <code>object</code> | Document to create. Optional: you can force the id with the _id attribute |

<a name="DocumentCollection+update"></a>

### documentCollection.update(document)
Updates a document

**Kind**: instance method of [<code>DocumentCollection</code>](#DocumentCollection)  

| Param | Type | Description |
| --- | --- | --- |
| document | <code>object</code> | Document to update. Do not forget the _id attribute |

<a name="DocumentCollection+destroy"></a>

### documentCollection.destroy(doc)
Destroys a document

**Kind**: instance method of [<code>DocumentCollection</code>](#DocumentCollection)  

| Param | Type | Description |
| --- | --- | --- |
| doc | <code>object</code> | Document to destroy. Do not forget _id and _rev attributes |

<a name="DocumentCollection+updateAll"></a>

### documentCollection.updateAll(rawDocs)
Updates several documents in one batch

**Kind**: instance method of [<code>DocumentCollection</code>](#DocumentCollection)  

| Param | Type | Description |
| --- | --- | --- |
| rawDocs | <code>Array.&lt;Document&gt;</code> | Documents to be updated |

<a name="DocumentCollection+destroyAll"></a>

### documentCollection.destroyAll(docs)
Deletes several documents in one batch

**Kind**: instance method of [<code>DocumentCollection</code>](#DocumentCollection)  

| Param | Type | Description |
| --- | --- | --- |
| docs | <code>Array.&lt;Document&gt;</code> | Documents to delete |

<a name="DocumentCollection+toMangoOptions"></a>

### documentCollection.toMangoOptions(selector, options) ⇒ [<code>MangoQueryOptions</code>](#MangoQueryOptions)
Returns Mango Options from Selector and Options

**Kind**: instance method of [<code>DocumentCollection</code>](#DocumentCollection)  
**Returns**: [<code>MangoQueryOptions</code>](#MangoQueryOptions) - Mango options  

| Param | Type | Description |
| --- | --- | --- |
| selector | [<code>MangoSelector</code>](#MangoSelector) | Mango selector |
| options | [<code>MangoQueryOptions</code>](#MangoQueryOptions) | Mango Options |

<a name="DocumentCollection+createIndex"></a>

### documentCollection.createIndex(fields, indexOption) ⇒ <code>Promise.&lt;{id, fields}&gt;</code>
**Kind**: instance method of [<code>DocumentCollection</code>](#DocumentCollection)  

| Param | Type | Description |
| --- | --- | --- |
| fields | <code>Array</code> | Fields to index |
| indexOption | <code>object</code> | Options for the index |
| [indexOption.partialFilter] | [<code>MangoPartialFilter</code>](#MangoPartialFilter) | partialFilter |
| [indexOption.indexName] | <code>string</code> | indexName |

<a name="DocumentCollection+fetchAllMangoIndexes"></a>

### documentCollection.fetchAllMangoIndexes() ⇒ <code>Promise.&lt;Array.&lt;DesignDoc&gt;&gt;</code>
Retrieve all design docs of mango indexes

**Kind**: instance method of [<code>DocumentCollection</code>](#DocumentCollection)  
**Returns**: <code>Promise.&lt;Array.&lt;DesignDoc&gt;&gt;</code> - The design docs  
<a name="DocumentCollection+destroyIndex"></a>

### documentCollection.destroyIndex(index) ⇒ <code>Promise.&lt;object&gt;</code>
Delete the specified design doc

**Kind**: instance method of [<code>DocumentCollection</code>](#DocumentCollection)  
**Returns**: <code>Promise.&lt;object&gt;</code> - The delete response  

| Param | Type | Description |
| --- | --- | --- |
| index | [<code>DesignDoc</code>](#DesignDoc) | The design doc to remove |

<a name="DocumentCollection+copyIndex"></a>

### documentCollection.copyIndex(existingIndex, newIndexName) ⇒ [<code>Promise.&lt;DesignDoc&gt;</code>](#DesignDoc)
Copy an existing design doc.

This is useful to create a new design doc without
having to recompute the existing index.

**Kind**: instance method of [<code>DocumentCollection</code>](#DocumentCollection)  
**Returns**: [<code>Promise.&lt;DesignDoc&gt;</code>](#DesignDoc) - The copy response  

| Param | Type | Description |
| --- | --- | --- |
| existingIndex | [<code>DesignDoc</code>](#DesignDoc) | The design doc to copy |
| newIndexName | <code>string</code> | The name of the copy |

<a name="DocumentCollection+fetchChangesRaw"></a>

### documentCollection.fetchChangesRaw(couchOptions)
Calls _changes route from CouchDB
No further treatment is done contrary to fetchchanges

**Kind**: instance method of [<code>DocumentCollection</code>](#DocumentCollection)  
**See**: https://docs.couchdb.org/en/stable/api/database/changes.html  

| Param | Type | Description |
| --- | --- | --- |
| couchOptions | <code>object</code> | Couch options for changes https://kutt.it/5r7MNQ |
| [couchOptions.since] | <code>string</code> | Bookmark telling CouchDB from which point in time should changes be returned |
| [couchOptions.doc_ids] | <code>Array.&lt;string&gt;</code> | Only return changes for a subset of documents |
| [couchOptions.includeDocs] | <code>boolean</code> | Includes full documents as part of results |
| [couchOptions.filter] | <code>string</code> | Filter |

<a name="DocumentCollection.normalizeDoctype"></a>

### DocumentCollection.normalizeDoctype(doctype) ⇒ <code>function</code>
Provides a callback for `Collection.get`

**Kind**: static method of [<code>DocumentCollection</code>](#DocumentCollection)  
**Returns**: <code>function</code> - (data, response) => normalizedDocument
                                       using `normalizeDoc`  

| Param | Type | Description |
| --- | --- | --- |
| doctype | <code>string</code> | Document doctype |

<a name="FileCollection"></a>

## FileCollection
Implements `DocumentCollection` API along with specific methods for
`io.cozy.files`.

Files are a special type of documents and are handled differently by the stack:
special routes are to be used, and there is a notion of referenced files, aka
files associated to a specific document

**Kind**: global class  

* [FileCollection](#FileCollection)
    * [new FileCollection(doctype, stackClient, [options])](#new_FileCollection_new)
    * [.forceFileDownload](#FileCollection+forceFileDownload)
    * [.get(id)](#FileCollection+get) ⇒ <code>Object</code>
    * [.getAll(ids)](#FileCollection+getAll) ⇒ <code>Promise.&lt;{data, meta, execution\_stats}&gt;</code>
    * [.find(selector, options)](#FileCollection+find) ⇒ <code>Promise.&lt;{data, meta, skip, next, bookmark, execution\_stats}&gt;</code>
    * [.findReferencedBy(document, options)](#FileCollection+findReferencedBy) ⇒ <code>Promise.&lt;{data, included, meta, skip, next}&gt;</code>
    * [.addReferencedBy(document, documents)](#FileCollection+addReferencedBy) ⇒ <code>Promise.&lt;{data, meta}&gt;</code>
    * [.removeReferencedBy(document, documents)](#FileCollection+removeReferencedBy) ⇒ <code>Promise.&lt;{data, meta}&gt;</code>
    * [.addReferencesTo(document, documents)](#FileCollection+addReferencesTo)
    * [.removeReferencesTo(document, documents)](#FileCollection+removeReferencesTo)
    * [.destroy(file, [options])](#FileCollection+destroy) ⇒ <code>Promise.&lt;{data}&gt;</code>
    * [.emptyTrash()](#FileCollection+emptyTrash) ⇒ <code>Promise.&lt;{data}&gt;</code>
    * [.restore(id)](#FileCollection+restore) ⇒ <code>Promise.&lt;{data}&gt;</code>
    * [.copy(id, [name], [dirId], [options])](#FileCollection+copy) ⇒ <code>Promise.&lt;object&gt;</code>
    * [.deleteFilePermanently(id, [options])](#FileCollection+deleteFilePermanently) ⇒ <code>Promise.&lt;{data}&gt;</code>
    * [.upload(data, dirPath, [options])](#FileCollection+upload) ⇒ <code>Promise.&lt;object&gt;</code>
    * [.create(attributes, [options])](#FileCollection+create)
    * [.updateFile(data, params, options)](#FileCollection+updateFile) ⇒ [<code>Promise.&lt;FileAttributes&gt;</code>](#FileAttributes)
    * [.download(file, versionId, filename)](#FileCollection+download)
    * [.fetchFileContentById(id)](#FileCollection+fetchFileContentById)
    * [.getBeautifulSize(file, decimal)](#FileCollection+getBeautifulSize)
    * [.downloadArchive(fileIds, [notSecureFilename], [options])](#FileCollection+downloadArchive)
    * ~~[.getArchiveLinkByIds()](#FileCollection+getArchiveLinkByIds)~~
    * [.createArchiveLinkByIds(params)](#FileCollection+createArchiveLinkByIds) ⇒ <code>Promise.&lt;string&gt;</code>
    * [.isChildOf(child, parent)](#FileCollection+isChildOf) ⇒ <code>boolean</code>
    * [.statById(id, options)](#FileCollection+statById) ⇒ <code>object</code>
    * [.createDirectoryByPath(path, [options])](#FileCollection+createDirectoryByPath) ⇒ <code>object</code>
    * [.createFileMetadata(attributes)](#FileCollection+createFileMetadata) ⇒ <code>Promise.&lt;object&gt;</code>
    * [.updateMetadataAttribute(id, metadata)](#FileCollection+updateMetadataAttribute) ⇒ <code>Promise.&lt;object&gt;</code>
    * [.getFileTypeFromName(name)](#FileCollection+getFileTypeFromName) ⇒ <code>string</code>
    * [.doUpload(dataArg, path, options, [method])](#FileCollection+doUpload)
    * [.findNotSynchronizedDirectories(oauthClient, options)](#FileCollection+findNotSynchronizedDirectories) ⇒ <code>Array.&lt;(object\|IOCozyFolder)&gt;</code>
    * [.addNotSynchronizedDirectories(oauthClient, directories)](#FileCollection+addNotSynchronizedDirectories)
    * [.removeNotSynchronizedDirectories(oauthClient, directories)](#FileCollection+removeNotSynchronizedDirectories)
    * [.getOrCreateSharedDrivesDirectory()](#FileCollection+getOrCreateSharedDrivesDirectory) ⇒ [<code>IOCozyFolder</code>](#IOCozyFolder)
    * [.moveRelateToSharedDrive(source, dest, isCopy)](#FileCollection+moveRelateToSharedDrive) ⇒ <code>Promise.&lt;{data: (undefined\|object)}&gt;</code>

<a name="new_FileCollection_new"></a>

### new FileCollection(doctype, stackClient, [options])

| Param | Type | Description |
| --- | --- | --- |
| doctype | <code>string</code> | Doctype of the collection (should be `io.cozy.files`) |
| stackClient | [<code>CozyStackClient</code>](#CozyStackClient) | The client used to make requests to the server |
| [options] | [<code>FileCollectionOptions</code>](#FileCollectionOptions) | The collection options |

<a name="FileCollection+forceFileDownload"></a>

### fileCollection.forceFileDownload
Force a file download from the given href

**Kind**: instance property of [<code>FileCollection</code>](#FileCollection)  

| Param | Type | Description |
| --- | --- | --- |
| href | <code>string</code> | The link to download |
| filename | <code>string</code> | The file name to download |

<a name="FileCollection+get"></a>

### fileCollection.get(id) ⇒ <code>Object</code>
Fetches the file's data

**Kind**: instance method of [<code>FileCollection</code>](#FileCollection)  
**Returns**: <code>Object</code> - Information about the file or folder and it's descendents  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | File id |

<a name="FileCollection+getAll"></a>

### fileCollection.getAll(ids) ⇒ <code>Promise.&lt;{data, meta, execution\_stats}&gt;</code>
Get all files by their ids

**Kind**: instance method of [<code>FileCollection</code>](#FileCollection)  
**Returns**: <code>Promise.&lt;{data, meta, execution\_stats}&gt;</code> - JSON API response  

| Param | Type | Description |
| --- | --- | --- |
| ids | <code>Array.&lt;string&gt;</code> | files ids |

<a name="FileCollection+find"></a>

### fileCollection.find(selector, options) ⇒ <code>Promise.&lt;{data, meta, skip, next, bookmark, execution\_stats}&gt;</code>
Returns a filtered list of documents using a Mango selector.

The returned documents are paginated by the stack.

**Kind**: instance method of [<code>FileCollection</code>](#FileCollection)  
**Returns**: <code>Promise.&lt;{data, meta, skip, next, bookmark, execution\_stats}&gt;</code> - The JSON API conformant response.  
**Throws**:

- <code>FetchError</code> 


| Param | Type | Description |
| --- | --- | --- |
| selector | <code>object</code> | The Mango selector. |
| options | [<code>MangoQueryOptions</code>](#MangoQueryOptions) | The query options |

<a name="FileCollection+findReferencedBy"></a>

### fileCollection.findReferencedBy(document, options) ⇒ <code>Promise.&lt;{data, included, meta, skip, next}&gt;</code>
async findReferencedBy - Returns the list of files referenced by a document — see https://docs.cozy.io/en/cozy-stack/references-docs-in-vfs/

**Kind**: instance method of [<code>FileCollection</code>](#FileCollection)  
**Returns**: <code>Promise.&lt;{data, included, meta, skip, next}&gt;</code> - The JSON API conformant response.  

| Param | Type | Description |
| --- | --- | --- |
| document | <code>object</code> | A JSON representing a document, with at least a `_type` and `_id` field. |
| options | <code>object</code> | Additional options |
| [options.skip] | <code>number</code> \| <code>null</code> | For skip-based pagination, the number of referenced files to skip. |
| [options.limit] | <code>number</code> \| <code>null</code> | For pagination, the number of results to return. |
| [options.cursor] | [<code>CouchDBViewCursor</code>](#CouchDBViewCursor) \| <code>null</code> | For cursor-based pagination, the index cursor. |

<a name="FileCollection+addReferencedBy"></a>

### fileCollection.addReferencedBy(document, documents) ⇒ <code>Promise.&lt;{data, meta}&gt;</code>
Add referenced_by documents to a file — see https://docs.cozy.io/en/cozy-stack/references-docs-in-vfs/#post-filesfile-idrelationshipsreferenced_by

 For example, to have an album referenced by a file:
```
addReferencedBy({_id: 123, _type: "io.cozy.files", name: "cozy.jpg"}, [{_id: 456, _type: "io.cozy.photos.albums", name: "Happy Cloud"}])
```

**Kind**: instance method of [<code>FileCollection</code>](#FileCollection)  
**Returns**: <code>Promise.&lt;{data, meta}&gt;</code> - The JSON API conformant response.  

| Param | Type | Description |
| --- | --- | --- |
| document | [<code>FileDocument</code>](#FileDocument) | A JSON representing the file |
| documents | <code>Array</code> | An array of JSON documents having a `_type` and `_id` field. |

<a name="FileCollection+removeReferencedBy"></a>

### fileCollection.removeReferencedBy(document, documents) ⇒ <code>Promise.&lt;{data, meta}&gt;</code>
Remove referenced_by documents from a file — see https://docs.cozy.io/en/cozy-stack/references-docs-in-vfs/#delete-filesfile-idrelationshipsreferenced_by

 For example, to remove an album reference from a file:
```
 removeReferencedBy({_id: 123, _type: "io.cozy.files", name: "cozy.jpg"}, [{_id: 456, _type: "io.cozy.photos.albums", name: "Happy Cloud"}])
```

**Kind**: instance method of [<code>FileCollection</code>](#FileCollection)  
**Returns**: <code>Promise.&lt;{data, meta}&gt;</code> - The JSON API conformant response.  

| Param | Type | Description |
| --- | --- | --- |
| document | <code>object</code> | A JSON representing the file |
| documents | <code>Array</code> | An array of JSON documents having a `_type` and `_id` field. |

<a name="FileCollection+addReferencesTo"></a>

### fileCollection.addReferencesTo(document, documents)
Add files references to a document — see https://docs.cozy.io/en/cozy-stack/references-docs-in-vfs/#post-datatypedoc-idrelationshipsreferences

 For example, to add a photo to an album:
```
 addReferencesTo({_id: 456, _type: "io.cozy.photos.albums", name: "Happy Cloud"}, [{_id: 123, _type: "io.cozy.files", name: "cozy.jpg"}])
```

**Kind**: instance method of [<code>FileCollection</code>](#FileCollection)  

| Param | Type | Description |
| --- | --- | --- |
| document | <code>object</code> | A JSON representing a document, with at least a `_type` and `_id` field. |
| documents | <code>Array</code> | An array of JSON files having an `_id` field. Returns 204 No Content |

<a name="FileCollection+removeReferencesTo"></a>

### fileCollection.removeReferencesTo(document, documents)
Remove files references to a document — see https://docs.cozy.io/en/cozy-stack/references-docs-in-vfs/#delete-datatypedoc-idrelationshipsreferences

 For example, to remove a photo from an album:
```
 removeReferencesTo({_id: 456, _type: "io.cozy.photos.albums", name: "Happy Cloud"}, [{_id: 123, _type: "io.cozy.files", name: "cozy.jpg"}])
```

**Kind**: instance method of [<code>FileCollection</code>](#FileCollection)  

| Param | Type | Description |
| --- | --- | --- |
| document | <code>object</code> | A JSON representing a document, with at least a `_type` and `_id` field. |
| documents | <code>Array</code> | An array of JSON files having an `_id` field. Returns 204 No Content |

<a name="FileCollection+destroy"></a>

### fileCollection.destroy(file, [options]) ⇒ <code>Promise.&lt;{data}&gt;</code>
Sends file to trash and removes references to it

**Kind**: instance method of [<code>FileCollection</code>](#FileCollection)  
**Returns**: <code>Promise.&lt;{data}&gt;</code> - The JSON API conformant response.  

| Param | Type | Description |
| --- | --- | --- |
| file | [<code>FileDocument</code>](#FileDocument) | File that will be sent to trash |
| [options] | <code>object</code> | Optionnal request options |

<a name="FileCollection+emptyTrash"></a>

### fileCollection.emptyTrash() ⇒ <code>Promise.&lt;{data}&gt;</code>
Empty the Trash

**Kind**: instance method of [<code>FileCollection</code>](#FileCollection)  
**Returns**: <code>Promise.&lt;{data}&gt;</code> - The JSON API conformant response.  
**Throws**:

- <code>FetchError</code> 

<a name="FileCollection+restore"></a>

### fileCollection.restore(id) ⇒ <code>Promise.&lt;{data}&gt;</code>
Restores a trashed file.

**Kind**: instance method of [<code>FileCollection</code>](#FileCollection)  
**Returns**: <code>Promise.&lt;{data}&gt;</code> - The JSON API conformant response.  
**Throws**:

- <code>FetchError</code> 


| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | The file's id |

<a name="FileCollection+copy"></a>

### fileCollection.copy(id, [name], [dirId], [options]) ⇒ <code>Promise.&lt;object&gt;</code>
Copy a file.

**Kind**: instance method of [<code>FileCollection</code>](#FileCollection)  
**Returns**: <code>Promise.&lt;object&gt;</code> - - A promise that returns the copied file if resolved.  
**Throws**:

- <code>FetchError</code> 


| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | The file's id |
| [name] | <code>string</code> | The file copy name |
| [dirId] | <code>string</code> | The destination directory id |
| [options] | <code>object</code> | Optionnal request options |

<a name="FileCollection+deleteFilePermanently"></a>

### fileCollection.deleteFilePermanently(id, [options]) ⇒ <code>Promise.&lt;{data}&gt;</code>
async deleteFilePermanently - Definitely delete a file

**Kind**: instance method of [<code>FileCollection</code>](#FileCollection)  
**Returns**: <code>Promise.&lt;{data}&gt;</code> - The JSON API conformant response.  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | The id of the file to delete |
| [options] | <code>object</code> | Optionnal request options |

<a name="FileCollection+upload"></a>

### fileCollection.upload(data, dirPath, [options]) ⇒ <code>Promise.&lt;object&gt;</code>
**Kind**: instance method of [<code>FileCollection</code>](#FileCollection)  
**Returns**: <code>Promise.&lt;object&gt;</code> - Created io.cozy.files  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>File</code> \| <code>Blob</code> \| [<code>Stream</code>](#Stream) \| <code>string</code> \| <code>ArrayBuffer</code> | file to be uploaded |
| dirPath | <code>string</code> | Path to upload the file to. ie : /Administative/XXX/ |
| [options] | <code>object</code> | Optionnal request options |

<a name="FileCollection+create"></a>

### fileCollection.create(attributes, [options])
Creates directory or file.
- Used by StackLink to support CozyClient.create('io.cozy.files', options)

**Kind**: instance method of [<code>FileCollection</code>](#FileCollection)  
**Throws**:

- <code>Error</code> - explaining reason why creation failed


| Param | Type | Description |
| --- | --- | --- |
| attributes | [<code>FileAttributes</code>](#FileAttributes) \| [<code>DirectoryAttributes</code>](#DirectoryAttributes) | Attributes of the created file/directory |
| attributes.data | <code>File</code> \| <code>Blob</code> \| <code>string</code> \| <code>ArrayBuffer</code> | Will be used as content of the created file |
| [options] | <code>object</code> | Optionnal request options |

<a name="FileCollection+updateFile"></a>

### fileCollection.updateFile(data, params, options) ⇒ [<code>Promise.&lt;FileAttributes&gt;</code>](#FileAttributes)
updateFile - Updates a file's data

**Kind**: instance method of [<code>FileCollection</code>](#FileCollection)  
**Returns**: [<code>Promise.&lt;FileAttributes&gt;</code>](#FileAttributes) - Updated document  
**Throws**:

- <code>Error</code> - explaining reason why update failed


| Param | Type | Description |
| --- | --- | --- |
| data | <code>File</code> \| <code>Blob</code> \| [<code>Stream</code>](#Stream) \| <code>string</code> \| <code>ArrayBuffer</code> | file to be uploaded |
| params | [<code>FileAttributes</code>](#FileAttributes) | File attributes to update and doUpload options (additional headers) |
| options | <code>object</code> | Request Options |

<a name="FileCollection+download"></a>

### fileCollection.download(file, versionId, filename)
Download a file or a specific version of the file

**Kind**: instance method of [<code>FileCollection</code>](#FileCollection)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| file | <code>object</code> |  | io.cozy.files object |
| versionId | <code>string</code> | <code>null</code> | Id of the io.cozy.files.version |
| filename | <code>string</code> |  | The name you want for the downloaded file                            (by default the same as the file) |

<a name="FileCollection+fetchFileContentById"></a>

### fileCollection.fetchFileContentById(id)
Fetch the binary of a file or a specific version of a file
Useful for instance when you can't download the file directly
(via a content-disposition attachement header) and need to store
it before doing an operation.

**Kind**: instance method of [<code>FileCollection</code>](#FileCollection)  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | Id of the io.cozy.files or io.cozy.files.version |

<a name="FileCollection+getBeautifulSize"></a>

### fileCollection.getBeautifulSize(file, decimal)
Get a beautified size for a given file
1024B => 1KB
102404500404B => 95.37 GB

**Kind**: instance method of [<code>FileCollection</code>](#FileCollection)  

| Param | Type | Description |
| --- | --- | --- |
| file | <code>object</code> | io.cozy.files object |
| decimal | <code>number</code> | number of decimal |

<a name="FileCollection+downloadArchive"></a>

### fileCollection.downloadArchive(fileIds, [notSecureFilename], [options])
Download an archive of the files

**Kind**: instance method of [<code>FileCollection</code>](#FileCollection)  

| Param | Type | Description |
| --- | --- | --- |
| fileIds | <code>Array.&lt;string&gt;</code> | List of file ids |
| [notSecureFilename] | <code>string</code> | Name of the archive (default: 'files') |
| [options] | <code>object</code> | Additional options |
| [options.pages] | [<code>Array.&lt;ArchivePages&gt;</code>](#ArchivePages) | Array of objects, with `id` the file identifier, and `page` the page number (1 is the first page) |

<a name="FileCollection+getArchiveLinkByIds"></a>

### ~~fileCollection.getArchiveLinkByIds()~~
***Deprecated***

**Kind**: instance method of [<code>FileCollection</code>](#FileCollection)  
<a name="FileCollection+createArchiveLinkByIds"></a>

### fileCollection.createArchiveLinkByIds(params) ⇒ <code>Promise.&lt;string&gt;</code>
Create the archive link for a list of files
The generated archive is temporary and is not persisted

**Kind**: instance method of [<code>FileCollection</code>](#FileCollection)  
**Returns**: <code>Promise.&lt;string&gt;</code> - - The archive link  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>object</code> | Parameters |
| params.ids | <code>Array.&lt;string&gt;</code> | List of file ids |
| [params.name] | <code>string</code> | Name of the archive (default: 'files') |
| [params.pages] | [<code>Array.&lt;ArchivePages&gt;</code>](#ArchivePages) | Array of objects, with `id` the file identifier, and `page` the page number (1 is the first page) |

<a name="FileCollection+isChildOf"></a>

### fileCollection.isChildOf(child, parent) ⇒ <code>boolean</code>
Checks if the file belongs to the parent's hierarchy.

**Kind**: instance method of [<code>FileCollection</code>](#FileCollection)  
**Returns**: <code>boolean</code> - Whether the file is a parent's child  

| Param | Type | Description |
| --- | --- | --- |
| child | <code>string</code> \| <code>object</code> | The file which can either be an id or an object |
| parent | <code>string</code> \| <code>object</code> | The parent target which can either be an id or an object |

<a name="FileCollection+statById"></a>

### fileCollection.statById(id, options) ⇒ <code>object</code>
statById - Fetches the metadata about a document. For folders, the results include the list of child files and folders.

**Kind**: instance method of [<code>FileCollection</code>](#FileCollection)  
**Returns**: <code>object</code> - A promise resolving to an object containing "data" (the document metadata), "included" (the child documents) and "links" (pagination informations)  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | ID of the document |
| options | <code>object</code> \| <code>null</code> | Pagination options |
| [options.page[limit]] | <code>number</code> \| <code>null</code> | For pagination, the number of results to return. |
| [options.page[skip]] | <code>number</code> \| <code>null</code> | For skip-based pagination, the number of referenced files to skip. |
| [options.page[cursor]] | [<code>CouchDBViewCursor</code>](#CouchDBViewCursor) \| <code>null</code> | For cursor-based pagination, the index cursor. |

<a name="FileCollection+createDirectoryByPath"></a>

### fileCollection.createDirectoryByPath(path, [options]) ⇒ <code>object</code>
async createDirectoryByPath - Creates one or more folders until the given path exists

**Kind**: instance method of [<code>FileCollection</code>](#FileCollection)  
**Returns**: <code>object</code> - The document corresponding to the last segment of the path  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | Path of the created directory |
| [options] | <code>object</code> | Optionnal request options |

<a name="FileCollection+createFileMetadata"></a>

### fileCollection.createFileMetadata(attributes) ⇒ <code>Promise.&lt;object&gt;</code>
Send a metadata object that can be associated to a file uploaded after that,
via the MetadataID query parameter.
See https://github.com/cozy/cozy-stack/blob/master/docs/files.md#post-filesuploadmetadata

**Kind**: instance method of [<code>FileCollection</code>](#FileCollection)  
**Returns**: <code>Promise.&lt;object&gt;</code> - The Metadata object  

| Param | Type | Description |
| --- | --- | --- |
| attributes | <code>object</code> | The file's metadata |

<a name="FileCollection+updateMetadataAttribute"></a>

### fileCollection.updateMetadataAttribute(id, metadata) ⇒ <code>Promise.&lt;object&gt;</code>
Updates the metadata attribute of a io.cozy.files
Creates a new version of the file without having
to upload again the file's content

To see available content of the metadata attribute
see : https://docs.cozy.io/en/cozy-doctypes/docs/io.cozy.files_metadata/

**Kind**: instance method of [<code>FileCollection</code>](#FileCollection)  
**Returns**: <code>Promise.&lt;object&gt;</code> - io.cozy.files updated  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | File id |
| metadata | <code>object</code> | io.cozy.files.metadata attributes |

<a name="FileCollection+getFileTypeFromName"></a>

### fileCollection.getFileTypeFromName(name) ⇒ <code>string</code>
Get the file mime-type based on its name

**Kind**: instance method of [<code>FileCollection</code>](#FileCollection)  
**Returns**: <code>string</code> - the inferred file mime-type  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The file name |

<a name="FileCollection+doUpload"></a>

### fileCollection.doUpload(dataArg, path, options, [method])
This method should not be called directly to upload a file.
You should use `createFile`

**Kind**: instance method of [<code>FileCollection</code>](#FileCollection)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| dataArg | <code>File</code> \| <code>Blob</code> \| [<code>Stream</code>](#Stream) \| <code>string</code> \| <code>ArrayBuffer</code> |  | file to be uploaded |
| path | <code>string</code> |  | Uri to call the stack from. Something like `/files/${dirId}?Name=${name}&Type=file&Executable=${executable}&MetadataID=${metadataId}` |
| options | <code>object</code> |  | Additional headers |
| [method] | <code>string</code> | <code>&quot;POST&quot;</code> | POST / PUT / PATCH |

<a name="FileCollection+findNotSynchronizedDirectories"></a>

### fileCollection.findNotSynchronizedDirectories(oauthClient, options) ⇒ <code>Array.&lt;(object\|IOCozyFolder)&gt;</code>
async findNotSynchronizedDirectories - Returns the list of directories not synchronized on the given OAuth client (mainly Cozy Desktop clients) — see https://docs.cozy.io/en/cozy-stack/not-synchronized-vfs/#get-datatypedoc-idrelationshipsnot_synchronizing

**Kind**: instance method of [<code>FileCollection</code>](#FileCollection)  
**Returns**: <code>Array.&lt;(object\|IOCozyFolder)&gt;</code> - The JSON API conformant response.  

| Param | Type | Description |
| --- | --- | --- |
| oauthClient | [<code>OAuthClient</code>](#OAuthClient) | A JSON representing an OAuth client, with at least a `_type` and `_id` field. |
| options | <code>object</code> \| <code>null</code> | Pagination options |
| options.skip | <code>number</code> \| <code>null</code> | For skip-based pagination, the number of referenced files to skip. |
| options.limit | <code>number</code> \| <code>null</code> | For pagination, the number of results to return. |
| options.cursor | [<code>CouchDBViewCursor</code>](#CouchDBViewCursor) \| <code>null</code> | For cursor-based pagination, the index cursor. |
| options.includeFiles | <code>boolean</code> | Include the whole file documents in the results list |

<a name="FileCollection+addNotSynchronizedDirectories"></a>

### fileCollection.addNotSynchronizedDirectories(oauthClient, directories)
Add directory synchronization exclusions to an OAuth client — see https://docs.cozy.io/en/cozy-stack/not-synchronized-vfs/#post-datatypedoc-idrelationshipsnot_synchronizing

 For example, to exclude directory `/Photos` from `My Computer`'s desktop synchronization:
```
addNotSynchronizedDirectories({_id: 123, _type: "io.cozy.oauth.clients", clientName: "Cozy Drive (My Computer)", clientKind: "desktop"}, [{_id: 456, _type: "io.cozy.files", name: "Photos", path: "/Photos"}])
```

**Kind**: instance method of [<code>FileCollection</code>](#FileCollection)  

| Param | Type | Description |
| --- | --- | --- |
| oauthClient | [<code>OAuthClient</code>](#OAuthClient) | A JSON representing the OAuth client |
| directories | <code>Array</code> | An array of JSON documents having a `_type` and `_id` fields and representing directories. Returns 204 No Content |

<a name="FileCollection+removeNotSynchronizedDirectories"></a>

### fileCollection.removeNotSynchronizedDirectories(oauthClient, directories)
Remove directory synchronization exclusions from an OAuth client — see https://docs.cozy.io/en/cozy-stack/not-synchronized-vfs/#delete-datatypedoc-idrelationshipsnot_synchronizing

 For example, to re-include directory `/Photos` into `My Computer`'s desktop synchronization:
```
 removeNotSynchronizedDirectories({_id: 123, _type: "io.cozy.oauth.clients", clientName: "Cozy Drive (My Computer)", clientKind: "desktop"}, [{_id: 456, _type: "io.cozy.files", name: "Photos", path: "/Photos"}])
```

**Kind**: instance method of [<code>FileCollection</code>](#FileCollection)  

| Param | Type | Description |
| --- | --- | --- |
| oauthClient | [<code>OAuthClient</code>](#OAuthClient) | A JSON representing the OAuth client |
| directories | <code>Array</code> | An array of JSON documents having a `_type` and `_id` field and representing directories. Returns 204 No Content |

<a name="FileCollection+getOrCreateSharedDrivesDirectory"></a>

### fileCollection.getOrCreateSharedDrivesDirectory() ⇒ [<code>IOCozyFolder</code>](#IOCozyFolder)
Get or create the Shared Drives directory it if it does not exist.

The Shared Drives directory is a special directory :
- its _id is io.cozy.files.shared-drives-dir
- it can contains Nextcloud shortcuts
- it can contains shared drives

**Kind**: instance method of [<code>FileCollection</code>](#FileCollection)  
**Returns**: [<code>IOCozyFolder</code>](#IOCozyFolder) - Shared Drives directory  
<a name="FileCollection+moveRelateToSharedDrive"></a>

### fileCollection.moveRelateToSharedDrive(source, dest, isCopy) ⇒ <code>Promise.&lt;{data: (undefined\|object)}&gt;</code>
Move or copy a file or a directory between locations (personal drive and/or shared drives).
Manage 3 cases :
- From a shared drive to another shared drive (same stack or cross-stack)
- From a shared drive to a personal drive
- From a personal drive to a shared drive

**Kind**: instance method of [<code>FileCollection</code>](#FileCollection)  
**Returns**: <code>Promise.&lt;{data: (undefined\|object)}&gt;</code> - - A promise that returns the move/copy action response (if any)  

| Param | Type | Description |
| --- | --- | --- |
| source | <code>object</code> | The source file/folder to move/copy (required) At least one side (source or destination) must be a shared drive. |
| [source.instance] | <code>string</code> | omit for personal drive If `source.instance` is provided, `source.sharing_id` is required. |
| [source.sharing_id] | <code>string</code> | required when instance is set |
| [source.file_id] | <code>string</code> | file needs to move |
| [source.dir_id] | <code>string</code> | folder needs to move Exactly one of `source.file_id` or `source.dir_id` must be provided. |
| dest | <code>object</code> | The destination folder (required) |
| [dest.instance] | <code>string</code> | omit for personal drive If `dest.instance` is provided, `dest.sharing_id` is required. |
| [dest.sharing_id] | <code>string</code> | required when instance is set |
| dest.dir_id | <code>string</code> | destination directory id (required) |
| isCopy | <code>boolean</code> | controls whether the operation is a move (default) or copy. When `copy: false` (default): The source file/directory is moved to the destination and deleted from the source. When `copy: true`: The source file/directory is copied to the destination but remains in the source location. |

<a name="NotesCollection"></a>

## NotesCollection
Implements `DocumentCollection` API to interact with the /notes endpoint of the stack

**Kind**: global class  

* [NotesCollection](#NotesCollection)
    * [new NotesCollection(stackClient, [options])](#new_NotesCollection_new)
    * [.get(id)](#NotesCollection+get) ⇒ <code>Object</code>
    * [.all()](#NotesCollection+all) ⇒ <code>Object</code>
    * [.destroy(note)](#NotesCollection+destroy) ⇒ <code>Object</code>
    * [.create(options)](#NotesCollection+create) ⇒ <code>Object</code>
    * [.fetchURL(note)](#NotesCollection+fetchURL) ⇒ <code>Object</code>
    * [.getDefaultSchema()](#NotesCollection+getDefaultSchema) ⇒ <code>object</code>

<a name="new_NotesCollection_new"></a>

### new NotesCollection(stackClient, [options])

| Param | Type | Description |
| --- | --- | --- |
| stackClient | [<code>CozyStackClient</code>](#CozyStackClient) | The client used to make requests to the server |
| [options] | [<code>NotesCollectionOptions</code>](#NotesCollectionOptions) | The collection options |

<a name="NotesCollection+get"></a>

### notesCollection.get(id) ⇒ <code>Object</code>
Fetches the note data

**Kind**: instance method of [<code>NotesCollection</code>](#NotesCollection)  
**Returns**: <code>Object</code> - Information about the note  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | Note id |

<a name="NotesCollection+all"></a>

### notesCollection.all() ⇒ <code>Object</code>
Fetches all notes

**Kind**: instance method of [<code>NotesCollection</code>](#NotesCollection)  
**Returns**: <code>Object</code> - The JSON API conformant response.  
<a name="NotesCollection+destroy"></a>

### notesCollection.destroy(note) ⇒ <code>Object</code>
Destroys the note on the server

**Kind**: instance method of [<code>NotesCollection</code>](#NotesCollection)  
**Returns**: <code>Object</code> - The deleted note  

| Param | Type | Description |
| --- | --- | --- |
| note | <code>object</code> | The io.cozy.notes document to destroy |
| [note._id] | <code>string</code> | The note's id |

<a name="NotesCollection+create"></a>

### notesCollection.create(options) ⇒ <code>Object</code>
Create a note

**Kind**: instance method of [<code>NotesCollection</code>](#NotesCollection)  
**Returns**: <code>Object</code> - The JSON API conformant response.  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | Options |
| [options.dir_id] | <code>string</code> | dir_id where to create the note |

<a name="NotesCollection+fetchURL"></a>

### notesCollection.fetchURL(note) ⇒ <code>Object</code>
Returns the details to build the note's url

**Kind**: instance method of [<code>NotesCollection</code>](#NotesCollection)  
**Returns**: <code>Object</code> - The note's url details  
**See**: https://github.com/cozy/cozy-stack/blob/master/docs/notes.md#get-notesidopen  

| Param | Type | Description |
| --- | --- | --- |
| note | <code>object</code> | The io.cozy.notes document to open |
| [note._id] | <code>string</code> | The note's id |

<a name="NotesCollection+getDefaultSchema"></a>

### notesCollection.getDefaultSchema() ⇒ <code>object</code>
Returns promise mirror schema for a note

**Kind**: instance method of [<code>NotesCollection</code>](#NotesCollection)  
**Returns**: <code>object</code> - schema  
<a name="OAuthClient"></a>

## OAuthClient
Specialized `CozyStackClient` for mobile, implementing stack registration
through OAuth.

**Kind**: global class  

* [OAuthClient](#OAuthClient)
    * [.doRegistration()](#OAuthClient+doRegistration)
    * [.register()](#OAuthClient+register) ⇒ <code>Promise</code>
    * [.unregister()](#OAuthClient+unregister) ⇒ <code>Promise</code>
    * [.fetchInformation()](#OAuthClient+fetchInformation) ⇒ <code>Promise</code>
    * [.updateInformation(information, resetSecret)](#OAuthClient+updateInformation) ⇒ <code>Promise</code>
    * [.generateStateCode()](#OAuthClient+generateStateCode) ⇒ <code>string</code>
    * [.getAuthCodeURL(options)](#OAuthClient+getAuthCodeURL) ⇒ <code>string</code>
    * [.getAccessCodeFromURL(pageURL, stateCode)](#OAuthClient+getAccessCodeFromURL) ⇒ <code>string</code>
    * [.fetchAccessToken(accessCode, oauthOptionsArg, uri, codeVerifier)](#OAuthClient+fetchAccessToken) ⇒ <code>Promise</code>
    * [.fetchKonnectorToken(slug)](#OAuthClient+fetchKonnectorToken) ⇒ <code>Promise.&lt;string&gt;</code>
    * [.fetchSessionCode()](#OAuthClient+fetchSessionCode) ⇒ [<code>Promise.&lt;SessionCodeRes&gt;</code>](#SessionCodeRes)
    * [.fetchSessionCodeWithPassword()](#OAuthClient+fetchSessionCodeWithPassword) ⇒ [<code>Promise.&lt;SessionCodeRes&gt;</code>](#SessionCodeRes)
    * [.loginFlagship()](#OAuthClient+loginFlagship) ⇒ <code>Promise.&lt;(AccessTokenRes\|TwoFactorNeededRes\|SessionCodeRes)&gt;</code>
    * [.refreshToken()](#OAuthClient+refreshToken) ⇒ <code>Promise</code>
    * [.setToken(token)](#OAuthClient+setToken)
    * [.setOAuthOptions(options)](#OAuthClient+setOAuthOptions)
    * [.resetClient()](#OAuthClient+resetClient)
    * [.setPassphraseFlagship(params)](#OAuthClient+setPassphraseFlagship) ⇒ <code>object</code>
    * [.checkForRevocation()](#OAuthClient+checkForRevocation) ⇒ <code>Promise.&lt;boolean&gt;</code>

<a name="OAuthClient+doRegistration"></a>

### oAuthClient.doRegistration()
Performs the HTTP call to register the client to the server

**Kind**: instance method of [<code>OAuthClient</code>](#OAuthClient)  
<a name="OAuthClient+register"></a>

### oAuthClient.register() ⇒ <code>Promise</code>
Registers the currenly configured client with the OAuth server and
sets internal information from the server response

**Kind**: instance method of [<code>OAuthClient</code>](#OAuthClient)  
**Returns**: <code>Promise</code> - A promise that resolves with a complete list of client information, including client ID and client secret.  
**Throws**:

- <code>Error</code> When the client is already registered

<a name="OAuthClient+unregister"></a>

### oAuthClient.unregister() ⇒ <code>Promise</code>
Unregisters the currenly configured client with the OAuth server.

**Kind**: instance method of [<code>OAuthClient</code>](#OAuthClient)  
**Throws**:

- <code>NotRegisteredException</code> When the client doesn't have it's registration information

<a name="OAuthClient+fetchInformation"></a>

### oAuthClient.fetchInformation() ⇒ <code>Promise</code>
Fetches the complete set of client information from the server after it has been registered.

**Kind**: instance method of [<code>OAuthClient</code>](#OAuthClient)  
**Throws**:

- <code>NotRegisteredException</code> When the client doesn't have it's registration information

<a name="OAuthClient+updateInformation"></a>

### oAuthClient.updateInformation(information, resetSecret) ⇒ <code>Promise</code>
Overwrites the client own information. This method will update both the local information and the remote information on the OAuth server.

**Kind**: instance method of [<code>OAuthClient</code>](#OAuthClient)  
**Returns**: <code>Promise</code> - Resolves to a complete, updated list of client information  
**Throws**:

- <code>NotRegisteredException</code> When the client doesn't have it's registration information


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| information | <code>object</code> |  | Set of information to update. Note that some fields such as `clientID` can't be updated. |
| resetSecret | <code>boolean</code> | <code>false</code> | = false Optionnal, whether to reset the client secret or not |

<a name="OAuthClient+generateStateCode"></a>

### oAuthClient.generateStateCode() ⇒ <code>string</code>
Generates a random state code to be used during the OAuth process

**Kind**: instance method of [<code>OAuthClient</code>](#OAuthClient)  
<a name="OAuthClient+getAuthCodeURL"></a>

### oAuthClient.getAuthCodeURL(options) ⇒ <code>string</code>
Generates the URL that the user should be sent to in order to accept the app's permissions.

**Kind**: instance method of [<code>OAuthClient</code>](#OAuthClient)  
**Returns**: <code>string</code> - The URL  
**Throws**:

- <code>NotRegisteredException</code> When the client doesn't have it's registration information


| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | URL generation options |
| options.stateCode | <code>string</code> | A random code to be included in the URl for security. Can be generated with `client.generateStateCode()` |
| [options.scopes] | <code>Array</code> | An array of permission scopes for the token. |
| [options.sessionCode] | [<code>SessionCode</code>](#SessionCode) | A session code that can be used to create a session. |
| [options.codeChallenge] | <code>string</code> | A code challenge that can be used in a PKCE verification process. |

<a name="OAuthClient+getAccessCodeFromURL"></a>

### oAuthClient.getAccessCodeFromURL(pageURL, stateCode) ⇒ <code>string</code>
Retrieves the access code contained in the URL to which the user is redirected after accepting the app's permissions (the `redirectURI`).

**Kind**: instance method of [<code>OAuthClient</code>](#OAuthClient)  
**Returns**: <code>string</code> - The access code  
**Throws**:

- <code>Error</code> The URL should contain the same state code as the one generated with `client.getAuthCodeURL()`. If not, it will throw an error


| Param | Type | Description |
| --- | --- | --- |
| pageURL | <code>string</code> | The redirected page URL, containing the state code and the access code |
| stateCode | <code>string</code> | The state code that was contained in the original URL the user was sent to (see `client.getAuthCodeURL()`) |

<a name="OAuthClient+fetchAccessToken"></a>

### oAuthClient.fetchAccessToken(accessCode, oauthOptionsArg, uri, codeVerifier) ⇒ <code>Promise</code>
Exchanges an access code for an access token. This function does **not** update the client's token.

**Kind**: instance method of [<code>OAuthClient</code>](#OAuthClient)  
**Returns**: <code>Promise</code> - A promise that resolves with an AccessToken object.  
**Throws**:

- <code>NotRegisteredException</code> When the client doesn't have it's registration information


| Param | Type | Description |
| --- | --- | --- |
| accessCode | <code>string</code> | The access code contained in the redirection URL — see `client.getAccessCodeFromURL()` |
| oauthOptionsArg | <code>object</code> | — To use when OAuthClient is not yet registered (during login process) |
| uri | <code>string</code> | — To use when OAuthClient is not yet registered (during login process) |
| codeVerifier | <code>string</code> | — The PKCE code verifier (see https://docs.cozy.io/en/cozy-stack/auth/#pkce-extension) |

<a name="OAuthClient+fetchKonnectorToken"></a>

### oAuthClient.fetchKonnectorToken(slug) ⇒ <code>Promise.&lt;string&gt;</code>
Used by the flagship application in order to create a token for the konnector with the given slug.
This token can then be used by the client-side konnector to make requests to cozy-stack.
The flagship app will need to use its own access token to request the konnector token.

**Kind**: instance method of [<code>OAuthClient</code>](#OAuthClient)  
**Returns**: <code>Promise.&lt;string&gt;</code> - - A promise that resolves with a new token  

| Param | Type | Description |
| --- | --- | --- |
| slug | <code>string</code> | The slug of the konnector |

<a name="OAuthClient+fetchSessionCode"></a>

### oAuthClient.fetchSessionCode() ⇒ [<code>Promise.&lt;SessionCodeRes&gt;</code>](#SessionCodeRes)
Fetches a new session code. Only usable by the Flagship application

**Kind**: instance method of [<code>OAuthClient</code>](#OAuthClient)  
**Returns**: [<code>Promise.&lt;SessionCodeRes&gt;</code>](#SessionCodeRes) - A promise that resolves with a new session_code  
**Throws**:

- <code>NotRegisteredException</code> When the client isn't certified to be the Flagship application

<a name="OAuthClient+fetchSessionCodeWithPassword"></a>

### oAuthClient.fetchSessionCodeWithPassword() ⇒ [<code>Promise.&lt;SessionCodeRes&gt;</code>](#SessionCodeRes)
Fetches a new session code. Only usable by the Flagship application

**Kind**: instance method of [<code>OAuthClient</code>](#OAuthClient)  
**Returns**: [<code>Promise.&lt;SessionCodeRes&gt;</code>](#SessionCodeRes) - A promise that resolves with a new session_code  
**Throws**:

- <code>NotRegisteredException</code> When the client isn't certified to be the Flagship application

<a name="OAuthClient+loginFlagship"></a>

### oAuthClient.loginFlagship() ⇒ <code>Promise.&lt;(AccessTokenRes\|TwoFactorNeededRes\|SessionCodeRes)&gt;</code>
Get OAuth access and register tokens without having to make OAuth dance

This endpoint returns registration tokens only from a Flagship app,
otherwise it returns a session_code that should be used in an OAuth dance

More info: https://docs.cozy.io/en/cozy-stack/flagship/
More info: https://docs.cozy.io/en/cozy-stack/auth/#post-authloginflagship

**Kind**: instance method of [<code>OAuthClient</code>](#OAuthClient)  
**Returns**: <code>Promise.&lt;(AccessTokenRes\|TwoFactorNeededRes\|SessionCodeRes)&gt;</code> - A promise that resolves with an access token, a session_code or a 2FA code  
<a name="OAuthClient+refreshToken"></a>

### oAuthClient.refreshToken() ⇒ <code>Promise</code>
Retrieves a new access token by refreshing the currently used token.

**Kind**: instance method of [<code>OAuthClient</code>](#OAuthClient)  
**Returns**: <code>Promise</code> - A promise that resolves with a new AccessToken object  
**Throws**:

- <code>NotRegisteredException</code> When the client doesn't have it's registration information
- <code>Error</code> The client should already have an access token to use this function

<a name="OAuthClient+setToken"></a>

### oAuthClient.setToken(token)
Updates the client's stored token

**Kind**: instance method of [<code>OAuthClient</code>](#OAuthClient)  

| Param | Type | Description |
| --- | --- | --- |
| token | <code>string</code> | = null The new token to use — can be a string, a json object or an AccessToken instance. |

<a name="OAuthClient+setOAuthOptions"></a>

### oAuthClient.setOAuthOptions(options)
Updates the OAuth informations

**Kind**: instance method of [<code>OAuthClient</code>](#OAuthClient)  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | Map of OAuth options |

<a name="OAuthClient+resetClient"></a>

### oAuthClient.resetClient()
Reset the current OAuth client

**Kind**: instance method of [<code>OAuthClient</code>](#OAuthClient)  
<a name="OAuthClient+setPassphraseFlagship"></a>

### oAuthClient.setPassphraseFlagship(params) ⇒ <code>object</code>
This method should be used in flagship app onboarding process to finalize the
cozy creation by setting the user password into the cozy-stack

More info: https://docs.cozy.io/en/cozy-stack/settings/#post-settingspassphraseflagship

**Kind**: instance method of [<code>OAuthClient</code>](#OAuthClient)  
**Returns**: <code>object</code> - token - The OAauth token  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>object</code> | parameters needed to set passphrase |
| params.registerToken | <code>string</code> | registration token provided by the onboarding link |
| params.passwordHash | <code>string</code> | hash of the master password |
| params.hint | <code>string</code> | hint for the master password |
| params.key | <code>string</code> | key (crypted) used for the vault encryption |
| params.publicKey | <code>string</code> | public key used for sharing ciphers from the vault |
| params.privateKey | <code>string</code> | private key (crypted) used for sharing ciphers from the vault |
| params.iterations | <code>string</code> | number of KDF iterations applied when hashing the master password |

<a name="OAuthClient+checkForRevocation"></a>

### oAuthClient.checkForRevocation() ⇒ <code>Promise.&lt;boolean&gt;</code>
Check if the OAuth client's has been revoked.
If this is the case, call the onRevocationChange callback

**Kind**: instance method of [<code>OAuthClient</code>](#OAuthClient)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - A Promise that resolves to `false` if client is still valid, or `true` if it has been revoked.  
<a name="OAuthClientsCollection"></a>

## OAuthClientsCollection
Implements `DocumentCollection` API to interact with the /settings/clients endpoint of the stack

**Kind**: global class  

* [OAuthClientsCollection](#OAuthClientsCollection)
    * [.all(options)](#OAuthClientsCollection+all) ⇒ <code>object</code>
    * [.get(id)](#OAuthClientsCollection+get) ⇒ <code>object</code>
    * [.destroy(oauthClient)](#OAuthClientsCollection+destroy) ⇒ <code>Object</code>

<a name="OAuthClientsCollection+all"></a>

### oAuthClientsCollection.all(options) ⇒ <code>object</code>
Fetches all OAuth clients

**Kind**: instance method of [<code>OAuthClientsCollection</code>](#OAuthClientsCollection)  
**Returns**: <code>object</code> - The JSON API conformant response.  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | Query options |
| [options.limit] | <code>number</code> | For pagination, the number of results to return. |
| [options.bookmark] | <code>string</code> | For bookmark-based pagination, the document _id to start from |
| [options.keys] | <code>Array.&lt;string&gt;</code> | Ids of specific clients to return (within the current page), |

<a name="OAuthClientsCollection+get"></a>

### oAuthClientsCollection.get(id) ⇒ <code>object</code>
Get an OAuth client by id

**Kind**: instance method of [<code>OAuthClientsCollection</code>](#OAuthClientsCollection)  
**Returns**: <code>object</code> - JsonAPI response containing normalized client as data attribute  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | The client id. |

<a name="OAuthClientsCollection+destroy"></a>

### oAuthClientsCollection.destroy(oauthClient) ⇒ <code>Object</code>
Destroys the OAuth client on the server

**Kind**: instance method of [<code>OAuthClientsCollection</code>](#OAuthClientsCollection)  
**Returns**: <code>Object</code> - The deleted client  

| Param | Type | Description |
| --- | --- | --- |
| oauthClient | <code>object</code> | The io.cozy.oauth.clients document to destroy |

<a name="PermissionCollection"></a>

## PermissionCollection
Implements `DocumentCollection` API along with specific methods for `io.cozy.permissions`.

**Kind**: global class  

* [PermissionCollection](#PermissionCollection)
    * [new PermissionCollection(doctype, stackClient, [options])](#new_PermissionCollection_new)
    * [.create(permission)](#PermissionCollection+create)
    * [.add(document, permission, options)](#PermissionCollection+add) ⇒ <code>Promise</code>
    * ~~[.findApps()](#PermissionCollection+findApps)~~
    * [.createSharingLink(document, options)](#PermissionCollection+createSharingLink)
    * [.fetchPermissionsByLink(permissions)](#PermissionCollection+fetchPermissionsByLink)
    * [.fetchAllLinks(document)](#PermissionCollection+fetchAllLinks) ⇒ <code>object</code>
    * [.revokeSharingLink(document)](#PermissionCollection+revokeSharingLink)

<a name="new_PermissionCollection_new"></a>

### new PermissionCollection(doctype, stackClient, [options])

| Param | Type | Description |
| --- | --- | --- |
| doctype | <code>string</code> | Doctype of the collection (should be `io.cozy.permissions`) |
| stackClient | [<code>CozyStackClient</code>](#CozyStackClient) | The client used to make requests to the server |
| [options] | [<code>PermissionCollectionOptions</code>](#PermissionCollectionOptions) | The collection options |

<a name="PermissionCollection+create"></a>

### permissionCollection.create(permission)
Create a new set of permissions
It can also associates one or more codes to it, via the codes parameter

**Kind**: instance method of [<code>PermissionCollection</code>](#PermissionCollection)  
**See**: https://docs.cozy.io/en/cozy-stack/permissions/#post-permissions  

| Param | Type | Description |
| --- | --- | --- |
| permission | <code>object</code> | permission to create |
| permission.codes | <code>string</code> | A comma separed list of values (defaulted to code) |
| permission.ttl | <code>string</code> | Make the codes expire after a delay (bigduration format) |
| permission.tiny | <code>boolean</code> | If set to true then the generated shortcode will be 6 digits Cozy-Stack has a few conditions to be able to use this tiny shortcode ATM you have to specifiy a ttl < 1h, but it can change. see https://docs.cozy.io/en/cozy-stack/permissions/#post-permissions for exact informations bigduration format: https://github.com/justincampbell/bigduration/blob/master/README.md |

<a name="PermissionCollection+add"></a>

### permissionCollection.add(document, permission, options) ⇒ <code>Promise</code>
Adds a permission to the given document. Document type must be
`io.cozy.apps`, `io.cozy.konnectors` or `io.cozy.permissions`

**Kind**: instance method of [<code>PermissionCollection</code>](#PermissionCollection)  

| Param | Type | Description |
| --- | --- | --- |
| document | <code>object</code> | Document which receives the permission |
| permission | <code>object</code> | Describes the permission |
| options | <code>object</code> | options |
| [options.expiresAt] | <code>string</code> | Date at which the permission will expire. Set to "" to remove it. |
| [options.password] | <code>string</code> | To generate a password-protected link. Set to "" to remove it. |

**Example**  
```
const permissions = await client.collection('io.cozy.permissions').add(
  konnector,
  {
    folder: {
      type: 'io.cozy.files',
      verbs: ['GET', 'PUT'],
      values: [`io.cozy.files.bc57b60eb2954537b0dcdc6ebd8e9d23`]
    }
  },
  { expiresAt: '2100-01-01T00:00:00Z', password: 'password' }
)
```
<a name="PermissionCollection+findApps"></a>

### ~~permissionCollection.findApps()~~
***Deprecated***

**Kind**: instance method of [<code>PermissionCollection</code>](#PermissionCollection)  
<a name="PermissionCollection+createSharingLink"></a>

### permissionCollection.createSharingLink(document, options)
Create a share link

**Kind**: instance method of [<code>PermissionCollection</code>](#PermissionCollection)  

| Param | Type | Description |
| --- | --- | --- |
| document | <code>Object</code> | cozy document |
| options | <code>object</code> | options |
| [options.ttl] | <code>string</code> | Time to live (bigduration format, e.g. "4Y3M2D1h30m15s") |
| [options.password] | <code>string</code> | To generate a password-protected link |
| [options.verbs] | <code>Array.&lt;string&gt;</code> | explicit permissions to use |
| [options.codes] | <code>string</code> | A comma separed list of values (defaulted to code) |
| [options.tiny] | <code>boolean</code> | If set to true then the generated shortcode will be 6 digits Cozy-Stack has a few conditions to be able to use this tiny shortcode ATM you have to specifiy a ttl < 1h, but it can change. see https://docs.cozy.io/en/cozy-stack/permissions/#post-permissions for exact informations |

<a name="PermissionCollection+fetchPermissionsByLink"></a>

### permissionCollection.fetchPermissionsByLink(permissions)
Follow the next link to fetch the next permissions

**Kind**: instance method of [<code>PermissionCollection</code>](#PermissionCollection)  

| Param | Type | Description |
| --- | --- | --- |
| permissions | <code>object</code> | JSON-API based permissions document |

<a name="PermissionCollection+fetchAllLinks"></a>

### permissionCollection.fetchAllLinks(document) ⇒ <code>object</code>
**Kind**: instance method of [<code>PermissionCollection</code>](#PermissionCollection)  
**Returns**: <code>object</code> - with all the permissions  

| Param | Type | Description |
| --- | --- | --- |
| document | <code>object</code> | Cozy doc |

<a name="PermissionCollection+revokeSharingLink"></a>

### permissionCollection.revokeSharingLink(document)
Destroy a sharing link and the related permissions

**Kind**: instance method of [<code>PermissionCollection</code>](#PermissionCollection)  

| Param | Type | Description |
| --- | --- | --- |
| document | <code>object</code> | document to revoke sharing link |

<a name="PromiseCache"></a>

## PromiseCache
Caches promises while they are pending
Serves to dedupe equal queries requested at the same time

**Kind**: global class  

* [PromiseCache](#PromiseCache)
    * [.pending](#PromiseCache+pending) : <code>Object.&lt;string, Promise&gt;</code>
    * [.exec(promiseFunc, keyFunc)](#PromiseCache+exec) ⇒ <code>Promise.&lt;T&gt;</code>
    * [.get(keyFunc)](#PromiseCache+get) ⇒ <code>Promise</code> \| <code>null</code>

<a name="PromiseCache+pending"></a>

### promiseCache.pending : <code>Object.&lt;string, Promise&gt;</code>
Holds pending promises

**Kind**: instance property of [<code>PromiseCache</code>](#PromiseCache)  
<a name="PromiseCache+exec"></a>

### promiseCache.exec(promiseFunc, keyFunc) ⇒ <code>Promise.&lt;T&gt;</code>
Tries to find a pending promise corresponding to the result of keyFunc
- If not found, promiseFunc is executed and the resulting promise is stored while it's pending
- If found, it is immediately returned

**Kind**: instance method of [<code>PromiseCache</code>](#PromiseCache)  

| Param | Type | Description |
| --- | --- | --- |
| promiseFunc | <code>function</code> | Not executed only if an "equal" promise is already pending. |
| keyFunc | <code>function</code> | Returns a key to find in cache to find a pending promise. |

<a name="PromiseCache+get"></a>

### promiseCache.get(keyFunc) ⇒ <code>Promise</code> \| <code>null</code>
**Kind**: instance method of [<code>PromiseCache</code>](#PromiseCache)  

| Param | Type | Description |
| --- | --- | --- |
| keyFunc | <code>function</code> | Returns a key to find in cache to find a pending promise. |

<a name="SettingsCollection"></a>

## SettingsCollection
Implements `DocumentCollection` API to interact with the /settings endpoint of the stack

**Kind**: global class  

* [SettingsCollection](#SettingsCollection)
    * [.get(id)](#SettingsCollection+get) ⇒ <code>object</code>
    * [.update(document)](#SettingsCollection+update)
    * [.updateLastSynced()](#SettingsCollection+updateLastSynced)

<a name="SettingsCollection+get"></a>

### settingsCollection.get(id) ⇒ <code>object</code>
async get - Calls a route on the /settings API

**Kind**: instance method of [<code>SettingsCollection</code>](#SettingsCollection)  
**Returns**: <code>object</code> - The response from the route  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | The setting id to call, eg `io.cozy.settings.instance` for `instance` route or `io.cozy.settings.context` for `context`route |

<a name="SettingsCollection+update"></a>

### settingsCollection.update(document)
Updates a settings document

**Kind**: instance method of [<code>SettingsCollection</code>](#SettingsCollection)  

| Param | Type | Description |
| --- | --- | --- |
| document | <code>object</code> | Document to update. Do not forget the _id attribute |

<a name="SettingsCollection+updateLastSynced"></a>

### settingsCollection.updateLastSynced()
Updates the current OAuth client's last synchronization date

**Kind**: instance method of [<code>SettingsCollection</code>](#SettingsCollection)  
<a name="SharingCollection"></a>

## SharingCollection
Implements the `DocumentCollection` API along with specific methods for
`io.cozy.sharings`.

**Kind**: global class  

* [SharingCollection](#SharingCollection)
    * [.findByDoctype(doctype, [options])](#SharingCollection+findByDoctype) ⇒ <code>object</code>
    * [.get(id)](#SharingCollection+get) ⇒ [<code>Sharing</code>](#Sharing)
    * [.renameSharedDrive(sharing, newName)](#SharingCollection+renameSharedDrive) ⇒ <code>object</code>
    * [.fetchSharedDrives()](#SharingCollection+fetchSharedDrives) ⇒ <code>Promise.&lt;{data: Array.&lt;Sharing&gt;}&gt;</code>
    * [.create(params)](#SharingCollection+create)
    * [.getDiscoveryLink(sharingId, sharecode, [options])](#SharingCollection+getDiscoveryLink) ⇒ <code>string</code>
    * [.addRecipients(options)](#SharingCollection+addRecipients)
    * [.revokeRecipient(sharing, recipientIndex)](#SharingCollection+revokeRecipient)
    * [.revokeGroup(sharing, groupIndex)](#SharingCollection+revokeGroup)
    * [.revokeSelf(sharing)](#SharingCollection+revokeSelf)
    * [.revokeAllRecipients(sharing)](#SharingCollection+revokeAllRecipients)

<a name="SharingCollection+findByDoctype"></a>

### sharingCollection.findByDoctype(doctype, [options]) ⇒ <code>object</code>
Finds all sharings for a given doctype

**Kind**: instance method of [<code>SharingCollection</code>](#SharingCollection)  
**Returns**: <code>object</code> - The response  

| Param | Type | Description |
| --- | --- | --- |
| doctype | <code>string</code> | The doctype |
| [options] | [<code>SharingRulesOptions</code>](#SharingRulesOptions) | The options |
| [options.withSharedDocs] | <code>boolean</code> | If true, the response will include the shared documents |

<a name="SharingCollection+get"></a>

### sharingCollection.get(id) ⇒ [<code>Sharing</code>](#Sharing)
Fetches a sharing by id

**Kind**: instance method of [<code>SharingCollection</code>](#SharingCollection)  
**Returns**: [<code>Sharing</code>](#Sharing) - sharing  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | Sharing's id |

<a name="SharingCollection+renameSharedDrive"></a>

### sharingCollection.renameSharedDrive(sharing, newName) ⇒ <code>object</code>
Rename a shared drive

**Kind**: instance method of [<code>SharingCollection</code>](#SharingCollection)  
**Returns**: <code>object</code> - The response  

| Param | Type | Description |
| --- | --- | --- |
| sharing | [<code>Sharing</code>](#Sharing) | Sharing's id |
| newName | <code>string</code> | New name |

<a name="SharingCollection+fetchSharedDrives"></a>

### sharingCollection.fetchSharedDrives() ⇒ <code>Promise.&lt;{data: Array.&lt;Sharing&gt;}&gt;</code>
Fetch shared drives

**Kind**: instance method of [<code>SharingCollection</code>](#SharingCollection)  
**Returns**: <code>Promise.&lt;{data: Array.&lt;Sharing&gt;}&gt;</code> - Shared drives (which are io.cozy.sharings documents)  
<a name="SharingCollection+create"></a>

### sharingCollection.create(params)
Creates a new Sharing. See https://docs.cozy.io/en/cozy-stack/sharing/#post-sharings

**Kind**: instance method of [<code>SharingCollection</code>](#SharingCollection)  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>object</code> | Sharing  params |
| params.document | [<code>Sharing</code>](#Sharing) | The document to share |
| params.description | <code>string</code> | Description of the sharing |
| [params.previewPath] | <code>string</code> | The preview path |
| [params.rules] | [<code>Array.&lt;Rule&gt;</code>](#Rule) | The rules defined to the sharing. See https://docs.cozy.io/en/cozy-stack/sharing-design/#description-of-a-sharing |
| [params.recipients] | [<code>Array.&lt;Recipient&gt;</code>](#Recipient) | Recipients to add to the sharings (will have the same permissions given by the rules defined by the sharing ) |
| [params.readOnlyRecipients] | [<code>Array.&lt;Recipient&gt;</code>](#Recipient) | Recipients to add to the sharings with only read only access |
| [params.openSharing] | <code>boolean</code> | If someone else than the owner can add a recipient to the sharing |
| [params.appSlug] | <code>string</code> | Slug of the targeted app |
| [params.sharedDrive] | <code>boolean</code> | If the sharing is a shared drive |

<a name="SharingCollection+getDiscoveryLink"></a>

### sharingCollection.getDiscoveryLink(sharingId, sharecode, [options]) ⇒ <code>string</code>
getDiscoveryLink - Returns the URL of the page that can be used to accept a sharing. See https://docs.cozy.io/en/cozy-stack/sharing/#get-sharingssharing-iddiscovery

**Kind**: instance method of [<code>SharingCollection</code>](#SharingCollection)  

| Param | Type | Description |
| --- | --- | --- |
| sharingId | <code>string</code> | Id of the sharing |
| sharecode | <code>string</code> | Code of the sharing |
| [options] | <code>object</code> | Options |
| [options.shortcut] | <code>boolean</code> | If true, add a shortcut to the sharing in the user's cozy and skip the OAuth authorize page. |

<a name="SharingCollection+addRecipients"></a>

### sharingCollection.addRecipients(options)
Add an array of contacts to the Sharing

**Kind**: instance method of [<code>SharingCollection</code>](#SharingCollection)  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | Object |
| options.document | [<code>Sharing</code>](#Sharing) | Sharing Object |
| [options.recipients] | [<code>Array.&lt;Recipient&gt;</code>](#Recipient) | Recipients to add to the sharing |
| [options.readOnlyRecipients] | [<code>Array.&lt;Recipient&gt;</code>](#Recipient) | Recipients to add to the sharings with only read only access |

<a name="SharingCollection+revokeRecipient"></a>

### sharingCollection.revokeRecipient(sharing, recipientIndex)
Revoke only one recipient of the sharing.

**Kind**: instance method of [<code>SharingCollection</code>](#SharingCollection)  

| Param | Type | Description |
| --- | --- | --- |
| sharing | [<code>Sharing</code>](#Sharing) | Sharing Object |
| recipientIndex | <code>number</code> | Index of this recipient in the members array of the sharing |

<a name="SharingCollection+revokeGroup"></a>

### sharingCollection.revokeGroup(sharing, groupIndex)
Revoke only one group of the sharing.

**Kind**: instance method of [<code>SharingCollection</code>](#SharingCollection)  

| Param | Type | Description |
| --- | --- | --- |
| sharing | [<code>Sharing</code>](#Sharing) | Sharing Object |
| groupIndex | <code>number</code> | Index of this group in the groups array of the sharing |

<a name="SharingCollection+revokeSelf"></a>

### sharingCollection.revokeSelf(sharing)
Remove self from the sharing.

**Kind**: instance method of [<code>SharingCollection</code>](#SharingCollection)  

| Param | Type | Description |
| --- | --- | --- |
| sharing | [<code>Sharing</code>](#Sharing) | Sharing Object |

<a name="SharingCollection+revokeAllRecipients"></a>

### sharingCollection.revokeAllRecipients(sharing)
Revoke the sharing for all the members. Must be called
from the owner's cozy

**Kind**: instance method of [<code>SharingCollection</code>](#SharingCollection)  

| Param | Type | Description |
| --- | --- | --- |
| sharing | [<code>Sharing</code>](#Sharing) | Sharing Objects |

<a name="ShortcutsCollection"></a>

## ShortcutsCollection
Provides helpers to interact with shortcuts documents on the Cozy stack.

**Kind**: global class  

* [ShortcutsCollection](#ShortcutsCollection)
    * [.create(attributes)](#ShortcutsCollection+create)
    * [.get(id)](#ShortcutsCollection+get) ⇒ <code>Promise.&lt;{data: object}&gt;</code>

<a name="ShortcutsCollection+create"></a>

### shortcutsCollection.create(attributes)
Create a shortcut

**Kind**: instance method of [<code>ShortcutsCollection</code>](#ShortcutsCollection)  
**Throws**:

- <code>Error</code> - explaining reason why creation failed


| Param | Type | Description |
| --- | --- | --- |
| attributes | <code>object</code> | shortcut's attributes |
| attributes.name | <code>string</code> | Filename |
| attributes.url | <code>string</code> | Shortcut's URL |
| attributes.dir_id | <code>string</code> | dir_id where to create the shortcut |
| attributes.type | <code>string</code> \| <code>undefined</code> | shortcut's type |

<a name="ShortcutsCollection+get"></a>

### shortcutsCollection.get(id) ⇒ <code>Promise.&lt;{data: object}&gt;</code>
Fetches a shortcut by its ID.

**Kind**: instance method of [<code>ShortcutsCollection</code>](#ShortcutsCollection)  
**Returns**: <code>Promise.&lt;{data: object}&gt;</code> - The shortcut data, normalized.  
**Throws**:

- <code>Error</code> If the fetch fails for any reason.


| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | The ID of the shortcut to retrieve. |

<a name="TriggerCollection"></a>

## TriggerCollection
Implements `DocumentCollection` API along with specific methods for `io.cozy.triggers`.

**Kind**: global class  

* [TriggerCollection](#TriggerCollection)
    * [.all(options)](#TriggerCollection+all) ⇒ <code>Object</code>
    * [.create(attributes)](#TriggerCollection+create) ⇒ <code>object</code>
    * [.destroy(document)](#TriggerCollection+destroy) ⇒ <code>object</code>
    * [.find(selector, options)](#TriggerCollection+find) ⇒ <code>Object</code>
    * [.launch(trigger)](#TriggerCollection+launch) ⇒ <code>object</code>
    * [.update(trigger)](#TriggerCollection+update) ⇒ <code>object</code>

<a name="TriggerCollection+all"></a>

### triggerCollection.all(options) ⇒ <code>Object</code>
Get the list of triggers.

**Kind**: instance method of [<code>TriggerCollection</code>](#TriggerCollection)  
**Returns**: <code>Object</code> - The JSON API conformant response.  
**Throws**:

- <code>FetchError</code> 

**See**: https://docs.cozy.io/en/cozy-stack/jobs/#get-jobstriggers  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | The fetch options: Worker allow to filter only triggers associated with a specific worker. |

<a name="TriggerCollection+create"></a>

### triggerCollection.create(attributes) ⇒ <code>object</code>
Creates a Trigger document

**Kind**: instance method of [<code>TriggerCollection</code>](#TriggerCollection)  
**Returns**: <code>object</code> - Stack response, containing trigger document under `data` attribute.  
**See**: https://docs.cozy.io/en/cozy-stack/jobs/#post-jobstriggers  

| Param | Type | Description |
| --- | --- | --- |
| attributes | <code>object</code> | Trigger's attributes |

<a name="TriggerCollection+destroy"></a>

### triggerCollection.destroy(document) ⇒ <code>object</code>
Deletes a trigger

**Kind**: instance method of [<code>TriggerCollection</code>](#TriggerCollection)  
**Returns**: <code>object</code> - The deleted document  
**See**: https://docs.cozy.io/en/cozy-stack/jobs/#delete-jobstriggerstrigger-id  

| Param | Type | Description |
| --- | --- | --- |
| document | <code>object</code> | The trigger to delete — must have an _id field |

<a name="TriggerCollection+find"></a>

### triggerCollection.find(selector, options) ⇒ <code>Object</code>
Be warned, ATM /jobs/triggers does not return the same informations
than /data/io.cozy.triggers (used by the super.find method).

See https://github.com/cozy/cozy-stack/pull/2010

**Kind**: instance method of [<code>TriggerCollection</code>](#TriggerCollection)  
**Returns**: <code>Object</code> - The JSON API conformant response.  
**Throws**:

- <code>FetchError</code> 


| Param | Type | Description |
| --- | --- | --- |
| selector | <code>object</code> | Which kind of worker {konnector,service} |
| options | <code>object</code> | Options |

<a name="TriggerCollection+launch"></a>

### triggerCollection.launch(trigger) ⇒ <code>object</code>
Force given trigger execution.

**Kind**: instance method of [<code>TriggerCollection</code>](#TriggerCollection)  
**Returns**: <code>object</code> - Stack response, containing job launched by trigger, under `data` attribute.  
**See**: https://docs.cozy.io/en/cozy-stack/jobs/#post-jobstriggerstrigger-idlaunch  

| Param | Type | Description |
| --- | --- | --- |
| trigger | <code>object</code> | Trigger to launch |

<a name="TriggerCollection+update"></a>

### triggerCollection.update(trigger) ⇒ <code>object</code>
Updates a Trigger document. Only updatable attributes plus _id are allowed.

**Kind**: instance method of [<code>TriggerCollection</code>](#TriggerCollection)  
**Returns**: <code>object</code> - Stack response, containing resulting trigger document under `data` attribute.  

| Param | Type | Description |
| --- | --- | --- |
| trigger | <code>object</code> | Trigger's attributes to update + id |

<a name="dontThrowNotFoundError"></a>

## dontThrowNotFoundError ⇒ <code>object</code>
Handler for error response which return a empty value for "not found" error

**Kind**: global constant  
**Returns**: <code>object</code> - JsonAPI response with empty data in case of "not
found" error.  

| Param | Type | Description |
| --- | --- | --- |
| error | <code>Error</code> | An error |
| data | <code>Array</code> \| <code>object</code> \| <code>null</code> | Data to return in case of "not found" error |

<a name="isIndexNotFoundError"></a>

## isIndexNotFoundError ⇒ <code>Array</code> \| <code>null</code>
Helper to identify an index not found error

**Kind**: global constant  
**Returns**: <code>Array</code> \| <code>null</code> - - Whether or not the error is an index not found error  

| Param | Type | Description |
| --- | --- | --- |
| error | <code>Error</code> | An error |

<a name="isIndexConflictError"></a>

## isIndexConflictError ⇒ <code>Array</code> \| <code>null</code>
Helper to identify an index conflict

**Kind**: global constant  
**Returns**: <code>Array</code> \| <code>null</code> - - Whether or not the error is an index conflict error  

| Param | Type | Description |
| --- | --- | --- |
| error | <code>Error</code> | An error |

<a name="isIndexNotUsedWarning"></a>

## isIndexNotUsedWarning ⇒ <code>Array</code> \| <code>null</code>
Helper to identify a not used index

**Kind**: global constant  
**Returns**: <code>Array</code> \| <code>null</code> - Whether or not this is a not used index warning  

| Param | Type | Description |
| --- | --- | --- |
| warning | <code>string</code> | The warning returned by CouchDB |

<a name="isNoUsableIndexError"></a>

## isNoUsableIndexError ⇒ <code>Array</code> \| <code>null</code>
Helper to identify a no usable index error

**Kind**: global constant  
**Returns**: <code>Array</code> \| <code>null</code> - - Whether or not the error is a no usable index error  

| Param | Type | Description |
| --- | --- | --- |
| error | <code>Error</code> | An error |

<a name="isTimeoutError"></a>

## isTimeoutError ⇒ <code>Array</code> \| <code>null</code>
Helper to identify timeout error
See cozy-stack's timeout value for couchdb request: https://github.com/cozy/cozy-stack/blob/669cd694132388ef6b7d1a58cf3d1b5dfb52896a/pkg/config/config/config.go#L963

**Kind**: global constant  
**Returns**: <code>Array</code> \| <code>null</code> - Whether or not the error is a timeout error  

| Param | Type | Description |
| --- | --- | --- |
| error | <code>Error</code> | An error |

<a name="isDocumentUpdateConflict"></a>

## isDocumentUpdateConflict ⇒ <code>Array</code> \| <code>null</code>
Helper to identify a document conflict

**Kind**: global constant  
**Returns**: <code>Array</code> \| <code>null</code> - - Whether or not the error is a document conflict error  

| Param | Type | Description |
| --- | --- | --- |
| error | <code>Error</code> | An error |

<a name="isFile"></a>

## isFile ⇒ <code>boolean</code>
Returns true when parameter has type directory, file or has _type io.cozy.files

**Kind**: global constant  
**Returns**: <code>boolean</code> - true when objects has type directory, file or has _type io.cozy.files or false  

| Param | Type | Description |
| --- | --- | --- |
| doc | <code>object</code> | The document whose type is checked |
| [doc._type] | <code>string</code> | The document's doctype |
| [doc.type] | <code>&#x27;directory&#x27;</code> \| <code>&#x27;file&#x27;</code> | The io.cozy-files document type |

<a name="isDirectory"></a>

## isDirectory ⇒ <code>boolean</code>
Returns true when parameters has type directory

**Kind**: global constant  
**Returns**: <code>boolean</code> - true when parameters has type directory or false  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>object</code> | File |
| args.type | <code>string</code> | The type of the file |

<a name="getIllegalCharacters"></a>

## getIllegalCharacters ⇒ <code>string</code>
Get the list of illegal characters in the file name

**Kind**: global constant  
**Returns**: <code>string</code> - illegal characters separated by spaces  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | the file name |

<a name="makeKeyFromPartialFilter"></a>

## makeKeyFromPartialFilter ⇒ <code>string</code>
Process a partial filter to generate a string key

/!\ Warning: this method is similar to cozy-pouch-link mango.makeKeyFromPartialFilter()
If you edit this method, please check if the change is also needed in mango file

**Kind**: global constant  
**Returns**: <code>string</code> - - The string key of the processed partial filter  

| Param | Type | Description |
| --- | --- | --- |
| condition | <code>object</code> | An object representing the partial filter or a sub-condition of the partial filter |

<a name="getIndexNameFromFields"></a>

## getIndexNameFromFields ⇒ <code>string</code>
Name an index, based on its indexed fields and partial filter.

It follows this naming convention:
`by_{indexed_field1}_and_{indexed_field2}_filter_({partial_filter.key1}_{partial_filter.value1})_and_({partial_filter.key2}_{partial_filter.value2})`

/!\ Warning: this method is similar to cozy-pouch-link mango.getIndexNameFromFields()
If you edit this method, please check if the change is also needed in mango file

**Kind**: global constant  
**Returns**: <code>string</code> - The index name, built from the fields  

| Param | Type | Description |
| --- | --- | --- |
| fields | <code>Array.&lt;string&gt;</code> | The indexed fields |
| [partialFilter] | <code>object</code> | The partial filter |

<a name="transformSort"></a>

## transformSort ⇒ [<code>MangoSort</code>](#MangoSort)
Transform sort into Array

**Kind**: global constant  

| Param | Type | Description |
| --- | --- | --- |
| sort | [<code>MangoSort</code>](#MangoSort) | The sorting parameters |

<a name="getIndexFields"></a>

## getIndexFields ⇒ <code>Array</code>
Compute fields that should be indexed for a mango
query to work

**Kind**: global constant  
**Returns**: <code>Array</code> - - Fields to index  
<a name="isMatchingIndex"></a>

## isMatchingIndex ⇒ <code>boolean</code>
Check if an index is matching the given fields

**Kind**: global constant  
**Returns**: <code>boolean</code> - True if the index is matches the given fields  

| Param | Type | Description |
| --- | --- | --- |
| index | [<code>DesignDoc</code>](#DesignDoc) | The index to check |
| fields | <code>Array</code> | The fields that the index must have |
| partialFilter | <code>object</code> | An optional partial filter |

<a name="makeOperatorsExplicit"></a>

## makeOperatorsExplicit ⇒ <code>object</code>
Transform a query to make all operators explicit

**Kind**: global constant  
**Returns**: <code>object</code> - - The transformed query with all operators explicit  

| Param | Type | Description |
| --- | --- | --- |
| query | <code>object</code> | The query to transform |
| reverseEq | <code>boolean</code> | If true, $eq will be transformed to $ne (useful for manage $nor) |

<a name="getPermissionsFor"></a>

## getPermissionsFor ⇒ <code>object</code>
Build a permission set

**Kind**: global constant  
**Returns**: <code>object</code> - permissions object that can be sent through /permissions/*  

| Param | Type | Description |
| --- | --- | --- |
| document | <code>Object</code> | cozy document |
| publicLink | <code>boolean</code> | are the permissions for a public link ? |
| options | <code>object</code> | options |
| [options.verbs] | <code>Array.&lt;string&gt;</code> | explicit permissions to use |

<a name="normalizeSettings"></a>

## normalizeSettings ⇒ <code>object</code>
Normalizing a document for SettingsCollection context

**Kind**: global constant  
**Returns**: <code>object</code> - normalized document  

| Param | Type | Description |
| --- | --- | --- |
| doc | <code>object</code> | Document to normalize |

<a name="getSharingRules"></a>

## getSharingRules ⇒ [<code>Array.&lt;Rule&gt;</code>](#Rule)
Rules determine the behavior of the sharing when changes are made to the shared document
See https://docs.cozy.io/en/cozy-stack/sharing-design/#description-of-a-sharing

**Kind**: global constant  
**Returns**: [<code>Array.&lt;Rule&gt;</code>](#Rule) - The rules that define how to share the document  

| Param | Type | Description |
| --- | --- | --- |
| document | [<code>Sharing</code>](#Sharing) | The document to share. Should have and _id and a name |
| [sharingRulesOptions] | [<code>SharingRulesOptions</code>](#SharingRulesOptions) | The document to share. Should have and _id and a name |

<a name="SHORTCUTS_DOCTYPE"></a>

## SHORTCUTS\_DOCTYPE : <code>string</code>
Doctype for shortcuts documents.

**Kind**: global constant  
<a name="forceDownload"></a>

## forceDownload
Force a download from the given href

**Kind**: global constant  

| Param | Type | Description |
| --- | --- | --- |
| href | <code>string</code> | The link to download |
| filename | <code>string</code> | The file name to download |

<a name="encodePath"></a>

## encodePath ⇒ <code>string</code>
Encode a path for use in a URL by encoding special characters but keeping slashes

**Kind**: global constant  
**Returns**: <code>string</code> - - The encoded path with special characters for parentheses and spaces  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | The path to encode |

<a name="sharedDriveApiPrefix"></a>

## sharedDriveApiPrefix ⇒ <code>string</code>
Returns a FileCollection API prefix for manipulating a shared
drive's files.

**Kind**: global constant  
**Returns**: <code>string</code> - The API prefix to manipulate the drive's files  

| Param | Type | Description |
| --- | --- | --- |
| driveId | <code>string</code> | The shared drive ID |

<a name="getAccessToken"></a>

## getAccessToken() ⇒ <code>string</code>
Get the access token string

**Kind**: global function  
**Returns**: <code>string</code> - token  
**See**: CozyStackClient.getAccessToken  
<a name="getAccessToken"></a>

## getAccessToken() ⇒ <code>string</code>
Get the app token string

**Kind**: global function  
**Returns**: <code>string</code> - token  
**See**: CozyStackClient.getAccessToken  
<a name="getIconURL"></a>

## getIconURL()
Get Icon URL using blob mechanism if OAuth connected
or using preloaded url when blob not needed

**Kind**: global function  
<a name="handleNorOperator"></a>

## handleNorOperator(conditions) ⇒ <code>Array</code>
Handle the $nor operator in a query
CouchDB transforms $nor into $and with $ne operators

**Kind**: global function  
**Returns**: <code>Array</code> - - The reversed conditions  

| Param | Type | Description |
| --- | --- | --- |
| conditions | <code>Array</code> | The conditions inside the $nor operator |

<a name="sortObjectByKey"></a>

## sortObjectByKey(a, b) ⇒ <code>number</code>
Compares two objects based on their first key to determine their order.

**Kind**: global function  
**Returns**: <code>number</code> - - A negative number if the key of `a` should appear before the key of `b`,
                    a positive number if it should appear after, or 0 if they are equal.  

| Param | Type | Description |
| --- | --- | --- |
| a | <code>object</code> | The first object to compare |
| b | <code>object</code> | The second object to compare |

<a name="garbageCollect"></a>

## garbageCollect()
Delete outdated results from cache

**Kind**: global function  
<a name="memoize"></a>

## memoize()
Memoize with maxDuration and custom key

**Kind**: global function  
<a name="normalizeDoctypeJsonApi"></a>

## normalizeDoctypeJsonApi(doctype) ⇒ <code>function</code>
Normalizes a document in JSON API format for a specific doctype

**Kind**: global function  
**Returns**: <code>function</code> - A function that normalizes the document  

| Param | Type | Description |
| --- | --- | --- |
| doctype | <code>string</code> | The document type |

<a name="getSharingRulesForPhotosAlbum"></a>

## getSharingRulesForPhotosAlbum(document) ⇒ [<code>Array.&lt;Rule&gt;</code>](#Rule)
Compute the rules that define how to share a Photo Album. See https://docs.cozy.io/en/cozy-stack/sharing-design/#description-of-a-sharing

**Kind**: global function  
**Returns**: [<code>Array.&lt;Rule&gt;</code>](#Rule) - The rules that define how to share a Photo Album  

| Param | Type | Description |
| --- | --- | --- |
| document | [<code>Sharing</code>](#Sharing) | The document to share. Should have and _id and a name |

<a name="getSharingPolicyForReferencedFiles"></a>

## getSharingPolicyForReferencedFiles() ⇒ [<code>SharingPolicy</code>](#SharingPolicy)
Compute the sharing policy for a ReferencedFile based on its sharing type

**Kind**: global function  
**Returns**: [<code>SharingPolicy</code>](#SharingPolicy) - The sharing policy for the ReferencedFile  
<a name="getSharingPolicyForAlbum"></a>

## getSharingPolicyForAlbum() ⇒ [<code>Array.&lt;Rule&gt;</code>](#Rule)
Compute the sharing policy for an Album based on its sharing type

**Kind**: global function  
**Returns**: [<code>Array.&lt;Rule&gt;</code>](#Rule) - The sharing policy for the Album  
<a name="getSharingRulesForFile"></a>

## getSharingRulesForFile(document) ⇒ [<code>Array.&lt;Rule&gt;</code>](#Rule)
Compute the rules that define how to share a File. See https://docs.cozy.io/en/cozy-stack/sharing-design/#description-of-a-sharing

**Kind**: global function  
**Returns**: [<code>Array.&lt;Rule&gt;</code>](#Rule) - The rules that define how to share a File  

| Param | Type | Description |
| --- | --- | --- |
| document | [<code>Sharing</code>](#Sharing) | The document to share. Should have and _id and a name |

<a name="getSharingRulesForSharedDrive"></a>

## getSharingRulesForSharedDrive(document) ⇒ [<code>Array.&lt;Rule&gt;</code>](#Rule)
Compute the rules that define a shared drive.

**Kind**: global function  
**Returns**: [<code>Array.&lt;Rule&gt;</code>](#Rule) - The rules that define a shared drive  

| Param | Type | Description |
| --- | --- | --- |
| document | [<code>Sharing</code>](#Sharing) | The document to share. Should have and _id and a name |

<a name="getSharingPolicyForFile"></a>

## getSharingPolicyForFile(document) ⇒ [<code>SharingPolicy</code>](#SharingPolicy)
Compute the sharing policy for a File based on its sharing type

**Kind**: global function  
**Returns**: [<code>SharingPolicy</code>](#SharingPolicy) - The sharing policy for the File  

| Param | Type | Description |
| --- | --- | --- |
| document | [<code>Sharing</code>](#Sharing) | The document to share. Should have and _id and a name |

<a name="getSharingRulesForOrganizations"></a>

## getSharingRulesForOrganizations(document) ⇒ [<code>Array.&lt;Rule&gt;</code>](#Rule)
Compute the rules that define how to share an Organization. See https://docs.cozy.io/en/cozy-stack/sharing-design/#description-of-a-sharing

**Kind**: global function  
**Returns**: [<code>Array.&lt;Rule&gt;</code>](#Rule) - The rules that define how to share an Organization  

| Param | Type | Description |
| --- | --- | --- |
| document | [<code>Sharing</code>](#Sharing) | The document to share. Should have and _id and a name |

<a name="toRelationshipItem"></a>

## toRelationshipItem(item) ⇒ [<code>RelationshipItem</code>](#RelationshipItem)
Compute the RelationshipItem that can be referenced as a sharing recipient

**Kind**: global function  
**Returns**: [<code>RelationshipItem</code>](#RelationshipItem) - The RelationshipItem that can be referenced as a sharing recipient  

| Param | Type | Description |
| --- | --- | --- |
| item | [<code>Recipient</code>](#Recipient) | The recipient of a sharing |

<a name="getCozyURL"></a>

## getCozyURL()
Get a uniform formatted URL and SSL information according to a provided URL

**Kind**: global function  
<a name="joinPath"></a>

## joinPath(start, end) ⇒ <code>string</code>
Join two paths together ensuring there is only one slash between them

**Kind**: global function  
**Returns**: <code>string</code> - The joined path  

| Param | Type | Description |
| --- | --- | --- |
| start | <code>string</code> | The starting part of the path |
| end | <code>string</code> | The ending part of the path |

<a name="FetchChangesReturnValue"></a>

## FetchChangesReturnValue ⇒ [<code>Promise.&lt;FetchChangesReturnValue&gt;</code>](#FetchChangesReturnValue)
Use Couch _changes API
Deleted and design docs are filtered by default, thus documents are retrieved in the response
(include_docs is set to true in the parameters of _changes).

You should use fetchChangesRaw to have low level control on _changes parameters.

**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| couchOptions | <code>object</code> | Couch options for changes |
| [couchOptions.since] | <code>string</code> | Bookmark telling CouchDB from which point in time should changes be returned |
| [couchOptions.doc_ids] | <code>Array.&lt;string&gt;</code> | Only return changes for a subset of documents |
| options | <code>object</code> | Further options on the returned documents. By default, it is set to { includeDesign: false, includeDeleted: false } |
| [options.includeDesign] | <code>boolean</code> | Whether to include changes from design docs (needs include_docs to be true) |
| [options.includeDeleted] | <code>boolean</code> | Whether to include changes for deleted documents (needs include_docs to be true) |

**Properties**

| Name | Type |
| --- | --- |
| newLastSeq | <code>string</code> | 
| documents | <code>Array.&lt;object&gt;</code> | 

<a name="CozyStackClient"></a>

## CozyStackClient : <code>module:&quot;./CozyStackClient.js&quot;</code>
**Kind**: global typedef  

* [CozyStackClient](#CozyStackClient) : <code>module:&quot;./CozyStackClient.js&quot;</code>
    * [.collection(doctype, options)](#CozyStackClient+collection) ⇒ [<code>DocumentCollection</code>](#DocumentCollection)
    * [.fetch(method, path, [body], [opts])](#CozyStackClient+fetch) ⇒ <code>object</code>
    * [.refreshToken()](#CozyStackClient+refreshToken) ⇒ <code>Promise</code>
    * [.fetchJSON(method, path, body, options)](#CozyStackClient+fetchJSON) ⇒ <code>object</code>
    * [.setToken(token)](#CozyStackClient+setToken)
    * [.getAccessToken()](#CozyStackClient+getAccessToken) ⇒ <code>string</code>

<a name="CozyStackClient+collection"></a>

### cozyStackClient.collection(doctype, options) ⇒ [<code>DocumentCollection</code>](#DocumentCollection)
Creates a [DocumentCollection](#DocumentCollection) instance.

**Kind**: instance method of [<code>CozyStackClient</code>](#CozyStackClient)  

| Param | Type | Description |
| --- | --- | --- |
| doctype | <code>string</code> | The collection doctype. |
| options | <code>object</code> | Options to pass to the collection. |

<a name="CozyStackClient+fetch"></a>

### cozyStackClient.fetch(method, path, [body], [opts]) ⇒ <code>object</code>
Fetches an endpoint in an authorized way.

**Kind**: instance method of [<code>CozyStackClient</code>](#CozyStackClient)  
**Throws**:

- <code>FetchError</code> 


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| method | <code>string</code> |  | The HTTP method. |
| path | <code>string</code> |  | The URI. |
| [body] | <code>object</code> |  | The payload. |
| [opts] | <code>object</code> | <code>{}</code> | Options for fetch |

<a name="CozyStackClient+refreshToken"></a>

### cozyStackClient.refreshToken() ⇒ <code>Promise</code>
Retrieves a new app token by refreshing the currently used token.

**Kind**: instance method of [<code>CozyStackClient</code>](#CozyStackClient)  
**Returns**: <code>Promise</code> - A promise that resolves with a new AccessToken object  
**Throws**:

- <code>Error</code> The client should already have an access token to use this function
- <code>Error</code> The client couldn't fetch a new token

<a name="CozyStackClient+fetchJSON"></a>

### cozyStackClient.fetchJSON(method, path, body, options) ⇒ <code>object</code>
Fetches JSON in an authorized way.

**Kind**: instance method of [<code>CozyStackClient</code>](#CozyStackClient)  
**Throws**:

- <code>FetchError</code> 


| Param | Type | Description |
| --- | --- | --- |
| method | <code>string</code> | The HTTP method. |
| path | <code>string</code> | The URI. |
| body | <code>object</code> | The payload. |
| options | <code>object</code> | Options |

<a name="CozyStackClient+setToken"></a>

### cozyStackClient.setToken(token)
Change or set the API token

**Kind**: instance method of [<code>CozyStackClient</code>](#CozyStackClient)  

| Param | Type | Description |
| --- | --- | --- |
| token | <code>string</code> \| <code>AppToken</code> \| <code>AccessToken</code> | Stack API token |

<a name="CozyStackClient+getAccessToken"></a>

### cozyStackClient.getAccessToken() ⇒ <code>string</code>
Get the access token string, being an oauth token or an app token

**Kind**: instance method of [<code>CozyStackClient</code>](#CozyStackClient)  
**Returns**: <code>string</code> - token  
<a name="IOCozyFolder"></a>

## IOCozyFolder : <code>object</code>
Folder

**Kind**: global typedef  
<a name="SpecificFileAttributesForKonnector"></a>

## SpecificFileAttributesForKonnector : <code>object</code>
Specific file attributes for creation for konnector

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| sourceAccount | <code>string</code> | the id of the source account used by a konnector |
| sourceAccountIdentifier | <code>string</code> | the unique identifier of the account targeted by the connector |

<a name="CouchDBViewCursor"></a>

## CouchDBViewCursor : <code>Array.&lt;string&gt;</code> \| <code>string</code>
Cursor used for Mango queries pagination

**Kind**: global typedef  
<a name="DirectoryAttributes"></a>

## DirectoryAttributes : <code>object</code>
Attributes used for directory creation

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| dirId | <code>string</code> | Id of the parent directory. |
| name | <code>boolean</code> | Name of the created directory. |
| executable | <code>boolean</code> | Indicates whether the file will be executable. |
| [metadata] | <code>object</code> | io.cozy.files.metadata to attach to the directory |

<a name="FileAttributes"></a>

## FileAttributes : <code>object</code>
Attributes used for file creation

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | Id of the document |
| _id | <code>string</code> | Id of the document |
| dirId | <code>string</code> | Id of the parent directory. |
| name | <code>string</code> | Name of the created file. |
| lastModifiedDate | <code>Date</code> | Can be used to set the last modified date of a file. |
| executable | <code>boolean</code> | Whether or not the file is executable |
| encrypted | <code>boolean</code> | Whether or not the file is client-side encrypted |
| metadata | <code>object</code> | io.cozy.files.metadata to attach to the file |

<a name="FileDocument"></a>

## FileDocument : <code>object</code>
Document representing a io.cozy.files

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| _id | <code>string</code> | Id of the file |
| _rev | <code>string</code> | Rev of the file |
| attributes | [<code>FileAttributes</code>](#FileAttributes) | Attributes of the file |
| meta | <code>object</code> | Meta |
| relationships | <code>object</code> | Relationships |
| referenced_by | <code>object</code> | Referenced by |

<a name="Stream"></a>

## Stream : <code>object</code>
Stream is not defined in a browser, but is on NodeJS environment

**Kind**: global typedef  
<a name="OAuthClient"></a>

## OAuthClient : <code>object</code>
Document representing a io.cozy.oauth.clients

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| _id | <code>string</code> | Id of the client |
| _type | <code>string</code> | Doctype of the client (i.e. io.cozy.oauth.clients) |


* [OAuthClient](#OAuthClient) : <code>object</code>
    * [.doRegistration()](#OAuthClient+doRegistration)
    * [.register()](#OAuthClient+register) ⇒ <code>Promise</code>
    * [.unregister()](#OAuthClient+unregister) ⇒ <code>Promise</code>
    * [.fetchInformation()](#OAuthClient+fetchInformation) ⇒ <code>Promise</code>
    * [.updateInformation(information, resetSecret)](#OAuthClient+updateInformation) ⇒ <code>Promise</code>
    * [.generateStateCode()](#OAuthClient+generateStateCode) ⇒ <code>string</code>
    * [.getAuthCodeURL(options)](#OAuthClient+getAuthCodeURL) ⇒ <code>string</code>
    * [.getAccessCodeFromURL(pageURL, stateCode)](#OAuthClient+getAccessCodeFromURL) ⇒ <code>string</code>
    * [.fetchAccessToken(accessCode, oauthOptionsArg, uri, codeVerifier)](#OAuthClient+fetchAccessToken) ⇒ <code>Promise</code>
    * [.fetchKonnectorToken(slug)](#OAuthClient+fetchKonnectorToken) ⇒ <code>Promise.&lt;string&gt;</code>
    * [.fetchSessionCode()](#OAuthClient+fetchSessionCode) ⇒ [<code>Promise.&lt;SessionCodeRes&gt;</code>](#SessionCodeRes)
    * [.fetchSessionCodeWithPassword()](#OAuthClient+fetchSessionCodeWithPassword) ⇒ [<code>Promise.&lt;SessionCodeRes&gt;</code>](#SessionCodeRes)
    * [.loginFlagship()](#OAuthClient+loginFlagship) ⇒ <code>Promise.&lt;(AccessTokenRes\|TwoFactorNeededRes\|SessionCodeRes)&gt;</code>
    * [.refreshToken()](#OAuthClient+refreshToken) ⇒ <code>Promise</code>
    * [.setToken(token)](#OAuthClient+setToken)
    * [.setOAuthOptions(options)](#OAuthClient+setOAuthOptions)
    * [.resetClient()](#OAuthClient+resetClient)
    * [.setPassphraseFlagship(params)](#OAuthClient+setPassphraseFlagship) ⇒ <code>object</code>
    * [.checkForRevocation()](#OAuthClient+checkForRevocation) ⇒ <code>Promise.&lt;boolean&gt;</code>

<a name="OAuthClient+doRegistration"></a>

### oAuthClient.doRegistration()
Performs the HTTP call to register the client to the server

**Kind**: instance method of [<code>OAuthClient</code>](#OAuthClient)  
<a name="OAuthClient+register"></a>

### oAuthClient.register() ⇒ <code>Promise</code>
Registers the currenly configured client with the OAuth server and
sets internal information from the server response

**Kind**: instance method of [<code>OAuthClient</code>](#OAuthClient)  
**Returns**: <code>Promise</code> - A promise that resolves with a complete list of client information, including client ID and client secret.  
**Throws**:

- <code>Error</code> When the client is already registered

<a name="OAuthClient+unregister"></a>

### oAuthClient.unregister() ⇒ <code>Promise</code>
Unregisters the currenly configured client with the OAuth server.

**Kind**: instance method of [<code>OAuthClient</code>](#OAuthClient)  
**Throws**:

- <code>NotRegisteredException</code> When the client doesn't have it's registration information

<a name="OAuthClient+fetchInformation"></a>

### oAuthClient.fetchInformation() ⇒ <code>Promise</code>
Fetches the complete set of client information from the server after it has been registered.

**Kind**: instance method of [<code>OAuthClient</code>](#OAuthClient)  
**Throws**:

- <code>NotRegisteredException</code> When the client doesn't have it's registration information

<a name="OAuthClient+updateInformation"></a>

### oAuthClient.updateInformation(information, resetSecret) ⇒ <code>Promise</code>
Overwrites the client own information. This method will update both the local information and the remote information on the OAuth server.

**Kind**: instance method of [<code>OAuthClient</code>](#OAuthClient)  
**Returns**: <code>Promise</code> - Resolves to a complete, updated list of client information  
**Throws**:

- <code>NotRegisteredException</code> When the client doesn't have it's registration information


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| information | <code>object</code> |  | Set of information to update. Note that some fields such as `clientID` can't be updated. |
| resetSecret | <code>boolean</code> | <code>false</code> | = false Optionnal, whether to reset the client secret or not |

<a name="OAuthClient+generateStateCode"></a>

### oAuthClient.generateStateCode() ⇒ <code>string</code>
Generates a random state code to be used during the OAuth process

**Kind**: instance method of [<code>OAuthClient</code>](#OAuthClient)  
<a name="OAuthClient+getAuthCodeURL"></a>

### oAuthClient.getAuthCodeURL(options) ⇒ <code>string</code>
Generates the URL that the user should be sent to in order to accept the app's permissions.

**Kind**: instance method of [<code>OAuthClient</code>](#OAuthClient)  
**Returns**: <code>string</code> - The URL  
**Throws**:

- <code>NotRegisteredException</code> When the client doesn't have it's registration information


| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | URL generation options |
| options.stateCode | <code>string</code> | A random code to be included in the URl for security. Can be generated with `client.generateStateCode()` |
| [options.scopes] | <code>Array</code> | An array of permission scopes for the token. |
| [options.sessionCode] | [<code>SessionCode</code>](#SessionCode) | A session code that can be used to create a session. |
| [options.codeChallenge] | <code>string</code> | A code challenge that can be used in a PKCE verification process. |

<a name="OAuthClient+getAccessCodeFromURL"></a>

### oAuthClient.getAccessCodeFromURL(pageURL, stateCode) ⇒ <code>string</code>
Retrieves the access code contained in the URL to which the user is redirected after accepting the app's permissions (the `redirectURI`).

**Kind**: instance method of [<code>OAuthClient</code>](#OAuthClient)  
**Returns**: <code>string</code> - The access code  
**Throws**:

- <code>Error</code> The URL should contain the same state code as the one generated with `client.getAuthCodeURL()`. If not, it will throw an error


| Param | Type | Description |
| --- | --- | --- |
| pageURL | <code>string</code> | The redirected page URL, containing the state code and the access code |
| stateCode | <code>string</code> | The state code that was contained in the original URL the user was sent to (see `client.getAuthCodeURL()`) |

<a name="OAuthClient+fetchAccessToken"></a>

### oAuthClient.fetchAccessToken(accessCode, oauthOptionsArg, uri, codeVerifier) ⇒ <code>Promise</code>
Exchanges an access code for an access token. This function does **not** update the client's token.

**Kind**: instance method of [<code>OAuthClient</code>](#OAuthClient)  
**Returns**: <code>Promise</code> - A promise that resolves with an AccessToken object.  
**Throws**:

- <code>NotRegisteredException</code> When the client doesn't have it's registration information


| Param | Type | Description |
| --- | --- | --- |
| accessCode | <code>string</code> | The access code contained in the redirection URL — see `client.getAccessCodeFromURL()` |
| oauthOptionsArg | <code>object</code> | — To use when OAuthClient is not yet registered (during login process) |
| uri | <code>string</code> | — To use when OAuthClient is not yet registered (during login process) |
| codeVerifier | <code>string</code> | — The PKCE code verifier (see https://docs.cozy.io/en/cozy-stack/auth/#pkce-extension) |

<a name="OAuthClient+fetchKonnectorToken"></a>

### oAuthClient.fetchKonnectorToken(slug) ⇒ <code>Promise.&lt;string&gt;</code>
Used by the flagship application in order to create a token for the konnector with the given slug.
This token can then be used by the client-side konnector to make requests to cozy-stack.
The flagship app will need to use its own access token to request the konnector token.

**Kind**: instance method of [<code>OAuthClient</code>](#OAuthClient)  
**Returns**: <code>Promise.&lt;string&gt;</code> - - A promise that resolves with a new token  

| Param | Type | Description |
| --- | --- | --- |
| slug | <code>string</code> | The slug of the konnector |

<a name="OAuthClient+fetchSessionCode"></a>

### oAuthClient.fetchSessionCode() ⇒ [<code>Promise.&lt;SessionCodeRes&gt;</code>](#SessionCodeRes)
Fetches a new session code. Only usable by the Flagship application

**Kind**: instance method of [<code>OAuthClient</code>](#OAuthClient)  
**Returns**: [<code>Promise.&lt;SessionCodeRes&gt;</code>](#SessionCodeRes) - A promise that resolves with a new session_code  
**Throws**:

- <code>NotRegisteredException</code> When the client isn't certified to be the Flagship application

<a name="OAuthClient+fetchSessionCodeWithPassword"></a>

### oAuthClient.fetchSessionCodeWithPassword() ⇒ [<code>Promise.&lt;SessionCodeRes&gt;</code>](#SessionCodeRes)
Fetches a new session code. Only usable by the Flagship application

**Kind**: instance method of [<code>OAuthClient</code>](#OAuthClient)  
**Returns**: [<code>Promise.&lt;SessionCodeRes&gt;</code>](#SessionCodeRes) - A promise that resolves with a new session_code  
**Throws**:

- <code>NotRegisteredException</code> When the client isn't certified to be the Flagship application

<a name="OAuthClient+loginFlagship"></a>

### oAuthClient.loginFlagship() ⇒ <code>Promise.&lt;(AccessTokenRes\|TwoFactorNeededRes\|SessionCodeRes)&gt;</code>
Get OAuth access and register tokens without having to make OAuth dance

This endpoint returns registration tokens only from a Flagship app,
otherwise it returns a session_code that should be used in an OAuth dance

More info: https://docs.cozy.io/en/cozy-stack/flagship/
More info: https://docs.cozy.io/en/cozy-stack/auth/#post-authloginflagship

**Kind**: instance method of [<code>OAuthClient</code>](#OAuthClient)  
**Returns**: <code>Promise.&lt;(AccessTokenRes\|TwoFactorNeededRes\|SessionCodeRes)&gt;</code> - A promise that resolves with an access token, a session_code or a 2FA code  
<a name="OAuthClient+refreshToken"></a>

### oAuthClient.refreshToken() ⇒ <code>Promise</code>
Retrieves a new access token by refreshing the currently used token.

**Kind**: instance method of [<code>OAuthClient</code>](#OAuthClient)  
**Returns**: <code>Promise</code> - A promise that resolves with a new AccessToken object  
**Throws**:

- <code>NotRegisteredException</code> When the client doesn't have it's registration information
- <code>Error</code> The client should already have an access token to use this function

<a name="OAuthClient+setToken"></a>

### oAuthClient.setToken(token)
Updates the client's stored token

**Kind**: instance method of [<code>OAuthClient</code>](#OAuthClient)  

| Param | Type | Description |
| --- | --- | --- |
| token | <code>string</code> | = null The new token to use — can be a string, a json object or an AccessToken instance. |

<a name="OAuthClient+setOAuthOptions"></a>

### oAuthClient.setOAuthOptions(options)
Updates the OAuth informations

**Kind**: instance method of [<code>OAuthClient</code>](#OAuthClient)  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | Map of OAuth options |

<a name="OAuthClient+resetClient"></a>

### oAuthClient.resetClient()
Reset the current OAuth client

**Kind**: instance method of [<code>OAuthClient</code>](#OAuthClient)  
<a name="OAuthClient+setPassphraseFlagship"></a>

### oAuthClient.setPassphraseFlagship(params) ⇒ <code>object</code>
This method should be used in flagship app onboarding process to finalize the
cozy creation by setting the user password into the cozy-stack

More info: https://docs.cozy.io/en/cozy-stack/settings/#post-settingspassphraseflagship

**Kind**: instance method of [<code>OAuthClient</code>](#OAuthClient)  
**Returns**: <code>object</code> - token - The OAauth token  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>object</code> | parameters needed to set passphrase |
| params.registerToken | <code>string</code> | registration token provided by the onboarding link |
| params.passwordHash | <code>string</code> | hash of the master password |
| params.hint | <code>string</code> | hint for the master password |
| params.key | <code>string</code> | key (crypted) used for the vault encryption |
| params.publicKey | <code>string</code> | public key used for sharing ciphers from the vault |
| params.privateKey | <code>string</code> | private key (crypted) used for sharing ciphers from the vault |
| params.iterations | <code>string</code> | number of KDF iterations applied when hashing the master password |

<a name="OAuthClient+checkForRevocation"></a>

### oAuthClient.checkForRevocation() ⇒ <code>Promise.&lt;boolean&gt;</code>
Check if the OAuth client's has been revoked.
If this is the case, call the onRevocationChange callback

**Kind**: instance method of [<code>OAuthClient</code>](#OAuthClient)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - A Promise that resolves to `false` if client is still valid, or `true` if it has been revoked.  
<a name="FileCollectionOptions"></a>

## FileCollectionOptions : <code>object</code>
Options that can be passed to FileCollection's constructor

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [driveId] | <code>string</code> | ID of the shared drive targeted by the collection |

<a name="ArchivePages"></a>

## ArchivePages : <code>object</code>
Attributes used for create archive link by ids

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | Id of the file |
| page | <code>number</code> | The page number. PDF files only (1 is the first page) |

<a name="FetchChangesReturnValue"></a>

## FetchChangesReturnValue ⇒ [<code>FetchChangesReturnValue</code>](#FetchChangesReturnValue)
Use cozy-stack's _changes API for io.cozy.files
Design docs are filtered by default, thus documents are retrieved in the
response (includeDocs is set to true in the parameters of _changes).
Deleted and trashed documents can be filtered on demand and files' paths
can be requested as well.

Since deleted and trashed documents are skipped by cozy-stack rather than
CouchDB, when either option is set to true, the response can contain less
documents than the defined limit. Thus one should rely solely on the
`pending` result attribute to determine if more documents can be fetched or
not.

You should use fetchChangesRaw to call CouchDB's _changes API.

**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| couchOptions | <code>CouchOptions</code> | Couch options for changes |
| options | <code>FetchChangesOptions</code> | Further options on the returned documents. By default, it is set to                                        { includeFilePath: false, skipDeleted: false, skipTrashed: false } |

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| since | <code>string</code> | Bookmark telling CouchDB from which point in time should changes be returned |
| limit | <code>number</code> | The maximum number of returned documents for one call |
| includeDocs | <code>boolean</code> | Whether or not complete documents should be returned |
| fields | <code>Array.&lt;string&gt;</code> | The list of fields that should be returned for each document |
| includeFilePath | <code>boolean</code> | Whether to include the path of file changes (needs includeDocs to be true) |
| skipDeleted | <code>boolean</code> | Whether to skip changes for deleted documents |
| skipTrashed | <code>boolean</code> | Whether to skip changes for trashed documents (needs includeDocs to be true) |
| newLastSeq | <code>string</code> |  |
| pending | <code>boolean</code> |  |
| documents | <code>Array.&lt;object&gt;</code> |  |

<a name="JobDocument"></a>

## JobDocument : <code>object</code>
Document representing a io.cozy.jobs

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| _id | <code>string</code> | Id of the job |
| attributes.state | <code>string</code> | state of the job. Can be 'errored', 'running', 'queued', 'done' |
| attributes.error | <code>string</code> | Error message of the job if any |

<a name="MangoPartialFilter"></a>

## MangoPartialFilter : <code>Object</code>
**Kind**: global typedef  
<a name="MangoSelector"></a>

## MangoSelector : <code>object</code>
**Kind**: global typedef  
<a name="MangoSort"></a>

## MangoSort : <code>Array.&lt;object&gt;</code>
**Kind**: global typedef  
<a name="MangoQueryOptions"></a>

## MangoQueryOptions : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [selector] | [<code>MangoSelector</code>](#MangoSelector) | Selector |
| [sort] | [<code>MangoSort</code>](#MangoSort) | The sorting parameters |
| [fields] | <code>Array.&lt;string&gt;</code> | The fields to return |
| [partialFilterFields] | <code>Array.&lt;string&gt;</code> | The partial filter fields |
| [limit] | <code>number</code> \| <code>null</code> | For pagination, the number of results to return |
| [skip] | <code>number</code> \| <code>null</code> | For skip-based pagination, the number of referenced files to skip |
| [indexId] | <code>string</code> \| <code>null</code> | The _id of the CouchDB index to use for this request |
| [bookmark] | <code>string</code> \| <code>null</code> | For bookmark-based pagination, the document _id to start from |
| [indexedFields] | <code>Array.&lt;string&gt;</code> |  |
| [use_index] | <code>string</code> | Name of the index to use |
| [execution_stats] | <code>boolean</code> | If true, we request the stats from Couch |
| [partialFilter] | [<code>MangoPartialFilter</code>](#MangoPartialFilter) \| <code>null</code> | An optional partial filter |

<a name="DesignDoc"></a>

## DesignDoc : <code>object</code>
Attributes representing a design doc

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| _id | <code>string</code> | Id of the design doc. Can be named, e.g. '_design/by_indexed_attribute' or not, e.g. '_design/12345' |
| language | <code>string</code> | The index language. Can be 'query' for mango index or 'javascript' for views. |
| views | <code>object</code> | Views definition, i.e. the index. |
| _rev | <code>string</code> | Rev version |

<a name="CozyStackClient"></a>

## CozyStackClient : <code>module:&quot;./CozyStackClient.js&quot;</code>
**Kind**: global typedef  

* [CozyStackClient](#CozyStackClient) : <code>module:&quot;./CozyStackClient.js&quot;</code>
    * [.collection(doctype, options)](#CozyStackClient+collection) ⇒ [<code>DocumentCollection</code>](#DocumentCollection)
    * [.fetch(method, path, [body], [opts])](#CozyStackClient+fetch) ⇒ <code>object</code>
    * [.refreshToken()](#CozyStackClient+refreshToken) ⇒ <code>Promise</code>
    * [.fetchJSON(method, path, body, options)](#CozyStackClient+fetchJSON) ⇒ <code>object</code>
    * [.setToken(token)](#CozyStackClient+setToken)
    * [.getAccessToken()](#CozyStackClient+getAccessToken) ⇒ <code>string</code>

<a name="CozyStackClient+collection"></a>

### cozyStackClient.collection(doctype, options) ⇒ [<code>DocumentCollection</code>](#DocumentCollection)
Creates a [DocumentCollection](#DocumentCollection) instance.

**Kind**: instance method of [<code>CozyStackClient</code>](#CozyStackClient)  

| Param | Type | Description |
| --- | --- | --- |
| doctype | <code>string</code> | The collection doctype. |
| options | <code>object</code> | Options to pass to the collection. |

<a name="CozyStackClient+fetch"></a>

### cozyStackClient.fetch(method, path, [body], [opts]) ⇒ <code>object</code>
Fetches an endpoint in an authorized way.

**Kind**: instance method of [<code>CozyStackClient</code>](#CozyStackClient)  
**Throws**:

- <code>FetchError</code> 


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| method | <code>string</code> |  | The HTTP method. |
| path | <code>string</code> |  | The URI. |
| [body] | <code>object</code> |  | The payload. |
| [opts] | <code>object</code> | <code>{}</code> | Options for fetch |

<a name="CozyStackClient+refreshToken"></a>

### cozyStackClient.refreshToken() ⇒ <code>Promise</code>
Retrieves a new app token by refreshing the currently used token.

**Kind**: instance method of [<code>CozyStackClient</code>](#CozyStackClient)  
**Returns**: <code>Promise</code> - A promise that resolves with a new AccessToken object  
**Throws**:

- <code>Error</code> The client should already have an access token to use this function
- <code>Error</code> The client couldn't fetch a new token

<a name="CozyStackClient+fetchJSON"></a>

### cozyStackClient.fetchJSON(method, path, body, options) ⇒ <code>object</code>
Fetches JSON in an authorized way.

**Kind**: instance method of [<code>CozyStackClient</code>](#CozyStackClient)  
**Throws**:

- <code>FetchError</code> 


| Param | Type | Description |
| --- | --- | --- |
| method | <code>string</code> | The HTTP method. |
| path | <code>string</code> | The URI. |
| body | <code>object</code> | The payload. |
| options | <code>object</code> | Options |

<a name="CozyStackClient+setToken"></a>

### cozyStackClient.setToken(token)
Change or set the API token

**Kind**: instance method of [<code>CozyStackClient</code>](#CozyStackClient)  

| Param | Type | Description |
| --- | --- | --- |
| token | <code>string</code> \| <code>AppToken</code> \| <code>AccessToken</code> | Stack API token |

<a name="CozyStackClient+getAccessToken"></a>

### cozyStackClient.getAccessToken() ⇒ <code>string</code>
Get the access token string, being an oauth token or an app token

**Kind**: instance method of [<code>CozyStackClient</code>](#CozyStackClient)  
**Returns**: <code>string</code> - token  
<a name="NotesCollectionOptions"></a>

## NotesCollectionOptions : <code>object</code>
Options that can be passed to NotesCollection's constructor

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [driveId] | <code>string</code> | ID of the shared drive targeted by the collection |

<a name="SessionCode"></a>

## SessionCode : <code>string</code>
**Kind**: global typedef  
<a name="SessionCodeRes"></a>

## SessionCodeRes
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| session_code | <code>string</code> | The value of the session code |

<a name="AccessTokenRes"></a>

## AccessTokenRes
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| email_verified_code | <code>string</code> | The email verified code to skip 2FA |
| access_token | <code>string</code> | The OAuth access token |
| refresh_token | <code>string</code> | The OAuth refresh token |
| token_type | <code>string</code> | The OAuth token type |
| scope | <code>string</code> | The OAuth scope |

<a name="TwoFactorNeededRes"></a>

## TwoFactorNeededRes
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| two_factor_token | <code>string</code> | The 2FA token |

<a name="PermissionCollectionOptions"></a>

## PermissionCollectionOptions : <code>object</code>
Options that can be passed to PermissionCollection's constructor

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [driveId] | <code>string</code> | ID of the shared drive targeted by the collection |

<a name="Permission"></a>

## Permission ⇒ [<code>Permission</code>](#Permission)
async getOwnPermissions - deprecated: please use fetchOwnPermissions instead

**Kind**: global typedef  
**Returns**: [<code>Permission</code>](#Permission) - permission  
<a name="Permission"></a>

## Permission ⇒ [<code>Permission</code>](#Permission)
async fetchOwnPermissions - Fetches permissions

**Kind**: global typedef  
**Returns**: [<code>Permission</code>](#Permission) - permission  
<a name="Rule"></a>

## Rule : <code>object</code>
A sharing rule

**Kind**: global typedef  
**Properties**

| Name | Type |
| --- | --- |
| title | <code>string</code> | 
| doctype | <code>string</code> | 
| values | <code>Array</code> | 
| [add] | <code>string</code> | 
| [update] | <code>string</code> | 
| [remove] | <code>string</code> | 

<a name="SharingRulesOptions"></a>

## SharingRulesOptions : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type |
| --- | --- |
| [sharedDrive] | <code>boolean</code> | 

<a name="Recipient"></a>

## Recipient : <code>object</code>
An io.cozy.contact

**Kind**: global typedef  
<a name="Sharing"></a>

## Sharing : <code>object</code>
An io.cozy.sharings document

**Kind**: global typedef  
<a name="SharingPolicy"></a>

## SharingPolicy : <code>object</code>
Define the add/update/remove policies for a sharing

**Kind**: global typedef  
**Properties**

| Name | Type |
| --- | --- |
| add | <code>string</code> | 
| update | <code>string</code> | 
| remove | <code>string</code> | 

<a name="SharingType"></a>

## SharingType : <code>undefined</code> \| <code>&#x27;one-way&#x27;</code> \| <code>&#x27;two-way&#x27;</code>
Define how a document is synced between sharing's owner and receivers.

**Kind**: global typedef  
<a name="RelationshipItem"></a>

## RelationshipItem : <code>object</code>
Define a recipient that can be used as target of a sharing

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | Recipient's ID |
| type | <code>string</code> | Reciptient's type (should be 'io.cozy.contacts') |

<a name="CozyStackClient"></a>

## CozyStackClient : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| oauthOptions | <code>object</code> | oauthOptions |
| uri | <code>string</code> | CozyUri |
| fetch | <code>function</code> | fetchMethod |
| fetchJSON | <code>function</code> | fetchJSON |


* [CozyStackClient](#CozyStackClient) : <code>object</code>
    * [.collection(doctype, options)](#CozyStackClient+collection) ⇒ [<code>DocumentCollection</code>](#DocumentCollection)
    * [.fetch(method, path, [body], [opts])](#CozyStackClient+fetch) ⇒ <code>object</code>
    * [.refreshToken()](#CozyStackClient+refreshToken) ⇒ <code>Promise</code>
    * [.fetchJSON(method, path, body, options)](#CozyStackClient+fetchJSON) ⇒ <code>object</code>
    * [.setToken(token)](#CozyStackClient+setToken)
    * [.getAccessToken()](#CozyStackClient+getAccessToken) ⇒ <code>string</code>

<a name="CozyStackClient+collection"></a>

### cozyStackClient.collection(doctype, options) ⇒ [<code>DocumentCollection</code>](#DocumentCollection)
Creates a [DocumentCollection](#DocumentCollection) instance.

**Kind**: instance method of [<code>CozyStackClient</code>](#CozyStackClient)  

| Param | Type | Description |
| --- | --- | --- |
| doctype | <code>string</code> | The collection doctype. |
| options | <code>object</code> | Options to pass to the collection. |

<a name="CozyStackClient+fetch"></a>

### cozyStackClient.fetch(method, path, [body], [opts]) ⇒ <code>object</code>
Fetches an endpoint in an authorized way.

**Kind**: instance method of [<code>CozyStackClient</code>](#CozyStackClient)  
**Throws**:

- <code>FetchError</code> 


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| method | <code>string</code> |  | The HTTP method. |
| path | <code>string</code> |  | The URI. |
| [body] | <code>object</code> |  | The payload. |
| [opts] | <code>object</code> | <code>{}</code> | Options for fetch |

<a name="CozyStackClient+refreshToken"></a>

### cozyStackClient.refreshToken() ⇒ <code>Promise</code>
Retrieves a new app token by refreshing the currently used token.

**Kind**: instance method of [<code>CozyStackClient</code>](#CozyStackClient)  
**Returns**: <code>Promise</code> - A promise that resolves with a new AccessToken object  
**Throws**:

- <code>Error</code> The client should already have an access token to use this function
- <code>Error</code> The client couldn't fetch a new token

<a name="CozyStackClient+fetchJSON"></a>

### cozyStackClient.fetchJSON(method, path, body, options) ⇒ <code>object</code>
Fetches JSON in an authorized way.

**Kind**: instance method of [<code>CozyStackClient</code>](#CozyStackClient)  
**Throws**:

- <code>FetchError</code> 


| Param | Type | Description |
| --- | --- | --- |
| method | <code>string</code> | The HTTP method. |
| path | <code>string</code> | The URI. |
| body | <code>object</code> | The payload. |
| options | <code>object</code> | Options |

<a name="CozyStackClient+setToken"></a>

### cozyStackClient.setToken(token)
Change or set the API token

**Kind**: instance method of [<code>CozyStackClient</code>](#CozyStackClient)  

| Param | Type | Description |
| --- | --- | --- |
| token | <code>string</code> \| <code>AppToken</code> \| <code>AccessToken</code> | Stack API token |

<a name="CozyStackClient+getAccessToken"></a>

### cozyStackClient.getAccessToken() ⇒ <code>string</code>
Get the access token string, being an oauth token or an app token

**Kind**: instance method of [<code>CozyStackClient</code>](#CozyStackClient)  
**Returns**: <code>string</code> - token  
