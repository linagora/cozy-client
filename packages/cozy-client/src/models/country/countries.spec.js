import logger from '../../logger'
import {
  checkCountryCode,
  getAllCountries,
  getAllCountryNames,
  getAllNationalities,
  getCountryNameByCodeISO,
  getEmojiByCountry,
  isCountryCodeAlpha2,
  isCountryCodeAlpha3
} from './countries'

describe('checkCountryCode', () => {
  it('should return true for valid country codes', () => {
    expect(checkCountryCode('FR')).toBe(true)
    expect(checkCountryCode('fr')).toBe(true)
    expect(checkCountryCode('FRA')).toBe(true)
    expect(checkCountryCode('fra')).toBe(true)
    expect(checkCountryCode('US')).toBe(true)
    expect(checkCountryCode('us')).toBe(true)
  })

  it('should return false for invalid country codes', () => {
    expect(checkCountryCode(undefined)).toBe(false)
    expect(checkCountryCode(null)).toBe(false)
    expect(checkCountryCode('')).toBe(false)
  })
})

describe('getCountryNameByCodeISO', () => {
  it('should return the country name for valid country codes', () => {
    expect(getCountryNameByCodeISO('FR')).toBe('France')
    expect(getCountryNameByCodeISO('fr')).toBe('France')
    expect(getCountryNameByCodeISO('FRA')).toBe('France')
    expect(getCountryNameByCodeISO('fra')).toBe('France')
    expect(getCountryNameByCodeISO('250')).toBe('France')
    expect(getCountryNameByCodeISO('us', { lang: 'fr' })).toBe(
      "États-Unis d'Amérique"
    )
  })

  it('should return null for invalid country codes', () => {
    expect(getCountryNameByCodeISO(undefined)).toBe(null)
    expect(getCountryNameByCodeISO(null)).toBe(null)
    expect(getCountryNameByCodeISO('')).toBe(null)
    expect(getCountryNameByCodeISO('Mercure')).toBe(null)
    expect(getCountryNameByCodeISO('1234')).toBe(null)
  })
})

describe('getAllCountries', () => {
  it('should return array of country names', () => {
    const countries = getAllCountries()
    expect(countries).toEqual(
      expect.arrayContaining([
        {
          code2: 'FR',
          code3: 'FRA',
          number: '250',
          name: 'France',
          nationality: 'French'
        },
        {
          code2: 'US',
          code3: 'USA',
          number: '840',
          name: 'United States of America',
          nationality: 'American'
        }
      ])
    )
  })

  it('should return array of country names in spécific lang', () => {
    const countries = getAllCountries('fr')
    expect(countries).toEqual(
      expect.arrayContaining([
        {
          code2: 'FR',
          code3: 'FRA',
          number: '250',
          name: 'France',
          nationality: 'Français'
        },
        {
          code2: 'US',
          code3: 'USA',
          number: '840',
          name: "États-Unis d'Amérique",
          nationality: 'Américain'
        }
      ])
    )
  })
})

describe('getAllCountryNames', () => {
  it('should return array of country names', () => {
    const countryNames = getAllCountryNames()
    expect(countryNames).toEqual(
      expect.arrayContaining(['Andorra', 'United States of America'])
    )
  })

  it('should return array of country names in spécific lang', () => {
    const countryNames = getAllCountryNames('fr')
    expect(countryNames).toEqual(
      expect.arrayContaining(['Andorre', "États-Unis d'Amérique"])
    )
  })
})

describe('getAllNationalities', () => {
  it('should return array of country names', () => {
    const nationalities = getAllNationalities()
    expect(nationalities).toEqual(
      expect.arrayContaining(['French', 'American'])
    )
  })

  it('should return array of country names in spécific lang', () => {
    const nationalities = getAllNationalities('fr')
    expect(nationalities).toEqual(
      expect.arrayContaining(['Français', 'Américain'])
    )
  })
})

describe('getEmojiByCountry', () => {
  beforeEach(() => {
    jest.spyOn(logger, 'error').mockImplementation(() => jest.fn())
  })
  afterEach(() => {
    logger.error.mockRestore()
  })

  it('should return French flag', () => {
    const res = getEmojiByCountry('fr')

    expect(res).toBe('🇫🇷')
  })

  it('should return Belgian flag', () => {
    const res = getEmojiByCountry('be')

    expect(res).toBe('🇧🇪')
  })

  it('should return "null" if the country is not ISO 3166-1 alpha-2 string', () => {
    const res = getEmojiByCountry('fra')

    expect(logger.error).toHaveBeenCalledTimes(1)
    expect(res).toBe(null)
  })

  it('should return "null" if the country is undefined', () => {
    const res = getEmojiByCountry(undefined)

    expect(logger.error).not.toHaveBeenCalled()
    expect(res).toBe(null)
  })

  it('should return "null" if the country is ISO 3166-1 alpha-2 string but not found in COUNTRIES_ISO list', () => {
    const res = getEmojiByCountry('aa')

    expect(logger.error).toHaveBeenCalledTimes(1)
    expect(res).toBe(null)
  })
})

describe('isCountryCodeAlpha3', () => {
  it('should return true for valid country codes', () => {
    expect(isCountryCodeAlpha3('FRA')).toBe(true)
    expect(isCountryCodeAlpha3('fra')).toBe(true)
    expect(isCountryCodeAlpha3('USA')).toBe(true)
    expect(isCountryCodeAlpha3('usa')).toBe(true)
  })

  it('should return false for invalid country codes', () => {
    expect(isCountryCodeAlpha3(undefined)).toBe(false)
    expect(isCountryCodeAlpha3(null)).toBe(false)
    expect(isCountryCodeAlpha3('')).toBe(false)
    expect(isCountryCodeAlpha3('AAA')).toBe(false)
    expect(isCountryCodeAlpha3('FR')).toBe(false)
  })
})

describe('isCountryCodeAlpha2', () => {
  it('should return true for valid country codes', () => {
    expect(isCountryCodeAlpha2('FR')).toBe(true)
    expect(isCountryCodeAlpha2('fr')).toBe(true)
    expect(isCountryCodeAlpha2('US')).toBe(true)
    expect(isCountryCodeAlpha2('us')).toBe(true)
  })

  it('should return false for invalid country codes', () => {
    expect(isCountryCodeAlpha2(undefined)).toBe(false)
    expect(isCountryCodeAlpha2(null)).toBe(false)
    expect(isCountryCodeAlpha2('')).toBe(false)
    expect(isCountryCodeAlpha2('AA')).toBe(false)
    expect(isCountryCodeAlpha2('FRA')).toBe(false)
  })
})
