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
let cmd = require("node-cmd");
let cli = require("commander");
let filters = ent.Filters;
let ext = require("./Extensions.js");
let notifiers = [];
let environment;
let motionDetectors = [];
let config;
let ko = require("knockout");
let fs = require('fs')
  , Log = require('log');
var log = require('tracer').colorConsole();//new Log('debug');//, fs.createWriteStream('t-motion-detector.' + (new Date().getTime()) + '.log'));
log.warning = log.warn;
let _ = require('lodash/core');
let chalk = require('chalk');
let plugins = {};


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
 * Adds a Notifier to the sub-environment (binds to existing Detectors in the sub-environment).
 * Checks that the notifier is of {BaseNotifier} instance. Allows to force adding a notifier event if not
 * of the correct type, by setting force = true
 * @param {object} notifier is the Notifier object to add.
 * @param {object} template is the template message for the notifier, in case it triggers.
 * @param {boolean} force can be set to true to push the notifier even if not of {BaseNotifier} instance
 * @returns {Boolean} true if the notifier is successfully created.
 * @public
 */
function AddNotifierToSubEnvironment(notifier, subEnvironmentName, template, force = false){
  log.info(`Attempting to bind ${notifier.name} to sub-environment ${subEnvironmentName}...`)
  if (force || (notifier instanceof ent.BaseNotifier))
  {
    let subEnv = GetSubEnvironment(subEnvironmentName);
    notifier.bindToDetectors(subEnv.motionDetectors, template);
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
function AddDetector(detector, force = false, subEnvironment){
  if (force || (detector instanceof ent.MotionDetector))
  {
    log.info(`Pushing detector "${detector.name}"" to main...`);
    motionDetectors.push(detector);
    if (AddDetectorToSubEnvironmentOnly(detector, force, subEnvironment)){
      return true;
    }
    else {
      if (environment)
      {
        log.info(`Binding detector to environment ${environment.constructor.name}...`);
        environment.bindDetector(detector, notifiers, force);
        detector.startMonitoring();
        return true;
      } else {
        throw new Error("No environment was detected, please add one first.");
      }
    }
  } else {
    log.warning(`${detector} object is not of type MotionDetector`);
  }
  return false;
}

/**
 * Adds a detector to a SubEnvironment. Assumes that the main Environment is a MultiEnvironment.
 * @param {object} detector is the MotionDetector object to add.
 * @param {boolean} force can be set to true to push the detector even if not of {MotionDetector} instance
 * @param {string} subEnvironment is the Environment to add  to, within the MultiEnvironment
 * @returns {Boolean} true if the detector is successfully created.
 * @public
 */
function AddDetectorToSubEnvironmentOnly(detector, force = false, subEnvironmentName){
  if (subEnvironmentName)
  {
    if (environment && environment instanceof ext.MultiEnvironment){
      let subEnv = environment.getCurrentState()[subEnvironmentName];
      if (subEnv instanceof ent.Environment){
        log.info(`Binding detector to sub-environment ${subEnv.constructor.name}...`);
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
 * @param {booleal} sileng states if = true the removal should not send a notification
 * @returns true if the notifier was found (and subsequently removed).
 * @public
 */
function RemoveNotifier(notifier, silent = false){
  let index = notifiers.indexOf(notifier);
  log.info("Removing Notifier...");
  if (index > -1) {
    if(!silent){
      notifiers[index].notify("Removing Notifier...");
    }
    notifiers.splice(index, 1);
    return true;
  } else {
    log.info(chalk.yellow(`Notifier ${notifier} not found, ignoring and returning false...`));
  }
  return false;
}

/**
 * Removes an existing MotionDetector from the context, including its event listeners.
 * Does not fail if the detector is not found.
 * @param {object} detector is the MotionDetector instance to remove.
 * @returns true if the detector was found (and subsequently removed).
 * @public
 */
function RemoveDetector(detector){
  let index = motionDetectors.indexOf(detector);
  log.info("Removing Detector...");
  if (index > -1) {
    environment.unbindDetector(detector);
    motionDetectors.splice(index, 1);
    //Redundant: Motion detectors are also copied to environment!
    environment.motionDetectors.splice(index, 1);
    return true;
  } else {
    log.info(chalk.yellow(`Detector ${detector} not found, ignoring and returning false...`));
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
 * Gets the object which represents the current sub-Environments of the context.
 * throws an Error if MultiEnvironment does not exist in the context.
 * @returns a list of Environment object.
 * @public
 */
function GetSubEnvironments()
{
  let e = GetEnvironment();

  if (!(e instanceof ext.MultiEnvironment)) {
    throw new Error('MultiEnvironment was not found');
  }
  return e.getCurrentState(); 
}

/**
 * Gets a particular sub-Environments of the context, raises error if it's not of type Environment.
 * @returns Environment object.
 * @public
 */
function GetSubEnvironment(subEnvironmentName)
{
  let e = GetSubEnvironments()[subEnvironmentName];
  if(!e){
    throw new Error('SubEnvironment does not exist.');    
  }
  if (!(e instanceof ent.Environment)) {
    throw new Error('SubEnvironment is invalid.');
  }
  return e;
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
 * Gets all the existing Filters present in the current context.
 * @returns {object} an Array of Filter objects.
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
 * Resets the current context environment, notifiers and motion detectors.
 * @public
 */
function Reset()
{
  console.log("Reseting environment...");
  for (let m in motionDetectors){
    RemoveDetector(motionDetectors[m]);
  }
  for (let n in notifiers){
    RemoveNotifier(notifiers[n], true);
  }
  notifiers = [];
  if (environment){
    environment.removeAllListeners('changedState');
    environment.exit();
    environment = undefined;
  }
  motionDetectors = [];
  Object.keys(plugins).forEach(function(key) {
    let p = plugins[key];
    console.log(`  Attempting to reset plugin ${p.id} with key ${key}...`);
    if(p.Reset){
      p.Reset();
      log.info("ok.");     
    }
  });
  plugins = {};
  config = {};
  console.log("Done Reseting environment.");
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
 * Internal function which Starts all the Plugins, ran when StartWithConfir is called.
 * Throws an Error if any of the plugins does not implement the "Start" method.
 * @param {e} The current Environment.
 * @param {m} The current MotionDetectors.
 * @param {n} The current Notifiers.
 * @param {f} The current Filters.
 */
function _StartPlugins(e,m,n,f){
  Object.keys(plugins).forEach(function(key) {
    let p = plugins[key];
    log.info(`  Attempting to start ${p.id}...`);
    if(!p.Start) throw new Error("A plugin must have a 'Start' method implemented.");
    //TODO, add a way to call StartWithConfig
    p.Start(e,m,n,f,config);
    console.log("ok.");
  });
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

      //Will ignore reserved keywords
      if (!factory.isReserved(p))
      {
        //We always assume that if the object found is an array then it is an array of objects instead
        if (Array.isArray(profileObj[p])){
          log.info("Object provided in config is an array, instanciating each object...");
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
  _StartPlugins(environment,GetMotionDetectors(),GetNotifiers(),GetFilters());

  log.info("ready. returning to callback...");
  if (callback) callback(GetEnvironment(), GetMotionDetectors(), GetNotifiers(), GetFilters());
}

//Internal function, given a factory, class name and arguments, instanciates it
/**
 * Internal function. Given a factory and an entity name (One of {Environment}, 
 * {MotionDetector}, {Notifier}, or {Filter}) and arguments adds this instance
 * to the current context
 * @param {object} f is the factory instance.
 * @param {object} p is an object name to instanciate.
 * @param {Array} args is an array of arguments for the constructor invoke..
 * @internal
 */
function _AddInstance(f, p, args){
  log.info(`Creating entity "${p}" with args ${args}...`);
  let o = f.instanciate(p, args);
  //The way this is written, forces the environment to be created first
  if(!_InternalAddEnvironment(o)){
    if (!AddNotifier(o)){
      if(!AddDetector(o, config.forceAdds)){
        if(!_InternalAddFilter(o)){
          log.warn(chalk.yellow(`Object/class '${p}' could not be added. Proceeding.`));
        }
      }
    }
  }  
}

/**
 * A generic base class which creates a motion detector for surrounding environments \n
 * Collaborator: Environment
 * @param {String} profile is the path of the config file to use
 * @param {boolean} prepend_cwd tells if the config class should prepend CWD to the profile path or not
 * @param {boolean} forceAdds if true means that all Entities in config should be added forcibly independent of being of the correct type.
 * @example     let alternativeConfig = new main.Config("config_test1.js");
 * @returns {Object} the config object itself
 */
class Config {

  constructor(profile, prepend_cwd = true, forceAdds = false)
  {
    //config.js must always exist
    this.fallback = require('./config.js');
    this.fileNotFound = false;
    this.forceAdds = forceAdds;
    if (!profile)
    {
      this.mapToFile('local.js');
    } else {
      let myProfile = {};
      if (typeof profile == "string") {
        this.mapToFile(profile, prepend_cwd);
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
/**
 * TODO:
 */
  mapToFile(file_name, prepend_cwd = true)
  {
    try{
      let _f = prepend_cwd ? this.cwd() + file_name : file_name;
      log.info(`Attempting to "require('${_f}')"...`);
      this.file = require(_f);
      this.fileNotFound = false;
      log.info(`Loaded ${file_name}`);
    } catch (e)
    {
      log.info(chalk.yellow(`Warning:'${e.message}', will fallback to config file...`));
      this.file = this.fallback;
      this.fileNotFound = true;
    }
  }
/**
 * TODO:
 */  
  isFallback()
  {
    return this.fileNotFound;
  }
/**
 * TODO:
 */
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
/**
 * TODO:
 * @returns {String} the 
 */
  getProperty(profile_name, prop){
    //searches first in the file
    let file_val = this.profile(profile_name)[prop];
    let fallback_val = this.fallback.profiles[profile_name] ? this.fallback.profiles[profile_name][prop] : this.fallback.default[prop];
    return file_val ? file_val : fallback_val; 
  }
/**
 * Direct assessor to the slackHook ({SlackMotionDetector}), if that exists on the config file
 * @param {String} profile_name, the name of the profile to lookup into (default is "default")
 * @returns {String} the slackhook string
 */
  slackHook(profile_name){
    return this.profile(profile_name).slack.hook;
  }
/**
 * Direct assessor to the slackAuth ({SlackMotionDetector}), if that exists on the config file
 * @param {String} profile_name, the name of the profile to lookup into (default is "default")
 * @returns {String} profile_name, the slackhook string
 */  
  slackAuth(profile_name){
    return this.profile(profile_name).slack.auth;
  }
  
  //TODO: Needs a better design, if keep adding extensions, I should not 
  //have to add additional methods here for each of the new extensions?
/**
 * TODO:
 */
  raspistillOptions(profile_name){
    return this.getProperty(profile_name, "raspistill").options;
  }
/**
 * Returns the string path of the Config file the current object points to.
 * @returns {String} the string representation, in this case the file record pointing to
 */
  toString()
  {
    return this.file;
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
function SaveAllToConfig(src, callback, force = false){
  let status = 1;
  let message;

  resultError = function(message){
    message = `Error: ${message}`
    log.error(message);
    callback(1, message);
  }

  resultWarning = function(message){
    message = `Warn: ${message}`;
    log.warning(message);
    callback(0, message);
  }

  addConfigDefinitions = function(jsonContent){
    return jsonContent = "profiles = " +
      jsonContent +
      "\nexports.profiles = profiles;" +
      "\nexports.default = profiles.default;";
  }

  if(fs.existsSync(src) && !force){
    return resultError("File exists, if you want to overwrite it, use the force attribute")
  } else {
    if (force){
      return resultWarning("File exists, overwriting with new version");
    }
    else {
      let contents = addConfigDefinitions(_InternalSerializeCurrentContext());
      fs.writeFile(src, contents, function(err) {
        if(err) {
          return resultError(err);
        } else {
          status = 0;
          message = "Success";
        }
        callback(status, message);
      });
      return;
    }
  }
}

/**
 * Internal function which serializes the current Context into the format matching the "profile" object 
 * of the config file.
 * @returns {object} Returns a "profile" object in JSON.stringify format
 * @internal
 */
function _InternalSerializeCurrentContext(){
  let profile = { default: {} };

  //Separate this function into another utils library.
  serializeEntity = function (ent) {
    if (ent.constructor.name == "Array"){
      serializeArray();
    }else{
      profile.default[ent.constructor.name] = ent;  
    }
  }

  serializeArray = function (ent){
    let entityName;
    for (let ei in ent){
      //First, it creates as many entries of the same object as existing and initializes as empty arrays
      if (ent[ei].constructor.name != entityName)
      {
        entityName = ent[ei].constructor.name;
        profile.default[entityName] = [];
      }
    }
    for (let ei in ent){
      //Then it reiterates again, this time pushing the contents to the correct array record
      profile.default[ent[ei].constructor.name].push(ent[ei]);
    }    
  }

  serializeEntity(GetEnvironment());
  serializeArray(GetMotionDetectors());
  serializeArray(GetNotifiers());
  serializeArray(GetFilters()); 
    
  return JSON.stringify(profile);
}

/**
 * Adds an Extention plugin to the library. This means it runs the Pre and Post Plugin functions,
 * makes the added module available from the "plugins" varible, and adds its functions to t-motion-detector;
 * @param {Object} ext_module is the actual module we are extending.
 * @return {boolean} True the plugin was successfully added.
 */
function AddPlugin(ext_module){

  let runPreWorkflowFunctions = function(){
    if(!ext_module.exports.PreAddPlugin) throw new Error("Error: PreAddPlugin function must be implemented.");
    ext_module.exports.PreAddPlugin(module.exports);
  }

  let runPostWorkflowFunctions = function(){
    if(!plugins[ext_module.id].PostAddPlugin) throw new Error("Error: PostAddPlugin function must be implemented.");
    plugins[ext_module.id].PostAddPlugin(plugins[ext_module.id]);
  }

  //Checks the extension module is not null
  if(!ext_module) throw new Error("Error: AddPlugin requires a Plugin module as first argument.");
  //Checks that the extension module has an id
  if(!ext_module.id) throw new Error("Error: The plugin object does not have a valid 'id' property.");
  //Cheks that there is no existing extension module with the same name
  if(plugins[ext_module.id]) throw new Error(`Error: A plugin object with id '${ext_module.id}' already exists.`);

  //Checks if the module exports functions
  if(!ext_module.exports) {
    throw new Error(`Error: Does not seem to be a valid module.`);    
  }
  else {
    runPreWorkflowFunctions();  
    //Adds the module
    plugins[ext_module.id] = ext_module.exports;
    
    //stores a reference of the exported functions of the main library in the object
    ext_module.exports._ = module.exports;

    log.info("Added Plugin", ext_module.id);
    runPostWorkflowFunctions();

    return true;
  }
  return false;
}

/**
 * Removes an existing Extention plugin from the library
 * @param {string} ext_module_id is the id of the module to remove.
 * @return {boolean} True the plugin was successfully removed.
 */
function RemovePlugin(ext_module_id){

  let copy = plugins[ext_module_id];

  let runPreWorkflowFunctions = function(){
    if(!plugins[ext_module_id].PreRemovePlugin) throw new Error("Error: PreRemovePlugin function must be implemented.");
    plugins[ext_module_id].PreRemovePlugin();
  }

  let runPostWorkflowFunctions = function(){
    if(!copy.PostRemovePlugin) throw new Error("Error: PostRemovePlugin function must be implemented.");
    copy.PostRemovePlugin(module.exports);
  }

  runPreWorkflowFunctions();
  delete plugins[ext_module_id];
  log.info("Removed Plugin", ext_module_id);
  runPostWorkflowFunctions();

  return true;
}

/**
 * Gets the existing extension plugins added to the library
 * @return {object} the plugins object; 
 */
function GetPlugins(){
  return plugins;
}

exports.AddNotifier = AddNotifier;
exports.AddNotifierToSubEnvironment = AddNotifierToSubEnvironment;
exports.AddDetector = AddDetector;
exports.AddDetectorToSubEnvironmentOnly = AddDetectorToSubEnvironmentOnly;
exports.ActivateDetector = ActivateDetector;
exports.DeactivateDetector = DeactivateDetector;
exports.RemoveNotifier = RemoveNotifier;
exports.GetEnvironment = GetEnvironment;
exports.GetSubEnvironments = GetSubEnvironments;
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
 * Exposes the command line library (node-cmd) accessible
 */
exports.Cmd = cmd;
/**
 * Exposes a CLI tool based on 'commander' node package
 */
exports.Cli = cli;
exports.Filters = filters;
exports.Start = Start;
exports.StartWithConfig = StartWithConfig;
exports.SaveAllToConfig = SaveAllToConfig;
exports.Config = Config;
exports.Log = log;
//Plugin management functions
exports.AddPlugin = AddPlugin;
exports.RemovePlugin = RemovePlugin;
exports.GetPlugins = GetPlugins;
