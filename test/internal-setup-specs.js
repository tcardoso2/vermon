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

var src_template = './test/config_test_my_saved_config.js';
describe("When using t-motion-detector, ", function() {

  it('I should be able to save the current Environment, Detectors and Notifiers into disk as a configuration file', function (done) {
    //Prepare
    main.Reset();
    let src_save = src_template.replace("config", "1");
    let alternativeConfig = new main.Config("/test/config_test4.js");
    //Make sure the temporary file is deleted
    if (fs.existsSync(src_save)) fs.unlink(src_save);
    main.StartWithConfig(alternativeConfig, ()=>{
      main.SaveAllToConfig(src_save, (status, message)=>{
        //Check file exists
        if (fs.existsSync(src_save)){
        } else {
          should.fail();
        }
        status.should.equal(0);
        message.should.equal("Success");
        done();
      });
    });
  });
  it('if file exists should return an error', function (done) {
    //Prepare
    main.Reset();
    let src_save = src_template.replace("config", "2");
    let alternativeConfig = new main.Config("/test/config_test4.js");
    //Make sure the temporary file is deleted
    if (fs.existsSync(src_save.replace("_", "2"))) fs.unlink(src_save);
    main.StartWithConfig(alternativeConfig, ()=>{
      main.SaveAllToConfig(src_save, (status, message)=>{
        //Saving second time
        main.SaveAllToConfig(src_save, (status, message)=>{
          status.should.equal(1);
          message.should.equal("Error: File exists, if you want to overwrite it, use the force attribute");
          done();
        });
      });
    });
  });
  it('when saving with force attribute if file exists should overwrite it', function (done) {
    //Prepare
    main.Reset();
    let src_save = src_template.replace("config", "3");
    let alternativeConfig = new main.Config("/test/config_test4.js");
    //Make sure the temporary file is deleted
    if (fs.existsSync(src_save)) fs.unlink(src_save);
    main.StartWithConfig(alternativeConfig, ()=>{
      main.SaveAllToConfig(src_save, (status, message)=>{
        //Saving second time
        main.SaveAllToConfig(src_save, (status, message)=>{
          message.should.equal("Warn: File exists, overwriting with new version");
          status.should.equal(0);
          done();
        }, true); //Force attribute
      });
    });
  });
  it('The file should equal the contents of the initially loaded config file', function (done) {
    this.timeout(4000);
    main.Reset();
    let src_save = src_template.replace("config", "4");
    let alternativeConfig = new main.Config("/test/config_test4.js");
    //Make sure the temporary file is deleted
    if (fs.existsSync(src_save)) fs.unlink(src_save);
    let data1, data2;
    let ctx = { e: {}, d: {}, n: {}, f: {}};
    main.StartWithConfig(alternativeConfig, ()=>{
      ctx.e = main.GetEnvironment();
      ctx.d = main.GetMotionDetectors();
      ctx.n = main.GetNotifiers();
      ctx.f = main.GetFilters();
      main.SaveAllToConfig(src_save, (status, message)=>{
        data1 = fs.readFileSync(src_save);
        main.Reset();
        main.StartWithConfig(new main.Config(src_save.replace(".","")), ()=>{
          console.log(ctx.e);
          console.log(main.GetEnvironment());
          ctx.e.name.should.equal(main.GetEnvironment().name);
          ctx.d.length.should.equal(main.GetMotionDetectors().length);
          ctx.n[0].name.should.equal(main.GetNotifiers()[0].name);
          ctx.f.length.should.eql(main.GetFilters().length);

          main.SaveAllToConfig(src_save.replace("config", "config2"), (status, message)=>{
            let data2 = fs.readFileSync(src_save.replace("config", "config2"));
            data1.toString().should.equal(data2.toString());
            done();
          });
        });
      });
    });
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