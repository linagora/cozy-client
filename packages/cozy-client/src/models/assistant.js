import CozyClient from '../CozyClient'
import { Q } from '../queries/dsl'
import logger from '../logger'

const ASSISTANT_DOCTYPE = 'io.cozy.ai.chat.assistants'
const ACCOUNT_DOCTYPE = 'io.cozy.accounts'

/**
 * @typedef {object} Assistant
 * @property {string} name - Name of the assistant
 * @property {string} prompt - Prompt for the assistant
 * @property {string} [icon] - Optional icon for the assistant
 * @property {string} model - Model identifier
 * @property {string} baseUrl - Provider's base URL
 * @property {string} [apiKey] - API key for authentication
 * @property {string} providerId - ID of the provider
 * @property {string} [providerName] - Display name of the provider, used to
 * name the account. Defaults to the provider id.
 */

/**
 * Builds the io.cozy.accounts document backing an assistant.
 *
 * The account label is derived from `auth[identifier]`, falling back to
 * `auth.login` — which holds the model. `identifier` points at `accountName`
 * so the account is labelled after its provider instead.
 *
 * @param {Assistant} assistantData - Data for the assistant
 * @param {object} [provider] - Existing provider account to update
 * @returns {object} The io.cozy.accounts document to save
 */
const buildProviderAccount = (assistantData, provider) => {
  const { password, ...auth } = provider?.auth || {}
  const { baseUrl, ...data } = provider?.data || {}

  // No new key means keeping the one the stack holds in `credentials_encrypted`.
  const apiKey =
    assistantData.apiKey || (assistantData.baseUrl ? password : undefined)

  return {
    ...provider,
    _type: ACCOUNT_DOCTYPE,
    account_type: assistantData.providerId,
    identifier: 'accountName',
    auth: {
      ...auth,
      login: assistantData.model,
      accountName: assistantData.providerName || assistantData.providerId,
      ...(apiKey ? { password: apiKey } : {})
    },
    data: {
      ...data,
      ...(assistantData.baseUrl ? { baseUrl: assistantData.baseUrl } : {})
    }
  }
}

/**
 * Creates a new assistant with the provided data.
 *
 * @param {CozyClient} client - An instance of CozyClient
 * @param {Assistant} assistantData - Data for the new assistant
 * @returns {Promise<Assistant>} - A promise that resolves with the created assistant document
 * @throws {Error} - Throws an error if the creation fails
 */
export const createAssistant = async (client, assistantData) => {
  let createdAccountId = null
  try {
    const account = buildProviderAccount(assistantData)
    const response = await client.save(account)

    if (!response.data || !response.data._id) {
      throw new Error('Failed to create account for assistant')
    }
    createdAccountId = response.data._id

    const assistant = {
      _type: ASSISTANT_DOCTYPE,
      name: assistantData.name,
      prompt: assistantData.prompt,
      icon: assistantData.icon || null,
      relationships: {
        provider: {
          data: {
            _type: ACCOUNT_DOCTYPE,
            _id: createdAccountId,
            metadata: {
              providerId: assistantData.providerId
            }
          }
        }
      }
    }
    const { data: savedAssistant } = await client.save(assistant)
    return savedAssistant
  } catch (error) {
    // Cleanup orphaned account if it was created
    if (createdAccountId) {
      try {
        await client.stackClient
          .collection('io.cozy.accounts')
          .destroy({ _id: createdAccountId })
      } catch (cleanupError) {
        logger.warn('Failed to cleanup orphaned account:', cleanupError)
      }
    }
    throw new Error(`Failed to create assistant: ${error.message}`)
  }
}

/**
 * Deletes an assistant by its ID.
 *
 * @param {CozyClient} client - An instance of CozyClient
 * @param {string} assistantId - The ID of the assistant to delete
 * @returns {Promise<void>} - A promise that resolves when the assistant is deleted
 * @throws {Error} - Throws an error if the deletion fails
 */
export const deleteAssistant = async (client, assistantId) => {
  try {
    const { data: assistantDoc, included } = await client.query(
      Q(ASSISTANT_DOCTYPE)
        .getById(assistantId)
        .include(['provider'])
    )
    await client.destroy(assistantDoc)

    const provider = included?.[0]
    if (provider) {
      await client.destroy(provider)
    }
  } catch (error) {
    throw new Error(`Failed to delete assistant: ${error.message}`)
  }
}

/**
 * Edit assistant with the provided data.
 *
 * @param {CozyClient} client - An instance of CozyClient
 * @param {string} assistantId - ID of existed assistant
 * @param {Assistant} assistantData - Data for the editted assistant
 * @returns {Promise<void>} - A promise that resolves when the assistant is edited
 * @throws {Error} - Throws an error if the edition fails
 */
export const editAssistant = async (client, assistantId, assistantData) => {
  try {
    const existedAssistant = await client.query(
      Q(ASSISTANT_DOCTYPE)
        .getById(assistantId)
        .include(['provider'])
    )

    if (!existedAssistant) {
      throw new Error('Assistant not found')
    }

    const existedAssistantData = existedAssistant.data
    const provider = existedAssistant?.included?.[0]

    if (!provider) {
      throw new Error('Provider account not found for assistant')
    }

    const account = buildProviderAccount(assistantData, provider)
    const response = await client.save(account)

    if (!response.data || !response.data._id) {
      throw new Error('Failed to edit account for assistant')
    }

    const assistant = {
      ...existedAssistantData,
      name: assistantData.name,
      prompt: assistantData.prompt,
      icon: assistantData.icon || null,
      relationships: {
        provider: {
          data: {
            ...(existedAssistantData?.relationships?.provider?.data || {}),
            metadata: {
              ...(existedAssistantData?.relationships?.provider?.data
                ?.metadata || {}),
              providerId: assistantData.providerId
            }
          }
        }
      }
    }
    await client.save(assistant)
  } catch (error) {
    throw new Error(`Failed to edit assistant: ${error.message}`)
  }
}
