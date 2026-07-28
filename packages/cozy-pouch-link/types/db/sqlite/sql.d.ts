export function keepDocWitHighestRev(docs: any): any;
export function parseResults(client: any, result: any, doctype: any, { isSingleDoc, skip, limit }?: {
    isSingleDoc?: boolean;
    skip?: number;
    limit?: number;
}): {
    data: any;
    meta?: undefined;
    skip?: undefined;
    next?: undefined;
} | {
    data: any[];
    meta: {
        count: number;
    };
    skip: number;
    next: boolean;
};
export function mangoSelectorToSQL(selector: any, columnName: any): string;
export function makeWhereClause(selector: any, columnName: any): string;
export function makeSortClause(mangoSortBy: any): string;
export function makeSQLQueryFromMango({ selector, sort, indexName, partialFilter, limit, skip }: {
    selector: any;
    sort: any;
    indexName: any;
    partialFilter: any;
    limit?: number;
    skip?: number;
}): string;
export function makeSQLQueryForId(id: any): string;
export function makeSQLQueryForIds(ids: any): string;
export function makeSQLQueryAll({ limit, skip }?: {
    limit?: number;
    skip?: number;
}): string;
export function makeSQLDropIndex(indexName: any): string;
export function makeSQLCreateMangoIndex(indexName: any, fieldsToIndex: any, { partialFilter }: {
    partialFilter: any;
}): string;
export function makeSQLCreateDocIDIndex(): string;
export function makeSQLCreateDeletedIndex(): string;
export function createMangoIndex(db: any, indexName: any, fieldsToIndex: any, { partialFilter }: {
    partialFilter: any;
}): Promise<any>;
export function deleteIndex(db: any, indexName: any): Promise<void>;
export function executeSQL(db: any, sql: any): Promise<any>;
