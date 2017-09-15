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
let filters = require('../Filters.js');
let main = require('../main.js');
let events = require('events');
var os = require('os');
var client = require('ssh2').Client;

before(function(done) {
  done();
});

after(function(done) {
  // here you can clear fixtures, etc.
  done();
});

describe("When a new Simple Command is created for an environment,", function() {
  it('The first parameter (command) is required.', function (done) {
    //Prepare
    main.Reset();
    try{
      let env = new ext.SystemEnvironment();
    } catch(e){
      e.message.should.equal("ERROR: You must provide a command as the first argument.");
      done();
      return;
    };
    should.fail();
  });
  it('SystemEnvironment inherits type Environment.', function () {
    //Prepare
    main.Reset();
    let env = new ext.SystemEnvironment("ls");
    (env instanceof ent.Environment).should.equal(true);
  });
  it('should be able to output the command line stdout, and provide info such as cpus used, freemem and totalmem', function (done) {
    //Prepare
    main.Reset();
    let alternativeConfig = new main.Config("/test/config_test11.js");
    main.StartWithConfig(alternativeConfig, (e, d, n, f)=>{

      n[0].on('pushedNotification', function(message, text, data){
        //Contrary to Motion Detector Filters, Environment filters prevent state to change
        data.newState.stdout.data.should.equal(process.cwd()+'\n');
        data.newState.cpus.should.not.equal(undefined);
        data.newState.freemem.should.not.equal(undefined);
        data.newState.totalmem.should.not.equal(undefined);
        done();
      });
      //Should send a signal right away
    });
  });
  it('should allow defining an interval (ms) time period where values are being sent by the environment', function (done) {
    //Prepare
    main.Reset();
    let alternativeConfig = new main.Config("/test/config_test12.js");
    main.StartWithConfig(alternativeConfig, (e, d, n, f)=>{
      let count = 0;
      n[0].on('pushedNotification', function(message, text, data){
        //Contrary to Motion Detector Filters, Environment filters prevent state to change
        console.log(`Received notification, count is ${count}, freemem is ${data.newState.freemem}`);
        data.newState.stdout.data.should.equal(process.cwd()+'\n');
        count++;
        if (count == 3)
        {
          done();
        }
      });
      //Should send a signal right away
    });
  });
  it('should notify if free memory goes below certain threshold', function (done) {
    //Prepare
    main.Reset();
    let alternativeConfig = new main.Config("/test/config_test13.js");
    main.StartWithConfig(alternativeConfig, (e, d, n, f)=>{

      n[0].on('pushedNotification', function(message, text, data){
        //Contrary to Motion Detector Filters, Environment filters prevent state to change
        data.newState.stdout.data.should.equal(process.cwd()+'\n');
        should.fail();
        done();
      });
      //Should send a signal right away
    });
  });
  it('should notify if cannot reach a certain server', function (done) {
    //Prepare
    main.Reset();
    let alternativeConfig = new main.Config("/test/config_test13.js");
    main.StartWithConfig(alternativeConfig, (e, d, n, f)=>{

      n[0].on('pushedNotification', function(message, text, data){
        //Contrary to Motion Detector Filters, Environment filters prevent state to change
        data.newState.stdout.data.should.equal(process.cwd()+'\n');
        should.fail();
        done();
      });
      //Should send a signal right away
    });
  });
  it('should notify if a server is up', function (done) {
    //Prepare
    main.Reset();
    let alternativeConfig = new main.Config("/test/config_test13.js");
    main.StartWithConfig(alternativeConfig, (e, d, n, f)=>{

      n[0].on('pushedNotification', function(message, text, data){
        //Contrary to Motion Detector Filters, Environment filters prevent state to change
        data.newState.stdout.data.should.equal(process.cwd()+'\n');
        should.fail();
        done();
      });
      //Should send a signal right away
    });
  });
});

describe("When a new LoginDetector,", function() {
  it('It should detect if a user has failed to login via ssh', function (done) {
    //Prepare
    main.Reset();
    let alternativeConfig = new main.Config("/test/config_test13.js");
    main.StartWithConfig(alternativeConfig, (e, d, n, f)=>{

      n[0].on('pushedNotification', function(message, text, data){
        //Contrary to Motion Detector Filters, Environment filters prevent state to change
        data.newState.stdout.data.should.equal(process.cwd()+'\n');
        data.newState.should.eql({});
        done();
      });
    });
    //Will not test if successfully logged in
  });
});

//Create tests removing Detectors and notifiers.