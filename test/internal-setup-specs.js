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

describe("When using t-modion-detector, ", function() {

  it('I should be able to save the current Environment, Detectors and Notifiers into disk as a configuration file', function (done) {
    //Prepare
    main.Reset();
    let alternativeConfig = new main.Config("/test/config_test6.js");
    main.StartWithConfig(alternativeConfig, ()=>{
      main.saveAllToConfig("/test/config_test_my_saved_config.js", (status, message)=>{
        //Check file exists
        if (fs.existsSync('./test/config_test_my_saved_config.js')){
          status.should.equal(0);
          message.should.equal("Success");
        } else {
          should.fail();
        }
      })
    });
  });
  it('if file exists should return an error', function (done) {
    //Prepare
    main.saveAllToConfig("/test/config_test_my_saved_config.js", (status, message)=>{
      //Check file exists
      status.should.equal(1);
      message.should.equal("Error, file exists, if you want to overwrite it, use the force attribute");
    })
  });
  it('when saving with force attribute if file exists should overwrite it', function (done) {
    //Prepare
    main.saveAllToConfig("/test/config_test_my_saved_config.js", (status, message)=>{
      //Check file exists
      status.should.equal(0);
      message.should.equal("File exists, overwriting with new version");
    }, true); //Force attribute
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
