'use strict'

let ent = require('./Entities.js')
// let ext = require("./Extensions.js");
let utils = require('./utils.js')
let log = utils.log

// internal
let environment
let notifiers = []

/**
 * Gets the object which represents the current Environment of the context.
 * @returns a Environment object.
 * @public
 */
function GetEnvironment () {
  log.debug('Getting the environment: ')
  log.debug(environment)
  return environment
}

/**
 * Sets the object which represents the current Environment of the context.
 * @param {object} env is the Environemnt object to set.
 * @public
 */
function SetEnvironment (env) {
  log.debug(`Setting the environment to ${env}...`)
  environment = env
}

/**
 * Gets the object which represents the current Notifiers of the context.
 * @returns an Array of Notifier objects.
 * @public
 */
function GetNotifiers () {
  log.debug(`Getting ${notifiers.length} notifiers...`)
  return notifiers
}

/**
 * Sets the object which represents the current Notifiers of the context.
 * @param {object} env is the array of notifiers.
 * @public
 */
function SetNotifiers (n) {
  log.debug(`Setting the notifiers to ${n}...`)
  notifiers = n
}
/**
 * Adds a detector to an existing SubEnvironment by name. Assumes that the main Environment is a MultiEnvironment.
 * @param {object} detector is the MotionDetector object to add.
 * @param {boolean} force can be set to true to push the detector even if not of {MotionDetector} instance
 * @param {object} subEnvironment is the Environment name to add  to, within the MultiEnvironment, if it is a string
 * the system will search for an existing sub-environment. If it is an actual environment uses that instance.
 * @param {boolean} if false, will not check if there is already an existing MultiEnvironment in the context;
 * @returns {Boolean} true if the detector is successfully created.
 * @public
 */
function AddDetectorToSubEnvironmentOnly (detector, force = false, subEnvironment, checkMulti = true) {
  if (subEnvironment) {
    if (!checkMulti || GetEnvironment() && ent.IsInstanceOf(GetEnvironment(), 'MultiEnvironment')) {
      let subEnv = typeof (subEnvironment) === 'string' ? GetEnvironment().getCurrentState()[subEnvironment] : subEnvironment
      if (subEnv instanceof ent.Environment) {
        log.info(`Binding detector to sub-environment ${subEnv.constructor.name}:${subEnv.name}...`)
        subEnv.bindDetector(detector, notifiers, force)
        detector.startMonitoring()
        return true
      } else {
        throw new Error('Sub-Environment is not valid.')
      }
    } else {
      throw new Error('No MultiEnvironment exists, please add one first.')
    }
  } else {
    log.warning(`Sub-Environment ${subEnvironment} object is not of type Environment, ignoring...`)
  }
  return false
}

exports.AddDetectorToSubEnvironmentOnly = AddDetectorToSubEnvironmentOnly
exports.GetEnvironment = GetEnvironment
exports.SetEnvironment = SetEnvironment
exports.GetNotifiers = GetNotifiers
exports.SetNotifiers = SetNotifiers
