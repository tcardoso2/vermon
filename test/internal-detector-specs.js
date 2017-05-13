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

let chai = require('chai');
let chaiAsPromised = require("chai-as-promised");
let should = chai.should();
let fs = require('fs');
let ent = require('../Entities.js');
let ext = require('../Extensions.js');
let main = require('../main.js');

//Chai will use promises for async events
chai.use(chaiAsPromised);

before(function(done) {
  done();
});

after(function(done) {
  // here you can clear fixtures, etc.
  main.Reset();
  done();
});

describe("When a detector is added, ", function() {
  it('should not be added if object is not of type MotionDetector', function () {
    //Prepare
    let m = main.GetMotionDetectors().length;
    main.AddDetector(3);
    main.GetMotionDetectors().length.should.equal(m);
  });

  it('should be added if object is of type Detector', function () {
    //Prepare
    let m = main.GetMotionDetectors().length;
    main.AddDetector(new ext.PIRMotionDetector(12));
    main.GetMotionDetectors().length.should.equal(m + 1);
  });
});

describe("When there is a surroundings change relative to an object, ", function() {
  it('should detect motion if the surrounding environment changed or a position on an object changed', function () {
    //Prepare
    var env = new ent.Environment();
    var mDetector = new ent.MotionDetector();
    //Initially no movements were detected
    var movementCount = mDetector.count;
    var alternativeCount = 0;

    env.bindDetector(mDetector);
    mDetector.startMonitoring();

    //Now we'll introduce some change, of a "generic" intensity of 2, it really doesn't matter for this test really.
    var intensity = 2;
    //Assert that the detector triggered a motion event
    mDetector.on('hasDetected', (function(oldState, newState, env){
      alternativeCount +=2;
      //console.log("Alternative count is", alternativeCount);
    }));
    env.addChange(intensity);
    //console.log("Alternative count is", alternativeCount);
    
    mDetector.getCount().should.equal(1);
    alternativeCount.should.equal(2);
  });


  it('should be active once it starts monitoring', function () {
    //Prepare
    var mDetector = new ent.MotionDetector();
    mDetector.startMonitoring();

    mDetector.isActive().should.equal(true);
  });

  
  it('should change the state of the enviromment if a Add Change method is ran with intensity > 0', function () {
    //Prepare
    var mEnvironment = new ent.Environment();
    mEnvironment.addChange(1);

    mEnvironment.getCurrentState().should.not.equal(0);
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

    mEnvironment.addChange(1);
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
    env.bindDetector(mD1);
    mD1.startMonitoring();
    env.bindDetector(mD2);
    mD2.startMonitoring();

    //Assert that the detector triggered a motion event
    mD1.on('hasDetected', (function(oldState, newState, env){
      //console.log("MD1 detected movement ", newState);
      count++;
    }));
    mD2.on('hasDetected', (function(oldState, newState, env){
      //console.log("MD2 detected movement ", newState);
      count++;
    }));
    env.addChange(1);
    count.should.equal(2);
  });

  it('and one is undbinded, only 1 should respond to a change on the environment', function () {
    //Prepare
    var env = new ent.Environment();
    var mD1 = new ent.MotionDetector();
    var mD2 = new ent.MotionDetector();
    var count = 0;
    env.bindDetector(mD1);
    mD1.startMonitoring();
    env.bindDetector(mD2);
    mD2.startMonitoring();
    env.unbindDetector(mD1);

    //Assert that the detector triggered a motion event
    mD1.on('hasDetected', (function(oldState, newState, env){
      //console.log("MD1 detected movement ", newState);
      count++;
    }));
    mD2.on('hasDetected', (function(oldState, newState, env){
      //console.log("MD2 detected movement ", newState);
      count++;
    }));
    env.addChange(1);
    count.should.equal(1);
  });
});