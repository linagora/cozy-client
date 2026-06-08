import { isFlagshipApp } from 'cozy-device-helper'

import * as fileModel from './file'
import { Qualification } from './document/qualification'
import { QueryDefinition } from '../queries/dsl'
const CozyClient = require('cozy-client/dist/CozyClient').default
const CozyStackClient = require('cozy-stack-client').default

jest.mock('cozy-stack-client')
jest.mock('cozy-device-helper', () => ({
  isFlagshipApp: jest.fn()
}))

const cozyClient = new CozyClient({
  stackClient: new CozyStackClient()
})
const destroySpy = jest.fn().mockName('destroy')
const getSpy = jest.fn().mockName('get')
const statByPathSpy = jest.fn().mockName('statByPath')
const updateFileMetadataSpy = jest.fn().mockName('updateFileMetadata')
const createFileSpy = jest.fn().mockName('createFileSpy')
const updateFileSpy = jest.fn().mockName('updateFileSpy')
const fetchFileContentByIdSpy = jest.fn().mockName('fetchFileContentById')
const moveSpy = jest.fn().mockName('move')
const moveToCozySpy = jest.fn().mockName('moveToCozy')
const moveFromCozySpy = jest.fn().mockName('moveFromCozy')
const downloadFromCozySpy = jest.fn().mockName('downloadFromCozy')
const forceFileDownloadFromCozySpy = jest.fn().mockName('forceFileDownload')

beforeAll(() => {
  cozyClient.stackClient.collection.mockReturnValue({
    destroy: destroySpy,
    get: getSpy,
    statByPath: statByPathSpy,
    updateFileMetadata: updateFileMetadataSpy,
    createFile: createFileSpy,
    updateFile: updateFileSpy,
    fetchFileContentById: fetchFileContentByIdSpy,
    move: moveSpy,
    moveToCozy: moveToCozySpy,
    moveFromCozy: moveFromCozySpy,
    download: downloadFromCozySpy,
    forceFileDownload: forceFileDownloadFromCozySpy
  })
})

beforeEach(() => {
  jest.clearAllMocks()
})

describe('File Model', () => {
  it('should test if a file is a note or not', () => {
    const fileDocument = {
      type: 'file',
      _id: 1
    }
    expect(fileModel.isNote(fileDocument)).toBe(false)
    const note = {
      type: 'file',
      name: 'test.cozy-note',
      metadata: {
        title: '',
        version: 0
      }
    }
    expect(fileModel.isNote(note)).toBe(true)
    const noteMissingVersion = {
      type: 'file',
      name: 'test.cozy-note',
      metadata: {
        title: ''
      }
    }
    expect(fileModel.isNote(noteMissingVersion)).toBe(false)
    const noteMissingTitle = {
      type: 'file',
      name: 'test.cozy-note',
      metadata: {
        version: 0
      }
    }
    expect(fileModel.isNote(noteMissingTitle)).toBe(false)
  })

  it('should test if a file is a shortcut or not', () => {
    const shortcut = {
      type: 'file',
      class: 'shortcut'
    }

    const image = {
      type: 'file',
      class: 'image'
    }

    expect(fileModel.isShortcut(shortcut)).toBe(true)
    expect(fileModel.isShortcut(image)).toBe(false)
  })

  it('should test if a file is an onlyoffice file or not', () => {
    const directory = {
      type: 'directory'
    }

    const shortcut = {
      type: 'file',
      class: 'shortcut'
    }

    const image = {
      type: 'file',
      class: 'image'
    }

    const note = {
      type: 'file',
      name: 'test.cozy-note',
      metadata: {
        content: 'content',
        schema: [],
        title: 'title',
        version: 1
      }
    }

    const text = {
      type: 'file',
      class: 'text'
    }

    const slide = {
      type: 'file',
      class: 'slide'
    }

    const spreadsheet = {
      type: 'file',
      class: 'spreadsheet'
    }

    expect(fileModel.isOnlyOfficeFile(text)).toBe(true)
    expect(fileModel.isOnlyOfficeFile(slide)).toBe(true)
    expect(fileModel.isOnlyOfficeFile(spreadsheet)).toBe(true)
    expect(fileModel.isOnlyOfficeFile(directory)).toBe(false)
    expect(fileModel.isOnlyOfficeFile(shortcut)).toBe(false)
    expect(fileModel.isOnlyOfficeFile(image)).toBe(false)
    expect(fileModel.isOnlyOfficeFile(note)).toBe(false)
  })

  it('should test if a file should be opened by only office', () => {
    const docxFile = {
      type: 'file',
      class: 'text',
      name: 'test.docx'
    }

    const txtFile = { ...docxFile, name: 'test.txt' }

    const mdFile = { ...docxFile, name: 'test.md' }

    expect(fileModel.shouldBeOpenedByOnlyOffice(docxFile)).toBe(true)
    expect(fileModel.shouldBeOpenedByOnlyOffice(txtFile)).toBe(false)
    expect(fileModel.shouldBeOpenedByOnlyOffice(mdFile)).toBe(false)
  })

  it('should test if a file has a specific metadata', () => {
    const doc = {
      metadata: {
        carbonCopy: true
      }
    }

    expect(
      fileModel.hasMetadataAttribute({ file: doc, attribute: 'carbonCopy' })
    ).toBe(true)
    expect(
      fileModel.hasMetadataAttribute({ file: doc, attribute: 'electronicSafe' })
    ).toBe(false)
  })

  describe('hasQualifications', () => {
    it.each`
      file                                                                      | result
      ${{ name: 'file01', metadata: { qualification: { label: 'passport' } } }} | ${true}
      ${{ name: 'file02', metadata: {} }}                                       | ${false}
      ${{ name: 'file03' }}                                                     | ${false}
    `(
      `should test if a $file.name has a qualification or not`,
      ({ file, result }) => {
        expect(fileModel.hasQualifications(file)).toEqual(result)
      }
    )
  })

  describe('hasCertifications', () => {
    it.each`
      file                                                                          | result
      ${{ name: 'file01', metadata: { carbonCopy: true } }}                         | ${true}
      ${{ name: 'file02', metadata: { electronicSafe: true } }}                     | ${true}
      ${{ name: 'file03', metadata: { carbonCopy: true, electronicSafe: false } }}  | ${true}
      ${{ name: 'file04', metadata: { carbonCopy: false, electronicSafe: true } }}  | ${true}
      ${{ name: 'file05', metadata: { carbonCopy: true, electronicSafe: true } }}   | ${true}
      ${{ name: 'file06', metadata: { carbonCopy: false, electronicSafe: false } }} | ${false}
      ${{ name: 'file07', metadata: {} }}                                           | ${false}
      ${{ name: 'file08' }}                                                         | ${false}
    `(
      `should test if a $file.name has a certification or not`,
      ({ file, result }) => {
        expect(fileModel.hasCertifications(file)).toEqual(result)
      }
    )
  })

  describe('isFromKonnector', () => {
    it.each`
      file                                                                      | result
      ${{ name: 'file01', cozyMetadata: { sourceAccount: 'sourceAccountId' } }} | ${true}
      ${{ name: 'file02', cozyMetadata: {} }}                                   | ${false}
      ${{ name: 'file03' }}                                                     | ${false}
    `(
      `should test if a $file.name is from connector or not`,
      ({ file, result }) => {
        expect(fileModel.isFromKonnector(file)).toEqual(result)
      }
    )
  })

  describe('normalizeFile', () => {
    const id = 'uuid123'
    const type = 'directory'

    it('should allow both `id` and `_id`', () => {
      const doc = { id, type }
      expect(fileModel.normalize(doc)).toHaveProperty('_id', id)

      const _doc = { _id: id, type }
      expect(fileModel.normalize(_doc)).toHaveProperty('_id', id)
    })

    it('should enforce a `_type`', () => {
      const doc = { id, type }
      expect(fileModel.normalize(doc)).toHaveProperty('_type', 'io.cozy.files')
      expect(fileModel.normalize(doc)).toHaveProperty('type', type)

      const doc2 = { id, _type: 'io.cozy.something.else' }
      expect(fileModel.normalize(doc2)).toHaveProperty(
        '_type',
        'io.cozy.something.else'
      )

      const doc3 = { id }
      expect(fileModel.normalize(doc3)).toHaveProperty('_type', 'io.cozy.files')
    })
  })

  describe('encryption', () => {
    it('should return when a file is encrypted or not', () => {
      const encryptedFile = {
        name: 'encryptedfile.txt',
        encrypted: true
      }
      const plaintextFile = { name: 'plaintext.txt', mime: 'text' }
      expect(fileModel.isEncrypted(encryptedFile)).toBe(true)
      expect(fileModel.isEncrypted(plaintextFile)).toBe(false)
    })
  })

  describe('splitFilename', () => {
    it.each`
      opts                                       | result
      ${{ type: 'file', name: 'file.ext' }}      | ${{ filename: 'file', extension: '.ext' }}
      ${{ type: 'file', name: 'file' }}          | ${{ filename: 'file', extension: '' }}
      ${{ type: 'file', name: 'file.html.ext' }} | ${{ filename: 'file.html', extension: '.ext' }}
      ${{ type: 'file', name: 'file.' }}         | ${{ filename: 'file', extension: '.' }}
      ${{ type: 'file', name: 'file..' }}        | ${{ filename: 'file.', extension: '.' }}
      ${{ type: 'file', name: 'file..ext' }}     | ${{ filename: 'file.', extension: '.ext' }}
      ${{ type: 'file', name: '.file' }}         | ${{ filename: '.file', extension: '' }}
      ${{ type: 'file', name: '.file.ext' }}     | ${{ filename: '.file', extension: '.ext' }}
    `(`should splits $opts.name into $result`, ({ opts, result }) => {
      expect(fileModel.splitFilename(opts)).toEqual(result)
    })
    it('should throw an error if the file is not correct', () => {
      expect(() => fileModel.splitFilename({})).toThrow(
        'file should have a name property'
      )
      expect(() => fileModel.splitFilename({ name: null })).toThrow()
      expect(() => fileModel.splitFilename({ name: '' })).not.toThrow()
    })
    it('should return only the folder name if its a folder', () => {
      const dir = {
        name: 'foo',
        type: 'directory'
      }
      const result = fileModel.splitFilename(dir)
      expect(result).toEqual({
        filename: 'foo',
        extension: ''
      })
    })
  })

  describe('ensureFilePath', () => {
    const id = 'uuid123'
    const type = 'io.cozy.files'

    it('should define the path if parent is provided', () => {
      const doc = { id, name: 'myfile.ext' }
      const parent = { path: '/my/path' }
      expect(fileModel.ensureFilePath(doc, parent)).toHaveProperty(
        'path',
        '/my/path/myfile.ext'
      )
    })

    it('should not require a `parent` parameter if one is present', () => {
      const doc = { id, type, path: '/test/file' }
      expect(fileModel.ensureFilePath(doc)).toHaveProperty('path', '/test/file')
    })

    it('should not buid a `path` if the one is already present', () => {
      const doc = { id, type, path: '/test/file' }
      const parent = { id, type, path: '/test/parent' }
      expect(fileModel.ensureFilePath(doc, parent)).toHaveProperty(
        'path',
        '/test/file'
      )
    })
  })

  describe('Sharing shortcuts', () => {
    const id = 'abc123'
    const type = 'io.cozy.files'

    const nonSharingShortcutDocument = { id, type }
    const sharingShortcutDocument = {
      ...nonSharingShortcutDocument,
      metadata: {
        sharing: { status: 'seen' },
        target: {
          mime: 'target-mimetype',
          _type: 'io.cozy.files'
        }
      }
    }
    const newShortcutDocument = {
      ...nonSharingShortcutDocument,
      metadata: {
        sharing: { status: 'new' },
        target: {
          mime: 'target-mimetype-2',
          _type: 'io.cozy.files'
        }
      }
    }

    it('identifies a sharing shortcut', () => {
      expect(fileModel.isSharingShortcut(sharingShortcutDocument)).toBe(true)
      expect(fileModel.isSharingShortcut(nonSharingShortcutDocument)).toBe(
        false
      )
    })

    it('detects if a sharing shortcut is new', () => {
      expect(fileModel.isSharingShortcutNew(newShortcutDocument)).toBe(true)
      expect(fileModel.isSharingShortcutNew(nonSharingShortcutDocument)).toBe(
        false
      )
      expect(fileModel.isSharingShortcutNew(sharingShortcutDocument)).toBe(
        false
      )
    })

    it('returns the sharring shortcut status', () => {
      expect(fileModel.getSharingShortcutStatus(newShortcutDocument)).toBe(
        'new'
      )
      expect(fileModel.getSharingShortcutStatus(sharingShortcutDocument)).toBe(
        'seen'
      )
      expect(
        fileModel.getSharingShortcutStatus(nonSharingShortcutDocument)
      ).toBeUndefined()
    })

    it('returns the sharring shortcut target mime type', () => {
      expect(fileModel.getSharingShortcutTargetMime(newShortcutDocument)).toBe(
        'target-mimetype-2'
      )
      expect(
        fileModel.getSharingShortcutTargetMime(sharingShortcutDocument)
      ).toBe('target-mimetype')
      expect(
        fileModel.getSharingShortcutTargetMime(nonSharingShortcutDocument)
      ).toBeUndefined()
    })

    it('returns the sharring shortcut target doctype', () => {
      expect(
        fileModel.getSharingShortcutTargetDoctype(sharingShortcutDocument)
      ).toBe('io.cozy.files')
      expect(
        fileModel.getSharingShortcutTargetMime(nonSharingShortcutDocument)
      ).toBeUndefined()
    })
  })
  describe('getFullpath', () => {
    let parentDirPath

    beforeEach(() => {
      getSpy.mockImplementation(() =>
        Promise.resolve({
          data: {
            _id: '123',
            _type: 'io.cozy.files',
            path: parentDirPath
          }
        })
      )
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('should return the full path of the file', async () => {
      parentDirPath = '/GrandParent/Parent'
      const result = await fileModel.getFullpath(
        cozyClient,
        'parent',
        'mydoc.odt'
      )
      expect(cozyClient.stackClient.collection).toHaveBeenCalledWith(
        'io.cozy.files',
        expect.anything()
      )
      expect(getSpy).toHaveBeenCalledWith(
        'parent',
        new QueryDefinition({ doctype: 'io.cozy.files', id: 'parent' })
      )
      expect(result).toEqual('/GrandParent/Parent/mydoc.odt')
    })

    it('should return the full path of the file if it is in root directory', async () => {
      parentDirPath = '/'
      const result = await fileModel.getFullpath(
        cozyClient,
        'parent',
        'mydoc.odt'
      )
      expect(cozyClient.stackClient.collection).toHaveBeenCalledWith(
        'io.cozy.files',
        expect.anything()
      )
      expect(getSpy).toHaveBeenCalledWith(
        'parent',
        new QueryDefinition({ doctype: 'io.cozy.files', id: 'parent' })
      )
      expect(result).toEqual('/mydoc.odt')
    })
  })

  describe('move', () => {
    const cozyFile = {
      _id: 'file-2295478c',
      _type: 'io.cozy.files',
      name: 'mydoc.odt',
      dir_id: 'io.cozy.files.root-dir'
    }
    const cozyFolder = {
      _id: 'dir-b1e1c256',
      _type: 'io.cozy.files',
      dir_id: 'io.cozy.files.root-dir',
      type: 'directory',
      name: 'Photos',
      path: '/Photos'
    }

    const nextcloudFolder = {
      _id: 'folder-12435',
      _type: 'io.cozy.remote.nextcloud.files',
      path: '/Photos',
      name: 'Photos'
    }

    const nextcloudFile = {
      _id: 'file-12345',
      _type: 'io.cozy.remote.nextcloud.files',
      path: '/Photos/Penguins.jpg',
      name: 'Penguins.jpg'
    }

    afterEach(() => {
      jest.restoreAllMocks()
      jest.clearAllMocks()
    })

    it('should move a io.cozy.file to another io.cozy.file', async () => {
      updateFileMetadataSpy.mockResolvedValue({
        data: {
          id: cozyFile._id,
          dir_id: cozyFolder._id,
          _type: 'io.cozy.files'
        }
      })
      const result = await fileModel.move(cozyClient, cozyFile, cozyFolder)
      expect(updateFileMetadataSpy).toHaveBeenCalled()
      expect(result).toEqual({
        deleted: null,
        moved: {
          id: 'file-2295478c',
          dir_id: 'dir-b1e1c256',
          _type: 'io.cozy.files'
        }
      })
    })

    it('should fail with an error if there is a conflict and force is false', async () => {
      updateFileMetadataSpy.mockRejectedValueOnce({
        status: 409
      })
      try {
        await fileModel.move(cozyClient, cozyFile, cozyFolder)
      } catch (e) {
        expect(e).toEqual({ status: 409 })
      }
    })

    it('should overwrite the destination if there is a conflict and force is true', async () => {
      const DELETED_FILE_ID = 'deleted-c097ffca'

      updateFileMetadataSpy.mockRejectedValueOnce({
        status: 409
      })
      updateFileMetadataSpy.mockResolvedValue({
        data: {
          id: cozyFile._id,
          dir_id: cozyFolder._id,
          _type: 'io.cozy.files'
        }
      })
      statByPathSpy.mockResolvedValue({
        data: {
          id: DELETED_FILE_ID,
          _type: 'io.cozy.files'
        }
      })
      const result = await fileModel.move(cozyClient, cozyFile, cozyFolder, {
        force: true
      })
      expect(updateFileMetadataSpy).toHaveBeenCalled()
      expect(destroySpy).toHaveBeenCalled()
      expect(result).toEqual({
        deleted: DELETED_FILE_ID,
        moved: {
          id: 'file-2295478c',
          dir_id: 'dir-b1e1c256',
          _type: 'io.cozy.files'
        }
      })
    })

    it('should move a Nextcloud file inside a Nextcloud folder', async () => {
      const result = await fileModel.move(
        cozyClient,
        nextcloudFile,
        nextcloudFolder
      )
      expect(moveSpy).toBeCalledWith(nextcloudFile, nextcloudFolder)
      expect(result).toEqual({
        deleted: null,
        moved: undefined
      })
    })

    it('should move a Nexcloud file into a Cozy folder', async () => {
      const result = await fileModel.move(cozyClient, nextcloudFile, cozyFolder)
      expect(moveToCozySpy).toBeCalledWith(nextcloudFile, cozyFolder)
      expect(result).toEqual({
        deleted: null,
        moved: undefined
      })
    })

    it('should move a Cozy file to a Nextcloud folder', async () => {
      const result = await fileModel.move(cozyClient, cozyFile, nextcloudFolder)
      expect(moveFromCozySpy).toBeCalledWith(nextcloudFolder, cozyFile)
      expect(result).toEqual({
        deleted: null,
        moved: undefined
      })
    })
  })

  describe('generateNewFileNameOnConflict', () => {
    it('should generate the default file name with parenthesized copy counters', () => {
      const filename1 = fileModel.generateNewFileNameOnConflict('test')
      expect(filename1).toEqual('test (1)')
      const filename2 = fileModel.generateNewFileNameOnConflict('test (1)')
      expect(filename2).toEqual('test (2)')
      const filename3 = fileModel.generateNewFileNameOnConflict('test_1_1_test')
      expect(filename3).toEqual('test_1_1_test (1)')
      const filename4 = fileModel.generateNewFileNameOnConflict(
        'test_1_1_test (1)'
      )
      expect(filename4).toEqual('test_1_1_test (2)')
      const filename5 = fileModel.generateNewFileNameOnConflict('test_')
      expect(filename5).toEqual('test_ (1)')
    })

    it('should not increment numbers that are part of the file name', () => {
      const filename1 = fileModel.generateNewFileNameOnConflict('IMG_4521')
      expect(filename1).toEqual('IMG_4521 (1)')
      const filename2 = fileModel.generateNewFileNameOnConflict('DSC_0001')
      expect(filename2).toEqual('DSC_0001 (1)')
      const filename3 = fileModel.generateNewFileNameOnConflict('report_2024')
      expect(filename3).toEqual('report_2024 (1)')
      const filename4 = fileModel.generateNewFileNameOnConflict(
        'report (draft)'
      )
      expect(filename4).toEqual('report (draft) (1)')
    })

    it('should keep the legacy delimiter behavior when delimiter is passed', () => {
      const conflictOptions = {
        delimiter: '_'
      }

      const filename1 = fileModel.generateNewFileNameOnConflict(
        'test',
        conflictOptions
      )
      expect(filename1).toEqual('test_1')
      const filename2 = fileModel.generateNewFileNameOnConflict(
        'test_1',
        conflictOptions
      )
      expect(filename2).toEqual('test_2')
      const filename3 = fileModel.generateNewFileNameOnConflict(
        'test_1_1_test',
        conflictOptions
      )
      expect(filename3).toEqual('test_1_1_test_1')
      const filename4 = fileModel.generateNewFileNameOnConflict(
        'test_',
        conflictOptions
      )
      expect(filename4).toEqual('test__1')
    })

    it('should generate the right file name with _cozyX', () => {
      const conflictOptions = {
        delimiter: '_cozy'
      }

      const filename1 = fileModel.generateNewFileNameOnConflict(
        'test',
        conflictOptions
      )
      expect(filename1).toEqual('test_cozy1')
      const filename2 = fileModel.generateNewFileNameOnConflict(
        'test_cozy1',
        conflictOptions
      )
      expect(filename2).toEqual('test_cozy2')
      const filename3 = fileModel.generateNewFileNameOnConflict(
        'test_cozy1_test',
        conflictOptions
      )
      expect(filename3).toEqual('test_cozy1_test_cozy1')
      const filename4 = fileModel.generateNewFileNameOnConflict(
        'test_cozy1_test_cozy1',
        conflictOptions
      )
      expect(filename4).toEqual('test_cozy1_test_cozy2')
      const filename5 = fileModel.generateNewFileNameOnConflict(
        'test_',
        conflictOptions
      )
      expect(filename5).toEqual('test__cozy1')
    })
  })

  describe('generateFileNameForRevision', () => {
    it('should generate the right file name for a revision', () => {
      const MOCKED_DATE = '2018-01-01T12:00:00.210Z'
      const expectedFilename = 'test_01 January - 12h00.pdf'
      const date = new Date(MOCKED_DATE)
      const result = fileModel.generateFileNameForRevision(
        { name: 'test.pdf', type: 'file' },
        { updated_at: date },
        () => '01 January - 12h00'
      )
      expect(result).toEqual(expectedFilename)
    })
  })

  describe('uploadFileWithConflictStrategy', () => {
    beforeEach(() => {
      getSpy.mockImplementation(() =>
        Promise.resolve({
          data: {
            path: '/GrandParent/Parent',
            _type: 'io.cozy.files',
            _id: '123'
          }
        })
      )
    })
    afterEach(() => {
      jest.restoreAllMocks()
      jest.clearAllMocks()
    })

    it('should call the upload method if no conflict', async () => {
      statByPathSpy.mockRejectedValueOnce(new Error('Not Found'))
      createFileSpy.mockResolvedValue({
        data: {
          id: 'jj',
          dir_id: 'jj',
          _type: 'io.cozy.files'
        }
      })
      try {
        await fileModel.uploadFileWithConflictStrategy(
          cozyClient,
          {},
          { name: 'test', dirId: 'a', conflictStrategy: 'erase' }
        )
      } catch (e) {
        expect(createFileSpy).toHaveBeenCalled()
      }
    })

    it('should rename the file if there is a conflict', async () => {
      const dirId = 'toto'
      //first call we return an existing file => conflict
      //second call, we reject as not found
      statByPathSpy
        .mockReturnValueOnce({
          data: {
            _id: 'file_id',
            _type: 'io.cozy.files'
          }
        })
        .mockRejectedValueOnce(new Error('Not Found'))

      const opts = {
        name: 'filename',
        dirId,
        conflictStrategy: 'rename',
        contentType: 'image/jpeg'
      }
      await fileModel.uploadFileWithConflictStrategy(cozyClient, '', opts)
      expect(createFileSpy).toHaveBeenCalledWith('', {
        ...opts,
        name: 'filename (1)'
      })
    })

    it('should keep real filename numbers when renaming a file with an extension', async () => {
      const dirId = 'toto'
      //first call we return an existing file => conflict
      //second call, we reject as not found
      statByPathSpy
        .mockReturnValueOnce({
          data: {
            _id: 'file_id',
            _type: 'io.cozy.files'
          }
        })
        .mockRejectedValueOnce(new Error('Not Found'))

      const opts = {
        name: 'IMG_4521.jpg',
        dirId,
        conflictStrategy: 'rename',
        contentType: 'image/jpeg'
      }
      await fileModel.uploadFileWithConflictStrategy(cozyClient, '', opts)
      expect(createFileSpy).toHaveBeenCalledWith('', {
        ...opts,
        name: 'IMG_4521 (1).jpg'
      })
    })

    it('should rename the file with "_cozyX" if there is a conflict', async () => {
      const dirId = 'toto'
      //first call we return an existing file => conflict
      //second call, we reject as not found
      statByPathSpy
        .mockReturnValueOnce({
          data: {
            _id: 'file_id',
            _type: 'io.cozy.files'
          }
        })
        .mockRejectedValueOnce(new Error('Not Found'))

      const opts = {
        name: 'filename',
        dirId,
        conflictStrategy: 'rename',
        conflictOptions: { delimiter: '_cozy' },
        contentType: 'image/jpeg'
      }
      await fileModel.uploadFileWithConflictStrategy(cozyClient, '', opts)
      expect(createFileSpy).toHaveBeenCalledWith('', {
        ...opts,
        name: 'filename_cozy1'
      })
    })

    it('should erase the file if there is a conflict', async () => {
      const dirId = 'toto'
      //first call we return an existing file => conflict
      //second call, we reject as not found
      statByPathSpy.mockReturnValueOnce({
        data: {
          id: 'file_id'
        }
      })
      const opts = {
        name: 'filename',
        dirId,
        conflictStrategy: 'erase'
      }
      await fileModel.uploadFileWithConflictStrategy(cozyClient, '', opts)
      expect(updateFileSpy).toHaveBeenCalledWith('', {
        ...opts,
        fileId: 'file_id'
      })
    })
  })

  describe('isPlainText', () => {
    describe('using mime types', () => {
      it('should match mime types starting with "text/"', () => {
        expect(fileModel.isPlainText('text/plain')).toBe(true)
        expect(fileModel.isPlainText('text/markdown')).toBe(true)
        expect(fileModel.isPlainText('application/text')).toBe(false)
        expect(fileModel.isPlainText('something/text/else')).toBe(false)
        expect(fileModel.isPlainText('text/vnd.cozy.note+markdown')).toBe(true)
      })

      it('should not match complex text formats', () => {
        expect(fileModel.isPlainText('application/msword')).toBe(false)
        expect(
          fileModel.isPlainText('application/vnd.oasis.opendocument.text')
        ).toBe(false)
        expect(
          fileModel.isPlainText('application/x-iwork-pages-sffpages')
        ).toBe(false)
      })

      it('should not use the filename if a mime type is present', () => {
        expect(
          fileModel.isPlainText('application/msword', 'iswearitstext.txt')
        ).toBe(false)
      })
    })

    describe('using file names', () => {
      it('should match txt files', () => {
        expect(fileModel.isPlainText(undefined, 'iswearitstext.txt')).toBe(true)
      })

      it('should match md files', () => {
        expect(fileModel.isPlainText(undefined, 'markdown.md')).toBe(true)
      })

      it('should not match anything else', () => {
        expect(fileModel.isPlainText(undefined, 'file.doc')).toBe(false)
        expect(fileModel.isPlainText(undefined, 'file.docx')).toBe(false)
        expect(fileModel.isPlainText(undefined, 'file.pages')).toBe(false)
        expect(fileModel.isPlainText(undefined, 'file.odt')).toBe(false)
        expect(fileModel.isPlainText(undefined, 'file.csv')).toBe(false)
        expect(fileModel.isPlainText(undefined, 'file.vcf')).toBe(false)
      })
    })
  })

  describe('fetchBlobFileById', () => {
    const mockData = { _id: '001', name: 'file01' }

    it('should return Blob data', async () => {
      fetchFileContentByIdSpy.mockImplementation(() => ({
        blob: jest.fn().mockReturnValue(new Blob([mockData]))
      }))
      const res = await fileModel.fetchBlobFileById(cozyClient, mockData._id)

      expect(fetchFileContentByIdSpy).toHaveBeenCalledWith('001')
      expect(res instanceof Blob).toEqual(true)
      expect(res.size).toBeGreaterThan(0)
    })
  })
})

describe('File qualification', () => {
  let mockedClient
  let updateMetadataAttribute
  beforeEach(() => {
    updateMetadataAttribute = jest.fn()
    mockedClient = {
      collection: name => ({
        updateMetadataAttribute
      })
    }
  })

  it('should save the qualification', async () => {
    updateMetadataAttribute.mockImplementation((_id, attributes) => {
      return { _id, metadata: { ...attributes } }
    })
    const fileDoc = {
      _id: '123',
      metadata: {
        datetime: '2020-01-01T20:38:04Z'
      }
    }
    const qualification = Qualification.getByLabel('health_invoice')
    const updFile = await fileModel.saveFileQualification(
      mockedClient,
      fileDoc,
      qualification
    )
    expect(updFile).toEqual({
      _id: '123',
      metadata: {
        datetime: '2020-01-01T20:38:04Z',
        qualification: {
          icon: 'heart',
          label: 'health_invoice',
          sourceCategory: 'health',
          purpose: 'invoice'
        }
      }
    })
  })
})

describe('downloadFile', () => {
  it('should handle download in web page', async () => {
    const file = {
      _id: 'SOME_FILE_ID',
      _type: 'io.cozy.file',
      name: 'SOME_FILE_NAME'
    }

    await fileModel.downloadFile({
      // @ts-ignore
      client: cozyClient,
      // @ts-ignore
      file,
      webviewIntent: null
    })

    expect(downloadFromCozySpy).toHaveBeenCalledWith(file)
  })

  it('should handle download in Flagship app', async () => {
    isFlagshipApp.mockReturnValue(true)
    const webviewIntent = {
      call: jest.fn().mockResolvedValue(true)
    }

    const file = {
      _id: 'SOME_FILE_ID',
      _type: 'io.cozy.file',
      name: 'SOME_FILE_NAME'
    }

    await fileModel.downloadFile({
      // @ts-ignore
      client: cozyClient,
      // @ts-ignore
      file,
      // @ts-ignore
      webviewIntent
    })

    expect(downloadFromCozySpy).not.toHaveBeenCalled()
    expect(webviewIntent.call).toHaveBeenCalledWith(
      'isAvailable',
      'downloadFile'
    )
    expect(webviewIntent.call).toHaveBeenCalledWith('downloadFile', file)
  })

  it('should download files from web page in old Flagship app versions', async () => {
    isFlagshipApp.mockReturnValue(true)
    const webviewIntent = {
      call: jest.fn().mockResolvedValue(false) // `isAvailable` returns `false` when not implemented
    }

    const file = {
      _id: 'SOME_FILE_ID',
      _type: 'io.cozy.file',
      name: 'SOME_FILE_NAME'
    }

    await fileModel.downloadFile({
      // @ts-ignore
      client: cozyClient,
      // @ts-ignore
      file,
      // @ts-ignore
      webviewIntent
    })

    expect(downloadFromCozySpy).toHaveBeenCalled()
    expect(webviewIntent.call).toHaveBeenCalledWith(
      'isAvailable',
      'downloadFile'
    )
    expect(webviewIntent.call).not.toHaveBeenCalledWith('downloadFile', file)
  })

  it('should download encrypted files from web page as this is not supported yet by Flagship app', async () => {
    isFlagshipApp.mockReturnValue(true)
    const webviewIntent = {
      call: jest.fn()
    }

    const file = {
      _id: 'SOME_FILE_ID',
      _type: 'io.cozy.file',
      name: 'SOME_FILE_NAME',
      encrypted: true
    }

    await fileModel.downloadFile({
      // @ts-ignore
      client: cozyClient,
      // @ts-ignore
      file,
      url: 'SOME_URL',
      // @ts-ignore
      webviewIntent
    })

    expect(forceFileDownloadFromCozySpy).toHaveBeenCalledWith(
      'SOME_URL',
      'SOME_FILE_NAME'
    )
    expect(webviewIntent.call).not.toHaveBeenCalled()
  })
})
