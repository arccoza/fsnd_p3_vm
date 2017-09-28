import React from 'react'
import {lightTheme, darkTheme, Theme} from './react-themes'
import {TextField, SelectField, MenuItem, Paper, RaisedButton,
  FlatButton, Chip, CircularProgress} from './widgets'
import {Link} from 'react-router-dom'
import {layout} from './utils'
import api from './api.js'
var h = React.createElement
var print = console.log.bind(console)


// A component with an interface and structure similar
// to TextField, so that the two can be interchanged.
// It only provides output for the viewing mode.
function Text({value, children=[]}) {
  return h('div', {style: {
    width: '256px',
    minHeight: '72px',
    lineHeight: '30px',
    ...layout({dr: 'v', jc: '+'})}},
    h('span', null, value, ...children),
  )
}

// Provides the item rource view for both editing and viewing.
export function Item({allCategories, curItem, curImage, errItem, isBusy,
  setField, updField, modify, mode, user}) {
  var fileInput
  var modeInv = {
    'edit': 'view',
    'view': 'edit',
  }
  var isAuthorized = false
  var isValid = curItem.title != null && curItem.title != ''

  // Set the `curItem.author` if it is null and `mode` is `edit`.
  if (mode == 'edit' && user && user.id && curItem.author == null)
    curItem.author = user.id

  // Check if the user is authorized to edit this item,
  // if not switch the mode to `view`.
  if (!(user && user.id && (curItem.author == user.id || curItem.author == null)))
    mode = 'view'
  else
    isAuthorized = true

  var cats = curItem.categories.map((v, i) => h(Chip, {key: v,
    onRequestDelete: ev => modify(null, 'curItem', 'categories', i),
    style: {margin: '0.25em'},
  }, (allCategories.find(e => e.id === v) || {}).title ))

  var col1 =
  h('div', {style: layout({dr: 'v', 'jc': '<'})},
    h('h2', null, mode == 'edit' ? 'Edit Item' : 'View Item'),
    mode != 'edit' ? null : h(RaisedButton, {
      label: isBusy ? null : 'Save',
      disabled: isBusy || !isValid,
      primary: true,
      style: {margin: '1em 0 0 0'},
      onTouchTap: ev => {
        if (isBusy || !isValid) return
        modify({do: 'save', on: 'items'}, 'action')
      }
    }, !isBusy ? null : h(CircularProgress, {size: 15, thickness: 1, className: 'CircularProgress'})),
    mode != 'edit' ? null : h(FlatButton, {
      label: isBusy ? null : 'Delete',
      disabled: isBusy || !curItem.id,
      style: {margin: '1em 0 0 0'},
      onTouchTap: ev => {
        if (isBusy || !curItem.id) return
        modify({do: 'remove', on: 'items'}, 'action')
      }
    }, !isBusy ? null : h(CircularProgress, {size: 15, thickness: 1, className: 'CircularProgress'})),
    !curItem.id || !isAuthorized ? null : h(Link, {to: `/${modeInv[mode]}/item/${curItem.id}`},
      h(FlatButton, {
        label: isBusy ? null : mode == 'edit' ? 'view' : 'edit',
        disabled: isBusy || !curItem.id,
        style: {margin: '1em 0 0 0', width: '100%'},
      }, !isBusy ? null : h(CircularProgress, {size: 15, thickness: 1, className: 'CircularProgress'}))
    ),
    h(mode != 'edit' ? Text : TextField, {
      floatingLabelText: 'Item name',
      hintText: 'ex: Snowboard',
      errorText: errItem && errItem.title ? 'This field is required.' : null,
      value: curItem.title,
      onChange: updField(({value: v}) => ({curItem: {...curItem, title: v}, errItem: {...errItem, title: v == ''}}))
    }),
    h(mode != 'edit' ? Text : TextField, {
      floatingLabelText: 'Item description',
      hintText: 'ex: An awesome snowboard',
      value: curItem.description,
      onChange: setField('curItem', 'description'),
    }),
    mode != 'edit' ? null : h(mode != 'edit' ? Text : TextField, {
      disabled: true,
      floatingLabelText: 'Item author',
      hintText: 'ex: Hank Venture',
      value: curItem.author || (user ? user.id : null),
      style: {cursor: 'default'}
    }),
    mode != 'edit' ? null : h(TextField, {
      floatingLabelText: 'Item image',
      hintText: 'ex: item.png',
      value: curImage.name,
      onTouchTap: ev => fileInput.click()
    }),
    h('input', {
      ref: el => fileInput = el,
      type: 'file',
      accept: 'image/*',
      style: {display: 'none'},
      onChange: updField(({files: [f]}) => ({curImage: {...curImage, name: f.name, type: f.type, blob: f}})),
    }),
    mode != 'edit' ? null : h(SelectField, {
      floatingLabelText: 'Select category',
      value: curItem.categories,
      listStyle: {backgroundColor: '#fff'},
      menuItemStyle: {color: '#00bcd4'},
      multiple: true,
      onChange: (ev, k, v) => modify(v, 'curItem', 'categories'),
    },
      allCategories.map(cat => (
          h(MenuItem, {key: cat.id, value: cat.id, primaryText: cat.title})
        )
      )
    ),
    h('div', {style: layout({dr: 'h', jc: '<', pd: '1em 0 0 0'})}, cats),
  )

  var col2 =
  h(Theme, {theme: lightTheme},
    h(Paper, {style: layout({dr: 'v', jc: 'a', ai: '+', fx: '1', mg: '0 0 0 3em', pd: '1em'})},
      h('img', {
        style: {maxWidth: '100%', width: 'fit-content'},
        src: curImage.blob instanceof Blob ? URL.createObjectURL(curImage.blob) : `/api/files/${curImage.id}/blob`
      })
    )
  )

  return h('div', {style: layout({dr: 'h'})}, col1, col2)
}
