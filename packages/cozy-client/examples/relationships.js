const { ArgumentParser } = require('argparse')

const {
  QueryDefinition,
  HasManyInPlace,
  createClientInteractive
} = require('cozy-client')

class HasManyBills extends HasManyInPlace {
  get data() {
    return this.raw
      ? this.raw.map(doctypeId => {
          const [doctype, id] = doctypeId.split(':')
          return this.get(doctype, id)
        })
      : []
  }

  static query(doc, client, assoc) {
    if (!doc[assoc.name]) {
      return null
    }
    const included = doc[assoc.name]
    const ids = included.indexOf(':')
      ? included.map(x => x.split(':')[1])
      : included

    return new QueryDefinition({ doctype: assoc.doctype, ids })
  }
}
const TRANSACTION_DOCTYPE = 'io.cozy.bank.operations'
const BILLS_DOCTYPE = 'io.cozy.bills'

const schema = {
  transactions: {
    doctype: TRANSACTION_DOCTYPE,
    attributes: {},
    relationships: {
      bills: {
        type: HasManyBills,
        doctype: BILLS_DOCTYPE
      }
    }
  }
}

global.fetch = require('node-fetch') // in the browser we have native fetch

const main = async () => {
  const parser = new ArgumentParser()
  parser.addArgument('--url', { defaultValue: 'http://cozy.tools:8080' })
  const args = parser.parseArgs()

  const client = await createClientInteractive({
    scope: [TRANSACTION_DOCTYPE, BILLS_DOCTYPE],
    uri: args.url,
    schema,
    oauth: {
      softwareID: 'io.cozy.client.cli'
    }
  })

  const query = new QueryDefinition({
    doctype: 'io.cozy.bank.operations',
    limit: 500,
    selector: {
      bills: {
        $exists: true
      }
    }
  }).include(['bills'])
  if (args.selector) {
    query.selector = args.selector ? JSON.parse(args.selector) : null
  }
  const resp = await client.query(query)
  const transactions = client
    .hydrateDocuments(TRANSACTION_DOCTYPE, resp.data)
    .filter(tr => tr.bills && tr.bills.data.length > 0)
  transactions.forEach(transaction => {
    const bill = transaction.bills.data[0]
    if (!bill) {
      return
    }
    console.log(
      `${transaction.label} ${new Date(transaction.date).toLocaleDateString(
        'en-GB'
      )} -> ${bill.filename || bill.invoice}`
    )
  })
}

main().catch(e => console.error(e))
