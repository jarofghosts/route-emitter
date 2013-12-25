var util = require('util'),
    urlParse = require('url').parse,
    EE = require('events').EventEmitter

function Router() {
  if (!this instanceof Router) return new Router()
  this.routes = {}

  return this
}

util.inherits(Router, EE)

Router.prototype.listen = function (_method, path, name, callback) {
  var method = _method.toLowerCase()
  
  if (typeof name !== 'string') {
    callback = name
    name = method + ':' + path
  }

  if (!this.routes[method]) this.routes[method] = {}
  if (path !== '*' && !/^\//.test(path) && !/^:/.test(path)) path = '/' + path

  this.routes[method][path] = {
    name: name
  }
  
  if (callback) {
    this.on(name, callback)
  }
}

Router.prototype.route = function (req, res) {

  var method = req.method.toLowerCase(),
      url = urlParse(req.url),
      hasStar = !!this.routes['*'],
      hasMethod = !!this.routes[method]

  if (hasMethod && this.routes[method][url.pathname] &&
      this.emit(this.routes[method][url.pathname].name, req, res)) return
      
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
