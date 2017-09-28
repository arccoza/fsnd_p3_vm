var print = console.log.bind(console)

// Base64 encoder that can handle unicode characters.
// REF: https://developer.mozilla.org/en/docs/Web/API/WindowBase64/Base64_encoding_and_decoding
function b64EncodeUnicode(str) {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
    function toSolidBytes(match, p1) {
      return String.fromCharCode('0x' + p1);
    }))
}

// Loads scripts from the server.
function loadScript(url) {
  var id = b64EncodeUnicode(url)
  var script = document.getElementById(id)
  if(script)
    return Promise.resolve(script)
  script = document.createElement('script')
  script.setAttribute('defer', '')
  script.setAttribute('async', '')
  var head = document.getElementsByTagName('head')[0]
  var p = new Promise(function(res, rej) {
    script.id = id
    script.onload = function(ev) {
      res(script)
    }
    script.onerror = function(ev) {
      rej(script)
    }
    script.src = url
    head.append(script)
  })
  return p
}

// Tokens used in the layout fn.
const ja = {
  '<': 'flex-start',
  '>': 'flex-end',
  '+': 'center',
  '~': 'stretch',
  '_': 'baseline',
  'a': 'space-around',
  'b': 'space-between',
  'e': 'space-evenly',
}

// A funtion providing a shorthand way to build FlexBox CSS layouts.
function layout({dr='v', jc='b', ac='+', ai='~', fx=null, mg=null, pd=null}) {
  var style = {
    display: 'flex',
    flexFlow: dr.indexOf('v') != -1 ? 'column' : 'row' +
      dr.indexOf('-') != -1 ? '-reverse ' : ' ' +
      dr.indexOf('.') != -1 ? 'nowrap' : 'wrap',
    justifyContent: ja[jc],
    alignContent: ja[ac],
    alignItems: ja[ai],
  }

  if (fx)
    style.flex = fx
  if (mg)
    style.margin = mg
  if (pd)
    style.padding = pd

  return style
}

// This fn is a mixin that is added to React Components to provide
// an easy state modifier.
function modify(fnOrVal, ...path) {
  var s = this.state

  for (var i = 0, k; k = path[i], i < path.length - 1; i++) {
    s = s[k]
  }

  // If the last obj in the path is an Array and the last key is < 0,
  // assume it means you want the reverse index, where -1 == length.
  if (Array.isArray(s) && k < 0)
    k = s.length + k + 1

  if (fnOrVal === undefined)
    return s[k]
  else if (typeof fnOrVal === 'function')
    return fnOrVal(s, k)
  else if (fnOrVal === null) {
    if (Array.isArray(s))
      s.splice(k, k + 1)
    else
      delete s[k]
    this.setState(this.state)
    return s
  }
  else {
    s[k] = fnOrVal
    this.setState(this.state)
    return s[k]
  }
}

// Extends Promise with a finally method.
Promise.prototype.finally = function(cb) {
  return this.then(cb, cb)
}

export {b64EncodeUnicode, loadScript, layout, modify, Promise}
