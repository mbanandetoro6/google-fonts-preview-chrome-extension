/* global chrome */
var Dom = require('./dom.js')
var FontsStore = require('./fontsStore.js')
const WebFontLoader = require('webfontloader')

var injectFontIntoPage = (data) => {
  return new Promise((resolve, reject) => {
    WebFontLoader.load({
      classes: false,
      custom: {
        families: [data.family],
        urls: [data.url]
      },
      fontactive: function (font, fwd) {
        resolve(font)
      },
      fontinactive: function (font) {
        reject(font)
      }
    })
  })
}

var loadFontsFromExtension = () => {
  getFonts().then((fonts) => {
    FontsStore.storeFonts(fonts)
    Dom.appendFonts(fonts)
    Dom.bindSearchEvent()
    loadPreview(fonts)
  }
    // , (error) => {
    // window.alert(error.message)
    // }
  )
}

var getFonts = () => {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({
      request: 'fonts'
    }, function (response) {
      console.log(response)
      if (response.status && response.status === 'success') {
        resolve(response.fonts)
      } else if (response.status && response.status === 'error') {
        reject(new Error(response.message))
      }
    })
  })
}

var loadPreview = (fonts) => {
  var fontsWithoutPreview = fonts.filter((font) => font.base64Url === undefined)
  if (fontsWithoutPreview.length) {
    Dom.showProgress()
    var port = chrome.runtime.connect({
      name: 'fontPreview'
    })
    port.postMessage({
      request: 'fontPreview',
      fontsWithoutPreview: fontsWithoutPreview
    })
    port.onMessage.addListener((response) => {
      if (response.status === 'success') {
        onSuccess(response)
      } else if (response.status === 'error') {
        onError(response)
      }
      if (response.progress.isCompleted === true) {
        console.log('complete')
        Dom.hideProgress()
      }
    })
  } else {
    Dom.hideProgress()
  }
}

var onSuccess = (response) => {
  Dom.injectFontPreview(response.font)
  FontsStore.mergePreviews([response.font])
  Dom.updateCacheStatus(response.progress)
}

var onError = (response) => {
  Dom.updateCacheStatus(response.progress)
}

module.exports = {
  loadFonts: loadFontsFromExtension,
  injectFontIntoPage: injectFontIntoPage
}
