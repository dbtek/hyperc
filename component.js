const assert = require('assert')

class Component {
  constructor(state, emit, props) {
    this.id = this.identity(props)
    this.state = state
    this.emit = emit
    this.container = new createjs.Container()
  }

  identity() {
    throw new Error('hyperc/component: identity should be implemented!')
  }

  create() {
    throw new Error('hyperc/component: create should be implemented!')
  }

  update() {
    throw new Error('hyperc/component: update should be implemented!')
  }
}

module.exports = Component