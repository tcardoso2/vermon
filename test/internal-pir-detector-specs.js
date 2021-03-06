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
let core = require('vermon-core-entities')
let ent = core.entities
let ext = core.extensions
let main = require('../main.js')

// Chai will use promises for async events
chai.use(chaiAsPromised)

before(function (done) {
  done()
})

after(function (done) {
  // here you can clear fixtures, etc.
  done()
})

describe('When a new PIR Motion Detector is added', function () {
  it('it must throw an Error if no pin Rasberry pin is provided', function () {
    // Prepare
    let env = new ent.Environment()
    try {
      let pir = new ext.PIRMotionDetector()
    } catch (e) {
      e.message.should.equal('ERROR: You must provide a pin number for the Raspberry Pi where the PIR sensor signal is being read.')
      return
    }
    should.fail()
  })

  it('it must not throw any error if a pin is provided (run only on a Rpi, will show an error if the host if not a RPi)', function (done) {
    // Prepare
    let env = new ent.Environment()
    try {
      let pir = new ext.PIRMotionDetector(17)
    } catch (e) {
      console.error(e)
      if (e.message == 'FATAL: You must provide a pin number for the Raspberry Pi where the PIR sensor signal is being read.') {
        should.fail()
      }
    }
    done()
  })

  it('it must extend its parent', function (done) {
    // Prepare
    let pir1 = new ext.PIRMotionDetector(17);
    (pir1 instanceof ent.MotionDetector).should.equal(true)
    done()
  })
})

describe('When PIR Motion tests are done in a RaspberryPI (Please waive at the front of your RPi in the next 10 seconds)', function (done) {
  // Skipping this test, it can be done if the user wants to manual waive in front of the detector
  // in a window frame of 10 seconds, but for automated tests is skipped
  it.skip('when the user waves in front of the sensor it should trigger a notification', function (done) {
    if (process.platform != 'linux' || process.arch != 'arm') {
      done()
      return
    }
    // Prepare - This test is similar to the code that resides in the RPI deployments (May 2017)
    this.timeout(10000)
    let env = new main.Entities.Environment()
    initialMD = new main.Extensions.PIRMotionDetector(17)
    initialMD.name = 'test PIR'
    main.Start({
      environment: env,
      initialMotionDetector: initialMD
    })

    initialNotifier = new main.Extensions.SlackNotifier('My Slack', new main.Config().slackHook('default'))
    main.AddNotifier(initialNotifier, `Notification: ${initialMD.name}`)
    let _detected = false
    camNotifier = new main.Extensions.RaspistillNotifier()
    main.AddNotifier(camNotifier)
    initialNotifier.on('pushedNotification', function (name, text) {
      if (!_detected) {
        _detected = true
        chai.assert.isOk('notified')
        // console.log(`Got a notification from ${name}: ${text}`);
        done()
      }
    })
    initialMD.on('hasDetected', function (current, newState, d) {
      chai.assert.isOk('detected')
      // console.log(`Detector detected signal from ${current} to: ${newState}`);
    })
    // env.addChange(1);
  })
})
