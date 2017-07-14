/// <reference path="./../../../exclude/chrome-dev-intelligence.d.ts"/>
/* global chrome */

var storage = chrome.storage.local

function set (object) {
  return new Promise((resolve, reject) => {
    storage.set(object, () => {
      if (chrome.runtime.lastError) {
        reject(new Error('Failed to save data'))
        return
      }
      resolve()
    })
  })
}

function get (key) {
  return new Promise((resolve, reject) => {
    storage.get(key, (data) => {
      if (chrome.runtime.lastError) {
        reject(new Error('Failed to retrieve data'))
        return
      } else if (key === null) {
        resolve(data)
        return
      } else if (!data[key]) {
        reject(new Error('Data not found'))
        return
      }
      resolve(data[key])
    })
  })
}
// This will return array of fonts stored in storage
function getFonts () {
  return get('fonts')
}
// this will save the fonts array to the fonts key in storage
function setFonts (fontsArray) {
  var fonts = {
    fonts: fontsArray
  }
  return set(fonts)
}

function clearFonts () {
  return new Promise((resolve, reject) => {
    storage.remove('fonts', () => {
      if (chrome.runtime.lastError) {
        reject(new Error('Failed to retrieve data'))
      }
      resolve()
    })
  })
}

function clearStorage () {
  return new Promise((resolve, reject) => {
    storage.clear(() => {
      if (chrome.runtime.lastError) {
        reject(new Error('Failed to retrieve data'))
      }
      resolve()
    })
  })
}

module.exports = {
  fonts: {
    save: setFonts,
    get: getFonts,
    clear: clearFonts
  },
  clear: clearStorage
}
