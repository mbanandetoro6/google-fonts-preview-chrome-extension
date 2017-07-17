var allFonts = []
var fontsForSearch = []

function getFonts () {
  return allFonts
}

function storeFonts (fonts) {
  allFonts = fonts
  updateFontNames()
}

function updateFontNames () {
  fontsForSearch = []
  allFonts.forEach((font) => {
    fontsForSearch.push({
      id: font.id,
      family: font.family
    })
  })
}
function getFontsForSearch () {
  return fontsForSearch
}

function mergePreview (font) {
  for (var i = 0; i < allFonts.length; i++) {
    var element = allFonts[i]
    if (element.id === font.id) {
      // element = font
      break
    }
  }
}

function mergePreviews (fonts) {
  fonts.forEach(function (font) {
    mergePreview(font)
  }, this)
  updateFontNames()
}

module.exports = {
  getFonts: getFonts,
  storeFonts: storeFonts,
  mergePreviews: mergePreviews,
  getFontsForSearch: getFontsForSearch

}
