import PropTypes from 'prop-types'
import { Component } from 'react'

import CozyClient from './CozyClient'
import ObservableQuery from './ObservableQuery'

const dummyState = {}

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

export default class Query extends Component {
  constructor(props, context) {
    super(props, context)
    const { client } = context
    if (!context.client) {
      throw new Error(
        'Query should be used with client in context (use CozyProvider to set context)'
      )
    }

    /**
     * Current client
     *
     * @type {CozyClient}
     */
    this.client = client
    /**
     * Observable query to connect store to query
     *
     * @type {ObservableQuery}
     */
    this.observableQuery = null
    /**
     * Callback to unsubscribe from observable query
     *
     * @type {Function}
     */
    this.queryUnsubscribe = null

    Object.assign(this, getQueryAttributes(client, props))
    this.recomputeChildrenArgs()
  }

  componentDidMount() {
    this.queryUnsubscribe = this.observableQuery.subscribe(this.onQueryChange)
    if (this.props.enabled !== false) {
      this.executeQueryRespectingFetchPolicy()
    }
  }

  executeQueryRespectingFetchPolicy() {
    if (this.props.fetchPolicy) {
      const queryState = this.client.getQueryFromState(this.props.as)
      if (
        this.props.fetchPolicy &&
        typeof this.props.fetchPolicy === 'function' &&
        this.props.fetchPolicy(queryState)
      ) {
        fetchQuery(this.client, this.observableQuery)
      }
    } else {
      fetchQuery(this.client, this.observableQuery)
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.enabled === false && this.props.enabled !== false) {
      this.executeQueryRespectingFetchPolicy()
    }
  }

  componentWillUnmount() {
    if (this.queryUnsubscribe) {
      this.queryUnsubscribe()
    }
  }

  onQueryChange = () => {
    this.recomputeChildrenArgs()
    this.setState(dummyState)
  }

  recomputeChildrenArgs() {
    this.childrenArgs = computeChildrenArgs(this)
  }

  render() {
    const children = this.props.children
    // @ts-ignore
    return children(this.childrenArgs[0], this.childrenArgs[1])
  }
}

Query.contextTypes = {
  client: PropTypes.object,
  store: PropTypes.object
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

export { getQueryAttributes, computeChildrenArgs }
