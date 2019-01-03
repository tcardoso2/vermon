let vermon = require('./vermon')
let fs = require('fs')
let entities = vermon.Entities
let logger = vermon.logger
let chai = require('chai')
let should = chai.should()
let defaultConfig = require('../../config.js')

let errors = require('../../Errors')

before(function (done) {
  done()
})

after(function (done) {
  // here you can clear fixtures, etc.
  done()
})

describe('Basic new syntax, ', function () {
  describe('configure ', function () {
    it('configure (needs to be done before starting vermon)', function () {
      vermon.setLogLevel('info')
      vermon.configure()
      // No errors should happen
    })

    it('configure: If no custom config parameters are passed, the configured profile will fallback to default, which is whatever you have on the root config.js file', function () {
      vermon.reset()
      vermon.configure()
      vermon.profile().should.be.eql(defaultConfig.default)
    })

    it('configure: Can take a Config object as first parameter', function () {
      vermon.reset()
      vermon.configure(new vermon.Config())
      vermon.profile().should.be.eql(defaultConfig.default)
    })

    it('configure: Can take a string of the path for the config as first parameter', function () {
      vermon.reset()
      vermon.configure('test/config_test4.js')
      let testConfig4 = require('../config_test4.js')
      vermon.profile().should.be.eql(testConfig4.default)
    })
  });

  describe('watch ', function () {
    it('watch: (replacer for former StartWithConfig)', function (done) {
      vermon.reset()
      vermon.configure()
      vermon.watch().then((environment) => {
  	  	logger.info(`Watching environment ${environment.name}.`)
  	  	done()
      }).catch((e) => {
  	  	should.fail()
      })
    })

    it('watch: No longer requires config as first argument, if configure is run before', function () {
      vermon.reset()
      vermon.configure()
      vermon.watch().then((environment, detectors) => {
        logger.info(`Watching environment ${environment.name}, currently detecting:`)
        for (let d in detectors) {
          logger.info(d.name)
        }
      }).catch((e) => {
  	  	should.fail()
      })
    })

    it('watch: returns an error promise if error happens', function (done) {
      // Cleanup, start fresh
      vermon.reset()
      vermon.watch().then((environment, detectors) => {
  	  	logger.info(`Watching environment ${environment.name}, currently detecting:`)
      }).catch((e) => {
  	  	logger.warn(`Some error happened: ${e}, ignoring...`)
  	  	e.name.should.equal('MissingConfigError')
  	  	done()
      })
    })

    it('watch: returns an error promise if error happens', function (done) {
      // Cleanup, start fresh
      vermon.reset()
      vermon.watch().then((environment, detectors) => {
  	  	logger.info(`Watching environment ${environment.name}, currently detecting:`)
      }).catch((e) => {
  	  	logger.warn(`Some error happened: ${e}, ignoring...`)
  	  	e.name.should.equal('MissingConfigError')
  	  	done()
      })
    })
  });

  describe('save ', function () {
    it('save: (replacer for former SaveAllToConfig)', function (done) {
      vermon.reset()
      vermon.configure('test/config_test4.js')
      vermon.watch().then((environment, detectors) => {
        vermon.save('./test/vermon/config._example.js', (status, message) => {
          // Check file exists
          if (fs.existsSync('./test/vermon/config._example.js')) {
          } else {
            should.fail()
          }
          status.should.equal(0)
          done()
        }, true)
      })
    })
  })

  describe('instanciate ', function () {
    it('instanciate: (replacer for former _AddInstance which was internal function, now is public)', function (done) {
      vermon.reset()
      let factory = new entities.EntitiesFactory()
      vermon.instanciate(factory, 'Environment', {})
      vermon.save('./test/vermon/config._example1.js', (status, message) => {
        // Check file exists
        if (fs.existsSync('./test/vermon/config._example1.js')) {
        } else {
          should.fail()
        }
        status.should.equal(0)
        done()
      }, true)
    })
  })
  
  describe('force ', function () {
    xit('force: allows setting globaly that any type of Detector is allowed regardless of object type', function (done) {
      vermon.reset()
      vermon.configure('test/config_test4.js')
      vermon.use();
    })
  });

  describe('use ', function () {
    xit('use: (replacer for former PluginManager.AddPlugin), takes a library as arg', function (done) {
      vermon.reset()
      vermon.configure('test/config_test4.js')
      vermon.use();
    })

    xit('use: adds library methods and entitites to vermon', function (done) {
      vermon.reset()
      vermon.configure('test/config_test4.js')
      vermon.use();
    })
  })
})
