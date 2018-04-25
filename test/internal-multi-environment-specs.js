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

//Chai will use promises for async events
chai.use(chaiAsPromised);

before(function(done) {
  done();
});

after(function(done) {
  // here you can clear fixtures, etc.
  main.Reset();
  done();
});

describe("When a MultiEnvironment is added, ", function() {
  it('it should inherit Environment type', function () {
    //Prepare
    main.Reset();
    ((new ext.MultiEnvironment()) instanceof ent.Environment).should.equal(true);
  });

  it('it should be possible to add Sub-environments via the addChange method', function () {
    //Prepare
    main.Reset();
    let e = new ext.MultiEnvironment();
    //Action
    e.addChange(new ent.Environment({name: "Environment 1"}));
    e.addChange(new ent.Environment({name: "Environment 2"}));
    //Assert
    Array.isArray(e.getCurrentState()).should.equal(false);
    (e.getCurrentState()["Environment 1"] instanceof ent.Environment).should.equal(true);
    e.getCurrentState()["Environment 1"].name.should.equal("Environment 1");
    e.getCurrentState()["Environment 2"].name.should.equal("Environment 2");
  });

  it('it should allow adding Changes of type Environment, only, everything else it ignores without an exception, but propagates via an ignoreChange event', function (done) {
    //Prepare
    main.Reset();
    let e = new ext.MultiEnvironment();
    //Assert
    e.on('changedState', (oldState, newState) => {
      should.fail();
    });

    let _done = 0;
    e.on('ignoredChange', (currentState, ignoredChange) => {
      if (currentState === {})
      {
        ignoredChange.should.equal("Some String");
      }
      if(_done < 3){
        _done++;
      }
      else{
        done();
      }
    });
    //Action
    e.addChange("Some String");
    e.addChange(1222);
    e.addChange([6,8]);
    e.addChange({"test": "Some sort of object"});
    e.getCurrentState().should.be.eql({});
  });

  it('ignored Changes should be propagated to sub-environments', function (done) {
      //Prepare
    main.Reset();
    let e = new ext.MultiEnvironment();
    //Assert
    let _countChanges = 0;
    let _countIgnores = 0;
    let _subChanges = 0;

    Array.isArray(e.getCurrentState()).should.equal(false);
    e.on('changedState', (oldState, newState) => {
      console.log("changedState called!");
      _countChanges++;
      if(_countChanges > 2){
        should.fail();
      }
      if(_countChanges == 2){
        e.getCurrentState()["Environment 1"].on('changedState', (oldState, newState) => { _subChanges++; });
        e.getCurrentState()["Environment 2"].on('changedState', (oldState, newState) => { _subChanges++; });
      }
    });

    e.on('ignoredChange', (currentState, ignoredChange) => {
      console.log("ignoredChange called!");
      _countIgnores++;
      if(_countIgnores > 2){
        should.fail();
      }
      if (_subChanges >= 2){
        //If more than 2 done is going to be called multiple times which will fail, hence I want only 2 subChanges
        done();
      }
    });

    //Action
    e.addChange(new ent.Environment({name: "Environment 1"}));
    e.addChange(new ent.Environment({name: "Environment 2"}));
    e.addChange("Some String");
    e.addChange(1222);
  });
  
  it('Changes from sub-environments should only propagate for the respective sub-environment', function (done) {
      //Prepare
    main.Reset();
    let e = new ext.MultiEnvironment();
    //Assert
    let _countChanges = 0;

    Array.isArray(e.getCurrentState()).should.equal(false);
    e.on('changedState', (oldState, newState) => {
      console.log("changedState called!");
      _countChanges++;
      if(_countChanges > 2){
        should.fail();
      }
      if(_countChanges == 2){
        e.getCurrentState()["Environment 1"].on('changedState', (oldState, newState) => { 
          newState.should.equal("Some sub-environment change");
          done(); 
        });
        e.getCurrentState()["Environment 2"].on('changedState', (oldState, newState) => { should.fail(); });
        e.getCurrentState()["Environment 1"].addChange("Some sub-environment change");
      }
    });

    //Action
    e.addChange(new ent.Environment({name: "Environment 1", state: ""}));
    e.addChange(new ent.Environment({name: "Environment 2"}));
  });

  it('should be possible to add detectors and notifiers to specific sub-environments and receive changes propagated to these.', function (done) {
    //Prepare
    let e = new ext.MultiEnvironment();
    main.Start({
      environment: e
    });
    e.addChange(new ent.Environment({name: "Environment 1"}));
    e.addChange(new ent.Environment({name: "Environment 2"}));

    main.AddDetector(new ent.MotionDetector("Detector 1"), false, "Environment 2");
    main.AddNotifier(new ent.BaseNotifier("Notifier 1"), e.getCurrentState()["Environment 2"]);
    main.AddDetector(new ent.MotionDetector("Detector 2"), false, "Environment 1");
    main.AddNotifier(new ent.BaseNotifier("Notifier 2"), e.getCurrentState()["Environment 1"]);

    e.getCurrentState()["Environment 2"].motionDetectors.length.should.equal(1);
    e.getCurrentState()["Environment 1"].motionDetectors.length.should.equal(1);
    (e.getCurrentState()["Environment 2"].motionDetectors[0] instanceof ent.MotionDetector).should.equal(true);

    main.GetMotionDetectors().length.should.equal(2);
    main.GetNotifiers().length.should.equal(2);
    (e.getCurrentState()["Environment 2"].motionDetectors[0] instanceof ent.MotionDetector).should.equal(true);

    let _resultCount = 0;
    let noti_function = function(message, text){
      //console.log("A new notification has arrived!", message, text);
      console.log("Notification received, _resultCount will be increased...");
      _resultCount++;
      if(_resultCount == 2) done();
    };

    main.GetNotifiers()[0].on('pushedNotification', noti_function);
    main.GetNotifiers()[1].on('pushedNotification', noti_function);
    e.addChange(1);
  });

  it('If arguments are passed on the constructor, these should be passed via state key.', function () {
    //Prepare
    main.Reset();
    //Assert
    try{
      new ext.MultiEnvironment(333);
    } catch(e){
      e.message.should.equal("If args are passed into the constructor of MultiEnvironment, there should be a state property.");
      return;
    }
    should.fail();
  });

  it('The constructor should allow taking state as an Array', function () {
    //Prepare
    main.Reset();
    //Assert
    try{
      new ext.MultiEnvironment({ state: 333 });
    } catch(e){
      e.message.should.equal("MultiEnvironment expects a state of type Array.");
      return;
    }
    should.fail();
  });

  it('The constructor should allow taking state as an Array of Environment types', function () {
    //Prepare
    main.Reset();
    //Assert
    try{
      new ext.MultiEnvironment({ state: ["a", "b"] });
    } catch(e){
      e.message.should.equal("MultiEnvironment expects a state of type Array of type Environment, found 'string'");
      return;
    }
    should.fail();
  });

  it('should result in error if attempting to Add a detector to an inexisting sub-environment', function () {
    //Prepare
    main.Reset();

    let args = [];
    args.push(new ent.Environment({name: "Environment 1"}));
    args.push(new ent.Environment({name: "Environment 2"}));
    //Assert
    let e = new ext.MultiEnvironment({ state: args });
    main.Start({environment: e});
    (e.getCurrentState()["Environment 2"] instanceof ent.Environment).should.equal(true);
    (e.getCurrentState()["Environment 1"] instanceof ent.Environment).should.equal(true);
    try{
      main.AddDetectorToSubEnvironmentOnly(new ent.MotionDetector("Detector 1"), false, "Environment 3");
    }catch(e){
      e.message.should.equal("Sub-Environment is not valid.");
    }
  });

  it('GetSubEnvironments gets the list of sub-environments', function () {
    //Prepare
    main.Reset();

    //Prepare
    main.Reset();

    let args = [];
    args.push(new ent.Environment({name: "Environment 1"}));
    args.push(new ent.Environment({name: "Environment 2"}));
    //Assert
    let e = new ext.MultiEnvironment({ state: args });
    main.Start({environment: e});
    let subEnv = main.GetSubEnvironments();

    (subEnv["Environment 2"] instanceof ent.Environment).should.equal(true);
    (subEnv["Environment 1"] instanceof ent.Environment).should.equal(true);
  });

  it('Notifiers added to main environment do not trigger on sub-environment detectors and vice-versa.', function (done) {
    //Prepare
    main.Reset();

    let args = [];
    args.push(new ent.Environment({name: "Sub-Environment 1"}));
    args.push(new ent.Environment({name: "Sub-Environment 2"}));
    //Assert
    let e = new ext.MultiEnvironment({ state: args });
    main.Start({environment: e});
    (e.getCurrentState()["Sub-Environment 2"] instanceof ent.Environment).should.equal(true);
    (e.getCurrentState()["Sub-Environment 1"] instanceof ent.Environment).should.equal(true);

    main.AddDetectorToSubEnvironmentOnly(new ent.MotionDetector("Sub-Detector only 1"), false, "Sub-Environment 2");
    main.AddDetector(new ent.MotionDetector("Detector 2 for both"), false, "Sub-Environment 2");
    main.AddNotifier(new ent.BaseNotifier("Notifier 1")); //Will bind to Detector 2 only
    main.AddNotifierToSubEnvironment(new ent.BaseNotifier("Notifier 2"), "Sub-Environment 2"); //Will bind to Sub-detector only

    e.getCurrentState()["Sub-Environment 2"].motionDetectors.length.should.equal(2);
    (e.getCurrentState()["Sub-Environment 2"].motionDetectors[0] instanceof ent.MotionDetector).should.equal(true);

    main.GetMotionDetectors().length.should.equal(1);
    main.GetNotifiers().length.should.equal(2);
    (e.getCurrentState()["Sub-Environment 2"].motionDetectors[0] instanceof ent.MotionDetector).should.equal(true);

    let _resultCount = 0;
    let noti_function = function(message, text){
      //console.log("A new notification has arrived!", message, text);
      console.log(`${text}, _resultCount will be increased to ${_resultCount + 1}...`);
      _resultCount++;
      if(_resultCount == 3) done();
      if(_resultCount == 4) should.fail();
    };

    main.GetNotifiers()[0].on('pushedNotification', noti_function);
    main.GetNotifiers()[1].on('pushedNotification', noti_function);
    e.addChange(1); //Change gets propagated to sub environments
  });
});

describe("When a MultiEnvironment is added via config file, ", function() {
  it('it should be possible to declare/instanciate the MultiEnvironment via the config file', function (done) {
    //Prepare
    main.Reset();
    let alternativeConfig = new main.Config("/test/config_test18.js");

     main.StartWithConfig(alternativeConfig, (e, d, n, f)=>{
       (e instanceof ext.MultiEnvironment).should.equal(true);
       done();
    });
  });
  it('EntitiesFactory should be able to convert from array of $new$Environment to the actual array of objects', function () {
    //Prepare
    let f = new ent.EntitiesFactory();
    let e = f.handle_any_declarative_parameters([
        { $new$Environment: { params: { name: "Environment 1", state: 1}} },
        { $new$Environment: { params: { name: "Environment 2", state: 3}} }     
      ]);
    console.log("!!!!!!!!!!!", e);
    (e[0] instanceof ent.Environment).should.equal(true);
    (e[1] instanceof ent.Environment).should.equal(true);
    e[0].name.should.equal("Environment 1");
    e[1].name.should.equal("Environment 2");
    e[0].getCurrentState().should.equal(1);
    e[1].getCurrentState().should.equal(3);
  });

  it('EntitiesFactory handle_any_declarative_parameters recursive function should ignore strings and numbers', function () {
    //Prepare
    let f = new ent.EntitiesFactory();
    let o = f.handle_any_declarative_parameters({name: "Environment 1", state: 1});
    o.should.be.eql({name: "Environment 1", state: 1});
    f.is_array_or_object({ name: "test"}).should.equal(true);
    f.is_array_or_object([ new ent.Environment() ]).should.equal(true);
    f.is_array_or_object([ 3, 4, 5 ]).should.equal(true);
    f.is_array_or_object(10).should.equal(false);    
    f.is_array_or_object("Test").should.equal(false);
    f.is_array_or_object(true).should.equal(false);
  });

  it('EntitiesFactory should be able to instanciate a MultiEnvironment with Sub-Environments', function () {
    //Prepare
    let f = new ent.EntitiesFactory();
    let e = f.instanciate("MultiEnvironment", { params:
      { 
        name: "MyMulti", 
        state: [
          { $new$Environment: { params: { name: "Environment 1", state: 1}} },
          { $new$Environment: { params: { name: "Environment 2", state: 3}} }
        ]
      }
    });
    (e instanceof ext.MultiEnvironment).should.equal(true);
    (e.getCurrentState()["Environment 1"] instanceof ent.Environment).should.equal(true);
    (e.getCurrentState()["Environment 2"] instanceof ent.Environment).should.equal(true);
    e.getCurrentState()["Environment 1"].name.should.equal("Environment 1");
    e.getCurrentState()["Environment 2"].name.should.equal("Environment 2");
    e.getCurrentState()["Environment 1"].getCurrentState().should.equal(1);
    e.getCurrentState()["Environment 2"].getCurrentState().should.equal(3);
  });
  it('should be possible to declare/add Sub-environments via the config file by specifying constructors via appending $new$ to the key-value pair', function (done) {
    //Prepare
    main.Reset();
    let alternativeConfig = new main.Config("/test/config_test19.js");

    main.StartWithConfig(alternativeConfig, (e, d, n, f)=>{
      (e instanceof ext.MultiEnvironment).should.equal(true);
      (e.getCurrentState()["Environment 1"] instanceof ent.Environment).should.equal(true);
      e.getCurrentState()["Environment 1"].name.should.equal("Environment 1");
      e.getCurrentState()["Environment 2"].name.should.equal("Environment 2");
      e.getCurrentState()["Environment 1"].getCurrentState().should.equal(1);
      e.getCurrentState()["Environment 2"].getCurrentState().should.equal(3);
      done();
    });
  });
  it('should be possible to add Detectors to sub-environments ', function (done) {
    //Prepare
    main.Reset();
    let alternativeConfig = new main.Config("/test/config_test20.js");

    main.StartWithConfig(alternativeConfig, (e, d, n, f)=>{
      (e instanceof ext.MultiEnvironment).should.equal(true);
      (e.getCurrentState()["Environment 1"] instanceof ent.Environment).should.equal(true);
      e.getCurrentState()["Environment 1"].name.should.equal("Environment 1");
      e.getCurrentState()["Environment 2"].name.should.equal("Environment 2");
      e.getCurrentState()["Environment 1"].getCurrentState().should.equal(1);
      e.getCurrentState()["Environment 2"].getCurrentState().should.equal(3);
      let subDetectors = e.getCurrentState()["Environment 1"].motionDetectors;
      subDetectors.length.should.equal(1);
      (subDetectors[0] instanceof ent.MotionDetector).should.equal(true);
      subDetectors[0].name.should.equal("My detector");
      done();
    });
  });
  it('EntitiesFactory should be able to instanciate a MultiEnvironment with Sub-Environments and Sub-Detectors', function () {
    //Prepare
    let f = new ent.EntitiesFactory();
    let e = f.instanciate("MultiEnvironment", { params:
      { 
        name: "MyMulti", 
        state: [
          { 
            $new$Environment: { params: { name: "Environment 1", state: 1}},
            $detectors$: {
              MotionDetector: {
                name: "My Sub-Motion Detector",
                initialIntensity: 10
              }
            }
          },
          { 
            $new$Environment: { params: { name: "Environment 2", state: 3}} 
          }
        ]
      }
    });
    (e instanceof ext.MultiEnvironment).should.equal(true);
    (e.getSubEnvironment("Environment 1") instanceof ent.Environment).should.equal(true);
    (e.getSubEnvironment("Environment 2") instanceof ent.Environment).should.equal(true);
    e.getSubEnvironment("Environment 1").name.should.equal("Environment 1");
    e.getSubEnvironment("Environment 2").name.should.equal("Environment 2");
    e.getSubEnvironment("Environment 1").getCurrentState().should.equal(1);
    e.getSubEnvironment("Environment 2").getCurrentState().should.equal(3);
    e.getSubEnvironment("Environment 1").motionDetectors.length.should.equal(1);
    e.motionDetectors.length.should.equal(0);
    e.getSubEnvironment("Environment 2").motionDetectors.should.equal(0);
    (e.getSubEnvironment("Environment 1").motionDetectors[0] instanceof ent.MotionDetector).should.equal(true);
  });
  it('A sub-Environment must be able to get a reference to its parent Multi-Environment', function () {
    //Prepare
    let f = new ent.EntitiesFactory();
    let e = f.instanciate("MultiEnvironment", { params:
      { 
        name: "MyMulti", 
        state: [
          { 
            $new$Environment: { params: { name: "Environment 1", state: 1}},
          },
          { 
            $new$Environment: { params: { name: "Environment 2", state: 3}} 
          }
        ]
      }
    });
    let parent = e.getSubEnvironment("Environment 2").getParentEnvironment();
    (parent instanceof ext.MultiEnvironment).should.equal(true);
    e.should.be.eql(parent);
  });
  it('A sub-Environment must be able to get a reference to its sibling Environments', function () {
    //Prepare
    let f = new ent.EntitiesFactory();
    let e = f.instanciate("MultiEnvironment", { params:
      { 
        name: "MyMulti", 
        state: [
          { 
            $new$Environment: { params: { name: "Environment 1", state: 1}},
          },
          { 
            $new$Environment: { params: { name: "Environment 2", state: 3}} 
          }
        ]
      }
    });
    let sibling = e.getSubEnvironment("Environment 2").getSiblingEnvironment("Environment 1");
    (sibling instanceof ent.Environment).should.equal(true);
    e.getSubEnvironment("Environment 1").should.be.eql(sibling);
  });
});
