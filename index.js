var util = require('util'),
  urlParse = require('url').parse,
  EventEmitter = require('events').EventEmitter;

function Router() {
  
  this.routes = {};

  this.listen = function (method, path, name, callback) {
    
    method = method.toLowerCase();
    
    if (typeof name != 'string') {
      callback = name;
      name = method + ':' + path;
    }

    if (this.routes[method] == undefined) {
      this.routes[method] = {};
    }

    path = (path == '*' || path.match(/^\//) || path.match(/^:/)) ? path : '/' + path;

    this.routes[method][path] = { 
      name: name
    };
    
    if (callback != undefined) {
      this.on(name, callback);
    }
  };

  this.route = function (req, res) {
    
    var method = req.method.toLowerCase(),
      url = urlParse(req.url),
      hasStar = !!this.routes['*'];
    hasStar && this.routes['*'][':before'] && this.emit(this.routes['*'][':before'].name, req, res);
    this.routes[method] && this.routes[method][':before'] && this.emit(this.routes[method][':before'].name, req, res);

    if ((this.routes[method] && this.routes[method][url.pathname] && !this.emit(this.routes[method][url.pathname].name, req, res))
      || (!this.routes[method] || !this.routes[method][url.pathname])) {
        
      if ((this.routes[method] && this.routes[method]['*'] && !this.emit(this.routes[method]['*'].name, req, res))
        || (!this.routes[method] || !this.routes[method]['*'])) {
        
        if ((hasStar && this.routes['*']['*'] && !this.emit(this.routes['*']['*'].name, req, res))
          || (!hasStar || !this.routes['*']['*'])) {

          console.log('no direct route found');
        
        }

      }

    }

    this.routes[method] && this.routes[method][':after'] && this.emit(this.routes[method][':after'].name, req, res);
    hasStar && this.routes['*'][':after'] && this.emit(this.routes['*'][':after'].name, req, res);

  };
}

util.inherits(Router, EventEmitter);

exports.Router = Router;

