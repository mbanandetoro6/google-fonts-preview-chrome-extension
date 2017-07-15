var jQuery = require('jquery')

function appendFonts (fonts) {
  var container = jQuery('#gfp-font-families')
  jQuery('#gfp-fonts-count').text(fonts.length)
  clearFonts(container)
  fonts.forEach(function (fontFamily) {
    appendFont(fontFamily, container)
  }, this)
}

function appendFont (fontFamily, container) {
  var html = `<div id="${fontFamily.id}" class="gfp-font-family gfp-font-family-loading gfp-clearfix" data-index="5" data-url="${fontFamily.url}" >
                    <span class="gfp-font-family-preview">
                      ${fontFamily.family}
                    </span>
                    <a class="gfp-font-family-action">
                      <i class="fa fa-angle-down"></i>
                    </a>
              </div>`
  container.append(html)
}

function injectFontPreview (font) {
  var id = font.id
  var element = jQuery('#gfp-font-families')
  element.removeClass('gfp-font-family-loading gfp-font-family-loading-error')
  var fontEl = element.find('#' + id)
  var previewEl = fontEl.find('.gfp-font-family-preview')
  previewEl.text('')
  previewEl.append(`<img src="${font.base64Url}" />`)
}
function updateCacheStatus (text) {
  jQuery('#gfp-font-progress').text(text)
}
function hideProgress () {
  jQuery('#gfp-cache-notice').slideUp()
}

// function onPreviewFontLoaded (fontFamily) {
//   var fontFamilyEl = jQuery('#' + fontFamily.id)
//   fontFamilyEl.removeClass('gfp-font-family-loading gfp-font-family-loading-error')
//   var previewEl = fontFamilyEl.find('.gfp-font-family-preview')
//   previewEl.attr('style', previewEl.data('style'))
// }

// function onPreviewFontLoadError (fontFamily) {
//   var fontFamilyEl = jQuery('#' + fontFamily.id)
//   fontFamilyEl.addClass('gfp-font-family-loading-error')
// }

function clearFonts (container) {
  container.empty()
}
module.exports = {
  appendFonts: appendFonts,
  injectFontPreview: injectFontPreview,
  updateCacheStatus: updateCacheStatus,
  hideProgress: hideProgress
}
