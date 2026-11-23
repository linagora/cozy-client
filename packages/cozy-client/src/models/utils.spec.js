import { isAndroid, isIOS } from 'cozy-device-helper'
import flag from 'cozy-flags'

import {
  getCreatedByApp,
  hasBeenUpdatedByApp,
  getFlagshipDownloadLink
} from './utils'

jest.mock('cozy-device-helper', () => ({
  isAndroid: jest.fn(),
  isIOS: jest.fn()
}))

jest.mock('cozy-flags')

test('getCreatedByApp', () => {
  expect(getCreatedByApp({ cozyMetadata: { createdByApp: 'banks' } })).toBe(
    'banks'
  )
  expect(getCreatedByApp({})).toBe(undefined)
})

test('hasBeenUpdatedByApp', () => {
  expect(
    hasBeenUpdatedByApp(
      { cozyMetadata: { updatedByApps: [{ slug: 'banks' }] } },
      'banks'
    )
  ).toBe(true)
  expect(
    hasBeenUpdatedByApp(
      { cozyMetadata: { updatedByApps: [{ slug: 'banks' }] } },
      'drive'
    )
  ).toBe(false)
  expect(hasBeenUpdatedByApp({}, 'drive')).toBe(false)
})

describe('getFlagshipDownloadLink', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should return the Android download link with the correct ID and language', () => {
    // @ts-ignore
    isAndroid.mockReturnValueOnce(true)
    flag.mockReturnValueOnce('com.example.app')
    const lang = 'fr'
    expect(getFlagshipDownloadLink(lang)).toBe(
      'https://play.google.com/store/apps/details?id=com.example.app&hl=fr'
    )
  })

  it('should return the default Android download link if no ID is provided', () => {
    // @ts-ignore
    isAndroid.mockReturnValueOnce(true)
    flag.mockReturnValueOnce(null)
    const lang = 'en'
    expect(getFlagshipDownloadLink(lang)).toBe(
      'https://play.google.com/store/apps/details?id=io.cozy.flagship.mobile&hl=en'
    )
  })

  it('should return the iOS download link with the correct ID and language', () => {
    // @ts-ignore
    isIOS.mockReturnValueOnce(true)
    flag.mockReturnValueOnce('id123456')
    const lang = 'es'
    expect(getFlagshipDownloadLink(lang)).toBe(
      'https://apps.apple.com/es/app/id123456'
    )
  })

  it('should return the default iOS download link if no ID is provided', () => {
    // @ts-ignore
    isIOS.mockReturnValueOnce(true)
    flag.mockReturnValueOnce(null)
    const lang = 'en'
    expect(getFlagshipDownloadLink(lang)).toBe(
      'https://apps.apple.com/en/app/id1600636174'
    )
  })

  it('should return the download link from the flag for other platforms', () => {
    // @ts-ignore
    isAndroid.mockReturnValueOnce(false)
    // @ts-ignore
    isIOS.mockReturnValueOnce(false)
    flag.mockReturnValueOnce('https://other.site/download')
    const lang = 'fr'
    expect(getFlagshipDownloadLink(lang)).toBe('https://other.site/download')
  })

  it('should return the default download link for other platforms', () => {
    // @ts-ignore
    isAndroid.mockReturnValueOnce(false)
    // @ts-ignore
    isIOS.mockReturnValueOnce(false)
    const lang = 'fr'
    expect(getFlagshipDownloadLink(lang)).toBe('https://cozy.io/fr/download')
  })
})
