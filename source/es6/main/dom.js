// import { injectFontAndApply, parseAndApplyStyles, getActiveStyles, resetStyles } from './preview.js' // used for preview font on page
// import { getAdjacentItemFromArray } from './../common/util.js'
import * as jQuery from 'jquery' // dom manipulations
import { bindEvents } from './dom_events.js'
import * as debounce from 'lodash/debounce.js' // debounce search event, to limit the execution rate

export var fontContainer // jquery object for font container, will be assigned in init function
export var cssSelectorsEl
export var cssSelectorWrapEl
export var fontWeightEl
export var italicEl
export var body = jQuery('body')

// var History = []

function init () { // initialize
  fontContainer = jQuery('#gfp-font-families') // save jquery element reference in container
  fontContainer.empty() // clear the font container
  cssSelectorsEl = jQuery('#gfp-css-selectors')
  cssSelectorWrapEl = jQuery('.gfp-css-selectors-wrap')
  fontWeightEl = jQuery('#gfp-font-weight')
  italicEl = jQuery('#gfp-action-italic')

  setFontContainerHeight() // set container height
  bindOnWindowResize() // event handler to adjust the container height on resize
  injectEmptyStyleTag()
  bindEvents()
}

export function injectFontPreview (font) { // this will be used to inject preview, after the font is appended in page
  var fontEl = jQuery('#' + font.id) // find the font from page, using the unique font id
  var previewEl = fontEl.children('.gfp-font-family-preview') // select preview element (child)
  previewEl.empty().append(`<img src="${font.base64Url}" />`) // clear existing element, and append image preview (base64 Data)
  fontEl.removeClass('gfp-font-family-loading gfp-font-family-loading-error') // remove any loading and error class
}
// #REGION append fonts
export function appendFonts (fonts) { // append provided fonts
  init() // initialize, will also clear font container
  var html = '' // build html for every fonts
  for (var i = 0; i < fonts.length; i++) { // loop through each font
    var fontFamily = fonts[i]
    html += getHtmlForFont(fontFamily, i) // generate html for each font, concat into html
  }
  fontContainer.append(html) // append all fonts into container
}

function getHtmlForFont (fontFamily, index) { // generate html for font
  var top = index * 40 // use absolute position and css top, using this for sorting based on search
  // if preview image is available , then use it, otherwise just use font name, and preview will be injected later
  var preview = fontFamily.base64Url ? `<img alt="${fontFamily.family}" title="${fontFamily.family} | Styles:- ${fontFamily.variants.join(',')}" src="${fontFamily.base64Url}" />` : fontFamily.family
  // build html,use unique id for search functionality and also used when appending delayed preview
  // also save some font properties in data object , which will be needed later in font click event
  var html = `<div  id="${fontFamily.id}"
                    style="top:${top}px" 
                    class="gfp-font-family gfp-font-visible gfp-font-family-loading gfp-clearfix"
                    data-index="5"
                    data-font-family="${fontFamily.family}" 
                    data-font-url="${fontFamily.url}" >
                    <span class="gfp-font-family-preview">
                      ${preview}
                    </span>
              </div>`
  return html // return generated html
}
// #END-REGION append fonts

// #REGION font container height setup
function getHeightById (id) { // get height of the element by id, return 0 if the element is hidden
  var elm = jQuery(id + ':not(:hidden)')
  if (elm.length) {
    return elm.outerHeight() // get and return height including margin and padding and border
  } else {
    return 0
  }
}

function setFontContainerHeight () { // set font container height according to the current environment
  var ids = ['#gfp-section-settings', '#gfp-section-main', '#gfp-fonts-search-wrap', '#gfp-cache-notice'] // use this element height as offset
  var offset = 0
  ids.forEach(function (id) {
    offset += getHeightById(id) // get every element height in array and add to offset
  })
  var totalHeight = jQuery(window).height() // viewport height
  var height = totalHeight - offset // calculate height for container
  fontContainer.height(height) // apply height to font container
}

function bindOnWindowResize () {
  // adjust the font container height , on viewport resize
  // use debounce to limit the execution rate
  jQuery(window).resize(debounce(setFontContainerHeight, 250))
}
// #END-REGION font container height setup

function injectEmptyStyleTag () {
  jQuery('#gfp-extension-stylesheet').before('<style id="gfp-font-styles"></style>')
}

// #REGION cache-progress
function updateCacheProgress (progress) { // update the cache progress
  var html = `<span id="gfp-font-progress-success">${progress.successFonts}</span> 
              success and <span id="gfp-font-progress-error">${progress.errorFonts}</span>
              failed Out of ${progress.totalFonts}`
  jQuery('#gfp-font-progress').html(html) // update the progress in page
}

function hideCacheProgress () { // hide the cache progress when the caching process is completed
  jQuery('#gfp-cache-notice').slideUp()
  setTimeout(setFontContainerHeight, 500) // trigger the container height adjust after delay
}

function showCacheProgress () {
  jQuery('#gfp-cache-notice').slideDown()
  setTimeout(setFontContainerHeight, 500) // trigger the container height adjust after delay
}

export const cacheProgress = { // export cache progress bar api
  hide: hideCacheProgress,
  show: showCacheProgress,
  update: updateCacheProgress
}

// #END_REGION cache-progress
