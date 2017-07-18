var jQuery = require('jquery')
var Fuse = require('fuse.js')
var FontsStore = require('./fontsStore.js')
const debounce = require('lodash/debounce.js')

var containerId = '#gfp-font-families'
var fuseOptions = {
  shouldSort: true,
  threshold: 0.6,
  location: 0,
  distance: 100,
  maxPatternLength: 16,
  minMatchCharLength: 1,
  keys: [
    'family'
  ]
}

function appendFonts (fonts) {
  setFontContainerHeight()
  bindOnResizeEvent()
  // console.time('appendFonts')
  var container = jQuery(containerId)
  jQuery('#gfp-fonts-count').text(fonts.length)
  clearFonts()

  for (var i = 0; i < fonts.length; i++) {
    var fontFamily = fonts[i]
    appendFont(fontFamily, container, i)
  }

  // console.timeEnd('appendFonts')
}

function appendFont (fontFamily, container, index) {
  var top = index * 40
  var preview = fontFamily.base64Url ? `<img src="${fontFamily.base64Url}" />` : fontFamily.family
  var html = `<div id="${fontFamily.id}" style="top:${top}px" class="gfp-font-family gfp-font-visible gfp-font-family-loading gfp-clearfix" data-index="5" data-url="${fontFamily.url}" >
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
  var container = jQuery(containerId)
  var allFonts = container.find('>div')
  allFonts.removeClass('gfp-font-visible').css('top', 0)
  for (var i = 0; i < fonts.length; i++) {
    var font = fonts[i]
    jQuery('#' + font.id).css('top', i * 40).addClass('gfp-font-visible')
  }
  // fonts.not(ids.join(',')).hide()
}

function resetFontSearch () {
  var container = jQuery(containerId)
  var allFonts = container.find('>div')
  allFonts.each((index, element) => {
    jQuery(element).css('top', (index * 40) + 'px').addClass('gfp-font-visible')
  })
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

function updateCacheStatus (progress) {
  var html = `<span id="gfp-font-progress-success">${progress.successFonts}</span> success and <span id="gfp-font-progress-error">${progress.errorFonts}</span> failed Out of ${progress.totalFonts}`
  jQuery('#gfp-font-progress').html(html)
}

function hideProgress () {
  jQuery('#gfp-cache-notice').slideUp()
  setTimeout(setFontContainerHeight, 800)
}

function bindSearchEvent () {
  jQuery('#gfp-fonts-search-bar').keyup(debounce(performSearch, 50))
}

function performSearch (e) {
  console.log(e)
  console.log('hi')
  var searchTerm = document.getElementById('gfp-fonts-search-bar').value.trim()
  if (searchTerm === '') {
    resetFontSearch()
  } else {
    console.time('search')
    var fuse = new Fuse(FontsStore.getFonts(), fuseOptions)
    var fontSearchResult = fuse.search(searchTerm)
    console.timeEnd('search')
    console.time('filter')
    filterFonts(fontSearchResult)
    console.timeEnd('filter')
  }
}

function getHeight (id) {
  var elm = jQuery(id + ':not(:hidden)')
  if (elm.length) {
    console.log(id, elm.outerHeight())
    return elm.outerHeight()
  } else {
    return 0
  }
}

function setFontContainerHeight () {
  var ids = ['#gfp-section-settings', '#gfp-section-main', '#gfp-fonts-search-wrap', '#gfp-cache-notice']
  var offset = 0
  ids.forEach(function (id) {
    offset += getHeight(id)
  })
  var totalHeight = jQuery(window).height()
  var height = totalHeight - offset
  jQuery(containerId).height(height)
}

function bindOnResizeEvent () {
  jQuery(window).resize(debounce(setFontContainerHeight, 250))
}

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
