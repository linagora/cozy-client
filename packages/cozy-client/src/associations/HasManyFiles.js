import get from 'lodash/get'
import omit from 'lodash/omit'
import uniq from 'lodash/uniq'
import { Mutations, Q, QueryDefinition } from '../queries/dsl'
import { getDocumentFromState } from '../store'
import { DOCTYPE_FILES } from '../const'
import Association from './Association'
import HasMany from './HasMany'

/**
 * newCursor - Returns a CouchDB view Cursor for cursor-based pagination
 *
 * @param {import("../types").ViewKey} key - The CouchDB key of the view which will be requested
 * @param {import("../types").DocId} startDocId - The first doc _id to return from the view
 *
 * @returns {import("../types").CouchDBViewCursor}
 */
const newCursor = ([doctype, id, lastDatetime], startDocId) => {
  const cursorKey = lastDatetime ? [doctype, id, lastDatetime] : [doctype, id]
  return [cursorKey, startDocId]
}

/**
 * Get the file datetime
 *
 * @param  {import('../types').IOCozyFile} file - io.cozy.files document
 * @returns {string} The file datetime
 */
export const getFileDatetime = file => {
  // Some files do not have any metadata, e.g. bitmap files.
  return file.metadata?.datetime || file.created_at
}

/**
 *  This class is only used for photos albums relationships.
 *  Behind the hood, the queries uses a view returning the files sorted
 *  by datetime, with a cursor-based pagination.
 */
export default class HasManyFiles extends HasMany {
  get data() {
    if (this.target._type === DOCTYPE_FILES) {
      const refs = get(this.target, 'referenced_by', [])
      return refs.map(({ id, type }) => this.get(type, id)).filter(Boolean)
    } else {
      return super.data
    }
  }

  async fetchMore() {
    const queryDef = new QueryDefinition({ doctype: DOCTYPE_FILES })
    const relationships = this.getRelationship().data
    // Get last datetime for cursor
    const lastRelationship = relationships[relationships.length - 1]
    await this.dispatch(async (dispatch, getState) => {
      const lastRelDoc = getDocumentFromState(
        getState(),
        lastRelationship._type,
        lastRelationship._id
      )
      // @ts-ignore
      const lastDatetime = getFileDatetime(lastRelDoc)
      // cursor-based pagination
      const cursor = newCursor(
        [this.target._type, this.target._id, lastDatetime],
        relationships[relationships.length - 1]._id
      )
      const response = await this.query(
        queryDef.referencedBy(this.target).offsetCursor(cursor)
      )
      // Remove first returned element, used as starting point for the query
      response.data.shift()
      await this.dispatch(
        this.updateRelationshipData(previousRelationshipData => ({
          ...previousRelationshipData,
          data: [...previousRelationshipData.data, ...response.data],
          next: response.next
        }))
      )
    })
  }

  async addById(idsArg) {
    const ids = Array.isArray(idsArg) ? idsArg : [idsArg]

    this.addTargetRelationships(ids)

    const relations = ids.map(id => ({
      _id: id,
      _type: this.doctype
    }))
    await this.mutate(this.addReferences(relations))
  }

  async removeById(idsArg) {
    const ids = Array.isArray(idsArg) ? idsArg : [idsArg]

    this.removeTargetRelationships(idsArg)

    const references = ids.map(id => ({
      _id: id,
      _type: this.doctype
    }))
    await this.mutate(this.removeReferences(references))
  }

  addReferences(referencedDocs) {
    if (this.target._type === DOCTYPE_FILES) {
      return Mutations.addReferencedBy(this.target, referencedDocs)
    } else if (referencedDocs[0]._type === DOCTYPE_FILES) {
      return Mutations.addReferencesTo(this.target, referencedDocs)
    } else {
      throw new Error(
        'Either the document or the references should be io.cozy.files'
      )
    }
  }

  removeReferences(referencedDocs) {
    if (this.target._type === DOCTYPE_FILES) {
      return Mutations.removeReferencedBy(this.target, referencedDocs)
    } else if (referencedDocs[0]._type === DOCTYPE_FILES) {
      return Mutations.removeReferencesTo(this.target, referencedDocs)
    } else {
      throw new Error(
        'Either the document or the references should be io.cozy.files'
      )
    }
  }

  dehydrate(doc) {
    // HasManyFiles relationships are stored on the file doctype, not the document the files are related to
    return omit(doc, [this.name, `relationships.${this.name}`])
  }

  /**
   * @param {import("../types").CozyClientDocument} document - Document to query
   * @param {object} client - The CozyClient instance
   * @param {Association} assoc - The query params
   *
   * @returns {import("../types").CozyClientDocument | QueryDefinition}
   */
  static query(document, client, assoc) {
    if (document._type === DOCTYPE_FILES) {
      const refs = get(document, `relationships.referenced_by.data`, [])
      const ids = uniq(
        refs.filter(ref => ref.type === assoc.doctype).map(ref => ref.id)
      )
      return ids.length > 0 ? Q(assoc.doctype).getByIds(ids) : null
    } else {
      const cursor = newCursor([document._type, document._id], '')

      return Q(assoc.doctype).referencedBy(document).offsetCursor(cursor)
    }
  }
}
