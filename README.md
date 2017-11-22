hyperc
===

State driven high performance canvas graphics framework based on EaselJS and JSON Patch.

Currently, hyperc is in alpha stage, things may change.

Highly inspired from [choojs/choo](https://github.com/choojs/choo).

### Example

```js
const Hyperc = require('hyperc')
const consecutive = require('hyperc/consecutive')
var app = new Hyperc('#stage')

function circleStore(state, emitter) {
  var nextId = consecutive()
  
  // store should add a unique container to state
  // this key will be used to bind renderer
  state.circles = {}

  // adds a new item to store
  // items should be id keyed objects
  // here, provided consecutive helper is used to create sequential ids
  function addItem(item) {
    const id = nextId()
    state.circles[id] = Object.assign({}, item, {id})
  }

  addItem({x: 100, y: 100, radius: 100, color: 'DeepSkyBlue'})

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

function circlesRenderer(state, emit) {
  return {
    add(container, item) {
      var circle = new createjs.Shape()
      circle.graphics.beginFill(item.color).drawCircle(0, 0, item.radius).endFill()
      circle.id = item.id
      circle.x = item.x
      circle.y = item.y
      container.addChild(circle)

      circle.on('pressmove', e => {
        emit('circle:moveItem', {
          id: e.target.id,
          x: e.stageX,
          y: e.stageY
        })
      })
    },
    replace(container, item) {
      const [circle] = container.children
      circle.x = item.x
      circle.y = item.y
      circle.graphics.clear().beginFill(item.color).drawCircle(0, 0, item.radius).endFill()
    }
  }
}

// add store
app.use(circleStore)

// add renderer with store key to bind it
app.render('circles', circlesRenderer)

```