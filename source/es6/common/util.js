var Axios = require('axios') // require jquery for using http module

export function webRequest (url) { // web request to get data from urls
  return new Promise((resolve, reject) => { // wrap into es6 promise
    Axios.get(url)
      .then((response) => { // on success
        resolve(response.data) // return with data
      })
      .catch(reject) // on error reject with error
  })
}
export function getAdjacentItemFromArray (history, cItem, lookBackward) {
  if (!history) {
    return false
  }
  if (!cItem || cItem.trim() === '') {
    return lookBackward ? history[history.length - 1] : ''
  }

  for (var i = 0; i < history.length; i++) {
    var item = history[i]
    var returnItem = (lookBackward ? history[i - 1] : history[i + 1]) || ''
    if (item === cItem) {
      return returnItem
    }
  }
  return lookBackward ? history[history.length - 1] : ''
}
export var jsonWebRequest = webRequest
// axios automatically parses the json data,
// so we are using the same function for both, but leaving the output api intact, incase need to change
