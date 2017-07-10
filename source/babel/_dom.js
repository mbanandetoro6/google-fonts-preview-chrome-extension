var core = require('./_core.js')
var font = require('./_fonts.js')
var $ = require('cash-dom')

function appendFonts (fonts) {
  var container = $('#gfp-font-families')
  clearFonts(container)
  fonts.forEach(function (fontFamily) {
    appendFont(fontFamily, container)
  }, this)
}

function appendFont (fontFamily, container, link) {
  var html = `<div class="gfp-font-family gfp-clearfix" data-index="5" data-url="${fontFamily.url}" data-load="${fontFamily.family}:&text=${fontFamily.family}">
                    <span class="gfp-font-family-name">${fontFamily.family}</span>
                    <a class="gfp-font-family-action">
                        <i class="fa fa-angle-down"></i>
                    </a>
                    <span data-style="font-family:'${fontFamily.family}','Ubuntu Mono'"  class="gfp-font-family-preview">${fontFamily.family}</span>
              </div>`
  container.append(html)
}

function loadPreviewOnHover () {
  $('#gfp-font-families').on('click', '.gfp-font-family-preview', function () {
    var span = $(this)
    var div = span.parent('.gfp-font-family')
    var shortUrl = div.data('load')
    font.loadGoogleFont(shortUrl).then(function () {
      span.attr('style', span.data('style'))
    }).catch(function (err) {
      console.log('e', err)
    })
  })
}

function clearFonts (container) {
  container.empty()
}

function setHeight () {
  // var container = document.getElementById('gfp-font-families')
}
module.exports = {
  appendFonts: appendFonts,
  setHeight: setHeight,
  loadPreviewOnHover: loadPreviewOnHover
}
