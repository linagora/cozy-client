'use strict'
const path = require('path')

const fs = require('fs-extra')
const glob = require('glob')
const jsdoc2md = require('jsdoc-to-markdown')

const globPromise = (pattern, options) =>
  new Promise((resolve, reject) => {
    glob.glob(pattern, {}, (err, files) => {
      if (err) {
        reject(err)
      } else {
        resolve(files)
      }
    })
  })

const docsFolder = path.join(__dirname, '../docs')
const main = async () => {
  const packages = await globPromise('packages/*')
  await fs.mkdirp(path.resolve(docsFolder, 'api'))
  for (let pkg of packages) {
    if (pkg === 'packages/cozy-client' || pkg === 'packages/cozy-pouch-link') {
      continue // documentation for cozy-client is made via typedoc
    }
    const files = await globPromise(`${pkg}/src/**/*.js*`, {
      ignore: ['*.spec.js']
    })
    if (files.length === 0) {
      continue
    }
    const pkgName = pkg.split('/')[1]
    const template = `{{>main}}`
    const templateData = jsdoc2md.getTemplateDataSync({
      files,
      configure: path.join(__dirname, '../', 'jsdoc.json')
    })
    const output = jsdoc2md.renderSync({
      data: templateData,
      template: template
    })
    fs.writeFileSync(path.resolve(docsFolder, 'api', `${pkgName}.md`), output)
  }
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
