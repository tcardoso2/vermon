//A generic base class which creates a surrounding environment for motion detection
//Collaborator: MotionDetector
//import { readonly } from 'core-decorators';
//import { mixin } from 'core-decorators';
let events = require("events");
let filters = require("./Filters.js");
let ko = require("knockout");
let chalk = require('chalk');
let utils = require("./utils.js");
let log = utils.log;
let em = require("./EnvironmentManager.js");

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
    log.debug(`Base Environment constructor started with params: ${utils.JSON.stringify(params)}`);
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
    log.debug(`Base Environment constructor finished with current state: ${utils.JSON.stringify(this.currentState)}`);
  }

  /*
   * Gets the current state of the environment. When state changes, every Detector
   * binded to the Environment will receive a change event.
   * @returns {Object} the value of the current state of the Environment.
   */
  getCurrentState()
  {
  	return this.currentState;
  }

  /*
   * Gets the original state of the environment whe this was first created
   * @returns {Object} the value of the original current state of the Environment.
   */
  getOriginalState()
  {
    return this.originalState;
  }

/**
 * Binds and adds {MotionDetector} object to the Environment. an environment can have many Detectors.
 * Once binded, the Detector will receive change events in case the Environment value changes.
 * @param {object} md is the MotionDetector object type to bind to this environment
 * @param {Array} notifiers is an optional array of Notifier objects which will be binded to the detector. 
 * @param {Boolean} if force = true means the Notifiers will be added without the system actual checking these are real Notifiers. By default force = false;
 */
  bindDetector(md, notifiers, force = false){
    this.motionDetectors.push(md);
    log.info(`Pushed a new detector "${md.name}" to environment "${this.name}". Environment has now ${this.motionDetectors.length} motion detectors(s).`);
    if (notifiers)
    {
      for (let n in notifiers)
      {
        notifiers[n].bindToDetector(md, undefined, force);
      }
    }
  }


/**
 * Unbinds and removes an existing {MotionDetector} object from the Environment, and its listeners;
 * @param {object} md is the MotionDetector object type to remove from this environment
 */
  unbindDetector(md){
    if (md.removeAllListeners) {
      md.removeAllListeners('hasDetected');
    }
  	let index = this.motionDetectors.indexOf(md);
    if (index > -1) {
      this.motionDetectors.splice(index, 1);
    }
  }

/**
 * Changes the value of the current state of the environment, causing a propagation of change events (called 'changedState' envent) to the binded detectors.
 * The value if the state is also affected by the existence of Filters. See {Filter} object and {applyFilter} function.
 * @param {object} intensity is the value which will change the state. If it is a Number, will add to the current state, if it is an object will replace it;
 * @example //TODO: Add an example
 */
  addChange(intensity)
  {
    log.debug(`Environment base is adding a new change ${utils.JSON.stringify(intensity)}, current state is ${utils.JSON.stringify(this.currentState)}...`)
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
    log.debug(`Will emit a 'changedState', oldState and this.currentState are: ${utils.JSON.stringify(oldState)} ====> ${utils.JSON.stringify(this.currentState)}`)
    this.emit("changedState", oldState, this.currentState);
  }

/**
 * Adds a filter to the environment. Filters only do one thing: Prevent changes in the Environment to propagate
 * to the Detectors via affecting the {addChange} function behaviour.
 * For instance if an Environment is only supposed to accept integer values, one can create a filter which ignores attempts on adding changes which are not Numbers;
 * Only after the filter is added, will affect the {addChange} function
 * @param {object} filter is the Filter object;
 * @example //TODO: Need to add an example
 */
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

  /*
   * Abstract method (not implemented). Should be overriden by children classes.
   * Intent is to get the Parent environment it belongs to (if existing). 
   * This is applicable e.g. for MultiEnvironments where there is always a parent environment and 
   * children environments;
   * @returns {Object} the Multienvironment parent if belongs to (if existing)..
   */
  getParentEnvironment(){
    throw new Error("Not Implemented.");    
  }

  /*
   * Gets any Environment by name under the same multiEnvironment.
   * @returns {Object} the sibling Environment..
   */
  getSiblingEnvironment(environmentName){
    return this.getParentEnvironment().getSubEnvironment(environmentName);    
  }

  /*
   * Abstract method (not implemented). Should be overriden by children classes to show whether an environment is active or not.
   * @returns {Object} the sibling Environment.
   */
  isActive()
  {
    throw new Error("Not Implemented.");
  }
  
  /*
   * Called when main.Reset() function is used, as a step to do extra cleanup actions if required.
   * To be used in case you need to do any exit steps, like cleaning up procedures, etc...
   */
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
 * A generic base class which creates a motion detector for surrounding environments \n
 * Collaborator: Environment
 * @param {String} name of the Motion Detector, will show up in logs and messages
 * @param {object} initialIntensity is the Motion Detector state. Motion Detectors record the last state which triggered them, which is passed from the environment to the detectors when there is a change.
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
      throw new Error(`Motion detector first argument (name) is not of type string. Provided value was ${utils.JSON.stringify(name)}`);
    }
    this.filters = [];
    events.EventEmitter.call(this);
  }

  /*
   * Returns if the current Detector is active. Detectors are NOT active by default. They are only activated
   * once they are added to an Environment. Detectors which are not active won't propagate their signals to
   * Notifiers.
   * @returns {Boolean} true if the Motion Detector is active.
   */
  isActive(){
  	return this._isActive;
  }

  /*
   * Sends a signal to a Notifier if the Motion Detector is active and if there are no Filters which filter out that value
   * @returns {Boolean} true if the Motion Detector is active.
   */
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

  /*
   * Each time a change happens, an internal counter increases. This function gets that value.
   * @returns {Integer} the number of times a detector changed value
   */
  getCount()
  {
    return this.count;  	
  }

  /*
   * Gets the current state (for Motion Detectors it's called intensity)
   * @returns {Object} the current value of the intensity
   */
  getIntensity()
  {
    return this.currentIntensity;  	
  }

  /*
   * Gets the original state (for Motion Detectors it's called intensity), of the instance, when it was created.
   * @returns {Object} the original value of the intensity
   */
  getOriginalIntensity()
  {
    return this.originalIntensity;   
  }

   /*
   * Starts monitoring an environment by activating it. Also resets the internal count to 0 (see getCount)
   * @returns {Object} the original value of the intensity
   */
  startMonitoring(){
    this.activate();
    this.count = 0;
  }


   /*
   * Sets the active flag to false, disabling any further propagations to the notifier.
   */
  deactivate()
  {
    this._isActive = false;
  }
   
  /*
   * Sets the active flag to true, enabling any further propagations to the notifier.
   */
  activate()
  {
    this._isActive = true;
  }

/**
 * Adds a filter to the Motion Detector. Filters on the Detectors only do one thing: prevent changes to propagate to the notifiers.
 * Only after the filter is added, will affect the {addChange} function
 * @param {object} filter is the Filter object;
 * @example //TODO: Need to add an example
 */
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

/**
 * Resets to the original state
 */
  reset(){
    this.startMonitoring();
  }

/**
 * Add any cleanup code here. For the Base MotionDetector class it does nothing.
 */
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

/**
 * @class: Entities.BaseNotifier
 * BaseNotifier class is responsible for picking MotionDetectors changes. Only Notifiers which are binded
 * to Detectors will receive changes. Changes are pushed from the Detector to the Notifier and not pulled.
 * Notifiers have then the misison to "communicate" those changes to the outer world.
 * In order to implement specific Notifiers, extend this class. See for intance examples of a specific class
 * {SlackNotifier}
 * @param {String} name of the Notifier. This is important as it will show up in the template message of the notification.
 * @public
 */
class BaseNotifier{

  constructor(name)
  {
    this.name = name ? name : "Default Base Notifier";
    events.EventEmitter.call(this);
    this.detectors = [];
    this.internalObj;
  }

/**
 * Emits a 'pushedNotification' event. To Receive this you can subscribe to this event, or simply use the 
 * Notifier class for the communication means you intent to use.
 * @param {String} text is the contents of the notified message
 * @param {object} oldState is the previous state preceeding the change
 * @param {object} newState is the new state after the change happens as detected by the Change Detector
 * @param {object} environment is also propagated for convenience
 * @param {object} detector is the MotionDetector instance which has detected the related change
 * @example //TODO: Need to add an example
 */
  notify(text, oldState, newState, environment, detector){
    this.emit('pushedNotification', this.name, text, { 
      "oldState": oldState,
      "newState": newState,
      "detector": detector,
      "environment": environment
    });
  }

  //WIP
  hasInternalObj()
  {
    return this.internalObj !== undefined;
  }

/**
 * Although it the detector which pushes the messages to Notifiers, it's the notifier who has the responsibility to bind to existing detectors.
 * After binding, the underlyig detector's Changes will be propagated to this Notifier, so long the Detector is active and the changes are not filtered out.
 * @param {object} detector is the MotionDetector instance to bind this Notifier to.
 * @param {String} template is the skeleton of the message for the notifier
 * @param {Boolean} if force = true means the Notifiers will be added without the system actual checking these are real Notifiers. By default force = false;
 * @example //TODO: Need to add an example
 */
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

/**
 * Same as {bindToDetector} but bind the same Notifier to more Detectors
 * @param {object} detectors is an Array of MotionDetector instance to bind this Notifier to.
 * @param {String} template is the skeleton of the message for the notifier
 * @param {Boolean} if force = true means the Notifiers will be added without the system actual checking these are real Notifiers. By default force = false;
 * @example //TODO: Need to add an example
 */
  bindToDetectors(detectors, template, force = false){
    //Find a better way since it is not possible to unbind?
    for (let d in detectors)
    {
      this.bindToDetector(detectors[d], template, force);
    }
  }

 /**
 * TODO: Needs documentation - Extensibility methods
 */
  useIn(){
    throw new Error("Needs to be implemented by sub-classes");
  }

 /**
 * TODO: Needs documentation - Extensibility methods
 */
  use(_extension){
    //TODO: Implement, should use Dependency injection techniques / late binding
    throw new Error("Needs to be implemented by sub-classes");
    //Start(_extension.BaseParameters());
    //Don't like the coupling here.
  }

 /**
 * TODO: Needs documentation
 */
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
//Config Patterns (reserved words)
const reservedPatterns = {
  NEW: "$new$",
  DETECTORS: "$detectors$"
}

 /**
 * TODO: Needs documentation
 */
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
  
 /**
 * TODO: Needs documentation
 */
  isReserved(name)
  {
    return reservedKeys.indexOf(name) >= 0;
  }
 /**
 * TODO: Needs documentation
 */
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

 /**
 * TODO: Needs documentation
 */
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
    log.debug(`Instanciating via factory object ${name} with params ${utils.JSON.stringify(..._p)}.`);
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

 /**
 * TODO: Needs documentation
 */
  //Handles parameters by identifying keywords recursively along the chain of objects and sub-objects:
  //$new$: Interprets the key as a declarative pattern being the name of the class
  handle_any_declarative_parameters(params){
    log.debug(`Handling parameters: ${utils.JSON.stringify(params)}...`);
    let k;
    if (this.is_array_or_object(params))
    {
      this.logIndentation += 2;
      for (let p in params) {
        log.debug(`${Array(this.logIndentation).join(">")} Handling '${p}'...`);
        if(this.is_declarative_pattern(p)){
          //The trick here is for the parameter to become the actual object and break the loop
          params = this.handle_declarative_pattern(p, params);
          break;
        } else{
            params[p] = this.handle_any_declarative_parameters(params[p])
        }
      }
      this.logIndentation -= 2;
    }
    log.debug(`Returning result to caller: ${utils.JSON.stringify(params)}`);
    return params;
  }

 /**
 * TODO: Needs documentation
 */
handle_declarative_pattern(prop, all){
    let subEnvironment;
    for (let p in all) {
      log.info(`Handling declarative pattern ${p}...`);
      switch(this.get_declarative_pattern(p)){
        case reservedPatterns.NEW:
          //The trick here is for the parameter to become the actual object and break the loop
          subEnvironment = this.convert_pattern_to_instance(p, all[p]);
          break;
        case reservedPatterns.DETECTORS:
          //Assumes that the Environment is already there
          this.convertDetectorsToSubEnvironment(subEnvironment, all[p])
          break;
        default:
          break;
      }
    }
    return subEnvironment;  
  }

 /**
 * TODO: Needs documentation
 */
  //Converts detectors pattern to detectors and adds to subEnvironment
  convertDetectorsToSubEnvironment(subEnvironment, detectors){
    let o;
    for(let d in detectors){
      o = this.instanciate(d, detectors[d]);
      //We do not want a check if there is already a Multi-env because this is ran usually when
      //The instances are being run, hence the 4th arg as false
      em.AddDetectorToSubEnvironmentOnly(o, false, subEnvironment, false);
    }
  }

 /**
 * TODO: Needs documentation
 */
  //returns the declarative pattern used in the property
  get_declarative_pattern(prop){
    if (prop.startsWith(reservedPatterns.NEW))
      return reservedPatterns.NEW;
    if (prop == reservedPatterns.DETECTORS)
      return reservedPatterns.DETECTORS;
    return;
  }

 /**
 * TODO: Needs documentation
 */
  is_array_or_object(o){
    return Array.isArray(o) || typeof(o) == "object";
  }

 /**
 * TODO: Needs documentation
 */
  is_declarative_pattern(prop){
    return prop.startsWith("$new$");
  }

 /**
 * TODO: Needs documentation
 */
  //For now handles only $new$ pattern, if later other patterns are added this should be handled, e.g. via a switch statement?
  convert_pattern_to_instance(prop, values){
    let class_name = prop.split("$")[2];
    log.debug(`Found a $new$ keypattern, instanciating class ${class_name} with parameters ${utils.JSON.stringify(values)}...`);
    return this.instanciate(class_name, values);
  }

 /**
 * TODO: Needs documentation
 */
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

 /**
 * TODO: Needs documentation
 */
//Extending Factory methods
function GetExtensions(){
  return classes;
}

 /**
 * TODO: Needs documentation
 */
function IsInstanceOf(o, instanceName){
  return o instanceof classes[instanceName];
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
exports.IsInstanceOf = IsInstanceOf;