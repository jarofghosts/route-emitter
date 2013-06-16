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

    path = path.match(/^\//) ? path : '/' + path;

    this.routes[method][path] = { 
      name: name,
      callback: callback
    };
    
    if (callback != undefined) {
      this.on(name, callback);
    }
  };

  this.route = function (req, res) {
    
    var method = req.method.toLowerCase(),
      url = urlParse(req.url);
    
    this.routes['before:*'] && executeRoutes(this.routes['before:*']);
    this.routes['before:' + method] && executeRoutes(this.routes['before:' + method]);

    if ( 

  };
}

util.inherits(Router, EventEmitter);

exports.Router = Router;

