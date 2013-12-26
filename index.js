var util = require('util'),
    urlParse = require('url').parse,
    EE = require('events').EventEmitter

function Router() {
  if (!this instanceof Router) return new Router()

  this.routes = {}
  this.param_routes = {}

  return this
}

util.inherits(Router, EE)

Router.prototype.listen = function RouterListen(method, path, name, callback) {
  var is_param = /\{\{.*\}\}/,
      is_splat = /\*/
      
  method = method.toLowerCase()
  if (!this.routes[method]) this.routes[method] = {}
  if (!this.param_routes[method]) this.param_routes[method] = {}
  
  if (typeof name !== 'string') {
    callback = name
    name = method + ':' + path
  }

  if (path instanceof RegExp) {
    this.param_routes[method][name] = {
      rex: path
    }
  } else if (path !== '*' && (is_param.test(path) || is_splat.test(path))) {
    var names = [],
        name_path,
        splat_path

    path = path.replace(/[\-\[\]\/\(\)\+\?\.\\\^\$\|]/g, '\\$&')

    name_path = path.replace(/\*/, '.*')
        .replace(/\{\{\s+(\w)\s+\}\}/g, function(piece) {
          names.push(piece)
          return '(.*)'
        })
    splat_path = path.replace(/\{\{\s+(\w)\s+\}\}/g, '.*')
        .replace(/\*/g, '(.*)')

    path = path.replace(/\*/g, '.*').replace(/\{\{\s+\w\s+\}\}/g, '.*')

    this.param_routes[method][name] = {
      name: name,
      rex: new RegExp('^' + path + '$'),
      splat_rex: new RegExp('^' + splat_path + '$'),
      name_rex: new RegExp('^' + name_path + '$'),
      names: names
    }
  } else {
    if (path !== '*' && !/^\//.test(path)) path = '/' + path

    this.routes[method][path] = {
      name: name
    }
  }
  
  if (callback) {
    this.on(name, callback)
  }
}

Router.prototype._process_params = function _params(req, res, obj, name) {
  var matches,
      pass = {
        _captured: [],
        _splat: []
      }

  if (!obj.splat_rex && !obj.name_rex) {
    matches = req.pathname.match(obj.rex)
    if (!matches.length) {
      return this.emit(obj.name, req, res, pass)
    }
    for (var i = 0, l = matches.length; i < l; ++i) {
      pass['$' + i] = matches[i]
      pass._captured.push(matches[i])
    }
    return this.emit(obj.name, req, res, pass)
  }
  matches = url.pathname.match(obj.name_rex)
  for (var i = 0, l = matches.length; i < l; ++i) {
    pass['$' + i] = matches[i]
    pass._captured.push(matches[i])
  }
  matches = url.pathname.match(obj.splat_rex)
  for (var i = 0, l = matches.length; i < l; ++i) {
    pass['_' + i] = matches[i]
    pass._splat.push(matches[i])
  }
  this.emit(obj.name, req, res, pass)
}

Router.prototype.route = function RouterRoute(req, res) {
  var method = req.method.toLowerCase(),
      url = urlParse(req.url),
      hasStar = !!this.routes['*'],
      hasMethod = !!this.routes[method],
      rexes

  if (hasMethod && this.routes[method][url.pathname] &&
      this.emit(this.routes[method][url.pathname].name, req, res)) return

  if (this.param_routes[method]) {
    rexes = Object.keys(this.param_routes[method])

    for (var i = 0, l = rexes.length; i < l; ++i) {
      var check = this.param_routes[method][rexes[i]]
      if (check.rex.test(url.pathname)) {
        return this._process_params(req, res, check, rexes[i])
      }
    }
  }
 
  if (hasMethod && this.routes[method]['*'] &&
      this.emit(this.routes[method]['*'].name, req, res)) return

  if (hasStar && this.routes['*']['*'] &&
      this.emit(this.routes['*']['*'].name, req, res)) return

  process.stdout.write('unrouted ' + method + ' ' + url.pathname)
}

function createRouter() {
  return new Router()
}

module.exports.Router = Router
module.exports.createRouter = createRouter
