/// <reference path="./../../exclude/chrome-dev-intelligence.d.ts"/>
/* global chrome */
const FontsApi = require('./background/fontsApi.js')

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
        renderFonts((response) => {
          port.postMessage(response)
          if (response.status === 'end') {
            port.disconnect()
          }
        })
      }
    })
  } else {
    port.disconnect()
  }
})

function renderFonts (response) {
  FontsApi.getFonts().then((fonts) => {
    var totalFonts = fonts.length
    var successFonts = 0
    var errorFonts = 0
    var progress = () => {
      return `${successFonts + errorFonts} processed out of ${totalFonts}`
    }
    var isCompleted = () => {
      return totalFonts === successFonts + errorFonts
    }
    FontsApi.getFontsPreviewImages(fonts, (font) => {
      successFonts++
      // on success
      var msg = {
        status: 'success',
        font: font,
        progress: progress(),
        isCompleted: isCompleted()
      }
      response(msg)
    }, (font) => {
      errorFonts++
      // on error
      var msg = {
        status: 'error',
        font: font,
        progress: progress(),
        isCompleted: isCompleted()
      }
      response(msg)
    })
  })
}
