import {
  Qualification,
  setQualification,
  getQualification
} from './qualification'
import * as qualificationModel from '../../assets/qualifications.json'
import logger from '../../logger'

jest.mock('../../assets/qualifications.json', () => ({
  qualifications: [
    {
      label: 'isp_invoice',
      purpose: 'invoice',
      sourceCategory: 'telecom',
      sourceSubCategory: 'internet',
      subjects: ['subscription']
    },
    {
      label: 'national_id_card',
      purpose: 'attestation',
      sourceCategory: 'gov',
      sourceSubCategory: 'civil_registration',
      subjects: ['identity']
    },
    {
      label: 'health_invoice',
      purpose: 'invoice',
      sourceCategory: 'health'
    },
    {
      label: 'other_identity_document',
      purpose: 'attestation',
      subjects: ['identity']
    },
    {
      label: 'dummy_empty'
    }
  ],
  purposeKnownValues: ['attestation', 'invoice'],
  sourceCategoryKnownValues: ['telecom', 'health', 'gov'],
  sourceSubCategoryKnownValues: ['civil_registration', 'internet'],
  subjectsKnownValues: ['identity', 'subscription']
}))

describe('document qualification', () => {
  beforeEach(() => {
    jest.spyOn(logger, 'warn').mockImplementation(() => jest.fn())
    jest.spyOn(logger, 'info').mockImplementation(() => jest.fn())
  })

  afterEach(() => {
    logger.warn.mockRestore()
    logger.info.mockRestore()
  })

  it('should get the correct qualification by the label', () => {
    const qualification =
      Qualification.getByLabel('national_id_card').toQualification()
    expect(qualification.label).toEqual('national_id_card')
    expect(qualification.sourceCategory).toEqual('gov')
    expect(qualification.sourceSubCategory).toEqual('civil_registration')
    expect(qualification.subjects).toEqual(['identity'])
  })
  it('should get the file qualification', () => {
    const qualification = {
      icon: 'telecom',
      label: 'isp_invoice',
      purpose: 'invoice',
      sourceCategory: 'telecom',
      sourceSubCategory: 'internet',
      subjects: ['subscription']
    }
    const fileDoc = {
      _id: '123',
      metadata: { qualification }
    }
    const fileQualification = getQualification(fileDoc)
    expect(fileQualification).toEqual(qualification)
  })
  it("should return null if the file qualification doesn't exist", () => {
    const fileDoc = {
      _id: '123',
      metadata: {}
    }
    const fileQualification = getQualification(fileDoc)
    expect(fileQualification).toEqual(null)
  })

  it('should set the correct qualification', () => {
    const fileDoc = {
      _id: '123',
      metadata: {
        datetime: '2020-01-01T20:38:04Z'
      }
    }
    let qualification = {
      label: 'health_invoice',
      purpose: 'invoice',
      sourceCategory: 'health'
    }
    setQualification(fileDoc, qualification)
    expect(fileDoc).toEqual({
      _id: '123',
      metadata: {
        datetime: '2020-01-01T20:38:04Z',
        qualification: {
          icon: 'heart',
          label: 'health_invoice',
          purpose: 'invoice',
          sourceCategory: 'health'
        }
      }
    })

    qualification = Qualification.getByLabel('other_identity_document')
      .setPurpose('attestation')
      .setSourceCategory('gov')
      .setSourceSubCategory('civil_registration')
      .setSubjects(['identity'])
      .setIcon('people')
    setQualification(fileDoc, qualification)
    expect(fileDoc).toEqual({
      _id: '123',
      metadata: {
        datetime: '2020-01-01T20:38:04Z',
        qualification: {
          icon: 'people',
          label: 'other_identity_document',
          purpose: 'attestation',
          sourceCategory: 'gov',
          sourceSubCategory: 'civil_registration',
          subjects: ['identity']
        }
      }
    })
  })

  it('should throw an error when setting a qualification with no label', () => {
    expect(() => setQualification({}, { purpose: 'invoice' })).toThrow()
  })

  it('should throw an error when setting a qualification with an unknown label', () => {
    expect(() =>
      setQualification({}, { label: 'dummy', purpose: 'invoice' })
    ).toThrow()
  })

  it('should throw an error when setting a qualification with missing attributes', () => {
    const qualification = {
      label: 'health_invoice'
    }
    expect(() => setQualification({}, qualification)).toThrow()
  })

  it('should inform when setting an unknown subject', () => {
    const qualification = {
      label: 'health_invoice',
      purpose: 'invoice',
      sourceCategory: 'health',
      subjects: ['very_hard_drugs']
    }
    setQualification({}, qualification)
    expect(logger.info).toHaveBeenCalledTimes(1)
  })
})
describe('qualifications items', () => {
  const isAttributeValueKnown = (attributeVal, authorizedValues) => {
    let isKnown
    if (Array.isArray(attributeVal)) {
      isKnown = attributeVal.some(s => authorizedValues.includes(s))
    } else {
      isKnown = authorizedValues.includes(attributeVal)
    }
    expect(isKnown).toBe(true)
  }

  it('should always define a label', () => {
    qualificationModel.qualifications.forEach(q => {
      expect(q).toHaveProperty('label')
    })
  })

  it('should not have undefined attributes', () => {
    const qualification = Qualification.getByLabel('dummy_empty')
    expect(Object.hasOwn(qualification, 'purpose')).toBe(false)
    expect(Object.hasOwn(qualification, 'sourceCategory')).toBe(false)
    expect(Object.hasOwn(qualification, 'sourceSubCategory')).toBe(false)
    expect(Object.hasOwn(qualification, 'subjects')).toBe(false)
    Object.keys(qualification).forEach(key => {
      expect(qualification[key]).toBeDefined()
    })
  })

  it('should define authorized attributes', () => {
    qualificationModel.qualifications.forEach(q => {
      if (q.purpose) {
        isAttributeValueKnown(q.purpose, qualificationModel.purposeKnownValues)
      }
      if (q.sourceCategory) {
        isAttributeValueKnown(
          q.sourceCategory,
          qualificationModel.sourceCategoryKnownValues
        )
      }
      if (q.sourceSubCategory) {
        isAttributeValueKnown(
          q.sourceSubCategory,
          qualificationModel.sourceSubCategoryKnownValues
        )
      }
      if (q.subjects) {
        isAttributeValueKnown(
          q.subjects,
          qualificationModel.subjectsKnownValues
        )
      }
    })
  })
})
