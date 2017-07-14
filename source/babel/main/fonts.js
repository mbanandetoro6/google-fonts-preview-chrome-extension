var WebFont = require('webfontloader')
var core = require('./core.js')
var dom = require('./dom.js')
var lodash = require('lodash')

// var fontUrlBase = 'https://fonts.googleapis.com/css?family='
// const apiUrl = 'https://www.googleapis.com/webfonts/v1/webfonts?sort=alpha&fields=items(category%2Cfamily%2ClastModified%2Csubsets%2Cvariants)&key=AIzaSyBg1SCUmPcujiFq9gerb9rrozsLfjBTO8E'
// const apiUrl = 'http://cdn.localhost.com/temp/google-fonts.json' // temp for local testing
const apiUrl = 'http://cdn.localhost.com/temp/fonts-limited.json' // temp for local testing
var fonts = []

function loadGoogleFontFamily (fontFamily, isQuickPreview) {
  return new Promise((resolve, reject) => {
    // resolve(fontFamily)
    var name
    if (isQuickPreview) {
      name = fontFamily.quickLoad
    } else {
      name = fontFamily.load
    }
    WebFont.load({
      classes: false,
      google: {
        families: [name]
      },
      fontactive: function () {
        resolve(fontFamily)
      },
      fontinactive: function () {
        reject(fontFamily)
      }
    })
  })
}

function loadGoogleFontFamilies (fontFamilyArray, onEachLoad, onEachFail) {
  return new Promise((resolve, reject) => {
    setTimeout(function () {
      var promises = []
      fontFamilyArray.forEach((fontFamily) => {
        promises.push(loadGoogleFontFamily(fontFamily, true).then(onEachLoad).catch(onEachFail))
      })
      Promise.all(promises).then(resolve).catch(reject)
    }, 1000)
  })
}

function loadFontsFromApi () {
  return new Promise((resolve, reject) => {
    core.jsonWebRequest(apiUrl).then(function (data) {
      resolve(data)
    }).catch(reject)
  })
}

function getFonts () {
  return new Promise((resolve, reject) => {
    if (fonts.length > 0) {
      resolve(fonts)
      return
    }
    loadFontsFromApi().then((data) => {
      var supportedFonts = lodash.filter(data.items, function (font) {
        return font.subsets.includes('latin')
      })
      var counter = 0
      supportedFonts.map(function (font) {
        font.id = 'font-' + counter
        var variants = font.variants.join(',')
        font.loadRef = font.family + ':' + variants
        counter++
        var supportedVariant = font.variants.includes('regular') ? '400' : font.variants[0]
        font.quickLoadRef = font.family + ':' + supportedVariant + '&text=' + encodeURIComponent(font.family)
      })
      fonts = supportedFonts
      resolve(fonts)
      injectForPreview()
    }).catch(reject)
  })
}

function injectForPreview () {
  var fontsChunks = lodash.chunk(fonts, 1)

  fontsChunks.reduce((lastPromise, fontChunk) => {
    if (lastPromise === null) {
      return loadGoogleFontFamilies(fontChunk, onFontLoadSuccess, onFontLoadFail)
    } else {
      return lastPromise.then(() => loadGoogleFontFamilies(fontChunk, onFontLoadSuccess, onFontLoadFail),
        () => loadGoogleFontFamilies(fontChunk, onFontLoadSuccess, onFontLoadFail))
    }
  }, null)
}

// function injectForPreview () {
//   loadGoogleFontFamilies(fonts, onFontLoadSuccess, onFontLoadFail)
// }

function onFontLoadSuccess (fontFamily) {
  dom.onPreviewFontLoaded(fontFamily)
}

function onFontLoadFail (fontFamily) {
  console.log(fontFamily.family, 'is failed')
  dom.onPreviewFontLoadError(fontFamily)
}
module.exports = {
  getFonts: getFonts
}
