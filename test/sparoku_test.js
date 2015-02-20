var assert = require('chai').assert
var sparoku = require('../lib/sparoku.js');

describe('Sparoku', function() {
  describe('getState', function() {
    it('assumes down when state is not set', function() {
      assert.equal(sparoku.states.down, sparoku.getState(null))
    });

    it('handles dynos idle', function() {
      assert.equal(sparoku.states.idle, sparoku.getState('idle'))
    });

    it('handles dynos starting', function() {
      assert.equal(sparoku.states.booting, sparoku.getState('starting'))
    });

    it('handles crashed dynos', function() {
      assert.equal(sparoku.states.crashed, sparoku.getState('crashed'))
    });

    it('handles dynos that are just up', function() {
      assert.equal(sparoku.states.up, sparoku.getState('up'))
    });

    it('flags dynos rendering a lot of 500s', function() {
      var stats = { success: 1, error: 2 }
      assert.equal(sparoku.states.error, sparoku.getState('up', stats))
    });

    it('flags dynos serving requests', function() {
      var stats = { success: 2, error: 1 }
      assert.equal(sparoku.states.serving, sparoku.getState('up', stats))
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
