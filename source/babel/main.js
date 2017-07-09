var core = require('./_core.js')
var init = require('./_init.js')
// var $ = require('cash-dom')

init().then(afterInit)

function afterInit () {
  console.log('init complete')
}
