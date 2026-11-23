const { ArgumentParser } = require('argparse')

const CozyClient = require('cozy-client').default
const { createClientInteractive } = require('cozy-client')

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
      scope: ['io.cozy.files'],
      uri: args.url,
      oauth: {
        softwareID: 'io.cozy.client.cli'
      }
    })
  }

  // Create a dir
  const dummyDir = {
    _type: 'io.cozy.files',
    type: 'directory',
    name: `TestDir-${Date.now()}`, // Add timestamp to avoid conflicts on name
    contentType: 'text/plain',
    dirId: 'io.cozy.files.root-dir'
  }
  let resp = await client.save(dummyDir)
  const dirId = resp.data._id
  console.log('Directory id : ', dirId)

  // Create a file in dir
  const dummyFileContent = Buffer.from('dummy text')
  const dummyFile = {
    _type: 'io.cozy.files',
    type: 'file',
    name: `test-${Date.now()}.txt`,
    contentType: 'text/plain',
    dirId: dirId,
    data: dummyFileContent
  }
  resp = await client.save(dummyFile)
  console.log('File created: ', resp)
}

main().catch(e => console.error(e))
