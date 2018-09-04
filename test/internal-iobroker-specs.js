  /*****************************************************
 * Internal tests
 * What are internal tests?
 * As this is a npm package, it should be tested from
 * a package context, so I'll use "interal" preffix
 * for tests which are NOT using the npm tarball pack
 * For all others, the test should obviously include
 * something like:
 * var md = require('t-motion-detector');
 * 
 * IMPORTANT: For these tests to work the iobroker suite needs to be installed
 *            on the current path of where the installation is run. You might
 *            have to simlink to the actual command or install it globally
 *****************************************************/

let chai = require('chai');
let chaiAsPromised = require("chai-as-promised");
let should = chai.should();
let expect = chai.expect();
let fs = require('fs');
let ent = require('../Entities.js');
let ext = require('../Extensions.js');
let filters = require('../Filters.js');
let main = require('../main.js');

before(function(done) {
  done();
});

after(function(done) {
  // here you can clear fixtures, etc.
  main.Reset();
  done();
});

describe("When a new IOBrokerDetector instance is created,", function() {
  it('Class should exist.', function () {
    //Basic test
    let iobrokerDetector = new ext.IOBrokerDetector();
    (iobrokerDetector == undefined).should.equal(false);
  });
  it('Should return a callback with a list of items (assumes iobroker is up).', function (done) {
    this.timeout(4000);
    let iobrokerDetector = new ext.IOBrokerDetector((listOfItems)=>{
      console.log(listOfItems);
      Array.isArray(listOfItems).should.equal(true);
      done();
    });
  });
});