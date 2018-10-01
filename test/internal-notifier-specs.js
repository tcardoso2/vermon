  /*****************************************************
 * Internal tests
 * What are internal tests?
 * As this is a npm package, it should be tested from
 * a package context, so I'll use "interal" preffix
 * for tests which are NOT using the npm tarball pack
 * For all others, the test should obviously include
 * something like:
 * let md = require('vermon');
 *****************************************************/

let chai = require('chai');
let chaiAsPromised = require("chai-as-promised");
let should = chai.should();
let fs = require('fs');
let ent = require('../Entities.js');
let ext = require('../Extensions.js');
let main = require('../main.js');
let events = require('events');

//Chai will use promises for async events
chai.use(chaiAsPromised);

before(function(done) {
  done();
});

after(function(done) {
  // here you can clear fixtures, etc.
  main = require('../main.js');
  main.Reset();
  ent = require('../Entities.js');
  done();
});

describe("When a notifier is added, ", function() {
  it('should not be added if object is not of type Notifier', function () {
    //Prepare
    let n = main.GetNotifiers().length;
    let result = main.AddNotifier(3);
    main.GetNotifiers().length.should.equal(n);
    result.should.equal(false);
  });

  it('should be added if object is of type Notifier', function () {
    //Prepare
    let n = main.GetNotifiers().length;
    let result = main.AddNotifier(new ext.SlackNotifier("some name", "some_url"));
    main.GetNotifiers().length.should.equal(n + 1);
    result.should.equal(true);
  });
});

describe("When a new motion detector is created, ", function() {
  it('there should be a default environment associated', function () {
    //Prepare
    main.Reset();
    main.Start();
    main.GetEnvironment().should.not.equal(undefined);
  });

  it('the BaseNotifier has no internal objects (only meant to be used by descendant classes)', function () {
    //Prepare
    let n = new ent.BaseNotifier();
    n.hasInternalObj().should.equal(false);
  });

  it('all notifiers are binded with the motion Detectors', function (done) {
    //Prepare

    let n = new ent.BaseNotifier();
    let e = new ent.Environment();
    let m = new ent.MotionDetector();
    let detected = false;
    n.on('pushedNotification', function(message, text){
      //console.log("A new notification has arrived!", message, text);
      if ((text == "Started") && !detected)
      {
        detected = true;
        done();
      }
    });

    let result = false;
    main.Start({
      environment: e,
      initialNotifier: n,
      initialMotionDetector: m
    });

    e.addChange(10);
  });

  it('the pushedNotification event should receive the source detector as parameter, and notifier name and notification text', function (done) {
    //Prepare

    let n0 = new ent.BaseNotifier();
    let e0 = new ent.Environment();
    let m0 = new ent.MotionDetector();
    m0.name = "My motion detector";
    let detected = false;
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

    let result = false;
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

    let n1 = new ent.BaseNotifier();
    let e1 = new ent.Environment();
    let m1 = new ent.MotionDetector("First Notifier");
    let count = 0;
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
    let mLateMotionDetector = new ent.MotionDetector("Second Notifier");

    let result = false;
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
