import * as jQuery from 'jquery'
import * as copy from 'jquery.text-select'
var rules = []
rules.push({
  font: 'Roboto',
  category: 'sans-serif',
  selector: 'body',
  weight: 400,
  style: 'italic'
})
rules.push({
  font: 'Open Sans',
  category: 'sans-serif',
  selector: 'h1,h2,h3,h4,h5,h6',
  weight: 800,
  style: 'normal'
})
rules.push({
  font: 'Lobster Two',
  category: 'cursive',
  selector: 'header,footer',
  weight: 300,
  style: 'italic'
})
rules.push({
  font: 'Space Mono',
  category: 'monospace',
  selector: 'pre,code',
  weight: 400,
  style: 'normal'
})
rules.push({
  font: 'Open Sans Condenced',
  category: 'sans-serif',
  selector: 'ul,li,dl',
  weight: 400,
  style: 'italic'
})
rules.push({
  font: 'Roboto',
  category: 'sans-serif',
  selector: 'input',
  weight: 400,
  style: 'italic'
})
rules.push({
  font: 'AbeeZee',
  category: 'sans-serif',
  selector: 'header .logo',
  weight: 800,
  style: 'normal'
})
rules.push({
  font: 'Signika One',
  category: 'sans-serif',
  selector: 'body,he,h2,h3,h4,h5,h6,header,footer',
  weight: 500,
  style: 'italic'
})

function init () {
  injectCode()
  jQuery('.input-section').on('click', '.code', function () {
    jQuery(this).toggleClass('selected')
  })
  bindEvents()
}

function bindEvents () {
  jQuery('#select-html-text').click(() => jQuery('.html-output').selectText())
  jQuery('#select-css-text').click(() => jQuery('.css-output').selectText())
  jQuery('#copy-css-text').click(() => {
    jQuery('.css-output').selectText()
    document.execCommand('copy')
    jQuery('.css-output').selectText(false)
    jQuery('#css-copy-done').removeClass('is-hidden')
    setTimeout(() => jQuery('#css-copy-done').addClass('is-hidden'), 1500)
  })
  jQuery('#copy-html-text').click(() => {
    jQuery('.html-output').selectText()
    document.execCommand('copy')
    jQuery('.html-output').selectText(false)
    jQuery('#html-copy-done').removeClass('is-hidden')
    setTimeout(() => jQuery('#html-copy-done').addClass('is-hidden'), 1500)
  })
  jQuery('.toggle-help').click(function () {
    jQuery(this).next('.extra-help').toggle()
  })
}

function injectCode () {
  rules.forEach(function (rule) {
    jQuery('.input-section').append(code(rule, true))
    jQuery('.css-output').append(code(rule))
  }, this)
  // jQuery('.css-output').selectText()
}

var code = (data, selectable) => `
        <div class="code css ${selectable ? ' selected ' : ' '}">
            <span class="selector">${data.selector}</span>
            <span class="start">{</span>
            <span class="line">
              <span class="name">font-family :</span>
              <span class="property-value"><span class="string">'${data.font}'</span> ,${data.category};</span>
            </span>
            ${data.weight !== 400 ? `<span class="line"><span class="name">font-weight:</span><span class="value">${data.weight};</span></span>` : ''}
            ${data.style === 'italic' ? `<span class="line"><span class="name">font-style:</span><span class="value">${data.style};</span></span>` : ''}
            <span class="end">}</span>
            ${selectable ? ' <span class="fa fa-check-circle"></span>' : ''}
        </div>
`

jQuery(document).ready(init)
