var storage = chrome.storage.local // use chrome local storage api

export function set (object) {
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

export function get (key) {
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
export function getFonts () {
  return get('fonts')
}
// this will save the fonts array to the fonts key in storage
export function setFonts (fontsArray) {
  var fonts = {
    fonts: fontsArray
  }
  return set(fonts)
}

export function clearEntireStorage () {
  return new Promise((resolve, reject) => {
    storage.clear(() => {
      if (chrome.runtime.lastError) {
        reject(new Error('Failed to retrieve data'))
      }
      resolve()
    })
  })
}

// module.exports = {
//   fonts: {
//     save: setFonts,
//     get: getFonts
//   },
//   clear: clearStorage
// }
