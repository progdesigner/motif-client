
const path = require('path')

module.exports = {
  chainWebpack: config => {
    config.resolve.alias.set('@motif', path.join(__dirname, './@motif'))
  },
  devServer: {
    disableHostCheck: true
  }
}
