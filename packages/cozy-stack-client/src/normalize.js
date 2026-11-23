/**
 * Normalize a document, adding its doctype if needed
 *
 * @param {object} doc - Document to normalize
 * @param {string} doctype - Document doctype
 * @returns {object} normalized document
 * @private
 */
export function normalizeDoc(doc = {}, doctype) {
  const id = doc._id || doc.id
  return { id, _id: id, _type: doctype, ...doc }
}

/**
 * Normalizes a document in JSON API format for a specific doctype
 *
 * @param {string} doctype - The document type
 * @returns {Function} A function that normalizes the document
 */
export function normalizeDoctypeJsonApi(doctype) {
  /**
   * @param {object} data - The document from "data" property of the response in JSON API format
   * @param {object} response - The response from the API (not used in this function)
   * @returns {object} The normalized document
   */
  return function (data, response) {
    // use the "data" attribute of the response
    const normalizedDoc = normalizeDoc(data, doctype)
    return {
      ...normalizedDoc,
      ...(normalizedDoc.attributes || {})
    }
  }
}

/**
 * `normalizeDoctype` for api end points returning raw documents
 *
 * @private
 * @param {string} doctype - Document doctype
 * @returns {Function} A function that normalizes the document
 */
export function normalizeDoctypeRawApi(doctype) {
  /**
   * @param {object} data - The data from the API response (not used in this function)
   * @param {object} response - The raw response from the API
   * @returns {object} The normalized document
   */
  return function (data, response) {
    // use the response directly
    const normalizedDoc = normalizeDoc(response, doctype)
    return {
      ...normalizedDoc,
      ...(normalizedDoc.attributes || {})
    }
  }
}
