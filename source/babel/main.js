/* global chrome */
var Initialize = require('./main/init.js')
var Dom = require('./main/dom.js')

Initialize().then(afterInit).catch((error) => {
  window.alert(error.message)
})

function afterInit () {
  renderFonts()
  console.log('init complete')
}

function renderFonts (fonts) {
  getFonts().then((fonts) => {
    Dom.appendFonts(fonts)
    renderPreview()
  }).catch((error) => {
    window.alert(error.message)
  })
}

function renderPreview () {
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

function onSuccess (response) {
  Dom.injectFontPreview(response.font)
  Dom.updateCacheStatus(response.progress)
}

function onError (response) {
  Dom.updateCacheStatus(response.progress)
}

function getFonts () {
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

// var port

// function openCommunicationChannel () {
//   port = chrome.runtime.connect({
//     name: 'fonts'
//   })
//   port.postMessage({
//     request: 'fonts'
//   })
//   port.onMessage.addListener(function (response) {
//     if (response.status === 'success' && response.fonts) {
//       console.table(response.fonts)
//       resolve(response.fonts)
//     } else if (response.status === 'error' && response.msg) {
//       reject(response.message)
//     }
//   })
// }

// function sendMessage (message, callback) {
//   chrome.runtime.sendMessage(message, callback)
// }
