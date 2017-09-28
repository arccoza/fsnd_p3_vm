import React from 'react'
import {lightTheme, darkTheme, Theme} from './react-themes'
import {AppBar, FlatButton, RaisedButton, Dialog, IconButton,
  FontIcon, CircularProgress, Avatar} from './widgets'
import {NavigationClose} from './icons'
import Auth from './auth'


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

export default class AppHeader extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      // isAuthed: false,
      isDialogOpen: false,
      isBusy: false,
      provider: null,
    }
  }

  _signin = (provider) => {
    var authProviders = this.props.authProviders

    this.setState({isBusy: true, provider: authProviders[provider]})

    authProviders[provider]
      .signin()
      .then(resp => {
        this._closeDialog()
        this.setState({isBusy: false})
        this.props.pub('message', {content: 'Welcome...', action: null})
        this.props.pub('user', resp.user)
      })
      .catch(err => {
        this._closeDialog()
        this.setState({isBusy: false})
        this.props.pub('message', {content: 'Signin failed.', action: null})
        this.props.pub('user', null)
      })
  }

   _signout = (provider) => {
    this.state.provider
      .signout()
      .then(resp => {
        this.props.pub('message', {content: 'Goodbye...', action: null})
        this.props.pub('user', null)
      })
      .catch(err => {
        this.props.pub('message', {content: 'Signout failed.', action: null})
      })
   }

  _openDialog = () => {
    this.setState({isDialogOpen: true})
  }

  _closeDialog = () => {
    this.setState({isDialogOpen: false})
  }

  render() {
    if(!this.state.isBusy) {
      var dialogContent = (
        <div style={{...hlayout, ...{justifyContent: 'space-around'}}}>
          <RaisedButton
            name='facebook'
            onTouchTap={ev => this._signin('facebook')}
            label='Facebook'
            labelPosition='after'
            primary={true}
            icon={<FontIcon className='socicon-facebook' />}
            buttonStyle={{backgroundColor: '#3e5b98'}}
          />
          <RaisedButton
            name='google'
            onTouchTap={ev => this._signin('google')}
            label='Google'
            labelPosition='after'
            primary={true}
            icon={<FontIcon className='socicon-google' />}
            buttonStyle={{backgroundColor: '#dd4b39'}}
          />
        </div>
      )
    }
    else {
      var dialogContent = (
        <div style={{...hlayout, ...{justifyContent: 'space-around'}}}>
          <CircularProgress />
        </div>
      )
    }

    if(!this.props.user) {
      var appBar = (
        <div style={layoutStack}>
          <AppBar style={{
              backgroundColor: 'transparent',
              borderBottom: '1px solid white',
              borderBottomColor: lightTheme.palette.borderColor,
            }}
            title="Catalog"
            iconElementRight={<FlatButton label='Signin' onTouchTap={this._openDialog}/>}
            onLeftIconButtonTouchTap={ev => this.props.pub('nav', {isOpen: true})}
          />
          <Dialog
            title='Signin with...'
            actions={[
                <FlatButton label='Cancel' onTouchTap={this._closeDialog} />
              ]}
            modal={false}
            open={this.state.isDialogOpen}
            onRequestClose={this._closeDialog}
          >
            {dialogContent}
          </Dialog>
        </div>
      )
    }
    else {
      var appBar = (
        <div style={layoutStack}>
          <AppBar style={{
              backgroundColor: 'transparent',
              borderBottom: '1px solid white',
              borderBottomColor: lightTheme.palette.borderColor,
            }}
            title="Catalog"
            onLeftIconButtonTouchTap={ev => this.props.pub('nav', {isOpen: true})}
            iconElementRight={
              <FlatButton label={this.props.user.name} onTouchTap={this._signout} style={hlayout}>
                <Theme theme={darkTheme}>
                  <NavigationClose style={{verticalAlign: 'middle'}} />
                </Theme>
                <Avatar src={this.props.user.picture} size={28} style={{verticalAlign: 'middle'}} />
              </FlatButton>
            }
          />
        </div>
      )
    }

    return appBar
  }
}
