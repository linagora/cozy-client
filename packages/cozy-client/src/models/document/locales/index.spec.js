import { getBoundT, getLocalizer } from './index'

describe('getBoundT', () => {
  const t = getBoundT('en')

  it('should return singular translation by default (without options param)', () => {
    const res = t('Scan.items.national_id_card')

    expect(res).toBe('ID card')
  })
  it('should return translation if it has no pluralization pipes', () => {
    const res = t('Scan.items.health')

    expect(res).toBe('Health')
  })
  it('should return "default value" option', () => {
    const res = t('Scan.items.unknown_key', { _: 'default value' })

    expect(res).toBe('default value')
  })

  it.each`
    translationKey                   | country      | smart_count  | lang    | expected
    ${'Scan.items.national_id_card'} | ${undefined} | ${undefined} | ${'en'} | ${'ID card'}
    ${'Scan.items.national_id_card'} | ${'fr'}      | ${undefined} | ${'en'} | ${'ID card 🇫🇷'}
    ${'Scan.items.national_id_card'} | ${'foreign'} | ${undefined} | ${'en'} | ${'ID card Foreign'}
    ${'Scan.items.national_id_card'} | ${'be'}      | ${1}         | ${'en'} | ${'ID card 🇧🇪'}
    ${'Scan.items.national_id_card'} | ${'be'}      | ${2}         | ${'en'} | ${'ID cards 🇧🇪'}
    ${'Scan.items.national_id_card'} | ${'fr'}      | ${1}         | ${'en'} | ${'ID card 🇫🇷'}
    ${'Scan.items.national_id_card'} | ${'fr'}      | ${2}         | ${'en'} | ${'ID cards 🇫🇷'}
    ${'Scan.items.national_id_card'} | ${undefined} | ${1}         | ${'en'} | ${'ID card'}
    ${'Scan.items.national_id_card'} | ${undefined} | ${2}         | ${'en'} | ${'ID cards'}
    ${'Scan.items.national_id_card'} | ${undefined} | ${2}         | ${'es'} | ${'Documentos de identidad'}
    ${'Scan.items.national_id_card'} | ${'fr'}      | ${1}         | ${'de'} | ${'Personalausweis 🇫🇷'}
    ${'Scan.items.national_id_card'} | ${'foreign'} | ${1}         | ${'it'} | ${"Carta d'identità Estero"}
    ${'Scan.items.national_id_card'} | ${undefined} | ${5}         | ${'ru'} | ${'Удостоверения личности'}
    ${'Scan.items.national_id_card'} | ${'fr'}      | ${1}         | ${'ru'} | ${'Удостоверение личности 🇫🇷'}
    ${'Scan.items.national_id_card'} | ${'foreign'} | ${2}         | ${'vi'} | ${'Căn cước công dân Nước ngoài'}
  `(
    'should test if the translation is suitable with the param country: $country and with the param smart_count: $smart_count',
    ({ translationKey, country, smart_count, lang, expected }) => {
      const t = getBoundT(lang)
      const res = t(translationKey, { country, smart_count })

      expect(res).toBe(expected)
    }
  )
})

describe('getLocalizer', () => {
  it.each`
    lang    | smart_count | expected
    ${'ru'} | ${1}        | ${'день'}
    ${'ru'} | ${3}        | ${'дня'}
    ${'ru'} | ${5}        | ${'дней'}
    ${'ru'} | ${21}       | ${'день'}
    ${'vi'} | ${1}        | ${'ngày'}
    ${'vi'} | ${5}        | ${'ngày'}
  `(
    'should use the plural rules of $lang for smart_count: $smart_count',
    ({ lang, smart_count, expected }) => {
      const t = getLocalizer(lang)

      expect(t('Scan.qualification.information.day', { smart_count })).toBe(
        expected
      )
    }
  )
})
