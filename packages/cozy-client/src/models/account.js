// @ts-check
import merge from 'lodash/merge'

import { getHasManyItem, updateHasManyItem } from '../associations/HasMany'
import { Q } from '../queries/dsl'
import { legacyLoginFields, getIdentifier } from './manifest'

/**
 * getMutedErrors - Returns the list of errors that have been muted for the given account
 *
 * @param {import('../types').IOCozyAccount} account io.cozy.accounts
 *
 * @returns {Array} An array of errors with a `type` and `mutedAt` field
 */
export const getMutedErrors = account => account?.mutedErrors || []

/**
 * muteError - Adds an error to the list of muted errors for the given account
 *
 * @param {import('../types').IOCozyAccount} account   io.cozy.accounts
 * @param {string} errorType The type of the error to mute
 *
 * @returns {import('../types').IOCozyAccount} An updated io.cozy.accounts
 */
export const muteError = (account, errorType) => {
  const mutedErrors = getMutedErrors(account)
  mutedErrors.push({
    type: errorType,
    mutedAt: new Date().toISOString()
  })

  return { ...account, mutedErrors }
}

const DEFAULT_CONTRACT_SYNC_STATUS = true

/**
 * Returns whether a contract is synced from account relationship
 *
 * @param  {import('../types').IOCozyAccount} account - Cozy account
 * @param  {String} contractId - contract identifier
 * @returns  {Boolean} synchronisation status
 */
export const getContractSyncStatusFromAccount = (account, contractId) => {
  const relItem = getHasManyItem(account, 'contracts', contractId)
  if (!relItem) {
    throw new Error(`Cannot find contrat ${contractId} in account`)
  }
  return relItem?.metadata?.imported ?? DEFAULT_CONTRACT_SYNC_STATUS
}

/**
 * Sets contract sync status into account relationship
 *
 * @param  {import('../types').IOCozyAccount} account - Cozy account
 * @param  {String} contractId - contract identifier
 * @param  {String} syncStatus - synchronisation status
 * @returns {import('../types').IOCozyAccount}
 */
export const setContractSyncStatusInAccount = (
  account,
  contractId,
  syncStatus
) => {
  return updateHasManyItem(account, 'contracts', contractId, contractRel => {
    if (contractRel === undefined) {
      throw new Error(`Cannot find contrat ${contractId} in account`)
    }
    return merge({}, contractRel, { metadata: { imported: syncStatus } })
  })
}

/**
 * Get the account login field value from a given account
 *
 * @param {import('../types').IOCozyAccount} account - the given cozy account
 * @returns {String|null} - Account login
 */
export const getAccountLogin = account => {
  if (account.identifier) {
    return account.auth[account.identifier]
  }
  if (account && account.auth) {
    for (const fieldName of legacyLoginFields) {
      if (account.auth[fieldName]) return account.auth[fieldName]
    }
  }
  return null
}

/**
 * Get the account name from a given account
 *
 * @param {import('../types').IOCozyAccount} account - the given cozy account
 * @returns {String|null} - Account name
 */
export const getAccountName = account => {
  if (!account) return null
  if (account.auth) {
    return account.auth.accountName || getAccountLogin(account) || account._id
  } else {
    return account._id
  }
}

/**
 * Transforms account auth data to io.cozy.accounts document
 *
 * @param  {import('../types').IOCozyKonnector} konnector Konnector related to account
 * @param  {object} authData  Authentication data
 * @returns {import('../types').IOCozyAccount}          io.cozy.accounts attributes
 */
export const buildAccount = (konnector, authData) => {
  return {
    auth: authData,
    account_type: konnector.slug,
    identifier: getIdentifier(konnector.fields),
    state: null
  }
}

/**
 * Look if the given account has an associated trigger or not.
 *
 * @param {import('../CozyClient').default} client - CozyClient instance
 * @param {import('../types').IOCozyAccount} account - account document
 * @returns {Promise<Boolean>}
 */
export const isAccountWithTrigger = async (client, account) => {
  const result = await client.query(
    Q('io.cozy.triggers')
      .where({
        'message.account': account._id
      })
      .indexFields(['message.account'])
      .limitBy(1)
  )
  return result.data.length > 0
}
