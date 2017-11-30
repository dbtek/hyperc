const assert = require('assert')
const nanobus = require('nanobus')
const clone = require('clone')
const { diff } = require('just-diff')
const Component = require('./component')

module.exports = class HyperC {
  constructor(selector) {
    assert.ok(typeof selector === 'string' || typeof selector === 'object', 'hyperc selector should be type String or HTMLElement')
    if (typeof selector === 'string') {
      selector = document.querySelector(selector)
    }
    this.stage = new createjs.Stage(selector)
    this.stage.name = 'HyperC Root Stage'
    this.emitter = nanobus('hyperc.emit')
    this.state = {}
    this._views = {}

    var self = this

    document.addEventListener('DOMContentLoaded', () => {
      self.doDiff()
    })

    this.emitter.on('render', () => {
      self.doDiff()
    })

    window.hyperc = self
  }

  use(cb) {
    assert.equal(typeof cb, 'function', 'choo.use: cb should be type function')
    cb(this.state, this.emitter, this)
  }

  render(namespace, Cls) {
    assert(Cls.prototype instanceof Component, 'render only accepts classes inherited Component')
    var container = new createjs.Container()
    var self = this
    container.name = namespace
    this.stage.addChild(container)
    this._views[namespace] = {
      Component: Cls,
      container,
      components: {}
    }
  }

  doDiff() {
    var result

    if (!this.prevState) {
      result = diff({}, this.state)
    }
    else {
      result = diff(this.prevState, this.state)
    }
    this.prevState = clone(this.state)
    
    var diffs = []
    for (var mdiff of result) {
      if (mdiff.path.length === 1) {
        for (var key in mdiff.value) {
          var newDiff = {}
          newDiff = {
            op: mdiff.op,
            path: mdiff.path.concat([key]),
            value: mdiff.value[key]
          }
          diffs.push(newDiff)
        }
      }
      else {
        diffs.push(mdiff)
      }
    }

    for (var mdiff of diffs) {
      var component = null
      var namespace = mdiff.path[0]
      var itemId = mdiff.path[1]
      var item = this.state[namespace][itemId]
      var view = this._views[namespace]
      var self = this
      // if diff does not concern any view skip it
      if (!view) return

      if (mdiff.op === 'add') {
        if (mdiff.path.length > 2) {
          mdiff.op = 'replace'
        }
        else {
          component = new view.Component(this.state, ((eventName, data) => {
            self.emitter.emit(eventName, data)
          }), item)
          component.container.name = `${namespace}-${itemId}`
          view.container.addChild(component.container)
          view.components[itemId] = component
          component.create(item)
        }
      }

      if (mdiff.op === 'remove') {
        if (mdiff.path.length > 2) {
          mdiff.op = 'replace'
        }
        else {
          component = view.components[itemId]
          view.container.removeChild(container)
          delete view.container[itemId]
        }
      }

      if (mdiff.op === 'replace') {
        component = view.components[itemId]
        component.update(item, mdiff)
      }

      // render updates
      this.update()
    }
  }

  update() {
    this.stage.update()
  }
}