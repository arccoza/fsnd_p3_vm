import React from 'react'
import {List, ListItem, Divider, Drawer} from './widgets'
import {NavigationClose, NavigationChevronRight, EditorModeEdit} from './icons'
import {Link} from 'react-router-dom'
import api from './api'


export default class AppNav extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      categories: []
    }
  }

  componentDidMount = () => {
  }

  render() {
    var {user} = this.props

    var categoryList = this.props.categories.map(cat => {
      return (
        <Link to={`/view/category/${cat.id}`} key={cat.id}>
          <ListItem
            primaryText={cat.title}
            leftIcon={!user ? null : <Link to={`/edit/category/${cat.id}`}><EditorModeEdit/></Link>}
            rightIcon={<NavigationChevronRight />}
            onTouchTap={ev => this.props.pub('nav', {isOpen: false})}
          />
        </Link>
      )
    })

    return (
      <Drawer
        docked={false}
        open={this.props.nav.isOpen}
        onRequestChange={(open, reason) => {
            this.props.pub('nav', {isOpen: false})
        }}
      >
        <List>
          <Link to={'/view/all'}>
            <ListItem
              primaryText='Home'
              rightIcon={<NavigationChevronRight />}
              onTouchTap={ev => this.props.pub('nav', {isOpen: false})}
            />
          </Link>
        </List>
        <Divider />
        <List>
          {categoryList}
        </List>
      </Drawer>
    )
  }
}
