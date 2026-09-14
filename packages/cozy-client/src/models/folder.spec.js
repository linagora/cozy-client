import { MAGIC_FOLDERS, ensureMagicFolder, getReferencedFolder } from './folder'

describe('Folder model', () => {
  const mockClient = {
    collection: () => mockClient,
    query: jest.fn(),
    findReferencedBy: jest.fn(),
    ensureDirectoryExists: jest.fn(),
    addReferencesTo: jest.fn(),
    get: jest.fn()
  }

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('ensureMagicFolder', () => {
    it('should return first existing magic folder', async () => {
      const existingMagicFolders = [
        {
          path: '/Administrative',
          created_at: '2020-03-02T14:57:07.661588+01:00'
        },
        {
          path: '/Administrative2',
          created_at: '2019-03-02T14:57:07.661588+01:00'
        }
      ]

      mockClient.query.mockResolvedValueOnce({
        included: existingMagicFolders
      })

      const result = await ensureMagicFolder(
        mockClient,
        MAGIC_FOLDERS.ADMINISTRATIVE
      )
      expect(result).toEqual(existingMagicFolders[0])
    })

    it('should throw if magic folder id is invalid', async () => {
      mockClient.findReferencedBy.mockResolvedValue({
        included: []
      })

      await expect(
        ensureMagicFolder(mockClient, 'io.cozy.apps/unexpected/magic/folder')
      ).rejects.toThrow()
    })

    it('should throw if path is missing', async () => {
      await expect(
        ensureMagicFolder(mockClient, MAGIC_FOLDERS.ADMINISTRATIVE)
      ).rejects.toThrow()
    })

    it('should create magic folder', async () => {
      mockClient.query.mockResolvedValueOnce({
        included: []
      })
      mockClient.ensureDirectoryExists.mockResolvedValue('dir-id')
      mockClient.get.mockResolvedValue({ data: {} })

      await ensureMagicFolder(
        mockClient,
        MAGIC_FOLDERS.ADMINISTRATIVE,
        '/Administrative'
      )

      expect(mockClient.ensureDirectoryExists).toHaveBeenCalledWith(
        '/Administrative'
      )
      expect(mockClient.addReferencesTo).toHaveBeenCalledWith(
        { _id: 'io.cozy.apps/administrative', _type: 'io.cozy.apps' },
        [{ _id: 'dir-id' }]
      )
    })
  })

  describe('getReferencedFolder', () => {
    it('should return the most recently created folder', async () => {
      const oldFolder = {
        path: '/Old/folder',
        created_at: '2019-03-02T14:57:07.661588+01:00'
      }
      const recentFolder = {
        path: '/Recent/folder',
        created_at: '2020-03-02T14:57:07.661588+01:00'
      }

      mockClient.query.mockResolvedValueOnce({
        included: [oldFolder, recentFolder]
      })

      const result = await getReferencedFolder(mockClient, 'ref')

      expect(result).toBe(recentFolder)
    })
  })
})
