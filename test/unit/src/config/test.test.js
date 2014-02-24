var path = require('path'),
  Promise = require('bluebird');

var testBase = require('../../../_base'),
  assert = testBase.assert,
  expect = testBase.expect,
  should = testBase.should,
  testUtils = testBase.utils,
  test = testUtils.createTest(module),
  waigo = testBase.waigo;


test['default config'] = function(done) {
  waigo.initAsync()
    .then(function check() {
      waigo.load('config/test').should.eql(require(__dirname + '/../../../../src/config/test'));
    })
    .nodeify(done);
};