/* //eslint-disable */
// import modules
const filter = require('lodash/filter.js')
const WebFontLoader = require('webfontloader')
const jQuery = require('jquery')
// local imports
const util = require('./../common/util.js')
const storage = require('./../common/storage.js')

const fontUrlBase = 'https://fonts.googleapis.com/css?family='
// const apiUrl = 'https://www.googleapis.com/webfonts/v1/webfonts?sort=alpha&fields=items(category%2Cfamily%2ClastModified%2Csubsets%2Cvariants)&key=AIzaSyBg1SCUmPcujiFq9gerb9rrozsLfjBTO8E'
const apiUrl = 'http://cdn.localhost.com/temp/google-fonts.json' // temp for local testing
// const apiUrl = 'http://cdn.localhost.com/temp/fonts-limited.json' // temp for local testing
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
        resolve(fonts)
        console.log('resolved from api')
      })
      .catch(reject)
  })
}

var buildFonts = (rawFontsList) => {
  var filteredFonts = filter(rawFontsList, (font) => {
    return font.subsets.includes('latin')
  })

  filteredFonts.map((font) => {
    font.id = ('font_' + font.family.replace(/\s+/g, '') + font.lastModified.replace(/\D+/g, '')).toLowerCase()
    var name = font.family.replace(/\s+/g, '+')
    font.url = `${fontUrlBase}${name}:${font.variants.join(',')}`
    var previewText = encodeURIComponent(font.family)
    var previewVariant = font.variants.includes('regular') ? '400' : font.variants[0]
    font.previewUrl = `${fontUrlBase}${name}:${previewVariant}&text=${previewText}`
    delete font.subsets
    delete font.lastModified
  })
  fonts = filteredFonts
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

var getFontsPreview = (fontsToProcess, successCallback, errorCallback) => {
  var scale = 2
  var settings = {
    fontSize: 18 * scale,
    height: 40 * scale,
    width: 330 * scale
  }
  var canvas = document.createElement('canvas')
  var lastFont = fontsToProcess
  console.log(lastFont)

  fontsToProcess.reduce((lastPromise, currentFont) => {
    if (lastPromise === null) {
      return generateFontPreview(currentFont, canvas, settings)
        .then((font) => {
          successCallback(font)
        }, (font) => {
          errorCallback(font)
        })
    } else {
      return lastPromise.then(() => {
        return generateFontPreview(currentFont, canvas, settings)
          .then((font) => {
            successCallback(font)
          }, (font) => {
            errorCallback(font)
          })
      }, (font) => {
        return generateFontPreview(currentFont, canvas, settings)
          .then((font) => {
            successCallback(font)
          }, (font) => {
            errorCallback(font)
          })
      })
    }
  }, null)
}

var generateFontPreview = (font, canvas, settings) => {
  return new Promise((resolve, reject) => {
    loadFontFamilyForPreview(font).then((loadedFont) => {
      var context = canvas.getContext('2d')
      canvas.height = settings.height
      canvas.width = settings.width
      console.log(font.family, 'rendered for preview')

      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, settings.width, settings.height)

      context.fillStyle = '#000000'

      context.font = `${settings.fontSize}px ${loadedFont.family}`
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
