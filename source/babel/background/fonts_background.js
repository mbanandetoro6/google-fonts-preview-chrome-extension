import { getFonts as getFontsCache, setFonts as saveFontsCache } from './../common/storage.js'
const util = require('./../common/util.js') // common functions mostly ajax
const WebFontLoader = require('webfontloader') // font loader to load fonts and get callback
// const storage = require('./../common/storage.js') // store and retrieve font cache

const fontUrlBase = 'https://fonts.googleapis.com/css?family=' // url used to build font url for google font family
// const apiUrl = 'https://www.googleapis.com/webfonts/v1/webfonts?sort=alpha&fields=items(category%2Cfamily%2ClastModified%2Csubsets%2Cvariants)&key=AIzaSyBg1SCUmPcujiFq9gerb9rrozsLfjBTO8E'
// const apiUrl = 'http://cdn.localhost.com/temp/google-fonts.json' // temp for local testing // [TODO][REMOVE] this in production
const apiUrl = 'http://cdn.localhost.com/temp/fonts-limited.json' // limited fonts for local testing purpose // [TODO][REMOVE] this in production

var fonts = [] // initialize with empty array, to be filled later by api

export function getFonts () { // exported function to be used to get fonts
  return new Promise((resolve, reject) => {
    if (fonts.length > 0) { // if available in local fonts variable
      resolve(fonts) // return with fonts
      return
    }
    // if not available in local variable
    util.jsonWebRequest(apiUrl) // request the google fonts api
      .then((response) => { // on success
        buildFonts(response.items) // generate custom properties for each font
        mergeCache() // merge with cache
          .then(resolve) // on success
          .catch(() => { // if cache is available then merge with cache
            resolve(fonts) // return fonts
          })
      })
      .catch(reject) // on error
  })
}

function buildFonts (rawFontsList) { // generate custom properties for each fonts
  var filteredFonts = rawFontsList.filter((font) => { // filter only english(latin) supported fonts
    return font.subsets.includes('latin')
  })
  var newFonts = filteredFonts.map((font) => { // modify each font object in array
    var _font = font
    _font.id = ('font_' + _font.family.replace(/\s+/g, '') + _font.lastModified.replace(/\D+/g, ''))
      .toLowerCase() // generate unique id from font name and last modified date
    var name = _font.family.replace(/\s+/g, '+') // generate name , replace space with plus sign, in existing font name
    _font.url = `${fontUrlBase}${name}:${_font.variants.join(',')}` // generate font url, to be used when loading font in page
    var previewText = encodeURIComponent(_font.family) // text for preview utl (font name is used)
    var previewVariant = _font.variants.includes('regular') ? '400' : _font.variants[0] // get supported variant if regular is not supported
    _font.previewUrl = `${fontUrlBase}${name}:${previewVariant}&text=${previewText}` // build preview url, text parameter in query string will cause google api to respond with limited characters and smallest possible file size
    delete _font.subsets // not required afterwords, so delete
    delete _font.lastModified // not required afterwords, so delete
    return _font
  })
  fonts = newFonts // save the generated fonts(with custom properties) to the local variable fonts
}

function mergeCache () { // this function will check for cache in storage, and merge with it if available
  return new Promise((resolve, reject) => {
    getFontsCache() // try to get font cache from storage
      .then((cachedFonts) => { // on success
        var mergedFonts = fonts.map((font) => { // merge with fonts, for matched fonts
          var _font = font
          var cachedFont = cachedFonts.find((cFont) => cFont.id === _font.id) // find cache by id
          if (cachedFont && cachedFont.base64Url) { // if cache is available
            _font.base64Url = cachedFont.base64Url // merge with cache
          }
          return _font
        })
        fonts = mergedFonts // save fonts with cache to local variable
        resolve(fonts) // return fonts with cache
      })
      .catch(() => { // on error
        reject(new Error('0 cached fonts found')) // reject with error
      })
  })
}

function loadFontFamilyForPreview (font) { // web font loader to load font family and provide on load callback event
  return new Promise((resolve, reject) => {
    WebFontLoader.load({
      classes: false, // dont apply any event class to html tag
      custom: {
        families: [font.family], // font name
        urls: [font.previewUrl] // font family css url
      },
      fontactive: function () {
        resolve(font) // on successful font load
      },
      fontinactive: function () {
        reject(font) // on failed font load
      }
    })
  })
}

export function getFontsPreviewImages (fontsToProcess, onProgressCallback) { // generate a preview for provided fonts
  // canvas settings, and scale variable to easily change values
  var scale = 2
  var settings = {
    fontSize: 18 * scale,
    height: 40 * scale,
    width: 330 * scale
  }
  var canvas = document.createElement('canvas') // canvas element to be used to render fonts preview , use one canvas element for all fonts, to improve performance
  var successFonts = [] // gather all success fonts
  var failedFonts = [] // gather all failed fonts

  fontsToProcess.reduce((lastPromise, currentFont, index) => { // process fonts one by one using array reduce trick on promise based function
    function onProgress () { // on progress callback
      var isCompleted = successFonts.length + failedFonts.length === fontsToProcess.length // check if all fonts are processed
      if (isCompleted) { // on complete callback
        onPreviewRenderComplete(fontsToProcess, successFonts, failedFonts)
      }
      return { // return current progress data to be consumed by on progress callback
        isCompleted: isCompleted,
        successFonts: successFonts.length,
        errorFonts: failedFonts.length,
        totalFonts: fontsToProcess.length
      }
    }

    function processFont () { // process each font
      return generateFontPreview(currentFont, canvas, settings) // process
        .then((_successFont) => { // on success
          successFonts.push(_successFont) // push to the success list
          onProgressCallback(_successFont, true, onProgress()) // call progress callback function with succeeded font, and current progress data
        }, (_errorFont) => { // on error
          failedFonts.push(_errorFont) // push to failed fonts list
          onProgressCallback(_errorFont, false, onProgress()) // call progress callback with error font, and current progress data
        })
    }
    if (lastPromise === null) { // this will be empty in first iteration
      return processFont() // so start with the current font, by using progress font function
    } else { // from 2nd iteration this will return the promise from last function
      return lastPromise.then(processFont, processFont) // so chain the process after function
    }
  }, null) // passing null , will be passed to the first iteration of reduce method
}

function onPreviewRenderComplete (processedFonts, successFonts, errorFonts) { // on font preview render complete callback
  var updatedFonts = fonts.map((font) => { // save the rendered preview into local font variable
    var _font = font
    var fontWithPreview = successFonts.find((sFont) => sFont.id === _font.id) // match the font by id
    if (fontWithPreview && fontWithPreview.base64Url) {
      _font.base64Url = fontWithPreview.base64Url
    }
    return _font
  })
  fonts = updatedFonts // save the updated fonts with preview to the local variable
  saveFontsCache(updatedFonts) // replace the fonts in cache
}

function generateFontPreview (font, canvas, settings) { // this function will generate base64 image preview of font using canvas
  return new Promise((resolve, reject) => {
    loadFontFamilyForPreview(font) // load font family in background page
      .then((loadedFont) => { // on load success
        var context = canvas.getContext('2d') // get canvas content to draw on
        canvas.height = settings.height // set height
        canvas.width = settings.width // set width
        console.log(font.family, 'rendered for preview')

        context.clearRect(0, 0, settings.width, settings.height) // remove any previous rendered data from canvas, as we are using same canvas for each preview

        context.fillStyle = '#ffffff' // set the background to white, note we are using jpeg output
        context.fillRect(0, 0, settings.width, settings.height) // fill the canvas with white background

        context.fillStyle = '#000000' // now make the fill style black, for font rendering

        context.font = `${settings.fontSize}px '${loadedFont.family}'` // provide font size and font family to canvas
        context.textAlign = 'left' // horizontal text align from the point of starting
        context.textBaseline = 'middle' // vertical alignment from the point of starting
        // context.webkitImageSmoothingEnabled = false // enable this if found any font blurring issue on resize
        // context.imageSmoothingEnabled = false
        context.fillText(loadedFont.family, 0, settings.height / 2) // draw text on canvas
        var dataUrl = canvas.toDataURL('image/jpeg', 1) // export to data url, we are using jpeg to pass quality value to 100%, png defaults to only 92%
        document.querySelector(`head link[href="${loadedFont.previewUrl}"]`)
          .remove() // remove the appended font link from the head
        font.base64Url = dataUrl // save the base 64 utl in font properties
        resolve(font) // return/resolve promise with generated font base 64 preview data
      })
      .catch(reject) // reject the promise on font loading error
  })
}
