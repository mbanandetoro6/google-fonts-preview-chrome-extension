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
                    <span data-style="font-family:'${fontFamily.family}','Ubuntu Mono'" class="gfp-font-family-preview">
                      ${fontFamily.family}
                    </span>
                    <a class="gfp-font-family-action">
                      <i class="fa fa-angle-down"></i>
                    </a>
                    <span class="gfp-font-loader"></span>
              </div>`
  container.append(html)
}

function onPreviewFontLoaded (fontFamily) {
  var fontFamilyEl = $('#' + fontFamily.id)
  fontFamilyEl.removeClass('gfp-font-family-loading gfp-font-family-loading-error')
  var previewEl = fontFamilyEl.find('.gfp-font-family-preview')
  previewEl.attr('style', previewEl.data('style'))
}

function onPreviewFontLoadError (fontFamily) {
  var fontFamilyEl = $('#' + fontFamily.id)
  fontFamilyEl.addClass('gfp-font-family-loading-error')
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
  onPreviewFontLoaded: onPreviewFontLoaded,
  onPreviewFontLoadError: onPreviewFontLoadError
}
