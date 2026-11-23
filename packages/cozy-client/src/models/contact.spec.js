import {
  getFullname,
  getDefaultSortIndexValue,
  getDisplayName,
  getInitials,
  getPrimaryEmail,
  getPrimaryCozy,
  getPrimaryPhone,
  getPrimaryAddress,
  getPrimaryOrFirst,
  getPrimaryCozyDomain,
  makeFullname,
  makeDisplayName,
  getFormattedAddress,
  updateIndexFullNameAndDisplayName,
  makeDefaultSortIndexValue
} from './contact'

describe('getPrimaryOrFirst', () => {
  it('should not crash if array is undefined, or contents null/undefined', () => {
    expect(getPrimaryOrFirst('email')({ email: undefined })).toEqual('')
    expect(getPrimaryOrFirst('email')({ email: [null] })).toEqual('')
    expect(getPrimaryOrFirst('email')({ email: [undefined] })).toEqual('')
  })

  it("should return the first contact's email address if no primary", () => {
    const contact = {
      email: [
        { address: 'john.smith@cozy.cc' },
        { address: 'john.two@cozy.cc' }
      ]
    }
    const result = getPrimaryOrFirst('email')(contact)
    expect(result).toEqual({ address: 'john.smith@cozy.cc' })
  })

  it("should return the primary contact's email address, even if not the first", () => {
    const contact = {
      email: [
        { address: 'john.smith@cozy.cc' },
        { address: 'john.two@cozy.cc', primary: true }
      ]
    }
    const result = getPrimaryOrFirst('email')(contact)
    expect(result).toEqual({ address: 'john.two@cozy.cc', primary: true })
  })
})

describe('getInitials', () => {
  it("should return the contact's initials from the name", () => {
    const contact = {
      name: {
        givenName: 'Arya',
        familyName: 'Stark'
      }
    }
    const result = getInitials(contact)
    expect(result).toEqual('AS')
  })

  it("should return the contact's initials if contact has only givenName", () => {
    const contact = {
      name: {
        givenName: 'Arya'
      }
    }
    const result = getInitials(contact)
    expect(result).toEqual('A')
  })

  it("should return the contact's initials if contact has only familyName", () => {
    const contact = {
      name: {
        familyName: 'Stark'
      }
    }
    const result = getInitials(contact)
    expect(result).toEqual('S')
  })

  it('should return the first letter of the primary email if contact has no name', () => {
    const contact = {
      name: undefined,
      email: [
        {
          address: 'arya.stark@thenorth.westeros',
          primary: true
        }
      ]
    }
    const result = getInitials(contact)
    expect(result).toEqual('A')
  })

  it('should return the first letter of the primary email if contact has empty name', () => {
    const contact = {
      name: {},
      email: [
        {
          address: 'arya.stark@thenorth.westeros',
          primary: true
        }
      ]
    }
    const result = getInitials(contact)
    expect(result).toEqual('A')
  })

  it('should return the first letter of the primary email if contact has empty familyName and givenName', () => {
    const contact = {
      name: {
        familyName: '',
        givenName: ''
      },
      email: [
        {
          address: 'arya.stark@thenorth.westeros',
          primary: true
        }
      ]
    }
    const result = getInitials(contact)
    expect(result).toEqual('A')
  })

  it('should return the first letter of the cozy domain if contact has empty name, an empty email but has a cozy url', () => {
    const contact = {
      name: {},
      cozy: [
        {
          url: 'https://john.mycozy.cloud',
          primary: true
        }
      ]
    }
    const result = getInitials(contact)
    expect(result).toEqual('J')
  })

  it('should return an empty string if contact has no name/email', () => {
    const result = getInitials({})
    expect(result).toEqual('')
  })
})

describe('getPrimaryCozy', () => {
  it('should not crash if array is undefined, or contents null/undefined', () => {
    expect(getPrimaryCozy({ cozy: undefined })).toEqual(undefined)
    expect(getPrimaryCozy({ cozy: [null] })).toEqual('')
    expect(getPrimaryCozy({ cozy: [undefined] })).toEqual('')
  })

  it('should return the main cozy', () => {
    const contact = {
      cozy: [
        {
          url: 'https://arya.mycozy.cloud',
          primary: true
        },
        {
          url: 'https://beth.mycozy.cloud',
          primary: false
        }
      ]
    }
    const result = getPrimaryCozy(contact)
    expect(result).toEqual('https://arya.mycozy.cloud')
  })

  it('should return the first if there is no primary', () => {
    const contact = {
      cozy: [
        {
          url: 'https://arya.mycozy.cloud'
        },
        {
          url: 'https://beth.mycozy.cloud'
        }
      ]
    }
    const result = getPrimaryCozy(contact)
    expect(result).toEqual('https://arya.mycozy.cloud')
  })

  it('should work with old doctype', () => {
    const contact = {
      url: 'https://arya.mycozy.cloud'
    }
    const result = getPrimaryCozy(contact)
    expect(result).toEqual('https://arya.mycozy.cloud')
  })
})

describe('getPrimaryPhone', () => {
  it('should not crash if array is undefined, or contents null/undefined', () => {
    expect(getPrimaryPhone({ phone: undefined })).toEqual('')
    expect(getPrimaryPhone({ phone: [null] })).toEqual('')
    expect(getPrimaryPhone({ phone: [undefined] })).toEqual('')
  })

  it('should return the main phone number', () => {
    const contact = {
      phone: [
        { number: '0320007788', primary: true },
        { number: '0666001122', primary: false },
        { number: '0788996677', primary: false }
      ]
    }
    const result = getPrimaryPhone(contact)
    expect(result).toEqual('0320007788')
  })
})

describe('getPrimaryAddress', () => {
  it('should not crash if array is undefined, or contents null/undefined', () => {
    expect(getPrimaryAddress({ address: undefined })).toEqual('')
    expect(getPrimaryAddress({ address: [null] })).toEqual('')
    expect(getPrimaryAddress({ address: [undefined] })).toEqual('')
  })

  it('should return the main address', () => {
    const contact = {
      name: {
        givenName: 'Arya',
        familyName: 'Stark'
      },
      address: [
        { formattedAddress: 'Winterfell', primary: true },
        { formattedAddress: 'Braavos', primary: false },
        { formattedAddress: "The Streets of King's Landing", primary: false }
      ]
    }
    const result = getPrimaryAddress(contact)
    expect(result).toEqual('Winterfell')
  })
})

describe('getFullname', () => {
  it("should return contact's fullname if present", () => {
    const contact = {
      fullname: 'John Doe',
      name: {
        givenName: 'Doran',
        familyName: 'Martell'
      }
    }
    const result = getFullname(contact)
    expect(result).toEqual('John Doe')
  })

  it('should return computed fullname if fullname attribute is empty', () => {
    const contact = {
      fullname: '',
      name: {
        givenName: 'Doran',
        familyName: 'Martell'
      }
    }
    const result = getFullname(contact)
    expect(result).toEqual('Doran Martell')
  })

  it('should return computed fullname if no fullname attribute', () => {
    const contact = {
      fullname: undefined,
      name: {
        givenName: 'Doran',
        familyName: 'Martell'
      }
    }
    const result = getFullname(contact)
    expect(result).toEqual('Doran Martell')
  })
})

describe('makeFullname', () => {
  it('should combine all name parts', () => {
    const contact = {
      name: {
        namePrefix: 'The Mother of Dragons',
        givenName: 'Daenerys',
        additionalName: 'The Unburnt',
        familyName: 'Targaryen',
        nameSuffix: 'Breaker of Chains'
      }
    }
    const result = makeFullname(contact)
    expect(result).toEqual(
      'The Mother of Dragons Daenerys The Unburnt Targaryen Breaker of Chains'
    )
  })

  it('should combine all name parts passed as options', () => {
    const contact = {
      name: {
        namePrefix: 'The Mother of Dragons',
        givenName: 'Daenerys',
        additionalName: 'The Unburnt',
        familyName: 'Targaryen',
        nameSuffix: 'Breaker of Chains'
      }
    }
    const result = makeFullname(contact, {
      attributesFullname: ['givenName', 'additionalName', 'familyName']
    })
    expect(result).toEqual('Daenerys The Unburnt Targaryen')
  })

  it("should return contact's givenName if no familyName", () => {
    const contact = {
      name: {
        givenName: 'Doran',
        familyName: ''
      }
    }
    const result = makeFullname(contact)
    expect(result).toEqual('Doran')
  })

  it("should return contact's familyName if no givenName", () => {
    const contact = {
      name: {
        givenName: '',
        familyName: 'Martell'
      }
    }
    const result = makeFullname(contact)
    expect(result).toEqual('Martell')
  })

  it('should return empty string if no name in contact', () => {
    const contact = { email: [] }
    const result = makeFullname(contact)
    expect(result).toEqual('')
  })

  it('should return empty string for empty contact', () => {
    const contact = {}
    const result = makeFullname(contact)
    expect(result).toEqual('')
  })
})

describe('getDisplayName', () => {
  it("should return the contact's displayName if present", () => {
    const contact = {
      displayName: 'John Doe',
      name: {
        givenName: 'Doran',
        familyName: 'Martell'
      }
    }
    const result = getDisplayName(contact)
    expect(result).toEqual('John Doe')
  })

  it('should return computed displayName if empty', () => {
    const contact = {
      displayName: '',
      name: {
        givenName: 'Doran',
        familyName: 'Martell'
      }
    }
    const result = getDisplayName(contact)
    expect(result).toEqual('Doran Martell')
  })

  it('should return computed displayName if undefined', () => {
    const contact = {
      displayName: undefined,
      name: {
        givenName: 'Doran',
        familyName: 'Martell'
      }
    }
    const result = getDisplayName(contact)
    expect(result).toEqual('Doran Martell')
  })
})

describe('makeDisplayName', () => {
  it("should return the contact's name instead of fullname if present", () => {
    const contact = {
      fullname: 'John Doe',
      name: {
        givenName: 'Doran',
        familyName: 'Martell'
      },
      email: [
        {
          address: 'doran.martell@dorne.westeros',
          primary: true
        }
      ]
    }
    const result = makeDisplayName(contact)
    expect(result).toEqual('Doran Martell')
  })

  it("should return the contact's name", () => {
    const contact = {
      name: {
        givenName: 'Doran',
        familyName: 'Martell'
      },
      email: [
        {
          address: 'doran.martell@dorne.westeros',
          primary: true
        }
      ]
    }
    const result = makeDisplayName(contact)
    expect(result).toEqual('Doran Martell')
  })

  it("should return the contact's givenName if no familyName", () => {
    const contact = {
      name: { givenName: 'John' }
    }
    const result = makeDisplayName(contact)
    expect(result).toEqual('John')
  })

  it("should return the contact's primary email if no name", () => {
    const contact = {
      name: undefined,
      email: [
        {
          address: 'doran.martell@dorne.westeros',
          primary: true
        }
      ]
    }
    const result = makeDisplayName(contact)
    expect(result).toEqual('doran.martell@dorne.westeros')
  })

  it("should return the contact's cozy domain no name and no primary email", () => {
    const contact = {
      name: undefined,
      email: [],
      cozy: [
        { url: 'https://john.mycozy.cloud' },
        { url: 'https://smith.mycozy.cloud' }
      ]
    }
    const result = makeDisplayName(contact)
    expect(result).toEqual('john.mycozy.cloud')
  })

  it('should return empty string if no name/email/cozy url in contact', () => {
    const contact = { email: [] }
    const result = makeDisplayName(contact)
    expect(result).toEqual('')
  })

  it('should return empty string for empty contact', () => {
    const contact = {}
    const result = makeDisplayName(contact)
    expect(result).toEqual('')
  })
})

describe('getPrimaryEmail', () => {
  it('should not crash if array is undefined, or contents null/undefined', () => {
    expect(getPrimaryEmail({ email: undefined })).toEqual(undefined)
    expect(getPrimaryEmail({ email: [null] })).toEqual('')
    expect(getPrimaryEmail({ email: [undefined] })).toEqual('')
  })

  it('should return the main email', () => {
    const contact = {
      email: [
        {
          address: 'beth@braavos.essos',
          primary: false
        },
        {
          address: 'arya.stark@thenorth.westeros',
          primary: true
        }
      ]
    }
    const result = getPrimaryEmail(contact)
    expect(result).toEqual('arya.stark@thenorth.westeros')
  })

  it('should return the first if there is no primary', () => {
    const contact = {
      email: [
        {
          address: 'beth@braavos.essos'
        },
        {
          address: 'arya.stark@thenorth.westeros'
        }
      ]
    }
    const result = getPrimaryEmail(contact)
    expect(result).toEqual('beth@braavos.essos')
  })

  it('should work with old doctype', () => {
    const contact = {
      email: 'arya.stark@thenorth.westeros'
    }
    const result = getPrimaryEmail(contact)
    expect(result).toEqual('arya.stark@thenorth.westeros')
  })
})

describe('getDefaultSortIndexValue', () => {
  it('should returns indexes.byFamilyNameGivenNameEmailCozyUrl if already present', () => {
    const contact = {
      indexes: { byFamilyNameGivenNameEmailCozyUrl: 'jane' },
      name: { givenName: 'John' }
    }
    const result = getDefaultSortIndexValue(contact)
    expect(result).toEqual('jane')
  })

  it('should returns null if indexes.byFamilyNameGivenNameEmailCozyUrl is empty', () => {
    const contact = {
      indexes: { byFamilyNameGivenNameEmailCozyUrl: '' },
      name: { givenName: 'John' }
    }
    const result = getDefaultSortIndexValue(contact)
    expect(result).toEqual(null)
  })

  it('should returns null if indexes.byFamilyNameGivenNameEmailCozyUrl is empty object', () => {
    const contact = {
      indexes: { byFamilyNameGivenNameEmailCozyUrl: {} },
      name: { givenName: 'John' }
    }
    const result = getDefaultSortIndexValue(contact)
    expect(result).toEqual(null)
  })

  it('should returns computed indexes.byFamilyNameGivenNameEmailCozyUrl if is undefined', () => {
    const contact = {
      name: { givenName: 'John' }
    }
    const result = getDefaultSortIndexValue(contact)
    expect(result).toEqual('john')
  })
})

describe('makeDefaultSortIndexValue', () => {
  it('should returns concatenated string of familyName, givenName, first email and first cozy url', () => {
    const contact = {
      name: { givenName: 'John', familyName: 'Smith' },
      fullname: 'John Smith',
      email: [
        { address: 'john.smith@cozy.cc' },
        { address: 'john.two@cozy.cc' }
      ],
      cozy: [
        { url: 'https://john.mycozy.cloud' },
        { url: 'https://smith.mycozy.cloud' }
      ]
    }
    const result = makeDefaultSortIndexValue(contact)
    expect(result).toEqual('smithjohnjohn.smith@cozy.ccjohn.mycozy.cloud')
  })

  it('should returns only familyName if no givenName, email and cozy url', () => {
    const contact = {
      name: { givenName: '', familyName: 'Smith' },
      fullname: 'Smith',
      email: [{ address: '' }],
      cozy: [{ url: '' }]
    }
    const result = makeDefaultSortIndexValue(contact)
    expect(result).toEqual('smith')
  })

  it('should returns only givenName if no familyName, email and cozy url', () => {
    const contact = {
      name: { givenName: 'John', familyName: '' },
      fullname: 'John',
      email: [{ address: '' }],
      cozy: [{ url: '' }]
    }
    const result = makeDefaultSortIndexValue(contact)
    expect(result).toEqual('john')
  })

  it('should returns only cozy url if no givenName, familyName and email', () => {
    const contact = {
      name: { givenName: '', familyName: '' },
      fullname: '',
      email: [],
      cozy: [{ url: 'https://smith.mycozy.cloud' }]
    }
    const result = makeDefaultSortIndexValue(contact)
    expect(result).toEqual('smith.mycozy.cloud')
  })

  it('should returns null if no givenName, familyName, email and cozy url', () => {
    const contact = {
      name: {},
      fullname: '',
      email: [],
      cozy: []
    }
    const result = makeDefaultSortIndexValue(contact)
    expect(result).toEqual(null)
  })

  it('should returns concatenated string of givenName and cozy url if no familyName and email', () => {
    const contact = {
      name: { givenName: 'John' },
      fullname: 'John',
      cozy: [{ url: 'https://smith.mycozy.cloud' }]
    }
    const result = makeDefaultSortIndexValue(contact)
    expect(result).toEqual('johnsmith.mycozy.cloud')
  })

  it('should returns only email if no name and cozy url', () => {
    const contact = {
      name: {},
      email: [{ address: 'john.smith@cozy.cc' }],
      cozy: [{ url: '' }]
    }
    const result = makeDefaultSortIndexValue(contact)
    expect(result).toEqual('john.smith@cozy.cc')
  })

  it('should not care about indexes.byFamilyNameGivenNameEmailCozyUrl if present', () => {
    const contact = {
      indexes: { byFamilyNameGivenNameEmailCozyUrl: 'jane' },
      name: { givenName: 'John' }
    }
    const result = makeDefaultSortIndexValue(contact)
    expect(result).toEqual('john')
  })
})

describe('getPrimaryCozyDomain', () => {
  it('should not crash if array is undefined, or contents null/undefined', () => {
    expect(getPrimaryCozyDomain({ cozy: undefined })).toEqual(undefined)
    expect(getPrimaryCozyDomain({ cozy: [null] })).toEqual('')
    expect(getPrimaryCozyDomain({ cozy: [undefined] })).toEqual('')
  })

  it('should returns empty string if no cozy url', () => {
    const contact = {
      cozy: [{ url: '' }]
    }
    const expected = ''

    const result = getPrimaryCozyDomain(contact)
    expect(result).toEqual(expected)
  })

  it('should returns cozy url without "https://"', () => {
    const contact = {
      cozy: [{ url: 'https://smith.mycozy.cloud' }]
    }
    const expected = 'smith.mycozy.cloud'

    const result = getPrimaryCozyDomain(contact)
    expect(result).toEqual(expected)
  })

  it('should returns cozy url without "http://"', () => {
    const contact = {
      cozy: [{ url: 'http://smith.mycozy.cloud' }]
    }
    const expected = 'smith.mycozy.cloud'

    const result = getPrimaryCozyDomain(contact)
    expect(result).toEqual(expected)
  })

  it('should returns cozy url without pathname if any', () => {
    const contact = {
      cozy: [{ url: 'https://smith.mycozy.cloud/contacts' }]
    }
    const expected = 'smith.mycozy.cloud'

    const result = getPrimaryCozyDomain(contact)
    expect(result).toEqual(expected)
  })

  it('should returns cozy url without ended "/" if no pathname', () => {
    const contact = {
      cozy: [{ url: 'https://smith.mycozy.cloud/' }]
    }
    const expected = 'smith.mycozy.cloud'

    const result = getPrimaryCozyDomain(contact)
    expect(result).toEqual(expected)
  })

  it('should returns cozy url without any transformation if not valid url', () => {
    const contact = {
      cozy: [{ url: 'smith.mycozy.cloud' }]
    }
    const expected = 'smith.mycozy.cloud'

    const result = getPrimaryCozyDomain(contact)
    expect(result).toEqual(expected)
  })

  it('should returns cozy url without www subdomain', () => {
    const contact = {
      cozy: [{ url: 'https://www.mycozy.com' }]
    }
    const expected = 'mycozy.com'

    const result = getPrimaryCozyDomain(contact)
    expect(result).toEqual(expected)
  })
})

describe('getFormattedAddress', () => {
  describe('with connector address format', () => {
    it('should return full formatted address', () => {
      const addressMock = {
        city: 'Cambridge',
        country: 'Russian Federation',
        postcode: '16862',
        street: '38 Taylor Street'
      }

      const res = getFormattedAddress(
        addressMock,
        jest.fn(() => '38 Taylor Street, 16862 Cambridge, Russian Federation')
      )

      expect(res).toBe('38 Taylor Street, 16862 Cambridge, Russian Federation')
    })
    it('should return formatted address if only "postcode" & "city" values are defined', () => {
      const addressMock = {
        city: 'Cambridge',
        country: undefined,
        postcode: '16862',
        street: undefined
      }
      const res = getFormattedAddress(
        addressMock,
        jest.fn(() => ' , 16862 Cambridge, ')
      )

      expect(res).toBe('16862 Cambridge')
    })
    it('should return formatted address if "postcode" & "city" values are undefined', () => {
      const addressMock = {
        city: 'Cambridge',
        country: undefined,
        postcode: undefined,
        street: '38 Taylor Street'
      }
      const res = getFormattedAddress(
        addressMock,
        jest.fn(() => '38 Taylor Street,  , Cambridge')
      )

      expect(res).toBe('38 Taylor Street, Cambridge')
    })
    it('should return formatted address if "postcode" & "city" values are undefined', () => {
      const addressMock = {
        city: undefined,
        country: undefined,
        postcode: undefined,
        street: undefined
      }
      const res = getFormattedAddress(
        addressMock,
        jest.fn(() => ' ,  , ')
      )

      expect(res).toBe('')
    })
  })

  describe('with manual address format', () => {
    it('should return full formatted address', () => {
      const addressMock = {
        formattedAddress: '38 Taylor Street 16862 Cambridge Russian Federation'
      }

      const res = getFormattedAddress(
        addressMock,
        jest.fn(() => '')
      )

      expect(res).toBe('38 Taylor Street 16862 Cambridge Russian Federation')
    })
  })
})

describe('updateIndexFullNameAndDisplayName', () => {
  it('should returns a contact with new attributes', () => {
    const contact = {
      name: {
        givenName: 'John',
        familyName: 'Doe',
        additionalName: 'J.'
      },
      email: [
        {
          address: 'john.doe@posteo.net',
          type: 'personal',
          primary: false
        },
        {
          address: 'john.doe@cozycloud.cc',
          primary: true
        }
      ],
      cozy: [
        {
          type: 'MyCozy',
          primary: true,
          url: 'https://johndoe.mycozy.cloud'
        }
      ]
    }

    const expected = {
      ...contact,
      displayName: 'John J. Doe',
      fullname: 'John J. Doe',
      indexes: {
        byFamilyNameGivenNameEmailCozyUrl:
          'doejohnjohn.doe@cozycloud.ccjohndoe.mycozy.cloud'
      }
    }
    expect(updateIndexFullNameAndDisplayName(contact)).toEqual(expected)
  })
})
