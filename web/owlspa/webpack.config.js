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
        presets: ['react', 'es2015', 'stage-1']
      }
    },{ 
      test: /\.css$/, 
      loader: 'style-loader!css-loader?modules' 
    }]
  },
  devtool: 'inline-source-map',
  externals: {
    'cheerio': 'window',
    'react/addons': true,
    'react/lib/ExecutionEnvironment': true,
    'react/lib/ReactContext': true
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
    modulesDirectories: [
      'src',
      'node_modules'
    ]
  }
};