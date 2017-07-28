import { injectCSS } from './dom_styles_manage.js'
import { injectFontIntoPage, getFonts } from './fontsApi.js'
var styles = []
export function injectFontAndApply (rule) {
  console.log(rule)
  return new Promise((resolve, reject) => {
    var css = `${rule.selector}{
                  font-family:'${rule.family}'!important;
                  font-weight:${rule.weight}!important;
                  font-style:${rule.style}!important;
                }`
    injectFontIntoPage(rule.family, rule.url)
      .then(() => {
        styles.push(rule)
        injectCSS(css)
        resolve()
      }).catch(reject)
  })
}
export function getActiveStyles () {
  return styles
}
export function resetStyles () {
  styles = []
}

export function parseAndApplyStyles (command) {
  var rules = parseCSSCommand(command)
  var promise = Promise.resolve()
  rules.forEach(rule => {
    var fonts = getFonts()
    var matchedFonts = fonts.filter(_font => {
      return _font.family.replace(/\s/g, '').toLowerCase() === rule.family.replace(/\s/g, '').toLowerCase()
    })
    var font = matchedFonts[0]
    if (font) {
      var _rule = {
        family: font.family,
        url: font.url,
        selector: rule.selector,
        weight: rule.weight,
        style: rule.style
      }
      // injectFontAndApply(_rule)
      promise = promise.then(() => {
        return injectFontAndApply(_rule)
      }, () => {
        return injectFontAndApply(_rule)
      })
    }
  })
  return promise
}

function parseCSSCommand (command) {
  var rules = command
    .replace(/\n/g, '')
    .split(';')
    .filter(rule => {
      return rule.trim().includes('/')
    })
  rules = rules.map(item => {
    var rule = item.trim().split('/')
    var selector = rule[0].trim()
    var object = {
      selector: selector === 'h1-6' ? 'h1,h2,h3,h4,h5,h6' : selector,
      family: rule[1].trim(),
      weight: rule[2] ? rule[2].trim() : '400',
      style: rule[3] ? rule[3].trim() : 'normal'
    }
    return object
  })
  console.log(rules)
  return rules
}
