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
 */

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
    const account = {
      _type: ACCOUNT_DOCTYPE,
      auth: {
        login: assistantData.model
      },
      account_type: assistantData.providerId
    }

    if (assistantData.baseUrl) {
      account.data = {
        baseUrl: assistantData.baseUrl
      }
    }

    if (assistantData.apiKey) {
      account.auth.password = assistantData.apiKey
    }
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

    const account = {
      ...provider,
      auth: {
        ...(provider.auth || {}),
        login: assistantData.model
      },
      account_type: assistantData.providerId,
      data: {
        ...(provider.data || {})
      }
    }

    if (assistantData.baseUrl) {
      account.data.baseUrl = assistantData.baseUrl
    } else {
      delete account.data?.baseUrl
    }

    // Only update the password if a new API key is explicitly provided
    if (assistantData.apiKey) {
      account.auth.password = assistantData.apiKey
    } else if (!assistantData.baseUrl) {
      delete account.auth?.password
    }
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
