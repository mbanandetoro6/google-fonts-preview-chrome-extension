/* global chrome */
var Dom = require('./dom.js')
var FontsStore = require('./fontsStore.js')

var loadFonts = () => {
  getFonts().then((fonts) => {
    FontsStore.storeFonts(fonts)
    Dom.appendFonts(fonts)
    Dom.bindSearchEvent()
    loadPreview()
  }, (error) => {
    window.alert(error.message)
  })
}

var getFonts = () => {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({
      request: 'fonts'
    }, function (response) {
      if (response.status && response.status === 'success') {
        resolve(response.fonts)
      } else if (response.status && response.status === 'error') {
        reject(new Error(response.message))
      }
    })
  })
}

var loadPreview = () => {
  var port = chrome.runtime.connect({
    name: 'fontPreview'
  })
  port.postMessage({
    request: 'fontPreview'
  })
  port.onMessage.addListener((response) => {
    if (response.status === 'success') {
      onSuccess(response)
    } else if (response.status === 'error') {
      onError(response)
    }
    if (response.isCompleted && response.isCompleted === true) {
      console.log('complete')
      Dom.hideProgress()
    }
  })
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
  loadFonts: loadFonts
}
