export default class SQLiteQueryEngine extends DatabaseQueryEngine {
    constructor(pouchManager: any, doctype: any);
    db: any;
    client: any;
    doctype: any;
}
import DatabaseQueryEngine from "../dbInterface";
