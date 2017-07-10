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
  var name = fontFamily.family.replace(/\s+/g, '')
  var html = `<div id="${fontFamily.id}" class="gfp-font-family gfp-font-family-loading gfp-clearfix" data-index="5" data-load="${fontFamily.load}" >
                    <span class="gfp-font-family-name">${fontFamily.family}</span>
                    <a class="gfp-font-family-action">
                        <i class="fa fa-angle-down"></i>
                    </a>
                    <span data-style="font-family:'${fontFamily.family}','Ubuntu Mono'" data-text="${fontFamily.family}" class="gfp-font-family-preview">
                    Loading...
                    </span>
              </div>`
  container.append(html)
}

function onPreviewFontLoaded (fontFamily) {
  var fontFamilyEl = $('#' + fontFamily.id)
  fontFamilyEl.removeClass('gfp-font-family-loading gfp-font-family-loading-error')
  var previewEl = fontFamilyEl.find('.gfp-font-family-preview')
  previewEl.attr('style', previewEl.data('style'))
  previewEl.text(previewEl.data('text'))
}

function onPreviewFontLoadError (fontFamily) {
  console.log('err on  - ' + fontFamily.id)
  var fontFamilyEl = $('#' + fontFamily.id)
  fontFamilyEl.addClass('gfp-font-family-loading-error')
  var previewEl = fontFamilyEl.find('.gfp-font-family-preview')
  previewEl.text('<Error Loading/>').attr('title', 'click to try reloading')
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
  loadPreviewOnHover: loadPreviewOnHover,
  onPreviewFontLoaded: onPreviewFontLoaded,
  onPreviewFontLoadError: onPreviewFontLoadError
}
