/**
 * ObservableQueries are the glue between the store and observers
 * of the store. They have the responsibility to hydrate the documents
 * before passing them to the React component.
 */
import get from 'lodash/get'

import { getRawQueryFromState } from './store'

const hasOwn = Object.prototype.hasOwnProperty

export default class ObservableQuery {
  constructor(queryId, definition, client, options) {
    if (!queryId || !definition || !client) {
      throw new Error(
        'ObservableQuery takes 3 arguments: queryId, definition and client'
      )
    }
    this.queryId = queryId
    this.definition = definition
    this.client = client
    this.observers = {}
    this.idCounter = 1
    this.lastResult = this.currentRawResult()
    this.options = options
  }

  handleStoreChange = () => {
    const nextResult = this.currentRawResult()
    if (!shallowEqual(nextResult, this.lastResult)) {
      this.lastResult = nextResult
      this.notifyObservers()
    }
  }

  /**
   * Returns the query from the store with hydrated documents.
   *
   * @typedef {object} HydratedQueryState
   *
   * @returns {HydratedQueryState}
   */
  currentResult() {
    return this.client.getQueryFromState(this.queryId, {
      hydrated: get(this.options, 'hydrated', true),
      singleDocData: true
    })
  }

  fetch() {
    return this.client.query(this.definition, { as: this.queryId })
  }

  /**
   * Generates and executes a query that is offsetted by the number of documents
   * we have in the store.
   */
  fetchMore() {
    const rawResult = this.currentRawResult()
    return rawResult.bookmark
      ? this.client.query(this.definition.offsetBookmark(rawResult.bookmark), {
          as: this.queryId
        })
      : this.client.query(this.definition.offset(rawResult.data.length), {
          as: this.queryId
        })
  }

  currentRawResult() {
    return getRawQueryFromState(this.getStore().getState(), this.queryId)
  }

  notifyObservers() {
    Object.keys(this.observers).forEach(id => this.observers[id]())
  }

  subscribeToStore() {
    if (this._unsubscribeStore) {
      throw new Error(
        'ObservableQuery instance is already subscribed to store.'
      )
    }
    this._unsubscribeStore = this.getStore().subscribe(this.handleStoreChange)
  }

  unsubscribeFromStore() {
    if (!this._unsubscribeStore) {
      throw new Error('ObservableQuery instance is not subscribed to store')
    }
    this._unsubscribeStore()
  }

  subscribe(callback) {
    const callbackId = this.idCounter
    this.idCounter++
    this.observers[callbackId] = callback
    if (Object.keys(this.observers).length === 1) {
      this.subscribeToStore()
    }
    return () => this.unsubscribe(callbackId)
  }

  unsubscribe(callbackId) {
    if (!this.observers[callbackId]) {
      throw new Error(`Cannot unsubscribe unknown callbackId ${callbackId}`)
    }
    delete this.observers[callbackId]
    if (Object.keys(this.observers).length === 0) {
      this.unsubscribeFromStore()
      this._unsubscribeStore = null
    }
  }

  getStore() {
    return this.client.store
  }
}

function is(x, y) {
  if (x === y) {
    return x !== 0 || y !== 0 || 1 / x === 1 / y
  } else {
    return x !== x && y !== y
  }
}

function shallowEqual(objA, objB) {
  if (is(objA, objB)) return true

  if (
    typeof objA !== 'object' ||
    objA === null ||
    typeof objB !== 'object' ||
    objB === null
  ) {
    return false
  }

  const keysA = Object.keys(objA)
  const keysB = Object.keys(objB)

  if (keysA.length !== keysB.length) return false

  for (let i = 0; i < keysA.length; i++) {
    if (!hasOwn.call(objB, keysA[i]) || !is(objA[keysA[i]], objB[keysA[i]])) {
      return false
    }
  }

  return true
}
