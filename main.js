var events = require("events");
var ent = require("./Entities.js")
var notifiers = [];
var environment;
var motionDetectors = [];

//A Base Notifier object for sending notifications
function BaseNotifier(){

  this.name = "Default Base Notifier";

  events.EventEmitter.call(this);

  this.Notify = function(text){
    this.emit('pushedNotification', this.name, text);
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
  environment.BindDetector(detector);
  detector.StartMonitoring();
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
      parameters = params.environment;
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
    notifiers[n].Notify("Started");
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
exports.Start = Start;