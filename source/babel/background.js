/* global chrome */

// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function (tab) {
  // No tabs or host permissions needed!
  console.log('clicked me')

  chrome.tabs.executeScript(null, {file: 'js/main.js'})
})
