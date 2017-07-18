/// <reference path="./../../exclude/chrome-dev-intelligence.d.ts"/>
/* global chrome */
const FontsApi = require('./background/fonts_background.js')

// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function (tab) {
  console.log('Clicked on browser action')

  // inject the script into page
  chrome.tabs.executeScript(null, {
    file: 'js/main.js'
  })
})

// handle incoming messages (single time messages)
chrome.runtime.onMessage.addListener((message, sender, response) => {
  if (message.request && message.request === 'fonts') {
    FontsApi.getFonts()
      .then((fonts) => {
        console.log(fonts)
        response({
          status: 'success',
          fonts: fonts
        })
      })
      .catch(() => {
        response({
          status: 'error',
          message: 'failed to get fonts from server'
        })
      })
    return true
  }
})

// handle incoming messages on channel
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'fontPreview') {
    port.onMessage.addListener((message, port) => {
      if (message.request && message.request === 'fontPreview') {
        getFontsPreview((response) => {
          port.postMessage(response)
          if (response.progress.isCompleted) {
            port.disconnect()
            console.log('port disconnect')
          }
        })
      }
    })
  } else {
    port.disconnect()
  }
})

function getFontsPreview (response) {
  FontsApi.getFonts().then((fonts) => {
    var onprogress = (font, isSuccess, currentProgress) => {
      var msg = {
        status: isSuccess ? 'success' : 'error',
        font: font,
        progress: currentProgress
      }
      response(msg)
    }
    FontsApi.getFontsPreviewImages(fonts, onprogress)
  })
}
