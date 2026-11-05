import React from 'react'
import compose from 'lodash/flowRight'
import Query from './Query'
import useClient from './hooks/useClient'
import { useQueries } from './hooks/useQuery'
import logger from './logger'

/**
 * @function
 * @description HOC to provide client from context as prop
 *
 * @param  {Component} WrappedComponent - wrapped component
 * @returns {Function} - Component that will receive client as prop
 */
export const withClient = WrappedComponent => {
  const Wrapped = props => {
    const client = useClient()
    // @ts-ignore
    return <WrappedComponent {...props} client={client} />
  }
  // @ts-ignore
  Wrapped.displayName = `withClient(${WrappedComponent.displayName ||
    // @ts-ignore
    WrappedComponent.name})`
  return Wrapped
}

const withQuery = (dest, queryOpts, Original) => {
  if (!queryOpts) {
    throw new Error(
      `withQuery has no options for ${dest} (wrapping ${Original.name})`
    )
  }

  return Component => {
    const Wrapper = props => {
      const queryOptsRes =
        typeof queryOpts === 'function' ? queryOpts(props) : queryOpts

      if (queryOpts.doc) {
        logger.warn('queryOpts.doc is deprecated')
        return <Component {...{ [dest]: queryOptsRes.doc, ...props }} />
      }

      return (
        <Query {...queryOptsRes}>
          {result => <Component {...{ [dest]: result, ...props }} />}
        </Query>
      )
    }
    Wrapper.displayName = `withQuery(${Component.displayName ||
      Component.name})`
    return Wrapper
  }
}

/**
 * @function
 * @description HOC creator to connect component to several queries in a declarative manner
 *
 * @param  {object} querySpecs - Definition of the queries
 * @returns {Function} - HOC to apply to a component
 */
export const queryConnect = querySpecs => Component => {
  const enhancers = Object.keys(querySpecs).map(dest =>
    withQuery(dest, querySpecs[dest], Component)
  )
  return compose.apply(null, enhancers)(Component)
}

/**
 * @function
 * @description HOC creator to connect component to several queries in a declarative manner
 * The only difference with queryConnect is that it does not wrap the component in N component
 * if there are N queries, only 1 extra level of nesting is introduced.
 *
 * @param  {object} querySpecs - Definition of the queries
 * @returns {Function} - HOC to apply to a component
 */
export const queryConnectFlat = querySpecs => Component => {
  const Wrapper = props => {
    const queryResults = useQueries(querySpecs)
    return <Component {...props} {...queryResults} />
  }
  Wrapper.displayName = `queryConnectFlat(${Component.displayName ||
    Component.name})`
  return Wrapper
}
