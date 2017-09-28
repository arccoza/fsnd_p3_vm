import {b64EncodeUnicode} from './utils.js'


function tmpl(str, args) {
  return str.replace(/\{\{(.*)\}\}/g, (m, i) => {
    return args[i]
  })
}

function prepJson(init, data) {
  var promises = []
  var blobs = []

  init.headers['Content-Type'] = 'application/json'

  if(data) {
    init.body = JSON.stringify(data, (k, v) => {
      if (v instanceof Blob) {
        blobs.push(v)
        return `{{${blobs.length - 1}}}`
      }
      return v
    })

    for (var blob of blobs) {
      var r = new FileReader()
      promises.push(
        new Promise((res, rej) => {
          r.onloadend = ev => {
            if (ev.target.error)
              rej(ev)
            else
              res(b64EncodeUnicode(ev.target.result))
          }
        })
      )
      r.readAsText(blob)
    }
  }

  if (promises.length) {
    return Promise.all(promises).then(b64blobs => init.body = tmpl(init.body, b64blobs))
  }
  else
    return Promise.resolve()
}

function prepForm(init, data) {
  var form = new FormData()

  for (var k in data) {
    if (data.hasOwnProperty(k)) {
      form.set(k, data[k])
    }
  }

  init.body = form

  return Promise.resolve(form)
}

function apiRequest(method, what, id, data, type='json') {
  var input = `/api/${what}/${Array.isArray(id) ? id.join(',') : id || ''}`
  var init = {
    method: method,
    credentials: 'include',
    headers: {
      'X-Requested-With': 'Fetch',
    },
  }
  var start

  if (type == 'json')
    start = prepJson(init, data)
  else
    start = prepForm(init, data)

  return start.then(resp => fetch(input, init))
  .then(resp => Promise.all([resp, resp.json()]))
  .then(([resp, json]) => {
    if(!resp.ok)
      throw [json, resp]
    return [json, resp]
  })
}

var api = {
  get: apiRequest.bind(null, 'get'),
  set: apiRequest.bind(null, 'put'),
  // mod: apiRequest.bind(null, 'patch'),
  add: apiRequest.bind(null, 'post'),
  rem: apiRequest.bind(null, 'delete'),
}

export default api
