var jQuery = require('jquery')
var Fuse = require('fuse.js')
var FontsStore = require('./fontsStore.js')
const debounce = require('lodash/debounce.js')

var containerId = '#gfp-font-families'

function appendFonts (fonts) {
  // console.time('appendFonts')
  var container = jQuery(containerId)
  jQuery('#gfp-fonts-count').text(fonts.length)
  clearFonts()
  fonts.forEach(function (fontFamily) {
    appendFont(fontFamily, container)
  }, this)
  // console.timeEnd('appendFonts')
}

function appendFont (fontFamily, container) {
  var preview = fontFamily.base64Url ? `<img src="${fontFamily.base64Url}" />` : fontFamily.family
  var html = `<div id="${fontFamily.id}" class="gfp-font-family gfp-font-family-loading gfp-clearfix" data-index="5" data-url="${fontFamily.url}" >
                    <span class="gfp-font-family-preview">
                      ${preview}
                    </span>
                    <a class="gfp-font-family-action">
                      <i class="fa fa-angle-down"></i>
                    </a>
              </div>`
  container.append(html)
}

function filterFonts (fonts) {
  var ids = []
  fonts.forEach(function (font) {
    ids.push('#' + font.id)
  }, this)
  var container = jQuery(containerId)
  container.find('>div').hide().filter(ids.join(',')).show()
  // fonts.not(ids.join(',')).hide()
}

function resetFontSearch () {
  var container = jQuery(containerId)
  container.find('>div').show()
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

function bindSearchEvent () {
  var options = {
    shouldSort: false,
    threshold: 0.6,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: [
      'family'
    ]
  }

  var searchInput = jQuery('#gfp-fonts-search-bar')
  searchInput.keyup(debounce(performSearch, 200))

  function performSearch () {
    var searchTerm = searchInput.val().trim()
    if (searchTerm === '') {
      resetFontSearch()
    } else {
      console.time('search')
      var fuse = new Fuse(FontsStore.getFontsForSearch(), options)
      var fontSearchResult = fuse.search(searchTerm)
      console.timeEnd('search')
      console.time('filter')
      filterFonts(fontSearchResult)
      console.timeEnd('filter')
    }
  }
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

function clearFonts () {
  var container = jQuery(containerId)
  container.empty()
}
module.exports = {
  appendFonts: appendFonts,
  injectFontPreview: injectFontPreview,
  updateCacheStatus: updateCacheStatus,
  hideProgress: hideProgress,
  bindSearchEvent: bindSearchEvent
}
