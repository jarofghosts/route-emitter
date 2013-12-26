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
  res.end(params._captured[0]) || res.end(params.$1)
})

http.createServer(function (req, res) {
  router.route(req, res)
})
```

## other info

Order of operations goes:

* `(verb)/path` literal, if found
* `(verb)/path` params || splat || regexp if found
* `(verb)/*` if found
* `*/*`
* (logs unmatched route)

## license

MIT
