/* global chrome */
var core = require('./_core.js')

var activeClass = 'gfp-active'
var htmlUrl = chrome.runtime.getURL('html/overlay.html')
var cssUrl = chrome.runtime.getURL('css/main.css')

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
function injectCss () {
  var link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = cssUrl
  link.id = 'gfp-main'
  document.head.appendChild(link)
}

function init () {
  return new Promise((resolve, reject) => {
    if (isInjected()) {
      reject(new Error('Extension already loaded, please reload page and try again'))
      return
    }
    document.body.classList.add(activeClass)
    injectHtml()
    injectCss()
  })
}

module.exports = init
