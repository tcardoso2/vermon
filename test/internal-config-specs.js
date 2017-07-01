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
    main.StartWithConfig(alternativeConfig);

    let slackNotifier = main.GetNotifiers()[0];
    slackNotifier.name.should.equal("My Slack channel");

    done();
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
    let alternativeConfig = new main.Config("/test/config_test2.js");
    main.StartWithConfig(alternativeConfig);

    main.GetNotifiers().length.should.equal(1);

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

describe("After installing a new t-motion-detector, ", function() {
  /*it('a setup executable should run/exist (postinstall)', function (done) {
    //Disabled as this seems to always timeout
    this.timeout(5000);
    //let pi = require('../scripts/postinstall.js');
    var exec = require('child_process').exec;
 
    //var cmd = exec("Y");
    var cmd = exec("npm run-script postinstall", function (error, stdout, stderr) {
      // ...
      console.log("stdout, "E:", stderr, error);
      pi.count.should.equal(1);
      done();
    });
  });*/
  it('if file is imported with the "require" keyword the setup should not run', function (done) {
    //Prepare

    let pi = require('../scripts/postinstall.js');
    pi.count.should.equal(0);
    done();
  });
  it('When choosing option 1 the program should add an Environment', function (done) {
    //Prepare

    let pi = require('../scripts/postinstall.js');
    let setup = new pi.Setup();
    setup.addEnvironmentConfig(new ent.Environment(), function(err, output){
      done();
    });
    should.fail();
  });
  it('When choosing option 2 the program should add an Environment', function (done) {
    //Prepare

    let pi = require('../scripts/postinstall.js');
    let setup = new pi.Setup();
    setup.addEnvironmentConfig(new ent.Environment(), function(err, output){
      done();
    });
    should.fail();
  });
  it('When choosing option 3 the program should add a PIR Motion Detector', function (done) {
    //Prepare

    let pi = require('../scripts/postinstall.js');
    let setup = new pi.Setup();
    setup.addEnvironmentConfig(new ent.Environment(), function(err, output){
      done();
    });
    should.fail();
  });
  it('When choosing option 4 the program should add an Slack Notifier', function (done) {
    //Prepare

    let pi = require('../scripts/postinstall.js');
    let setup = new pi.Setup();
    setup.addEnvironmentConfig(new ent.Environment(), function(err, output){
      done();
    });
    should.fail();
  });
  it('When choosing option 5 the program should add an Raspistill Notifier', function (done) {
    //Prepare

    let pi = require('../scripts/postinstall.js');
    let setup = new pi.Setup();
    setup.addEnvironmentConfig(new ent.Environment(), function(err, output){
      done();
    });
    should.fail();
  });
  it('When choosing option 6 the program should delete the config file', function (done) {
    //Prepare

    let pi = require('../scripts/postinstall.js');
    let setup = new pi.Setup();
    setup.deleteConfig(function(err, deleted){
      done();
    });
    should.fail();
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
//Create tests removing Detectors and notifiers.
