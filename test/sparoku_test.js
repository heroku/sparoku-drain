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
})
