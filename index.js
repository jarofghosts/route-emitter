var EE = require('events').EventEmitter
  , urlParse = require('url').parse

module.exports = createRouter

function Router(_routes, _paramRoutes) {
  if(!this instanceof Router) return new Router(_routes, _paramRoutes)

  EE.call(this)

  this.routes = _routes || {}
  this.paramRoutes = _paramRoutes || {}
}

Router.prototype = Object.create(EE.prototype)

Router.prototype.listen = Router$listen

function Router$listen(method, path, name, callback) {
  var temp = /\{\{\s+(\w)\s+\}\}/g
    , splat = /\*/g
      
  method = method.toLowerCase()
  if(!this.routes[method]) this.routes[method] = {}
  if(!this.paramRoutes[method]) this.paramRoutes[method] = {}
  
  if(typeof name !== 'string') {
    callback = name
    name = method + ':' + path
  }

  if(path instanceof RegExp) {
    this.paramRoutes[method][name] = {
        name:name
      , rex: path
    }
  } else if(path !== '*' && (temp.test(path) || splat.test(path))) {
    var names = []
      , splat_path
      , name_path

    path = path.replace(/[\-\[\]\/\(\)\+\?\.\\\^\$\|]/g, '\\$&')
    name_path = path.replace(splat, '.*').replace(temp, replace_and_push)
    splat_path = path.replace(temp, '.*').replace(splat, '(.*)')
    path = path.replace(splat, '.*').replace(temp, '.*')

    this.paramRoutes[method][name] = {
        name: name
      , rex: new RegExp('^' + path + '$')
      , splat_rex: new RegExp('^' + splat_path + '$')
      , name_rex: new RegExp('^' + name_path + '$')
      , names: names
    }
  } else {
    if(path !== '*' && !/^\//.test(path)) path = '/' + path

    this.routes[method][path] = {name: name}
  }
  
  if(callback) this.on(name, callback)

  function replace_and_push(str, piece) {
    names.push(piece)
    return '(.*)'
  }
}

Router.prototype.route = function Router$route(req, res) {
  var self = this

  var method = req.method.toLowerCase()
    , has_method = !!self.routes[method]
    , has_star = !!self.routes['*']
    , url = urlParse(req.url)
    , rexes
    , check

  if(has_method && self.routes[method][url.pathname] &&
      self.emit(self.routes[method][url.pathname].name, req, res)) return

  if(self.paramRoutes[method]) {
    rexes = Object.keys(self.paramRoutes[method])

    for (var i = 0, l = rexes.length; i < l; ++i) {
      check = self.paramRoutes[method][rexes[i]]
      if(check.rex.test(url.pathname)) {
        return parse_params(check)
      }
    }
  }

  if(has_star && self.routes['*'][url.pathname] &&
      self.emit(self.routes['*'][url.pathname].name, req, res)) return

  if(self.paramRoutes['*']) {
    rexes = Object.keys(self.paramRoutes['*'])

    for (var i = 0, l = rexes.length; i < l; ++i) {
      check = self.paramRoutes['*'][rexes[i]]
      if(check.rex.test(url.pathname)) {
        return parse_params(check)
      }
    }
  }
 
  if(has_method && self.routes[method]['*'] &&
      self.emit(self.routes[method]['*'].name, req, res)) return

  if(has_star && self.routes['*']['*'] &&
      self.emit(self.routes['*']['*'].name, req, res)) return

  if(self.emit(method + ':' + url.pathname, req, res)) return

  process.stdout.write('unrouted ' + method + ' ' + url.pathname)

  function parse_params(obj) {
    var matches
      , pass
      
    pass = {
        _captured: []
      , _splat: []
    }

    if(!obj.splat_rex && !obj.name_rex) {
      matches = url.pathname.match(obj.rex)

      if(matches.length === 1) {
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

function createRouter(routes, paramRoutes) {
  return new Router(routes, paramRoutes)
}
