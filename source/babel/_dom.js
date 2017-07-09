var core = require('./_core.js')
var font = require('./_fonts.js')

function appendFonts (fonts) {
  var container = document.getElementById('gfp-font-families')
  clearFonts(container)
  fonts.forEach(function (fontFamily) {
    appendFont(fontFamily, container)
  }, this)
}

function appendFont (fontFamily, container, link) {
  var html = `<div class="gfp-font-family gfp-clearfix" data-index="5" data-url="${fontFamily.url}" data-load="${fontFamily.family}&text=${fontFamily.family}">
                    <span class="gfp-font-family-name">${fontFamily.family}</span>
                    <a class="gfp-font-family-action">
                        <i class="fa fa-angle-down"></i>
                    </a>
                    <span data-style="font-family:'${fontFamily.family}','Ubuntu Mono'"  class="gfp-font-family-preview">${fontFamily.family}</span>
              </div>`
  container.insertAdjacentHTML('beforeend', html)
}

function clearFonts (container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild)
  }
}

function setHeight () {
  var container = document.getElementById('gfp-font-families')
}
module.exports = {
  appendFonts: appendFonts,
  setHeight: setHeight
}
