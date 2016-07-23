var baseConfig = require('./webpack.base.config');
var webpack = require('webpack');

module.exports = Object.assign({}, baseConfig, {
  plugins: baseConfig.plugins.concat([
    new webpack.optimize.UglifyJsPlugin({
      minimize: true,
      compress: {
        warnings: false
      }
    }),
    new webpack.optimize.DedupePlugin()
  ])
});