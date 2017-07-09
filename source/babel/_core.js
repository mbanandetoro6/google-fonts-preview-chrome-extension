/* global XMLHttpRequest */
function webRequest (url) {
  return new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest()
    xhr.open('GET', url, true)
    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.responseText)
      } else {
        reject(new Error(xhr.statusText + ' ' + url))
      }
    }
    xhr.onerror = function () {
      reject(new Error(xhr.statusText))
    }
    xhr.send(null)
  })
}

function jsonWebRequest (url) {
  return new Promise((resolve, reject) => {
    webRequest(url).then(function (response) {
      var json = JSON.parse(response)
      resolve(json)
    }).catch(reject)
  })
}
function randomId () {
  var id = ''
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (var i = 0; i < 8; i++) { id += possible.charAt(Math.floor(Math.random() * possible.length)) }

  return id
}

module.exports = {
  webRequest: webRequest,
  jsonWebRequest: jsonWebRequest,
  getRandomId: randomId
}
