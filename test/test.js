var Router = require('../index.js').Router,
    assert = require('assert'),
    router

assert.doesNotThrow(function () {
  router = new Router()
})

var dieFunction = function () {
  assert.ok(false)
}

var testTimeout = setTimeout(dieFunction, 1000)
var nameTestTimeout = setTimeout(dieFunction, 1000)
var bindTestTimeout = setTimeout(dieFunction, 1000)
var starTestTimeout = setTimeout(dieFunction, 1000)

router.listen('get', '/test')
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
