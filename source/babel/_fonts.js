var WebFont = require('webfontloader')
var core = require('./_core.js')

var apiUrl = 'https://www.googleapis.com/webfonts/v1/webfonts?sort=alpha&fields=items(category%2Cfamily%2Cvariants)&key=AIzaSyBg1SCUmPcujiFq9gerb9rrozsLfjBTO8E'
apiUrl = 'http://www.localcdn.com/temp/google-fonts.json' // temp for local testing
var fontUrlBase = 'https://fonts.googleapis.com/css?family='

var fonts = []

function loadGoogleFont (family) {
  return new Promise((resolve, reject) => {
    if (typeof (family) === 'string') {
      family = [family]
    }
    WebFont.load({
      google: {
        families: family
      },
      active: resolve,
      inactive: reject
    })
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
        var name = font.family.replace(/\s+/g, '+')
        var variants = font.variants.join(',')
        font.url = fontUrlBase + name + ':' + variants
        font.shortUrl = fontUrlBase + name + '&text=' + font.family.replace(/\s+/g, '')
      })
      resolve(fonts)
    }).catch(reject)
  })
}

module.exports = {
  loadGoogleFont: loadGoogleFont,
  loadGoogleFonts: loadGoogleFont,
  getFonts: getFonts
}
