route-emitter
===

[![Build Status](https://travis-ci.org/jarofghosts/route-emitter.png?branch=master)](https://travis-ci.org/jarofghosts/route-emitter)

Dead-simple routing for node.

## usage
```js
var http = require('http'),
    Router = require('route-emitter').Router,
    router = new Router()

router.listen('get', '/', function (req, res) {
  res.end('Hello, world')
})

// listen for any http verb!
router.listen('post', '/blog', function (req, res) {
  res.end('BLOG CREATED!')
})

// or you can catch 404s
router.listen('*', '*', function (req, res) {
  res.writeHead(404)
  res.end('PAGE NOT FOUND!')
})

// ...or verb-specific 404s
router.listen('put', '*', function (req, res) {
  res.writeHead(404)
  res.end('RESOURCE NOT FOUND!')
})

// create a listener with named emitter!
router.listen('delete', '/blog', 'deleteThatBlog')

// react to the emit!
router.on('deleteThatBlog', function (req, res) {
  res.end('BLOG DELETED')
})

// catch named parameters!
router.on('get', '/blog/{{ id }}', function (req, res, params) {
  res.end(params.id)
})

// catch splats!
router.on('delete', '/*', function (req, res, params) {
  res.end(params._splat[0]) // || res.end(params._1)
})

// or roll your own regexp!
router.on('patch', /my\/(.*)/, function (req, res, params) {
  res.end(params._captured[0]) // || res.end(params.$1)
})

http.createServer(router.route).listen(70707)
```

## other info

#### order of operations

* `(verb)/path` literal, if found
* `(verb)/path` params || splat || regexp if found
* `(verb)/*` if found
* `*/*`
* (logs unmatched route)

#### `params` values

* `params._splat` array of splat results
* `params._1` - `params._x` 1-x splat results
* `params._captured` array of captured results from custom RegExp
* `params.$1` - `$params.$x` 1-x captured results

## license

MIT
