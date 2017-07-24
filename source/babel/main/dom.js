import { getFonts } from './fontsApi.js' // used for getting fonts for searching
import { injectFontAndApply, parseAndApplyStyles } from './preview.js' // used for preview font on page
var jQuery = require('jquery') // dom manipulations
var Fuse = require('fuse.js') // fuzzy search functionality
const debounce = require('lodash/debounce.js') // debounce search event, to limit the execution rate

var container // jquery object for font container, will be assigned in init function
var searchBar // jquery object for search bar, will be assigned in init function
var cssSelectorsEl
var cssSelectorWrapEl
var fontWeightEl
var italicEl
var body = jQuery('body')
var fuseOptions = { // font search options
  shouldSort: true, // enable sorted searching
  threshold: 0.6, // fuzziness
  location: 0,
  distance: 100,
  maxPatternLength: 16,
  minMatchCharLength: 1,
  keys: [ // which object properties to search on
    'variants', 'family'
  ]
}
var fuse // fuse.js object ,for search functionality, will be assigned in init function

function init () { // initialize
  container = jQuery('#gfp-font-families') // save jquery element reference in container
  container.empty() // clear the font container
  searchBar = jQuery('#gfp-fonts-search-bar') // save the search bar object as variable, this will be used pn every search-bar type event
  cssSelectorsEl = jQuery('#gfp-css-selectors')
  cssSelectorWrapEl = jQuery('.gfp-css-selectors-wrap')
  fontWeightEl = jQuery('#gfp-font-weight')
  italicEl = jQuery('#gfp-action-italic')
  fuse = new Fuse(getFonts(), fuseOptions)

  setFontContainerHeight() // set container height
  bindOnWindowResize() // event handler to adjust the container height on resize
  bindOnFontClick() // bind the user click event on font
  bindOnItalicClick() // italic on/off
  bindSearchEvent() // search bar keyup event
  bindOnHideShowButton()
  injectEmptyStyleTag()
  bindClearStyleClickEvent()
  bindApplyBtnClick()
  bindCtrlEnterOnTextArea()
  bindOnCssShortcutSelectorsClick()
  jQuery('#gfp-action-settings').attr('href', chrome.runtime.getURL('html/help.html'))
  body.addClass('gfp-extension-visible')
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
  container.append(html) // append all fonts into container
}

function getHtmlForFont (fontFamily, index) { // generate html for font
  var top = index * 40 // use absolute position and css top, using this for sorting based on search
  // if preview image is available , then use it, otherwise just use font name, and preview will be injected later
  var preview = fontFamily.base64Url ? `<img alt="${fontFamily.family}" title="${fontFamily.family} | Styles:- ${fontFamily.variants.join(',')}" src="${fontFamily.base64Url}" />` : fontFamily.family
  // var supportedVariant = fontFamily.variants.includes('regular') ? 400 : fontFamily.variants[0] // get supported variant, if 400/regular is not supported
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

// #REGION search
function bindSearchEvent () {
  // on search bar type event, call the search function, and debounce it, to limit the execution rate
  searchBar.keyup(debounce(performSearch, 30))
}

function showSearchedFonts (fonts) { // show only matched fonts in search, and in correct order
  var allFonts = container.children('div') // find every fonts
  allFonts
    .removeClass('gfp-font-visible') // remove the visible class, by default the fonts are hidden using css,
    .css('top', 0) // use css top 0, to prevent long scroll
  for (var i = 0; i < fonts.length; i++) { // loop through each font, matched by search
    jQuery('#' + fonts[i].id) // select font using id
      .css('top', i * 40) // apply css top, to sort in correct order, of matched elements
      .addClass('gfp-font-visible') // make matched fonts visible
  }
}

function resetFontSearch () { // reset search, make all fonts visible, and sort in default order
  var allFonts = container.children('div') // get all fonts
  allFonts.each((index, element) => { // loop through each
    jQuery(element).css('top', (index * 40) + 'px') // change the css top, reset it to initial order of fonts
      .addClass('gfp-font-visible') // add class visible to reset the last search
  })
}

function performSearch () { // called on search-bar type event
  var searchTerm = searchBar.val().trim() // get the search bar text, use the get element by ID
  if (searchTerm === '') { // if search is empty
    resetFontSearch() // reset the fonts
  } else { // if search bar is not empty
    var fontSearchResult = fuse.search(searchTerm) // trigger the search using fuse, settings assigned at init
    showSearchedFonts(fontSearchResult) // filter the fonts, and show only matched fonts in search, also sort them in order
  }
}
// #END-REGION search

// #REGION font container height setup
function getHeight (id) { // get height of the element by id, return 0 if the element is hidden
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
    offset += getHeight(id) // get every element height in array and add to offset
  })
  var totalHeight = jQuery(window).height() // viewport height
  var height = totalHeight - offset // calculate height for container
  container.height(height) // apply height to font container
}

function bindOnWindowResize () {
  // adjust the font container height , on viewport resize
  // use debounce to limit the execution rate
  jQuery(window).resize(debounce(setFontContainerHeight, 250))
}
// #END-REGION font container height setup

function bindOnFontClick () { // triggered by user click on font
  container.on('click', '>div.gfp-font-family', function (e) { // use on click handler for dynamic event binding
    var fontElement = jQuery(this) // font element
    if (e.ctrlKey || e.metaKey) {
      // var currentVal = cssSelectorsEl.val()
      // cssSelectorsEl.val(currentVal + fontElement.data('font-family'))
      replaceSelTextTextArea(fontElement.data('font-family'))
      return
    }
    fontElement.addClass('gfp-font-family-applying')
    var rule = { // gather data to be passed
      family: fontElement.data('font-family'), // font name
      url: fontElement.data('font-url'), // font url, to load into page, and export if needed
      selector: cssSelectorsEl.val() || '*', // get css selectors OR use body if not supplied
      weight: fontWeightEl.val() || '400', // get selected font weight OR supply default 400
      style: italicEl.hasClass('gfp-italic-active') ? 'italic' : 'normal' // if italic is selected ?
    }
    console.log(cssSelectorsEl.val())
    injectFontAndApply(rule) // trigger the font click event in preview.js
      .then(() => {
        fontElement.removeClass('gfp-font-family-applying')
      })
      .catch(() => {
        fontElement.removeClass('gfp-font-family-applying')
      })
  })
}

function replaceSelTextTextArea (replaceText) {
  cssSelectorsEl.val(
    cssSelectorsEl.val().substring(0, cssSelectorsEl.get(0).selectionStart) +
    replaceText +
    cssSelectorsEl.val().substring(cssSelectorsEl.get(0).selectionEnd)
  )
}

export function injectStyles (rule) { // inject css into head tag
  jQuery('style#gfp-font-styles').append(rule)
}

function clearInjectedStyles () {
  jQuery('style#gfp-font-styles').empty()
}

function bindClearStyleClickEvent () {
  jQuery('#gfp-action-reset').click(() => {
    clearInjectedStyles()
    return false
  })
}

function bindApplyBtnClick () {
  jQuery('#gfp-action-apply').click(() => {
    applyCssCommand()
    return false
  })
}

function bindCtrlEnterOnTextArea () {
  cssSelectorsEl.keydown(function (e) {
    if ((e.ctrlKey || e.metaKey) && e.keyCode === 13) {
      applyCssCommand()
    }
  })
}

function applyCssCommand () {
  var css = cssSelectorsEl.val()
  cssSelectorWrapEl.css('outline', '1px red').addClass('hello gfp-css-selectors-loading')
  parseAndApplyStyles(css)
    .then(() => cssSelectorWrapEl.removeClass('gfp-css-selectors-loading'))
    .catch(() => console.log('error'))
}

function bindOnCssShortcutSelectorsClick () {
  jQuery('#gfp-css-selector-shortcuts a').click(function () {
    var selector = jQuery(this).attr('title').trim()
    cssSelectorsEl.val(selector)
    return false
  })
}

function injectEmptyStyleTag () {
  jQuery('#gfp-extension-stylesheet').before('<style id="gfp-font-styles"></style>')
}

function bindOnItalicClick () { // toggle italic button
  var italicEl = jQuery('#gfp-action-italic')
  italicEl.click(() => {
    italicEl.toggleClass('gfp-italic-active')
    return false
  })
}

function bindOnHideShowButton () {
  jQuery('#google-font-preview-show-hide-trigger')
    .click(function () {
      if (body.hasClass('gfp-extension-visible')) {
        body.removeClass('gfp-extension-visible').addClass('gfp-extension-hidden')
      } else {
        body.removeClass('gfp-extension-hidden').addClass('gfp-extension-visible')
      }
      // body.toggleClass('gfp-extension-visible')
      // jQuery(this).toggleClass('gfp-extension-hidden')
      // jQuery('#google-font-preview-extension').toggleClass('gfp-extension-hide')
      return false
    })
}

// #REGION cache-progress
function updateCacheProgress (progress) { // update the cache progress
  var html = `<span id="gfp-font-progress-success">${progress.successFonts}</span> 
              success and <span id="gfp-font-progress-error">${progress.errorFonts}</span>
              failed Out of ${progress.totalFonts}`
  jQuery('#gfp-font-progress').html(html) // update the progress in page
}

function hideCacheProgress () { // hide the cache progress when the caching process is complted
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
