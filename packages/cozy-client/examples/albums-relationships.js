const {
  QueryDefinition,
  HasMany,
  createClientInteractive
} = require('cozy-client')

global.fetch = require('node-fetch') // in the browser we have native fetch
const { ArgumentParser } = require('argparse')

class HasManyReferenced extends HasMany {
  get data() {
    const refs = this.target.relationships.referenced_by.data
    const albums = refs
      ? refs.map(ref => this.get(ref.type, ref.id)).filter(Boolean)
      : []
    return albums
  }

  static query(doc, client, assoc) {
    if (
      !doc.relationships ||
      !doc.relationships.referenced_by ||
      !doc.relationships.referenced_by.data
    ) {
      return null
    }
    const included = doc['relationships']['referenced_by']['data']
    const ids = included
      .filter(inc => inc.type === assoc.doctype)
      .map(inc => inc.id)

    return new QueryDefinition({ doctype: assoc.doctype, ids })
  }
}

const schema = {
  albums: {
    doctype: 'io.cozy.photos.albums'
  },
  files: {
    doctype: 'io.cozy.files',
    relationships: {
      albums: {
        type: HasManyReferenced,
        doctype: 'io.cozy.photos.albums'
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
    doctype: 'io.cozy.files',
    limit: 50,
    selector: {
      class: 'image',
      trashed: false
    }
  }).include(['albums'])

  const resp = await client.query(query)
  const files = client.hydrateDocuments('io.cozy.files', resp.data)
  files.forEach(file => {
    console.log(file.albums.data)
  })
}

main().catch(e => console.error(e))
