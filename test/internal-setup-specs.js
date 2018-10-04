  /*****************************************************
 * Internal tests
 * What are internal tests?
 * As this is a npm package, it should be tested from
 * a package context, so I'll use "interal" preffix
 * for tests which are NOT using the npm tarball pack
 * For all others, the test should obviously include
 * something like:
 * var md = require('vermon');
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

  it('The start function callback should send the environment, detector, notifiers, and filters as args.', function (done) {
    main.Reset();

    let alternativeConfig = new main.Config("/test/config_test4.js");

    main.StartWithConfig(alternativeConfig, (e, d, n, f)=>{
      e.name.should.equal("No name");
      d.length.should.equal(1);
      n.length.should.equal(1);
      f.length.should.equal(0);
      done();
    });
  });

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
        message.should.equal("Success");
        status.should.equal(0);
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
    if (fs.existsSync(src_save)) fs.unlink(src_save);
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
  xit('The file should equal the contents of the initially loaded config file', function (done) {
    this.timeout(4000);
    main.Reset();
    let src_save = src_template.replace("config", "4");
    let alternativeConfig = new main.Config("/test/config_test9.js");
    //Make sure the temporary file is deleted
    if (fs.existsSync(src_save)) fs.unlink(src_save);
    let data1, data2;
    main.StartWithConfig(alternativeConfig, (e, d, n, f)=>{

      main.SaveAllToConfig(src_save, (status, message)=>{
        data1 = fs.readFileSync(src_save);
        main.Reset();
        main.StartWithConfig(new main.Config(src_save.replace(".","")), (e1, d1, n1, f1)=>{
          console.log(d);
          console.log(d1);
          e.name.should.equal(e1.name);
          d.length.should.equal(d1.length);
          n[0].name.should.equal(n1[0].name);
          f.length.should.eql(f1.length);

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

  it('if file is imported with the "require" keyword the setup should not run', function (done) {
    //Prepare

    let pi = require('../scripts/postinstall.js');
    pi.count.should.equal(0);
    done();
  });
  xit('When choosing option 1 the program should add an Environment', function (done) {
    //Prepare

    let pi = require('../scripts/postinstall.js');
    let setup = new pi.Setup();
    setup.addEnvironmentConfig(new ent.Environment(), function(err, output){
      done();
    });
    should.fail();
  });
  xit('When choosing option 2 the program should add an Environment', function (done) {
    //Prepare

    let pi = require('../scripts/postinstall.js');
    let setup = new pi.Setup();
    setup.addEnvironmentConfig(new ent.Environment(), function(err, output){
      done();
    });
    should.fail();
  });
  xit('When choosing option 3 the program should add a PIR Motion Detector', function (done) {
    //Prepare

    let pi = require('../scripts/postinstall.js');
    let setup = new pi.Setup();
    setup.addEnvironmentConfig(new ent.Environment(), function(err, output){
      done();
    });
    should.fail();
  });
  xit('When choosing option 4 the program should add an Slack Notifier', function (done) {
    //Prepare

    let pi = require('../scripts/postinstall.js');
    let setup = new pi.Setup();
    setup.addEnvironmentConfig(new ent.Environment(), function(err, output){
      done();
    });
    should.fail();
  });
  xit('When choosing option 5 the program should add an Raspistill Notifier', function (done) {
    //Prepare

    let pi = require('../scripts/postinstall.js');
    let setup = new pi.Setup();
    setup.addEnvironmentConfig(new ent.Environment(), function(err, output){
      done();
    });
    should.fail();
  });
  xit('When choosing option 6 the program should delete the config file', function (done) {
    //Prepare

    let pi = require('../scripts/postinstall.js');
    let setup = new pi.Setup();
    setup.deleteConfig(function(err, deleted){
      done();
    });
    should.fail();
  });
});
