var tape = require('tape')
var Hyperc = require('./index')
var Component = require('./component')
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
  Stage: class Stage {
    addChild () {}
    removeChild () {}
  },
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
  t.plan(4)
  t.equal(typeof app.use, 'function', 'Should expose use function')
  t.equal(typeof app.render, 'function', 'Should expose render function')

  t.doesNotThrow(() => {
    class Item extends Component {}
    app.render(Item)
  }, null, 'render: accepts only Components')

  t.doesNotThrow(() => {
    app.use(function () {})
  }, null, 'use: accepts only functions')
})

tape('Component class', (t) => {
  class Item extends Component {}
  t.plan(4)

  t.throws(() => {
    new Item() // eslint-disable-line no-new
  }, null, 'Component should implement identity method')

  class Rect extends Component {
    identity () {}
  }
  var rect = new Rect()

  t.throws(() => {
    rect.getItems()
  }, null, 'Component should implement getItems method')

  t.throws(() => {
    rect.create()
  }, null, 'Component should implement create method')

  t.throws(() => {
    rect.update()
  }, null, 'Component should implement update method')
})
