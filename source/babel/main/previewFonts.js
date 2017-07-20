/*
use click on font family
inject the font in page
then
inject the style in page
    use the css selector and font weight defined in settings
    h1,h3,h4{
        font-family:'Roboto';
        font-weight:300;
    }
    body{
        font-family:'Lato'!important;
        font-weight:400
    }

*/
function onFontClick (details, injectStyles) {
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

module.exports = {
  onFontClick: onFontClick
}
