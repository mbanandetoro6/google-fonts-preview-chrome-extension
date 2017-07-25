import { webRequest } from './../common/util.js' // use this to make http requests, to load html into page
import * as WebFont from 'webfontloader' // font loader, which provides onload events , so we can use it as trigger
import * as jQuery from 'jquery' // using jquery for injecting html and adding active active class on cody

var htmlUrl = chrome.runtime.getURL('html/overlay.html') // html file url to be injected in page
var cssUrl = chrome.runtime.getURL('css/main.css') // css file to be injected in page
var fontAwesomeCDN = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css' // inject font awesome from cdn to use it in icons

const activeClass = 'gfp-active' // this class will be applied to body , when the extension is injected into page by chrome
const loadingClass = 'gfp-loading' // use this class for showing loading animation
var body = jQuery('body') // select the body
const visibleClass = 'gfp-extension-visible'

function injectHtml (url) { // get and inject html into page
  webRequest(url) // get html
    .then(function (html) {
      body.append(html) // append html into body
    })
    .catch(function () { // on error , alert the user to reload and try again
      window.alert('Error loading extension, Please reload page & try again')
    })
}

function injectCss (url) { // inject css link into head
  jQuery('head')
    .append(`<link id="gfp-extension-stylesheet" rel="stylesheet" type="text/css" href="${url}">`)
}

function loadFontsAndFontIcons () { // load fonts for text and also font icons
  return new Promise((resolve, reject) => {
    WebFont.load({ // use web font loader to load fonts and font icons
      google: {
        families: ['Roboto:400', 'Space Mono'] // load google font family for page
      },
      custom: {
        families: ['FontAwesome'], // load font awesome (icons)
        urls: [fontAwesomeCDN]
      },
      active: resolve, // resolve promise on done
      inactive: reject // on error
    })
  })
}

export function init () { // initialize plugin
  return new Promise((resolve, reject) => {
    if (body.hasClass(activeClass)) { // if extension is already activated on page, this will return true
      reject(new Error('Extension already loaded'))
      return
    }
    body.addClass(visibleClass).addClass(activeClass).addClass(loadingClass) // add active and loading class to body
    injectHtml(htmlUrl) // inject html into page
    injectCss(cssUrl) // inject css into page
    loadFontsAndFontIcons() // load font and font-awesome icons using web font loader and inject them into page
      .then(function () { // this operation takes longest time, so when its done, resolve the promise
        console.log('font preview extension loaded in page')
        body.removeClass(loadingClass) // remove loader class
        setTimeout(function () { // slight delay to prevent freezing , extension will freeze for a second if fonts are appended while loading
          resolve() // return success
        }, 350)
      })
      .catch(() => { reject(new Error('Error loading google fonts and icons, please check your connection')) }) // on error
  })
}
