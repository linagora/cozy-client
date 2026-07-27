export default class SQLiteQueryEngine extends DatabaseQueryEngine {
    constructor(pouchManager: any, doctype: any);
    db: any;
    pouchManager: any;
    client: any;
    doctype: any;
    dbName: any;
    getPouchFallback(): PouchDBQueryEngine;
    pouchFallback: PouchDBQueryEngine;
}
import DatabaseQueryEngine from "../dbInterface";
import PouchDBQueryEngine from "../pouchdb/pouchdb";
