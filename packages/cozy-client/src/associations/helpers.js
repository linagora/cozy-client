import pick from 'lodash/pick'
import pickBy from 'lodash/pickBy'
import Association from './Association'
import HasOne from './HasOne'
import HasOneInPlace from './HasOneInPlace'
import HasMany from './HasMany'
import HasManyInPlace from './HasManyInPlace'
import HasManyFiles from './HasManyFiles'

export const pickTypeAndId = x => pick(x, '_type', '_id')

const applyHelper = (fn, objOrArr) =>
  Array.isArray(objOrArr) ? objOrArr.map(fn) : fn(objOrArr)

export const responseToRelationship = response =>
  pickBy({
    data: applyHelper(pickTypeAndId, response.data),
    meta: response.meta,
    next: response.next,
    skip: response.skip,
    bookmark: response.bookmark
  })

const attachRelationship = (doc, relationships) => {
  return {
    ...doc,
    relationships: {
      ...doc.relationships,
      ...relationships
    }
  }
}

export const attachRelationships = (response, relationshipsByDocId) => {
  if (Array.isArray(response.data)) {
    return {
      ...response,
      data: response.data.map(doc =>
        attachRelationship(doc, relationshipsByDocId[doc._id])
      )
    }
  } else {
    const doc = response.data
    if (!doc) return response
    return {
      ...response,
      data: attachRelationship(doc, relationshipsByDocId[doc._id])
    }
  }
}

const aliases = {
  'io.cozy.files:has-many': HasManyFiles,
  'has-many': HasMany,
  'belongs-to-in-place': HasOneInPlace,
  'has-one': HasOne,
  'has-one-in-place': HasOneInPlace,
  'has-many-in-place': HasManyInPlace
}

/**
 * Returns the relationship class for a given doctype/type.
 *
 * In the schema definition, some classes have string aliases
 * so you do not have to import directly the association.
 *
 * Some doctypes can have built-in overriden relationships.
 *
 * @private
 */
export const resolveClass = (doctype, type) => {
  if (type === undefined) {
    throw new Error('Undefined type for ' + doctype)
  }
  if (typeof type !== 'string') {
    return type
  } else {
    const qualified = `${doctype}:${type}`
    const cls = aliases[qualified] || aliases[type]
    if (!cls) {
      throw new Error(`Unknown association '${type}'`)
    } else {
      return cls
    }
  }
}

export const create = (target, { name, type, doctype }, accessors) => {
  if (target[name] instanceof Association) {
    throw new Error(`Association ${name} already exists`)
  }
  return new type(target, name, doctype, accessors)
}

/**
 * Checks if the file is referenced by a specific doctype
 *
 * @param {import("../types").IOCozyFile} file - io.cozy.files document
 * @param {import("../types").Doctype} referencedBy - Doctype where document is referenced
 * @returns {boolean} If a reference is found
 */
export const isReferencedBy = (file, referencedBy) => {
  const references =
    file?.relationships?.referenced_by?.data || file?.referenced_by || []

  return references.some(reference => reference.type === referencedBy)
}

/**
 * Checks if the file is referenced by a specific doctype and a specific Id of that reference
 *
 * @param {import("../types").IOCozyFile} file - io.cozy.files document
 * @param {import("../types").Doctype} referencedBy - Doctype where document is referenced
 * @param {string} referencedId - Id of the referenced document
 * @returns {boolean} If a reference is found
 */
export const isReferencedById = (file, referencedBy, referencedId) => {
  const references =
    file?.relationships?.referenced_by?.data || file?.referenced_by || []

  return references.some(
    reference =>
      reference.type === referencedBy && reference.id === referencedId
  )
}

/**
 * Get array of reference by an specific doctype
 *
 * @param {import("../types").IOCozyFile} file - io.cozy.files document
 * @param {import("../types").Doctype} referencedBy - Doctype where document is referenced
 * @returns {import("../types").Reference[]} Array of references found
 */
export const getReferencedBy = (file, referencedBy) => {
  const references =
    file?.relationships?.referenced_by?.data || file?.referenced_by || []
  return references.filter(reference => reference.type === referencedBy)
}

/**
 * Get array of reference by an specific doctype and a specific Id of that reference
 *
 * @param {import("../types").IOCozyFile} file - io.cozy.files document
 * @param {import("../types").Doctype} referencedBy - Doctype where document is referenced
 * @param {string} referencedId - Id of the referenced document
 * @returns {import("../types").Reference[]} Array of the reference found
 */
export const getReferencedById = (file, referencedBy, referencedId) => {
  const references =
    file?.relationships?.referenced_by?.data || file?.referenced_by || []
  return references.filter(
    reference =>
      reference.type === referencedBy && reference.id === referencedId
  )
}
