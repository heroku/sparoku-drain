var assert = require('chai').assert
var sparoku = require('../lib/sparoku.js');

describe('Sparoku', function() {
  describe('getColor', function() {
    it('is OFF when dyno does not exist', function() {
      assert.equal(0, sparoku.getColor(42, {}))
    });
  });
})
