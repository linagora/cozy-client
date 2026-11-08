import { posix } from 'path'

import {
  buildFolderPath,
  buildMainFolderPath,
  ensureKonnectorFolder
} from './konnectorFolder'

describe('ensureKonnectorFolder', () => {
  const mockClient = {
    collection: () => mockClient,
    query: jest.fn(),
    statByPath: jest.fn(),
    statById: jest.fn(),
    add: jest.fn(),
    addReferencesTo: jest.fn(),
    createDirectoryByPath: jest.fn()
  }
  const existingMagicFolder = [
    {
      path: '/Administratif',
      created_at: '2023-03-02T14:57:07.661588+01:00'
    }
  ]
  const konnector = {
    name: 'konnectorName',
    slug: 'konnectorSlug',
    folders: [
      {
        defaultDir: '$administrative/$konnector/$account'
      }
    ]
  }

  const account = { auth: { accountName: 'testAccountName' } }
  beforeEach(() => {
    mockClient.query.mockResolvedValueOnce({
      included: existingMagicFolder
    })
    mockClient.query.mockResolvedValueOnce({
      included: existingMagicFolder
    })
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should create a folder when it does not exist and return it', async () => {
    mockClient.query.mockResolvedValue({
      included: []
    })
    mockClient.statByPath.mockRejectedValue({ status: 404 })
    mockClient.statById.mockResolvedValueOnce({
      data: { _id: 'parentfolderid' }
    })
    mockClient.createDirectoryByPath.mockResolvedValueOnce({
      data: {
        _id: 'createdfolderid',
        dir_id: 'parentfolderid'
      }
    })
    mockClient.createDirectoryByPath.mockResolvedValueOnce({
      data: {
        _id: 'createdfolderid',
        dir_id: 'parentfolderid'
      }
    })
    const result = await ensureKonnectorFolder(mockClient, {
      konnector,
      account,
      lang: 'fr'
    })
    expect(result).toStrictEqual({
      _id: 'createdfolderid',
      dir_id: 'parentfolderid'
    })
    expect(mockClient.statByPath).toHaveBeenCalledWith(
      '/Administratif/konnectorName/testAccountName'
    )
    expect(mockClient.createDirectoryByPath).toHaveBeenCalledWith(
      '/Administratif/konnectorName/testAccountName'
    )
    expect(mockClient.add).toHaveBeenCalledWith(konnector, {
      saveFolder: {
        type: 'io.cozy.files',
        values: ['createdfolderid'],
        verbs: ['GET', 'PATCH', 'POST']
      }
    })
    expect(mockClient.addReferencesTo).toHaveBeenCalledWith(konnector, [
      { _id: 'createdfolderid', dir_id: 'parentfolderid' }
    ])
  })
  it('should not create any folder if account folder with proper references exists', async () => {
    const existingAccountFolder = {
      _id: 'acountFolderId',
      type: 'directory',
      referenced_by: [
        {
          type: 'io.cozy.konnectors',
          id: 'io.cozy.konnectors/konnectorSlug'
        },
        {
          type: 'io.cozy.accounts.sourceAccountIdentifier',
          id: 'testAccountName'
        }
      ]
    }
    mockClient.query.mockResolvedValueOnce({
      included: [existingAccountFolder]
    })
    const result = await ensureKonnectorFolder(mockClient, {
      konnector,
      account,
      lang: 'fr'
    })
    expect(result).toStrictEqual(existingAccountFolder)
    expect(mockClient.createDirectoryByPath).not.toHaveBeenCalled()
  })
  it('should create account folder as a child of folder with konnector reference if any', async () => {
    const existingKonnectorFolder = {
      _id: 'konnectorFolderId',
      type: 'directory',
      referenced_by: [
        {
          type: 'io.cozy.konnectors',
          id: 'io.cozy.konnectors/konnectorSlug'
        }
      ]
    }
    mockClient.query.mockResolvedValue({
      included: [existingKonnectorFolder]
    })
    mockClient.statByPath.mockRejectedValueOnce({
      status: 404
    })
    const accountFolder = {
      _id: 'accountFolderId',
      dir_id: 'konnectorFolderId'
    }
    mockClient.createDirectoryByPath.mockResolvedValueOnce({
      data: accountFolder
    })

    const result = await ensureKonnectorFolder(mockClient, {
      konnector,
      account,
      lang: 'fr'
    })
    expect(result).toStrictEqual(accountFolder)
    expect(mockClient.createDirectoryByPath).toHaveBeenCalledTimes(1)
    expect(mockClient.addReferencesTo).toHaveBeenCalledTimes(2)
    expect(mockClient.addReferencesTo).toHaveBeenNthCalledWith(1, konnector, [
      accountFolder
    ])
    expect(mockClient.addReferencesTo).toHaveBeenNthCalledWith(
      2,
      {
        _id: 'testAccountName',
        _type: 'io.cozy.accounts.sourceAccountIdentifier'
      },
      [accountFolder]
    )
  })
  it('should add proper references to konnector folder child with proper name if any', async () => {
    const existingKonnectorFolder = {
      _id: 'konnectorFolderId',
      type: 'directory',
      referenced_by: [
        {
          type: 'io.cozy.konnectors',
          id: 'io.cozy.konnectors/konnectorSlug'
        }
      ]
    }
    mockClient.query.mockResolvedValue({
      included: [existingKonnectorFolder]
    })
    const accountFolder = {
      _id: 'accountFolderId',
      dir_id: 'konnectorFolderId'
    }
    mockClient.statByPath.mockResolvedValueOnce({
      data: accountFolder
    })

    const result = await ensureKonnectorFolder(mockClient, {
      konnector,
      account,
      lang: 'fr'
    })
    expect(result).toStrictEqual(accountFolder)
    expect(mockClient.createDirectoryByPath).not.toHaveBeenCalled()
    expect(mockClient.addReferencesTo).toHaveBeenCalledTimes(2)
    expect(mockClient.addReferencesTo).toHaveBeenNthCalledWith(1, konnector, [
      accountFolder
    ])
    expect(mockClient.addReferencesTo).toHaveBeenNthCalledWith(
      2,
      {
        _id: 'testAccountName',
        _type: 'io.cozy.accounts.sourceAccountIdentifier'
      },
      [accountFolder]
    )
  })
  it('should not create a folder if it already exist', async () => {
    const existingMagicFolder = [
      {
        path: '/Administratif',
        created_at: '2023-03-02T14:57:07.661588+01:00'
      }
    ]
    mockClient.query.mockResolvedValueOnce({
      included: existingMagicFolder
    })
    mockClient.query.mockResolvedValueOnce({
      included: []
    })
    mockClient.query.mockResolvedValueOnce({
      included: []
    })
    mockClient.statById.mockResolvedValueOnce({
      data: {
        _id: 'parentfolderid'
      }
    })
    mockClient.statByPath.mockResolvedValueOnce({
      data: {
        _id: 'alreadyexistingfolderid',
        dir_id: 'parentfolderid'
      }
    })
    mockClient.statByPath.mockResolvedValueOnce({
      data: {
        _id: 'alreadyexistingfolderid',
        dir_id: 'parentfolderid'
      }
    })
    const result = await ensureKonnectorFolder(mockClient, {
      konnector: {
        name: 'konnectorName',
        folders: [
          {
            defaultDir: '$administrative/$konnector/$account'
          }
        ]
      },
      account: { auth: { accountName: 'testAccountName' } },
      lang: 'fr'
    })
    expect(result).toStrictEqual({
      _id: 'alreadyexistingfolderid',
      dir_id: 'parentfolderid'
    })
    expect(mockClient.statByPath).toHaveBeenCalledWith(
      '/Administratif/konnectorName/testAccountName'
    )
    expect(mockClient.createDirectoryByPath).not.toHaveBeenCalled()
  })
  it('should recreate a folder when the destination folder is in the trash', async () => {
    mockClient.query.mockResolvedValue({
      included: []
    })
    mockClient.statByPath.mockResolvedValueOnce({
      data: {
        _id: 'folderintrash',
        trashed: true
      }
    })
    mockClient.statByPath.mockResolvedValueOnce({
      data: {
        _id: 'folderintrash',
        trashed: true
      }
    })
    mockClient.statById.mockResolvedValueOnce({
      data: {
        _id: 'parentfolderid'
      }
    })
    mockClient.createDirectoryByPath.mockResolvedValueOnce({
      data: {
        _id: 'createdfolderid',
        dir_id: 'parentfolderid'
      }
    })
    mockClient.createDirectoryByPath.mockResolvedValueOnce({
      data: {
        _id: 'createdfolderid',
        dir_id: 'parentfolderid'
      }
    })
    const result = await ensureKonnectorFolder(mockClient, {
      konnector,
      account,
      lang: 'fr'
    })
    expect(result).toStrictEqual({
      _id: 'createdfolderid',
      dir_id: 'parentfolderid'
    })
    expect(mockClient.statByPath).toHaveBeenCalledWith(
      '/Administratif/konnectorName/testAccountName'
    )
    expect(mockClient.createDirectoryByPath).toHaveBeenCalledWith(
      '/Administratif/konnectorName/testAccountName'
    )
    expect(mockClient.add).toHaveBeenCalledWith(konnector, {
      saveFolder: {
        type: 'io.cozy.files',
        values: ['createdfolderid'],
        verbs: ['GET', 'PATCH', 'POST']
      }
    })
    expect(mockClient.addReferencesTo).toHaveBeenCalledWith(konnector, [
      { _id: 'createdfolderid', dir_id: 'parentfolderid' }
    ])
  })
  it('should add proper references to konnector folder with proper name if any', async () => {
    const existingKonnectorFolder = {
      _id: 'konnectorFolderId',
      path: '/Administratif/' + konnector.name,
      type: 'directory',
      referenced_by: []
    }
    const createdAccountFolder = {
      _id: 'accountfolderid',
      path: '/Administratif/' + konnector.name + '/testAccountName',
      type: 'directory',
      referenced_by: []
    }
    mockClient.query.mockResolvedValue({
      included: []
    })
    mockClient.statByPath
      .mockResolvedValueOnce({
        data: existingKonnectorFolder
      })
      .mockResolvedValueOnce({ data: false })
    mockClient.createDirectoryByPath.mockResolvedValueOnce({
      data: createdAccountFolder
    })

    await ensureKonnectorFolder(mockClient, {
      konnector,
      account,
      lang: 'fr'
    })
    expect(mockClient.addReferencesTo).toHaveBeenNthCalledWith(1, konnector, [
      existingKonnectorFolder
    ])
    expect(mockClient.addReferencesTo).toHaveBeenNthCalledWith(2, konnector, [
      createdAccountFolder
    ])
    expect(mockClient.addReferencesTo).toHaveBeenNthCalledWith(
      3,
      {
        _id: 'testAccountName',
        _type: 'io.cozy.accounts.sourceAccountIdentifier'
      },
      [createdAccountFolder]
    )
    expect(mockClient.addReferencesTo).toHaveBeenCalledTimes(3)
  })

  it('should add proper references to konnector folder even if account folder has konnector reference', async () => {
    const existingKonnectorFolder = {
      _id: 'konnectorFolderId',
      path: '/Administratif/' + konnector.name,
      type: 'directory',
      referenced_by: []
    }
    const existingAccountFolder = {
      _id: 'accountfolderid',
      path: '/Administratif/' + konnector.name + '/testAccountName',
      type: 'directory',
      referenced_by: [
        {
          type: 'io.cozy.konnectors',
          id: 'io.cozy.konnectors/konnectorSlug'
        }
      ]
    }
    mockClient.query.mockResolvedValue({
      included: []
    })
    mockClient.statByPath
      .mockResolvedValueOnce({
        data: existingKonnectorFolder
      })
      .mockResolvedValueOnce({ data: existingAccountFolder })
    await ensureKonnectorFolder(mockClient, {
      konnector,
      account,
      lang: 'fr'
    })
    expect(mockClient.addReferencesTo).toHaveBeenCalledTimes(2)
    expect(mockClient.addReferencesTo).toHaveBeenNthCalledWith(1, konnector, [
      existingKonnectorFolder
    ])
    expect(mockClient.addReferencesTo).toHaveBeenNthCalledWith(
      2,
      {
        _id: 'testAccountName',
        _type: 'io.cozy.accounts.sourceAccountIdentifier'
      },
      [existingAccountFolder]
    )
    expect(mockClient.createDirectoryByPath).not.toHaveBeenCalled()
  })
})

describe('konnector folder paths', () => {
  const magicFolders = { administrative: '/Administratif', photos: '/Photos' }
  const account = { _id: 'abc', auth: { accountName: 'john' } }

  it.each(['/', '//', '///', '$administrative', '$administrative/'])(
    'falls back to the default sub dir for a defaultDir %p',
    defaultDir => {
      const konnector = { slug: 'k', name: 'EDF', folders: [{ defaultDir }] }
      expect(buildFolderPath(konnector, account, magicFolders)).toBe(
        '/Administratif/EDF/john'
      )
      expect(buildMainFolderPath(konnector, magicFolders)).toBe(
        '/Administratif/EDF'
      )
    }
  )

  it('keeps the photos base dir when defaultDir has no sub dir', () => {
    const konnector = {
      slug: 'k',
      name: 'EDF',
      folders: [{ defaultDir: '$photos/' }]
    }
    expect(buildFolderPath(konnector, account, magicFolders)).toBe(
      '/Photos/EDF/john'
    )
    expect(buildMainFolderPath(konnector, magicFolders)).toBe('/Photos/EDF')
  })
})

describe('ensureKonnectorFolder destination', () => {
  const adminFolder = { _id: 'admin-id', path: '/Administratif' }
  const photosFolder = { _id: 'photos-id', path: '/Photos' }
  const account = { _id: 'abc', auth: { accountName: 'john' } }

  // statByPath resolves dot segments like cozy-stack does (path.Clean)
  const setup = ({ konnectorFolders = [] } = {}) => {
    const folders = new Map([
      ['/', { _id: 'io.cozy.files.root-dir', path: '/' }],
      [adminFolder.path, adminFolder],
      [photosFolder.path, photosFolder]
    ])
    const client = {
      collection: () => client,
      query: jest.fn(async def => {
        const { _type, _id } = def.referenced
        if (_type === 'io.cozy.apps') {
          return {
            included: [
              _id.endsWith('administrative') ? adminFolder : photosFolder
            ]
          }
        }
        return { included: konnectorFolders }
      }),
      statByPath: jest.fn(async path => {
        const folder = folders.get(
          posix.normalize(path).replace(/(.)\/$/, '$1')
        )
        if (!folder) throw { status: 404 }
        return { data: folder }
      }),
      createDirectoryByPath: jest.fn(async path => {
        const folder = { _id: `id:${path}`, path }
        folders.set(path, folder)
        return { data: folder }
      }),
      add: jest.fn(),
      addReferencesTo: jest.fn()
    }
    return client
  }

  it.each(['/', '//'])(
    'does not give the magic folder to a konnector with defaultDir %p',
    async defaultDir => {
      const client = setup()
      const konnector = { slug: 'k', name: 'EDF', folders: [{ defaultDir }] }
      const folder = await ensureKonnectorFolder(client, {
        konnector,
        account,
        lang: 'fr'
      })
      expect(folder.path).toBe('/Administratif/EDF/john')
      expect(client.add).toHaveBeenCalledWith(konnector, {
        saveFolder: expect.objectContaining({
          values: ['id:/Administratif/EDF/john']
        })
      })
    }
  )

  it('refuses a destination that resolves to a magic folder', async () => {
    const client = setup()
    client.statByPath.mockResolvedValue({ data: adminFolder })
    const konnector = { slug: 'k', name: 'EDF' }
    await expect(
      ensureKonnectorFolder(client, { konnector, account, lang: 'fr' })
    ).rejects.toThrow()
    expect(client.add).not.toHaveBeenCalled()
  })

  it('refuses an account folder that resolves to a magic folder', async () => {
    const mainFolder = { _id: 'main-id', path: '/Administratif/EDF' }
    const client = setup({ konnectorFolders: [mainFolder] })
    client.statByPath.mockResolvedValue({ data: adminFolder })
    const konnector = { slug: 'k', name: 'EDF' }
    await expect(
      ensureKonnectorFolder(client, { konnector, account, lang: 'fr' })
    ).rejects.toThrow()
    expect(client.addReferencesTo).not.toHaveBeenCalled()
  })

  const hasDotSegment = path =>
    path.split('/').some(segment => segment === '.' || segment === '..')

  it.each(['.', '..'])(
    'creates the account folder below the main folder for account name %p',
    async accountName => {
      const mainFolder = { _id: 'main-id', path: '/Administratif/EDF' }
      const client = setup({ konnectorFolders: [mainFolder] })
      const folder = await ensureKonnectorFolder(client, {
        konnector: { slug: 'k', name: 'EDF' },
        account: { _id: 'abc', auth: { accountName } },
        lang: 'fr'
      })
      expect(folder.path).toBe('/Administratif/EDF/abc')
      for (const [path] of client.statByPath.mock.calls) {
        expect(hasDotSegment(path)).toBe(false)
      }
    }
  )

  it.each(['.', '..'])(
    'creates folders below the magic folder for konnector name %p',
    async name => {
      const client = setup()
      const folder = await ensureKonnectorFolder(client, {
        konnector: { slug: 'k', name },
        account,
        lang: 'fr'
      })
      expect(folder.path).toBe('/Administratif/k/john')
      for (const [path] of client.statByPath.mock.calls) {
        expect(hasDotSegment(path)).toBe(false)
      }
    }
  )
})

describe('konnector folder path segments', () => {
  const magicFolders = { administrative: '/Administratif', photos: '/Photos' }
  const account = { _id: 'abc', auth: { accountName: 'john' } }

  it.each(['.', '..', ' .. '])(
    'replaces konnector name %p by its slug',
    name => {
      const konnector = { slug: 'k', name }
      expect(buildFolderPath(konnector, account, magicFolders)).toBe(
        '/Administratif/k/john'
      )
      expect(buildMainFolderPath(konnector, magicFolders)).toBe(
        '/Administratif/k'
      )
    }
  )

  it.each(['.', '..'])('replaces account name %p by the account id', name => {
    const konnector = { slug: 'k', name: 'EDF' }
    expect(
      buildFolderPath(
        konnector,
        { _id: 'abc', auth: { accountName: name } },
        magicFolders
      )
    ).toBe('/Administratif/EDF/abc')
  })

  it('keeps a konnector name with a slash in one segment', () => {
    const konnector = { slug: 'k', name: 'a/../..' }
    expect(buildFolderPath(konnector, account, magicFolders)).toBe(
      '/Administratif/a-..-../john'
    )
    expect(buildMainFolderPath(konnector, magicFolders)).toBe(
      '/Administratif/a-..-..'
    )
  })

  it('keeps names that contain dots', () => {
    const konnector = { slug: 'k', name: 'E.Leclerc' }
    expect(
      buildFolderPath(
        konnector,
        { _id: 'abc', auth: { accountName: 'john.doe@mail.fr' } },
        magicFolders
      )
    ).toBe('/Administratif/E.Leclerc/john.doe@mail.fr')
  })

  it.each([
    '$administrative/./$konnector/$account',
    '$administrative/.',
    './$konnector/$account'
  ])('ignores "." segments of defaultDir %p', defaultDir => {
    const konnector = { slug: 'k', name: 'EDF', folders: [{ defaultDir }] }
    expect(buildFolderPath(konnector, account, magicFolders)).toBe(
      '/Administratif/EDF/john'
    )
  })

  it.each([
    '$administrative/$konnector/$account/.',
    '$administrative/$konnector/$account/'
  ])('builds the main folder as the parent of defaultDir %p', defaultDir => {
    const konnector = { slug: 'k', name: 'EDF', folders: [{ defaultDir }] }
    expect(buildFolderPath(konnector, account, magicFolders)).toBe(
      '/Administratif/EDF/john'
    )
    expect(buildMainFolderPath(konnector, magicFolders)).toBe(
      '/Administratif/EDF'
    )
  })

  it.each(['$administrative/../$konnector/$account', '../$account'])(
    'rejects ".." segments in defaultDir %p',
    defaultDir => {
      const konnector = { slug: 'k', name: 'EDF', folders: [{ defaultDir }] }
      expect(() => buildFolderPath(konnector, account, magicFolders)).toThrow()
      expect(() => buildMainFolderPath(konnector, magicFolders)).toThrow()
    }
  )
})
