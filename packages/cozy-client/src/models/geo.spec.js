const {
  geodesicDistance,
  computeSpeed,
  computeSphericalCenter,
  deltaLongitude,
  deltaLatitude
} = require('./geo')

describe('geodesicDistance', () => {
  it('should return 0 for 2 points with same coordinates', () => {
    const p1 = { lat: 0.0, lon: 0.0 }
    const p2 = { lat: 0.0, lon: 0.0 }
    expect(geodesicDistance(p1, p2)).toEqual(0)
  })

  it('should return null when points are not properly formatted', () => {
    expect(geodesicDistance(null, null)).toEqual(null)
    expect(geodesicDistance({ lat: 1.0 }, { lon: 5.6 })).toEqual(null)
  })

  it('should return the correct Paris-NY distance', () => {
    const paris = { lat: 48.8566, lon: 2.3522 }
    const NY = { lat: 40.7128, lon: -74.006 }
    expect(geodesicDistance(paris, NY)).toEqual(5843779.97)
  })
})

describe('speed', () => {
  it('should return 0 when the speed or distance is not set or 0', () => {
    expect(computeSpeed(0, 0)).toEqual(0)
    expect(computeSpeed(10, 0)).toEqual(0)
    expect(computeSpeed(0, 10)).toEqual(0)
    expect(computeSpeed()).toEqual(0)
  })
  it('should return the correct running speed of the developer', () => {
    expect(computeSpeed(10000, 1800)).toEqual(5.56)
  })
})

describe('computeSphericalCenter', () => {
  it('should return null when coordinates are missing', () => {
    expect(computeSphericalCenter([])).toEqual(null)
  })
  it('should return the correct coordinates when there are all equals', () => {
    expect(computeSphericalCenter([{ lat: 10, lon: 10 }])).toEqual({
      lat: 10,
      lon: 10
    })
    expect(
      computeSphericalCenter([
        { lat: 0.0, lon: 0.0 },
        { lat: 0.0, lon: 0.0 },
        { lat: 0.0, lon: 0.0 }
      ])
    ).toEqual({ lat: 0, lon: 0 })
  })
  it('should return correct center for n points', () => {
    expect(
      computeSphericalCenter([
        { lat: 10, lon: 10 },
        { lat: 10, lon: 10 }
      ])
    ).toEqual({ lat: 10, lon: 10 })

    expect(
      computeSphericalCenter([
        { lat: 48, lon: 2 },
        { lat: 48, lon: 3 }
      ])
    ).toEqual({ lat: 48.0010848667078, lon: 2.5 })

    expect(
      computeSphericalCenter([
        { lat: 10, lon: 10 },
        { lat: 20, lon: 20 },
        { lat: 30, lon: 30 }
      ])
    ).toEqual({ lat: 20.1866988557583, lon: 19.5721919393414 })
  })
})

describe('delta longitude and latitude', () => {
  it('null distance should give a null delta', () => {
    expect(deltaLongitude(46.66, 0)).toEqual(0)
    expect(deltaLatitude(0)).toEqual(0)
  })

  it('should give the correct longitude delta', () => {
    expect(deltaLongitude(46.66, 200)).toEqual(0.002617749975)
    expect(deltaLongitude(0, 200)).toEqual(0.0017966305682) // equator
    expect(deltaLongitude(89.99, 200)).toEqual(10.2939349426746) // north pole
    expect(deltaLongitude(-89.99, 200)).toEqual(10.2939349426746) // south pole
  })
  it('should give the correct latitude delta', () => {
    expect(deltaLatitude(200)).toEqual(0.0017966313163)
    expect(deltaLatitude(2000)).toEqual(0.0179663131628) // contrarily to the longitude, this is linear
  })
})
