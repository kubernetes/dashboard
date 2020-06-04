const gtsConfig = require('gts/.prettierrc.json')
const _ = require('lodash')

const modifiedConfig = _.merge(
  {},
  gtsConfig,
  {
    insertPragma: false,
    printWidth: 120,
    requirePragma: false,
    semi: true,
    tabWidth: 2,
    trailingComma: 'all',
    useTabs: false,
  }
)

module.exports = modifiedConfig
