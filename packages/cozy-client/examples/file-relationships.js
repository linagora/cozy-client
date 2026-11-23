const { ArgumentParser } = require('argparse')

const { QueryDefinition, createClientInteractive } = require('cozy-client')

global.fetch = require('node-fetch') // in the browser we have native fetch

const schema = {
  albums: {
    doctype: 'io.cozy.photos.albums',
    attributes: {
      name: {
        type: 'string',
        unique: true
      }
    },
    relationships: {
      photos: {
        type: 'has-many',
        doctype: 'io.cozy.files'
      }
    }
  }
}

const main = async () => {
  const parser = new ArgumentParser()
  parser.addArgument('--url', { defaultValue: 'http://cozy.tools:8080' })
  const args = parser.parseArgs()

  const client = await createClientInteractive({
    scope: ['io.cozy.photos.albums', 'io.cozy.files'],
    uri: args.url,
    schema,
    oauth: {
      softwareID: 'io.cozy.client.cli'
    }
  })
  const query = new QueryDefinition({
    doctype: 'io.cozy.photos.albums',
    limit: 10
  }).include(['photos'])

  const resp = await client.query(query)
  let albums = client.hydrateDocuments('io.cozy.photos.albums', resp.data)
  const albumId = albums[0]._id
  // Paginate relationships
  while (albums[0].photos.hasMore) {
    await albums[0].photos.fetchMore()
    const fromState = client.getDocumentFromState(
      'io.cozy.photos.albums',
      albumId
    )
    albums = client.hydrateDocuments('io.cozy.photos.albums', [fromState])
  }
  console.log(albums[0].name)
  console.log(albums[0].photos.data)
  console.log('Number of photos fetched : ', albums[0].photos.data.length)
}

main().catch(e => console.error(e))
