import React from 'react'
import {lightTheme, darkTheme, Theme} from './react-themes'
import {GridList, GridTile, Subheader, TextField, SelectField,
  MenuItem, Paper, IconButton, RaisedButton, Chip, Divider} from './widgets'
import {EditorModeEdit} from './icons'
import {Link} from 'react-router-dom'
import {Item} from './react-app-items-item'
import {Category} from './react-app-items-category'
import {layout, modify} from './utils'
import api from './api.js'
var h = React.createElement
var print = console.log.bind(console)


export default class Items extends React.Component {
  constructor(props) {
    super(props)

    this.modify = modify.bind(this)

    this.types = {  // Provides a mapping of singular type names to plural for REST requests.
      'item': 'items',
      'category': 'categories',
      'items': 'items',
      'categories': 'categories',
    }

    this.typesInv = {  // Provides an inverse mapping of type names.
      'item': 'categories',
      'category': 'items',
      'items': 'categories',
      'categories': 'items',
    }

    this.blank = {
      category: () => ({
        id: null,
        title: '',
        description: '',
        items: [],
        author: null,
      }),
      item: () => ({
        id: null,
        image: null,
        title: '',
        description: '',
        categories: [],
        author: null,
      }),
      image: () => ({
        id: null,
        name: '',
        type: null,
        blob: null,
      }),
    }

    this.state = {
      action: null,
      categories: [{
          id: 12,
          title: 'hello',
        },
        {
          id: 34,
          title: 'oi',
        }],
      items: [],
      files: [],
      curCategory: this.blank.category(),
      curItem: this.blank.item(),
      curImage: this.blank.image(),
      errCategory: null,
      errItem: null,
      isBusy: false,
    }
  }

  // Fetches data from the server.
  fetch({mode, type, id}) {
    print('........................fetching')
    var modify = this.modify
    type = this.types[type]  // Use `this.types` for singular to plural conversion for the REST API.
    var obj = {}

    if (type == undefined) return  // If the type couldn't be found return.

    var p = api.get(type, id)
    // .then(([data, resp]) => (modify(data, type), [data, resp]))
    .then(([data, resp]) => (obj[type] = data, [data, resp]))

    // Branch the promise here to fetch the attached image
    // if the first element is an `item` with an `image` prop.
    var p2 = p.then(([data]) => {
      if (data[0] && data[0].image)
        return api.get('files', data[0].image)
      else
        return [[]]
    })
    // .then(([data]) => modify(data, 'files'))
    .then(([data]) => (obj['files'] = data, [data]))

    // Continue the original branch fetching the alternate data:
    // `items` if `categories` or `categories` if `items`.
    p = p.then(([data, resp]) => {
      var ids = data.reduce((acc, val) => acc.concat(val[this.typesInv[type]]), []).filter(e => e !== undefined)

      if (ids.length)
        return api.get(this.typesInv[type], ids)
      else
        return [[], resp]
    })
    // .then(([data, resp]) => (modify(data, this.typesInv[type]), [data, resp]))
    .then(([data, resp]) => (obj[this.typesInv[type]] = data, [data, resp]))

    var p3 = Promise.all([p, p2])
    .then(([data, resp]) => (this.setState(obj), [obj]))

    return p3
  }

  // Saves the current state of an item, category or image to the server.
  save({curCategory, curItem, curImage}) {
    var modify = this.modify
    var {location, history} = this.props

    print(curCategory, curItem, curImage)

    if (curItem) {
      return Promise.resolve(curImage.blob ? api.add('files', null, curImage, 'form') : [{id: curImage.id}])
      .catch(([data, resp]) => {
        if ('id' in data)
          return [data, resp]
        else
          throw [data, resp]
      })
      .then(([data]) => {
        modify(data.id, 'curItem', 'image')
        modify(data.id, 'curImage', 'id')
        curItem.image = data.id
        curImage.id = data.id

        if (curItem.id != null)
          return api.set('items', curItem.id, curItem)
        else
          return api.add('items', null, curItem)
      })
      // .catch(([err, resp]) => print(err))
      .then(([data, resp]) => {
        curItem.id = data.id
        var path = location.pathname.split('/')
        path = (path.splice(-1, 1, data.id), path.join('/'))
        history.replace(path)
        return [data, resp]
      })
    }

    if (curCategory) {
      if (curCategory.id != null)
        var p = api.set('categories', curCategory.id, curCategory)
      else
        var p = api.add('categories', null, curCategory)

      return p.then(([data, resp]) => {
        var path = location.pathname.split('/')
        path = (path.splice(-1, 1, data.id), path.join('/'))
        history.replace(path)
        return [data, resp]
      })
    }

    return Promise.reject('Object must exist.')
  }

  // Deletes an item or category from the server.
  remove({curCategory, curItem}) {
    var modify = this.modify

    if (curItem && curItem.id) {
      return api.rem('items', curItem.id)
      // .then(([data, resp]) => print(data))
      // .catch(([err, resp]) => print(err))
    }

    if (curCategory && curCategory.id) {
      return api.rem('categories', curCategory.id)
    }

    return Promise.reject('Object must exist.')
  }

  // Sets or resets the value of the curCategory, curItem and curImage.
  setCurObjs(id, data) {
    var state = this.state
    var obj = {}

    if (id != null) {
      obj.curItem = data.items && data.items.length > 0 ? {...data.items[0]} : state.curItem
      obj.curImage = data.files && data.files.length > 0 ? {...data.files[0]} : state.curImage
      obj.curCategory = data.categories && data.categories.length > 0 ? {...data.categories[0]} : state.curCategory
      this.setState(obj)
    }
    else {
      obj.curItem = this.blank.item()
      obj.curImage = this.blank.image()
      obj.curCategory = this.blank.category()
      this.setState(obj)
    }
  }

  // Tries to fetch data with the initial props.
  componentDidMount() {
    var state = this.state
    print('......................mounted')
    this.fetch(this.props)
    .then(([data]) => this.setCurObjs(this.props.id, data))
  }

  // Fetches data whenver the view changes and there are new props.
  componentWillReceiveProps(nextProps) {
    print('......................props')
    var state = this.state
    var {mode, type, id} = this.props

    if (nextProps.type == type && nextProps.id == id)
      return

    print('......................loading')

    this.fetch(nextProps)
    .then(([data]) => this.setCurObjs(nextProps.id, data))
  }

  // Check for and do actions, such as save and remove.
  componentDidUpdate(prevProps, prevState) {
    print('......................updated')
    var modify = this.modify
    var state = this.state
    var {history, pub} = prevProps

    if (state.action && state.action.on == 'categories'
      && (state.errCategory == null || !state.errCategory.title)) {
        var curCategory = state.curCategory
    }
    else if (state.action && state.action.on == 'items'
      && (state.errItem == null || !state.errItem.title)) {
      var curItem = state.curItem
      var curImage = state.curImage
    }
    else
      return

    if (state.action.do == 'save') {
      modify(true, 'isBusy')
      this.save({curCategory, curItem, curImage})
      .catch(err => pub('message', {content: 'Save error.', action: null}))
      .finally(() => (state.action = null, modify(false, 'isBusy')))
    }
    else if (state.action.do == 'remove') {
      modify(true, 'isBusy')
      this.remove({curCategory, curItem})
      .catch(err => pub('message', {content: 'Remove error.', action: null}))
      .finally(() => (state.action = null, history.replace('/view/all'), modify(false, 'isBusy')))
    }

    state.action = null
  }

  render() {
    print('......................rendering')
    var content = []
    var setField = (...args) => ev => this.modify(ev.target.value, ...args)
    var updField = (fn) => ({target: {value, files}}) => this.setState(fn({value, files}))
    var modify = this.modify
    var singleItem = false
    var editCategory = false
    var {mode, type, id, history, user} = this.props
    print(mode, type, id, history, user)

    if (type == 'item') {
      if (this.state.items.length == 1 && id != null)
        singleItem = true
      else if (mode == 'edit' && id == null)
        singleItem = true
    }
    else if (type == 'category' && mode == 'edit') {
      if (this.state.categories.length == 1 && id != null)
        editCategory = true
      else if (mode == 'edit' && id == null)
        editCategory = true
    }


    if (singleItem) {
      print('singleItem', mode, type, id, this.state.items[0])
      content = [Item({...this.state, allCategories: this.props.categories, setField,
        updField, modify, mode, user})]
    }
    else if (editCategory) {
      print('editCategory')
      content = [Category({...this.state, setField, updField, modify, mode, history, user})]
    }
    else if (mode == 'view') {
      content = [
        h('h2', null,
          `View Items ${this.state.curCategory.title ? 'in ' + this.state.curCategory.title : ''}`
        ),
        h(GridList, {cellHeight: 180, cols: 4},
          this.state.items.map((item) => (
            h(GridTile, {
              key: item.id,
              containerElement: h(Link, {to: `/view/item/${item.id}`}),
              title: item.title,
              actionIcon: !(user && user.id == item.author) ? null : h(Link, {to: `/edit/item/${item.id}`}, h(IconButton, null, h(EditorModeEdit))),
              style: {borderRadius: '4px'},
            },
              h('img', {src: `/api/files/${item.image}/blob`})
            )
          ))
        )
      ]
    }
    else {
      print('Not found', mode, type, id, this.state.items[0])
      content = [h('h2', {style: {textAlign: 'center'}}, 'Not found')]
    }

    return h(Theme, {theme: darkTheme},
      h('div', {style: layout({dr: 'v.', mg: '20px 180px 20px 180px'})},
        ...content
      )
    )
  }
}
