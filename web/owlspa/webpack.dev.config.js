var baseConfig = require('./webpack.base.config');
var webpack = require('webpack');

module.exports = Object.assign({}, baseConfig, {
  entry: baseConfig.entry.concat([
    'webpack-dev-server/client?http://0.0.0.0:3000',
    'webpack/hot/only-dev-server'
  ]),
  plugins: baseConfig.plugins.concat([
    new webpack.HotModuleReplacementPlugin()
  ]),
  devServer: {
    hot: true,
    port: 3000
  }
});