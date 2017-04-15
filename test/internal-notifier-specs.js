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
var ext = require('../Extensions.js');
var main = require('../main.js');
var events = require('events');

//Chai will use promises for async events
chai.use(chaiAsPromised);

before(function(done) {
  done();
});

after(function(done) {
  // here you can clear fixtures, etc.
  main = require('../main.js');
  ent = require('../Entities.js');
  done();
});

describe("When a new motion detector is created, ", function() {
  it('there should be a default environment associated', function () {
    //Prepare
    main.Start();
    main.GetEnvironment().should.not.equal(undefined);
  });

  it('the BaseNotifier has no internal objects (only meant to be used by descendant classes)', function () {
    //Prepare
    var n = new ent.BaseNotifier();
    n.hasInternalObj().should.equal(false);
  });

  it('all notifiers are binded with the motion Detectors', function (done) {
    //Prepare

    var n = new ent.BaseNotifier();
    var e = new ent.Environment();
    var m = new ent.MotionDetector();
    var detected = false;
    n.on('pushedNotification', function(message, text){
      //console.log("A new notification has arrived!", message, text);
      if ((text == "Started") && !detected)
      {
        detected = true;
        done();
      }
    });

    var result = false;
    main.Start({
      environment: e,
      initialNotifier: n,
      initialMotionDetector: m
    });

    e.addChange(10);
  });

  it('the pushedNotification event should receive the source detector as parameter, and notifier name and notification text', function (done) {
    //Prepare

    var n0 = new ent.BaseNotifier();
    var e0 = new ent.Environment();
    var m0 = new ent.MotionDetector();
    m0.name = "My motion detector";
    var detected = false;
    n0.on('pushedNotification', function(notifierName, text, source){
      if ((text != "Started") && !detected)
      {
        detected = true;
        notifierName.should.equal("Default Base Notifier");
        text.should.equal("Received message from: My motion detector");
        source.detector.name.should.equal("My motion detector");
        done();
      }
    });

    var result = false;
    main.Start({
      environment: e0,
      initialMotionDetector: m0
    });
    main.AddNotifier(n0, `Received message from: ${m0.name}`);

    e0.addChange(10);
  });

  it('a Detector added later should bind with the existing notifiers, 2 notifications should exist.', function (done) {
    //Prepare
    this.timeout(4000);

    var n1 = new ent.BaseNotifier();
    var e1 = new ent.Environment();
    var m1 = new ent.MotionDetector("First Notifier");
    var count = 0;
    n1.on('pushedNotification', function(message, text){
      count += 1;
      //console.log(">>>>>>>>>>>> Count:", count, message, text);

      if (count == 3)
      {
        //console.log("Test concluded.");
        count.should.equal(3);
        done();
      }
    })
    var mLateMotionDetector = new ent.MotionDetector("Second Notifier");

    var result = false;
    //TODO: Imported again as it seems the tests are affecting each other
    main.Start({
      environment: e1,
      initialNotifier: n1,
      initialMotionDetector: m1
    });

    main.AddDetector(mLateMotionDetector);
    e1.addChange(10);
  });
});

//Create tests removing Detectors and notifiers.