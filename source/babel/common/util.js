var Axios = require('axios') // require jquery for using http module

function webRequest (url) { // web request to get data from urls
  return new Promise((resolve, reject) => { // wrap into es6 promise
    Axios.get(url).then((response) => {
      resolve(response.data)
    }).catch(reject)
  })
}

module.exports = { // export public apis
  webRequest: webRequest,
  jsonWebRequest: webRequest
}
