const packageJson = require('./packages/cozy-client/package.json')

module.exports = function (api) {
  api.cache(true)

  return {
    presets: [['cozy-app']],
    plugins: [
      [
        'search-and-replace',
        {
          rules: [
            {
              search: 'COZY_CLIENT_VERSION_PACKAGE',
              replace: packageJson.version
            }
          ]
        }
      ]
    ]
  }
}
