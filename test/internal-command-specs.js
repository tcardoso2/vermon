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
let expect = chai.expect();
let fs = require('fs');
let core = require('vermon-core-entities')
let ent = core.entities
let ext = core.extensions
let filters = core.filters
let main = require('../main.js');
let events = require('events');
var os = require('os');
var client = require('ssh2').Client;

before(function(done) {
  done();
});

after(function(done) {
  // here you can clear fixtures, etc.
  main.Reset();
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
  it('SystemEnvironment should contain as currentState property: totalmem, freemem and cpus.', function (done) {
    //Prepare
    main.Reset();
    let alternativeConfig = new main.Config("/test/config_test11.js");
    let = _done = false;
    main.StartWithConfig(alternativeConfig, (e, d, n, f)=>{
      console.log("SystemEnvironment last State: ", e.currentState);
      if(!_done)
      {
        _done = true;
        e.currentState.cpus.should.equal(-1);
        e.currentState.freemem.should.equal(-1);
        e.currentState.totalmem.should.equal(-1);
        done();
      }
    });
  });
  it('should be able to output the command line stdout, and provide info such as cpus used, freemem and totalmem', function (done) {
    //Prepare
    main.Reset();
    let alternativeConfig = new main.Config("/test/config_test11.js");
    main.StartWithConfig(alternativeConfig, (e, d, n, f)=>{
      let = _done = false;
      n[0].on('pushedNotification', function(message, text, data){
        if(!_done)
        {
          _done = true;
          //Contrary to Motion Detector Filters, Environment filters prevent state to change
          data.newState.stdout.data.should.equal(process.cwd()+'\n');
          data.newState.cpus.should.not.equal(undefined);
          data.newState.freemem.should.not.equal(undefined);
          data.newState.totalmem.should.not.equal(undefined);
          done();
        }
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
    let _done = false;
      n[0].on('pushedNotification', function(message, text, data){
        if (!_done){
          //Contrary to Motion Detector Filters, Environment filters prevent state to change
          console.log("MEMORY:", data.newState.freemem);
          (data.newState.freemem < 9900000000000).should.equal(true);
          done();
          _done = true;
        }
      });
      //Should send a signal right away
    });
  });
    it('it should not filter if the signal is not coming from the environment.', function (done) {
    main.Reset();
    let alternativeConfig = new main.Config("/test/config_test17.js");
    main.StartWithConfig(alternativeConfig, (e, d, n, f)=>{
      n[0].on('pushedNotification', function(message, text, data){
        //Contrary to Motion Detector Filters, Environment filters prevent state to change
        data.newState.should.equal(9);
        done();
      });
      //Act
      d[0].send(9, d[0]);
    });
  });
  it('it should be able to filter for more than one detector.', function (done) {
    main.Reset();
    setTimeout(() => { done(); },1000);
    let alternativeConfig = new main.Config("/test/config_test17.js");
    main.StartWithConfig(alternativeConfig, (e, d, n, f)=>{

      n[0].on('pushedNotification', function(message, text, data){
        //Contrary to Motion Detector Filters, Environment filters prevent state to change
        console.log(message, text, data);
        should.fail();
      });
      //Will already send a value
    });
  });  
  it('should expose "Cmd" as a "node-cmd" object.', function (done) {
    main.Reset();
    main.Cmd.get(
      'pwd',
      function(err, data, stderr){
        (err == null).should.equal(true);
        stderr.should.equal('');
        console.log('the current working dir is : ',data);
        data.should.not.equal(null);
        done();
      }
    );
  });  
  it('should expose "Cli" as a "commander" object.', function (done) {
    //Test command Must be run with --testcli argument for this test to pass
    main.Reset();
    main.Cli.version('0.1.0')
      .option('-p, --testcli', 'test')
      .option('-P, --pineapple', 'Add pineapple')
      .option('-b, --bbq-sauce', 'Add bbq sauce')
      .option('-c, --cheese [type]', 'Add the specified type of cheese [marble]', 'marble')
      .parse(process.argv);
    console.log(main.Cli);
    main.Cli.options.length.should.eql(5);
    done();
  });  
});