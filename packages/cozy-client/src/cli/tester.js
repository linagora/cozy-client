/* eslint-disable-file no-console */

import { ArgumentParser } from 'argparse'

import { createClientInteractive } from '.'

const parseArgs = () => {
  const parser = new ArgumentParser()
  parser.addArgument('--url', {
    description: 'HTTP URL of the targeted cozy',
    defaultValue: 'http://cozy.tools:8080'
  })
  const args = parser.parseArgs()
  return args
}

const main = async () => {
  const args = parseArgs()
  const client = await createClientInteractive({
    uri: args.url,
    scope: ['io.cozy.bank.operations'],
    oauth: {
      softwareID: 'fake-software-id',
      clientURI: 'http://testcozy.mycozy.cloud',
      softwareVersion: '1.1.0',
      logoURI: 'http://my-logo.com/logo.jpg'
    }
  })
  const { data: docs } = await client
    .collection('io.cozy.bank.operations')
    .all()
  console.log(docs)
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
