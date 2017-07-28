import * as jQuery from 'jquery'
import { getActiveStyles, resetStyles, parseAndApplyStyles, injectFontAndApply } from './preview.js'
import { getAdjacentItemFromArray } from './../common/util.js'
import { cssSelectorsEl, cssSelectorWrapEl } from './dom.js'

var History = []

export function injectCSS (rule) { // inject css into head tag
  jQuery('style#gfp-font-styles').append(rule)
}
export function resetAllStyles () {
  jQuery('style#gfp-font-styles').empty()
  var activeStyles = getActiveStyles()
  console.log(activeStyles)
  activeStyles.forEach((style) => {
    console.log(style)
    jQuery('head').find(`link[href="${style.url}"]`).remove()
  })
  resetStyles()
}
export function applyStyle (rule) {
  History.push(cssSelectorsEl.val())
  return injectFontAndApply(rule)
}

export function applyCssCommand () {
  var command = cssSelectorsEl.val()
  History.push(command)
  cssSelectorWrapEl.addClass('gfp-command-applying')
  parseAndApplyStyles(command)
    .then(() => cssSelectorWrapEl.removeClass('gfp-command-applying'))
    .catch(() => console.log('error'))
}

export function getNextItemFromHistory () {
  return getAdjacentItemFromArray(History, cssSelectorsEl.val(), false)
}
export function getPrevItemFromHistory () {
  return getAdjacentItemFromArray(History, cssSelectorsEl.val(), true)
}
