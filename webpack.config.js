const path = require('path')
module.exports = {
  entry: {
    main: './source/babel/main.js',
    background: './source/babel/background.js'
  },
  output: {
    path: path.join(__dirname, './source/js/'),
    filename: '[name].js'
  }
}
