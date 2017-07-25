import * as Dom from './dom.js' // dom manipulations
import * as WebFontLoader from 'webfontloader' // load fonts from web and provides a callback events

var allFonts = [] // local variable for fonts, will be used by search functionality in dom.js

export function getFonts () { // this will return all fonts array
  return allFonts
}

export function injectFontIntoPage (fontFamily, fontUrl) { // this will inject the provided font into page,used when user clicks on the font family, to preview the font inside page
  return new Promise((resolve, reject) => {
    WebFontLoader.load({ // use web font loader to load the font
      classes: false, // dont apply any event classes to html
      custom: {
        families: [fontFamily], // font name
        urls: [fontUrl] // font url
      },
      active: function (font, fvd) {
        resolve(font) // on success event
      },
      inactive: function (font, fvd) {
        reject(font) // on error event
      }
    })
  })
}

export function loadFontsFromExtension () { // load fonts using the extension background page
  getFontsFromExtension() // try to get fonts
    .then((fonts) => { // on success
      allFonts = fonts // save into local variable
      Dom.appendFonts(fonts) // append fonts into page, with or without cache
      loadPreview(fonts) // load font preview , if there is any font without preview image
    }, (error) => { // on error
      window.alert(error.message) // alert the user
    })
}

function getFontsFromExtension () { // this will call the background script of extension
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ // use chrome message api to request the fonts from extension
      request: 'fonts'
    }, function (response) { // on message response callback
      if (response.status && response.status === 'success') { // if success
        resolve(response.fonts) // return with fonts
      } else if (response.status && response.status === 'error') { // if error
        reject(new Error(response.message)) // return with error
      }
    })
  })
}

function loadPreview (fonts) { // load preview
  var fontsWithoutPreview = fonts.filter((font) => font.base64Url === undefined) // select the fonts, which have no preview
  if (fontsWithoutPreview.length) { // if any fonts found without preview
    Dom.cacheProgress.show() // enable cache progress
    var port = chrome.runtime.connect({ name: 'fontPreview' }) // open the messaging channel to extension
    port.postMessage({ request: 'fontPreview', fontsWithoutPreview: fontsWithoutPreview }) // request for preview to the extension, and provide the fonts to process
    port.onMessage.addListener((response) => { // on return message handler
      if (response.status === 'success') { // if is success
        onSuccess(response) // call the success handler with response
      } else if (response.status === 'error') { // on error
        onError(response) // call the error handler with response
      }
      if (response.progress.isCompleted === true) { // check if the loading preview process is completed
        console.log('Font Preview Caching Process Completed')
        Dom.cacheProgress.hide() // hide the cache progress
      }
    })
  }
}

function onSuccess (response) { // on font preview cache success
  Dom.injectFontPreview(response.font) // inject the preview in Page
  Dom.cacheProgress.update(response.progress) // update the cache progress
}

var onError = (response) => { // on font preview error
  Dom.cacheProgress.update(response.progress) // update the cache progress
}
