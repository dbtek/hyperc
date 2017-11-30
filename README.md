hyperc
===

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
const consecutive = require('hyperc/consecutive')

var app = new Hyperc('#stage')

function circleStore(state, emitter) {
  state.circles = {
    1: {id: 1, x: 100, y: 100, radius: 100, color: 'DeepSkyBlue'}
  }
  // set next id 2
  var nextId = consecutive(2)

  // adds a new item to store
  // items should be id keyed objects
  // here, provided consecutive helper is used to create sequential ids
  function addItem(item) {
    const id = nextId()
    state.circles[id] = Object.assign({}, item, {id})
  }

  emitter.on('circle:add', item => {
    addItem(item)
    emitter.emit('render')
  })

  emitter.on('circle:moveItem', ({id, x, y}) => {
    state.circles[id].x = x
    state.circles[id].y = y
    emitter.emit('render')
  })
}

class Circle extends Component {
  identity(props) {
    return props.id
  }

  create(props) {
    const shape = new createjs.Shape()
    shape.graphics.beginFill(props.color).drawCircle(0, 0, props.radius).endFill()
    shape.x = props.x
    shape.y = props.y
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
    const [shape] = this.container.children
    shape.x = props.x
    shape.y = props.y
    shape.graphics.clear().beginFill(props.color).drawCircle(0, 0, props.radius).endFill()
  }
}

// add store
app.use(circleStore)

// add renderer
app.render('circles', Circle)
```