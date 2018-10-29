/*****************************************************
 * Internal tests
 * What are internal tests?
 * As this is a npm package, it should be tested from
 * a package context, so I'll use "interal" preffix
 * for tests which are NOT using the npm tarball pack
 * For all others, the test should obviously include
 * something like:
 * let md = require('vermon');
 *****************************************************/

let chai = require('chai')
let chaiAsPromised = require('chai-as-promised')
let should = chai.should()
let fs = require('fs')
let ent = require('../Entities.js')
let ext = require('../Extensions.js')
let main = require('../main.js')
let events = require('events')
// Chai will use promises for async events
chai.use(chaiAsPromised)

before(function (done) {
  done()
})

after(function (done) {
  // here you can clear fixtures, etc.
  if (fs.existsSync('./_local.js')) {
    // fs.rename('./_local.js', './local.js', function (err) {
    // Nothing I can do here
    // if (err) throw err;
    // });
  }
  main.Reset()
  done()
})

describe('When a new Slack Notifier is created, ', function () {
  it('should throw an Exception if no hook is provided', function () {
    // Assumes there is some local file with the key
    try {
      let n = new ext.SlackNotifier()
    } catch (e) {
      e.message.should.equal("'key' is a required argument, which should contain the Slack hook URL.")
    }
  })

  it('should detect the slack config key property', function () {
    // Assumes there is some local file with the key
    let key = new main.Config().slackHook()
    let n = new ext.SlackNotifier('My Slack Notifier', key)
    n.key.should.equal(key)
  })

  it('should check if a local file exists', function () {
    let local_config = new main.Config()
    local_config.should.not.equal(undefined)
  })

  it('should detect the slack config properties from the local config file (default profile)', function () {
    // Assumes there is some local file with the key
    let key = new main.Config().slackHook()
    let n = new ext.SlackNotifier('My slack notifier', key)
    let local_config = new main.Config().profile()
    n.key.should.equal(local_config.slack.hook)
  })

  it('should detect the slack config properties from the default profile equal the fallback', function () {
    // Assumes there is some local file with the key
    let key = new main.Config().slackHook()
    let key_default = new main.Config().slackHook('default')
    key.should.equal(key_default)
  })

  it('should raise an Error if no key is found for an inexisting profile', function () {
    try {
      let key = new main.Config().slackHook('some_inexisting_profile')
    } catch (e) {
      e.message.should.equal("'some_inexisting_profile' was not found in the local.js file.")
    }
  })

  it('should be able to send a message successfully', function (done) {
    this.timeout(10000)
    let key = new main.Config().slackHook()
    let n = new ext.SlackNotifier('My Slack notifier', key)
    n.on('pushedNotification', function (message, text) {
      // console.log("A new notification was pushed!", message, text);
      chai.assert.isOk('Everything is ok')
      done()
    })
    // Force a notification
    n.notify('Hello!')
  })
})

describe('When a new Environment with a Slack Notifier is created, ', function () {
  it('should push a Slack notification', function (done) {
    // Assumes there is some local file with the key
    this.timeout(6000)
    let env = new ent.Environment()
    let detector = new ent.MotionDetector()
    detector.name = 'Mock_detector'
    let key = new main.Config().slackHook()
    let notifier = new ext.SlackNotifier('My Slack Notifier', key)
    let notified = false
    notifier.on('pushedNotification', function (name, text) {
      chai.assert.isOk('notified')
      if (!notified) {
        notified = true
        // console.log(`Got a notification from ${name}: ${text}`);
        done()
      }
    })
    detector.on('hasDetected', function (current, newState, d) {
      chai.assert.isOk('detected')
      // console.log(`Detector detected signal from ${current} to: ${newState}`);
    })

    main.Start({
      environment: env,
      initialMotionDetector: detector
    }, true)
    main.AddNotifier(notifier, `Received notification from: ${detector.name}`)
    env.addChange(1)
  })

  it('the pushedNotification event should receive the source detector as parameter, and notifier name and notification text', function (done) {
    // Prepare
    let n0 = new ent.BaseNotifier()
    let e0 = new ent.Environment()
    let m0 = new ent.MotionDetector()
    let detected = false
    n0.on('pushedNotification', function (notifierName, text, source) {
      if ((text != 'Started') && !detected) {
        detected = true
        notifierName.should.equal('Default Base Notifier')
        text.should.equal("'Default Base Notifier' received Notification received from: 'unnamed detector.'")
        source.detector.name.should.equal('unnamed detector.')
        done()
      }
    })

    let result = false
    main.Start({
      environment: e0,
      initialNotifier: n0,
      initialMotionDetector: m0
    })

    e0.addChange(10)
  })
})
