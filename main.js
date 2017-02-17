var events = require("events");
var ent = require("./Entities.js");
var ext = require("./Extensions.js");
var notifiers = [];
var environment;
var motionDetectors = [];

//A Base Notifier object for sending notifications
//TODO: Change this to the Entities.js file!
class BaseNotifier{

  constructor(name)
  {
    this.name = name ? name : "Default Base Notifier";
    events.EventEmitter.call(this);
  }

  notify(text){
    this.emit('pushedNotification', this.name, text);
  }

  //Extensibility methods
  useIn(){
    throw "Needs to be implemented by sub-classes";
  }

  use(_extension){
    //TODO: Implement, should use Dependency injection techniques / late binding
    Start(_extension.BaseParameters());
    //Don't like the coupling here.
  }
}

function BaseParameters(){
  this.environment;
  this.initialNotifier;
  this.initialMotionDetector;
}

function AddNotifier(notifier){
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
  	notifiers[index].Notify("Removing Notifier...");
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
function Start(params){
  console.log("Setting initial parameters...");
  //Sets the parameters first if they exist
  if (params){
    if (params.environment){
      environment = params.environment;
    }
  	if (params.initialNotifier){
  	  notifiers.push(params.initialNotifier);
  	}
  	if (params.initialMotionDetector){
  	  motionDetectors.push(params.initialMotionDetector);
  	}
  }

  //Will set a default Environment if does not exist;
  if(!environment){
  	environment = new ent.Environment();
  }

  console.log("Binding existing motion detectors...");
  //Binds internal environment with all existing Motion detectors
  for (m in motionDetectors)
  {
  	AddDetector(motionDetectors[m]);
  }

  console.log("Notifying detector is starting...");
  //Pushes message to all notifiers
  for (n in notifiers){
    notifiers[n].notify("Started");
  }
  console.log("ready.");
}

BaseNotifier.prototype.__proto__ = events.EventEmitter.prototype;

exports.count = 0;
exports.BaseNotifier = BaseNotifier;
exports.AddNotifier = AddNotifier;
exports.AddDetector = AddDetector;
exports.RemoveNotifier = RemoveNotifier;
exports.GetEnvironment = GetEnvironment;
exports.Entities = ent;
exports.Extensions = ext;
exports.Start = Start;