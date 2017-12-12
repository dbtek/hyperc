var tape = require('tape')
var Hyperc = require('./index')
var JSDOM = require('jsdom').JSDOM

var DOM = new JSDOM(`
  <html>
    <body>
      <canvas id="stage" width="600" height="600"></canvas>
    </body>
  </html>
`)

global.window = DOM.window
global.document = DOM.window.document
global.window.createjs = {
  Stage: function () {},
  Shape: function () {},
  Container: function () {}
}

tape('Create an app', (t) => {
  t.plan(3)

  t.throws(() => {
    new Hyperc()  // eslint-disable-line no-new
  }, null, 'Should throw exception when no selector is given')

  t.doesNotThrow(() => {
    new Hyperc('#stage')  // eslint-disable-line no-new
  }, null, 'Should accept query selector')

  t.doesNotThrow(() => {
    new Hyperc(document.querySelector('#stage'))  // eslint-disable-line no-new
  }, null, 'Should accept node')
})

tape('Exposed APIs', (t) => {
  var app = new Hyperc('#stage')
  t.plan(2)
  t.equal(typeof app.use, 'function', 'Should expose use function')
  t.equal(typeof app.render, 'function', 'Should expose render function')
})
