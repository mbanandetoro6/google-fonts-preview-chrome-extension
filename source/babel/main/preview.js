import { } from './dom.js'
export function onFontClick (details) {
  console.log(details)
  var html = `<link rel="stylesheet" href="${details.url}" />
  <style id="gfp-font-style">
                ${details.cssSelectors}{
                    font-family:'${details.family}';
                    font-weight:${details.fontWeight};
                    ${details.italic ? 'fonts-style:italic;' : ''}
                }
                </style>
  `
  console.log(html)
  injectStyles(html)
}
