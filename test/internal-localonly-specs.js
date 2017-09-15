  /*****************************************************
 * Internal tests
 * What are internal tests?
 * As this is a npm package, it should be tested from
 * a package context, so I'll use "interal" preffix
 * for tests which are NOT using the npm tarball pack
 * For all others, the test should obviously include
 * something like:
 * let md = require('t-motion-detector');
 *****************************************************/

let chai = require('chai');
let chaiAsPromised = require("chai-as-promised");
let should = chai.should();
let fs = require('fs');
let ent = require('../Entities.js');
let ext = require('../Extensions.js');
let main = require('../main.js');
let events = require('events');
//Chai will use promises for async events
chai.use(chaiAsPromised);

before(function(done) {
  done();
});

after(function(done) {
  // here you can clear fixtures, etc.
  if (fs.existsSync('./_local.js')) {
    //fs.rename('./_local.js', './local.js', function (err) {
      //Nothing I can do here
      //if (err) throw err;
    //});
  }
  done();
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

describe("When a new Simple Command is created for an environment with a Filter,", function() {
  it('should notify if cannot reach a certain server (via Regex Expression match)', function (done) {
    //Prepare
    main.Reset();
    let alternativeConfig = new main.Config("/test/config_test14.js");
    main.StartWithConfig(alternativeConfig, (e, d, n, f)=>{

      n[0].on('pushedNotification', function(message, text, data){
        //Contrary to Motion Detector Filters, Environment filters prevent state to change
        console.log("CONSOLE:", data.newState.stdout.data);
        data.newState.stdout.data.should.include("1 packets transmitted, 1 packets received, 0.0% packet loss");
        done();
      });
      //Should send a signal right away
    });
  });
});
