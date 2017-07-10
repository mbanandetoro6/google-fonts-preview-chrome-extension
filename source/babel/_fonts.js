var WebFont = require('webfontloader')
var core = require('./_core.js')
var dom = require('./_dom.js')
var lodash = require('lodash')

var apiUrl = 'https://www.googleapis.com/webfonts/v1/webfonts?sort=alpha&fields=items(category%2Cfamily%2Cvariants)&key=AIzaSyBg1SCUmPcujiFq9gerb9rrozsLfjBTO8E'
apiUrl = 'http://cdn.localhost.com/temp/google-fonts.json' // temp for local testing
// apiUrl = 'http://cdn.localhost.com/temp/fonts-limited.json' // temp for local testing
// var fontUrlBase = 'https://fonts.googleapis.com/css?family='

var fonts = []

function loadGoogleFontFamily (fontFamily, isQuickPreview) {
  return new Promise((resolve, reject) => {
    var name = fontFamily.family
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
    }, 300)
  })
}

function loadGoogleFontsListViaApi () {
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
    loadGoogleFontsListViaApi().then(function (data) {
      fonts = data.items
      fonts.map(function (font) {
        var variants = font.variants.join(',')
        font.load = font.family + ':' + variants
        font.id = 'font-' + core.getRandomId()
        font.quickLoad = font.family + ':&text=' + font.family.replace(/\s+/g, '')
      })
      resolve(fonts)
      injectForPreview()
    }).catch(reject)
  })
}

// function injectForPreview () {
//   fonts.reduce((lastPromise, fontFamily) => {
//     var id = fontFamily.id
//     var name = fontFamily.family
//     var data = name + ':&text=' + name.replace(/\s+/g, '')

//     if (lastPromise === null) {
//       return loadGoogleFont(data, id).then((rId) => {
//         dom.onPreviewFontLoaded(rId)
//       }, (rId) => {
//         dom.onPreviewFontLoadError(rId)
//       })
//     } else {
//       return lastPromise.then(() => {
//         return loadGoogleFont(data, id).then((rId) => {
//           dom.onPreviewFontLoaded(rId)
//         }, (rId) => {
//           dom.onPreviewFontLoadError(rId)
//         })
//       }, () => {
//         console.log('error loading font')
//         // dom.onPreviewFontLoadError(returnId)
//         return loadGoogleFont(data, id).then((rId) => {
//           dom.onPreviewFontLoaded(rId)
//         }, (rId) => {
//           dom.onPreviewFontLoadError(rId)
//         })
//       })
//     }
//   }, null)
// }

function injectForPreview () {
  var fontsChunks = lodash.chunk(fonts, 10)
  console.log(fontsChunks)
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
  console.log(fontFamily.family, 'is loaded')
  dom.onPreviewFontLoaded(fontFamily)
}

function onFontLoadFail (fontFamily) {
  dom.onPreviewFontLoadError(fontFamily)
}
module.exports = {
  getFonts: getFonts
}
