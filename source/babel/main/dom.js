var jQuery = require('jquery')
var Fuse = require('fuse.js')
var FontsStore = require('./fontsStore.js')
const debounce = require('lodash/debounce.js')
const previewFonts = require('./previewFonts.js')

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

function bindEvents () {
  setFontContainerHeight()
  bindOnWindowResize()
  bindOnFontClick()
  bindOnItalicClick()
}

function appendFonts (fonts) {
  bindEvents()
  var container = jQuery(containerId)
  jQuery('#gfp-fonts-count').text(fonts.length)
  clearFonts()
  var html = ''
  for (var i = 0; i < fonts.length; i++) {
    var fontFamily = fonts[i]
    html += getHtmlForFont(fontFamily, i)
  }
  container.append(html)
}

function getHtmlForFont (fontFamily, index) {
  var top = index * 40
  var preview = fontFamily.base64Url ? `<img alt="${fontFamily.family}" title="${fontFamily.family}" src="${fontFamily.base64Url}" />` : fontFamily.family
  var supportedVariant = fontFamily.variants.includes('regular') ? 400 : fontFamily.variants[0]
  var html = `<div  id="${fontFamily.id}" 
                    style="top:${top}px" 
                    class="gfp-font-family gfp-font-visible gfp-font-family-loading gfp-clearfix"
                    data-index="5"
                    data-font-family="${fontFamily.family}" 
                    data-font-variant="${supportedVariant}"
                    data-font-url="${fontFamily.url}" >
                    <span class="gfp-font-family-preview">
                      ${preview}
                    </span>
                    <a class="gfp-font-family-action">
                      <i class="fa fa-angle-down"></i>
                    </a>
              </div>`
  return html
}

function clearFonts () {
  var container = jQuery(containerId)
  container.empty()
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

function showProgress () {
  jQuery('#gfp-cache-notice').show()
  setTimeout(setFontContainerHeight, 800)
}

function bindSearchEvent () {
  jQuery('#gfp-fonts-search-bar').keyup(debounce(performSearch, 50))
}

function performSearch () {
  var searchTerm = document.getElementById('gfp-fonts-search-bar').value.trim()
  if (searchTerm === '') {
    resetFontSearch()
  } else {
    var fuse = new Fuse(FontsStore.getFonts(), fuseOptions)
    var fontSearchResult = fuse.search(searchTerm)
    filterFonts(fontSearchResult)
  }
}

function getHeight (id) {
  var elm = jQuery(id + ':not(:hidden)')
  if (elm.length) {
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

function bindOnWindowResize () {
  jQuery(window).resize(debounce(setFontContainerHeight, 250))
}

function bindOnFontClick () {
  var cssSelectorsEl = jQuery('#gfp-css-selectors')
  var fontWeightEl = jQuery('#gfp-font-weight')
  var italicEl = jQuery('#gfp-action-italic')
  jQuery(containerId).on('click', '>div.gfp-font-family', function () {
    var fontElement = jQuery(this)
    var details = {
      family: fontElement.data('font-family'),
      url: fontElement.data('font-url'),
      variant: fontElement.data('font-variant'),
      cssSelectors: cssSelectorsEl.val() || 'body',
      fontWeight: fontWeightEl.val() || '400',
      italic: italicEl.hasClass('gfp-italic-active')
    }
    previewFonts.onFontClick(details, injectStyles, injectFont)
  })
}

function injectStyles (html) {
  // var styleTag = jQuery('style#gfp-font-style')
  // if (styleTag.length) {
  //   styleTag.replaceWith(html)
  // } else {
  //   jQuery('head').append(html)
  // }
  jQuery('head').append(html)
}

function injectFont (data) {
}

function bindOnItalicClick () {
  var italicEl = jQuery('#gfp-action-italic')
  italicEl.click(() => {
    italicEl.toggleClass('gfp-italic-active')
  })
}

module.exports = {
  appendFonts: appendFonts,
  injectFontPreview: injectFontPreview,
  updateCacheStatus: updateCacheStatus,
  hideProgress: hideProgress,
  bindSearchEvent: bindSearchEvent,
  showProgress: showProgress
}
