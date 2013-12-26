var Router = require('../').Router,
    assert = require('assert'),
    router

assert.doesNotThrow(function () {
  router = new Router()
})

var dieFunction = function () {
  assert.ok(false)
}

var testTimeout = setTimeout(dieFunction, 200),
    nameTestTimeout = setTimeout(dieFunction, 200),
    bindTestTimeout = setTimeout(dieFunction, 200),
    starTestTimeout = setTimeout(dieFunction, 200)

router.listen('get', '/test')
router.listen('get', '/paramtest/{{ x }}', function (req, res, params) {
  assert.equal(params.x, 'wee')
})
router.listen('patch', '/multiparams/{{ x }}/{{ y }}', function (req, res, p) {
  assert.equal(p.x, 'wee')
  assert.equal(p.y, 'woo')
})
router.listen('doesntmatter', /\/horse\/(.*)\//, function (r, res, p) {
  assert.equal(p.$1, 'play')
  assert.equal(p._captured[0], 'play')
  assert.equal(p._captured.length, 1)
})
router.listen('post', '/splattest/*', function (req, res, params) {
  assert.equal(params._splat[0], 'wee')
  assert.equal(params._1, 'wee')
  assert.equal(params._splat.length, 1)
})
router.listen('post', '/nametest', 'testname')
router.listen('put', '/bindtest', function () {
  clearTimeout(bindTestTimeout)
})
router.listen('*', '*', function (req, res) {
  clearTimeout(starTestTimeout)
})

router.on('get:/test', function (req, res) {
  clearTimeout(testTimeout)
  assert.equal(req.method, 'get')
  assert.equal(req.url, '/test')
})

router.on('testname', function () {
  clearTimeout(nameTestTimeout)
})

router.route({ method: 'get', url: '/test' }, null)
router.route({ method: 'post', url: '/nametest' }, null)
router.route({ method: 'put', url: '/bindtest' }, null)
router.route({ method: 'delete', url: '/startest' }, null)
router.route({ method: 'POST', url: '/splattest/wee' }, null)
router.route({ method: 'get', url: '/paramtest/wee' }, null)
router.route({ method: 'patch', url: '/multiparams/wee/woo' }, null)
router.route({ method: 'doesntmatter', url: '/horse/play/' }, null)
