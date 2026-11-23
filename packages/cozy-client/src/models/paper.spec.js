import MockDate from 'mockdate'

import * as paperModel from './paper'

/**
 *
 * @param {object} param - options
 * @param {string} param.qualificationLabel - qualification label
 * @param {string} [param.expirationDate] - expiration date of file
 * @param {string} [param.referencedDate] - reference date of file
 * @param {string} [param.noticePeriod] - period before send notification
 * @param {object} [param.metadata] - metadata of file
 */
const buildMockFile = ({
  qualificationLabel,
  expirationDate,
  referencedDate,
  noticePeriod,
  metadata = {}
}) => {
  return /** @type {import('../types').IOCozyFile} */ ({
    name: qualificationLabel,
    created_at: '2022-09-01T00:00:00.000Z',
    metadata: {
      ...metadata,
      qualification: { label: qualificationLabel },
      ...(expirationDate && { expirationDate }),
      ...(referencedDate && { referencedDate }),
      ...(noticePeriod && { noticePeriod })
    }
  })
}

describe('Expiration', () => {
  beforeEach(() => {
    MockDate.set('2022-11-01T11:35:58.118Z')
  })
  afterEach(() => {
    MockDate.reset()
  })

  const fakeFileWithoutMetadata =
    /** @type {import('../types').IOCozyFile} */ ({
      _id: '00',
      name: 'unknown'
    })
  const fakeNationalIdCardFile = buildMockFile({
    qualificationLabel: 'national_id_card',
    expirationDate: '2022-09-23T11:35:58.118Z',
    noticePeriod: '90',
    metadata: {
      country: 'FR'
    }
  })
  const fakeForeignNationalIdCardFile = buildMockFile({
    qualificationLabel: 'national_id_card',
    expirationDate: '2022-09-23T11:35:58.118Z',
    noticePeriod: '90',
    metadata: {
      country: 'BE'
    }
  })
  const fakePassportFile = buildMockFile({
    qualificationLabel: 'passport',
    expirationDate: '2022-09-23T11:35:58.118Z',
    noticePeriod: '90'
  })
  const fakePersonalSportingLicenceFile = buildMockFile({
    qualificationLabel: 'personal_sporting_licence',
    referencedDate: '2022-09-23T11:35:58.118Z'
  })
  const fakeResidencePermitFile = buildMockFile({
    qualificationLabel: 'residence_permit',
    expirationDate: '2022-09-23T11:35:58.118Z',
    noticePeriod: '90'
  })
  const fakeDriverLicense = buildMockFile({
    qualificationLabel: 'driver_license',
    expirationDate: '2022-09-23T11:35:58.118Z',
    noticePeriod: '90'
  })

  describe('computeExpirationDate', () => {
    it('should return expirationDate', () => {
      const res = paperModel.computeExpirationDate(fakeNationalIdCardFile)

      expect(res.toISOString()).toBe('2022-09-23T11:35:58.118Z')
    })
    it('should return referencedDate plus 365 days', () => {
      const res = paperModel.computeExpirationDate(
        fakePersonalSportingLicenceFile
      )

      expect(res.toISOString()).toBe('2023-09-23T11:35:58.118Z')
    })

    it('should return "null" if metadata is not found', () => {
      const res = paperModel.computeExpirationDate(fakeFileWithoutMetadata)

      expect(res).toBeNull()
    })
  })

  describe('computeExpirationNoticeDate', () => {
    it('should return notice date for file with expirationDate metadata', () => {
      const res = paperModel.computeExpirationNoticeDate(fakeNationalIdCardFile)

      expect(res.toISOString()).toBe('2022-06-25T11:35:58.118Z')
    })
    it('should return notice date for file with referencedDate metadata', () => {
      const res = paperModel.computeExpirationNoticeDate(
        fakePersonalSportingLicenceFile
      )

      expect(res.toISOString()).toBe('2023-09-08T11:35:58.118Z')
    })
    it('should return null for file without corresponding metadata', () => {
      const res = paperModel.computeExpirationNoticeDate(
        fakeFileWithoutMetadata
      )

      expect(res).toBeNull()
    })
  })

  describe('computeExpirationNoticeLink', () => {
    it.each`
      file                       | link
      ${fakeNationalIdCardFile}  | ${'https://www.service-public.fr/particuliers/vosdroits/N358'}
      ${fakeResidencePermitFile} | ${'https://www.service-public.fr/particuliers/vosdroits/N110'}
      ${fakePassportFile}        | ${'https://www.service-public.fr/particuliers/vosdroits/N360'}
      ${fakeDriverLicense}       | ${'https://permisdeconduire.ants.gouv.fr/demarches-en-ligne/perte-vol-deterioration-fin-de-validite-ou-changement-d-etat-civil'}
    `(
      `should return "$link" link for an file with "$file.metadata.qualification.label" qualification label`,
      ({ file, link }) => {
        expect(paperModel.computeExpirationNoticeLink(file)).toEqual(link)
      }
    )
  })

  describe('isExpiring', () => {
    const fakeNationalIdCardFileWithoutNoticeDate = buildMockFile({
      qualificationLabel: 'national_id_card',
      expirationDate: '2022-09-23T11:35:58.118Z',
      noticePeriod: ''
    })
    const fakeResidencePermitFileWithoutNoticeDate = buildMockFile({
      qualificationLabel: 'residence_permit',
      expirationDate: '2022-09-23T11:35:58.118Z',
      noticePeriod: ''
    })
    const fakeNationalIdCardFileWithoutExpirationDate = buildMockFile({
      qualificationLabel: 'national_id_card',
      expirationDate: '',
      noticePeriod: '90'
    })
    const fakeResidencePermitFileWithoutExpirationDate = buildMockFile({
      qualificationLabel: 'residence_permit',
      expirationDate: '',
      noticePeriod: '90'
    })

    it.each`
      file                               | result
      ${fakeNationalIdCardFile}          | ${true}
      ${fakePersonalSportingLicenceFile} | ${true}
      ${fakeResidencePermitFile}         | ${true}
    `(
      `should return "$result" for each file with "noticePeriod" & "expirationDate" metadata`,
      ({ file, result }) => {
        expect(paperModel.isExpiring(file)).toEqual(result)
      }
    )

    it.each`
      file                                        | result
      ${fakeNationalIdCardFileWithoutNoticeDate}  | ${false}
      ${fakeResidencePermitFileWithoutNoticeDate} | ${false}
    `(
      `should return "$result" for each file without "noticePeriod" metadata`,
      ({ file, result }) => {
        expect(paperModel.isExpiring(file)).toEqual(result)
      }
    )

    it.each`
      file                                            | result
      ${fakeNationalIdCardFileWithoutExpirationDate}  | ${false}
      ${fakeResidencePermitFileWithoutExpirationDate} | ${false}
    `(
      `should return "$result" for each file without "expirationDate" metadata`,
      ({ file, result }) => {
        expect(paperModel.isExpiring(file)).toEqual(result)
      }
    )
  })

  describe('makeMetadataQualification', () => {
    it('should return formatted metadata', () => {
      const fakeMetadata = {
        number: '111111',
        AObtentionDate: '2029-12-01T23:00:00.000Z',
        expirationDate: '2029-12-05T23:00:00.000Z'
      }

      const res = paperModel.makeMetadataQualification({
        metadata: fakeMetadata,
        knownMetadataPath: 'expirationDate'
      })

      expect(res).toEqual({
        name: 'expirationDate',
        value: '2029-12-05T23:00:00.000Z'
      })
    })

    it('should return formatted metadata only if matching label', () => {
      const fakeMetadata = {
        number: '111111',
        AObtentionDate: '2029-12-01T23:00:00.000Z',
        BObtentionDate: '2029-12-02T23:00:00.000Z',
        CObtentionDate: '2029-12-03T23:00:00.000Z',
        expirationDate: '2029-12-05T23:00:00.000Z',
        referencedDate: '2029-12-06T23:00:00.000Z',
        issueDate: '2029-12-07T23:00:00.000Z',
        shootingDate: '2029-12-08T23:00:00.000Z',
        date: '2029-12-09T23:00:00.000Z',
        datetime: '2029-12-10T23:00:00.000Z',
        qualification: { label: 'fake_label' },
        page: 'front',
        contact: 'Alice Durand',
        noticePeriod: ''
      }

      const metadataLabels = [
        'AObtentionDate',
        'BObtentionDate',
        'CObtentionDate',
        'DObtentionDate'
      ]

      const res = metadataLabels.map(dateName =>
        paperModel.makeMetadataQualification({
          metadata: fakeMetadata,
          knownMetadataPath: dateName
        })
      )

      expect(res).toEqual([
        { name: 'AObtentionDate', value: '2029-12-01T23:00:00.000Z' },
        { name: 'BObtentionDate', value: '2029-12-02T23:00:00.000Z' },
        { name: 'CObtentionDate', value: '2029-12-03T23:00:00.000Z' },
        null
      ])
    })
  })

  describe('formatMetadataQualification', () => {
    it('should return correctly formatted metadata', () => {
      const fakeMetadata = {
        number: '111111',
        AObtentionDate: '2029-12-01T23:00:00.000Z',
        BObtentionDate: '2029-12-02T23:00:00.000Z',
        CObtentionDate: '2029-12-03T23:00:00.000Z',
        DObtentionDate: '2029-12-04T23:00:00.000Z',
        expirationDate: '2029-12-05T23:00:00.000Z',
        referencedDate: '2029-12-06T23:00:00.000Z',
        issueDate: '2029-12-07T23:00:00.000Z',
        shootingDate: '2029-12-08T23:00:00.000Z',
        date: '2029-12-09T23:00:00.000Z',
        datetime: '2029-12-10T23:00:00.000Z',
        qualification: { label: 'fake_label' },
        page: 'front',
        contact: 'Alice Durand',
        noticePeriod: ''
      }

      const computedMetadata = [
        { name: 'AObtentionDate', value: '2029-12-01T23:00:00.000Z' },
        { name: 'BObtentionDate', value: '2029-12-02T23:00:00.000Z' },
        { name: 'CObtentionDate', value: '2029-12-03T23:00:00.000Z' },
        { name: 'DObtentionDate', value: '2029-12-04T23:00:00.000Z' },
        { name: 'expirationDate', value: '2029-12-05T23:00:00.000Z' },
        { name: 'referencedDate', value: '2029-12-06T23:00:00.000Z' },
        { name: 'issueDate', value: '2029-12-07T23:00:00.000Z' },
        { name: 'shootingDate', value: '2029-12-08T23:00:00.000Z' },
        { name: 'date', value: '2029-12-09T23:00:00.000Z' },
        { name: 'number', value: '111111' },
        { name: 'noticePeriod', value: null },
        { name: 'contact', value: 'Alice Durand' },
        { name: 'page', value: 'front' },
        { name: 'qualification', value: 'fake_label' }
      ]

      const res = paperModel.formatMetadataQualification(fakeMetadata)
      expect(res).toEqual(computedMetadata)
    })
  })

  describe('formatInformationMetadataValue', () => {
    it('should return value with suffix locale', () => {
      const res = paperModel.formatInformationMetadataValue('88', {
        name: 'noticePeriod',
        lang: 'en',
        qualificationLabel: 'national_id_card'
      })

      expect(res).toEqual('88 days')
    })

    it('should return "noInfo" value', () => {
      const res = paperModel.formatInformationMetadataValue('', {
        name: 'metadataName',
        lang: 'en',
        qualificationLabel: 'national_id_card'
      })

      expect(res).toEqual('No information')
    })

    it('should return value if not in other case', () => {
      const res = paperModel.formatInformationMetadataValue('metadataValue', {
        name: 'metadataName',
        lang: 'en',
        qualificationLabel: 'national_id_card'
      })

      expect(res).toEqual('metadataValue')
    })

    it('should return nationality', () => {
      const res = paperModel.formatInformationMetadataValue('FR', {
        name: 'country',
        lang: 'en',
        qualificationLabel: 'national_id_card'
      })

      expect(res).toEqual('France')
    })
  })

  describe('isForeignPaper', () => {
    it('should return true if the paper is a foreign paper', () => {
      const res = paperModel.isForeignPaper(fakeForeignNationalIdCardFile)

      expect(res).toBe(true)
    })

    it('should return false if the paper is not a foreign paper', () => {
      const res = paperModel.isForeignPaper(fakeNationalIdCardFile)

      expect(res).toBe(false)
    })
  })
})
