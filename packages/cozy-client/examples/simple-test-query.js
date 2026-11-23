const { ArgumentParser } = require('argparse')

const CozyClient = require('../dist/index.node')
const { createClientInteractive, Q } = require('../dist/index.node')

global.fetch = require('node-fetch')

const DOCTYPE = 'io.cozy.files'
const QUERY = Q(DOCTYPE)
  .where({
    'cozyMetadata.createdByApp': 'drive'
  })
  .indexFields(['cozyMetadata.createdByApp'])
  .limitBy(100)

const main = async () => {
  const parser = new ArgumentParser()
  parser.addArgument('--url', { defaultValue: 'http://cozy.localhost:8080' })
  parser.addArgument('--token')

  const args = parser.parseArgs()

  let client
  if (args.token) {
    // You can generate token with `cozy-stack instances token-cli cozy.localhost:8080 io.cozy.files`
    client = new CozyClient({
      uri: args.url,
      token: args.token
    })
  } else {
    console.log('No token provided, lets do OAuth')
    client = await createClientInteractive({
      scope: [DOCTYPE],
      uri: args.url,
      oauth: {
        softwareID: 'io.cozy.client.cli'
      }
    })
  }

  const resp = await client.query(QUERY)
  console.log(resp)
}

main().catch(e => console.error(e))
