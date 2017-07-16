/// <reference path="./../../exclude/chrome-dev-intelligence.d.ts"/>
/* global chrome */
const FontsApi = require('./background/fonts.js')

/*
1. user click on browser action @done
2. extension will inject the required files into page @done
3. page requests for fonts
4. on fonts request we call the google api for fonts
5. check in storage if the preview cache is stored?
6. send the fonts to the page, with available cache
7. if the fonts cache is not complete mark the response with incomplete
8. and renders the fonts in background and send the cached preview to client as generate
*/

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
// chrome.runtime.onConnect.addListener((port) => {
//   if (port.name === 'fonts') {
//     port.onMessage.addListener((message, port) => {
//       if (message && message.request && message.request === 'fonts') {
//         fonts.getFonts()
//           .then((data) => {
//             port.postMessage({status: 'success', fonts: data})
//           })
//           .catch(() => {
//             port.postMessage({status: 'failed', msg: 'failed to get fonts from server'})
//           })
//       }
//     })
//   }
//   console.log(port)
// })

// function buildFontCache (callback) {
//   var counter = 0
//   setInterval(() => {
//     var msg = {
//       state: 'working',
//       message: counter + ' fonts processed'
//     }
//     counter++
//     callback(msg)
//   }, 1500)
// }

// function sendMessage (message) {
//   channel.postMessage(message)
// }
