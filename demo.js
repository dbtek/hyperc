const Hyperc = require('./index')
const Component = require('./component')
const consecutive = require('./consecutive')

var app = new Hyperc('#stage')

function circleStore(state, emitter) {
  state.circles = {
    1: {id: 1, x: 100, y: 100, radius: 100, color: 'DeepSkyBlue'}
  }
  // set next id 2
  var nextId = consecutive(2)

  // adds a new item to store
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
app.render('circles', Circle)

// handle add circle button
function handleAddCircle() {
  var colors = ['indianred','lightcoral','salmon','darksalmon','lightsalmon','crimson','red','firebrick','darkred','pink','lightpink','hotpink','deeppink','mediumvioletred','palevioletred','lightsalmon','coral','tomato','orangered','darkorange','orange','gold','yellow','lightyellow','lemonchiffon','lightgoldenrodyellow','papayawhip','moccasin','peachpuff','palegoldenrod','khaki','darkkhaki','lavender','thistle','plum','violet','orchid','fuchsia','magenta','mediumorchid','mediumpurple','rebeccapurple','blueviolet','darkviolet','darkorchid','darkmagenta','purple','indigo','slateblue','darkslateblue','mediumslateblue','greenyellow','chartreuse','lawngreen','lime','limegreen','palegreen','lightgreen','mediumspringgreen','springgreen','mediumseagreen','seagreen','forestgreen','green','darkgreen','yellowgreen','olivedrab','olive','darkolivegreen','mediumaquamarine','darkseagreen','lightseagreen','darkcyan','teal','aqua','cyan','lightcyan','paleturquoise','aquamarine','turquoise','mediumturquoise','darkturquoise','cadetblue','steelblue','lightsteelblue','powderblue','lightblue','skyblue','lightskyblue','deepskyblue','dodgerblue','cornflowerblue','mediumslateblue','royalblue','blue','mediumblue','darkblue','navy','midnightblue','cornsilk','blanchedalmond','bisque','navajowhite','wheat','burlywood','tan','rosybrown','sandybrown','goldenrod','darkgoldenrod','peru','chocolate','saddlebrown','sienna','brown','maroon','snow','honeydew','mintcream','azure','aliceblue','ghostwhite','whitesmoke','seashell','beige','oldlace','floralwhite','ivory','antiquewhite','linen','lavenderblush','mistyrose','gainsboro','lightgray','silver','darkgray','gray','dimgray','lightslategray','slategray','darkslategray','black']
  var props = {
    x: Math.random()*600,
    y: Math.random()*600,
    radius: Math.random()*100,
    color: colors[Math.floor(Math.random()*colors.length)]
  }
  app.emitter.emit('circle:add', props)
}
window.handleAddCircle = handleAddCircle