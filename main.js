//
// VerMon:
// Main module, containing the functions exposed by the API (See footer exports.xxx definitions).
// Allows configuring, starting, adding/Removing an Environment, Motion Detectors and Notifiers
// to the context.
// @Collaborators:
// - Entities.js: Defines all the Environment, Detectors and Notifier base classes;
// - Extensions.js Extends the Entities classes into specialized ones, for instance, FileDetector;
// - Filters.js: Defines the Detector Filters which can be used in the API (e.g. LowPassFilter, etc.)
// - config.js: Strictly a static configuration (mostly JSON) file. Meant to keep static configuration,
//              used mostly for initialization of the main program.
// For more details see the documentation on those files
// @author: Tiago Cardoso
//

// Simple commandline or terminal interface to allow
// you to run cli or bash style commands as if you
// were in the terminal. Do not mistake with node-cmd,
// which allows the current script to be run as a command
let cli = require('commander')
let cmd = require('node-cmd')
let core = require('vermon-core-entities')
let ent = core.entities
let ext = core.extensions
let filters = core.filters
let utils = core.utils
let em = core.em
let motionDetectors = [] //Attention! motionDetectors acts as a Singleton!!
let config
let fs = require('fs')
let _ = require('lodash/core')
let chalk = require('chalk')
let pm = require('./PluginManager')
let errors = require('./Errors.js')
var log = core.utils.setLevel('warn')


/**
 * If true will add Detectors regardless of their type. Override it with force(bool) function
 */
let _globalForceAdds = false

/**
 * Adds a Filter into the current Detectors in {motionDetectors}. If the filter is not of BaseFilter instance,
 * it fails silently (logs a warning message into the logger) and returns false. If there are no Detectors still
 * returns true.
 * @param {object} filter object to add. This function is internal
 * @internal
 * @returns {Boolean} true if the filters were binded to the existing detectors.
 */
function _InternalAddFilter (filter = new filters.BaseFilter()) {
  if (filter instanceof filters.BaseFilter) {
    log.debug("'filter' object is of type BaseFilter, binding to detectors...")
    filter.bindToDetectors(motionDetectors)
    return true
  } else {
    log.warning("'filter' object is not of type BaseFilter")
  }
  return false
}

/**
 * Adds an Environment into the current context. The environment needs to be if instance Environment, if not
 * if fails silently, logs the error in the logger and returns false.
 * @param {object} env is the Environment object to add. This function is internal
 * @internal
 * @returns {Boolean} true if the environment is successfully created.
 */
function _InternalAddEnvironment (env = new ent.Environment()) {
  if (env instanceof ent.Environment) {
    em.SetEnvironment(env)
    return true
  } else {
    log.warning("'environment' object is not of type Environment")
  }
  return false
}

/**
 * Adds a Notifier to the current environment (binds to existing Detectors in {motionDetectors} variable).
 * Checks that the notifier is of {BaseNotifier} instance. Allows to force adding a notifier event if not
 * of the correct type, by setting force = true
 * @param {object} notifier is the Notifier object to add.
 * @param {object} template is the template message for the notifier, in case it triggers.
 * @param {boolean} force can be set to true to push the notifier even if not of {BaseNotifier} instance
 * @returns {Boolean} true if the notifier is successfully created.
 * @public
 */
function AddNotifier (notifier, template, force = false) {
  if (force || (notifier instanceof ent.BaseNotifier)) {
    notifier.bindToDetectors(motionDetectors, template)
    em.GetNotifiers().push(notifier)
    return true
  } else {
    log.warning("'notifier' object is not of type BaseNotifier")
  }
  return false
}

/**
 * Adds a Notifier to the sub-environment (binds to existing Detectors in the sub-environment).
 * Checks that the notifier is of {BaseNotifier} instance. Allows to force adding a notifier event if not
 * of the correct type, by setting force = true
 * @param {object} notifier is the Notifier object to add.
 * @param {object} template is the template message for the notifier, in case it triggers.
 * @param {boolean} force can be set to true to push the notifier even if not of {BaseNotifier} instance
 * @returns {Boolean} true if the notifier is successfully created.
 * @public
 */
function AddNotifierToSubEnvironment (notifier, subEnvironmentName, template, force = false) {
  log.info(`Attempting to bind ${notifier.name} to sub-environment ${subEnvironmentName}...`)
  if (force || (notifier instanceof ent.BaseNotifier)) {
    let subEnv = GetSubEnvironment(subEnvironmentName)
    notifier.bindToDetectors(subEnv.motionDetectors, template)
    em.GetNotifiers().push(notifier)
    return true
  } else {
    log.warning("'notifier' object is not of type BaseNotifier")
  }
  return false
}

/**
 * Adds a detector or detectors (in form of array) to the {Environment} in the {motionDetectors}
 * internal variable.
 * Checks that the notifier is of {BaseNotifier} instance. Allows to force adding a notifier event if not
 * of the correct type, by setting force = true.
 * Fails silently (returns false) if the detector is not of {MotionDetector} type, and logs the occurence.
 * Fails hard (throws an Error) if there is no existing {Environment} set in the context at the runtime.
 * @param {object} detector is the MotionDetector object to add.
 * @param {boolean} force can be set to true to push the detector even if not of {MotionDetector} instance
 * @param {string} subEnvironmentName is the name of a Sub-Environment existing instance
 * @returns {Boolean} true if the detector is successfully created.
 * @public
 */
function AddDetector (detector, force = false, subEnvironmentName) {
  log.info(`Attempting to add detector ${detector.name} with force=${force}...`)
  if (force || (detector instanceof ent.MotionDetector)) {
    log.info(`Pushing detector "${detector.name}"" to main...`)
    motionDetectors.push(detector)
    if (AddDetectorToSubEnvironmentOnly(detector, force, subEnvironmentName)) {
      return true
    } else {
      if (em.GetEnvironment()) {
        log.info(`Binding detector to environment ${em.GetEnvironment().constructor.name}...`)
        em.GetEnvironment().bindDetector(detector, em.GetNotifiers(), force)
        detector.startMonitoring()
        return true
      } else {
        throw new Error('No environment was detected, please add one first.')
      }
    }
  } else {
    log.warning(`${detector} object is not of type MotionDetector`)
  }
  return false
}

/**
 * Adds a detector to a SubEnvironment. Assumes that the main Environment is a MultiEnvironment.
 * @param {object} detector is the MotionDetector object to add.
 * @param {boolean} force can be set to true to push the detector even if not of {MotionDetector} instance
 * @param {string} subEnvironment is the Environment to add  to, within the MultiEnvironment
 * @returns {Boolean} true if the detector is successfully created.
 * @public
 */
function AddDetectorToSubEnvironmentOnly (detector, force = false, subEnvironment) {
  return em.AddDetectorToSubEnvironmentOnly(detector, force, subEnvironment)
}

/**
 * Deactivates an existing detector by name.
 * Fails hard (throws an Error) if a {MotionDetector} with that name is not found at the runtime.
 * @param {string} name is the name of the {MotionDetector} to deactivate.
 * @public
 */
function DeactivateDetector (name) {
  let d = GetMotionDetector(name)
  if (d) d.deactivate()
  else throw new Error(`Error: cannot find Detector with name '${name}'.`)
}

/**
 * Activates an existing detector by name.
 * Fails hard (throws an Error) if a {MotionDetector} with that name is not found at the runtime.
 * @param {string} name is the name of the {MotionDetector} to deactivate.
 * @public
 */
function ActivateDetector (name) {
  let d = GetMotionDetector(name)
  if (d) d.activate()
  else throw new Error(`'${name}' does not exist.`)
}

/**
 * Removes an existing notifier from the context.
 * Does not fail if the notifier is not found.
 * @param {object} notifier is the notifier instance to remove.
 * @param {booleal} sileng states if = true the removal should not send a notification
 * @returns true if the notifier was found (and subsequently removed).
 * @public
 */
function RemoveNotifier (notifier, silent = false) {
  let index = em.GetNotifiers().indexOf(notifier)
  log.info('Removing Notifier...')
  if (index > -1) {
    if (!silent) {
      em.GetNotifiers()[index].notify('Removing Notifier...')
    }
    em.GetNotifiers().splice(index, 1)
    return true
  } else {
    log.info(chalk.yellow(`Notifier ${notifier} not found, ignoring and returning false...`))
  }
  return false
}

/**
 * Removes an existing MotionDetector from the context, including its event listeners.
 * Does not fail if the detector is not found.
 * @param {object} detector is the MotionDetector instance to remove.
 * @returns true if the detector was found (and subsequently removed).
 * @public
 */
function RemoveDetector (detector) {
  let index = motionDetectors.indexOf(detector)
  log.info('Removing Detector...')
  if (index > -1) {
    em.GetEnvironment().unbindDetector(detector)
    motionDetectors.splice(index, 1)
    // Redundant: Motion detectors are also copied to environment!
    em.GetEnvironment().motionDetectors.splice(index, 1)
    return true
  } else {
    log.info(chalk.yellow(`Detector ${detector} not found, ignoring and returning false...`))
  }
  return false
}

/**
 * Gets the object which represents the current Environment of the context.
 * throws an Error if an environment does not exist in the context.
 * @returns a Environment object.
 * @public
 */
function GetEnvironment () {
  if (em.GetEnvironment() === undefined) {
    throw new Error('Environment does not exist. Please run the Start() function first or one of its overrides.')
  }
  return em.GetEnvironment()
}

/**
 * Gets the object which represents the current sub-Environments of the context.
 * throws an Error if MultiEnvironment does not exist in the context.
 * @returns a list of Environment object.
 * @public
 */
function GetSubEnvironments () {
  let e = GetEnvironment()

  if (!(e instanceof ext.MultiEnvironment)) {
    throw new Error('MultiEnvironment was not found')
  }
  return e.getCurrentState()
}

/**
 * Gets a particular sub-Environments of the context, raises error if it's not of type Environment.
 * @returns Environment object.
 * @public
 */
function GetSubEnvironment (subEnvironmentName) {
  let e = GetSubEnvironments()[subEnvironmentName]
  if (!e) {
    throw new Error('SubEnvironment does not exist.')
  }
  if (!(e instanceof ent.Environment)) {
    throw new Error('SubEnvironment is invalid.')
  }
  return e
}

/**
 * Gets the notifiers array present in the context.
 * @returns an Array of Notifier objects.
 * @public
 */
function GetNotifiers () {
  return em.GetNotifiers()
}

/**
 * Gets the Motion Detectors array present in the context.
 * @returns an Array of MotionDetector objects.
 * Attention! motion detectors is a singleton!
 * @public
 */
function GetMotionDetectors () {
  console.log("Attention! this function GetMotionDetectors returns a singleton of motion detectors! If you are running several instances only one instance prevails!");
  log.debug(`Getting ${motionDetectors.length} detectors...`)
  return motionDetectors
}

/**
 * Gets the Motion Detectors with the given name.
 * Will throw an exception if there is no Motion detector with such name.
 * @param {string} name is the name of the MotionDetector instance to get.
 * @returns a MotionDetector objects.
 * Attention! motion detectors is a singleton!
 * @public
 */
function GetMotionDetector (name) {
  // It's assumed the number of motion detectors will be sufficiently small to be ok to iterate without major loss of efficiency
  console.log("Attention! this function GetMotionDetectors returns a singleton of motion detectors! If you are running several instances only one instance prevails!");
  return _.filter(motionDetectors, x => x.name === name)[0]
  // Another alternative way: lodash.filter(motionDetectors, { 'name': 'Something' } );
}

/**
 * Gets all the existing Filters present in the current context.
 * @returns {object} an Array of Filter objects.
 * @public
 */
function GetFilters () {
  let result = []
  log.debug(`Fetching filters in the existing ${motionDetectors.length} detector(s)...`)
  for (let i in motionDetectors) {
    result = result.concat(motionDetectors[i].filters)
  }
  log.debug(`Getting ${result.length} filters...`)
  return result
}

/**
 * Resets the current context environment, notifiers and motion detectors.
 * @public
 */
function Reset () {
  log.info('Reseting environment...')
  for (let m in motionDetectors) {
    RemoveDetector(motionDetectors[m])
  }
  for (let n in em.GetNotifiers()) {
    RemoveNotifier(em.GetNotifiers()[n], true)
  }
  em.SetNotifiers([])
  if (em.GetEnvironment()) {
    em.GetEnvironment().removeAllListeners('changedState')
    em.GetEnvironment().exit()
    em.SetEnvironment(undefined)
  }
  motionDetectors = []
  Object.keys(pm.GetPlugins()).forEach(function (key) {
    let p = pm.GetPlugins()[key]
    console.log(`  Attempting to reset plugin ${p.id} with key ${key}...`)
    if (p.Reset) {
      p.Reset()
      log.info('ok.')
    }
  })
  pm.ResetPlugins()
  config = {}
  log.info('Done Reseting environment.')
}

/**
 * Starts the current environment given a set of parameters (Old way of starting - it is preferrable)
 * to use {StartWithConfig} instead.
 * @param {object} params is a parameters object, any object which contains the following attributes: \n
 * (1) an "environment" attribute with the {Environment} object to set; \n
 * (2) an "initialMotionDetector" attribute with one {MotionDetector} object to set (does not allow several motion detectors); \n
 * (3) an "initialNotifier" attribute with the {Notifier} object to set (does not allow several notifiers); \n
 * @param {string} silent if set to true will not send an initial notification to notifiers when starting up (by default is set to false).
 * @public
 */
function Start (params, silent = false) {
  log.info('Starting vermon with parameters...')
  // Sets the parameters first if they exist
  if (params) {
    if (params.environment) {
      em.SetEnvironment(params.environment)
    } else {
      _InternalAddEnvironment()
    }
    if (params.initialMotionDetector) {
      AddDetector(params.initialMotionDetector)
    }
    if (params.initialNotifier) {
      AddNotifier(params.initialNotifier)
    }
  }

  // Will set a default Environment if does not exist;
  if (!em.GetEnvironment()) {
    _InternalAddEnvironment()
    // em.GetEnvironment() = new ent.Environment();
  }

  if (!silent) {
    log.info('Notifying detector is starting...')
    // Pushes message to all notifiers
    for (n in em.GetNotifiers()) {
      em.GetNotifiers()[n].notify('Started')
    }
  }
  log.info('ready.')
}
/**
 * Internal function which Starts all the Plugins, ran when StartWithConfir is called.
 * Throws an Error if any of the plugins does not implement the "Start" method.
 * @param {e} The current Environment.
 * @param {m} The current MotionDetectors.
 * @param {n} The current Notifiers.
 * @param {f} The current Filters.
 */
function _StartPlugins (e, m, n, f) {
  log.info(`Checking if any plugin exists which should be started...`)
  let plugins = pm.GetPlugins()
  Object.keys(plugins).forEach(function (key) {
    let p = plugins[key]
    log.info(`  Plugin found. Checking plugin signature methods ShouldStart and Start for plugin ${key}...`)
    if (!p.ShouldStart) throw new Error("A plugin must have a 'ShouldStart' method implemented.")
    if (!p.Start) throw new Error("A plugin must have a 'Start' method implemented.")
    // TODO, add a way to call StartWithConfig
    log.info('  Checking if plugin should start...')
    if (p.ShouldStart(e, m, n, f, config)) {
      log.info('Plugin should start = true. Starting plugin...')
      p.Start(e, m, n, f, config)
    } else {
      log.info('Plugin will not start because returned false when asked if it should start.')
    }
    console.log('ok.')
  })
}

/**
 * Starts the current environment based on existing configuration. Use this method instead of {Start}.
 * If there are any plugins added to the environment, it calls their respective "Start" functions as well.
 * In the end executes a callback.
 * @param {Config} configParams a parameter object of the {Config} instance.
 * @param {Function} callback is a function which will be called after all initialization is done.\n
 * args passed to that callback function, are: Environment, MotionDetectors, Notifiers and Filters objects.
 * The correct way of initializing the program is by puting the main code inside that callback.
 * @example let myConfig = new main.Config("/test/config_test6.js");
    main.StartWithConfig(myConfig, (e,d,n,f)=>{
      n[0].on('pushedNotification', function(message, text, data){
        console.log("Some Notification happened!");
      });
      e.addChange(9); //Some change introduced
    });
 * @public
 * @deprecated Use "watch instead"
 */
function StartWithConfig (configParams, callback) {
  log.info('Starting vermon with config parameters...')

  if (configParams) {
    configure(configParams)
  }

  // Iterates all items given in the config file
  // It is only supposed to add if the object is of the expected type
  let factory = new ent.EntitiesFactory()
  for (let p in profile()) {
    if (profile().hasOwnProperty(p)) {
      // Will ignore reserved keywords
      if (!factory.isReserved(p)) {
        // We always assume that if the object found is an array then it is an array of objects instead
        if (Array.isArray(profile()[p])) {
          log.info('Object provided in config is an array, instanciating each object...')
          for (let i in profile()[p]) {
            // instanciates each object
            _AddInstance(factory, p, profile()[p][i])
          }
        } else {
          // Single instance (not an array), ok instanciate directly
          _AddInstance(factory, p, profile()[p])
        }
      }
    }
  }
  let _filters = GetFilters()
  _StartPlugins(em.GetEnvironment(), GetMotionDetectors(), GetNotifiers(), _filters)

  log.info('ready. returning to callback...')
  if (callback) {
    callback(GetEnvironment(), GetMotionDetectors(), GetNotifiers(), _filters)
  } else {
    log.warn('No callback was provided, ignoring...')
  }
}

function watch () {
  return new Promise((resolve, reject) => {
    try {
      StartWithConfig(undefined, (e, m, n, f) => {
        resolve({ environment: e, detectors: m, notifiers: n, filters: f })
      })
    } catch (e) {
      reject(e)
    }
  })
}

function force (forceAdds) {
  _globalForceAdds = forceAdds
}

function configure (configParams = new Config()) {
  log.info('Configuring vermon...')

  if (typeof configParams === 'string') {
    log.info(`Received a string as first argument will attempt to find and create the config instance ${configParams}...`)
    configParams = new Config(configParams)
  }
  if (!(configParams instanceof Config)) {
    throw new errors.TypeConfigError('vermon.configure() requires a Config type object as first argument.')
  }
  // Should now instanciate the objects if they exist in the default profile, config is a singleton
  config = configParams
  return config.profile()
}

function profile () {
  if (config && config.profile) {
    return config.profile()
  } else {
    throw new errors.MissingConfigError('Config profile is missing. Run vermon.configure() first.')
  }
}

function setLogLevel (level) {
  log = utils.setLevel(level)
}

// Internal function, given a factory, class name and arguments, instanciates it
/**
 * Internal function. Given a factory and an entity name (One of {Environment},
 * {MotionDetector}, {Notifier}, or {Filter}) and arguments adds this instance
 * to the current context
 * @param {object} f is the factory instance.
 * @param {object} p is an object name to instanciate.
 * @param {Array} args is an array of arguments for the constructor invoke..
 * @internal
 */
function _AddInstance (f, p, args) {
  log.info(`Creating entity "${p}" with args ${args}...`)
  let o = f.instanciate(p, args)
  // The way this is written, forces the environment to be created first
  if (!_InternalAddEnvironment(o)) {
    log.debug('Object is not of Environment type... checking if is a Notifier')
    if (!AddNotifier(o)) {
      log.debug('Object is not of Notifier type... checking if is a Detector')
      if (!AddDetector(o, config ? config.forceAdds : _globalForceAdds)) {
        log.debug('Object is not of Detector type... checking if is a Filter')
        if (!_InternalAddFilter(o)) {
          log.warn(chalk.yellow(`Object/class '${p}' is not of any type, could not be added. Proceeding.`))
        }
      }
    }
  }
}

/**
 * A generic base class which creates a motion detector for surrounding environments \n
 * Collaborator: Environment
 * @param {String} profile is the path of the config file to use
 * @param {boolean} prependCwd tells if the config class should prepend CWD to the profile path or not
 * @param {boolean} forceAdds if true means that all Entities in config should be added forcibly independent of being of the correct type. Overriden by _globalForceAdds
 *  DISLAIMER: Might not be implemented for all entities but only detectors.
 * @example     let alternativeConfig = new main.Config("config_test1.js");
 * @returns {Object} the config object itself
 */
class Config {
  constructor (profile, prependCwd = true, forceAdds = false) {
    log.info(`Running config with forceAdds = ${forceAdds}`)
    // config.js must always exist
    this.fallback = require('./config.js')
    this.fileNotFound = false
    this.forceAdds = forceAdds || _globalForceAdds //if true, _globalForceAdds overrides this
    if (!profile) {
      this.mapToFile('local.js')
    } else {
      let myProfile = {}
      if (typeof profile === 'string') {
        this.mapToFile(profile, prependCwd)
      } else {
        if (profile.hasOwnProperty('default')) {
          // I consider the object is actually a set of profiles, being "default" the active one
          myProfile = profile
        } else {
          if (Array.isArray(profile)) {
            // I assume this is an Array of profiles, and it is the caller's responsibility to set
            // one of them with the property active = true
            for (let i = 0; i < profile.length; ++i) {
              if (profile[i].hasOwnProperty('active') && profile[i].active) {
                myProfile['default'] = profile[i]
              } else {
                myProfile['profile' + i] = profile[i]
              }
            }
          } else {
            // Just one profile as argument so that will be the default profile
            myProfile = { default: profile }
          }
        }
        this.file = { profiles: myProfile }
      }
    }
  }
  /*
   * For convenience this was added to be sure we can test what is the
   * current working directory of the application
   */
  cwd () {
    return process.cwd() + '/'
  }
  /**
 * TODO:
 */
  mapToFile (fileName, prependCwd = true) {
    try {
      let _f = prependCwd ? this.cwd() + fileName : fileName
      log.info(`Attempting to "require('${_f}')"...`)
      this.file = require(_f)
      this.fileNotFound = false
      log.info(`Loaded ${fileName}`)
    } catch (e) {
      log.info(chalk.yellow(`Warning:'${e.message}', will fallback to config file...`))
      this.file = this.fallback
      this.fileNotFound = true
    }
  }
  /**
 * TODO:
 */
  isFallback () {
    return this.fileNotFound
  }
  /**
 * TODO:
 */
  profile (name) {
    if (name) {
      if (this.file.profiles[name]) {
        return this.file.profiles[name]
      } else {
        // TODO: Use ES6 string concatenations here
        throw new Error(`'${name}' was not found in the local.js file.`)
      }
    } else {
      // fallsback to default hook
      return this.file.profiles['default']
    }
  }
  /**
 * TODO:
 * @returns {String} the
 */
  getProperty (profileName, prop) {
    // searches first in the file
    let fileVal = this.profile(profileName)[prop]
    let fallbackVal = this.fallback.profiles[profileName] ? this.fallback.profiles[profileName][prop] : this.fallback.default[prop]
    return fileVal || fallbackVal
  }
  /**
 * Direct assessor to the slackHook ({SlackMotionDetector}), if that exists on the config file
 * @param {String} profileName, the name of the profile to lookup into (default is "default")
 * @returns {String} the slackhook string
 */
  slackHook (profileName) {
    return this.profile(profileName).slack.hook
  }
  /**
 * Direct assessor to the slackAuth ({SlackMotionDetector}), if that exists on the config file
 * @param {String} profileName, the name of the profile to lookup into (default is "default")
 * @returns {String} profileName, the slackhook string
 */
  slackAuth (profileName) {
    return this.profile(profileName).slack.auth
  }

  // TODO: Needs a better design, if keep adding extensions, I should not
  // have to add additional methods here for each of the new extensions?
  /**
 * TODO:
 */
  raspistillOptions (profileName) {
    return this.getProperty(profileName, 'raspistill').options
  }
  /**
 * Returns the string path of the Config file the current object points to.
 * @returns {String} the string representation, in this case the file record pointing to
 */
  toString () {
    return this.file
  }
}

/**
 * Saves all the Environment, Detector, Notifiers and Filters information into a config file
 * @param {String} src is the path of the config file to use
 * @param {Function} callback is the callback function to call once the Save is all done, it passes
 * status and message as arguments to the function: \m
 * status = 0: Successfully has performed the action.
 * status = 1: Error: File exists already.
 * @param {Boolean} force true if the user wants to overwrite an already existing file.
 */
function SaveAllToConfig (src, callback, force = false) {
  let status = 1
  let message

  let resultError = function (message) {
    message = `Error: ${message}`
    log.error(message)
    callback(1, message)
  }

  let resultWarning = function (message) {
    message = `Warn: ${message}`
    log.warning(message)
    callback(0, message)
  }

  let addConfigDefinitions = function (jsonContent) {
    return jsonContent = 'profiles = ' +
      jsonContent +
      '\nexports.profiles = profiles;' +
      '\nexports.default = profiles.default;'
  }

  if (fs.existsSync(src) && !force) {
    return resultError('File exists, if you want to overwrite it, use the force attribute')
  } else {
    let contents = addConfigDefinitions(_InternalSerializeCurrentContext())
    fs.writeFile(src, contents, function (err) {
      if (err) {
        return resultError(err)
      } else {
        status = 0
        message = 'Success'
      }
      callback(status, message)
    })
  }
}

/**
 * Internal function which serializes the current Context into the format matching the "profile" object
 * of the config file.
 * @returns {object} Returns a "profile" object in JSON.stringify format
 * @internal
 */
function _InternalSerializeCurrentContext () {
  let profile = { default: {} }

  // Separate this function into another utils library.
  let serializeEntity = function (ent) {
    if (ent.constructor.name === 'Array') {
      serializeArray()
    } else {
      profile.default[ent.constructor.name] = ent
    }
  }

  let serializeArray = function (ent) {
    let entityName
    for (let ei in ent) {
      // First, it creates as many entries of the same object as existing and initializes as empty arrays
      if (ent[ei].constructor.name !== entityName) {
        entityName = ent[ei].constructor.name
        profile.default[entityName] = []
      }
    }
    for (let ei in ent) {
      // Then it reiterates again, this time pushing the contents to the correct array record
      profile.default[ent[ei].constructor.name].push(ent[ei])
    }
  }

  serializeEntity(GetEnvironment())
  serializeArray(GetMotionDetectors())
  serializeArray(GetNotifiers())
  serializeArray(GetFilters())

  return utils.JSON.stringify(profile)
}

function use (plugin) {
  return pm.AddPlugin(plugin, module.exports)
}

exports.AddNotifier = AddNotifier
exports.AddNotifierToSubEnvironment = AddNotifierToSubEnvironment
exports.AddDetector = AddDetector
exports.AddDetectorToSubEnvironmentOnly = AddDetectorToSubEnvironmentOnly
exports.ActivateDetector = ActivateDetector
exports.DeactivateDetector = DeactivateDetector
exports.RemoveNotifier = RemoveNotifier
exports.GetEnvironment = GetEnvironment
exports.GetSubEnvironments = GetSubEnvironments
exports.GetFilters = GetFilters
exports.GetNotifiers = GetNotifiers
exports.GetMotionDetectors = GetMotionDetectors
exports.GetMotionDetector = GetMotionDetector
exports.Reset = Reset
/**
 * Exposes the Entities accessible
 */
exports.Entities = ent
/**
 * Exposes the Extensions accessible
 */
exports.Extensions = ext
/**
 * Exposes the command line library (node-cmd) accessible
 */
exports.Cmd = cmd
/**
 * Exposes a CLI tool based on 'commander' node package
 */
exports.Cli = cli
exports.Filters = filters
exports.Start = Start
exports.StartWithConfig = StartWithConfig
exports.SaveAllToConfig = SaveAllToConfig
exports.Config = Config
exports.Log = log
exports.SetTraceLevel = core.utils.setLevel
// Utils
exports.Utils = core.utils
// PluginManager
exports.PluginManager = pm

// New Syntax / Alias replacers of old functions

exports.use = use
exports.configure = configure
exports.profile = profile
exports.watch = watch
exports.reset = Reset
exports.logger = log
exports.force = force
exports.save = SaveAllToConfig
exports.setLogLevel = setLogLevel
exports.instanciate = _AddInstance
