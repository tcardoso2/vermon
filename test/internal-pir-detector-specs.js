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

var chai = require('chai');
var chaiAsPromised = require("chai-as-promised");
var should = chai.should();
var fs = require('fs');
var ent = require('../Entities.js');
var ext = require('../Extensions.js');

//Chai will use promises for async events
chai.use(chaiAsPromised);

before(function(done) {
  done();
});

after(function(done) {
  // here you can clear fixtures, etc.
  done();
});


describe("When a new PIR Motion Detector is added", function() {
  it('it must throw an Error if no pin Rasberry pin is provided', function () {
    //Prepare
    var env = new ent.Environment();
    try{
      var pir = new ext.PIRMotionDetector();
    } catch(e)
    {
      e.message.should.equal('FATAL: You must provide a pin number for the Raspberry Pi where the PIR sensor signal is being read.');
      return;
    }
    should.fail();
  });
  
  it('it must not throw any error if a pin is provided (run only on a Rpi, will show an error if the host if not a RPi)', function (done) {
    //Prepare
    var env = new ent.Environment();
    try{
      var pir = new ext.PIRMotionDetector(17);
    } catch(e)
    {
      console.error(e);
      should.fail();
    }
    done();
  });
});