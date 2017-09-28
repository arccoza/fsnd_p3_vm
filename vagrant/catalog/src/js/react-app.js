// import Kitchen from './kitchen'
import React from 'react'
import {lightTheme, darkTheme, Theme} from './react-themes'
import {AppBar, FlatButton, RaisedButton, Dialog, DropDownMenu, Menu, MenuItem,
  Popover, Toggle, GridList, GridTile, IconButton, Subheader, FontIcon,
  CircularProgress, Snackbar, Avatar, Drawer, List, ListItem, Divider,
  FloatingActionButton} from './widgets'
import {StarBorder, NavigationClose, NavigationChevronRight, ContentAdd,
  ContentAddBox, AvLibraryAdd} from './icons'
import Auth from './auth'
import AppHeader from './react-app-header'
import AppNav from './react-app-nav'
import {
  Switch,
  Route,
  Link,
  Redirect,
  withRouter
} from 'react-router-dom'
import Items from './react-app-items'
import {Promise} from './utils'  // Simply imported to trigger the prototype update.
import api from './api'
var print = console.log.bind(console)


const googleScriptSrc = '//apis.google.com/js/platform.js'
const facebookScriptSrc = '//connect.facebook.net/en_US/sdk.js'
const authProviders = {}

authProviders['google'] = new Auth({provider: 'google', scriptSrc:googleScriptSrc, cred:{
  'clientId': '32902065428-sbal87ccp0eedjoo2opcq0tr22ha3884.apps.googleusercontent.com',
  'scope': 'profile email'
}})

authProviders['facebook'] = new Auth({provider: 'facebook', scriptSrc:facebookScriptSrc, cred:{
  'appId': '126309204593715',
  'cookie': true,
  'xfbml': true,
  'version': 'v2.9',
  'scope': 'email'
}})


window.authProviders = authProviders

const vlayout = {
  display: 'flex',
  flexFlow: 'column wrap',
  justifyContent: 'space-between',
  alignContent: 'center',
  alignItems: 'stretch',
}

const hlayout = {
  display: 'flex',
  flexFlow: 'row wrap',
  justifyContent: 'space-between',
  alignContent: 'center',
  alignItems: 'stretch',
}

const layoutStack = {
  position: 'relative',
  display: 'flex',
  // width: '100%',
  flexFlow: 'column nowrap',
  justifyContent: 'space-between',
  alignContent: 'center',
  alignItems: 'stretch',
}

const Home = () => (
  <div>
    <h2>Home</h2>
  </div>
)

const Item = ({ match }) => (
  <div>
    <h2>Item</h2>
    <h3>{match.params.id}</h3>
  </div>
)

const Category = ({ match }) => (
  <div>
    <h2>Category</h2>
    <h3>{match.params.id}</h3>
  </div>
)

const EditItem = ({ match }) => (
  <div>
    <h2>Edit Item</h2>
    <h3>{match.params.id}</h3>
  </div>
)

const EditCategory = ({ match }) => (
  <div>
    <h2>Edit Category</h2>
    <h3>{match.params.id}</h3>
  </div>
)

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      user: null,
      categories: [],
      items: [],
      message: {
        isOpen: false,
        content: '',
      },
      nav: {
        isOpen: false,
      },
      fab: {
        isOpen: false,
        anchor: null,
      }
    }
  }

  sub = (subject, subscriber) => {
    if(!this._subs)
      this._subs = {}

    var subs = this._subs[subject] || []
    subs.push(subscriber)
    this._subs[subject] = subs
  }

  pub = (subject, data) => {
    if(!this._subs)
      return

    var subs = this._subs[subject] || []
    for(let sub of subs) {
      sub(data)
    }
  }

  fetch = () => {
    var cats = api.get('categories')
    .then(([data, resp]) => {
      this.setState({categories: data})
    })
    .catch(err => {
      this.props.pub('message', {isOpen:true, content: 'Couldn\'t load categories.'})
    })
  }

  componentDidMount = () => {
    this.sub('nav', data => {
      this.setState({nav: data})
    })
    this.sub('user', data => {
      this.setState({user: data})
    })
    this.sub('categories', data => {
      this.setState({categories: data})
    })
    this.sub('items', data => {
      this.setState({items: data})
    })
    this.sub('message', data => {
      this.setState({message: Object.assign(data, {isOpen: true})})
    })

    this.fetch()
  }

  componentWillReceiveProps(nextProps) {
    print('app...............................................props')
    this.fetch()
  }

  render() {
    var user = this.state.user
    var fab = !user ? null : (
      <FloatingActionButton
        onTouchTap={ev => this.setState({fab: {
          isOpen: !this.state.fab.isOpen,
          anchor: ev.currentTarget.parentElement.parentElement
        }})}
      >
        <ContentAdd />
        <Theme theme={lightTheme}>
          <Popover
            open={this.state.fab.isOpen}
            anchorEl={this.state.fab.anchor}
            anchorOrigin={{horizontal: 'middle', vertical: 'top'}}
            targetOrigin={{horizontal: 'middle', vertical: 'bottom'}}
            onRequestClose={ev => this.setState({fab: {isOpen: !this.state.fab.isOpen, anchor: null}})}
            style={{overflowY: 'visible'}}
          >
            <Menu autoWidth={false}>
              <Link to={'/edit/item/'}>
                <MenuItem>
                  <span title='Add Item'>
                    <ContentAddBox />
                  </span>
                </MenuItem>
              </Link>
              <Link to={'/edit/category/'}>
                <MenuItem>
                  <span title='Add Category'>
                    <AvLibraryAdd />
                  </span>
                </MenuItem>
              </Link>
            </Menu>
          </Popover>
        </Theme>
      </FloatingActionButton>
    )

    return (
      <div style={{...layoutStack, ...{marginBottom: '120px'}}}>
        <Theme theme={lightTheme}>
          <div style={layoutStack}>
            <AppHeader
              pub={this.pub}
              sub={this.sub}
              authProviders={authProviders}
              user={this.state.user} />
            <AppNav
              pub={this.pub}
              sub={this.sub}
              user={this.state.user}
              nav={this.state.nav}
              categories={this.state.categories}
              items={this.state.items} />
          </div>
        </Theme>
        <Theme theme={lightTheme}>
          <div style={layoutStack}>
            <Switch>
              <Route path="/" exact
                render={({match:{params}, location, history}) => (
                  <Items {...{...params, mode: 'view', type: 'item', id: null, location, history,
                    categories: this.state.categories, pub: this.pub, user: this.state.user}} />
                )}/>
              <Route path='/:mode(view)/all' exact
                render={({match:{params}, location, history}) => (
                  <Items {...{...params, type: 'item', id: null, location, history,
                    categories: this.state.categories, pub: this.pub, user: this.state.user}} />
                )}/>
              <Route path='/:mode(edit)/:type/' exact
                render={({match:{params}, location, history}) => (
                  <Items {...{...params, id: null, location, history,
                    categories: this.state.categories, pub: this.pub, user: this.state.user}} />
                )}/>
              <Route path='/:mode(edit|view)/:type/:id' exact
                render={({match:{params}, location, history}) => (
                  <Items {...{...params, location, history,
                    categories: this.state.categories, pub: this.pub, user: this.state.user}} />
                )}/>
              <Route render={() => <h2 style={{textAlign: 'center'}}>Not found</h2>}/>
            </Switch>
          </div>
        </Theme>
        <Theme theme={darkTheme}>
          <div
            style={{position: 'fixed', bottom: '80px', right: '80px', paddingTop: '1em'}}
          >
            {fab}
          </div>
        </Theme>
        <Theme theme={darkTheme}>
          <Snackbar
            open={this.state.message.isOpen}
            message={this.state.message.content}
            action={this.state.message.action}
            autoHideDuration={this.state.message.duration || 2000}
            onRequestClose={reason => {
              if(reason == 'timeout')
                this.setState({message: {isOpen: false, content: ''}})
            }}
          />
        </Theme>
      </div>
    )
  }
}

export default App
