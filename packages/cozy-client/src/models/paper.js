import add from 'date-fns/add'
import sub from 'date-fns/sub'
import formatDistanceToNowStrict from 'date-fns/formatDistanceToNowStrict'
import fr from 'date-fns/locale/fr'
import es from 'date-fns/locale/es'
import de from 'date-fns/locale/de'
import it from 'date-fns/locale/it'
import ru from 'date-fns/locale/ru'
import vi from 'date-fns/locale/vi'
import { getLocalizer as localizerDocument } from './document/locales'
import { getLocalizer as localizerCountry } from './country/locales'
import { getDisplayName } from './contact'
import get from 'lodash/get'
import { isValidCountryCodeTranslation } from './country/countries'

const DATE_FNS_LOCALES = { fr, es, de, it, ru, vi }

/**
 * @typedef {import("../types").IOCozyFile} IOCozyFile
 */

const PERSONAL_SPORTING_LICENCE_PERIOD_DAYS = 365
const PERSONAL_SPORTING_LICENCE_NOTICE_PERIOD_DAYS = 15
const EXPIRATION_LINK_BY_LABEL = {
  national_id_card: 'https://www.service-public.fr/particuliers/vosdroits/N358',
  residence_permit: 'https://www.service-public.fr/particuliers/vosdroits/N110',
  passport: 'https://www.service-public.fr/particuliers/vosdroits/N360',
  driver_license:
    'https://permisdeconduire.ants.gouv.fr/demarches-en-ligne/perte-vol-deterioration-fin-de-validite-ou-changement-d-etat-civil'
}

export const KNOWN_DATE_METADATA_NAMES = [
  'AObtentionDate',
  'BObtentionDate',
  'CObtentionDate',
  'DObtentionDate',
  'obtentionDate',
  'expirationDate',
  'referencedDate',
  'issueDate',
  'shootingDate',
  'date',
  'datetime'
]
export const KNOWN_INFORMATION_METADATA_NAMES = [
  'number',
  'bicNumber',
  'country',
  'refTaxIncome',
  'contractType',
  'netSocialAmount',
  'employerName',
  'vehicle.licenseNumber',
  'vehicle.confidentialNumber',
  'noticePeriod'
]
export const KNOWN_OTHER_METADATA_NAMES = ['contact', 'page', 'qualification']
export const KNOWN_BILLS_ATTRIBUTES_NAMES = ['amount', 'subtype', 'employer']

/**
 * @param {IOCozyFile} file - io.cozy.files document
 * @returns {boolean}
 * @description Tells if a given file is a national id card, is French, has an expiration date set and has a notice period set
 */
const isExpiringFrenchNationalIdCard = file => {
  const label = file.metadata?.qualification?.label
  const country = file.metadata?.country
  const expirationDate = file.metadata?.expirationDate
  const noticePeriod = file.metadata?.noticePeriod
  if (
    label === 'national_id_card' &&
    (!country || country === 'fr') &&
    expirationDate &&
    noticePeriod
  ) {
    return true
  }
  return false
}

/**
 * @param {IOCozyFile} file - io.cozy.files document
 * @returns {boolean}
 * @description Tells if a given file has an expiration date set and a notice period set
 */
const isExpiringGeneric = file => {
  const expirationDate = file.metadata?.expirationDate
  const noticePeriod = file.metadata?.noticePeriod
  if (expirationDate && noticePeriod) {
    return true
  }
  return false
}

/**
 * @param {IOCozyFile} file - io.cozy.files document
 * @returns {boolean}
 * @description Tells if a given file is a sporting license, has a reference date set or a creation date if not
 */
const isExpiringPersonalSportingLicense = file => {
  const label = file.metadata?.qualification?.label
  const referencedDate = file.metadata?.referencedDate
  const created_at = file.created_at
  if (label === 'personal_sporting_licence' && (referencedDate || created_at)) {
    return true
  }
  return false
}

/**
 * @param {IOCozyFile} file - io.cozy.files document
 * @returns {boolean}
 * @description Tells if a given file matches one of the known types of expiring papers
 */
export const isExpiring = file => {
  if (isExpiringFrenchNationalIdCard(file)) {
    return true
  }
  if (isExpiringGeneric(file)) {
    return true
  }
  if (isExpiringPersonalSportingLicense(file)) {
    return true
  }
  return false
}

/**
 * @param {IOCozyFile} file - io.cozy.files document
 * @returns {Date | null} Expiration date
 * @description Computes et returns the expiration date of the given file, or null if it is not expiring
 */
export const computeExpirationDate = file => {
  if (isExpiringFrenchNationalIdCard(file) || isExpiringGeneric(file)) {
    const expirationDate = file.metadata?.expirationDate
    return new Date(expirationDate)
  }
  if (isExpiringPersonalSportingLicense(file)) {
    const referencedDate = file.metadata?.referencedDate
    const created_at = file.created_at
    return add(new Date(referencedDate ?? created_at), {
      days: PERSONAL_SPORTING_LICENCE_PERIOD_DAYS
    })
  }
  return null
}

/**
 * @param {IOCozyFile} file - io.cozy.files document
 * @returns {number | null} Expiration notice period in days
 * @description Computes et returns the expiration notice period of the given file, or null if it is not expiring
 */
const computeExpirationNoticePeriodInDays = file => {
  if (isExpiringFrenchNationalIdCard(file) || isExpiringGeneric(file)) {
    const noticePeriodInDays = file.metadata?.noticePeriod
    return parseInt(noticePeriodInDays, 10)
  }
  if (isExpiringPersonalSportingLicense(file)) {
    return PERSONAL_SPORTING_LICENCE_NOTICE_PERIOD_DAYS
  }
  return null
}

/**
 * @param {IOCozyFile} file - io.cozy.files document
 * @returns {Date | null} Expiration notice date
 * @description Computes et returns the expiration notice date of the given file, or null if it is not expiring
 */
export const computeExpirationNoticeDate = file => {
  const expirationDate = computeExpirationDate(file)
  if (expirationDate == null) {
    return null
  }
  const noticePeriodInDays = computeExpirationNoticePeriodInDays(file)
  if (noticePeriodInDays == null) {
    return null
  }
  return sub(expirationDate, {
    days: noticePeriodInDays
  })
}

/**
 * @param {IOCozyFile} file - io.cozy.files document
 * @returns {string | null} Expiration notice link
 * @description Computes and returns the expiration notice link of the given file, or null if it has none
 */
export const computeExpirationNoticeLink = file => {
  const qualificationLabel = file.metadata?.qualification?.label
  if (!qualificationLabel) return null

  return EXPIRATION_LINK_BY_LABEL[qualificationLabel] || null
}

/**
 * @param {IOCozyFile} file - io.cozy.files document
 * @returns {boolean}
 * @description Tells if the given file is expiring and if today is after its expiration date
 */
export const isExpired = file => {
  const now = new Date()
  const expirationDate = computeExpirationDate(file)
  const isExpired = expirationDate != null && expirationDate <= now
  return isExpired
}

/**
 * @param {IOCozyFile} file - io.cozy.files document
 * @returns {boolean}
 * @description Tells if the given file is expiring and if today is between its expiration notice date and its expiration date
 */
export const isExpiringSoon = file => {
  const now = new Date()
  const expirationDate = computeExpirationDate(file)
  const expirationNoticeDate = computeExpirationNoticeDate(file)
  const isExpiringSoon =
    expirationDate != null &&
    expirationNoticeDate != null &&
    expirationNoticeDate <= now &&
    now < expirationDate
  return isExpiringSoon
}

/**
 * @param {Object} params -
 * @param {Object} params.metadata - An io.cozy.files metadata object
 * @param {string} params.knownMetadataPath - Path of the metadata
 * @param {string | null} [params.value] - Value of the metadata
 * @returns {{ name: string, value: string | null }} displayable metadata
 */
export const makeMetadataQualification = ({
  metadata,
  knownMetadataPath,
  value
}) => {
  const _value = value || get(metadata, knownMetadataPath, null) || null
  const shouldReturnThisMetadata = Object.keys(metadata).some(val =>
    knownMetadataPath.startsWith(val)
  )

  if (shouldReturnThisMetadata || knownMetadataPath === 'contact') {
    return {
      name: knownMetadataPath,
      value: _value
    }
  }

  return null
}

/**
 * @param {Object} metadata - An io.cozy.files metadata object
 * @returns {{ name: string, value: string | null }[]} Array of displayable metadata
 * @description Select and format displayable metadata of a paper
 */
export const formatMetadataQualification = metadata => {
  const dates = KNOWN_DATE_METADATA_NAMES.map(dateName =>
    makeMetadataQualification({ metadata, knownMetadataPath: dateName })
  )
    .filter(Boolean)
    .filter((data, _, arr) => {
      if (arr.length > 1) return data.name !== 'datetime'
      return data
    })

  const informations = KNOWN_INFORMATION_METADATA_NAMES.map(infoName =>
    makeMetadataQualification({ metadata, knownMetadataPath: infoName })
  ).filter(Boolean)

  const others = KNOWN_OTHER_METADATA_NAMES.map(otherName => {
    const value =
      otherName === 'qualification'
        ? metadata[otherName]?.label
        : metadata[otherName]

    return makeMetadataQualification({
      metadata,
      knownMetadataPath: otherName,
      value
    })
  }).filter(Boolean)

  return [...dates, ...informations, ...others]
}

/**
 * @typedef {('date' | 'information' | 'contact' | 'other' | 'bills')} MetadataQualificationType
 */

/**
 * @param {string} metadataName - A metadata name
 * @returns {MetadataQualificationType | null} The type of the metadata
 * @description Returns the type of the metatada from a metadata name
 */
export const getMetadataQualificationType = metadataName => {
  if (KNOWN_DATE_METADATA_NAMES.includes(metadataName)) {
    return 'date'
  }

  if (KNOWN_INFORMATION_METADATA_NAMES.includes(metadataName)) {
    return 'information'
  }

  if (KNOWN_OTHER_METADATA_NAMES.includes(metadataName)) {
    if (metadataName === 'contact') {
      return 'contact'
    }
    return 'other'
  }

  if (KNOWN_BILLS_ATTRIBUTES_NAMES.includes(metadataName)) {
    return 'bills'
  }

  return null
}

/**
 * @param {string} name - The name of a metadata of type date like 'expirationDate' or 'shootingDate'
 * @param {Object} options - Options
 * @param {string} options.lang - Lang requested for the translation like 'fr' or 'en'
 * @returns {string} Translated name for the metadata
 */
export const getTranslatedNameForDateMetadata = (name, { lang }) => {
  const t = localizerDocument(lang)

  return t(`Scan.qualification.date.title.${name}`)
}

/**
 * @param {string} value - The value of a metadata of type date
 * @param {Object} options - Options
 * @param {string} options.lang - Lang requested for the translation
 * @param {function} options.f - Date formatting function
 * @returns {string} Formatted and translated value for the metadata
 */
export const formatDateMetadataValue = (value, { lang, f }) => {
  const t = localizerDocument(lang)

  if (value) {
    if (lang === 'en') {
      return f(value, 'LL/dd/yyyy')
    }
    return f(value, 'dd/LL/yyyy')
  } else {
    return t('Scan.qualification.noInfo')
  }
}

/**
 * @param {string} name - The name of a metadata of type information like 'national_id_card' or 'fine'
 * @param {Object} options - Options
 * @param {string} options.lang - Lang requested for the translation
 * @param {string} options.qualificationLabel - The qualification label of the metadata
 * @returns {string} Translated name for the metadata
 */
export const getTranslatedNameForInformationMetadata = (
  name,
  { lang, qualificationLabel }
) => {
  const t = localizerDocument(lang)

  if (name === 'number') {
    return t(
      `Scan.qualification.information.title.${qualificationLabel}.${name}`
    )
  } else {
    return t(`Scan.qualification.information.title.${name}`)
  }
}

/**
 * @param {string} value - The value of a metadata of type information
 * @param {Object} options - Options
 * @param {string} options.lang - Lang requested for the translation
 * @param {string} options.name - The name of the metadata
 * @param {string} options.qualificationLabel - The qualification label of the metadata
 * @returns {string} Formatted and translated value for the metadata
 */
export const formatInformationMetadataValue = (
  value,
  { lang, name, qualificationLabel }
) => {
  const tDoc = localizerDocument(lang)
  const { t: tCountry } = localizerCountry(lang)

  if (typeof value !== 'number' && !value) {
    return tDoc('Scan.qualification.noInfo')
  }

  if (name === 'noticePeriod') {
    return `${value} ${tDoc('Scan.qualification.information.day', {
      smart_count: value
    })}`
  }
  if (name === 'contractType') {
    return tDoc(`Scan.attributes.contractType.${value}`, { _: value })
  }
  if (
    name === 'refTaxIncome' ||
    name === 'netSocialAmount' ||
    name === 'amount' ||
    (name === 'number' && qualificationLabel === 'pay_sheet')
  ) {
    return `${value} €`
  }

  if (name === 'country' && isValidCountryCodeTranslation(lang, value)) {
    return tCountry(`countries.${value}`)
  }

  return value
}

/**
 * @param {string} name - The name of a metadata of type other like 'page' or 'qualification'
 * @param {Object} options - Options
 * @param {string} options.lang - Lang requested for the translation
 * @returns {string} Translated name for the metadata
 */
export const getTranslatedNameForOtherMetadata = (name, { lang }) => {
  const t = localizerDocument(lang)

  return t(`Scan.qualification.${name}`)
}

/**
 * @param {string} value - The value of a metadata of type other
 * @param {Object} options - Options
 * @param {string} options.lang - Lang requested for the translation
 * @param {string} options.name - The name of the metadata
 * @returns {string} Formatted and translated value for the metadata
 */
export const formatOtherMetadataValue = (value, { lang, name }) => {
  const t = localizerDocument(lang)

  if (name === 'qualification') {
    return t(`Scan.items.${value}`, { smart_count: 1 })
  } else {
    return t(`Scan.qualification.${value}`)
  }
}

/**
 * @param {Object} options - Options
 * @param {string} options.lang - Lang requested for the translation
 * @returns {string} Translated name for contact
 */
export const getTranslatedNameForContact = ({ lang }) => {
  const t = localizerDocument(lang)

  return t('Scan.qualification.contact')
}

/**
 * @param {object[]} contacts - An array of contact
 * @returns {string} Formatted and translated value of an array of contact
 */
export const formatContactValue = contacts => {
  return contacts && contacts.length > 0
    ? contacts.map(contact => `${getDisplayName(contact)}`).join(', ')
    : ''
}

/**
 * @param {Object} options - Options
 * @param {string} options.lang - Lang requested for the translation
 * @returns {string}
 */
export const makeExpiredMessage = ({ lang }) => {
  const t = localizerDocument(lang)

  return t('Scan.expiration.expired')
}

/**
 * @param {string} expirationDate - Expiration date
 * @param {Object} options - Options
 * @param {string} options.lang - Lang requested for the translation
 * @returns {string}
 */
export const makeExpiresInMessage = (expirationDate, { lang }) => {
  const t = localizerDocument(lang)

  const distance = formatDistanceToNowStrict(new Date(expirationDate), {
    locale: DATE_FNS_LOCALES[lang] // fallbacks to english if undefined
  })

  return t('Scan.expiration.expiresIn', { duration: distance })
}

/**
 * @param {string} expirationDate - Expiration date
 * @param {Object} options - Options
 * @param {string} options.lang - Lang requested for the translation
 * @returns {string}
 */
export const makeExpirationDescription = (expirationDate, { lang }) => {
  const t = localizerDocument(lang)

  const distance = formatDistanceToNowStrict(new Date(expirationDate), {
    locale: DATE_FNS_LOCALES[lang] // fallbacks to english if undefined
  })

  return t('Scan.expiration.description', { duration: distance })
}

/**
 * @param {IOCozyFile} file - io.cozy.files document
 * @returns {boolean}
 */
export const isForeignPaper = file => {
  if (file.metadata?.country) {
    return file.metadata.country.toLowerCase() !== 'fr'
  }
  return false
}
