const { ArgumentParser } = require('argparse')

const { createClientInteractive } = require('cozy-client')

const {
  schema,
  createFolderWithFilesBulk,
  deleteFile
} = require('./helpers/file')

global.fetch = require('node-fetch') // in the browser we have native fetch

/**
 * Several utilities for files management:
 * - Create a folder with files
 * - Delete it
 * - Delete all the files without path that are not trashed
 * - Get all the files
 *
 */
const main = async () => {
  const parser = new ArgumentParser()
  parser.addArgument('--url', { defaultValue: 'http://cozy.localhost:8080' })
  const args = parser.parseArgs()

  const client = await createClientInteractive({
    scope: ['io.cozy.files'],
    uri: args.url,
    schema,
    oauth: {
      softwareID: 'io.cozy.client.cli'
    }
  })

  const count = 1000

  const folder = await createFolderWithFilesBulk(client, count)
  await deleteFile(client, folder)
}

// eslint-disable-next-line no-console
main().catch(e => console.error(e))
