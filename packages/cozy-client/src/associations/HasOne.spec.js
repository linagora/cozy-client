import merge from 'lodash/merge'

import { dehydrate } from '../helpers'
import { QueryDefinition } from '../queries/dsl'
import HasOne from './HasOne'

const clientMock = {
  get: (doctype, id) => new QueryDefinition({ doctype, id })
}

const fixtures = {
  jediMaster: {
    _id: 'obiwan',
    _type: 'io.cozy.jedis',
    name: 'Obiwan Kenobi',
    relationships: {
      padawan: {
        data: { _id: 'anakin', _type: 'io.cozy.jedis' }
      }
    }
  },
  apprentice: {
    _id: 'anakin',
    _type: 'io.cozy.jedis',
    name: 'Anakin Skywalker'
  }
}

const hydratedMaster = {
  ...fixtures.jediMaster,
  padawan: new HasOne(fixtures.jediMaster, 'padawan', 'io.cozy.jedis', {
    get: jest.fn().mockReturnValue(fixtures.apprentice),
    save: jest.fn()
  })
}

const hydratedApprentice = {
  ...fixtures.apprentice,
  padawan: new HasOne(fixtures.apprentice, 'padawan', 'io.cozy.jedis', {
    get: jest.fn().mockReturnValue(undefined),
    save: jest.fn()
  })
}

describe('HasOne', () => {
  describe('raw', () => {
    it('returns relationship raw data', () => {
      expect(hydratedMaster.padawan.raw).toEqual({
        _id: 'anakin',
        _type: 'io.cozy.jedis'
      })
    })

    it('returns null if the relationship has no data', () => {
      expect(hydratedApprentice.padawan.raw).toEqual(null)
    })
  })

  describe('dehydrate', () => {
    it('should not create a relationship attribute if document has no relationship', () => {
      const dehydrated = dehydrate(hydratedApprentice)
      expect(dehydrated.relationships).toBe(undefined)
    })

    it('should dehydrate correctly', () => {
      const dehydrated = dehydrate(hydratedMaster)
      expect(dehydrated.relationships).toEqual({
        padawan: { data: { _id: 'anakin', _type: 'io.cozy.jedis' } }
      })
    })
  })

  describe('data', () => {
    it('calls get method', () => {
      const jedi = hydratedMaster.padawan.data
      expect(hydratedMaster.padawan.get).toHaveBeenCalledWith(
        'io.cozy.jedis',
        'anakin'
      )
      expect(jedi).toEqual(fixtures.apprentice)
    })
  })

  describe('query', () => {
    it('returns the expected QueryDefinition', () => {
      const queryDef = HasOne.query(fixtures.jediMaster, clientMock, {
        name: 'padawan',
        doctype: 'io.cozy.jedis'
      })
      expect(queryDef.doctype).toEqual('io.cozy.jedis')
      expect(queryDef.id).toEqual(fixtures.apprentice._id)
    })

    it('returns null if the relationship is invalid', () => {
      const queryDef = HasOne.query(
        merge({}, fixtures.jediMaster, { relationships: { padawan: null } }),
        clientMock,
        {
          name: 'padawan',
          doctype: 'io.cozy.jedis'
        }
      )
      expect(queryDef).toBe(null)
    })
  })

  describe('setRelationship', () => {
    it("should throw if the document to be set's type is not the same as the association type", () => {
      expect(() =>
        hydratedMaster.padawan.setRelationship({
          _id: '1',
          _type: 'io.cozy.stuff'
        })
      ).toThrow()
    })

    it('should update the associated document', () => {
      const newPadawan = {
        _id: 'shameonmeidontknowstarwars',
        _type: 'io.cozy.jedis',
        name: 'Bernard Nobody'
      }

      hydratedMaster.padawan.setRelationship(newPadawan)

      expect(hydratedMaster.padawan.raw).toEqual({
        _id: newPadawan._id,
        _type: newPadawan._type
      })
    })
  })

  describe('remove', () => {
    it('should remove', () => {
      hydratedMaster.padawan.remove()
      expect(hydratedMaster.padawan.raw).toEqual(null)
    })
  })

  describe('add', () => {
    it('should add', () => {
      hydratedMaster.padawan.remove()
      hydratedMaster.padawan.add({ _id: 'luke', _type: 'io.cozy.jedis' })

      expect(hydratedMaster.padawan.raw).toEqual({
        _type: 'io.cozy.jedis',
        _id: 'luke'
      })
    })
  })
})
