//A generic base class which creates a surrounding environment for motion detection
//Collaborator: MotionDetector
var events = require("events");

function Environment(){
  
  var currentState = 0;
  var motionDetectors = [];
  events.EventEmitter.call(this);
  
  //biderectional binding, once a state is changed, the Environment Sends a signal to all the Motion
  //detectors SEQUENTIALLY
  this.on('changedState', function(oldState, newState){
  	for (m in motionDetectors)
  	{
  	  motionDetectors[m].Send(newState, this);
	}
  });

  //Gets the current state of the environment
  this.GetCurrentState = function()
  {
  	return currentState;
  }

  //Expects a MotionDetector entity passed as arg
  this.BindDetector = function(md){
    motionDetectors.push(md);
  }

  //Expects a MotionDetector entity passed as arg
  this.UnbindDetector = function(md){
  	var index = motionDetectors.indexOf(md);
    if (index > -1) {
      motionDetectors.splice(index, 1);
    }
  }

  //Adds some sort of change to the Environment a change is measured in terms of intensity
  //Emits a changedState event
  this.AddChange = function(intensity)
  {
  	var oldState = currentState;
  	currentState += intensity;
    this.emit("changedState", oldState, currentState);
  }
}

//A generic vase class which creates a motion detector for surrounding environments
//Collaborator: Environment
function MotionDetector(){
  
  //Gets the status of the Motion detector, 0 is not active
  var isActive = false;
  var count;
  var currentIntensity;
  events.EventEmitter.call(this);

  //Returns the current Active state
  this.IsActive = function(){
  	return isActive;
  }

  //Sends a signal to the motion detector
  this.Send = function(newState, env)
  {
    count++;
    this.emit("hasDetected", currentIntensity, newState, this);
    currentIntensity = newState;
  }

  //Returns the number of movement detections happened since it Started monitoring
  this.GetCount = function()
  {
    return count;  	
  }

  //Returns the number of movement detections happened since it Started monitoring
  this.GetIntensity = function()
  {
    return currentIntensity;  	
  }

  //Starts monitoring any movement
  this.StartMonitoring = function(){
    isActive = true;
    count = 0;
  }
}

Environment.prototype.__proto__ = events.EventEmitter.prototype;
MotionDetector.prototype.__proto__ = events.EventEmitter.prototype;

exports.Environment = Environment;
exports.MotionDetector = MotionDetector;