export default class SQLiteQueryEngine extends DatabaseQueryEngine {
    constructor(pouchManager: any, doctype: any);
    db: any;
    pouchManager: any;
    client: any;
    doctype: any;
    /**
     * Lazily built by getPouchFallback, and dropped whenever openDB points this
     * engine at another database.
     *
     * @type {PouchDBQueryEngine | null}
     */
    pouchFallback: PouchDBQueryEngine | null;
    dbName: any;
    getPouchFallback(): PouchDBQueryEngine;
}
import DatabaseQueryEngine from "../dbInterface";
import PouchDBQueryEngine from "../pouchdb/pouchdb";
