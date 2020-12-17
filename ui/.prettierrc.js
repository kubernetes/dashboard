const gtsConfig = require('gts/.prettierrc.json')
const _ = require('lodash')

const modifiedConfig = _.merge(
  {},
  gtsConfig,
  {
    semi: true,
    arrowParens: 'avoid',
    printWidth: 120,
  }
)

module.exports = modifiedConfig
