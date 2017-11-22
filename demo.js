const Hyperc = require('./index')
const consecutive = require('./consecutive')

var app = new Hyperc('#stage')

function circleStore(state, emitter) {
  var nextId = consecutive()
  state.circles = {}

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

// add renderer
app.render('circles', circlesRenderer)

// handle add circle button
function handleAddCircle() {
  var colors = ['indianred','lightcoral','salmon','darksalmon','lightsalmon','crimson','red','firebrick','darkred','pink','lightpink','hotpink','deeppink','mediumvioletred','palevioletred','lightsalmon','coral','tomato','orangered','darkorange','orange','gold','yellow','lightyellow','lemonchiffon','lightgoldenrodyellow','papayawhip','moccasin','peachpuff','palegoldenrod','khaki','darkkhaki','lavender','thistle','plum','violet','orchid','fuchsia','magenta','mediumorchid','mediumpurple','rebeccapurple','blueviolet','darkviolet','darkorchid','darkmagenta','purple','indigo','slateblue','darkslateblue','mediumslateblue','greenyellow','chartreuse','lawngreen','lime','limegreen','palegreen','lightgreen','mediumspringgreen','springgreen','mediumseagreen','seagreen','forestgreen','green','darkgreen','yellowgreen','olivedrab','olive','darkolivegreen','mediumaquamarine','darkseagreen','lightseagreen','darkcyan','teal','aqua','cyan','lightcyan','paleturquoise','aquamarine','turquoise','mediumturquoise','darkturquoise','cadetblue','steelblue','lightsteelblue','powderblue','lightblue','skyblue','lightskyblue','deepskyblue','dodgerblue','cornflowerblue','mediumslateblue','royalblue','blue','mediumblue','darkblue','navy','midnightblue','cornsilk','blanchedalmond','bisque','navajowhite','wheat','burlywood','tan','rosybrown','sandybrown','goldenrod','darkgoldenrod','peru','chocolate','saddlebrown','sienna','brown','maroon','white','snow','honeydew','mintcream','azure','aliceblue','ghostwhite','whitesmoke','seashell','beige','oldlace','floralwhite','ivory','antiquewhite','linen','lavenderblush','mistyrose','gainsboro','lightgray','silver','darkgray','gray','dimgray','lightslategray','slategray','darkslategray','black']
  var props = {
    x: Math.random()*600,
    y: Math.random()*600,
    radius: Math.random()*100,
    color: colors[Math.floor(Math.random()*colors.length)]
  }
  app.emitter.emit('circle:add', props)
}
window.handleAddCircle = handleAddCircle