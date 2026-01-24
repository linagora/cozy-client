import CozyClient from '../CozyClient'
import { Q } from '../queries/dsl'
import logger from '../logger'

/**
 * Creates a new assistant with the provided data.
 *
 * @param {CozyClient} client - An instance of CozyClient
 * @param {object} assistantData - Data for the new assistant
 * @param {string} assistantData.name - Name of the assistant
 * @param {string} assistantData.prompt - Prompt for the assistant
 * @param {string} [assistantData.icon] - Optional icon for the assistant
 * @param {boolean} assistantData.isCustomModel - Indicates if it's a custom model
 * @param {string} assistantData.model - Model identifier
 * @param {string} assistantData.baseUrl - Provider's base URL
 * @param {string} assistantData.apiKey - API key for authentication
 * @returns {Promise<void>} - A promise that resolves when the assistant is created
 * @throws {Error} - Throws an error if the creation fails
 */
export const createAssistant = async (client, assistantData) => {
  let createdAccountId = null
  try {
    const account = {
      _type: 'io.cozy.accounts',
      auth: {
        login: assistantData.model,
        password: assistantData.apiKey
      },
      data: {
        baseUrl: assistantData.baseUrl
      }
    }
    const response = await client.save(account)

    if (!response.data || !response.data._id) {
      throw new Error('Failed to create account for assistant')
    }
    createdAccountId = response.data._id

    const assistant = {
      _type: 'io.cozy.ai.chat.assistants',
      name: assistantData.name,
      prompt: assistantData.prompt,
      icon: assistantData.icon || null,
      isCustomModel: assistantData.isCustomModel,
      relationships: {
        provider: {
          data: {
            _type: 'io.cozy.accounts',
            _id: createdAccountId
          }
        }
      }
    }
    await client.save(assistant)
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
    const existedAssistant = await client.query(
      Q('io.cozy.ai.chat.assistants')
        .getById(assistantId)
        .include(['provider'])
    )

    const assistantInstance = existedAssistant.data
    const provider = existedAssistant.included?.[0]

    await client.stackClient
      .collection('io.cozy.ai.chat.assistants')
      .destroy({ _id: assistantId, _rev: assistantInstance._rev })

    if (provider?._id && provider?._rev) {
      await client.stackClient
        .collection('io.cozy.accounts')
        .destroy({ _id: provider._id, _rev: provider._rev })
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
 * @param {object} assistantData - Data for the new assistant
 * @param {string} assistantData.name - Name of the assistant
 * @param {string} assistantData.prompt - Prompt for the assistant
 * @param {string} [assistantData.icon] - Optional icon for the assistant
 * @param {boolean} assistantData.isCustomModel - Indicates if it's a custom model
 * @param {string} assistantData.model - Model identifier
 * @param {string} assistantData.baseUrl - Provider's base URL
 * @param {string} [assistantData.apiKey] - API key for authentication
 * @returns {Promise<void>} - A promise that resolves when the assistant is edited
 * @throws {Error} - Throws an error if the edition fails
 */
export const editAssistant = async (client, assistantId, assistantData) => {
  try {
    const existedAssistant = await client.query(
      Q('io.cozy.ai.chat.assistants')
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
      data: {
        ...(provider.data || {}),
        baseUrl: assistantData.baseUrl
      }
    }
    if (assistantData.apiKey) {
      account.auth.password = assistantData.apiKey
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
      isCustomModel: assistantData.isCustomModel
    }
    await client.save(assistant)
  } catch (error) {
    throw new Error(`Failed to edit assistant: ${error.message}`)
  }
}
