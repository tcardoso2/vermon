/*****************************************************
 * Internal tests
 * What are internal tests?
 * As this is a npm package, it should be tested from
 * a package context, so I'll use "interal" preffix
 * for tests which are NOT using the npm tarball pack
 * For all others, the test should obviously include
 * something like:
 * var md = require('t-motion-detector');
 *****************************************************/

var chai = require('chai');
var should = chai.should();
var fs = require('fs');

before(function(done) {
  done();
});

after(function(done) {
  // here you can clear fixtures, etc.
  done();
});

describe("When there is a surroundings change relative to an object, then motion is detected.", function() {
  it('should detect motion if the rurrounding environment changed or a position on an object changed', function () {
    //Prepare
    var env = new Environment();
    var mDetector = new MotionDetector();
    //Initially no movements were detected
    var mmovementCount = mDetector.count;
    var alternativeCount = 0;

    env.Add(motionDetector);
    mDetector.StartMonitoring();

    var oldState = environment.getState();

    //Now we'll introduce some change, of a "generic" intensity of 2, it really doesn't matter for this test really.
    var intentity = 2;
    //Assert that the detector triggered a motion event
    mDetector.hasDetected(function(data){
      //Nothing to do but I want to enforce this on the design and I want to assert this matches the count of the object
      alternativeCount +=1;
    });
    env.addChange(intensity);
    
    mDetector.count.should.equal(alternativeCount);
  });
});