var Router = require('../index.js').Router,
  assert = require('assert'),
  router;

assert.doesNotThrow(function () {
  router = new Router();
});

var dieFunction = function () {
  assert.ok(false);
};

var testTimeout = setTimeout(dieFunction, 1000);
var nameTestTimeout = setTimeout(dieFunction, 1000);
var bindTestTimeout = setTimeout(dieFunction, 1000);
var starTestTimeout = setTimeout(dieFunction, 1000);
var beforeTestTimeout = setTimeout(dieFunction, 1000);
var afterTestTimeout = setTimeout(dieFunction, 1000);
var beforeStarTestTimeout = setTimeout(dieFunction, 1000);
var afterStarTestTimeout = setTimeout(dieFunction, 1000);

router.listen('get', '/test');
router.listen('post', '/nametest', 'testname');
router.listen('put', '/bindtest', function () {
  clearTimeout(bindTestTimeout);
});
router.listen('*', ':before', function () {
  beforeStarTestTimeout && clearTimeout(beforeStarTestTimeout);
  beforeStarTestTimeout = false;
});
router.listen('*', ':after', function () {
  afterStarTestTimeout && clearTimeout(afterStarTestTimeout);
  afterStarTestTimeout = false;
});
router.listen('delete', ':before', function () {
  clearTimeout(beforeTestTimeout);
});
router.listen('delete', ':after', function () {
  clearTimeout(afterTestTimeout);
});
router.listen('*', '*', function (req, res) {
  clearTimeout(starTestTimeout);
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
router.route({ method: 'delete', url: '/startest' }, null);
