var assert = require('chai').assert
var sparoku = require('../lib/sparoku.js');

describe('Sparoku', function() {
  describe('getColor', function() {
    it('is off when state is not set', function() {
      assert.equal(sparoku.colors.off, sparoku.getColor(null, {}))
    });

    it('is blue when dyno is idle', function() {
      assert.equal(sparoku.colors.blue, sparoku.getColor('idle', {}))
    });

    it('is blue when dyno is starting', function() {
      assert.equal(sparoku.colors.blue, sparoku.getColor('starting', {}))
    });

    it('is red when dyno crashed', function() {
      assert.equal(sparoku.colors.red, sparoku.getColor('crashed', {}))
    });

    it('is red when dyno is serving 500s', function() {
      var stats = { success: 1, error: 2 }
      assert.equal(sparoku.colors.red, sparoku.getColor('up', stats))
    });

    it('is green when dyno is working normally', function() {
      var stats = { success: 2, error: 1 }
      assert.equal(sparoku.colors.green, sparoku.getColor('up', stats))
    });
  });

  describe('requestsSummary', function() {
    it('groups requests by dynos', function() {
      sparoku.requests.push({ dyno: 1, status: 200 })
      sparoku.requests.push({ dyno: 1, status: 304 })
      sparoku.requests.push({ dyno: 2, status: 500 })
      var status = sparoku.requestsSummary()
      assert.equal(2, status['1'].success)
      assert.equal(0, status['1'].error)
      assert.equal(0, status['2'].success)
      assert.equal(1, status['2'].error)
    });
  });

})
