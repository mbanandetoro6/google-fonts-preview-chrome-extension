var jQuery = require('jquery') // require jquery for using http module

function webRequest (url) { // web request to get data from urls
  return new Promise((resolve, reject) => { // wrap into es6 promise
    jQuery.get(url).then(resolve).catch(reject)
  })
}

function jsonWebRequest (url) { // make web request and parse json into js object
  return new Promise((resolve, reject) => { // wrap into es6 promise
    jQuery.getJSON(url).then(resolve).catch(reject)
  })
}

module.exports = { // export public apis
  webRequest: webRequest,
  jsonWebRequest: jsonWebRequest
}
