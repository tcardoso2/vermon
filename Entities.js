//A generic base class which creates a surrounding environment for motion detection
//Collaborator: MotionDetector
var events = require("events");

class Environment{

  constructor(params){
    this.currentState = 0;
    this.motionDetectors = [];
    this.notifiers = [];
    this.name = "No name";

    if (params)
    {
      this.name = params.name;
    }
  
    events.EventEmitter.call(this);
  
    //biderectional binding, once a state is changed, the Environment Sends a signal to all the Motion
    //detectors SEQUENTIALLY
    this.on('changedState', function(oldState, newState){
  	  for (var m in this.motionDetectors)
  	  {
  	    this.motionDetectors[m].send(newState, this);
      }
    });
  }

  //Gets the current state of the environment
  getCurrentState()
  {
  	return this.currentState;
  }

  //Expects a MotionDetector entity passed as arg
  bindDetector(md, notifiers){
    this.motionDetectors.push(md);
    if (notifiers)
    {
      for (var n in notifiers)
      {
        notifiers[n].bindToDetector(md);
      }
    }
  }

  //Expects a MotionDetector entity passed as arg
  unbindDetector(md){
  	var index = this.motionDetectors.indexOf(md);
    if (index > -1) {
      this.motionDetectors.splice(index, 1);
    }
  }

  //Adds some sort of change to the Environment a change is measured in terms of intensity
  //Emits a changedState event
  addChange(intensity)
  {
  	var oldState = this.currentState;
  	this.currentState += intensity;
    this.emit("changedState", oldState, this.currentState);
  }

  //Abstract methods, should be overriden by extender classes, cannot be used directly
  isActive()
  {
    throw new Error("Not Implemented.");
  }
  
  //Do any exit procedures required here (e.g. releasing memory, etc...)
  exit()
  {
    throw new Error("Not Implemented.");    
  }
}

//A generic base class which creates a motion detector for surrounding environments
//Collaborator: Environment
class MotionDetector{

  constructor(){
    this._isActive = false;
    this.count;
    this.currentIntensity;
    this.name = "unnamed detector."
    events.EventEmitter.call(this);
  }

  //Returns the current Active state
  isActive(){
  	return this._isActive;
  }

  //Sends a signal to the motion detector
  send(newState, env)
  {
    //Does not do anything with the env. Maybe deprecate it?
    if(this._isActive){
      this.count++;
      this.emit("hasDetected", this.currentIntensity, newState, this);
      this.currentIntensity = newState;
    }
  }

  //Returns the number of movement detections happened since it Started monitoring
  getCount()
  {
    return this.count;  	
  }

  //Returns the number of movement detections happened since it Started monitoring
  getIntensity()
  {
    return this.currentIntensity;  	
  }

  //Starts monitoring any movement
  startMonitoring(){
    this._isActive = true;
    this.count = 0;
  }

  //Resets the state to initial (StartMonitoring)
  reset(){
    this.startMonitoring();
  }
}

//A Base Notifier object for sending notifications
class BaseNotifier{

  constructor(name)
  {
    this.name = name ? name : "Default Base Notifier";
    events.EventEmitter.call(this);
    this.detectors = [];
  }

  notify(text, oldState, newState, detector){
    this.emit('pushedNotification', this.name, text, { 
      "oldState": oldState,
      "newState": newState,
      "detector": detector
    });
  }

  //It's the notifier who has the responsibility to bind to existing detectors
  bindToDetector(detector, template){
    //Find a better way since it is not possible to unbind?
    var n = this;
    if (!template)
    {
      template = `Notification received from: ${detector.name}`;      
    }
    detector.on("hasDetected", function(currentIntensity, newState, detector){
      n.notify(template, currentIntensity, newState, detector);
    });
    this.detectors.push(detector);
  }

  bindToDetectors(detectors, template){
    //Find a better way since it is not possible to unbind?
    for (var d in detectors)
    {
      this.bindToDetector(detectors[d], template);
    }
  }

  //Extensibility methods
  useIn(){
    throw new Error("Needs to be implemented by sub-classes");
  }

  use(_extension){
    //TODO: Implement, should use Dependency injection techniques / late binding
    throw new Error("Needs to be implemented by sub-classes");
    //Start(_extension.BaseParameters());
    //Don't like the coupling here.
  }
}

function BaseParameters(){
  this.environment;
  this.initialNotifier;
  this.initialMotionDetector;
}

Environment.prototype.__proto__ = events.EventEmitter.prototype;
MotionDetector.prototype.__proto__ = events.EventEmitter.prototype;
BaseNotifier.prototype.__proto__ = events.EventEmitter.prototype;

exports.Environment = Environment;
exports.MotionDetector = MotionDetector;
exports.BaseNotifier = BaseNotifier;