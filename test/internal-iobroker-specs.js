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
let expect = chai.expect();
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
  main.Reset();
  done();
});

describe("When a new IOBrokerDetector instance is created,", function() {
  it('Class should exist.', function (done) {
    //Prepare
    let iobrokerDetector = new ent.IOBrokerDetector();
    //should.fail();
  });  
});