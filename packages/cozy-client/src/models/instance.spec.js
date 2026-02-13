import { instance } from './'

const noSelfHostedInstance = {
  context: {
    data: {
      manager_url: 'https://manager.cozy.cc',
      enable_premium_links: true
    }
  },
  instance: {
    data: {
      uuid: '1234',
      locale: 'fr'
    }
  },
  diskUsage: {
    data: {
      quota: '400000000'
    }
  }
}

const selftHostedInstance = {
  context: {
    data: {}
  },
  diskUsage: {
    data: {
      quota: '6000000000000'
    }
  }
}

const hadAnOfferInstance = {
  context: {
    data: {
      manager_url: 'https://manager.cozy.cc',
      enable_premium_links: true
    }
  },
  instance: {
    data: {
      uuid: '1234'
    }
  },
  diskUsage: {
    data: {
      quota: '60000000000'
    }
  }
}

const freemiumInstance = {
  diskUsage: {
    data: {
      quota: '1000'
    }
  }
}

const nonFreemiumInstance = {
  diskUsage: {
    data: {
      quota: '50000000000'
    }
  }
}
describe('instance', () => {
  it('should test if self hosted or not', () => {
    expect(instance.isSelfHosted(noSelfHostedInstance)).toBe(false)
    expect(instance.isSelfHosted(selftHostedInstance)).toBe(true)
  })

  it('should test if premium links are on', () => {
    expect(instance.arePremiumLinksEnabled(noSelfHostedInstance)).toBe(true)
    expect(instance.arePremiumLinksEnabled(selftHostedInstance)).toBe(false)
  })

  it('should get uuid of the instance', () => {
    expect(instance.getUuid(noSelfHostedInstance)).toBe('1234')
    expect(instance.getUuid(selftHostedInstance)).toBe(undefined)
  })

  it('should return if the instance is a freemium one', () => {
    expect(instance.isFreemiumUser(noSelfHostedInstance)).toBe(true)
    expect(instance.isFreemiumUser(selftHostedInstance)).toBe(false)
  })
  it('should correctly identify freemium vs non-freemium based on quota boundary', () => {
    expect(instance.isFreemiumUser(freemiumInstance)).toBe(true)
    expect(instance.isFreemiumUser(nonFreemiumInstance)).toBe(false)
  })
  it('should tell us that this instance is concerned by our offers', () => {
    expect(instance.shouldDisplayOffers(noSelfHostedInstance)).toBe(true)
  })
  it('should tell us that a selfhosted instance is not concerned by our offres', () => {
    expect(instance.shouldDisplayOffers(selftHostedInstance)).toBe(false)
  })

  it('should generate the link to the manager', () => {
    const url = instance.buildPremiumLink(noSelfHostedInstance)
    expect(url).toBe(
      'https://manager.cozy.cc/cozy/instances/1234/premium?lang=fr'
    )
  })

  it('should test if an instance has already subscribed to one of our offers', () => {
    expect(instance.hasAnOffer(noSelfHostedInstance)).toBe(false)
    expect(instance.hasAnOffer(hadAnOfferInstance)).toBe(true)
    expect(instance.hasAnOffer(selftHostedInstance)).toBe(false)
  })

  describe('makeDiskInfos', () => {
    it('computes disk percent with a quota', () => {
      expect(instance.makeDiskInfos('0', '5000000000')).toStrictEqual({
        humanDiskQuota: '5',
        humanDiskUsage: '0',
        percentUsage: '0'
      })
      expect(instance.makeDiskInfos('115600793', '5000000000')).toStrictEqual({
        humanDiskQuota: '5',
        humanDiskUsage: '0.12',
        percentUsage: '2'
      })
      expect(
        instance.makeDiskInfos('22115600793', '90000000000')
      ).toStrictEqual({
        humanDiskQuota: '90',
        humanDiskUsage: '22.12',
        percentUsage: '25'
      })
      expect(instance.makeDiskInfos('5000000000', '5000000000')).toStrictEqual({
        humanDiskQuota: '5',
        humanDiskUsage: '5',
        percentUsage: '100'
      })
    })

    it('computes disk percent without a quota', () => {
      expect(instance.makeDiskInfos('1156007930', '')).toStrictEqual({
        humanDiskQuota: '100',
        humanDiskUsage: '1.16',
        percentUsage: '1'
      })
      expect(instance.makeDiskInfos('0', undefined)).toStrictEqual({
        humanDiskQuota: '100',
        humanDiskUsage: '0',
        percentUsage: '0'
      })
      expect(instance.makeDiskInfos('0', 0)).toStrictEqual({
        humanDiskQuota: '100',
        humanDiskUsage: '0',
        percentUsage: '0'
      })
    })
  })

  describe('hasPasswordDefinedAttribute', () => {
    const setup = async (data = {}) => {
      const client = {
        fetchQueryAndGetFromState: jest
          .fn()
          .mockImplementation(() => Promise.resolve({ data }))
      }
      return await instance.hasPasswordDefinedAttribute(client)
    }
    it('should return false if attribute password_defined does not exist', async () => {
      const res = await setup()
      expect(res).toBe(false)
    })

    it('should return false if attribute password_defined is undefined', async () => {
      const res = await setup({ password_defined: undefined })
      expect(res).toBe(false)
    })

    it('should return false if attribute password_defined is false', async () => {
      const res = await setup({ password_defined: false })
      expect(res).toBe(false)
    })

    it('should return true if attribute password_defined is true', async () => {
      const res = await setup({ password_defined: true })
      expect(res).toBe(true)
    })
  })
})
