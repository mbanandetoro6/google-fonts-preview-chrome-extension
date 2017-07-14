/* //eslint-disable */
// import modules
const lodash = require('lodash')
const WebFontLoader = require('webfontloader')
const jq = require('jquery')
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
      return
    }
    util.jsonWebRequest(apiUrl)
      .then((response) => {
        buildFonts(response.items)
        resolve(fonts)
      })
      .catch(reject)
  })
}

var buildFonts = (rawFontsList) => {
  var filteredFonts = lodash.filter(rawFontsList, (font) => {
    return font.subsets.include('latin')
  })
  var counter = 0
  filteredFonts.map((font) => {
    font.id = 'font-' + counter
    counter++
    var name = font.family.replace(/\s+/g, '+')
    font.url = `${fontUrlBase}${name}:${font.variants.join(',')}`
    var previewText = encodeURIComponent(font.family)
    var previewVariant = font.variants.includes('regular') ? '400' : font.variants[0]
    font.previewUrl = `${fontUrlBase}${name}:${previewVariant}&text=${previewText}`
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

var generateFontsPreview = (fontsToProcess) => {
  var scale = 1.5
  var settings = {
    fontSize: 16 * scale,
    height: 40 * scale,
    width: 220 * scale
  }
  var canvas = document.createElement('canvas')
  var successCounter = 0
  var successList = []
  var errorCounter = 0
  var errorList = []
  fontsToProcess.reduce((lastPromise, currentFont) => {
    if (lastPromise === null) {
      return generateFontPreview(currentFont, canvas, settings)
    } else {
      return lastPromise.then((font) => {
        successCounter = successCounter + 1
        successList.push(font)
        return generateFontsPreview(currentFont, canvas, settings)
      }, (font) => {
        errorCounter = errorCounter + 1
        errorList.push(font)
        return generateFontsPreview(currentFont, canvas, settings)
      })
    }
  })
}

var generateFontPreview = (font, canvas, settings) => {
  return new Promise((resolve, reject) => {
    loadFontFamilyForPreview(font).then((loadedFont) => {
      var context = canvas.getContext('2d')
      canvas.height = settings.height
      canvas.width = settings.width

      context.font = `${settings.size}px ${loadedFont.family}`
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.fillText(loadedFont.family, settings.width / 2, settings.height / 2)
      var dataUrl = canvas.toDataURL('image/png', 1)
      jq('head').find(`link[href="${loadedFont.previewUrl}"]`).remove()
      saveFontPreviewInCache(dataUrl).then(resolve, reject)
    }).catch(reject)
  })
}

var saveFontPreviewInCache = (font, dataUrl) => {
  return new Promise((resolve, reject) => {
    storage.set()
  })
}

module.exports = {
  getFonts: getFonts
}
