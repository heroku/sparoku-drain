var assert = require('chai').assert
var sparoku = require('../lib/sparoku.js');

describe('Sparoku', function() {
  describe('getColor', function() {
    it('is off when dyno does not exist', function() {
      assert.equal(sparoku.colors.off, sparoku.getColor(42, {}))
    });

    it('is blue when dyno is idle', function() {
      sparoku.dynos = { 1: 'idle' }
      assert.equal(sparoku.colors.blue, sparoku.getColor(1, {}))
    });

    it('is blue when dyno is starting', function() {
      sparoku.dynos = { 1: 'starting' }
      assert.equal(sparoku.colors.blue, sparoku.getColor(1, {}))
    });

    it('is red when dyno crashed', function() {
      sparoku.dynos = { 1: 'crashed' }
      assert.equal(sparoku.colors.red, sparoku.getColor(1, {}))
    });

    it('is red when dyno is serving 500s', function() {
      sparoku.dynos = { 1: 'up' }
      assert.equal(sparoku.colors.red, sparoku.getColor(1, { success: 1, error: 2 }))
    });

    it('is green when dyno is working normally', function() {
      sparoku.dynos = { 1: 'up' }
      assert.equal(sparoku.colors.green, sparoku.getColor(1, { success: 2, error: 1 }))
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
