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

let chai = require('chai')
let chaiAsPromised = require('chai-as-promised')
let should = chai.should()
let fs = require('fs')
let vermon = require('../main.js')
let core = vermon.core_ent
let ent = core.entities
let ext = core.extensions

// Chai will use promises for async events
chai.use(chaiAsPromised)

before(function (done) {
  done()
})

after(function (done) {
  // here you can clear fixtures, etc.
  vermon.reset()
  vermon = require('../main.js')
  core = vermon.core_ent
  ent = core.entities
  ext = core.extensions
  done()
})


describe('NodeEnvironment basics, ', function () {
  xit('should exist and inherit SystemEnvironment', function(done) {
    // Prepare
    var n = new ext.NodeEnvironment()
    console.log(n)
    (n instanceof ext.SystemEnvironment).should.equal(true)
    done()
  })

  it('should output the network nodes via Environment state', function(done) {
    // Prepare
    this.timeout(20000)
    vermon.setLogLevel('info')
    vermon.configure('test/config_test21.js')
    vermon.watch().then((v) => {
      v.environment.on('changedState', (before, after) => {
	(after.stdout.stderr == '').should.equal(true)
	Array.isArray(after.cpus).should.equal(true)
	done()
      })
    }).catch((e) => {
      should.fail(e)
    })
  })

  xit('should get the hosts response with also the latency and total nr. of hosts found', function(done) {
  })

  it('should convert automatically the hosts into NodeMotionDetectors', function(done) {
    // Prepare
    this.timeout(20000)
    vermon.setLogLevel('info')
    vermon.configure('test/config_test22.js')
    vermon.watch().then((v) => {
      v.environment.on('changedState', (before, after) => {
	vermon.getDetectors().length.should.be.gt(0)
        done()
      })
    }).catch((e) => {
      should.fail(e)
    })
  })
})
