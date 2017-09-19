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
let events = require('events');
let chalk = require('chalk');

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

  it('the function StartWithConfig skips known static keywords such as slack or raspistill from being dinamically instantiated', function (done) {
    let myMockProfile = 
    {
      slack: {
        hook: "test"
      },
      raspistill: {
        options: {
        }
      }
    }
    let c = new main.Config(myMockProfile);
    //Prepare
    main.StartWithConfig(new main.Config());
    done();

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

  it('the object Config can accept alternative mock config files', function (done) {
    let alternativeConfig = new main.Config("/test/config_test1.js");
    let file = require("./config_test1.js");
    alternativeConfig.file.should.equal(file);
    done();
  });

  it('the object Config can detect the default profile of a mock config file', function (done) {
    let alternativeConfig = new main.Config("/test/config_test1.js");
    let file_val = alternativeConfig.profile("default");

    JSON.stringify(file_val.some_group).should.equal(JSON.stringify({some_property: "Test Property" }));
    done();
  });

  it('if the object Config cannot detect the Configuration file, it fallsback to default and highlights through the isFallBack() function', function (done) {
    let alternativeConfig = new main.Config("/test/config_test_does_not_exist.js");

    alternativeConfig.isFallback().should.equal(true);
    done();
  });

  it('the object Config can detect properties from mock config files', function (done) {
    let alternativeConfig = new main.Config("/test/config_test1.js");

    alternativeConfig.getProperty("default", "some_group").some_property.should.equal("Test Property");
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
    let alternativeConfig = new main.Config("/test/config_test2.js");
    main.StartWithConfig(alternativeConfig, (e, d, n, f)=>{
      n[0].name.should.equal("My Slack channel");
      done();
    });
  });

  it('When starting with alternate config, the Notification Objects contained in the config file are automatically instanced as Notificators of main', function (done) {
    //Main needs to be reset explicitely because it keeps objects from previous test
    main.Reset();
    let alternativeConfig = new main.Config("/test/config_test2.js");
    main.StartWithConfig(alternativeConfig);
    main.GetNotifiers().length.should.equal(1);

    done();
  });

  it('When starting with alternate config, the Environment Objects contained in the config file are automatically instanced as Environments of main', function (done) {
    //Main needs to be reset explicitely because it keeps objects from previous test
    main.Reset();
    let alternativeConfig = new main.Config("/test/config_test5.js");

    class TestEnvironment extends ent.Environment {
      constructor(params)
      {
        super(params);
      }
    }

    new ent.EntitiesFactory().extend({ TestEnvironment });
    main.StartWithConfig(alternativeConfig);

    let env = main.GetEnvironment();
    env.name.should.equal("My Test Environment");

    done();
  });

  it('When starting with alternate config, the MotionDetector Objects contained in the config file are automatically instanced as MotionDetectors of main', function (done) {
    main.Reset();
    let alternativeConfig = new main.Config("/test/config_test2.js");
    main.StartWithConfig(alternativeConfig);

    let slackNotifier = main.GetNotifiers()[0];
    slackNotifier.name.should.equal("My Slack channel");

    done();
  });

  it('should have a callback sending as arguments, the entity, motion detectors and notifier objects', function (done) {
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

describe("When using the EntitiesFactory function, ", function() {
  it('should create an Environment', function () {
    //Prepare

    let e = new (new ent.EntitiesFactory("Environment"))();
    (e instanceof ent.Environment).should.equal(true);
  });
  it('should create a MotionDetector', function () {
    //Prepare

    let m = new (new ent.EntitiesFactory("MotionDetector"))();
    (m instanceof ent.MotionDetector).should.equal(true);
  });
  it('should create a BaseNotifier', function () {
    //Prepare

    let n = new (new ent.EntitiesFactory("BaseNotifier"))();
    (n instanceof ent.BaseNotifier).should.equal(true);
  });
  it('should be able to accept extensions such as SlackNotifier', function () {
    //Prepare

    let slackNotifierObj = new ent.EntitiesFactory("SlackNotifier");
    let n = new slackNotifierObj("name", "some key");
    (n instanceof ent.BaseNotifier).should.equal(true);
  });
  it('should be able to accept extensions such as SlackNotifier, with parameters directly from the config file', function () {
    //Prepare
    let slackNotifierFactory = new ent.EntitiesFactory();
    n = slackNotifierFactory.instanciate("SlackNotifier", { name: "A", key: "K"});
    (n instanceof ent.BaseNotifier).should.equal(true);
    n.name.should.equal("A");
    n.key.should.equal("K")
  });
  it('should throw an exception if object is not recognized', function () {
    //Prepare
    try{
      let f = new ent.EntitiesFactory("someRandomObject");
    } catch(exc)
    {
      exc.message.should.equal("Class name 'someRandomObject' is not recognized, did you forget to use the 'extend' method?");
      return;
    }
    should.fail();
  });
  it('should throw an exception if object is a reserved keyworkd', function () {
    //Prepare
    try{
      let f = new ent.EntitiesFactory("slack");
    } catch(exc)
    {
      exc.message.should.equal("'slack' is a reserved keyword and may not be used as Configuration object");
      return;
    }
    should.fail();
  });
});

describe("To be able to disable temporarily a Motion Detector..., ", function() {
  let fail_helper = true;
  it('I should be able to deactivate an existing active MD by name', function () {
    //Prepare
    main.Reset();
    let alternativeConfig = new main.Config("/test/config_test6.js");
    main.StartWithConfig(alternativeConfig, ()=>{
      let n = main.GetNotifiers();
      n[0].on('pushedNotification', function(message, text, data){
        fail_helper.should.equal(false);
      });
      main.DeactivateDetector("MD 1");
      //Act
      let e = main.GetEnvironment();
      e.addChange(12);      
    });
  });
  it('I should fail if the MD name being deactivated does not exist', function () {
    //Prepare
    try{
      main.DeactivateDetector("MD unexisting");
    } catch(e){
      e.message.should.equal("Error: cannot find Detector with name 'MD unexisting'.")
      return;
    }
    should.fail();
  });
  it('I should be able to reactivate a previously deactivated MD by name', function () {
    //Prepare
    main.ActivateDetector("MD 1");
    fail_helper = false;
    main.GetEnvironment().addChange(12);
  });
  it('I should fail if the MD name Being activated does not exist', function () {
    //Prepare
    try{
      main.ActivateDetector("MD unexisting");
    } catch(e){
      e.message.should.equal("'MD unexisting' does not exist.")
      return;
    }
    should.fail();
  });
});

describe("When creating a config file of several components of same type, ", function() {
  it('I should be able to add 2 detectors of the same type programatically', function (done) {
    //Main needs to be reset explicitely because it keeps objects from previous test
    main.Reset();
    let alternativeConfig = new main.Config("/test/config_test8.js");

    main.StartWithConfig(alternativeConfig);

    let md = main.GetMotionDetectors();
    md.length.should.equal(2);
    md[0].name.should.equal("MD 2");
    md[1].name.should.equal("MD 1");

    done();
  });
  it('I should be able to add 2 detectors of the same type in an array-type structure', function (done) {
    //Main needs to be reset explicitely because it keeps objects from previous test
    main.Reset();
    let alternativeConfig = new main.Config("/test/config_test8.js");

    main.StartWithConfig(alternativeConfig, (e, d, n, f) => {
      d[0].name.should.equal("MD 2");
      d[1].name.should.equal("MD 1");
      done();
    });
  });
  it('I should be able to add 2 filters of the same type in an array-type structure', function (done) {
    //Main needs to be reset explicitely because it keeps objects from previous test
    main.GetFilters().length.should.equal(2);
    done();
  });
  it('Signal with intensity 5 should be reflected on the respective Detector only', function (done) {
    //Main needs to be reset explicitely because it keeps objects from previous test

    let n11 = main.GetNotifiers();
    n11.length.should.equal(1);
    n11[0].on('pushedNotification', function(message, text, data){
      data.detector.name.should.equal("MD 2");
    });

    main.GetEnvironment().addChange(5);

    done();
  });
});

//Create tests removing Detectors and notifiers.
