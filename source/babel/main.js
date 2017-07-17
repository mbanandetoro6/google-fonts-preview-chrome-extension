'use strict'
var Initialize = require('./main/init.js')
var Fonts = require('./main/fontsApi.js')

Initialize().then(afterInit).catch((error) => {
  window.alert(error.message)
})

function afterInit () {
  Fonts.loadFonts()
}
