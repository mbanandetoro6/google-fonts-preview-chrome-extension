'use strict'
var Initialize = require('./main/init.js')
var Fonts = require('./main/fonts.js')

Initialize().then(afterInit).catch((error) => {
  window.alert(error.message)
})

function afterInit () {
  console.log('init complete')
  console.log(Fonts)
  Fonts.loadFonts()
}
