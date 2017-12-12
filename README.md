hyperc
===

[![Build Status](https://circleci.com/gh/dbtek/hyperc.svg?style=svg&circle-token=061015e3efd0d84ec8598946ba22c3e071677c33) ](https://circleci.com/gh/dbtek/hyperc)  [ ![Test Coverage](https://img.shields.io/codecov/c/token/bDcjOrSeM2/github/dbtek/hyperc/master.svg?style=flat-square) ](https://codecov.io/github/dbtek/hyperc)  [ ![Standard](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://codecov.io/github/dbtek/hyperc)


State driven high performance canvas graphics framework based on EaselJS and JSON Patch.

Currently, hyperc is in alpha stage, things may change.

Highly inspired from [choojs/choo](https://github.com/choojs/choo).

### Example

```html
...
  <canvas id="stage" width="600" height="600"></canvas>
...
```
```js
const Hyperc = require('hyperc')
const Component = require('hyperc/component')
const consecutive = require('consecutive')

var app = new Hyperc('#stage')

function circleStore(state, emitter) {
  state.circles = [
    {id: 1, x: 100, y: 100, radius: 100, color: 'DeepSkyBlue'}
  ]
  // set next id 2
  var nextId = consecutive(2)

  emitter.on('circle:add', item => {
    const id = nextId()
    state.circles.push(Object.assign({}, item, {id}))
    emitter.emit('render')
  })

  emitter.on('circle:moveItem', ({id, x, y}) => {
    var circle = state.circles.filter(c => c.id === id)[0]
    if (!circle) return
    circle.x = x
    circle.y = y
    emitter.emit('render')
  })
}

class Circle extends Component {
  static getItems(state) {
    return state.circles
  }

  identity(props) {
    return props.id
  }

  create(props) {
    var shape = new createjs.Shape()
    shape.graphics.beginFill(props.color).drawCircle(0, 0, props.radius).endFill()
    shape.x = props.x
    shape.y = props.y
    this.shape = shape
    // add newly created shape to component's container
    this.container.addChild(shape)
    shape.on('pressmove', e => {
      this.emit('circle:moveItem', {
        id: this.id,
        x: e.stageX,
        y: e.stageY
      })
    })
  }

  update(props, patch) {
    this.shape.x = props.x
    this.shape.y = props.y
    this.shape.graphics.clear().beginFill(props.color).drawCircle(0, 0, props.radius).endFill()
  }
}

// add store
app.use(circleStore)

// add renderer
app.render(Circle)
```
