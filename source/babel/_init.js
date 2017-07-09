/* global chrome */
var core = require('./_core.js')
var WebFont = require('webfontloader')

var activeClass = 'gfp-active'
var loadingClass = 'gfp-loading'
var htmlUrl = chrome.runtime.getURL('html/overlay.html')
var cssUrl = chrome.runtime.getURL('css/main.css')
var coreFontUrl = 'https://fonts.googleapis.com/css?family=Roboto'
var fontAwesomeUrl = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css'

function isInjected () {
  return document.body.classList.contains(activeClass)
}

function injectHtml () {
  core.webRequest(htmlUrl).then(function (html) {
    document.body.insertAdjacentHTML('beforeend', html)
  }).catch(function () {
    window.alert('Error Loading Extension, Please Reload Page')
  })
}

function injectCss (url) {
  return new Promise((resolve, reject) => {
    var link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = url
    link.dataset.parent = 'gfp'
    link.onload = resolve
    document.head.appendChild(link)
  })
}
function injectMultipleCss (cssUrls) {
  var promises = []
  cssUrls.forEach(function (url) {
    var promise = injectCss(url)
    promises.push(promise)
  }, this)
  return Promise.all(promises)
}

function init () {
  return new Promise((resolve, reject) => {
    if (isInjected()) {
      window.alert('Extension already loaded, please reload page and try again')
      reject(new Error())
      // reject(new Error('Extension already loaded, please reload page and try again'))
      return
    }
    var bodyClasses = document.body.classList
    bodyClasses.add(activeClass)
    bodyClasses.add(loadingClass)

    injectHtml()
    injectMultipleCss([cssUrl, coreFontUrl, fontAwesomeUrl]).then(function () {
      bodyClasses.remove(loadingClass)
    })
    resolve()
  })
}

module.exports = init
