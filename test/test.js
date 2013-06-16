var Router = require('../index.js').Router,
  assert = require('assert'),
  router;

assert.doesNotThrow(function () {
  router = new Router();
});

router.listen('get', '/test');
router.listen('get', '/nametest', 'testname');

var testTimeout = setTimeout(function () {
  assert.ok(false);
}, 1000);
var nameTestTimeout = setTimeout(function () {
  assert.ok(false);
}, 1000);

router.on('get:/test', function (req, res) {
  clearTimeout(testTimeout);
  assert.equal(req.method, 'get');
  assert.equal(req.url, '/test');
});

router.on('testname', function () {
  clearTimeout(nameTestTimeout);
});

router.route({ method: 'get', url: '/test' }, null);
router.route({ method: 'get', url: '/nametest' }, null);
