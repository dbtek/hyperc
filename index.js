const assert = require('assert')
const nanobus = require('nanobus')
const clone = require('clone')
const { diff } = require('just-diff')
const Component = require('./component')

module.exports = class HyperC {
  constructor (selector) {
    assert.ok(typeof selector === 'string' || typeof selector === 'object', 'hyperc selector should be type String or HTMLElement')
    if (typeof selector === 'string') {
      selector = document.querySelector(selector)
    }
    this.stage = new document.createjs.Stage(selector)
    this.stage.name = 'HyperC Root Stage'
    this.emitter = nanobus('hyperc.emit')
    this.state = {}
    this._views = []

    var self = this

    document.addEventListener('DOMContentLoaded', () => {
      self.doDiff()
    })

    this.emitter.on('render', () => {
      self.doDiff()
    })

    window.hyperc = self
  }

  use (cb) {
    assert.equal(typeof cb, 'function', 'hyperc.use: cb should be type function')
    cb(this.state, this.emitter, this)
  }

  render (Cls) {
    assert(Cls.prototype instanceof Component, 'render only accepts classes inherited Component')
    var container = new document.createjs.Container()
    this.stage.addChild(container)
    this._views.push({
      Component: Cls,
      container,
      components: {}
    })
  }

  doDiff () {
    var results
    // do diffing seperately for each view
    for (var view of this._views) {
      // slice items from state with static getItems call
      var items = view.Component.getItems(this.state)
      var initialItems = []
      if (typeof items === 'object') initialItems = {}
      if (!view.prevItems) {
        results = diff(initialItems, items)
      } else {
        results = diff(view.prevItems, items)
      }
      view.prevItems = clone(items)
      for (var patch of results) {
        this.applyPatch(patch, view)
      }
    }
    // render updates
    this.update()
  }

  applyPatch (patch, view) {
    var self = this
    var idx = patch.path[0]
    var item = view.Component.getItems(this.state)[idx]
    var component

    if (patch.op === 'add') {
      if (patch.path.length > 1) {
        patch.op = 'replace'
      } else {
        component = new view.Component(this.state, (eventName, data) => {
          self.emitter.emit(eventName, data)
        }, item)
        component.container.name = `${view.Component.name}-${idx}`
        view.container.addChild(component.container)
        view.components[idx] = component
        component.create(item)
      }
    }

    if (patch.op === 'remove') {
      if (patch.path.length > 2) {
        patch.op = 'replace'
      } else {
        component = view.components[idx]
        view.container.removeChild(component.container)
        delete view.components[idx]
      }
    }

    if (patch.op === 'replace') {
      component = view.components[idx]
      component.update(item, patch)
    }
  }

  update () {
    this.stage.update()
  }
}
