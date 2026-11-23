import { dehydrate } from '../helpers'
import HasOneInPlace from './HasOneInPlace'

const fixtures = {
  jediMaster: {
    _id: 'obiwan',
    _type: 'io.cozy.jedis',
    name: 'Obiwan Kenobi',
    padawan: 'anakin'
  },
  apprentice: {
    _id: 'anakin',
    _type: 'io.cozy.jedis',
    name: 'Anakin Skywalker'
  }
}

const hydratedMaster = {
  ...fixtures.jediMaster,
  padawan: new HasOneInPlace(fixtures.jediMaster, 'padawan', 'io.cozy.jedis', {
    get: jest.fn().mockReturnValue(fixtures.apprentice)
  })
}

const hydratedApprentice = {
  ...fixtures.apprentice,
  padawan: new HasOneInPlace(fixtures.apprentice, 'padawan', 'io.cozy.jedis', {
    get: jest.fn().mockReturnValue(undefined)
  })
}

describe('HasOneInPlace', () => {
  describe('raw', () => {
    it('returns relationship raw data', () => {
      expect(hydratedMaster.padawan.raw).toEqual('anakin')
    })

    it('returns null if the relationship has no data', () => {
      expect(hydratedApprentice.padawan.raw).toEqual(undefined)
    })
  })

  describe('dehydrate', () => {
    it('should not create a relationship attribute if document has no relationship', () => {
      const dehydrated = dehydrate(hydratedApprentice)
      expect(dehydrated.padawan).toBe(undefined)
    })

    it('should dehydrate correctly', () => {
      const dehydrated = dehydrate(hydratedMaster)
      expect(dehydrated.padawan).toEqual('anakin')
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
})
