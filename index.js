var util = require('util'),
    urlParse = require('url').parse,
    EventEmitter = require('events').EventEmitter;

function Router() {
  if (!this instanceof Router) return new Router();
  this.routes = {};
  return this;
}

util.inherits(Router, EventEmitter);

Router.prototype.listen = function (method, path, name, callback) {
    
  method = method.toLowerCase();
  
  if (typeof name != 'string') {
    callback = name;
    name = method + ':' + path;
  }

  if (!this.routes[method]) this.routes[method] = {};

  if (path != '*' && !/^\//.test(path) && !/^:/.test(path)) path = '/' + path;

  this.routes[method][path] = {
    name: name
  };
  
  if (callback != undefined) {
    this.on(name, callback);
  }

};

Router.prototype.route = function (req, res) {

  var method = req.method.toLowerCase(),
      url = urlParse(req.url),
      hasStar = !!this.routes['*'],
      hasMethod = !!this.routes[method];

  hasStar && this.routes['*'][':before'] && this.emit(this.routes['*'][':before'].name, req, res);
  hasMethod && this.routes[method][':before'] && this.emit(this.routes[method][':before'].name, req, res);

  if ((hasMethod && this.routes[method][url.pathname] && !this.emit(this.routes[method][url.pathname].name, req, res))
    || (!hasMethod || !this.routes[method][url.pathname])) {
      
    if ((hasMethod && this.routes[method]['*'] && !this.emit(this.routes[method]['*'].name, req, res))
      || (!hasMethod || !this.routes[method]['*'])) {
      
      if ((hasStar && this.routes['*']['*'] && !this.emit(this.routes['*']['*'].name, req, res))
        || (!hasStar || !this.routes['*']['*'])) {

        console.log('no direct route found');
      
      }

    }

  }

  hasMethod && this.routes[method][':after'] && this.emit(this.routes[method][':after'].name, req, res);
  hasStar && this.routes['*'][':after'] && this.emit(this.routes['*'][':after'].name, req, res);

};

function createRouter() {
  return new Router();
}

module.exports.Router = Router;
module.exports.createRouter = createRouter;

