import CozyStackClient from '../../cozy-stack-client/src/CozyStackClient'
import CozyClient from './CozyClient'
import { Q } from './queries/dsl'
import { ensureFilePath } from './helpers/realtime'
import {
  dispatchCreate,
  dispatchUpdate,
  dispatchDelete
} from './store/realtime'

const doctype = 'io.cozy.files'
const scopes = [null, 'drive-a', 'drive-b']
const folder = {
  id: 'new-folder',
  type: doctype,
  attributes: { type: 'directory', name: 'New folder', dir_id: 'parent-id' },
  meta: { rev: '1-created' }
}

function setup() {
  const stackClient = new CozyStackClient({ uri: 'https://recipient.example' })
  const client = new CozyClient({ stackClient })
  const fetchJSON = jest.spyOn(stackClient, 'fetchJSON')
  const definitions = scopes.map(driveId => {
    const definition = Q(doctype).where({ type: 'directory' })
    return driveId ? definition.sharingById(driveId) : definition
  })
  definitions.forEach((definition, index) => {
    client.makeObservableQuery(definition, { as: scopes[index] || 'personal' })
  })
  return { client, fetchJSON, definitions }
}

function getCachedIds(client) {
  return scopes.map(driveId =>
    client.getQueryFromState(driveId || 'personal').data.map(doc => doc._id)
  )
}

function makeSyncedFolders() {
  return scopes.map((driveId, index) => ({
    _id: `folder-${index}`,
    _type: doctype,
    ...folder.attributes,
    ...(driveId ? { driveId } : {})
  }))
}

describe('file query cache scope', () => {
  it('keeps shared query results out of personal and other shared lists', async () => {
    const { client, fetchJSON, definitions } = setup()
    fetchJSON.mockResolvedValue({ data: [folder], meta: { count: 1 } })

    const response = await client.query(definitions[1], { as: 'refetched-a' })

    expect(response.data[0]).toMatchObject({
      _id: folder.id,
      driveId: 'drive-a'
    })
    expect(getCachedIds(client)).toEqual([[], [folder.id], []])
  })

  it('keeps shared getById included children in the same drive scope', async () => {
    const { client, fetchJSON } = setup()
    fetchJSON.mockResolvedValue({
      data: { ...folder, id: 'parent-id' },
      included: [folder]
    })

    const response = await client.query(
      Q(doctype).getById('parent-id').sharingById('drive-a'),
      { as: 'shared-parent' }
    )

    expect(response.included[0]).toMatchObject({
      _id: folder.id,
      driveId: 'drive-a'
    })
    expect(client.getDocumentFromState(doctype, folder.id).driveId).toBe(
      'drive-a'
    )
  })

  it('does not treat a business driveId field on other doctypes as file scope', () => {
    const { client } = setup()
    client.makeObservableQuery(Q('io.cozy.todos'), { as: 'todos' })
    const task = {
      _id: 'task-id',
      _type: 'io.cozy.todos',
      driveId: 'business-data'
    }

    client.setData({ 'io.cozy.todos': [task] })

    expect(client.getQueryFromState('todos').data).toEqual([task])
  })

  it('keeps the driveId query option in the query and cache scope', async () => {
    const { client, fetchJSON, definitions } = setup()
    fetchJSON.mockResolvedValue({ data: [folder], meta: { count: 1 } })

    await client.query(definitions[0], {
      as: 'drive-option',
      driveId: 'drive-a'
    })

    expect(fetchJSON.mock.calls[0][1]).toBe('/sharings/drives/drive-a/_find')
    expect(getCachedIds(client)).toEqual([[], [folder.id], []])
  })

  it.each(scopes)(
    'isolates realtime create, update and delete for scope %s',
    async driveId => {
      const { client } = setup()
      const document = { _id: folder.id, ...folder.attributes }
      const options = { driveId }
      const expected = scopes.map(scope =>
        scope === driveId ? [folder.id] : []
      )

      await dispatchCreate(client, doctype, document, options)
      await dispatchCreate(client, doctype, document, options)
      expect(getCachedIds(client)).toEqual(expected)

      await dispatchUpdate(
        client,
        doctype,
        { ...document, name: 'Renamed' },
        options
      )
      expect(getCachedIds(client)).toEqual(expected)
      expect(client.getQueryFromState(driveId || 'personal').data[0].name).toBe(
        'Renamed'
      )

      await dispatchDelete(client, doctype, document, options)
      expect(getCachedIds(client)).toEqual([[], [], []])
    }
  )

  it('keeps the shared parent lookup scoped when enhancing a realtime path', async () => {
    const { client, fetchJSON } = setup()
    fetchJSON.mockResolvedValue({
      data: {
        id: 'parent-id',
        type: doctype,
        attributes: { type: 'directory', name: 'Shared', path: '/Shared' },
        meta: { rev: '1-parent' }
      }
    })
    await client.query(Q(doctype).getById('parent-id').sharingById('drive-a'))
    fetchJSON.mockClear()

    await dispatchCreate(
      client,
      doctype,
      { _id: folder.id, ...folder.attributes },
      { driveId: 'drive-a', enhanceDocFn: ensureFilePath }
    )

    expect(client.getDocumentFromState(doctype, folder.id)).toMatchObject({
      driveId: 'drive-a',
      path: '/Shared/New folder'
    })
    expect(getCachedIds(client)).toEqual([[], ['parent-id', folder.id], []])
    expect(fetchJSON).not.toHaveBeenCalled()
  })

  it('keeps the drive scope already carried by realtime documents', async () => {
    const { client } = setup()

    await dispatchCreate(client, doctype, {
      _id: folder.id,
      ...folder.attributes,
      driveId: 'drive-b'
    })

    expect(getCachedIds(client)).toEqual([[], [], [folder.id]])
  })

  it('uses the realtime document driveId when the option targets another drive', async () => {
    const { client } = setup()
    const document = {
      _id: folder.id,
      ...folder.attributes,
      driveId: 'drive-a'
    }
    const options = { driveId: 'drive-b' }

    await dispatchCreate(client, doctype, document, options)
    expect(getCachedIds(client)).toEqual([[], [folder.id], []])

    await dispatchUpdate(
      client,
      doctype,
      { ...document, name: 'Renamed' },
      options
    )
    expect(getCachedIds(client)).toEqual([[], [folder.id], []])
    expect(client.getQueryFromState('drive-a').data[0].name).toBe('Renamed')

    await dispatchDelete(client, doctype, document, options)
    expect(getCachedIds(client)).toEqual([[], [], []])
  })

  it('isolates a mixed offline sync batch and reads from the store', async () => {
    const { client, definitions } = setup()
    const documents = makeSyncedFolders()

    client.setData({ [doctype]: documents })
    expect(getCachedIds(client)).toEqual([
      ['folder-0'],
      ['folder-1'],
      ['folder-2']
    ])

    for (let index = 0; index < scopes.length; index++) {
      const response = await client.query(definitions[index], {
        as: `from-store-${index}`,
        executeFromStore: true
      })
      expect(response.data).toEqual([documents[index]])

      const idsQuery = Q(doctype).getByIds(documents.map(doc => doc._id))
      const driveId = scopes[index]
      const idsResponse = await client.query(
        driveId ? idsQuery.sharingById(driveId) : idsQuery,
        { as: `ids-from-store-${index}`, executeFromStore: true }
      )
      expect(idsResponse.data).toEqual([documents[index]])
    }
  })

  it('preserves explicit driveId selectors used by offline shared-folder queries', () => {
    const { client } = setup()
    client.makeObservableQuery(
      Q(doctype).where({ type: 'directory', driveId: 'drive-a' }),
      { as: 'offline-drive-a' }
    )
    const documents = makeSyncedFolders()

    client.setData({ [doctype]: documents })

    expect(client.getQueryFromState('offline-drive-a').data).toEqual([
      documents[1]
    ])
    expect(getCachedIds(client)).toEqual([
      ['folder-0'],
      ['folder-1'],
      ['folder-2']
    ])
  })

  it('keeps an observable query scoped when driveId is passed as an option', async () => {
    const { client, fetchJSON } = setup()
    const definition = Q(doctype).getById(folder.id)
    const personal = client.makeObservableQuery(definition)
    const shared = client.makeObservableQuery(definition, {
      driveId: 'drive-a'
    })
    expect(shared.queryId).not.toBe(personal.queryId)
    fetchJSON.mockResolvedValue({ data: folder })

    await shared.fetch()

    expect(shared.currentResult().data).toMatchObject({
      _id: folder.id,
      driveId: 'drive-a'
    })
    expect(client.getQueryFromState(personal.queryId).data).toEqual([])
    expect(getCachedIds(client)).toEqual([[], [folder.id], []])
  })

  it('gives getById queries different cache keys and only updates the matching scope', async () => {
    const { client, fetchJSON } = setup()
    const queries = scopes.map(driveId => {
      const definition = Q(doctype).getById(folder.id)
      return client.makeObservableQuery(
        driveId ? definition.sharingById(driveId) : definition
      )
    })
    expect(queries.map(query => query.queryId)).toEqual([
      `${doctype}/${folder.id}`,
      `${doctype}/drive/drive-a/${folder.id}`,
      `${doctype}/drive/drive-b/${folder.id}`
    ])
    fetchJSON.mockResolvedValue({ data: folder })

    await client.create(
      doctype,
      { type: 'directory', name: 'New folder', dirId: 'parent-id' },
      undefined,
      { driveId: 'drive-a', forceLink: 'stack' }
    )

    expect(
      queries.map(query => query.currentResult().data?._id || null)
    ).toEqual([null, folder.id, null])
    const wrongScope = await client.query(Q(doctype).getById(folder.id), {
      as: 'personal-from-store',
      executeFromStore: true
    })
    expect(wrongScope.data).toBe(null)
  })
})
