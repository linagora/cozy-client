import React, { useEffect, useReducer, useRef } from 'react'
import CozyClient from './CozyClient'
import PropTypes from 'prop-types'
import ObservableQuery from './ObservableQuery'
import useClient from './hooks/useClient'

// Need to have this since Query and ObservableQuery might come from
// two different incompatible versions of cozy-client. This is kept
// for backward compatibility
export const fetchQuery = (client, query) => {
  if (query.fetch) {
    return query.fetch()
  } else {
    return client.query(query.definition, { as: query.queryId })
  }
}

const executeQueryRespectingFetchPolicy = (client, observableQuery, props) => {
  if (props.fetchPolicy) {
    const queryState = client.getQueryFromState(props.as)
    if (
      typeof props.fetchPolicy === 'function' &&
      props.fetchPolicy(queryState)
    ) {
      fetchQuery(client, observableQuery)
    }
  } else {
    fetchQuery(client, observableQuery)
  }
}

/**
 * Get attributes that will be assigned to the instance of a Query
 */
const getQueryAttributes = (client, props) => {
  // Methods bound to the client
  const createDocument = client.create.bind(client)
  const saveDocument = client.save.bind(client)
  const deleteDocument = client.destroy.bind(client)
  const getAssociation = client.getAssociation.bind(client)

  // Methods on ObservableQuery
  const queryDefinition =
    typeof props.query === 'function' ? props.query(client, props) : props.query

  const observableQuery = client.makeObservableQuery(queryDefinition, props)
  const fetchMore = observableQuery.fetchMore.bind(observableQuery)

  // Mutations
  const { mutations: propMutations, ...rest } = props
  const mutations =
    typeof propMutations === 'function'
      ? propMutations(client, observableQuery, rest)
      : propMutations

  // If the query comes from a CozyClient that it too old, which may happen
  // in the bar, we do not have query.fetch
  const fetch = observableQuery.fetch
    ? observableQuery.fetch.bind(observableQuery)
    : null

  return {
    client,
    observableQuery,
    queryDefinition,
    createDocument,
    saveDocument,
    deleteDocument,
    getAssociation,
    fetchMore,
    fetch,
    mutations
  }
}

const computeChildrenArgs = queryAttributes => {
  const {
    observableQuery,
    fetchMore,
    fetch,
    createDocument,
    saveDocument,
    deleteDocument,
    getAssociation,
    mutations
  } = queryAttributes

  return [
    {
      fetchMore: fetchMore,
      fetch: fetch,
      ...observableQuery.currentResult()
    },
    {
      createDocument: createDocument,
      saveDocument: saveDocument,
      deleteDocument: deleteDocument,
      getAssociation: getAssociation,
      ...mutations
    }
  ]
}

/**
 * @param {object} props
 * @returns {React.ReactNode}
 */
const Query = props => {
  const client = useClient()
  if (!client) {
    throw new Error(
      'Query should be used with client in context (use CozyProvider to set context)'
    )
  }

  // Initialized once, mirrors the previous constructor behavior. Subsequent
  // prop changes do not recreate the observable query — matches legacy class.
  const attributesRef = useRef(null)
  if (attributesRef.current === null) {
    attributesRef.current = getQueryAttributes(client, props)
  }
  const attributes = attributesRef.current

  // Force re-render on observable query changes (equivalent to the legacy
  // `setState(dummyState)` trick). `forceRender` is stable across renders.
  const [, forceRender] = useReducer(x => x + 1, 0)

  useEffect(() => {
    const unsubscribe = attributes.observableQuery.subscribe(forceRender)
    return () => {
      if (unsubscribe) unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const enabled = props.enabled !== false
  useEffect(() => {
    if (!enabled) return
    executeQueryRespectingFetchPolicy(client, attributes.observableQuery, props)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled])

  const childrenArgs = computeChildrenArgs(attributes)
  // @ts-ignore
  return props.children(childrenArgs[0], childrenArgs[1])
}

const queryPropType = PropTypes.object

Query.propTypes = {
  /** Query definition that will be executed and observed */
  query: PropTypes.oneOfType([PropTypes.func, queryPropType]).isRequired,
  /** If set to false, query won't be executed */
  enabled: PropTypes.bool,
  /** Name of the query */
  as: PropTypes.string,
  /** Function called with the data from the query */
  children: PropTypes.func.isRequired,
  /**
   * Decides if the query is fetched at mount time. If not present
   * the query is always fetched at mount time. Receives the current
   * state of the query from the store as 1st argument.
   *
   * @example
   * If you want to only fetch queries that are older than 30 seconds:

   * ```js
   * const cache30s = ({ lastUpdate }) => {
   *   return !lastUpdate || (Date.now() - 30 * 1000 > lastUpdate)
   * }
   * <Query fetchPolicy={cache30s} ... />
   * ```
   */
  fetchPolicy: PropTypes.func
}

Query.defaultProps = {
  enabled: true
}

export default Query
export { getQueryAttributes, computeChildrenArgs }
