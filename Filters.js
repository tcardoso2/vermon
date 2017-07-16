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
      if (typeof applyTo == "string")
      {
        this.applyToName = applyTo;
      }
      else
      {
        applyTo.applyFilter(this);
      }
    }
  }

  //Simply returns the state which is given (no changes)
  filter(newState, env, detector){
    //will pass all;
    return newState;
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

exports.classes = { BaseFilter, BlockAllFilter, ValueFilter, NameFilter, LowPassFilter, HighPassFilter }

exports.BaseFilter = BaseFilter;
exports.BlockAllFilter = BlockAllFilter;
exports.HighPassFilter = HighPassFilter;
exports.LowPassFilter = LowPassFilter;
exports.NameFilter = NameFilter;
exports.ValueFilter = ValueFilter;
