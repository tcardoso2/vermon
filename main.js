//
// T-Motion-Detector:
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

let ent = require("./Entities.js");
let filters = ent.Filters;
let ext = require("./Extensions.js");
let notifiers = [];
let environment;
let motionDetectors = [];
let config;
let fs = require('fs')
  , Log = require('log')
  , log = new Log('debug', fs.createWriteStream('t-motion-detector.' + (new Date().getTime()) + '.log'));
var _ = require('lodash/core');

/**
 * Adds a Filter into the current Detectors in {motionDetectors}. If the filter is not of BaseFilter instance,
 * it fails silently (logs a warning message into the logger) and returns false. If there are no Detectors still
 * returns true.
 * @param {object} filter object to add. This function is internal
 * @internal
 * @returns {Boolean} true if the filters were binded to the existing detectors. 
 */
function _InternalAddFilter(filter = new filters.BaseFilter()){
  if (filter instanceof filters.BaseFilter)
  {
    filter.bindToDetectors(motionDetectors);
    return true;
  } else {
    log.warning("'filter' object is not of type BaseFilter");
  }
  return false;
}

/**
 * Adds an Environment into the current context. The environment needs to be if instance Environment, if not
 * if fails silently, logs the error in the logger and returns false.
 * @param {object} env is the Environment object to add. This function is internal
 * @internal
 * @returns {Boolean} true if the environment is successfully created.
 */
function _InternalAddEnvironment(env = new ent.Environment()){
  if (env instanceof ent.Environment)
  {
    environment = env;
    return true;
  } else {
    log.warning("'environment' object is not of type Environment");
  }
  return false;
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
function AddNotifier(notifier, template, force = false){
  if (force || (notifier instanceof ent.BaseNotifier))
  {
    notifier.bindToDetectors(motionDetectors, template);
    notifiers.push(notifier);
    return true;
  } else {
    log.warning("'notifier' object is not of type BaseNotifier");
  }
  return false;
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
 * @returns {Boolean} true if the detector is successfully created.
 * @public
 */
function AddDetector(detector, force = false){
  if (force || (detector instanceof ent.MotionDetector))
  {
    motionDetectors.push(detector);
    if (environment)
    {
      environment.bindDetector(detector, notifiers);
      detector.startMonitoring();
      return true;
    } else {
      throw new Error("No environment was detected, please add one first.");
    }
  } else {
    log.warning("'detector' object is not of type MotionDetector");
  }
  return false;
}

/**
 * Deactivates an existing detector by name.
 * Fails hard (throws an Error) if a {MotionDetector} with that name is not found at the runtime.
 * @param {string} name is the name of the {MotionDetector} to deactivate.
 * @public
 */
function DeactivateDetector(name)
{
  let d = GetMotionDetector(name);
  if (d) d.deactivate();
  else throw new Error(`Error: cannot find Detector with name '${name}'.`);
}

/**
 * Activates an existing detector by name.
 * Fails hard (throws an Error) if a {MotionDetector} with that name is not found at the runtime.
 * @param {string} name is the name of the {MotionDetector} to deactivate.
 * @public
 */
function ActivateDetector(name)
{
  let d = GetMotionDetector(name);
  if (d) d.activate();
  else throw new Error(`'${name}' does not exist.`);
}

/**
 * Removes an existing notifier from the context.
 * Does not fail if the notifier is not found.
 * @param {object} notifier is the notifier instance to remove.
 * @returns true if the notifier was found (and subsequently removed).
 * @public
 */
function RemoveNotifier(notifier){
  let index = notifiers.indexOf(notifier);
  if (index > -1) {
  	notifiers[index].notify("Removing Notifier...");
  	notifiers.splice(index, 1);
    return true;
  }
  return false;
}

/**
 * Gets the object which represents the current Environment of the context.
 * throws an Error if an environment does not exist in the context.
 * @returns a Environment object.
 * @public
 */
function GetEnvironment()
{
  if (environment == undefined) {
  	throw new Error('Environment does not exist. Please run the Start() function first or one of its overrides.');
  }
  return environment;	
}

/**
 * Gets the notifiers array present in the context.
 * @returns an Array of Notifier objects.
 * @public
 */
function GetNotifiers()
{
  return notifiers;
}

/**
 * Gets the Motion Detectors array present in the context.
 * @returns an Array of MotionDetector objects.
 * @public
 */
function GetMotionDetectors()
{
  return motionDetectors;
}

/**
 * Gets the Motion Detectors with the given name.
 * Will throw an exception if there is no Motion detector with such name.
 * @param {string} name is the name of the MotionDetector instance to get.
 * @returns a MotionDetector objects.
 * @public
 */
function GetMotionDetector(name)
{
  //It's assumed the number of motion detectors will be sufficiently small to be ok to iterate without major loss of efficiency
  return _.filter(motionDetectors, x => x.name === name)[0];
  //Another alternative way: lodash.filter(motionDetectors, { 'name': 'Something' } );
}

/**
 * @func:
 * @example:
 * @public
*/
function GetFilters()
{
  let result = [];
  for (let i in motionDetectors)
  {
    result = result.concat(motionDetectors[i].filters);
  }
  return result;
}

/**
 * @func:
 * @example:
 * @public
*/
function Reset()
{
  notifiers = [];
  environment = undefined;
  motionDetectors = [];
}

/**
 * @func: Will start the motion detector
 * @example:
 * @public
*/
function Start(params, silent = false){
  log.info("Starting t-motion-detector with parameters...");
  //Sets the parameters first if they exist
  if (params){
    if (params.environment){
      environment = params.environment;
    }
    else
    {
      _InternalAddEnvironment();
    }
  	if (params.initialMotionDetector){
      AddDetector(params.initialMotionDetector);
  	}
    if (params.initialNotifier){
      AddNotifier(params.initialNotifier);
    }
  }

  //Will set a default Environment if does not exist;
  if(!environment){
    _InternalAddEnvironment();
  	//environment = new ent.Environment();
  }

  if (!silent)
  {
    log.info("Notifying detector is starting...");
    //Pushes message to all notifiers
    for (n in notifiers){
      notifiers[n].notify("Started");
    }
  }
  log.info("ready.");
}

/**
 * @func: Will start the motion detector based on the existing configuration
 * @example:
 * @public
*/
function StartWithConfig(configParams, callback){
  log.info("Starting t-motion-detector with config parameters...");
  //Sets the parameters first if they exist
  if (!configParams 
    || !(configParams instanceof Config))
  {
    throw new Error("Requires a Config type object as first argument.");
  }
  //Should now instanciate the objects if they exist in the default profile
  config = configParams;
  let profileObj = config.profile();

  //Iterates all items given in the config file
  //It is only supposed to add if the object is of the expected type
  let factory = new ent.EntitiesFactory();
  for(let p in profileObj)
  {
    if (profileObj.hasOwnProperty(p)) {

      if (!factory.isReserved(p))
      {
        //We always assume that if the object found is an array then it is an array of objects instead
        if (Array.isArray(profileObj[p])){
          console.log("Object provided in config is an array, instanciating each object...");
          for (let i in profileObj[p])
          {
            //instanciates each object
            _AddInstance(factory, p, profileObj[p][i]);
          }
        }
        else{
          //Single instance (not an array), ok instanciate directly
          _AddInstance(factory, p, profileObj[p]);
        }
      }
    }
  }
  log.info("ready. returning to callback...");
  if (callback) callback();
}

//Internal function, given a factory, class name and arguments, instanciates it
function _AddInstance(f, p, args){
  console.log(`Creating entity "${p}" with args ${args}...`);
  let o = f.instanciate(p, args);
  //The way this is written, forces the environment to be created first
  if(!_InternalAddEnvironment(o)){
    if (!AddNotifier(o)){
      if(!AddDetector(o)){
        if(!_InternalAddFilter(o)){
          console.warn(`Object/class '${p}' could not be added. Proceeding.`)
        }
      }
    }
  }  
}

/**
 * A generic base class which creates a motion detector for surrounding environments \n
 * Collaborator: Environment
 * @param {String} profile is the path of the config file to use
 * @example     let alternativeConfig = new main.Config("config_test1.js");
 * @returns {Object} the config object itself
 */
class Config {

  constructor(profile)
  {
    //config.js must always exist
    this.fallback = require('./config.js');
    this.fileNotFound = false;
    if (!profile)
    {
      this.mapToFile('local.js');
    } else {
      let myProfile = {};
      if (typeof profile == "string") {
        this.mapToFile(profile);
      }
      else {
        if (profile.hasOwnProperty('default')){
          //I consider the object is actually a set of profiles, being "default" the active one
          myProfile = profile;
        }
        else {
          if (Array.isArray(profile)) {
            //I assume this is an Array of profiles, and it is the caller's responsibility to set
            //one of them with the property active = true
            for (let i = 0; i < profile.length; ++i) {
              if (profile[i].hasOwnProperty("active") && profile[i].active) {
                myProfile["default"] = profile[i];
              }
              else {
                myProfile["profile"+i] = profile[i];
              }
            }
          }
          else
          {
            //Just one profile as argument so that will be the default profile
            myProfile = { default: profile };
          }
        }
        this.file = { profiles: myProfile };
      }
    }
  }
  /*
   * For convenience this was added to be sure we can test what is the
   * current working directory of the application
   */
  cwd()
  {
    return process.cwd() + '/';
  }

  mapToFile(file_name, prepend_cwd = true)
  {
    try{
      this.file = require(prepend_cwd ? this.cwd() + file_name : file_name);
      this.fileNotFound = false;
      log.info(`Loaded ${file_name}`);
    } catch (e)
    {
      console.log(`Warning:'${e.message}', will fallback to config file...`);
      this.file = this.fallback;
      this.fileNotFound = true;
    }
  }
  
  isFallback()
  {
    return this.fileNotFound;
  }

  profile(name){
    if (name)
    {
      if(this.file.profiles[name]){
        return this.file.profiles[name];
      } else {
        //TODO: Use ES6 string concatenations here
        throw new Error(`'${name}' was not found in the local.js file.`);
      }
    }
    else{
      //fallsback to default hook
      return this.file.profiles["default"];
    }    
  }

  getProperty(profile_name, prop){
    //searches first in the file
    let file_val = this.profile(profile_name)[prop];
    let fallback_val = this.fallback.profiles[profile_name] ? this.fallback.profiles[profile_name][prop] : this.fallback.default[prop];
    return file_val ? file_val : fallback_val; 
  }

  slackHook(profile_name){
    return this.profile(profile_name).slack.hook;
  }
  
  slackAuth(profile_name){
    return this.profile(profile_name).slack.auth;
  }
  
  //TODO: Needs a better design, if keep adding extensions, I should not 
  //have to add additional methods here for each of the new extensions?
  raspistillOptions(profile_name){
    return this.getProperty(profile_name, "raspistill").options;
  }

  toString()
  {
    return this.file;
  }
}

exports.AddNotifier = AddNotifier;
exports.AddDetector = AddDetector;
exports.ActivateDetector = ActivateDetector;
exports.DeactivateDetector = DeactivateDetector;
exports.RemoveNotifier = RemoveNotifier;
exports.GetEnvironment = GetEnvironment;
exports.GetFilters = GetFilters;
exports.GetNotifiers = GetNotifiers;
exports.GetMotionDetectors = GetMotionDetectors;
exports.GetMotionDetector = GetMotionDetector;
exports.Reset = Reset;
/**
 * Exposes the Entities accessible
 */
exports.Entities = ent;
/**
 * Exposes the Extensions accessible
 */
exports.Extensions = ext;
/**
 * Exposes the Filters accessible
 */
exports.Filters = filters;
exports.Start = Start;
exports.StartWithConfig = StartWithConfig;
exports.Config = Config;
exports.Log = log;
