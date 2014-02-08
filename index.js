var util = require('util'),
    url_parse = require('url').parse,
    EE = require('events').EventEmitter

module.exports.Router = Router
module.exports.createRouter = createRouter

function Router(_routes, _param_routes) {
  if (!this instanceof Router) return new Router(_routes, _param_routes)

  this.routes = _routes || {}
  this.param_routes = _param_routes || {}

  return this
}

util.inherits(Router, EE)

Router.prototype.listen = Router$listen

function Router$listen(method, path, name, callback) {
  var temp = /\{\{\s+(\w)\s+\}\}/g,
      splat = /\*/g
      
  method = method.toLowerCase()
  if (!this.routes[method]) this.routes[method] = {}
  if (!this.param_routes[method]) this.param_routes[method] = {}
  
  if (typeof name !== 'string') {
    callback = name
    name = method + ':' + path
  }

  if (path instanceof RegExp) {
    this.param_routes[method][name] = {
      name:name,
      rex: path
    }
  } else if (path !== '*' && (temp.test(path) || splat.test(path))) {
    var names = [],
        name_path,
        splat_path

    path = path.replace(/[\-\[\]\/\(\)\+\?\.\\\^\$\|]/g, '\\$&')

    name_path = path.replace(splat, '.*')
        .replace(temp, function(str, piece) {
          names.push(piece)
          return '(.*)'
        })
    splat_path = path.replace(temp, '.*')
        .replace(splat, '(.*)')

    path = path.replace(splat, '.*').replace(temp, '.*')

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

Router.prototype.route = function Router$route(req, res) {
  var self = this

  var method = req.method.toLowerCase(),
      has_method = !!self.routes[method],
      has_star = !!self.routes['*'],
      url = url_parse(req.url),
      rexes,
      check

  if (has_method && self.routes[method][url.pathname] &&
      self.emit(self.routes[method][url.pathname].name, req, res)) return

  if (self.param_routes[method]) {
    rexes = Object.keys(self.param_routes[method])

    for (var i = 0, l = rexes.length; i < l; ++i) {
      check = self.param_routes[method][rexes[i]]
      if (check.rex.test(url.pathname)) {
        return parse_params(check)
      }
    }
  }

  if (has_star && self.routes['*'][url.pathname] &&
      self.emit(self.routes['*'][url.pathname].name, req, res)) return

  if (self.param_routes['*']) {
    rexes = Object.keys(self.param_routes['*'])

    for (var i = 0, l = rexes.length; i < l; ++i) {
      check = self.param_routes['*'][rexes[i]]
      if (check.rex.test(url.pathname)) {
        return parse_params(check)
      }
    }
  }
 
  if (has_method && self.routes[method]['*'] &&
      self.emit(self.routes[method]['*'].name, req, res)) return

  if (has_star && self.routes['*']['*'] &&
      self.emit(self.routes['*']['*'].name, req, res)) return

  if (self.emit(method + ':' + url.pathname, req, res)) return

  process.stdout.write('unrouted ' + method + ' ' + url.pathname)

  function parse_params(obj) {
    var matches,
        pass = {
          _captured: [],
          _splat: []
        }

    if (!obj.splat_rex && !obj.name_rex) {
      matches = url.pathname.match(obj.rex)
      if (matches.length === 1) {
        return self.emit(obj.name, req, res, pass)
      }
      for (i = 1, l = matches.length; i < l; ++i) {
        pass['$' + i] = matches[i]
        pass._captured.push(matches[i])
      }
      return self.emit(obj.name, req, res, pass)
    }
    matches = url.pathname.match(obj.name_rex)
    for (i = 1, l = matches.length; i < l; ++i) {
      pass[obj.names[i - 1]] = matches[i]
    }
    matches = url.pathname.match(obj.splat_rex)
    for (i = 1, l = matches.length; i < l; ++i) {
      pass['_' + i] = matches[i]
      pass._splat.push(matches[i])
    }
    self.emit(obj.name, req, res, pass)
  }
}

function createRouter() {
  return new Router()
}
