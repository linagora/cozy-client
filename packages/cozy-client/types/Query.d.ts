export function fetchQuery(client: any, query: any): any;
export default Query;
/**
 * @param {object} props
 * @returns {React.ReactNode}
 */
declare function Query(props: object): React.ReactNode;
declare namespace Query {
    namespace propTypes {
        const query: PropTypes.Validator<object>;
        const enabled: PropTypes.Requireable<boolean>;
        const as: PropTypes.Requireable<string>;
        const children: PropTypes.Validator<(...args: any[]) => any>;
        const fetchPolicy: PropTypes.Requireable<(...args: any[]) => any>;
    }
    namespace defaultProps {
        const enabled_1: boolean;
        export { enabled_1 as enabled };
    }
}
/**
 * Get attributes that will be assigned to the instance of a Query
 */
export function getQueryAttributes(client: any, props: any): {
    client: any;
    observableQuery: any;
    queryDefinition: any;
    createDocument: any;
    saveDocument: any;
    deleteDocument: any;
    getAssociation: any;
    fetchMore: any;
    fetch: any;
    mutations: any;
};
export function computeChildrenArgs(queryAttributes: any): any[];
import React from "react";
import PropTypes from "prop-types";
