import CozyClient from './CozyClient'
import { DOCTYPE_SHARING_RECIPIENTS } from './const'
import { QueryDefinition } from './queries/dsl'

export const ENFORCE_LIST = ['io.cozy.files.shortcuts']

/**
 * @typedef {import("./types").CozyClientDocument} CozyClientDocument
 */

export const shouldEnforcePersist = definition => {
  return ENFORCE_LIST.includes(definition.doctype)
}

/**
 * Whether or not a document should be locally persisted
 *
 * @param {CozyClientDocument} document - The document to evaluate
 * @returns {boolean} whether or not the doc should be persisted
 */
export const shouldDocumentBePersisted = (document, shouldEnforce = false) => {
  if (
    !document ||
    document.cozyLocalOnly ||
    document._type === DOCTYPE_SHARING_RECIPIENTS
  ) {
    return false
  }
  if ((!document.meta?.rev && !document._rev) || shouldEnforce) {
    return true
  }
  if (document.driveId && document._type === 'io.cozy.files') {
    // Special case for files in shared drives, so remote files could be locally persisted
    return true
  }
  return false
}

/**
 * Save the document or array of documents into the persisted storage (if any)
 *
 * @param {CozyClient} client - Cozy client instance
 * @param {QueryDefinition} definition - The query definition
 * @param {CozyClientDocument | Array<CozyClientDocument>} data - Document or array of documents to be saved
 * @returns {Promise<void>}
 */
export const persistVirtualDocuments = async (client, definition, data) => {
  const enforce = shouldEnforcePersist(definition)

  if (definition.doctype === 'io.cozy.apps_registry') {
    // io.cozy.apps_registry has a dedicated `maintenance` endpoint on cozy-stack that
    // returns data different than the one stored in database
    // As we want to have transparent queries, whether it uses the stack API or Pouch,
    // we store the full response into a single doc, with a `maintenance` _id
    // and a special `cozyPouchData` attribute, to highlight this special case
    return await persistVirtualDocument(
      client,
      {
        _type: 'io.cozy.apps_registry',
        _id: definition.id,
        // @ts-ignore
        cozyPouchData: data
      },
      enforce
    )
  }

  if (!Array.isArray(data)) {
    await persistVirtualDocument(client, data, enforce)
  } else {
    const documentsToPersist = data.filter(document =>
      shouldDocumentBePersisted(document, enforce)
    )
    for (const document of documentsToPersist) {
      await persistVirtualDocument(client, document, enforce)
    }
  }
}

/**
 * Save the document or array of documents into the persisted storage (if any)
 *
 * This relies on the fact that there are some "virtual" documents returned
 * by the stack, in the sense that they are not CouchDB documents, but rather
 * are computed on the fly by the server.
 * To ensure we can use those documents locally, i.e. without the stack,
 * we allow the possibility to persist them.
 *
 * @param {CozyClient} client - Cozy client instance
 * @param {CozyClientDocument} document - Document to be saved
 * @param {boolean} enforce - When true, save the document no matter its content
 * @returns {Promise<void>}
 */
const persistVirtualDocument = async (client, document, enforce) => {
  if (shouldDocumentBePersisted(document, enforce)) {
    await client.chain.persistCozyData(document)
  }
}
