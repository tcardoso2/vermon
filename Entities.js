//A generic base class which creates a surrounding environment for motion detection
//Collaborator: MotionDetector
//import { readonly } from 'core-decorators';
//import { mixin } from 'core-decorators';
let events = require("events");
let filters = require("./Filters.js");
let ko = require("knockout");
let chalk = require('chalk');
let log = require('tracer').colorConsole();

/**
 * @class: Entities.Environment
 * @classDesc: Defines the environment to be monitored
 * IMPORTANT: By detault the internal currentValue of the Environment will default to 0 (integer). 
 * If you wish to keep an internal state of a String notice that it will be appended to the state meaning the
 * initial string is "0". If you which to not include a "0" you must call the object via new Environment({ state: ""})
 * @param {Object} params to add, you can add a "name" and a "state".
 * @public
 */
class Environment{

  constructor(params){
    log.debug(`Base Environment constructor started with params: ${JSON.stringify(params)}`);
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
      if (params.state != undefined){
        this.currentState = params.state;
      }
    }

    //Makes originalState immutable, works only on strict mode
    Object.defineProperty(this, 'originalState', {
      value: this.currentState,
      writable: false
    });
  
    events.EventEmitter.call(this);
  
    //biderectional binding, once a state is changed, the Environment Sends a signal to all the Motion
    //detectors SEQUENTIALLY
    this.on('changedState', function(oldState, newState){
  	  for (let m in this.motionDetectors)
  	  {
  	    this.motionDetectors[m].send(newState, this);
      }
    });
    log.debug(`Base Environment constructor finished with current state: ${JSON.stringify(this.currentState)}`);
  }

  //Gets the current state of the environment
  getCurrentState()
  {
  	return this.currentState;
  }

  //Gets the original state of the environment (should be immutable)
  getOriginalState()
  {
    return this.originalState;
  }

  //Expects a MotionDetector entity passed as arg
  bindDetector(md, notifiers, force = false){
    this.motionDetectors.push(md);
    if (notifiers)
    {
      for (let n in notifiers)
      {
        notifiers[n].bindToDetector(md, undefined, force);
      }
    }
  }

  //Expects a MotionDetector entity passed as arg, also removes listener
  unbindDetector(md){
    if (md.removeAllListeners) {
      md.removeAllListeners('hasDetected');
    }
  	let index = this.motionDetectors.indexOf(md);
    if (index > -1) {
      this.motionDetectors.splice(index, 1);
    }
  }

  //Adds some sort of change to the Environment a change is measured in terms of intensity
  //Emits a changedState event
  addChange(intensity)
  {
    log.debug(`Environment base is adding a new change ${JSON.stringify(intensity)}, current state is ${JSON.stringify(this.currentState)}...`)
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
    log.debug(`Will emit a 'changedState', oldState and this.currentState are: ${JSON.stringify(oldState)} ====> ${JSON.stringify(this.currentState)}`)
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

  constructor(name, initialIntensity){
    this._isActive = false;
    this.count;
    this.currentIntensity = initialIntensity;

    //Makes originalIntensity immutable, works only on strict mode
    Object.defineProperty(this, 'originalIntensity', {
      value: this.currentIntensity,
      writable: false
    });

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
  send(newState, source)
  {
    //Does not do anything with the env. Maybe deprecate it?
    if(this._isActive){
      this.count++;
      //will filter if there are any filters
      for (let i in this.filters)
      {
        log.debug(`Found a filter ${this.filters[i].constructor.name}. filtering...`)
        newState = this.filters[i].filter(newState, source, this);
        if(!newState)
        {
          //No newState any longer, then the Motion treats this as something which should not be notified
          log.debug("No new state, I will not send this to the notifier...");
          return;
        }
      }
      this.emit("hasDetected", this.currentIntensity, newState, source, this);
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

/**
 * Gets the Intensity of the signal when the detector was originally created
 */
  getOriginalIntensity()
  {
    return this.originalIntensity;   
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
    if (props[i].startsWith("_") && !props[i].startsWith("_is")) //The getters I want to print (like _isActive)
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
  bindToDetector(detector, template, force = false){
    //Find a better way since it is not possible to unbind?
    if (!force && !(detector instanceof MotionDetector)){
      throw new Error("detector is not of MotionDetector type.");
    }
    //Safeguard in case force = true and detector does not exits
    if(detector){
      let n = this;
      if (!template)
      {
        template = `'${this.name}' received Notification received from: '${detector.name}'`;    
      }
      console.log(`Binding Notifier '${this.name}' to detector '${detector.name}'...`);
      detector.on("hasDetected", function(currentIntensity, newState, environment, detector){
        if (n) { // Testing if the notifier is still there because it might be removed anytime
          n.notify(template, currentIntensity, newState, environment, detector);
        }
      });
      this.detectors.push(detector);      
    } else {
      //Safeguard in case 
      console.log("WARN: No detector was found? Ignoring...");
    }
  }

  bindToDetectors(detectors, template, force = false){
    //Find a better way since it is not possible to unbind?
    for (let d in detectors)
    {
      this.bindToDetector(detectors[d], template, force);
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
const classes = { Environment, MotionDetector, BaseNotifier };
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
    this.logIndentation = 0;
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
    for (let p in params) {
      //flats down the values into an array
      _p.push(this.handle_any_declarative_parameters(params[p]));
    }
    //Will attempt to instanciate the object via rest parameters
    console.log(`Instanciating via factory object ${name} with params ${JSON.stringify(..._p)}.`);
    let result = new o(..._p);
    log.debug(`Returning object of type/name: ${result.constructor ? result.constructor.name : typeof(result)}/'${result.name}', value is:`);
    try{
      log.debug(JSON.stringify(result));
    }catch(e){
      //Attempting to catch circular reference
      if(e instanceof TypeError){
        log.warn(`Error occured while attempting to convert circular reference. Proceeding, but there could be problems...`);
      }
    }
    return result;
  }

  //Handles parameters by identifying keywords recursively along the chain of objects and sub-objects:
  //$new$: Interprets the key as a declarative pattern being the name of the class
  handle_any_declarative_parameters(params){
    log.info(`Handling parameters: ${JSON.stringify(params)}...`);
    let k;
    if (this.is_array_or_object(params))
    {
      this.logIndentation += 2;
      for (let p in params) {
        log.debug(`${Array(this.logIndentation).join(">")} Handling '${p}'...`);
        if(this.is_declarative_pattern(p)){
          //The trick here is for the parameter to become the actual object and break the loop
          params = this.convert_pattern_to_instance(p, params[p]);
          break;
        } else {
          params[p] = this.handle_any_declarative_parameters(params[p])
        }
      }
      this.logIndentation -= 2;
    }
    log.info(`Returning result to caller: ${JSON.stringify(params)}`);
    return params;
  }

  is_array_or_object(o){
    return Array.isArray(o) || typeof(o) == "object";
  }

  is_declarative_pattern(prop){
    return prop.startsWith("$new$");
  }

  //For now handles only $new$ pattern, if later other patterns are added this should be handled, e.g. via a switch statement?
  convert_pattern_to_instance(prop, values){
    let class_name = prop.split("$")[2];
    log.debug(`Found a $new$ keypattern, instanciating class ${class_name} with parameters ${JSON.stringify(values)}...`);
    return this.instanciate(class_name, values);
  }

  extend(newClasses)
  {
    log.info("Extending classes...");
    for (let prop in newClasses) {
      log.debug(`  ${prop}`);
      classes[prop] = newClasses[prop];
    }
    return classes;
  }
}


//Extending Factory methods
function GetExtensions(){
  return classes;
}

new EntitiesFactory().extend(filters.classes);

Environment.prototype.__proto__ = events.EventEmitter.prototype;
MotionDetector.prototype.__proto__ = events.EventEmitter.prototype;
BaseNotifier.prototype.__proto__ = events.EventEmitter.prototype;

exports.GetExtensions = GetExtensions;
exports.Filters = filters;
exports.EntitiesFactory = EntitiesFactory;
exports.Environment = Environment;
exports.MotionDetector = MotionDetector;
exports.BaseNotifier = BaseNotifier;