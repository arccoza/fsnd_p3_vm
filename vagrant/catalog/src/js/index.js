import React from 'react'
import ReactDOM from 'react-dom'
import {
  BrowserRouter as Router,
  Route,
  Link,
  Redirect,
  withRouter
} from 'react-router-dom'
import injectTapEventPlugin from 'react-tap-event-plugin'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import RaisedButton from 'material-ui/RaisedButton';
import App from './react-app.js'
import Auth from './auth.js'
var print = console.log.bind(console)


injectTapEventPlugin();

window.addEventListener('load', ev => {

  ReactDOM.render(
    <Router>
      <App />
    </Router>,
    document.getElementById('root')
  )

})
