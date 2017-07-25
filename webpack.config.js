const path = require('path')
var isProduction = process.env.NODE_ENV === 'production'
module.exports = {
  devtool: isProduction ? false : 'source-map',
  entry: {
    main: './source/es6/main.js',
    background: './source/es6/background.js'
  },
  output: {
    path: path.join(__dirname, './source/js/'),
    filename: '[name].js'
  },
  module: {
    rules: [{
      test: isProduction ? /\.js$/ : /\.ignoreThisFile$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader?optional=runtime&cacheDirectory',
        options: {
          presets: ['env']
        }
      }
    }]
  }
}
