import { getFonts } from './fontsApi.js' // used for getting fonts for searching
import * as Fuse from 'fuse.js' // fuzzy search functionality
import * as jQuery from 'jquery'
import { fontContainer } from './dom.js'

var fuseOptions = { // font search options
  shouldSort: true, // enable sorted searching
  threshold: 0.6, // fuzziness
  location: 0,
  distance: 100,
  maxPatternLength: 16,
  minMatchCharLength: 1,
  keys: [ // which object properties to search on
    'variants', 'family'
  ]
}
var fuse
export function initSearch () {
  fuse = new Fuse(getFonts(), fuseOptions)
  console.log(getFonts())
}

function showSearchedFonts (fontSearchResult) { // show only matched fonts in search, and in correct order
  var allFonts = fontContainer.children('div') // find every fonts
  allFonts
    .removeClass('gfp-font-visible') // remove the visible class, by default the fonts are hidden using css,
    .css('top', 0) // use css top 0, to prevent long scroll
  for (var i = 0; i < fontSearchResult.length; i++) { // loop through each font, matched by search
    jQuery('#' + fontSearchResult[i].id) // select font using id
      .css('top', i * 40) // apply css top, to sort in correct order, of matched elements
      .addClass('gfp-font-visible') // make matched fonts visible
  }
}

function resetFontSearch () { // reset search, make all fonts visible, and sort in default order
  var allFonts = fontContainer.children('div') // get all fonts
  allFonts.each((index, element) => { // loop through each
    jQuery(element).css('top', (index * 40) + 'px') // change the css top, reset it to initial order of fonts
      .addClass('gfp-font-visible') // add class visible to reset the last search
  })
}

export function performSearch (searchTerm) { // called on search-bar type event
  console.log(searchTerm)
  // var searchTerm = searchBar.val().trim() // get the search bar text, use the get element by ID
  if (searchTerm === '') { // if search is empty
    resetFontSearch(fontContainer) // reset the fonts
  } else { // if search bar is not empty
    var fontSearchResult = fuse.search(searchTerm) // trigger the search using fuse, settings assigned at init
    showSearchedFonts(fontSearchResult, fontContainer) // filter the fonts, and show only matched fonts in search, also sort them in order
  }
}
