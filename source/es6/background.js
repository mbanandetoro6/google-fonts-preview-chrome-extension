/**
 * @author Maulik Anand
 * @email mbanandetoro6@gmail.com
 * @desc  background script for extension
*/
import * as FontsApi from './background/fonts_background.js'

// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(init)

function init (tab) {
  // inject the script into page
  chrome.tabs.executeScript(null, {
    file: 'js/main.js'
  })
}

// on fonts request
chrome.runtime.onMessage.addListener((message, sender, response) => {
  if (message.request && message.request === 'fonts') { // if fonts is requested
    onFontRequest(response) // handle request
    return true // return true to keep chrome message line open, when using async function
  }
})

function onFontRequest (response) {
  FontsApi.getFonts() // get fonts with available cache
    .then((fonts) => { // return fonts on success
      response({
        status: 'success',
        fonts: fonts
      })
    })
    .catch(() => { // on error
      response({
        status: 'error',
        message: 'failed to get fonts from server'
      })
    })
}

// on fonts preview request, will be triggered when page open this message channel
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'fontPreview') { // verify message channel
    port.onMessage.addListener((message, port) => { // on message
      if (message.request && message.request === 'fontPreview' && message.fontsWithoutPreview) { // verify ? has data
        FontsApi.getFontsPreviewImages(message.fontsWithoutPreview, (font, isSuccess, currentProgress) => { // call the font preview generate api
          onPreviewProgress(font, isSuccess, currentProgress, port) // on preview progress callback
        })
      }
    })
  } else {
    port.disconnect() // on invalid port, close the message channel
  }
})

function onPreviewProgress (font, isSuccess, currentProgress, port) { // handle on progress callback
  var msg = { // build a message to be sent to the page on progress
    status: isSuccess ? 'success' : 'error',
    font: font,
    progress: currentProgress
  }
  port.postMessage(msg) // send message / font status to the page
  if (msg.progress.isCompleted) { // on all font preview render complete
    port.disconnect() // disconnect the messaging channel
  }
}
