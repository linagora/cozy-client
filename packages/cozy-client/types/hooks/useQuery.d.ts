export function useQueryWithEqualityCheck(queryDefinition: QueryDefinition | (() => QueryDefinition), options: import("../types").QueryOptions, equalityCheck: typeof equalityCheckForQuery): import("../types").UseQueryReturnValue;
export function useQueries(querySpecs: any): {};
export default useQuery;
import { QueryDefinition } from "../queries/dsl";
import { equalityCheckForQuery } from "../store/selector";
/**
 * Fetches a queryDefinition and returns the queryState
 *
 * @param {QueryDefinition|(() => QueryDefinition)} queryDefinition - Definition created with Q()
 * @param {import("../types").QueryOptions} options - Options created with Q()
 * @returns {import("../types").UseQueryReturnValue}
 */
declare function useQuery(queryDefinition: QueryDefinition | (() => QueryDefinition), options: import("../types").QueryOptions): import("../types").UseQueryReturnValue;
