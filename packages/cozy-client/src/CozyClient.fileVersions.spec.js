import CozyStackClient from '../../cozy-stack-client/src/CozyStackClient'
import CozyClient from './CozyClient'
import { Q } from './queries/dsl'

const FILES_DOCTYPE = 'io.cozy.files'
const VERSIONS_DOCTYPE = 'io.cozy.files.versions'

const schema = {
  files: {
    doctype: FILES_DOCTYPE,
    relationships: {
      old_versions: { type: 'has-many', doctype: VERSIONS_DOCTYPE }
    }
  }
}

const makeVersion = id => ({
  type: VERSIONS_DOCTYPE,
  id,
  attributes: { size: '12', updated_at: '2026-11-13T10:00:00Z' },
  meta: { rev: '1-abc' }
})

const fileWithVersions = {
  data: {
    type: FILES_DOCTYPE,
    id: 'file-id',
    attributes: { type: 'file', name: 'notes.txt', dir_id: 'dir-id' },
    meta: { rev: '3-ghi' },
    relationships: {
      old_versions: {
        data: [
          { type: VERSIONS_DOCTYPE, id: 'file-id/v1' },
          { type: VERSIONS_DOCTYPE, id: 'file-id/v2' }
        ]
      }
    }
  },
  included: [makeVersion('file-id/v1'), makeVersion('file-id/v2')]
}

function setup() {
  const stackClient = new CozyStackClient({ uri: 'https://member.example' })
  const client = new CozyClient({ stackClient, schema })
  const fetchJSON = jest
    .spyOn(stackClient, 'fetchJSON')
    .mockResolvedValue(fileWithVersions)
  return { client, fetchJSON }
}

function findOldVersions(client) {
  const file = client.getDocumentFromState(FILES_DOCTYPE, 'file-id')
  return client.hydrateDocument(file).old_versions.data
}

describe('file versions', () => {
  it('resolves the old versions of a file from its included documents', async () => {
    const { client } = setup()

    await client.query(Q(FILES_DOCTYPE).getById('file-id'), { as: 'file' })

    expect(findOldVersions(client)).toEqual([
      expect.objectContaining({ _id: 'file-id/v1', _type: VERSIONS_DOCTYPE }),
      expect.objectContaining({ _id: 'file-id/v2', _type: VERSIONS_DOCTYPE })
    ])
  })

  it('resolves the old versions of a shared drive file through the drive', async () => {
    const { client, fetchJSON } = setup()

    await client.query(
      Q(FILES_DOCTYPE)
        .getById('file-id')
        .sharingById('drive-id'),
      { as: 'drive-file' }
    )

    expect(fetchJSON).toHaveBeenCalledWith(
      'GET',
      '/sharings/drives/drive-id/file-id'
    )
    expect(findOldVersions(client)).toEqual([
      expect.objectContaining({
        _id: 'file-id/v1',
        _type: VERSIONS_DOCTYPE,
        driveId: 'drive-id'
      }),
      expect.objectContaining({
        _id: 'file-id/v2',
        _type: VERSIONS_DOCTYPE,
        driveId: 'drive-id'
      })
    ])
  })
})
