import { enableFetchMocks, disableFetchMocks } from 'jest-fetch-mock'

import {
  deconstructCozyWebLinkWithSlug,
  deconstructRedirectLink,
  generateWebLink,
  fetchRegistrationDetails,
  isHttpUrl,
  rootCozyUrl,
  InvalidRedirectLinkError,
  InvalidCozyUrlError,
  InvalidProtocolError,
  BlockedCozyError
} from './urlHelper'

describe('generateWebLink', () => {
  it('should generate the right link to a flat cozy', () => {
    const sharecode = 'sharingIsCaring'
    const username = 'alice'

    expect(
      generateWebLink({
        cozyUrl: 'http://alice.cozy.tools',
        searchParams: [['sharecode', sharecode], ['username', username]],
        pathname: 'public',
        hash: '/n/4',
        slug: 'notes',
        subDomainType: 'flat'
      })
    ).toEqual(
      `http://alice-notes.cozy.tools/public?sharecode=${sharecode}&username=${username}#/n/4`
    )
  })

  it('should generate the right link to a nested cozy', () => {
    expect(
      generateWebLink({
        cozyUrl: 'https://alice.cozy.tools',
        pathname: '/public/',
        hash: 'files/432432',
        slug: 'drive',
        subDomainType: 'nested'
      })
    ).toEqual(`https://drive.alice.cozy.tools/public/#/files/432432`)
  })

  it('should handle undefined pathname', () => {
    expect(
      generateWebLink({
        cozyUrl: 'https://alice.cozy.tools',
        pathname: undefined,
        hash: 'files/432432',
        slug: 'drive',
        subDomainType: 'nested'
      })
    ).toEqual(`https://drive.alice.cozy.tools/#/files/432432`)
  })
})

describe('deconstructWebLink', () => {
  it.each([
    [
      'https://claude-notes.mycozy.cloud',
      'flat',
      {
        protocol: 'https:',
        cozyName: 'claude',
        cozyBaseDomain: 'mycozy.cloud',
        pathname: '/',
        hash: '',
        searchParams: '',
        slug: 'notes'
      }
    ],
    [
      'http://alice-drive.cozy.tools:8080',
      'flat',
      {
        protocol: 'http:',
        cozyName: 'alice',
        cozyBaseDomain: 'cozy.tools:8080',
        pathname: '/',
        hash: '',
        searchParams: '',
        slug: 'drive'
      }
    ],
    [
      'https://photo.claude.custome-domain.fr',
      'nested',
      {
        protocol: 'https:',
        cozyName: 'claude',
        cozyBaseDomain: 'custome-domain.fr',
        pathname: '/',
        hash: '',
        searchParams: '',
        slug: 'photo'
      }
    ],
    [
      'http://drive.cozy.tools:8080/#/folder/SOME_FOLDER_ID',
      'nested',
      {
        protocol: 'http:',
        cozyName: 'cozy',
        cozyBaseDomain: 'tools:8080',
        pathname: '/',
        hash: '#/folder/SOME_FOLDER_ID',
        searchParams: '',
        slug: 'drive'
      }
    ],
    [
      'http://notes.cozy.tools:8080/public/?id=SOME_FOLDER_ID&sharecode=SOME_SHARECODE',
      'nested',
      {
        protocol: 'http:',
        cozyName: 'cozy',
        cozyBaseDomain: 'tools:8080',
        pathname: '/public/',
        hash: '',
        searchParams: 'id=SOME_FOLDER_ID&sharecode=SOME_SHARECODE',
        slug: 'notes'
      }
    ]
  ])(
    'should deconstruct %p link with %p subdomain type',
    (link, subdomainType, result) => {
      expect(deconstructCozyWebLinkWithSlug(link, subdomainType)).toEqual(
        result
      )
    }
  )
})

describe('isHttpUrl', () => {
  it.each([
    'http://alice.cozy.localhost:8080',
    'https://calendar.example.com/'
  ])('accepts %p', value => {
    expect(isHttpUrl(value)).toBe(true)
  })

  it.each([
    undefined,
    null,
    true,
    '',
    'calendar.example.com',
    'not a url',
    'javascript:alert(1)',
    'ftp://example.com'
  ])('rejects %p', value => {
    expect(isHttpUrl(value)).toBe(false)
  })
})

describe('deconstructRedirectLink', () => {
  it.each([
    [
      'contacts/#/',
      {
        slug: 'contacts',
        pathname: '',
        hash: '/'
      }
    ],
    [
      'contacts/#/hash',
      {
        slug: 'contacts',
        pathname: '',
        hash: '/hash'
      }
    ],
    [
      'contacts/#/long/hash',
      {
        slug: 'contacts',
        pathname: '',
        hash: '/long/hash'
      }
    ],
    [
      'contacts/pathname/#/long/hash',
      {
        slug: 'contacts',
        pathname: 'pathname/',
        hash: '/long/hash'
      }
    ],
    [
      'contacts/long/pathname/#/long/hash',
      {
        slug: 'contacts',
        pathname: 'long/pathname/',
        hash: '/long/hash'
      }
    ]
  ])('should deconstruct %p redirect link', (link, result) => {
    expect(deconstructRedirectLink(link)).toEqual(result)
  })

  it.each([
    ['camillenimbus-photos.mycozy.cloud'],
    ['http://camillenimbus-photos.mycozy.cloud']
  ])('should throw when redirect link is invalid', link => {
    expect(() => deconstructRedirectLink(link)).toThrow(
      InvalidRedirectLinkError
    )
  })
})

describe('rootCozyUrl', () => {
  beforeAll(() => {
    enableFetchMocks()
  })

  beforeEach(() => {
    fetch.resetMocks()
  })

  afterAll(() => {
    disableFetchMocks()
  })

  it('should handle cozy-hosted https', async () => {
    fetch.mockOnceIf(
      'https://camillenimbus.mycozy.cloud/public/prelogin',
      fakeCozyPrelogin(),
      {
        status: 200,
        url: 'https://camillenimbus.mycozy.cloud/public/prelogin',
        headers: {
          'content-type': 'application/json'
        }
      }
    )

    await expect(
      rootCozyUrl(new URL('https://camillenimbus.mycozy.cloud'))
    ).resolves.toHaveProperty('href', 'https://camillenimbus.mycozy.cloud/')
  })

  it('should handle cozy-hosted https trailing slash', async () => {
    fetch.mockOnceIf(
      'https://camillenimbus.mycozy.cloud/public/prelogin',
      fakeCozyPrelogin(),
      {
        status: 200,
        url: 'https://camillenimbus.mycozy.cloud/public/prelogin',
        headers: {
          'content-type': 'application/json'
        }
      }
    )

    await expect(
      rootCozyUrl(new URL('https://camillenimbus.mycozy.cloud/'))
    ).resolves.toHaveProperty('href', 'https://camillenimbus.mycozy.cloud/')
  })

  it('should handle cozy-hosted https trailing path', async () => {
    fetch.mockOnceIf(
      'https://camillenimbus.mycozy.cloud/public/prelogin',
      fakeCozyPrelogin(),
      {
        status: 200,
        url: 'https://camillenimbus.mycozy.cloud/public/prelogin',
        headers: {
          'content-type': 'application/json'
        }
      }
    )

    await expect(
      rootCozyUrl(new URL('https://camillenimbus.mycozy.cloud/some-path'))
    ).resolves.toHaveProperty('href', 'https://camillenimbus.mycozy.cloud/')
  })

  it('should handle cozy-hosted drive web app url', async () => {
    fetch.mockOnceIf(
      'https://camillenimbus-drive.mycozy.cloud/public/prelogin',
      {},
      {
        status: 401,
        url: 'https://camillenimbus-drive.mycozy.cloud/public/prelogin'
      }
    )
    fetch.mockOnceIf(
      'https://camillenimbus.mycozy.cloud/public/prelogin',
      fakeCozyPrelogin(),
      {
        status: 200,
        url: 'https://camillenimbus.mycozy.cloud/public/prelogin',
        headers: {
          'content-type': 'application/json'
        }
      }
    )

    await expect(
      rootCozyUrl(new URL('https://camillenimbus-drive.mycozy.cloud/#/folder'))
    ).resolves.toHaveProperty('href', 'https://camillenimbus.mycozy.cloud/')
  })

  it('should handle cozy-hosted photos album url', async () => {
    fetch.mockOnceIf(
      'https://camillenimbus-photos.mycozy.cloud/public/prelogin',
      {},
      {
        status: 401,
        url: 'https://camillenimbus-photos.mycozy.cloud/public/prelogin'
      }
    )
    fetch.mockOnceIf(
      'https://camillenimbus.mycozy.cloud/public/prelogin',
      fakeCozyPrelogin(),
      {
        status: 200,
        url: 'https://camillenimbus.mycozy.cloud/public/prelogin',
        headers: {
          'content-type': 'application/json'
        }
      }
    )

    await expect(
      rootCozyUrl(
        new URL(
          'https://camillenimbus-photos.mycozy.cloud/#/albums/68b5cda502ae29f5fa73fd89f1be4f92'
        )
      )
    ).resolves.toHaveProperty('href', 'https://camillenimbus.mycozy.cloud/')
  })

  it('should handle cozy-hosted app name', async () => {
    fetch.mockOnceIf(
      'https://camillenimbus-drive.mycozy.cloud/public/prelogin',
      {},
      {
        status: 401,
        url: 'https://camillenimbus-drive.mycozy.cloud/public/prelogin'
      }
    )
    fetch.mockOnceIf(
      'https://camillenimbus.mycozy.cloud/public/prelogin',
      fakeCozyPrelogin(),
      {
        status: 200,
        url: 'https://camillenimbus.mycozy.cloud/public/prelogin',
        headers: {
          'content-type': 'application/json'
        }
      }
    )

    await expect(
      rootCozyUrl(new URL('https://camillenimbus-drive.mycozy.cloud'))
    ).resolves.toHaveProperty('href', 'https://camillenimbus.mycozy.cloud/')
  })

  it('should handle cozy-hosted special app name', async () => {
    // XXX: `cozy-stack` redirects requests for deprecated apps (e.g.
    // `onboarding`) to the Home app (via the login page if the user is not
    // logged in).
    fetch.mockOnceIf(
      'https://camillenimbus-onboarding.mycozy.cloud/public/prelogin',
      {},
      {
        status: 200,
        url:
          'https://camillenimbus.mycozy.cloud/auth/login?redirect=https%3A%2F%2Fcamillenimbus-home.mycozy.cloud%2F'
      }
    )
    fetch.mockOnceIf(
      'https://camillenimbus.mycozy.cloud/public/prelogin',
      fakeCozyPrelogin(),
      {
        status: 200,
        url: 'https://camillenimbus.mycozy.cloud/public/prelogin',
        headers: {
          'content-type': 'application/json'
        }
      }
    )

    await expect(
      rootCozyUrl(new URL('https://camillenimbus-onboarding.mycozy.cloud'))
    ).resolves.toHaveProperty('href', 'https://camillenimbus.mycozy.cloud/')
  })

  it('should handle self-hosted https', async () => {
    fetch.mockOnceIf(
      'https://camillenimbus.com/public/prelogin',
      fakeCozyPrelogin(),
      {
        status: 200,
        url: 'https://camillenimbus.com/public/prelogin',
        headers: {
          'content-type': 'application/json'
        }
      }
    )

    await expect(
      rootCozyUrl(new URL('https://camillenimbus.com'))
    ).resolves.toHaveProperty('href', 'https://camillenimbus.com/')
  })

  it('should handle self-hosted with dash', async () => {
    fetch.mockOnceIf(
      'https://camille-nimbus.com/public/prelogin',
      fakeCozyPrelogin(),
      {
        status: 200,
        url: 'https://camille-nimbus.com/public/prelogin',
        headers: {
          'content-type': 'application/json'
        }
      }
    )

    await expect(
      rootCozyUrl(new URL('https://camille-nimbus.com'))
    ).resolves.toHaveProperty('href', 'https://camille-nimbus.com/')
  })

  it('should handle self-hosted http', async () => {
    fetch.mockOnceIf(
      'http://camille-nimbus.com/public/prelogin',
      fakeCozyPrelogin(),
      {
        status: 200,
        url: 'http://camille-nimbus.com/public/prelogin',
        headers: {
          'content-type': 'application/json'
        }
      }
    )

    await expect(
      rootCozyUrl(new URL('http://camille-nimbus.com'))
    ).resolves.toHaveProperty('href', 'http://camille-nimbus.com/')
  })

  it('should handle self-hosted https with port', async () => {
    fetch.mockOnceIf(
      'https://camillenimbus.com:666/public/prelogin',
      fakeCozyPrelogin(),
      {
        status: 200,
        url: 'https://camillenimbus.com:666/public/prelogin',
        headers: {
          'content-type': 'application/json'
        }
      }
    )

    await expect(
      rootCozyUrl(new URL('https://camillenimbus.com:666'))
    ).resolves.toHaveProperty('href', 'https://camillenimbus.com:666/')
  })

  it('should handle self-hosted nested drive web app url', async () => {
    fetch.mockOnceIf(
      'https://drive.camillenimbus.com/public/prelogin',
      {},
      {
        status: 401,
        url: 'https://drive.camillenimbus.com/public/prelogin'
      }
    )
    fetch.mockOnceIf(
      'https://camillenimbus.com/public/prelogin',
      fakeCozyPrelogin(),
      {
        status: 200,
        url: 'https://camillenimbus.com/public/prelogin',
        headers: {
          'content-type': 'application/json'
        }
      }
    )

    await expect(
      rootCozyUrl(new URL('https://drive.camillenimbus.com/#/folder'))
    ).resolves.toHaveProperty('href', 'https://camillenimbus.com/')
  })

  it('should handle self-hosted flat drive web app url', async () => {
    fetch.mockOnceIf(
      'https://camille-drive.nimbus.com/public/prelogin',
      {},
      {
        status: 401,
        url: 'https://camille-drive.nimbus.com/public/prelogin'
      }
    )
    fetch.mockOnceIf(
      'https://camille.nimbus.com/public/prelogin',
      fakeCozyPrelogin(),
      {
        status: 200,
        url: 'https://camille.nimbus.com/public/prelogin',
        headers: {
          'content-type': 'application/json'
        }
      }
    )

    await expect(
      rootCozyUrl(new URL('https://camille-drive.nimbus.com/#/folder'))
    ).resolves.toHaveProperty('href', 'https://camille.nimbus.com/')
  })

  it('should handle cozy.localhost', async () => {
    fetch.mockOnceIf(
      'http://cozy.localhost:8080/public/prelogin',
      fakeCozyPrelogin(),
      {
        status: 200,
        url: 'http://cozy.localhost:8080/public/prelogin',
        headers: {
          'content-type': 'application/json'
        }
      }
    )
    await expect(
      rootCozyUrl(new URL('http://cozy.localhost:8080'))
    ).resolves.toHaveProperty('href', 'http://cozy.localhost:8080/')
  })

  it('expects an http or https protocol', async () => {
    fetch.mockOnceIf(
      'ftp://camillenimbus.com/public/prelogin',
      {},
      {
        status: 200,
        url: 'ftp://camillenimbus.com/public/prelogin'
      }
    )

    await expect(
      rootCozyUrl(new URL('ftp://camillenimbus.com'))
    ).rejects.toBeInstanceOf(InvalidProtocolError)
  })

  it('rejects if URL points to a valid cozy-stack but no valid Cozy instance', async () => {
    fetch.mockOnceIf(
      'https://missing.mycozy.cloud/public/prelogin',
      {},
      {
        status: 404,
        url: 'https://missing.mycozy.cloud/public/prelogin'
      }
    )

    await expect(
      rootCozyUrl(new URL('https://missing.mycozy.cloud'))
    ).rejects.toBeInstanceOf(InvalidCozyUrlError)
  })

  it('should reject if Blocked cozy', async () => {
    fetch.mockResponse(() => {
      return Promise.resolve({
        headers: {
          'content-type': 'application/json; charset=UTF-8'
        },
        body: JSON.stringify([
          {
            status: '503',
            title: 'Blocked',
            code: 'UNKNOWN',
            detail: 'The Cozy is blocked for an unknown reason',
            source: {}
          }
        ]),
        ok: false,
        status: 503,
        statusText: '',
        type: 'default',
        url: 'https://camillenimbus.com/public/prelogin'
      })
    })

    await expect(
      rootCozyUrl(new URL('https://camillenimbus.com'))
    ).rejects.toBeInstanceOf(BlockedCozyError)
  })

  it('should reject on 503 error (if not Blocked)', async () => {
    fetch.mockResponse(() => {
      return Promise.resolve({
        headers: {
          'content-type': 'application/json; charset=UTF-8'
        },
        body: JSON.stringify([
          {
            status: '503',
            title: 'Some error',
            code: 'UNKNOWN',
            detail: 'Some error description',
            source: {}
          }
        ]),
        ok: false,
        status: 503,
        statusText: '',
        type: 'default',
        url: 'https://camillenimbus.com/public/prelogin'
      })
    })

    await expect(
      rootCozyUrl(new URL('https://camillenimbus.com'))
    ).rejects.toBeInstanceOf(InvalidCozyUrlError)
  })
})

describe('fetchRegistrationDetails', () => {
  beforeAll(() => {
    enableFetchMocks()
  })

  beforeEach(() => {
    fetch.resetMocks()
  })

  afterAll(() => {
    disableFetchMocks()
  })

  it('should handle cozy-hosted https', async () => {
    mockFetchJsonOnce(
      'https://camillenimbus.mycozy.cloud/public/prelogin',
      fakeCozyPrelogin()
    )

    await expect(
      fetchRegistrationDetails(new URL('https://camillenimbus.mycozy.cloud'))
    ).resolves.toStrictEqual({
      rootUrl: new URL('https://camillenimbus.mycozy.cloud/'),
      isOIDC: false
    })
  })

  it('should handle cozy-hosted https trailing slash', async () => {
    mockFetchJsonOnce(
      'https://camillenimbus.mycozy.cloud/public/prelogin',
      fakeCozyPrelogin()
    )

    await expect(
      fetchRegistrationDetails(new URL('https://camillenimbus.mycozy.cloud/'))
    ).resolves.toStrictEqual({
      rootUrl: new URL('https://camillenimbus.mycozy.cloud/'),
      isOIDC: false
    })
  })

  it('should handle cozy-hosted https trailing path', async () => {
    mockFetchJsonOnce(
      'https://camillenimbus.mycozy.cloud/public/prelogin',
      fakeCozyPrelogin()
    )

    await expect(
      fetchRegistrationDetails(
        new URL('https://camillenimbus.mycozy.cloud/some-path')
      )
    ).resolves.toStrictEqual({
      rootUrl: new URL('https://camillenimbus.mycozy.cloud/'),
      isOIDC: false
    })
  })

  it('should handle cozy-hosted drive web app url', async () => {
    mockUnauthorizedOnce(
      'https://camillenimbus-drive.mycozy.cloud/public/prelogin'
    )
    mockFetchJsonOnce(
      'https://camillenimbus.mycozy.cloud/public/prelogin',
      fakeCozyPrelogin()
    )

    await expect(
      fetchRegistrationDetails(
        new URL('https://camillenimbus-drive.mycozy.cloud/#/folder')
      )
    ).resolves.toStrictEqual({
      rootUrl: new URL('https://camillenimbus.mycozy.cloud/'),
      isOIDC: false
    })
  })

  it('should handle cozy-hosted photos album url', async () => {
    mockUnauthorizedOnce(
      'https://camillenimbus-photos.mycozy.cloud/public/prelogin'
    )
    mockFetchJsonOnce(
      'https://camillenimbus.mycozy.cloud/public/prelogin',
      fakeCozyPrelogin()
    )

    await expect(
      fetchRegistrationDetails(
        new URL(
          'https://camillenimbus-photos.mycozy.cloud/#/albums/68b5cda502ae29f5fa73fd89f1be4f92'
        )
      )
    ).resolves.toStrictEqual({
      rootUrl: new URL('https://camillenimbus.mycozy.cloud/'),
      isOIDC: false
    })
  })

  it('should handle cozy-hosted app name', async () => {
    mockUnauthorizedOnce(
      'https://camillenimbus-someslug.mycozy.cloud/public/prelogin'
    )
    mockFetchJsonOnce(
      'https://camillenimbus.mycozy.cloud/public/prelogin',
      fakeCozyPrelogin()
    )

    await expect(
      fetchRegistrationDetails(
        new URL('https://camillenimbus-someslug.mycozy.cloud')
      )
    ).resolves.toStrictEqual({
      rootUrl: new URL('https://camillenimbus.mycozy.cloud/'),
      isOIDC: false
    })
  })

  it('should handle cozy-hosted special app name', async () => {
    // XXX: `cozy-stack` redirects requests for deprecated apps (e.g.
    // `onboarding`) to the Home app (via the login page if the user is not
    // logged in).
    mockRedirectOnce(
      'https://camillenimbus-onboarding.mycozy.cloud/public/prelogin',
      'https://camillenimbus.mycozy.cloud/auth/login?redirect=https%3A%2F%2Fcamillenimbus-home.mycozy.cloud%2F'
    )
    mockFetchJsonOnce(
      'https://camillenimbus.mycozy.cloud/public/prelogin',
      fakeCozyPrelogin()
    )

    await expect(
      fetchRegistrationDetails(
        new URL('https://camillenimbus-onboarding.mycozy.cloud')
      )
    ).resolves.toStrictEqual({
      rootUrl: new URL('https://camillenimbus.mycozy.cloud/'),
      isOIDC: false
    })
  })

  it('should handle self-hosted https', async () => {
    mockFetchJsonOnce(
      'https://camillenimbus.com/public/prelogin',
      fakeCozyPrelogin()
    )

    await expect(
      fetchRegistrationDetails(new URL('https://camillenimbus.com'))
    ).resolves.toStrictEqual({
      rootUrl: new URL('https://camillenimbus.com/'),
      isOIDC: false
    })
  })

  it('should handle self-hosted with dash', async () => {
    mockFetchJsonOnce(
      'https://camille-nimbus.com/public/prelogin',
      fakeCozyPrelogin()
    )

    await expect(
      fetchRegistrationDetails(new URL('https://camille-nimbus.com'))
    ).resolves.toStrictEqual({
      rootUrl: new URL('https://camille-nimbus.com/'),
      isOIDC: false
    })
  })

  it('should handle self-hosted http', async () => {
    mockFetchJsonOnce(
      'http://camille-nimbus.com/public/prelogin',
      fakeCozyPrelogin()
    )

    await expect(
      fetchRegistrationDetails(new URL('http://camille-nimbus.com'))
    ).resolves.toStrictEqual({
      rootUrl: new URL('http://camille-nimbus.com/'),
      isOIDC: false
    })
  })

  it('should handle self-hosted https with port', async () => {
    mockFetchJsonOnce(
      'https://camillenimbus.com:666/public/prelogin',
      fakeCozyPrelogin()
    )

    await expect(
      fetchRegistrationDetails(new URL('https://camillenimbus.com:666'))
    ).resolves.toStrictEqual({
      rootUrl: new URL('https://camillenimbus.com:666/'),
      isOIDC: false
    })
  })

  it('should handle self-hosted nested drive web app url', async () => {
    mockUnauthorizedOnce('https://drive.camillenimbus.com/public/prelogin')
    mockFetchJsonOnce(
      'https://camillenimbus.com/public/prelogin',
      fakeCozyPrelogin()
    )

    await expect(
      fetchRegistrationDetails(
        new URL('https://drive.camillenimbus.com/#/folder')
      )
    ).resolves.toStrictEqual({
      rootUrl: new URL('https://camillenimbus.com/'),
      isOIDC: false
    })
  })

  it('should handle self-hosted flat drive web app url', async () => {
    mockUnauthorizedOnce('https://camille-drive.nimbus.com/public/prelogin')
    mockFetchJsonOnce(
      'https://camille.nimbus.com/public/prelogin',
      fakeCozyPrelogin()
    )

    await expect(
      fetchRegistrationDetails(
        new URL('https://camille-drive.nimbus.com/#/folder')
      )
    ).resolves.toStrictEqual({
      rootUrl: new URL('https://camille.nimbus.com/'),
      isOIDC: false
    })
  })

  it('should handle cozy.localhost', async () => {
    mockFetchJsonOnce(
      'http://cozy.localhost:8080/public/prelogin',
      fakeCozyPrelogin()
    )
    await expect(
      fetchRegistrationDetails(new URL('http://cozy.localhost:8080'))
    ).resolves.toStrictEqual({
      rootUrl: new URL('http://cozy.localhost:8080/'),
      isOIDC: false
    })
  })

  it('expects an http or https protocol', async () => {
    mockFetchJsonOnce(
      'ftp://camillenimbus.com/public/prelogin',
      fakeCozyPrelogin()
    )

    await expect(
      fetchRegistrationDetails(new URL('ftp://camillenimbus.com'))
    ).rejects.toBeInstanceOf(InvalidProtocolError)
  })

  it('rejects if URL points to a valid cozy-stack but no valid Cozy instance', async () => {
    mockNotFoundOnce('https://missing.mycozy.cloud/public/prelogin')

    await expect(
      fetchRegistrationDetails(new URL('https://missing.mycozy.cloud/'))
    ).rejects.toBeInstanceOf(InvalidCozyUrlError)
  })

  it('should reject if Blocked cozy', async () => {
    mockBlockedCozy('https://camillenimbus.com/public/prelogin')

    await expect(
      fetchRegistrationDetails(new URL('https://camillenimbus.com'))
    ).rejects.toBeInstanceOf(BlockedCozyError)
  })

  it('should reject on 503 error (if not Blocked)', async () => {
    mock503Error('https://camillenimbus.com/public/prelogin')

    await expect(
      fetchRegistrationDetails(new URL('https://camillenimbus.com'))
    ).rejects.toBeInstanceOf(InvalidCozyUrlError)
  })

  it('should handle OIDC cozy', async () => {
    mockFetchJsonOnce(
      'https://camillenimbus.mycozy.cloud/public/prelogin',
      fakeOidcPrelogin()
    )

    await expect(
      fetchRegistrationDetails(new URL('https://camillenimbus.mycozy.cloud'))
    ).resolves.toStrictEqual({
      rootUrl: new URL('https://camillenimbus.mycozy.cloud/'),
      isOIDC: true
    })
  })

  it('should reject if non Json response', async () => {
    mockFetchHtmlOnce(
      'https://camillenimbus.com/public/prelogin',
      '<html>Some HTML content</html>'
    )

    await expect(
      fetchRegistrationDetails(new URL('https://camillenimbus.com'))
    ).rejects.toBeInstanceOf(InvalidCozyUrlError)
  })
})

const mockFetchHtmlOnce = (url, response) => {
  fetch.mockOnceIf(url, response, {
    status: 200,
    url: url,
    headers: {
      'content-type': 'text/html; charset=UTF-8'
    }
  })
}

const mockFetchJsonOnce = (url, response) => {
  fetch.mockOnceIf(url, response, {
    status: 200,
    url: url,
    headers: {
      'content-type': 'application/json'
    }
  })
}

const mockRedirectOnce = (url, redirectedUrl) => {
  fetch.mockOnceIf(
    url,
    {},
    {
      status: 200,
      url: redirectedUrl
    }
  )
}

const mockUnauthorizedOnce = url => {
  fetch.mockOnceIf(
    url,
    {},
    {
      status: 401,
      url: url
    }
  )
}

const mockNotFoundOnce = url => {
  fetch.mockOnceIf(
    url,
    {},
    {
      status: 404,
      url: url
    }
  )
}

const mockBlockedCozy = url => {
  fetch.mockResponse(() => {
    return Promise.resolve({
      headers: {
        'content-type': 'application/json; charset=UTF-8'
      },
      body: JSON.stringify([
        {
          status: '503',
          title: 'Blocked',
          code: 'UNKNOWN',
          detail: 'The Cozy is blocked for an unknown reason',
          source: {}
        }
      ]),
      ok: false,
      status: 503,
      statusText: '',
      type: 'default',
      url: url
    })
  })
}

const mock503Error = url => {
  fetch.mockResponse(() => {
    return Promise.resolve({
      headers: {
        'content-type': 'application/json; charset=UTF-8'
      },
      body: JSON.stringify([
        {
          status: '503',
          title: 'Some error',
          code: 'UNKNOWN',
          detail: 'Some error description',
          source: {}
        }
      ]),
      ok: false,
      status: 503,
      statusText: '',
      type: 'default',
      url: url
    })
  })
}

const fakeOidcPrelogin = () => {
  return JSON.stringify({
    FranceConnect: false,
    Kdf: 0,
    KdfIterations: 100000,
    OIDC: true,
    locale: 'fr',
    magic_link: false,
    name: 'claude'
  })
}

const fakeCozyPrelogin = () => {
  return JSON.stringify({
    FranceConnect: false,
    Kdf: 0,
    KdfIterations: 100000,
    OIDC: false,
    locale: 'fr',
    magic_link: false,
    name: 'claude'
  })
}
