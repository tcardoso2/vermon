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
    var key = new main.Config().SlackHook();
    var n = new ext.SlackNotifier("My Slack Notifier", key);
    n.key.should.equal(key);
  });

  it('should check if a local file exists', function () {
    var local_config = require("../local.js");
    local_config.should.not.equal(undefined);
  });

  it('should detect the slack config properties from the local config file (default profile)', function() {
    //Assumes there is some local file with the key
    var key = new main.Config().SlackHook();
    var n = new ext.SlackNotifier("My slack notifier", key);
    var local_config = require("../local.js");
    n.key.should.equal(local_config.default.slack.hook);
  });

  it('should detect the slack config properties from the default profile equal the fallback', function () {
    //Assumes there is some local file with the key
    var key = new main.Config().SlackHook();
    var key_default = new main.Config().SlackHook("default");
    key.should.equal(key_default);
  });

  it('should raise an Error if no key is found for an inexisting profile', function () {
    try {
      var key = new main.Config().SlackHook("some_inexisting_profile");
    } catch (e) {
      e.message.should.equal("'some_inexisting_profile' was not found in the local.js file.");
    }
  });

  it('should be able to send a message successfully', function (done) {
    var key = new main.Config().SlackHook();
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