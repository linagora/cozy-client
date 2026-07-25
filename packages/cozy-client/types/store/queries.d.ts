export function isQueryAction(action: any): boolean;
export function isReceivingData(action: any): boolean;
export function sortAndLimitDocsIds(queryState: import("../types").QueryState, documents: import("../types").DocumentsStateSlice, ids: Array<string>, { count, fetchedPagesCount }: {
    count: number;
    fetchedPagesCount: number;
}): Array<string>;
export function convert$gtNullSelectors(selector: any): object;
export function mergeSelectorAndPartialIndex(queryDefinition: object): object;
export function executeQueryFromState(state: import('../types').CozyStore, queryDefinition: QueryDefinition): import("../types").QueryStateData;
export function makeSorterFromDefinition(definition: QueryDefinition): (arg0: Array<import("../types").CozyClientDocument>) => Array<import("../types").CozyClientDocument>;
export function computeMatchPartition(definition: QueryDefinition, newData: Array<import("../types").CozyClientDocument>): {
    matchedIds: Array<string>;
    unmatchedIds: Array<string>;
};
export function updateData(query: import("../types").QueryState, newData: Array<import("../types").CozyClientDocument>, documents: import("../types").DocumentsStateSlice): import("../types").QueryState;
export default queries;
export function initQuery(queryId: string, queryDefinition: QueryDefinition, options?: import("../types").QueryOptions): object;
export function loadQuery(queryId: string, options?: import("../types").QueryOptions): object;
export function receiveQueryResult(queryId: string, response: object, options?: import("../types").QueryOptions): object;
export function receiveQueryError(queryId: string, error: object, options?: import("../types").QueryOptions): object;
export function resetQuery(queryId: string): object;
export function mapIdsToDocuments(documents: any, doctype: any, ids: any): any;
export function getQueryFromSlice(state: any, queryId: any, documents: any): any;
export class QueryIDGenerator {
    idCounter: number;
    /**
     * Generates a random id for unamed queries
     */
    generateRandomId(): string;
    /**
     * Generates an id for queries
     * If the query is a getById only query,
     * we can generate a name for it.
     *
     * If not, let's generate a random id
     *
     * @param {QueryDefinition} queryDefinition The query definition
     * @returns {string}
     */
    generateId(queryDefinition: QueryDefinition): string;
}
export namespace QueryIDGenerator {
    const UNNAMED: string;
}
import { QueryDefinition } from "../queries/dsl";
/**
 * @param  {import('../performances/types').PerformanceAPI} performanceApi - The performance API that can be used to measure performances
 * @param  {import("../types").QueriesStateSlice}  state - Redux slice containing all the query states indexed by name
 * @param  {object}  action - Income redux action
 * @param  {import("../types").DocumentsStateSlice}  documents - Reference to documents slice
 * @param  {boolean} haveDocumentsChanged - Has the document slice changed with current action
 * @returns {import("../types").QueriesStateSlice}
 */
declare function queries(performanceApi: import('../performances/types').PerformanceAPI, state: import("../types").QueriesStateSlice, action: object, documents?: import("../types").DocumentsStateSlice, haveDocumentsChanged?: boolean): import("../types").QueriesStateSlice;
