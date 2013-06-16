route-emitter
===

dead-simple routing for node

## usage
````js
var http = require('http'),
  Router = require('route-emitter').Router,
  router = new Router();

router.listen('get', '/', function (req, res) {
  res.end('Hello, world');
});

// listen for any http verb!
router.listen('post', '/blog', function (req, res) {
  res.end('BLOG CREATED!');
});

// special paths ':before' and ':after' can be applied to any verb!
router.listen('put', ':before', function (req, res) {
  res.end('NO PUT ALLOWED.');
});

// they can also be applied with a wildcard!
router.listen('\*', ':after', function (req, res) {
  hitCounter++;
});

// or you can catch 404s
router.listen('\*', '\*', function (req, res) {
  res.writeHead(404);
  res.end('PAGE NOT FOUND!');
});

// ...or verb-specific 404s
router.listen('put', '\*', function (req, res) {
  res.writeHead(404);
  res.end('RESOURCE NOT FOUND!');
});

// create a listener with named emitter!
router.listen('delete', '/blog', 'deleteThatBlog');

// react to the emit!
router.on('deleteThatBlog', function (req, res) {
  res.end('BLOG DELETED');
});

http.createServer(function (req, res) {
  router.route(req, res);
});
````

## other info

Order of operations goes:
* \*:before
* (verb):before
* (verb)/path if found, otherwise (verb)\* if found, otherwise \*\*
* (verb):after
* \*:after

## license

BSD
