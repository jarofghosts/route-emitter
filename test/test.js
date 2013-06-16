var Router = require('../index.js').Router,
  assert = require('assert'),
  router;

assert.doesNotThrow(function () {
  router = new Router();
});

var testTimeout = setTimeout(function () {
  assert.ok(false);
}, 1000);
var nameTestTimeout = setTimeout(function () {
  assert.ok(false);
}, 1000);
var bindTestTimeout = setTimeout(function () {
  assert.ok(false);
}, 1000);

router.listen('get', '/test');
router.listen('post', '/nametest', 'testname');
router.listen('put', '/bindtest', function (req, res) {
  clearTimeout(bindTestTimeout);
});


router.on('get:/test', function (req, res) {
  clearTimeout(testTimeout);
  assert.equal(req.method, 'get');
  assert.equal(req.url, '/test');
});

router.on('testname', function () {
  clearTimeout(nameTestTimeout);
});

router.route({ method: 'get', url: '/test' }, null);
router.route({ method: 'post', url: '/nametest' }, null);
router.route({ method: 'put', url: '/bindtest' }, null);
