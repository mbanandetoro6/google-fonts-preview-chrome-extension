var Axios = require('axios') // require jquery for using http module

function webRequest (url) { // web request to get data from urls
  return new Promise((resolve, reject) => { // wrap into es6 promise
    Axios.get(url)
      .then((response) => { // on success
        resolve(response.data) // return with data
      })
      .catch(reject) // on error reject with error
  })
}

module.exports = { // export public apis
  webRequest: webRequest,
  jsonWebRequest: webRequest // axios automatically parses the json data, so we are using the same function for both, but leaving the output api intact, incase have to change
}
