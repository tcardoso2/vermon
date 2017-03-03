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
  if (fs.existsSync('./_local.js')) {
    fs.rename('./_local.js', './local.js', function (err) {
      //Nothing I can do here
      if (err) throw err;
    });
  }
  done();
});

describe("When a new Slack Notifier is created, ", function() {
  it('should throw an Exeption if no hook is provided', function() {
    //Assumes there is some local file with the key
    try{
      var n = new ext.SlackNotifier();
    } catch(e){
      e.message.should.equal("'key' is a required argument, which should contain the Slack hook URL.");
    }
  });

  it('should detect the slack config key property', function() {
    //Assumes there is some local file with the key
    var key = new main.Config().slackHook();
    var n = new ext.SlackNotifier("My Slack Notifier", key);
    n.key.should.equal(key);
  });

  it('should check if a local file exists', function () {
    var local_config = new main.Config();
    local_config.should.not.equal(undefined);
  });

  it('should detect the slack config properties from the local config file (default profile)', function() {
    //Assumes there is some local file with the key
    var key = new main.Config().slackHook();
    var n = new ext.SlackNotifier("My slack notifier", key);
    var local_config = new main.Config().profile();
    n.key.should.equal(local_config.slack.hook);
  });

  it('should detect the slack config properties from the default profile equal the fallback', function () {
    //Assumes there is some local file with the key
    var key = new main.Config().slackHook();
    var key_default = new main.Config().slackHook("default");
    key.should.equal(key_default);
  });

  it('should raise an Error if no key is found for an inexisting profile', function () {
    try {
      var key = new main.Config().slackHook("some_inexisting_profile");
    } catch (e) {
      e.message.should.equal("'some_inexisting_profile' was not found in the local.js file.");
    }
  });

  it('should be able to send a message successfully', function (done) {
    var key = new main.Config().slackHook();
    var n = new ext.SlackNotifier("My Slack notifier", key);
    n.on('pushedNotification', function(message, text){
      console.log("A new notification was pushed!", message, text);
      chai.assert.isOk("Everything is ok");
      done();
    });
    //Force a notification
    n.notify("Hello!");
  });
});

describe("When a new Environment with a Slack Notifier is created, ", function() {
  it('should push a Slack notification', function(done) {
    //Assumes there is some local file with the key
    var env = new ent.Environment();
    var detector = new ent.MotionDetector();
    var key = new main.Config().slackHook();
    var notifier = new ext.SlackNotifier("My Slack Notifier", key);

    notifier.on("pushedNotification", function(name, text){
      chai.assert.isOk("notified");
      console.log(`Got a notification from ${name}: ${text}`);
      done();
    });
    detector.on("hasDetected", function(current, newState, d){
      chai.assert.isOk("detected");
      console.log(`Detector detected signal from ${current} to: ${newState}`);
    });

    main.Start({
      environment: env,
      initialMotionDetector: detector,
    }, true);
    main.AddNotifier(notifier, `Some Template message`);
    env.addChange(1);
  });
});

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
          var local_config = new main.Config().slackHook();
          local_config.toString().should.equal('https://hooks.slack.com/services/<Your_Slack_URL_Should_Go_Here>');
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
