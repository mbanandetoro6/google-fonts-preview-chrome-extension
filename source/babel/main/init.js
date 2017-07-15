/* global chrome */
var util = require('./../common/util.js') // require core module to make web requests
var WebFont = require('webfontloader') // font loader, which provides onload events , so we can use it as trigger
var jQuery = require('jquery') // jquery for dom manipulations

var activeClass = 'gfp-active' // this class will be applied to body , when the extension is injected into page by chrome
var loadingClass = 'gfp-loading' // use this class for showing loading animation

var htmlUrl = chrome.runtime.getURL('html/overlay.html') // html file url to be injected in page
var cssUrl = chrome.runtime.getURL('css/main.css') // css file to be injected in page
var fontAwesomeUrl = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css' // inject font awesome from cdn to use it in icons
var body = jQuery('body') // select the body

function injectHtml (url) { // get and inject html into page
  util.webRequest(url) // get html
    .then(function (html) {
      body.append(html) // append html into body
    }).catch(function () { // on error
      window.alert('Error loading extension, Please reload page & try again')
    })
}

function injectCss (url) { // inject css link into head
  jQuery('head').append(`<link rel="stylesheet" type="text/css" href="${url}">`)
}

function loadFontsAndFontIcons () { // load fonts for text and also font icons
  return new Promise((resolve, reject) => {
    WebFont.load({ // use web font loader to load fonts and font icons
      google: {
        families: ['Roboto:400,700'] // load google font family for page
      },
      custom: {
        families: ['FontAwesome'], // load font awesome
        urls: [fontAwesomeUrl]
      },
      active: resolve, // resolve promise on done
      inactive: reject // on error
    })
  })
}

function init () { // initialize plugin
  return new Promise((resolve, reject) => {
    if (body.hasClass(activeClass)) {
      reject(new Error('Extension already loaded'))
      return
    }
    body.addClass(activeClass).addClass(loadingClass) // add active and loading class to body
    injectHtml(htmlUrl)// inject html into page
    injectCss(cssUrl) // inject css into page
    loadFontsAndFontIcons() // load font and font-awesome icons using web font loader and inject them into page
      .then(function () { // this operation takes longest time, so when its done, resolve the promise
        console.log('Wo Hoo! Extension Loaded')
        body.removeClass(loadingClass) // remove loader class
        resolve()
      }).catch(() => { reject(new Error('Error loading google fonts and icons, please check your connection')) }) // on error
  })
}
module.exports = init // export public api
