"use strict"
//Filter classes used to filter incoming signals
//Collaborator: Environment, MotionDetector
//Base filter
//This should be inherited but you can in practice still use it,
//But by defult it does nothing (pass-all), override the method
//"filter" to change behaviour

/**
 * @class: Filters.BaseFilter
 * @classDesc: Creates a base filter to be applicable to a Motion Detector and attaches a value to it
 * @public
 */
class BaseFilter{

  constructor(val, applyTo){
    //Despite populating this, will do nothing with it
    this.valueToFilter = val;
    if (applyTo)
    {
      this.applyToName = applyTo;
    }
  }

  //Simply returns the state which is given (no changes)
  filter(newState, env, detector){
    //will pass all;
    return newState;
  }

  bindToDetectors(motionDetectors){
    switch(typeof this.applyToName)
    {
      case "undefined":
        console.log(">>>>> applying to all motion detectors:");
        // applies to all motion detectors
        for (let i in motionDetectors)
        {
          //applies to all Motion detectors
          motionDetectors[i].applyFilter(this);
        }
        break;
      case "string":
        // applies all motion detectors matching name
        console.log(`>>>>> applying to motion detectors with name: ${this.applyToName}`);
        this._applyToDetectorNames(motionDetectors, [this.applyToName]);
        break;
      case "object":
        //Assumes it is a motion detector, or at least an object which implements the applyFilter method
        console.log(">>>>> applying to motion detector:");
        //could be an array
        if(Array.isArray(this.applyToName)){
          this._applyToDetectorNames(motionDetectors, this.applyToName);
        } else {
          this.applyToName.applyFilter(this);
        }
        break;
      default:
        break;
    }
  }
  //Internal. Requires dName to be a string
  _applyToDetectorNames(motionDetectors, dName){
    for (let i in motionDetectors)
    {
      console.log(`Filter to be applied to items of name: "${dName}". Searching current motion detectors...`);
      if (dName.indexOf(motionDetectors[i].name) >= 0)
      {
        console.log("Found. Applying filter.")
        motionDetectors[i].applyFilter(this);
      }
    }
  }
}

//Block All filter
//Pretty self explanatory :)
//Note: If you create your own filters make sure you are calling the parent filter class
class BlockAllFilter extends BaseFilter{

  constructor(val, applyTo){
    super(val, applyTo);
  }

  //Simply returns nothing (opposite of it's base class)
  filter(newState, env, detector){
    return false;
  }
}

class NameFilter extends BaseFilter{

  constructor(val, applyTo){
    super(val, applyTo);
  }

  //Simply returns nothing (opposite of it's base class)
  filter(newState, env, detector){
    return detector.name == this.valueToFilter ? false : newState;
  }
}

class ValueFilter extends BaseFilter{

  constructor(val, applyTo){
    super(val, applyTo);
  }

  //Simply returns nothing (opposite of it's base class)
  filter(newState, env, detector){
    return newState == this.valueToFilter ? false : newState;
  }
}

class HighPassFilter extends BaseFilter{

  constructor(val, applyTo){
    super(val, applyTo);
  }

  //Simply returns nothing (opposite of it's base class)
  filter(newState, env, detector){
    return newState < this.valueToFilter ? false : newState;
  }
}

class LowPassFilter extends BaseFilter{

  constructor(val, applyTo){
    super(val, applyTo);
  }

  //Simply returns nothing (opposite of it's base class)
  filter(newState, env, detector){
    return newState > this.valueToFilter ? false : newState;
  }
}

class SystemEnvironmentFilter extends BaseFilter{

  constructor(freeMemBelow, applyTo, stdoutMatchesRegex){
    super(freeMemBelow, applyTo);
    this.stdoutMatchesRegex = stdoutMatchesRegex;
  }

  filter(newState, source, detector){
    console.log(`Filter ${this.constructor.name} is filtering values from detector: ${detector.name}: ${newState}, sent by ${source.constructor.name}`);
    //Tests first if the signal is comming from a System Environment
    if (source.constructor.name == "SystemEnvironment"){
      if(newState.freemem && newState.stdout){
        //Then Tests first if it is below memory
        if ((newState.freemem < this.valueToFilter) ||
          (this.stdoutMatchesRegex && newState.stdout.data.match(this.stdoutMatchesRegex))) {
          return newState;
        }
      }
    } else {
      console.log(`Signal does not come from a SystemEnvironment (${source.constructor.name} instead), ignoring filter.`);
      return newState;
    }

    return false;
  }
}

exports.classes = { 
  BaseFilter, BlockAllFilter, ValueFilter, NameFilter, LowPassFilter, HighPassFilter, SystemEnvironmentFilter 
}  

exports.BaseFilter = BaseFilter;
exports.BlockAllFilter = BlockAllFilter;
exports.HighPassFilter = HighPassFilter;
exports.LowPassFilter = LowPassFilter;
exports.NameFilter = NameFilter;
exports.ValueFilter = ValueFilter;
exports.SystemEnvironmentFilter = SystemEnvironmentFilter;