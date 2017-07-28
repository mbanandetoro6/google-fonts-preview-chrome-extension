import * as jQuery from 'jquery'
import { initSearch, performSearch } from './dom_search'
import * as debounce from 'lodash/debounce.js' // debounce search event, to limit the execution rate
import { body, fontContainer, cssSelectorsEl, fontWeightEl, italicEl } from './dom.js'
import { applyStyle, resetAllStyles, applyCssCommand, getNextItemFromHistory, getPrevItemFromHistory } from './dom_styles_manage.js'

export function bindEvents () {
  onSearchBarKeyUp()
  onResetClick()
  onCommandApplyClick()
  onCssSelectorsElKeydown()
  onCssShortcutSelectorsClick()
  onItalicClick()
  onCssSelectorsKeyupOrChange()
  onHideShowButton()
  onFontClick()
}

function onSearchBarKeyUp () {
  initSearch()

  var searchBar = jQuery('#gfp-fonts-search-bar')
  // on search bar type event, call the search function, and debounce it, to limit the execution rate
  searchBar.keyup(debounce(() =>
    performSearch(searchBar.val().trim()), 30)) // debounce rate in miliseconds
}

function onResetClick () {
  jQuery('#gfp-action-reset').click(() => {
    resetAllStyles()
    return false
  })
}

function onCommandApplyClick () {
  jQuery('#gfp-command-apply').click(() => {
    applyCssCommand()
    return false
  })
}

function onCssSelectorsElKeydown () {
  cssSelectorsEl.keydown(function (e) {
    if (e.ctrlKey || e.metaKey) {
      if (e.keyCode === 13) { // 13 is enter key => ctrl/cmd + enter
        applyCssCommand()
      } else if (e.keyCode === 39) { // 39 is right arrow => ctrl/cmd + right arrow
        var nextItem = getNextItemFromHistory()
        if (nextItem) { cssSelectorsEl.val(nextItem) }
      } else if (e.keyCode === 37) { // 37 is left arrow => ctrl/cmd + left arrow
        var prevItem = getPrevItemFromHistory()
        if (prevItem) { cssSelectorsEl.val(prevItem) }
      }
    }
  })
}

function onCssShortcutSelectorsClick () {
  jQuery('#gfp-css-selector-shortcuts a').click(function () {
    var selector = jQuery(this).attr('title').trim()
    cssSelectorsEl.val(selector)
    return false
  })
}

function onItalicClick () { // toggle italic button
  var italicEl = jQuery('#gfp-action-italic')
  italicEl.click(() => {
    italicEl.toggleClass('gfp-italic-active')
    return false
  })
}

function onCssSelectorsKeyupOrChange () {
  var cssCommandApplyBtn = jQuery('#gfp-command-apply')
  cssSelectorsEl.on('keyup change', debounce(() => {
    if (cssSelectorsEl.val().includes('/')) {
      cssCommandApplyBtn.addClass('gfp-command-available')
    } else {
      cssCommandApplyBtn.removeClass('gfp-command-available')
    }
  }, 100))
}

function onHideShowButton () {
  jQuery('#google-font-preview-show-hide-trigger')
    .click(function () {
      if (body.hasClass('gfp-extension-visible')) {
        body.removeClass('gfp-extension-visible').addClass('gfp-extension-hidden')
      } else {
        body.removeClass('gfp-extension-hidden').addClass('gfp-extension-visible')
      }
      return false
    })
}

function onFontClick () { // triggered by user click on font
  fontContainer.on('click', '>div.gfp-font-family', function (e) { // use on click handler for dynamic event binding
    var fontElement = jQuery(this) // font element
    if (e.ctrlKey || e.metaKey) { // if ctrl/cmd + click
      replaceSelectedTextCssSelectorsEl(fontElement.data('font-family'))
    } else {
      fontElement.addClass('gfp-font-family-applying')
      var rule = { // gather data to be passed
        family: fontElement.data('font-family'), // font name
        url: fontElement.data('font-url'), // font url, to load into page, and export if needed
        selector: cssSelectorsEl.val() || '*', // get css selectors OR use body if not supplied
        weight: fontWeightEl.val() || '400', // get selected font weight OR supply default 400
        style: italicEl.hasClass('gfp-italic-active') ? 'italic' : 'normal' // if italic is selected ?
      }

      applyStyle(rule) // trigger the font click event in preview.js
        .then(() => {
          fontElement.removeClass('gfp-font-family-applying')
        })
        .catch(() => {
          fontElement.removeClass('gfp-font-family-applying')
        })
    }
  })
}

function replaceSelectedTextCssSelectorsEl (replaceText) {
  cssSelectorsEl.val(
    cssSelectorsEl.val().substring(0, cssSelectorsEl.get(0).selectionStart) +
    replaceText +
    cssSelectorsEl.val().substring(cssSelectorsEl.get(0).selectionEnd)
  )
}
