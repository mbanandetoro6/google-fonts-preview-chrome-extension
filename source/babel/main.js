'use strict'
import { init as Initialize } from './main/init.js'
import { loadFontsFromExtension as loadFonts } from './main/fontsApi.js'

Initialize() // try to init
  .then(() => loadFonts()) // on success load the fonts
  .catch(error => window.alert(error.message)) // on error alert the user with error
