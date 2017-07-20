// import modules
const WebFontLoader = require('webfontloader')
const jQuery = require('jquery')
// local imports
const util = require('./../common/util.js')
const storage = require('./../common/storage.js')

const fontUrlBase = 'https://fonts.googleapis.com/css?family='
// const apiUrl = 'https://www.googleapis.com/webfonts/v1/webfonts?sort=alpha&fields=items(category%2Cfamily%2ClastModified%2Csubsets%2Cvariants)&key=AIzaSyBg1SCUmPcujiFq9gerb9rrozsLfjBTO8E'
// const apiUrl = 'http://cdn.localhost.com/temp/google-fonts.json' // temp for local testing
const apiUrl = 'http://cdn.localhost.com/temp/fonts-limited.json' // temp for local testing
var fonts = []

var getFonts = () => {
  return new Promise((resolve, reject) => {
    if (fonts.length > 0) {
      resolve(fonts)
      console.log('resolved from variable')
      return
    }
    util.jsonWebRequest(apiUrl)
      .then((response) => {
        buildFonts(response.items)
        mergeCache().then(resolve).catch(() => {
          resolve(fonts)
        })
        console.log('resolved from api')
      })
    // .catch(reject)
  })
}

var buildFonts = (rawFontsList) => {
  var filteredFonts = rawFontsList.filter((font) => {
    return font.subsets.includes('latin')
  })
  var newFonts = filteredFonts.map((font) => {
    var _font = font
    _font.id = ('font_' + _font.family.replace(/\s+/g, '') + _font.lastModified.replace(/\D+/g, '')).toLowerCase()
    var name = _font.family.replace(/\s+/g, '+')
    _font.url = `${fontUrlBase}${name}:${_font.variants.join(',')}`
    var previewText = encodeURIComponent(_font.family)
    var previewVariant = _font.variants.includes('regular') ? '400' : _font.variants[0]
    _font.previewUrl = `${fontUrlBase}${name}:${previewVariant}&text=${previewText}`
    delete _font.subsets
    delete _font.lastModified
    return _font
  })
  fonts = newFonts
}
var mergeCache = () => {
  return new Promise((resolve, reject) => {
    storage.fonts.get().then((cachedFonts) => {
      // console.log(cachedFonts)
      var mergedFonts = fonts.map((font) => {
        var _font = font
        var cachedFont = cachedFonts.find((cFont) => cFont.id === _font.id)
        if (cachedFont && cachedFont.base64Url) {
          _font.base64Url = cachedFont.base64Url
        }
        return _font
      })
      fonts = mergedFonts
      resolve(fonts)
    }).catch(() => {
      console.log('fonts not found')
      reject(new Error('fonts not found'))
    })
  })
  // chrome.storage.local.get(null,function(data){console.log(data)})
}
var loadFontFamilyForPreview = (font) => {
  return new Promise((resolve, reject) => {
    WebFontLoader.load({
      classes: false,
      custom: {
        families: [font.family],
        urls: [font.previewUrl]
      },
      fontactive: function () {
        resolve(font)
      },
      fontinactive: function () {
        reject(font)
      }
    })
  })
}

var getFontsPreview = (fontsToProcess, onProgressCallback) => {
  var scale = 2
  var settings = {
    fontSize: 18 * scale,
    height: 40 * scale,
    width: 330 * scale
  }
  var canvas = document.createElement('canvas')
  var successFonts = []
  var errorFonts = []

  fontsToProcess.reduce((lastPromise, currentFont, index) => {
    var onProgress = () => {
      var isCompleted = successFonts.length + errorFonts.length === fontsToProcess.length
      if (isCompleted) {
        onPreviewRenderComplete(fontsToProcess, successFonts, errorFonts)
      }
      return {
        isCompleted: isCompleted,
        successFonts: successFonts.length,
        errorFonts: errorFonts.length,
        totalFonts: fontsToProcess.length
      }
    }
    var processFont = () => {
      return generateFontPreview(currentFont, canvas, settings)
        .then((_successFont) => {
          successFonts.push(_successFont)
          onProgressCallback(_successFont, true, onProgress())
        }, (_errorFont) => {
          errorFonts.push(_errorFont)
          onProgressCallback(_errorFont, false, onProgress())
        })
    }
    if (lastPromise === null) {
      return processFont()
    } else {
      return lastPromise.then(processFont, processFont)
    }
  }, null)
}

var onPreviewRenderComplete = (processedFonts, successFonts, errorFonts) => {
  var updatedFonts = fonts.map((font) => {
    var _font = font
    var fontWithPreview = successFonts.find((sFont) => sFont.id === _font.id)
    if (fontWithPreview && fontWithPreview.base64Url) {
      _font.base64Url = fontWithPreview.base64Url
    }
    return _font
  })
  fonts = updatedFonts
  storage.fonts.save(updatedFonts)
}

var generateFontPreview = (font, canvas, settings) => {
  return new Promise((resolve, reject) => {
    loadFontFamilyForPreview(font).then((loadedFont) => {
      var context = canvas.getContext('2d')
      canvas.height = settings.height
      canvas.width = settings.width
      console.log(font.family, 'rendered for preview')

      context.clearRect(0, 0, settings.width, settings.height)

      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, settings.width, settings.height)

      context.fillStyle = '#000000'

      context.font = `${settings.fontSize}px '${loadedFont.family}'`
      context.textAlign = 'left'
      context.textBaseline = 'middle'
      context.webkitImageSmoothingEnabled = false
      context.mozImageSmoothingEnabled = false
      context.imageSmoothingEnabled = false /// future
      context.fillText(loadedFont.family, 0, settings.height / 2)
      var dataUrl = canvas.toDataURL('image/jpeg', 1)
      jQuery('head').find(`link[href="${loadedFont.previewUrl}"]`).remove()
      font.base64Url = dataUrl
      resolve(font)
      // saveFontPreviewInCache(dataUrl).then(resolve, reject)
    }).catch(reject)
  })
}

// var saveFontPreviewInCache = (font, dataUrl) => {
//   return new Promise((resolve, reject) => {
//     storage.set()
//   })
// }

module.exports = {
  getFonts: getFonts,
  getFontsPreviewImages: getFontsPreview
}
