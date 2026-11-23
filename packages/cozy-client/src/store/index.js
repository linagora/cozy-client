import {
  createStore as createReduxStore,
  combineReducers,
  applyMiddleware,
  compose
} from 'redux'
import thunk from 'redux-thunk'

import flag from 'cozy-flags'

import documents from './documents'
import { isMutationAction } from './mutations'
import queries, { isQueryAction } from './queries'

const RESET_ACTION_TYPE = 'COZY_CLIENT.RESET_STATE'

const resetState = () => ({ type: RESET_ACTION_TYPE })

export class StoreProxy {
  constructor(state) {
    this.state = state
  }

  readDocument(doctype, id) {
    return this.state.documents[doctype][id]
  }

  writeDocument(document) {
    this.setState(state => ({
      ...state,
      documents: {
        ...state.documents,
        [document._type]: {
          ...state.documents[document._type],
          [document._id]: document
        }
      }
    }))
  }

  setState(updaterFn) {
    this.state = updaterFn(this.state)
  }

  getState() {
    return this.state
  }
}

const initialState = { documents: {}, queries: {} }

const combinedReducer =
  performanceApi =>
  (state = initialState, action) => {
    const markName = performanceApi.mark('combinedReducer')

    if (action.type == RESET_ACTION_TYPE) {
      performanceApi.measure({
        markName: markName,
        measureName: `${markName} reset`,
        category: 'CozyClientStore'
      })
      return initialState
    }
    if (!isQueryAction(action) && !isMutationAction(action)) {
      performanceApi.measure({
        markName: markName,
        measureName: `${markName} no query nor mutate action`,
        category: 'CozyClientStore'
      })
      return state
    }
    if (action.update) {
      const proxy = new StoreProxy(state)
      action.update(proxy, action.response)
      const newState = {
        documents: proxy.getState().documents,
        queries: queries(
          performanceApi,
          proxy.getState().queries,
          action,
          proxy.getState().documents
        )
      }
      performanceApi.measure({
        markName: markName,
        measureName: `${markName} update action`,
        category: 'CozyClientStore'
      })
      return newState
    }

    const nextDocuments = documents(state.documents, action)
    const haveDocumentsChanged = nextDocuments !== state.documents

    const queriesResult = {
      documents: nextDocuments,
      queries: queries(
        performanceApi,
        state.queries,
        action,
        nextDocuments,
        haveDocumentsChanged
      )
    }

    performanceApi.measure({
      markName: markName,
      measureName: `${markName} queries`,
      category: 'CozyClientStore'
    })
    return queriesResult
  }
export default combinedReducer

const composedEnhancer =
  // @ts-ignore '__REDUX_DEVTOOLS_EXTENSION_COMPOSE__' doesn't exist 'Window & typeof globalThis'.ts(2339)
  // should be (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ in ts file
  // see https://github.com/reduxjs/redux-devtools/tree/main/extension#11-basic-store
  (flag('debug') && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose

export const createStore = performanceApi =>
  createReduxStore(
    combineReducers({ cozy: combinedReducer(performanceApi) }),
    composedEnhancer(applyMiddleware(thunk))
  )

export {
  getStateRoot,
  getCollectionFromState,
  getDocumentFromState,
  getQueryFromStore,
  getQueryFromState,
  getRawQueryFromState,
  isQueryExisting
} from './stateHelpers'

export {
  initQuery,
  loadQuery,
  resetQuery,
  receiveQueryResult,
  receiveQueryError,
  executeQueryFromState
} from './queries'

export { resetState }

export {
  initMutation,
  receiveMutationResult,
  receiveMutationError
} from './mutations'

export { dispatchCreate, dispatchUpdate, dispatchDelete } from './realtime'
