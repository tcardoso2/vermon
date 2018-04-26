"use strict"

let ent = require("./Entities.js");
//let ext = require("./Extensions.js");
let utils = require('./utils.js');
let log = utils.log;

//internal
let environment;
let notifiers = [];

/**
 * Gets the object which represents the current Environment of the context.
 * @returns a Environment object.
 * @public
 */
function GetEnvironment()
{
  return environment; 
}

/**
 * Sets the object which represents the current Environment of the context.
 * @param {object} env is the Environemnt object to set.
 * @public
 */
function SetEnvironment(env)
{
  environment = env;
}

/**
 * Gets the object which represents the current Notifiers of the context.
 * @returns an Array of Notifier objects.
 * @public
 */
function GetNotifiers()
{
  return notifiers; 
}


/**
 * Sets the object which represents the current Notifiers of the context.
 * @param {object} env is the array of notifiers.
 * @public
 */
function SetNotifiers(n)
{
  notifiers = n;
}
/**
 * Adds a detector to an existing SubEnvironment by name. Assumes that the main Environment is a MultiEnvironment.
 * @param {object} detector is the MotionDetector object to add.
 * @param {boolean} force can be set to true to push the detector even if not of {MotionDetector} instance
 * @param {string} subEnvironment is the Environment name to add  to, within the MultiEnvironment
 * @returns {Boolean} true if the detector is successfully created.
 * @public
 */
function AddDetectorToSubEnvironmentOnlyByName(detector, force = false, subEnvironmentName){
  if (subEnvironmentName)
  {
    if (GetEnvironment() && ent.IsInstanceOf(GetEnvironment(), "MultiEnvironment")){
      let subEnv = GetEnvironment().getCurrentState()[subEnvironmentName];
      if (subEnv instanceof ent.Environment){
        log.info(`Binding detector to sub-environment ${subEnv.constructor.name}:${subEnv.name}...`);
        subEnv.bindDetector(detector, notifiers, force);
        detector.startMonitoring();
        return true;
      } else {
        throw new Error("Sub-Environment is not valid.");
      }
    } else {
      throw new Error("No MultiEnvironment exists, please add one first.");
    }
  } else {
    log.warning(`Sub-Environment ${subEnvironmentName} object is not of type Environment, ignoring...`);
  }
  return false;
}

function AddDetectorToSubEnvironmentOnly(detector, force = false, subEnvironment){
  return;
  if (subEnvironmentName)
  {
    if (GetEnvironment() && ent.IsInstanceOf(GetEnvironment(), "MultiEnvironment")){
      let subEnv = GetEnvironment().getCurrentState()[subEnvironmentName];
      if (subEnv instanceof ent.Environment){
        log.info(`Binding detector to sub-environment ${subEnv.constructor.name}:${subEnv.name}...`);
        subEnv.bindDetector(detector, notifiers, force);
        detector.startMonitoring();
        return true;
      } else {
        throw new Error("Sub-Environment is not valid.");
      }
    } else {
      throw new Error("No MultiEnvironment exists, please add one first.");
    }
  } else {
    log.warning(`Sub-Environment ${subEnvironmentName} object is not of type Environment, ignoring...`);
  }
  return false;
}

exports.AddDetectorToSubEnvironmentOnly = AddDetectorToSubEnvironmentOnly;
exports.AddDetectorToSubEnvironmentOnlyByName = AddDetectorToSubEnvironmentOnlyByName;
exports.GetEnvironment = GetEnvironment;
exports.SetEnvironment = SetEnvironment;
exports.GetNotifiers = GetNotifiers;
exports.SetNotifiers = SetNotifiers;