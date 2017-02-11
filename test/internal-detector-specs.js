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
var chaiAsPromised = require("chai-as-promised");
var should = chai.should();
var fs = require('fs');
var ent = require('../Entities.js');

//Chai will use promises for async events
chai.use(chaiAsPromised);

before(function(done) {
  done();
});

after(function(done) {
  // here you can clear fixtures, etc.
  done();
});

describe("When there is a surroundings change relative to an object, ", function() {
  it('should detect motion if the surrounding environment changed or a position on an object changed', function () {
    //Prepare
    var env = new ent.Environment();
    var mDetector = new ent.MotionDetector();
    //Initially no movements were detected
    var movementCount = mDetector.count;
    var alternativeCount = 0;

    env.BindDetector(mDetector);
    mDetector.StartMonitoring();

    //Now we'll introduce some change, of a "generic" intensity of 2, it really doesn't matter for this test really.
    var intensity = 2;
    //Assert that the detector triggered a motion event
    mDetector.on('hasDetected', (function(oldState, newState, env){
      alternativeCount +=2;
      //console.log("Alternative count is", alternativeCount);
    }));
    env.AddChange(intensity);
    //console.log("Alternative count is", alternativeCount);
    
    mDetector.GetCount().should.equal(1);
    alternativeCount.should.equal(2);
  });


  it('should be active once it starts monitoring', function () {
    //Prepare
    var mDetector = new ent.MotionDetector();
    mDetector.StartMonitoring();

    mDetector.IsActive().should.equal(true);
  });

  
  it('should change the state of the enviromment if a Add Change method is ran with intensity > 0', function () {
    //Prepare
    var mEnvironment = new ent.Environment();
    mEnvironment.AddChange(1);

    mEnvironment.GetCurrentState().should.not.equal(0);
  });


  it('should trigger a changeState event if the state of the environment is changed', function () {
    //Prepare
    var mEnvironment = new ent.Environment();
    var result = false;

    mEnvironment.on('changedState', function(oldState, newState)
    {
      newState.should.equal(1);
      result = true;
    });

    mEnvironment.AddChange(1);
    result.should.equal(true);
  });
});

describe("When 2 new Motion Detectors are added to an Environment, ", function() {
  it('all should respond to a change on the environment', function () {
    //Prepare
    var env = new ent.Environment();
    var mD1 = new ent.MotionDetector();
    var mD2 = new ent.MotionDetector();
    var count = 0;
    env.BindDetector(mD1);
    mD1.StartMonitoring();
    env.BindDetector(mD2);
    mD2.StartMonitoring();

    //Assert that the detector triggered a motion event
    mD1.on('hasDetected', (function(oldState, newState, env){
      //console.log("MD1 detected movement ", newState);
      count++;
    }));
    mD2.on('hasDetected', (function(oldState, newState, env){
      //console.log("MD2 detected movement ", newState);
      count++;
    }));
    env.AddChange(1);
    count.should.equal(2);
  });

  it('and one is undbinded, only 1 should respond to a change on the environment', function () {
    //Prepare
    var env = new ent.Environment();
    var mD1 = new ent.MotionDetector();
    var mD2 = new ent.MotionDetector();
    var count = 0;
    env.BindDetector(mD1);
    mD1.StartMonitoring();
    env.BindDetector(mD2);
    mD2.StartMonitoring();
    env.UnbindDetector(mD1);

    //Assert that the detector triggered a motion event
    mD1.on('hasDetected', (function(oldState, newState, env){
      //console.log("MD1 detected movement ", newState);
      count++;
    }));
    mD2.on('hasDetected', (function(oldState, newState, env){
      //console.log("MD2 detected movement ", newState);
      count++;
    }));
    env.AddChange(1);
    count.should.equal(1);
  });
});