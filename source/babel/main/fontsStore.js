var allFonts = []

function getFonts () {
  return allFonts
}

function storeFonts (fonts) {
  allFonts = fonts
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
}

module.exports = {
  getFonts: getFonts,
  storeFonts: storeFonts,
  mergePreviews: mergePreviews

}
