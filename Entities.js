//A generic base class which creates a surrounding environment for motion detection
//Collaborator: MotionDetector
var events = require("events");

function Environment(){
  
  var currentState = 0;
  var motionDetector;
  events.EventEmitter.call(this);
  
  //Gets the current state of the environment
  this.GetCurrentState = function()
  {
  	return currentState;
  }

  //Expects a MotionDetector entity passed as arg
  this.BindDetector = function(md){
    motionDetector = md;
    //biderectional binding
    this.on('changedState', function(oldState, newState){
    	motionDetector.Send(newState-oldState);
    	console.log(motionDetector.emit("hasDetected", oldState, newState, this));
    });	
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
  this.Send = function(delta)
  {
    count++;
    intensity = delta;
  }

  //Returns the number of movement detections happened since it Started monitoring
  this.GetCount = function()
  {
    return count;  	
  }

  //Returns the number of movement detections happened since it Started monitoring
  this.GetIntensity = function()
  {
    return intensity;  	
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