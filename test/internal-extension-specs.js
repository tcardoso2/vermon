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

describe("When creating an extention, ", function() {
  it('The developer should link both libraries using the AddPlugin function.', function (done) {
     //Prepare
    main.Reset();
    let alternativeConfig = new main.Config("/test/config_test9.js");

    main.StartWithConfig(alternativeConfig, (e, d, n, f)=>{
      main.AddPlugin(pluginObj);
      done();
    });
  });
  it('After the plugin is added, it can be assesed via the Plugins dictionary', function (done) {
     //Prepare
    main.Reset();
    let alternativeConfig = new main.Config("/test/config_test9.js");

    let pluginObj = { name: "My Plugin" }

    main.StartWithConfig(alternativeConfig, (e, d, n, f)=>{
      main.AddPlugin(pluginObj);
      main.Plugins["My Plugin"] = pluginObj;
      done();
    });
  });
  it('A plugin must have a name.', function (done) {
     //Prepare
    main.Reset();
    let alternativeConfig = new main.Config("/test/config_test9.js");

    let pluginObj = { name2: "My Plugin" }

    main.StartWithConfig(alternativeConfig, (e, d, n, f)=>{
      try{
        main.AddPlugin(pluginObj);
      } catch(e){
        e.message.should.equal("Error: The plugin object does not have a valid 'name' property");
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

    let pluginObj1 = { name: "My Plugin" };
    let pluginObj2 = { name: "My Plugin" };

    main.StartWithConfig(alternativeConfig, (e, d, n, f)=>{
      try{
        main.AddPlugin(pluginObj1);
        main.AddPlugin(pluginObj2)
      } catch(e){
        e.message.should.equal("Error: A plugin object with name 'My Plugin' already exists");
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

    let pluginObj = { name: "My Plugin" };

    main.StartWithConfig(alternativeConfig, (e, d, n, f)=>{
      main.AddPlugin(pluginObj);
      main.Plugins["My Plugin"].should.not.equal(undefined);
      main.RemovePlugin("My Plugin");
      main.Plugins["My Plugin"].should.equal(undefined);
      done();
    });
  });
});