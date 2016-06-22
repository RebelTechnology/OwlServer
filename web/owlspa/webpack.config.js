var path = require("path");

module.exports = {
  entry: [
    './src/index.js'
  ],
  output: {
    path: path.join(__dirname, '../wordpress/wp-content/themes/hoxton-owl-2014/page-patch-library/js'),
    publicPath: '/',
    filename: 'bundle.js'
  },
  module: {
    loaders: [{
      exclude: /node_modules/,
      loader: 'babel',
      query: {
        presets: ['react', 'es2015']
      }
    }]
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  }
};