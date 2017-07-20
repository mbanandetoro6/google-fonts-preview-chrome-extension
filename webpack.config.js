const path = require('path')
var isProduction = process.env.NODE_ENV === 'production'
module.exports = {
  devtool: isProduction ? false : 'source-map',
  entry: {
    main: './source/babel/main.js',
    background: './source/babel/background.js'
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
