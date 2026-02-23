// https://gist.github.com/incredimike/1469814

import { getLocalizer } from './locales'
import logger from '../../logger'

/**
 * List of countries with their ISO codes
 *
 * @constant
 * @type {import('../../types').CountryISO[]}
 */
export const COUNTRIES_ISO = [
  { code2: 'AF', code3: 'AFG', number: '004' },
  { code2: 'AL', code3: 'ALB', number: '008' },
  { code2: 'DZ', code3: 'DZA', number: '012' },
  { code2: 'AD', code3: 'AND', number: '020' },
  { code2: 'AO', code3: 'AGO', number: '024' },
  { code2: 'AG', code3: 'ATG', number: '028' },
  { code2: 'AR', code3: 'ARG', number: '032' },
  { code2: 'AM', code3: 'ARM', number: '051' },
  { code2: 'AW', code3: 'ABW', number: '297' },
  { code2: 'AU', code3: 'AUS', number: '036' },
  { code2: 'AT', code3: 'AUT', number: '040' },
  { code2: 'AZ', code3: 'AZE', number: '031' },
  { code2: 'BS', code3: 'BHS', number: '044' },
  { code2: 'BH', code3: 'BHR', number: '048' },
  { code2: 'BD', code3: 'BGD', number: '050' },
  { code2: 'BB', code3: 'BRB', number: '052' },
  { code2: 'BY', code3: 'BLR', number: '112' },
  { code2: 'BE', code3: 'BEL', number: '056' },
  { code2: 'BZ', code3: 'BLZ', number: '084' },
  { code2: 'BJ', code3: 'BEN', number: '204' },
  { code2: 'BM', code3: 'BMU', number: '060' },
  { code2: 'BT', code3: 'BTN', number: '064' },
  { code2: 'BO', code3: 'BOL', number: '068' },
  { code2: 'BQ', code3: 'BES', number: '535' },
  { code2: 'BA', code3: 'BIH', number: '070' },
  { code2: 'BW', code3: 'BWA', number: '072' },
  { code2: 'BV', code3: 'BVT', number: '074' },
  { code2: 'BR', code3: 'BRA', number: '076' },
  { code2: 'IO', code3: 'IOT', number: '086' },
  { code2: 'BN', code3: 'BRN', number: '096' },
  { code2: 'BG', code3: 'BGR', number: '100' },
  { code2: 'BF', code3: 'BFA', number: '854' },
  { code2: 'BI', code3: 'BDI', number: '108' },
  { code2: 'CV', code3: 'CPV', number: '132' },
  { code2: 'KH', code3: 'KHM', number: '116' },
  { code2: 'CM', code3: 'CMR', number: '120' },
  { code2: 'CA', code3: 'CAN', number: '124' },
  { code2: 'KY', code3: 'CYM', number: '136' },
  { code2: 'CF', code3: 'CAF', number: '140' },
  { code2: 'TD', code3: 'TCD', number: '148' },
  { code2: 'CL', code3: 'CHL', number: '152' },
  { code2: 'CN', code3: 'CHN', number: '156' },
  { code2: 'CX', code3: 'CXR', number: '162' },
  { code2: 'CC', code3: 'CCK', number: '166' },
  { code2: 'CO', code3: 'COL', number: '170' },
  { code2: 'KM', code3: 'COM', number: '174' },
  { code2: 'CD', code3: 'COD', number: '180' },
  { code2: 'CG', code3: 'COG', number: '178' },
  { code2: 'CK', code3: 'COK', number: '184' },
  { code2: 'CR', code3: 'CRI', number: '188' },
  { code2: 'HR', code3: 'HRV', number: '191' },
  { code2: 'CU', code3: 'CUB', number: '192' },
  { code2: 'CW', code3: 'CUW', number: '531' },
  { code2: 'CY', code3: 'CYP', number: '196' },
  { code2: 'CZ', code3: 'CZE', number: '203' },
  { code2: 'CI', code3: 'CIV', number: '384' },
  { code2: 'DK', code3: 'DNK', number: '208' },
  { code2: 'DJ', code3: 'DJI', number: '262' },
  { code2: 'DM', code3: 'DMA', number: '212' },
  { code2: 'DO', code3: 'DOM', number: '214' },
  { code2: 'EC', code3: 'ECU', number: '218' },
  { code2: 'EG', code3: 'EGY', number: '818' },
  { code2: 'SV', code3: 'SLV', number: '222' },
  { code2: 'GQ', code3: 'GNQ', number: '226' },
  { code2: 'ER', code3: 'ERI', number: '232' },
  { code2: 'EE', code3: 'EST', number: '233' },
  { code2: 'SZ', code3: 'SWZ', number: '748' },
  { code2: 'ET', code3: 'ETH', number: '231' },
  { code2: 'FK', code3: 'FLK', number: '238' },
  { code2: 'FO', code3: 'FRO', number: '234' },
  { code2: 'FJ', code3: 'FJI', number: '242' },
  { code2: 'FI', code3: 'FIN', number: '246' },
  { code2: 'FR', code3: 'FRA', number: '250' },
  { code2: 'GF', code3: 'GUF', number: '254' },
  { code2: 'PF', code3: 'PYF', number: '258' },
  { code2: 'TF', code3: 'ATF', number: '260' },
  { code2: 'GA', code3: 'GAB', number: '266' },
  { code2: 'GM', code3: 'GMB', number: '270' },
  { code2: 'GE', code3: 'GEO', number: '268' },
  { code2: 'DE', code3: 'DEU', number: '276' },
  { code2: 'GH', code3: 'GHA', number: '288' },
  { code2: 'GI', code3: 'GIB', number: '292' },
  { code2: 'GR', code3: 'GRC', number: '300' },
  { code2: 'GL', code3: 'GRL', number: '304' },
  { code2: 'GD', code3: 'GRD', number: '308' },
  { code2: 'GP', code3: 'GLP', number: '312' },
  { code2: 'GU', code3: 'GUM', number: '316' },
  { code2: 'GT', code3: 'GTM', number: '320' },
  { code2: 'GG', code3: 'GGY', number: '831' },
  { code2: 'GN', code3: 'GIN', number: '324' },
  { code2: 'GW', code3: 'GNB', number: '624' },
  { code2: 'GY', code3: 'GUY', number: '328' },
  { code2: 'HT', code3: 'HTI', number: '332' },
  { code2: 'HM', code3: 'HMD', number: '334' },
  { code2: 'VA', code3: 'VAT', number: '336' },
  { code2: 'HN', code3: 'HND', number: '340' },
  { code2: 'HK', code3: 'HKG', number: '344' },
  { code2: 'HU', code3: 'HUN', number: '348' },
  { code2: 'IS', code3: 'ISL', number: '352' },
  { code2: 'IN', code3: 'IND', number: '356' },
  { code2: 'ID', code3: 'IDN', number: '360' },
  { code2: 'IR', code3: 'IRN', number: '364' },
  { code2: 'IQ', code3: 'IRQ', number: '368' },
  { code2: 'IE', code3: 'IRL', number: '372' },
  { code2: 'IM', code3: 'IMN', number: '833' },
  { code2: 'IL', code3: 'ISR', number: '376' },
  { code2: 'IT', code3: 'ITA', number: '380' },
  { code2: 'JM', code3: 'JAM', number: '388' },
  { code2: 'JP', code3: 'JPN', number: '392' },
  { code2: 'JE', code3: 'JEY', number: '832' },
  { code2: 'JO', code3: 'JOR', number: '400' },
  { code2: 'KZ', code3: 'KAZ', number: '398' },
  { code2: 'KE', code3: 'KEN', number: '404' },
  { code2: 'KI', code3: 'KIR', number: '296' },
  { code2: 'KP', code3: 'PRK', number: '408' },
  { code2: 'KR', code3: 'KOR', number: '410' },
  { code2: 'KW', code3: 'KWT', number: '414' },
  { code2: 'KG', code3: 'KGZ', number: '417' },
  { code2: 'LA', code3: 'LAO', number: '418' },
  { code2: 'LV', code3: 'LVA', number: '428' },
  { code2: 'LB', code3: 'LBN', number: '422' },
  { code2: 'LS', code3: 'LSO', number: '426' },
  { code2: 'LR', code3: 'LBR', number: '430' },
  { code2: 'LY', code3: 'LBY', number: '434' },
  { code2: 'LI', code3: 'LIE', number: '438' },
  { code2: 'LT', code3: 'LTU', number: '440' },
  { code2: 'LU', code3: 'LUX', number: '442' },
  { code2: 'MO', code3: 'MAC', number: '446' },
  { code2: 'MG', code3: 'MDG', number: '450' },
  { code2: 'MW', code3: 'MWI', number: '454' },
  { code2: 'MY', code3: 'MYS', number: '458' },
  { code2: 'MV', code3: 'MDV', number: '462' },
  { code2: 'ML', code3: 'MLI', number: '466' },
  { code2: 'MT', code3: 'MLT', number: '470' },
  { code2: 'MH', code3: 'MHL', number: '584' },
  { code2: 'MQ', code3: 'MTQ', number: '474' },
  { code2: 'MR', code3: 'MRT', number: '478' },
  { code2: 'MU', code3: 'MUS', number: '480' },
  { code2: 'YT', code3: 'MYT', number: '175' },
  { code2: 'MX', code3: 'MEX', number: '484' },
  { code2: 'FM', code3: 'FSM', number: '583' },
  { code2: 'MD', code3: 'MDA', number: '498' },
  { code2: 'MC', code3: 'MCO', number: '492' },
  { code2: 'MN', code3: 'MNG', number: '496' },
  { code2: 'ME', code3: 'MNE', number: '499' },
  { code2: 'MS', code3: 'MSR', number: '500' },
  { code2: 'MA', code3: 'MAR', number: '504' },
  { code2: 'MZ', code3: 'MOZ', number: '508' },
  { code2: 'MM', code3: 'MMR', number: '104' },
  { code2: 'NA', code3: 'NAM', number: '516' },
  { code2: 'NR', code3: 'NRU', number: '520' },
  { code2: 'NP', code3: 'NPL', number: '524' },
  { code2: 'NL', code3: 'NLD', number: '528' },
  { code2: 'NC', code3: 'NCL', number: '540' },
  { code2: 'NZ', code3: 'NZL', number: '554' },
  { code2: 'NI', code3: 'NIC', number: '558' },
  { code2: 'NE', code3: 'NER', number: '562' },
  { code2: 'NG', code3: 'NGA', number: '566' },
  { code2: 'NU', code3: 'NIU', number: '570' },
  { code2: 'NF', code3: 'NFK', number: '574' },
  { code2: 'MP', code3: 'MNP', number: '580' },
  { code2: 'NO', code3: 'NOR', number: '578' },
  { code2: 'OM', code3: 'OMN', number: '512' },
  { code2: 'PK', code3: 'PAK', number: '586' },
  { code2: 'PW', code3: 'PLW', number: '585' },
  { code2: 'PS', code3: 'PSE', number: '275' },
  { code2: 'PA', code3: 'PAN', number: '591' },
  { code2: 'PG', code3: 'PNG', number: '598' },
  { code2: 'PY', code3: 'PRY', number: '600' },
  { code2: 'PE', code3: 'PER', number: '604' },
  { code2: 'PH', code3: 'PHL', number: '608' },
  { code2: 'PN', code3: 'PCN', number: '612' },
  { code2: 'PL', code3: 'POL', number: '616' },
  { code2: 'PT', code3: 'PRT', number: '620' },
  { code2: 'PR', code3: 'PRI', number: '630' },
  { code2: 'QA', code3: 'QAT', number: '634' },
  { code2: 'MK', code3: 'MKD', number: '807' },
  { code2: 'RO', code3: 'ROU', number: '642' },
  { code2: 'RU', code3: 'RUS', number: '643' },
  { code2: 'RW', code3: 'RWA', number: '646' },
  { code2: 'RE', code3: 'REU', number: '638' },
  { code2: 'BL', code3: 'BLM', number: '652' },
  { code2: 'SH', code3: 'SHN', number: '654' },
  { code2: 'KN', code3: 'KNA', number: '659' },
  { code2: 'LC', code3: 'LCA', number: '662' },
  { code2: 'MF', code3: 'MAF', number: '663' },
  { code2: 'PM', code3: 'SPM', number: '666' },
  { code2: 'VC', code3: 'VCT', number: '670' },
  { code2: 'WS', code3: 'WSM', number: '882' },
  { code2: 'SM', code3: 'SMR', number: '674' },
  { code2: 'ST', code3: 'STP', number: '678' },
  { code2: 'SA', code3: 'SAU', number: '682' },
  { code2: 'SN', code3: 'SEN', number: '686' },
  { code2: 'RS', code3: 'SRB', number: '688' },
  { code2: 'SC', code3: 'SYC', number: '690' },
  { code2: 'SL', code3: 'SLE', number: '694' },
  { code2: 'SG', code3: 'SGP', number: '702' },
  { code2: 'SX', code3: 'SXM', number: '534' },
  { code2: 'SK', code3: 'SVK', number: '703' },
  { code2: 'SI', code3: 'SVN', number: '705' },
  { code2: 'SB', code3: 'SLB', number: '090' },
  { code2: 'SO', code3: 'SOM', number: '706' },
  { code2: 'ZA', code3: 'ZAF', number: '710' },
  { code2: 'GS', code3: 'SGS', number: '239' },
  { code2: 'SS', code3: 'SSD', number: '728' },
  { code2: 'ES', code3: 'ESP', number: '724' },
  { code2: 'LK', code3: 'LKA', number: '144' },
  { code2: 'SD', code3: 'SDN', number: '729' },
  { code2: 'SR', code3: 'SUR', number: '740' },
  { code2: 'SJ', code3: 'SJM', number: '744' },
  { code2: 'SE', code3: 'SWE', number: '752' },
  { code2: 'CH', code3: 'CHE', number: '756' },
  { code2: 'SY', code3: 'SYR', number: '760' },
  { code2: 'TW', code3: 'TWN', number: '158' },
  { code2: 'TJ', code3: 'TJK', number: '762' },
  { code2: 'TZ', code3: 'TZA', number: '834' },
  { code2: 'TH', code3: 'THA', number: '764' },
  { code2: 'TL', code3: 'TLS', number: '626' },
  { code2: 'TG', code3: 'TGO', number: '768' },
  { code2: 'TK', code3: 'TKL', number: '772' },
  { code2: 'TO', code3: 'TON', number: '776' },
  { code2: 'TT', code3: 'TTO', number: '780' },
  { code2: 'TN', code3: 'TUN', number: '788' },
  { code2: 'TR', code3: 'TUR', number: '792' },
  { code2: 'TM', code3: 'TKM', number: '795' },
  { code2: 'TC', code3: 'TCA', number: '796' },
  { code2: 'TV', code3: 'TUV', number: '798' },
  { code2: 'UG', code3: 'UGA', number: '800' },
  { code2: 'UA', code3: 'UKR', number: '804' },
  { code2: 'AE', code3: 'ARE', number: '784' },
  { code2: 'GB', code3: 'GBR', number: '826' },
  { code2: 'UM', code3: 'UMI', number: '581' },
  { code2: 'US', code3: 'USA', number: '840' },
  { code2: 'UY', code3: 'URY', number: '858' },
  { code2: 'UZ', code3: 'UZB', number: '860' },
  { code2: 'VU', code3: 'VUT', number: '548' },
  { code2: 'VE', code3: 'VEN', number: '862' },
  { code2: 'VN', code3: 'VNM', number: '704' },
  { code2: 'VG', code3: 'VGB', number: '092' },
  { code2: 'VI', code3: 'VIR', number: '850' },
  { code2: 'WF', code3: 'WLF', number: '876' },
  { code2: 'XK', code3: 'XKX', number: '383' },
  { code2: 'EH', code3: 'ESH', number: '732' },
  { code2: 'YE', code3: 'YEM', number: '887' },
  { code2: 'ZM', code3: 'ZMB', number: '894' },
  { code2: 'ZW', code3: 'ZWE', number: '716' },
  { code2: 'AX', code3: 'ALA', number: '248' }
]

/**
 * Check if a country code translation is valid
 *
 * @param {string} lang - Language of country names and nationalities
 * @param {string} val - Country code
 * @returns {boolean} - True if the translation is valid, false otherwise
 */
export const isValidCountryCodeTranslation = (lang, val) => {
  const { polyglot } = getLocalizer(lang)
  return (
    isCountryCodeAlpha2(val) &&
    polyglot.has(`nationalities.${val}`) &&
    polyglot.has(`countries.${val}`)
  )
}

/**
 * Check if a country code is an ISO 3166-1 alpha-3 code
 *
 * @param {string} code - The country code
 * @returns {boolean} - True if the code is an ISO 3166-1 alpha-3 code, false otherwise
 */
export const isCountryCodeAlpha3 = code => {
  if (!code) return false

  const codeUpperCase = code.toUpperCase()
  return COUNTRIES_ISO.some(c => c.code3 === codeUpperCase)
}

/**
 * Check if a country code is an ISO 3166-1 alpha-2 code
 *
 * @param {string} code - The country code
 * @returns {boolean} - True if the code is an ISO 3166-1 alpha-2 code, false otherwise
 */
export const isCountryCodeAlpha2 = code => {
  if (!code) return false

  const codeUpperCase = code.toUpperCase()
  return COUNTRIES_ISO.some(c => c.code2 === codeUpperCase)
}

/**
 * Check if a country code is valid
 *
 * @param {string} code - The country code
 * @returns {boolean} - True if the code is valid, false otherwise
 */
export const checkCountryCode = code => {
  return isCountryCodeAlpha2(code) || isCountryCodeAlpha3(code)
}

/**
 * Get all countries with all their information (ISO codes, names, nationalities)
 *
 * @param {string} lang - Language of country names and nationalities
 * @returns {import('../../types').Country[]} - List of countries
 */
export const getAllCountries = lang => {
  const { t } = getLocalizer(lang)

  return COUNTRIES_ISO.map(country => ({
    code2: country.code2,
    code3: country.code3,
    number: country.number,
    name: t(`countries.${country.code2}`),
    nationality: t(`nationalities.${country.code2}`)
  }))
}

/**
 * Find country by its ISO code
 *
 * @param {(string|number)} code - ISO 3166-1 alpha-2, alpha-3 or numeric code
 * @returns {function(import('../../types').Country): boolean}
 */
const findCountryByISOCode = code => item => {
  const normalizeCodeType = code?.toString()?.toUpperCase()
  if (/^[A-Z]{2,3}$/.test(normalizeCodeType)) {
    const codeUpperCase = normalizeCodeType
    return item.code2 === codeUpperCase || item.code3 === codeUpperCase
  } else if (/^\d+$/.test(normalizeCodeType)) {
    return item.number === normalizeCodeType
  } else {
    return false
  }
}

/**
 * Get country name by its ISO 3166-1 (alpha-2, alpha-3 or numeric code)
 *
 * @param {string|number} code - ISO 3166-1 alpha-2, alpha-3 or numeric code
 * @param {object} options - Options
 * @param {string} options.lang - Language of country names
 * @returns {string|null} - Country name or null if not found
 */
export const getCountryNameByCodeISO = (code, { lang } = { lang: 'en' }) => {
  const country = getAllCountries(lang).find(findCountryByISOCode(code))

  if (!country) {
    logger.warn(`Country with code ${code} not found`)
    return null
  }

  return country.name
}

/**
 * Get all country names
 *
 * @param {string} lang - Language of country names
 * @returns {string[]} - List of country names
 */
export const getAllCountryNames = lang => {
  const countries = getAllCountries(lang)

  return countries.map(country => country.name)
}

/**
 * Get country nationality by its ISO 3166-1 (alpha-2, alpha-3 or numeric code)
 *
 * @param {string|number} code - ISO 3166-1 alpha-2, alpha-3 or numeric code
 * @param {object} options - Options
 * @param {string} options.lang - Language of nationality
 * @returns {string|null} - Nationality or null if not found
 */
export const getNationalityByCodeISO = (code, { lang } = { lang: 'en' }) => {
  const country = getAllCountries(lang).find(findCountryByISOCode(code))

  if (!country) {
    logger.warn(`Nationality with code ${code} not found`)
    return null
  }

  return country.nationality
}

/**
 * Get all nationalities
 *
 * @param {string} lang - Language of nationalities
 * @returns {string[]} - List of nationalities
 */
export const getAllNationalities = lang => {
  const countries = getAllCountries(lang)

  return countries.map(country => country.nationality)
}

/**
 * @param {string} countryCode - ISO 3166-1 alpha-2 (eg. fr, us, etc)
 * @returns {string} - Emoji of country
 */
export const getEmojiByCountry = countryCode => {
  if (!countryCode) return null

  // The offset between uppercase ASCII and regional indicator symbols
  const UNICODE_OFFSET = 127397

  if (!/^[a-z]{2}$/i.test(countryCode)) {
    logger.error(
      `Country argument must be an ISO 3166-1 alpha-2 string, but got '${JSON.stringify(
        countryCode
      )}' instead.`
    )
    return null
  }

  const existingCountry = COUNTRIES_ISO.find(
    country => country.code2 === countryCode.toUpperCase()
  )
  if (!existingCountry) {
    logger.error(
      `Country with code ${countryCode} not found in the list of countries`
    )
    return null
  }

  const codePoints = [...countryCode.toUpperCase()].map(
    letter => letter.codePointAt(0) + UNICODE_OFFSET
  )

  return String.fromCodePoint(...codePoints)
}
