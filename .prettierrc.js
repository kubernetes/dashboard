const gtsConfig = require('gts/.prettierrc.json')
const _ = require('lodash')

const modifiedConfig = _.merge(
  {},
  gtsConfig,
  {
    arrowParens: 'avoid',
    bracketSpacing: false,
    insertPragma: false,
    printWidth: 120,
    requirePragma: false,
    semi: true,
    singleQuote: true,
    tabWidth: 2,
    trailingComma: 'all',
    useTabs: false,
  }
)

module.exports = modifiedConfig
