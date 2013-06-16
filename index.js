var util = require('util'),
  EventEmitter = require('events').EventEmitter;

function Router() {
  
  this.routes = {};

  this.listen = function (method, path, name, callback) {
  };

  this.route = function (req, res) {
    var method = req.method.toLowerCase();
    
  };
}

util.inherits(Router, EventEmitter);

exports.Router = Router;

