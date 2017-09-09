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

var pluginObj = { 
  id: "My Plugin", 
  exports: { 
    PreAddPlugin: function(){}, 
    PostAddPlugin: function(){}, 
    PreRemovePlugin: function(){},
    PostRemovePlugin: function(){} 
  } 
};


describe("When creating an extension, ", function() {
  it('The developer should link both libraries using the AddPlugin function.', function (done) {
     //Prepare
    main.Reset();
    let alternativeConfig = new main.Config("/test/config_test9.js");

    main.StartWithConfig(alternativeConfig, (e, d, n, f)=>{
      let result = main.AddPlugin(pluginObj);
      result.should.equal(true);
      done();
    });
  });
  it('The AddPlugin should include an object as the first argument', function (done) {
     //Prepare
    main.Reset();
    let alternativeConfig = new main.Config("/test/config_test9.js");

    main.StartWithConfig(alternativeConfig, (e, d, n, f)=>{
      try{
        main.AddPlugin();
      } catch(e){
        e.message.should.equal("Error: AddPlugin requires a Plugin module as first argument.");
        done();
        return;
      }
      should.fail();
    });
  });
  it('After the plugin is added, it can be accessed via the Plugins dictionary', function (done) {
     //Prepare
    main.Reset();
    let alternativeConfig = new main.Config("/test/config_test9.js");

    main.StartWithConfig(alternativeConfig, (e, d, n, f)=>{
      main.AddPlugin(pluginObj);
      main.GetPlugins()["My Plugin"].should.be.eql(pluginObj.exports);
      done();
    });
  });
  it('A plugin must have an id.', function (done) {
     //Prepare
    main.Reset();
    let alternativeConfig = new main.Config("/test/config_test9.js");

    let pluginObj2 = { id2: "My Plugin", exports: pluginObj.exports }

    main.StartWithConfig(alternativeConfig, (e, d, n, f)=>{
      try{
        main.AddPlugin(pluginObj2);
      } catch(e){
        e.message.should.equal("Error: The plugin object does not have a valid 'id' property.");
        done();
        return;
      }
      should.fail();
    });
  });
  it('A plugin must have a unique name.', function (done) {
     //Prepare
    main.Reset();
    let alternativeConfig = new main.Config("/test/config_test9.js");

    let pluginObj1 = pluginObj;
    let pluginObj2 = pluginObj;

    main.StartWithConfig(alternativeConfig, (e, d, n, f)=>{
      try{
        main.AddPlugin(pluginObj1);
        main.AddPlugin(pluginObj2);
      } catch(e){
        e.message.should.equal("Error: A plugin object with id 'My Plugin' already exists.");
        done();
        return;
      }
      should.fail();
    });
  });
  it('it should be able to remove an existing plugin.', function (done) {
     //Prepare
    main.Reset();
    let alternativeConfig = new main.Config("/test/config_test9.js");

    main.StartWithConfig(alternativeConfig, (e, d, n, f)=>{
      main.AddPlugin(pluginObj);
      main.GetPlugins()["My Plugin"].should.not.equal(undefined);
      main.RemovePlugin("My Plugin");
      (main.GetPlugins()["My Plugin"] === undefined).should.equal(true);
      done();
    });
  });
  it('From the plugin object, it should be able to access the t-motion-detector Entities via the "$" accessor.', function (done) {
     //Prepare
    main.Reset();
    let alternativeConfig = new main.Config("/test/config_test9.js");

    main.StartWithConfig(alternativeConfig, (e, d, n, f)=>{
      main.AddPlugin(pluginObj);
      main.GetPlugins()["My Plugin"].$.Start.should.not.equal(undefined);
    });
    done();
  });
  it('The plugin object must have an "exports", attribute (should be a valid node Module object but we dont force that) .', function (done) {
     //Prepare
    main.Reset();
    let alternativeConfig = new main.Config("/test/config_test9.js");
    let pluginObj2 = { id: "My Plugin" }

    main.StartWithConfig(alternativeConfig, (e, d, n, f)=>{
      try{
        main.AddPlugin(pluginObj2);
      } catch(e){
        e.message.should.equal("Error: Does not seem to be a valid module.");
        done();
        return;
      }
      should.fail();
    });
  });
  it('The plugin object must implement a PreAddPlugin function, where the main object is received as first parameter, of a callback function.', function (done) {
     //Prepare
    main.Reset();
    let alternativeConfig = new main.Config("/test/config_test9.js");
    let pluginObj2 = { id: "My Plugin", exports: { } }

    main.StartWithConfig(alternativeConfig, (e, d, n, f)=>{
      try{
        main.AddPlugin(pluginObj2);
      } catch(e){
        e.message.should.equal("Error: PreAddPlugin function must be implemented.");
        done();
        return;
      }
      should.fail();
    });
  });
  it('The plugin object must implement a PostAddPlugin function.', function (done) {
     //Prepare
    main.Reset();
    let alternativeConfig = new main.Config("/test/config_test9.js");

    let pluginObj2 = { id: "My Plugin", exports: { PreAddPlugin: function(){} } };

    main.StartWithConfig(alternativeConfig, (e, d, n, f)=>{
      try{
        main.AddPlugin(pluginObj2);
      } catch(e){
        e.message.should.equal("Error: PostAddPlugin function must be implemented.");
        done();
        return;
      }
      should.fail();
    });
  });
  it('The plugin object must implement a PreRemovePlugin function.', function (done) {
     //Prepare
    main.Reset();
    let alternativeConfig = new main.Config("/test/config_test9.js");

    let pluginObj2 = { id: "My Plugin", exports: { PreAddPlugin: function(){}, PostAddPlugin: function(){} } };

    main.StartWithConfig(alternativeConfig, (e, d, n, f)=>{
      try{
        let result = main.AddPlugin(pluginObj2);
        result.should.equal(true);
        main.RemovePlugin("My Plugin");
      } catch(e){
        e.message.should.equal("Error: PreRemovePlugin function must be implemented.");
        done();
        return;
      }
      should.fail();
    });
  });
  it('The plugin object must implement a PostRemovePlugin function where the main object is passed as argument.', function (done) {
     //Prepare
    main.Reset();
    let alternativeConfig = new main.Config("/test/config_test9.js");

    let pluginObj2 = { id: "My Plugin", exports: { PreAddPlugin: function(){}, PostAddPlugin: function(){}, PreRemovePlugin: function(){} } };

    main.StartWithConfig(alternativeConfig, (e, d, n, f)=>{
      try{
        let result = main.AddPlugin(pluginObj2);
        result.should.equal(true);
        main.RemovePlugin("My Plugin");
      } catch(e){
        e.message.should.equal("Error: PostRemovePlugin function must be implemented.");
        done();
        return;
      }
      should.fail();
    });
  });
});