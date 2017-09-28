import { loadScript } from './utils.js'
var print = console.log.bind(console)


export default class Auth {
  constructor({provider, scriptSrc, cred}) {
    if(!(provider && scriptSrc && cred))
      throw 'Must have a provider, scriptSrc, and cred arg'

    this.provider = provider
    this.scriptSrc = scriptSrc
    this.cred = cred

    if(provider == 'google') {
      this.signin = this.googleSignin
      // this.signout = this.googleSignout
    }
    else if(provider == 'facebook') {
      this.signin = this.facebookSignin
      // this.signout = this.facebookSignout
    }
    else {
      throw 'Unknown provider ' + provider
    }
  }

  signout() {
    return fetch('/api/auth/', {
      method: 'get',
      credentials: 'include',
      headers: {
        'X-Requested-With': 'Fetch',
        'Authorization': 'None'
      }
    })
    .then(resp => Promise.all([resp, resp.json()]))
    .then(([resp, json]) => {
      if(!resp.ok)
        throw json
      return json
    })
  }

  get googleUser() {
    if(this.ga)
      return this.ga.currentUser.get()
    else
      return null
  }

  get googleIsIn() {
    if(this.ga)
      return this.ga.isSignedIn.get()
    else
      null
  }

  get googleIsOut() {
    return !this.isIn
  }

  googleSignin() {
    var self = this
    return loadScript(self.scriptSrc)
    .then(s => {
      return new Promise(function(res, rej) {
        gapi.load('auth2', function() {res()})
      })
    })
    .then(() => {
      return gapi.auth2.init(self.cred).then()
    })
    .then(() => {
      self.ga = gapi.auth2.getAuthInstance()
      return self.ga.grantOfflineAccess()
    })
    .then(resp => {
      return fetch('/api/auth/', {
        method: 'get',
        credentials: 'include',
        headers: {
          'X-Requested-With': 'Fetch',
          'Authorization': 'Google ' + resp.code
        }
      })
    })
    // .then(resp => {
    //   if(response.ok) {
    //     return resp
    //   }
    //   throw new Error('Network error.', resp.status)
    // })
    .then(resp => Promise.all([resp, resp.json()]))
    .then(([resp, json]) => {
      if(!resp.ok)
        throw json
      return json
    })
    // .then(resp => {
    //   print(resp)
    //   return resp
    // })
    // .catch(err => {
    //   print(err)
    //   alert('Could not authenticate with Google.')
    // })
  }

  googleSignout() {
    if(gapi && gapi.auth2) {
      return gapi.auth2.getAuthInstance().signOut();
    }
    else
      return Promise.reject()
  }

  googleIsAuthorized() {
    if(this.user)
      return this.user.hasGrantedScopes(this.cred.scope)
    else
      return null
  }

  get facebookUser() {

  }

  facebookSignin() {
    var self = this
    return loadScript(self.scriptSrc)
    .then(function(s) {
      return FB.init(self.cred)
    })
    .then(function() {
      return new Promise((res, rej) => {
        FB.login(resp => {
          if(resp.status == 'connected' && resp.authResponse)
            res(resp)
          else
            rej(resp)
        }, {scope: self.cred.scope, return_scopes: true})
      })
    })
    .then(function(resp) {
      return fetch('/api/auth/', {
        method: 'get',
        credentials: 'include',
        headers: {
          'X-Requested-With': 'Fetch',
          'Authorization': 'Facebook ' + resp.authResponse.accessToken
        }
      })
    })
    // .then(resp => {
    //   if(response.ok) {
    //     return resp
    //   }
    //   throw new Error('Network error.', resp.status)
    // })
    .then(resp => Promise.all([resp, resp.json()]))
    .then(([resp, json]) => {
      if(!resp.ok)
        throw json
      return json
    })
    // .then(resp => {
    //   print(resp)
    //   return resp
    // })
    // .catch(function(err) {
    //   print(err)
    //   alert('Could not authenticate with Facebook.')
    // })
  }

  facebookSignout() {
    if(FB) {
      return new Promise((res, rej) => {
        FB.logout((resp) => {
          print(resp)
          res(resp)
        });
      })
    }
    else
      return Promise.reject()
  }

}
