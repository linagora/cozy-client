import get from 'lodash/get'
import merge from 'lodash/merge'

import logger from '../logger'
import { QueryDefinition } from '../queries/dsl'
import { getDocumentFromState, receiveQueryResult } from '../store'
import Association from './Association'

/**
 * @typedef {object} Relationship
 * @property {string} relName - name of the relationship
 * @property {string} relItemId - id of the relation
 * @property {Relation} relItemAttrs - Attributes to be set (at least _id and _type)
 */
/**
 * @typedef {object} Relation
 * @property {string} _id - id of the relation
 * @property {string} _type - doctype of the relation
 */

const empty = () => ({
  data: [],
  next: true,
  meta: { count: 0 }
})

const updateArray = (array, indexArg, el) => {
  const index = indexArg === -1 ? array.length : indexArg
  return [...array.slice(0, index), el, ...array.slice(index + 1)]
}

/**
 * Related documents are stored in the relationships attribute of the object,
 * following the JSON API spec.
 *
 * Responsible for
 *
 * - Creating relationships
 * - Removing relationships
 *
 * @description
 *
 * ```
 * const schema = {
 *   todos: {
 *      doctype: 'io.cozy.todos',
 *      relationships: {
 *        tasks: {
 *          doctype: 'io.cozy.tasks',
 *          type: 'has-many'
 *        }
 *      }
 *    }
 * }
 *
 * const todo = {
 *   label: "Protect people's privacy",
 *   relationships: {
 *     tasks: {
 *       data: [
 *         {_id: 1, _type: 'io.cozy.tasks'},
 *         {_id: 2, _type: 'io.cozy.tasks'}
 *       ]
 *     }
 *   }
 * }
 * ```
 */
class HasMany extends Association {
  get raw() {
    return this.getRelationship().data
  }

  /**
   * Returns store documents
   */
  get data() {
    return this.getRelationship()
      .data.map(({ _id, _type }) => this.get(_type, _id))
      .filter(Boolean)
  }

  get hasMore() {
    return this.getRelationship().next
  }

  /**
   * Returns the total number of documents in the relationship.
   * Does not handle documents absent from the store. If you want
   * to do that, you can use .data.length.
   *
   * @returns {number} - Total number of documents in the relationships
   */
  get count() {
    const relationship = this.getRelationship()
    return relationship.meta
      ? relationship.meta.count
      : relationship.data.length
  }

  fetchMore() {
    throw 'Not implemented'
  }

  exists(document) {
    return this.existsById(document._id)
  }

  containsById(id) {
    return (
      this.getRelationship().data.find(({ _id }) => id === _id) !== undefined
    )
  }

  existsById(id) {
    return Boolean(this.containsById(id) && this.get(this.doctype, id))
  }

  /**
   * Add the relationships to the target document
   *
   * @param {import("../types").CozyClientDocument[]} docsArg - Documents to add as relationships
   * @returns {import("../types").CozyClientDocument} The saved target document
   */
  add(docsArg) {
    const docs = Array.isArray(docsArg) ? docsArg : [docsArg]
    const ids = docs.map(doc => doc._id)
    return this.addById(ids)
  }

  /**
   * Remove the relationships from the target document
   *
   * @param {import("../types").CozyClientDocument[]} docsArg - Documents to remove as relationships
   * @returns {import("../types").CozyClientDocument} The saved target document
   */
  remove(docsArg) {
    const docs = Array.isArray(docsArg) ? docsArg : [docsArg]
    const ids = docs.map(doc => doc._id)
    return this.removeById(ids)
  }

  /**
   * Update target document with relationships
   *
   * @param {string[]} idsArg - The ids to add as a relationship
   */
  addTargetRelationships(idsArg) {
    if (!this.target.relationships) this.target.relationships = {}
    if (!this.target.relationships[this.name]) {
      this.target.relationships[this.name] = { data: [] }
    }
    const ids = Array.isArray(idsArg) ? idsArg : [idsArg]

    const newRelations = ids
      .filter(id => !this.existsById(id))
      .map(id => ({
        _id: id,
        _type: this.doctype
      }))

    this.target.relationships[this.name].data.push(...newRelations)
    this.updateMetaCount()
  }

  /**
   * Add a referenced document by id. You need to call save()
   * in order to synchronize your document with the store.
   *
   * @todo We shouldn't create the array of relationship manually since
   * it'll not be present in the store as well.
   * We certainly should use something like `updateRelationship`
   *
   */
  addById(idsArg) {
    this.addTargetRelationships(idsArg)
    return this.save(this.target)
  }

  /**
   * Remove relationships from target document
   *
   * @param {string[]} idsArg - The ids to remove from the target relationships
   */
  removeTargetRelationships(idsArg) {
    const ids = Array.isArray(idsArg) ? idsArg : [idsArg]

    this.target.relationships[this.name].data = this.target.relationships[
      this.name
    ].data.filter(({ _id }) => !ids.includes(_id))
    this.updateMetaCount()
  }

  removeById(idsArg) {
    this.removeTargetRelationships(idsArg)
    return this.save(this.target)
  }

  updateMetaCount() {
    if (get(this.target.relationships[this.name], 'meta.count') !== undefined) {
      this.target.relationships[this.name].meta = {
        ...this.target.relationships[this.name].meta,
        count: this.target.relationships[this.name].data.length
      }
    }
  }

  getRelationship() {
    const rawData = this.target[this.name]
    const relationship = get(this.target, `relationships.${this.name}`)
    if (!relationship) {
      if (rawData && rawData.length) {
        logger.warn(
          "You're trying to access data on a relationship that appear to not be loaded yet. You may want to use 'include()' on your query"
        )
      }
      return empty()
    }
    return relationship
  }

  updateTargetRelationship(store, updateFn) {
    // TODO See if updateTargetRelationship is still used, removing it would enable us
    // to remove store.readDocument and store.writeDocument and the StoreProxy
    const prevTarget = store.readDocument(this.target._type, this.target._id)
    store.writeDocument(this.updateRelationship(prevTarget, updateFn))
  }

  updateRelationship(target, updateFn) {
    return HasMany.updateRelationship(target, this.name, updateFn)
  }

  updateRelationshipData =
    getUpdatedRelationshipData => (dispatch, getState) => {
      const previousRelationship = getDocumentFromState(
        getState(),
        this.target._type,
        this.target._id
      )
      dispatch(
        receiveQueryResult(null, {
          data: {
            ...previousRelationship,
            relationships: {
              ...previousRelationship.relationships,
              [this.name]: getUpdatedRelationshipData(
                previousRelationship.relationships[this.name]
              )
            }
          }
        })
      )
    }

  dehydrate(doc) {
    return {
      ...doc,
      relationships: {
        ...doc.relationships,
        [this.name]: {
          data: this.raw
        }
      }
    }
  }

  /**
   * @param {import("../types").CozyClientDocument} document - Document to query
   * @param {object} client - The CozyClient instance
   * @param {Association} assoc - The query params
   *
   * @returns {import("../types").CozyClientDocument | QueryDefinition}
   */
  static query(document, client, assoc) {
    const relationships = get(document, `relationships.${assoc.name}.data`, [])
    const ids = relationships.map(assoc => assoc._id)
    return new QueryDefinition({ doctype: assoc.doctype, ids })
  }
}

/**
 * Gets a relationship item with the relationship name and id
 *
 * @param {object} doc - Document to be updated
 * @param {string} relName - Name of the relationship
 * @param {string} relItemId - Id of the relationship item
 */
export const getHasManyItem = (HasMany.getHasManyItem = (
  doc,
  relName,
  relItemId
) => {
  const relData = get(doc, `relationships.${relName}.data`, [])
  return relData.find(rel => rel._id == relItemId)
})

export const getHasManyItems = (HasMany.getHasManyItems = (doc, relName) => {
  return get(doc, `relationships.${relName}.data`, [])
})

/**
 * Sets a relationship item with the relationship name and id
 *
 * @param {object} doc - Document to be updated
 * @param {string} relName - Name of the relationship
 * @param {string} relItemId - Id of the relationship item
 * @param {object} relItemAttrs - Attributes to be set (at least _id and _type)
 */
export const setHasManyItem = (HasMany.setHasManyItem = (
  doc,
  relName,
  relItemId,
  relItemAttrs
) => {
  const relData = HasMany.getHasManyItems(doc, relName)
  const relIndex = relData.findIndex(rel => rel._id === relItemId)
  const updatedRelItem = merge({}, relData[relIndex], relItemAttrs)
  const updatedRelData = updateArray(relData, relIndex, updatedRelItem)
  const updatedDocument = HasMany.updateRelationship(
    doc,
    relName,
    relationship => merge({}, relationship, { data: updatedRelData })
  )

  return updatedDocument
})

/**
 * Remove one relationship item
 *
 * @param {object} doc - Document to be updated
 * @param {string} relName - Name of the relationship
 * @param {string} relItemId - Id of the relationship item
 */
export const removeHasManyItem = (HasMany.removeHasManyItem = (
  doc,
  relName,
  relItemId
) => {
  const relData = HasMany.getHasManyItems(doc, relName)
  const updatedRelData = relData.filter(rel => rel._id !== relItemId)
  const updatedDocument = HasMany.updateRelationship(doc, relName, () => ({
    data: updatedRelData
  }))

  return updatedDocument
})

/**
 * Updates a relationship item with the relationship name and id
 *
 * @param {object} doc - Document to be updated
 * @param {string} relName - Name of the relationship
 * @param {string} relItemId - Id of the relationship item
 * @param {Function} updater - receives the current relationship item and should
 * return an updated version. Merge should be used in the updater
 * if previous relationship item fields are to be kept.
 */
export const updateHasManyItem = (HasMany.updateHasManyItem = (
  doc,
  relName,
  relItemId,
  updater
) => {
  const relItem = HasMany.getHasManyItem(doc, relName, relItemId)
  const updatedRelItem = updater(relItem)
  return HasMany.setHasManyItem(doc, relName, relItemId, updatedRelItem)
})

export const updateRelationship = (HasMany.updateRelationship = (
  doc,
  relName,
  updateFn
) => {
  return {
    ...doc,
    relationships: {
      ...doc.relationships,
      [relName]: {
        ...(doc.relationships ? doc.relationships[relName] : {}),
        ...updateFn(doc.relationships ? doc.relationships[relName] : {})
      }
    }
  }
})

export default HasMany
