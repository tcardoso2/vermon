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

describe("When a new t-motion-detector instance is started from main, ", function() {
  it('the function StartWithConfig function should throw exception if no argument is provided', function () {
    //Prepare
    try{
      main.StartWithConfig();
    } catch(e){
      e.message.should.equal("Requires a Config type object as first argument.");
      return;
    }
    should.fail("Should have caught exception.");
  });

  it('the function StartWithConfig function should expect a Config type object or extension of it', function () {
    //Prepare
    try{
      main.StartWithConfig({ other: "object" });
    } catch(e){
      e.message.should.equal("Requires a Config type object as first argument.");
      return;
    }
    should.fail("Should have caught exception.");;
  });

  it('the function StartWithConfig function should not fail if a Config object is passed', function (done) {
    //Prepare
    main.StartWithConfig(new main.Config());
    done();
  });

  it('the function StartWithConfig function should not fail if an object extending Config object is passed', function (done) {
    //Prepare
    class ConfigExtended extends main.Config{
      constructor()
      {
        super();
      }
    }

    main.StartWithConfig(new ConfigExtended());
    done()
  });

  it('the object Config can receive a mock profile and saves it', function (done) {
    let slackHook = new main.Config().slackHook("default");
    let myMockProfile = 
    {
      slack: {
        hook: slackHook
      },
      raspistill: {
        options: {
        }
      }
    }
    let c = new main.Config(myMockProfile);

    JSON.stringify(c.profile()).should.equal(JSON.stringify(myMockProfile));
    done();
  });

  it('the object Config can receive a set of mock profiles and saves the default (active) one', function (done) {
    let slackHook = new main.Config().slackHook("default");
    let defaultProfile = {
        slack: {
          hook: slackHook
        },
        raspistill: {
          options: {
          }
        }
      }

    let myMockProfiles = 
    {
      profile1: {},
      profile2: {},
      default: defaultProfile
    }
    let c = new main.Config(myMockProfiles);

    JSON.stringify(c.profile()).should.equal(JSON.stringify(defaultProfile));
    done();
  });

  it('the object Config can receive a set of mock profiles in Array format and saves the default (active) one', function (done) {
    let slackHook = new main.Config().slackHook("default");
    let defaultProfile = {
        active: true,
        slack: {
          hook: slackHook
        },
        raspistill: {
          options: {
          }
        }
      }

    let myMockProfiles = [];
    myMockProfiles.push({}); 
    myMockProfiles.push(defaultProfile)
    myMockProfiles.push({}); 
    let c = new main.Config(myMockProfiles);

    JSON.stringify(c.profile()).should.equal(JSON.stringify(defaultProfile));
    done();
  });

  it('the object Config can receive profiles with the name of the class (dependency injection), and array of attributes', function (done) {
    let slackHook = new main.Config().slackHook("default");
    let defaultProfile = {
        SlackNotifier: [
          slackHook
        ],
        PIRMotionDetector: [
          {}
        ]
      }

    let myMockProfiles = 
    {
      profile1: {},
      profile2: {},
      default: defaultProfile
    }
    let c = new main.Config(myMockProfiles);

    let {e, d, n} = main.StartWithConfig(c);

    (e instanceof Environment).should.equal(true);
    (d instanceof PIRMotionDetector).should.equal(true);
    (n instanceof SlackNotifier).should.equal(true);
    done();
  });

  it('TODO', function (done) {
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
    should.fail("Continue from here!");
  });
});

//Create tests removing Detectors and notifiers.