var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

module.exports = merge(prodEnv, process.argv.length > 2 ? {} : {
  NODE_ENV: '"development"'
})
