import { Q, QueryDefinition } from '../queries/dsl'
import Association from './Association'

/**
 * Here the id of the document is directly set in the attribute
 * of the document, not in the relationships attribute
 */
export default class HasOneInPlace extends Association {
  get raw() {
    return this.target[this.name]
  }

  get data() {
    return this.get(this.doctype, this.raw)
  }

  /**
   * @param {import("../types").CozyClientDocument} document - Document to query
   * @param {object} client - The CozyClient instance
   * @param {Association} assoc - The query params
   *
   * @returns {import("../types").CozyClientDocument | QueryDefinition}
   */
  static query(document, client, assoc) {
    const id = document[assoc.name]
    return (
      client.getDocumentFromState(assoc.doctype, id) ||
      Q(assoc.doctype).getById(id)
    )
  }

  dehydrate(doc) {
    return {
      ...doc,
      [this.name]: this.raw || undefined
    }
  }
}

export const BelongsToInPlace = HasOneInPlace
