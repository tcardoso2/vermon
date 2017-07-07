let ent = require("./Entities.js");
let ext = require("./Extensions.js");
let notifiers = [];
let environment;
let motionDetectors = [];
let config;
let fs = require('fs')
  , Log = require('log')
  , log = new Log('debug', fs.createWriteStream('t-motion-detector.' + (new Date().getTime()) + '.log'));
let filters = require("./Filters.js");

//This function should stay internal to this module!
function InternalAddEnvironment(env = new ent.Environment()){
  if (env instanceof ent.Environment)
  {
    environment = env;
    return true;
  } else {
    log.warning("'environment' object is not of type Environment");
  }
  return false;
}

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

//Adds a detector and binds it to the environment
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

function RemoveNotifier(notifier){
  var index = notifiers.indexOf(notifier);
  if (index > -1) {
  	notifiers[index].notify("Removing Notifier...");
  	notifiers.splice(index, 1)
  }
}

//Getters, setters
function GetEnvironment()
{
  if (environment == undefined) {
  	throw new Error('Environment does not exist. Please run the Start() function first or one of its overrides.');
  }

  return environment;	
}

function GetNotifiers()
{
  return notifiers;
}

function GetMotionDetectors()
{
  return motionDetectors;
}

function Reset()
{
  notifiers = [];
  environment = undefined;
  motionDetectors = [];
}

//Will start the motion detector
function Start(params, silent = false){
  log.info("Starting t-motion-detector with parameters...");
  //Sets the parameters first if they exist
  if (params){
    if (params.environment){
      environment = params.environment;
    }
    else
    {
      InternalAddEnvironment();
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
    InternalAddEnvironment();
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

//Will start the motion detector based on the existing configuration
function StartWithConfig(configParams){
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

  for(let p in profileObj)
  {
    if (profileObj.hasOwnProperty(p)) {
      //It is only supposed to add if the object is of the expected type
      let f = new ent.EntitiesFactory();
      if (!f.isReserved(p))
      {
        log.info(`Creating entity "${p}"...`);
        let o = f.instanciate(p, profileObj[p]);
        //The way this is written, forces the environment to be created first
        if(!InternalAddEnvironment(o)){
          if (!AddNotifier(o)){
            if(!AddDetector(o)){
              console.warn(`Object/class '${p}'' could not be added. Proceeding.`)
            }
          }
        }
      }
    }
  }
  log.info("ready.");
} 

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
      console.log(`Warning:'${e.message}, will fallback to config file...`);
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
exports.RemoveNotifier = RemoveNotifier;
exports.GetEnvironment = GetEnvironment;
exports.GetNotifiers = GetNotifiers;
exports.GetMotionDetectors = GetMotionDetectors;
exports.Reset = Reset;
exports.Entities = ent;
exports.Extensions = ext;
exports.Filters = filters;
exports.Start = Start;
exports.StartWithConfig = StartWithConfig;
exports.Config = Config;
exports.Log = log;
