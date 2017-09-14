//A generic base class which creates a surrounding environment for motion detection
//Collaborator: MotionDetector
//import { readonly } from 'core-decorators';
//import { mixin } from 'core-decorators';
let events = require("events");
let filters = require("./Filters.js");
let ko = require("knockout");

/**
 * @class: Entities.Environment
 * @classDesc: Defines the environment to be monitored
 * @public
 */
class Environment{

  constructor(params){
    this.currentState = 0;
    /**
    * @type: Entities.MotionDetector
    * @desc: Contains the motion detectors attached to the current environment.
    * @public
    */
    this.motionDetectors = [];
    this.filters = [];
    this.name = "No name";

    if (params)
    {
      this.name = params.name;
      //This is kept for serialization purpose, TODO: improve
      this.params = params;
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
    //will filter if there are any filters
    for (let i in this.filters)
    {
      intensity = this.filters[i].filter(intensity, this);
      if(!intensity)
      {
        //No newState any longer, then the Motion treats this as something which should not be notified
        return;
      }
    }
    let oldState = this.currentState;
  	this.currentState = typeof(intensity) === "object" ? intensity : this.currentState + intensity;
    this.emit("changedState", oldState, this.currentState);
  }

  applyFilter(filter){
    if (filter instanceof filters.BaseFilter)
    {
      //Do work
      this.filters.push(filter);
    }
    else
    {
      throw new Error("Filter object not of type BaseFilter.");
    }
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

//This controls the Json output of the Environment class, not printing
//unecessary members
Environment.prototype.toJSON = function() {
  let copy = ko.toJS(this); //easy way to get a clean copy
  let props = Object.getOwnPropertyNames(copy);
  for (let i in props){
    if (props[i].startsWith("_"))
    {
      delete copy[props[i]];
    }
  }
  delete copy.motionDetectors; //remove an extra property
  delete copy.filters; //remove an extra property
  delete copy.domain;
  delete copy.currentState; 
  delete copy.name; 
  return copy; //return the copy to be serialized
};

/**
 * @class: Entities.MotionDetector
 * @classDesc: A generic base class which creates a motion detector for surrounding environments \n
 * Collaborator: Environment
 * @desc: Test
 * @public
 */
class MotionDetector{

  constructor(name){
    this._isActive = false;
    this.count;
    this.currentIntensity;
    this.name = name ? name : "unnamed detector."
    if ((typeof this.name) != "string"){
      throw new Error(`Motion detector first argument (name) is not of type string. Provided value was ${JSON.stringify(name)}`);
    }
    this.filters = [];
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
      //will filter if there are any filters
      for (let i in this.filters)
      {
        newState = this.filters[i].filter(newState, env, this);
        if(!newState)
        {
          //No newState any longer, then the Motion treats this as something which should not be notified
          return;
        }
      }
      this.emit("hasDetected", this.currentIntensity, newState, env, this);
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
    this.activate();
    this.count = 0;
  }

  deactivate()
  {
    this._isActive = false;
  }

  activate()
  {
    this._isActive = true;
  }

  applyFilter(filter){
    if (filter instanceof filters.BaseFilter)
    {
      //Do work
      this.filters.push(filter);
    }
    else
    {
      throw new Error("Filter object not of type BaseFilter.");
    }
  }

  //Resets the state to initial (StartMonitoring)
  reset(){
    this.startMonitoring();
  }

  exit()
  {

  }
}

//This controls the Json output of the MotionDetector class, not printing
//unecessary members
MotionDetector.prototype.toJSON = function() {
  let copy = ko.toJS(this); //easy way to get a clean copy
  let props = Object.getOwnPropertyNames(copy);
  for (let i in props){
    if (props[i].startsWith("_"))
    {
      delete copy[props[i]];
    }
  }
  delete copy.filters; //remove an extra property
  delete copy.domain; //remove an extra property
  return copy; //return the copy to be serialized
};

//A Base Notifier object for sending notifications
class BaseNotifier{

  constructor(name)
  {
    this.name = name ? name : "Default Base Notifier";
    events.EventEmitter.call(this);
    this.detectors = [];
    this.internalObj;
  }

  notify(text, oldState, newState, environment, detector){
    this.emit('pushedNotification', this.name, text, { 
      "oldState": oldState,
      "newState": newState,
      "detector": detector,
      "environment": environment
    });
  }

  hasInternalObj()
  {
    return this.internalObj !== undefined;
  }

  //It's the notifier who has the responsibility to bind to existing detectors
  bindToDetector(detector, template){
    //Find a better way since it is not possible to unbind?
    if (!(detector instanceof MotionDetector)){
      throw new Error("detector is not of MotionDetector type.");
    }

    let n = this;
    if (!template)
    {
      template = `'${this.name}' received Notification received from: '${detector.name}'`;    
    }
    console.log(`Binding Notifier '${this.name}' to detector '${detector.name}'...`);
    detector.on("hasDetected", function(currentIntensity, newState, environment, detector){
      n.notify(template, currentIntensity, newState, environment, detector);
    });
    this.detectors.push(detector);
  }

  bindToDetectors(detectors, template){
    //Find a better way since it is not possible to unbind?
    for (let d in detectors)
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

  stop(){
    //Not implemented
  }
}

function BaseParameters(){
  this.environment;
  this.initialNotifier;
  this.initialMotionDetector;
}

//This controls the Json output of the BaseNotifier class, not printing
//unecessary members
BaseNotifier.prototype.toJSON = function() {
  let copy = ko.toJS(this); //easy way to get a clean copy
  let props = Object.getOwnPropertyNames(copy);
  for (let i in props){
    if (props[i].startsWith("_"))
    {
      delete copy[props[i]];
    }
  }
  delete copy.detectors; //remove an extra property
  delete copy.domain; //remove an extra property
  return copy; //return the copy to be serialized
};

//Entities Factory
const classes = { Environment, MotionDetector, BaseNotifier};
//Keys 
const reservedKeys = [ "slack", "raspistill" ]

class EntitiesFactory
{
  constructor(name)
  {
    if (name)
    {
      return this.create(name);
    }
    //If reaches here the user can still use the same factory object and instiate using 'create'
  }
  
  isReserved(name)
  {
    return reservedKeys.indexOf(name) >= 0;
  }
  //Just creates the object, does not instanciate
  create(name)
  {
    if (this.isReserved(name))
    {
      throw new Error(`'${name}' is a reserved keyword and may not be used as Configuration object`);
    }

    let result = classes[name];
    if (!result)
    {
      throw new Error(`Class name '${name}' is not recognized, did you forget to use the 'extend' method?`);
    }
    return result;    
  }

  //Takes a key and value pair, key is the object name and value are the params
  instanciate(name, params)
  {
    let _p = [];
    let o = this.create(name);
    //converts params object to an array of it's values
    console.log(`Instanciating via factory object ${name} with params ${JSON.stringify(params)}.`);
    for (let p in params) {
      _p.push(params[p])
    }
    //Will attempt to instanciate the object via rest parameters
    return new o(..._p);
  }

  extend(newClasses)
  {
    for (let prop in newClasses) {
      classes[prop] = newClasses[prop];
    }
    return classes;
  }
}


//Extending Factory methods

new EntitiesFactory().extend(filters.classes);

Environment.prototype.__proto__ = events.EventEmitter.prototype;
MotionDetector.prototype.__proto__ = events.EventEmitter.prototype;
BaseNotifier.prototype.__proto__ = events.EventEmitter.prototype;

exports.Filters = filters;
exports.EntitiesFactory = EntitiesFactory;
exports.Environment = Environment;
exports.MotionDetector = MotionDetector;
exports.BaseNotifier = BaseNotifier;