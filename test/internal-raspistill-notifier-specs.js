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

let chai = require('chai');
let chaiAsPromised = require("chai-as-promised");
let should = chai.should();
let fs = require('fs');
let ent = require('../Entities.js');
let ext = require('../Extensions.js');
let main = require('../main.js');
let events = require('events');
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

describe("When a new Environment with a Raspistill Notifier is created, ", function() {
  it('should save a picture', function(done) {
    main.Reset(); 
    this.timeout(8000);
    let env = new ent.Environment();
    let detector = new ext.FileDetector("File Detector", "photos");
    let notifier = new ext.RaspistillNotifier("My Raspistill Notifier", 'some_file', {});
    let sConfig = new main.Config();
    let slackNotifier = new ext.SlackNotifier("My Slack notifier", sConfig.slackHook(), sConfig.slackAuth());
    let _detected = false;
    let _detectedSlack = false;
    notifier.on("pushedNotification", function(name, text, data){
      if (data.newState.toString().indexOf(".txt") > 0) return;
      console.log(`Got a notification from ${name}: ${text}`);
      if (_detected) return;
      fs.existsSync('./photos/some_file.jpg').should.equal(true);
      data.newState.should.equal("photos/some_file.jpg");

      //clean up
      fs.unlinkSync('./photos/some_file.jpg');
      if (_detectedSlack){
        main.Reset();
        done();
      } 
      _detected = true;
    });
    slackNotifier.on("pushedNotification", function(name, text, data){
        console.log(`Got a notification from ${name}: ${text}`); 
        if (data.newState.toString().indexOf(".txt") > 0) return;
        if (_detectedSlack) return;
        data.detector.name.should.equal("File Detector");
        data.file.should.not.equal(undefined); 
        data.newState.should.equal("photos/some_file.jpg");
        if (_detected) {
          main.Reset();
          done();
        } 
        _detectedSlack = true;
    });
    main.Start({
      environment: env,
      initialMotionDetector: detector,
    }, true);
    main.AddNotifier(notifier, `Received notification from: ${detector.name}`);
    main.AddNotifier(slackNotifier, `Slack received notification from: ${detector.name}`)
    env.addChange(1);
  });
});

describe("When a new Raspistill Notifier is created, ", function() {
  it('its internalObj property should be a node-raspistill object', function() {
    
    let n = new ext.RaspistillNotifier();
    n.hasInternalObj().should.not.equal(undefined);
    (n.internalObj instanceof Raspistill).should.equal(true);
  });

  it('should allow a parameterless constructor', function() {

    try{
      let n = new ext.RaspistillNotifier();
    } catch(e){
      should.fail();
    }
  });

  it('should detect the raspistill options properties', function() {
    //Assumes there is some local file with the key
    main.Reset(); 
    let options = new main.Config().raspistillOptions();
    let n = new ext.RaspistillNotifier("My Slack Notifier", "filename", options);
    n.options.should.equal(options);
  });

  it('should check if a local file exists', function () {
    let local_config = new main.Config();
    local_config.should.not.equal(undefined);
  });

  it('should detect the raspistill config properties from the local config file (default profile)', function() {
    main.Reset(); 
    //Assumes there is some local file with the key
    let options = new main.Config().raspistillOptions();
    let n = new ext.RaspistillNotifier("My Raspistill notifier", "filename", options);
    let local_config = new main.Config().profile();
    n.options.should.equal(local_config.raspistill.options);
  });

  it('should detect the raspistill config properties from the default profile equal the fallback', function () {
    main.Reset(); 
    //Assumes there is some local file with the key
    let key = new main.Config().raspistillOptions();
    let key_default = new main.Config().raspistillOptions("default");
    key.should.equal(key_default);
  });

});

describe("When a file drops into a folder", function() {
  it('It should detect it and trigger notifiers', function(done) {
    main.Reset(); 
    let n0 = new ent.BaseNotifier();
    let e0 = new ent.Environment();
    let m0 = new ext.FileDetector("File Detector", "photos");
    let detected = false;
    n0.on('pushedNotification', function(notifierName, text, data){
      if ((text != "Started") && !detected)
      {
        if(data.newState.indexOf(".txt") > 0)
        { 
          detected = true;
          data.newState.should.equal("photos/test.txt");
          text.should.equal("Notification received from: File Detector");
          done();
        }
      }
    });

    main.Start({
      environment: e0,
      initialNotifier: n0,
      initialMotionDetector: m0
    });
    fs.writeFile("photos/test.txt", "Hey there!", function(err) {
      if(err) {
        return console.log(err);
      }
    });
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
    main.Reset();
    var local_config = new main.Config().slackHook();
    local_config.should.not.equal(undefined);
  });
});
