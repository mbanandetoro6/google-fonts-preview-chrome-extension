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

module.exports = {
  webRequest: webRequest,
  jsonWebRequest: jsonWebRequest
}
