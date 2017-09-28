import React from 'react'
import {lightTheme, darkTheme, Theme} from './react-themes'
import {TextField, SelectField, MenuItem, Paper, RaisedButton,
  FlatButton, Chip, CircularProgress,
  Table, TableBody, TableHeader, TableHeaderColumn, TableRow,
  TableRowColumn,} from './widgets'
import {Link} from 'react-router-dom'
import {layout} from './utils'
import api from './api.js'
var h = React.createElement
var print = console.log.bind(console)


function Text({value, children=[]}) {
  return h('div', {style: {
    width: '256px',
    height: '72px',
    lineHeight: '30px',
    ...layout({dr: 'v', jc: '+'})}},
    h('span', null, value, ...children),
  )
}

export function Category({items, curCategory, errCategory, isBusy,
  setField, updField, modify, mode, history, user}) {
  // print(curItem, curImage)
  var modeInv = {
    'edit': 'view',
    'view': 'edit',
  }
  var isValid = curCategory.title != null && curCategory.title != ''

  var itemRows = items.filter(v => curCategory.items.indexOf(v.id) != -1)
  .map((v, i) => {
    return h(TableRow, {key: v, onTouchTap: ev => history.push('/view/items/' + v.id)},
      h(TableRowColumn, null,
        h('img', {src: `/api/files/${v.image}/blob`, style: {height: '100%'}})
      ),
      h(TableRowColumn, null, v.title),
      h(TableRowColumn, null, v.description),
    )
  })

  var col1 =
  h('div', {style: layout({dr: 'v', 'jc': '<'})},
    h('h2', null, mode == 'edit' ? 'Edit Category' : 'View Category'),
    mode != 'edit' ? null : h(RaisedButton, {
      label: isBusy ? null : 'Save',
      disabled: isBusy || !isValid,
      primary: true,
      style: {margin: '1em 0 0 0'},
      onTouchTap: ev => {
        if (isBusy || !isValid) return
        modify({do: 'save', on: 'categories'}, 'action')
      }
    }, !isBusy ? null : h(CircularProgress, {size: 15, thickness: 1, className: 'CircularProgress'})),
    mode != 'edit' ? null : h(FlatButton, {
      label: isBusy ? null : 'Delete',
      disabled: isBusy || !curCategory.id,
      style: {margin: '1em 0 0 0'},
      onTouchTap: ev => {
        if (isBusy || !curCategory.id) return
        modify({do: 'remove', on: 'categories'}, 'action')
      }
    }, !isBusy ? null : h(CircularProgress, {size: 15, thickness: 1, className: 'CircularProgress'})),
    !curCategory.id ? null : h(Link, {to: `/${modeInv[mode]}/category/${curCategory.id}`},
      h(FlatButton, {
        label: isBusy ? null : mode == 'edit' ? 'view' : 'edit',
        disabled: isBusy || !curCategory.id,
        style: {margin: '1em 0 0 0', width: '100%'},
      }, !isBusy ? null : h(CircularProgress, {size: 15, thickness: 1, className: 'CircularProgress'}))
    ),
    h(mode != 'edit' ? Text : TextField, {
      floatingLabelText: 'Category name',
      hintText: 'ex: Posters',
      errorText: errCategory && errCategory.title ? 'This field is required.' : null,
      value: curCategory.title,
      onChange: updField(({value: v}) => ({curCategory: {...curCategory, title: v}, errCategory: {...errCategory, title: v == ''}})),
    }),
    h(mode != 'edit' ? Text : TextField, {
      floatingLabelText: 'Category description',
      hintText: 'ex: All the movie posters',
      value: curCategory.description,
      onChange: setField('curCategory', 'description'),
    }),
  )

  var col2 =
  h(Theme, {theme: lightTheme},
    h(Paper, {style: layout({dr: 'v', jc: 'b', ai: '<', fx: '1', mg: '0 0 0 3em', pd: '1em'})},
      h(Table, {
        style: {maxWidth: '100%', width: '100%'},
        selectable: false,
      },
        h(TableHeader, null,
          h(TableRow, null,
            h(TableHeaderColumn, null, 'Image'),
            h(TableHeaderColumn, null, 'Title'),
            h(TableHeaderColumn, null, 'Description'),
          )
        ),
        h(TableBody, null,
          // h(TableRow, null,
          //   h(TableRowColumn, null, 'blah'),
          //   h(TableRowColumn, null, 'blah'),
          //   h(TableRowColumn, null, 'blah'),
          // )
          ...itemRows
        )
      )
    )
  )

  return h('div', {style: layout({dr: 'h'})}, col1, col2)
}
