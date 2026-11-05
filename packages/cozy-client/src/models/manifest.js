// @ts-check
import _flow from 'lodash/flow'
import _cloneDeep from 'lodash/cloneDeep'
import findKey from 'lodash/findKey'

export const ROLE_IDENTIFIER = 'identifier'

/**
 * Legacy login fields declared by some konnectors
 */
export const legacyLoginFields = [
  'login',
  'identifier',
  'new_identifier',
  'email'
]

const legacyEncryptedFields = [
  'secret',
  'dob',
  'code',
  'answer',
  'access_token',
  'refresh_token',
  'appSecret'
]

const APP_CATEGORIES = [
  'banking',
  'cozy',
  'energy',
  'health',
  'host_provider',
  'insurance',
  'isp',
  'mes_infos',
  'online_services',
  'others',
  'partners',
  'press',
  'productivity',
  'ptnb',
  'public_service',
  'shopping',
  'social',
  'telecom',
  'transport'
]

/**
 * Filters unauthorized categories. Defaults to ['others'] if no suitable category.
 *
 * @param {Array<Object>} categories - Array of categories
 * @returns {Array<Object>} sanitized categories
 */
export function sanitizeCategories(categories) {
  if (!categories) return ['others']
  const filteredList = categories.filter(c => APP_CATEGORIES.includes(c))
  if (!filteredList.length) return ['others']
  return filteredList
}

export function areTermsValid(terms) {
  return Boolean(terms && terms.id && terms.url && terms.version)
}

export function isPartnershipValid(partnership) {
  return Boolean(partnership && partnership.description)
}

/**
 * Normalize app manifest, retro-compatibility for old manifests
 *
 * @param  {import('../types').Manifest} manifest - app manifest to normalize
 * @returns {import('../types').SanitizedManifest}
 */
export function sanitize(manifest) {
  const sanitized = { ...manifest }

  // Make categories an array and delete category attribute if it exists
  if (
    !manifest.categories &&
    manifest.category &&
    typeof manifest.category === 'string'
  ) {
    sanitized.categories = [manifest.category]
    delete sanitized.category
  }

  sanitized.categories = sanitizeCategories(sanitized.categories)

  // manifest name is not an object
  if (typeof manifest.name === 'object') sanitized.name = manifest.name.en

  // Fix camelCase from cozy-stack
  if (manifest.available_version) {
    sanitized.availableVersion = manifest.available_version
    delete sanitized.available_version
  }

  // Fix camelCase from cozy-stack
  if (manifest.latest_version) {
    sanitized.latestVersion = manifest.latest_version
    delete sanitized.latest_version
  }

  // Remove invalid terms
  if (sanitized.terms && !areTermsValid(sanitized.terms)) {
    delete sanitized.terms
  }

  // Remove invalid partnership
  if (sanitized.partnership && !isPartnershipValid(sanitized.partnership)) {
    delete sanitized.partnership
  }

  if (sanitized.fields) {
    sanitized.fields = sanitizeFields(manifest.fields)
  }

  return sanitized
}

/**
 * Ensures that fields has at least one field with the role 'identifier'
 *
 * @param  {import('../types').ManifestFields} fields - Manifest fields
 * @returns {import('../types').ManifestFields} - Sanitized manifest fields
 */
export const sanitizeIdentifier = fields => {
  const sanitized = _cloneDeep(fields)
  let hasIdentifier = false
  for (let fieldName in sanitized)
    if (sanitized[fieldName].role === ROLE_IDENTIFIER) {
      if (hasIdentifier) delete sanitized[fieldName].role
      else hasIdentifier = true
    }
  if (hasIdentifier) return sanitized

  for (let name of legacyLoginFields)
    if (sanitized[name]) {
      sanitized[name].role = ROLE_IDENTIFIER
      return sanitized
    }

  for (let fieldName in sanitized)
    if (sanitized[fieldName].type !== 'password') {
      sanitized[fieldName].role = ROLE_IDENTIFIER
      return sanitized
    }

  return sanitized
}

/**
 * Returns the key for the field having the role=identifier attribute
 *
 * @param  {import('../types').ManifestFields} fields Konnector fields
 * @returns {String|null}  The key for the identifier field, example 'login'
 */
export const getIdentifier = (fields = {}) =>
  findKey(
    sanitizeIdentifier(fields),
    field => field.role === ROLE_IDENTIFIER
  ) || null
/**
 * Ensures old fields are removed
 *
 * @param  {Object} fields Manifest fields
 * @returns {Object}        Sanitized manifest fields
 */
const removeOldFields = fields => {
  const sanitized = _cloneDeep(fields)
  delete sanitized.advancedFields
  return sanitized
}

/**
 * Ensures every field not explicitely tagged as not required is required
 *
 * @param  {import('../types').ManifestFields} [fields={}] Manifest fields
 * @returns {import('../types').ManifestFields}            Sanitized manifest fields
 */
const sanitizeRequired = fields => {
  const sanitized = _cloneDeep(fields)
  for (let fieldName in sanitized) {
    const field = sanitized[fieldName]
    // Ensure legacy for field isRequired
    const required =
      typeof field.required === 'undefined' ? field.isRequired : field.required
    sanitized[fieldName].required =
      typeof required === 'boolean' ? required : true
  }

  return sanitized
}

/**
 * Ensures:
 * * any field flagged as encrypted keeps its flag
 * * any legacy encrypted field is tagged as encrypted
 *
 * @param  {import('../types').ManifestFields} [fields={}] Manifest fields
 * @returns {import('../types').ManifestFields}             Sanitized Manifest fields
 */
const sanitizeEncrypted = fields => {
  const sanitized = _cloneDeep(fields)
  for (let fieldName in sanitized) {
    const field = sanitized[fieldName]
    if (typeof field.encrypted !== 'boolean')
      field.encrypted =
        field.type === 'password' || legacyEncryptedFields.includes(fieldName)
  }
  return sanitized
}

/**
 * Sanitizes manifest fields with multiple rules
 *
 * @param  {import('../types').ManifestFields} [fields={}] Manifest fields
 * @returns {import('../types').ManifestFields}            Sanitized manifest fields
 */
const sanitizeFields = _flow([
  removeOldFields,
  sanitizeIdentifier,
  sanitizeRequired,
  sanitizeEncrypted
])
