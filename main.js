var ent = require("./Entities.js");
var ext = require("./Extensions.js");
var notifiers = [];
var environment;
var motionDetectors = [];

function AddNotifier(notifier, template){
  notifier.bindToDetectors(motionDetectors, template);
  notifiers.push(notifier);
}

//Adds a detector and binds it to the environment
function AddDetector(detector){
  motionDetectors.push(detector);
  if (environment)
  {
    environment.bindDetector(detector);
    detector.startMonitoring();
  } else {
    throw new Error("No environment was detected, please add one first.");
  }
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

//Will start the motion detector
function Start(params, silent = false){
  console.log("Setting initial parameters...");
  //Sets the parameters first if they exist
  if (params){
    if (params.environment){
      environment = params.environment;
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
  	environment = new ent.Environment();
  }

  if (!silent)
  {
    console.log("Notifying detector is starting...");
    //Pushes message to all notifiers
    for (n in notifiers){
      notifiers[n].notify("Started");
    }
  }
  console.log("ready.");
}

class Config {

  constructor()
  {
    try{
      this.file = require('./local.js');
    } catch (e)
    {
      this.file = require('./config.js');
    }
  }

  slackHook(profile){
    //TODO: This is very hard coupled create unit tests to make this easier
    if (profile)
    {
      if(this.file.profiles[profile]){
        return this.file.profiles[profile].slack.hook;
      } else {
        //TODO: Use ES6 string concatenations here
        throw new Error(`'${profile}' was not found in the local.js file.`);
      }
    }
    else{
      //fallsback to default hook
      return this.file.default.slack.hook;
    }
  };

  toString()
  {
    return this.file;
  }
}

exports.count = 0;
exports.AddNotifier = AddNotifier;
exports.AddDetector = AddDetector;
exports.RemoveNotifier = RemoveNotifier;
exports.GetEnvironment = GetEnvironment;
exports.Entities = ent;
exports.Extensions = ext;
exports.Start = Start;
exports.Config = Config;