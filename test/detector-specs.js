var chai = require('chai');
var should = chai.should();
var md = require('t-motion-detector')

before(function(done) {
  done();
});

after(function(done) {
  // here you can clear fixtures, etc.
  done();
});

describe("A really very very basic test to assert that a t-motion-detector exists and its event count is 0.", function() {
  it('Initial state of motion detector count should be 0.', function () {
    
    md.count.should.equal(0);
  });
});