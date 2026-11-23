import { hasExtensionInstalledAttribute } from './bitwarden'
import { isMagicLink, isOIDC } from './capability'
import { hasPasswordDefinedAttribute } from './instance'

/**
 * Checks whether the user has a password
 *
 * @param {import("../CozyClient").default} client - The CozyClient instance
 * @returns {Promise<boolean>} - Returns true if the user has a password
 */
export const hasPassword = async client => {
  const hasExtensionInstalled = await hasExtensionInstalledAttribute(client)
  const hasPasswordDefined = await hasPasswordDefinedAttribute(client)
  return (
    !(isMagicLink(client) || isOIDC(client)) ||
    hasExtensionInstalled ||
    hasPasswordDefined
  )
}
