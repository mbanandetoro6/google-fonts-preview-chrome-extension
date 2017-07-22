import { injectStyles } from './dom.js'
import { injectFontIntoPage } from './fontsApi.js'
var styles = []
export function onFontClick (data) {
  return new Promise((resolve, reject) => {
    console.log(data)
    var rule = `${data.cssSelectors}{
                  font-family:'${data.family}'!important;
                  font-weight:${data.fontWeight}!important;
                  ${data.italic ? 'font-style:italic!important;' : ''}
                }`

    injectFontIntoPage(data).then(() => {
      injectStyles(rule)
      resolve()
    }).catch(reject)
    var style = {
      rule: rule,
      data: data
    }
    styles.push(style)
  })
}
