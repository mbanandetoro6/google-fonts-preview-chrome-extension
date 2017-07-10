var init = require('./_init.js')
var font = require('./_fonts.js')
var dom = require('./_dom.js')
// var $ = require('cash-dom')

init().then(afterInit)

function afterInit () {
  font.getFonts().then(function (fonts) {
    dom.appendFonts(fonts)
    bindEvents()
  }).catch(function (err) {
    console.log(err)
  })
}

function bindEvents () {
 // dom.loadPreviewOnHover()
}
