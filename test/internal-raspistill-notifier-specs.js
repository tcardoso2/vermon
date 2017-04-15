  /*****************************************************
 * Internal tests for raspistill - Photo capture using
 * https://www.npmjs.com/package/node-raspistill
 * What are internal tests?
 * As this is a npm package, it should be tested from
 * a package context, so I'll use "interal" preffix
 * for tests which are NOT using the npm tarball pack
 * For all others, the test should obviously include
 * something like:
 * var md = require('t-motion-detector');
 * Notes: Tests on promises are not working currently,
 *     commented. 
 *****************************************************/

var chai = require('chai');
var chaiAsPromised = require("chai-as-promised");
var should = chai.should();
var fs = require('fs');
var ent = require('../Entities.js');
var ext = require('../Extensions.js');
var main = require('../main.js');
var events = require('events');
const Raspistill = require('node-raspistill').Raspistill;

//Chai will use promises for async events
chai.use(chaiAsPromised);

before(function(done) {
  done();
});

after(function(done) {
  // here you can clear fixtures, etc.
  if (fs.existsSync('./_local.js')) {
    fs.rename('./_local.js', './local.js', function (err) {
      //Nothing I can do here
      if (err) throw err;
    });
  }
  main = require('../main.js');
  done();
});

describe("When a new Raspistill Notifier is created, ", function() {
  it('its internalObj property should be a node-raspistill object', function() {
    
    var n = new ext.RaspistillNotifier();
    n.hasInternalObj().should.not.equal(undefined);
    (n.internalObj instanceof Raspistill).should.equal(true);
  });

  it('should allow a parameterless constructor', function() {

    try{
      var n = new ext.RaspistillNotifier();
    } catch(e){
      should.fail();
    }
  });

  it('should detect the raspistill options properties', function() {
    //Assumes there is some local file with the key
    var options = new main.Config().raspistillOptions();
    var n = new ext.RaspistillNotifier("My Slack Notifier", options);
    n.options.should.equal(options);
  });

  it('should check if a local file exists', function () {
    var local_config = new main.Config();
    local_config.should.not.equal(undefined);
  });

  it('should detect the raspistill config properties from the local config file (default profile)', function() {
    //Assumes there is some local file with the key
    var options = new main.Config().raspistillOptions();
    var n = new ext.RaspistillNotifier("My Raspistill notifier", options);
    var local_config = new main.Config().profile();
    n.options.should.equal(local_config.raspistill.options);
  });

  it('should detect the raspistill config properties from the default profile equal the fallback', function () {
    //Assumes there is some local file with the key
    var key = new main.Config().raspistillOptions();
    var key_default = new main.Config().raspistillOptions("default");
    key.should.equal(key_default);
  });

});
/*
describe("When a new Environment with a Raspistill Notifier is created, ", function() {
  it('should save a picture', function(done) {
    this.timeout(6000);
    let env = new ent.Environment();
    let detector = new ent.MotionDetector();
    detector.name = "Mock_detector";
    let notifier = new ext.RaspistillNotifier("My Raspistill Notifier", { fileName: "mock" });

    notifier.on("pushedNotification", function(name, text, source){
      console.log(`Got a notification from ${name}: ${text}`);
      try{
        if (fs.existsSync('./photos/mock.jpg')){
          console.log('Detected picture!');
          chai.assert.isOk("ok");
          //clean up
          fs.unlinkSync('./photos/mock.png');
        } else {
          console.log('Picture was not detected...');
          chai.assert.fail();
        }
      } catch (e) {
        console.log('Ops, some error happened: ', e); 
      } finally {
        done();
      }
    });

    main.Start({
      environment: env,
      initialMotionDetector: detector,
    }, true);
    main.AddNotifier(notifier, `Received notification from: ${detector.name}`);
    env.addChange(1);
  });

  it('the pushedNotification event should receive the source detector as parameter, file name', function (done) {
    //Prepare
    this.timeout(6000);
    var n0 = new ext.RaspistillNotifier();
    var e0 = new ent.Environment();
    var m0 = new ent.MotionDetector();
    var detected = false;
    n0.on('pushedNotification', function(notifierName, text, source){
      if ((text != "Started") && !detected)
      {
        detected = true;
        notifierName.should.equal("Default Base Notifier");
        text.should.equal("Notification received from: unnamed detector.");
        source.detector.name.should.equal("unnamed detector.");
        done();
      }
    });

    var result = false;
    main.Start({
      environment: e0,
      initialNotifier: n0,
      initialMotionDetector: m0
    });

    e0.addChange(10);
  });
});
*/
describe("When importing local configuration, ", function() {
  //Note: this test fails but the code behaves properly. The issue is that once the node program starts,
  //      it seems to take a memory snapshot of all the files and does not recognize local has changed;
  it('If no local.js file is present, then fallsback to config.js', function(done) {
    if (fs.existsSync('./local.js')){
      fs.rename('./local.js', './_local.js', function (err) {
        if (err) throw err;
        fs.stat('./_local.js', function (err, stats) {
          if (err) throw err;
          console.log('stats: ' + JSON.stringify(stats));
          var local_options = new main.Config().raspistillOptions();
          JSON.stringify(local_options).should.equal("{}");
          done();
        });
      });
    } else {
      done();
    }
  });
  it('A function should be used instead of require("../local.js")', function() {
    var local_config = new main.Config().slackHook();
    local_config.should.not.equal(undefined);
  });
});
