//Filter classes used to filter incoming signals
//Collaborator: Environment, MotionDetector

//Base filter
//This should be inherited but you can in practice still use it,
//But by defult it does nothing (pass-all), override the method
//"filter" to change behaviour
class BaseFilter{

  constructor(val){
    //Despite populating this, will do nothing with it
    this.valueToFilter = val;
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

  constructor(val){
    super(val);
  }

  //Simply returns nothing (opposite of it's base class)
  filter(newState, env, detector){
    return false;
  }
}

class NameFilter extends BaseFilter{

  constructor(val){
    super(val);
  }

  //Simply returns nothing (opposite of it's base class)
  filter(newState, env, detector){
    return detector.name == this.valueToFilter ? false : newState;
  }
}

class ValueFilter extends BaseFilter{

  constructor(val){
    super(val);
  }

  //Simply returns nothing (opposite of it's base class)
  filter(newState, env, detector){
    return newState == this.valueToFilter ? false : newState;
  }
}

class HighPassFilter extends BaseFilter{

  constructor(val){
    super(val);
  }

  //Simply returns nothing (opposite of it's base class)
  filter(newState, env, detector){
    return newState < this.valueToFilter ? false : newState;
  }
}

class LowPassFilter extends BaseFilter{

  constructor(val){
    super(val);
  }

  //Simply returns nothing (opposite of it's base class)
  filter(newState, env, detector){
    return newState > this.valueToFilter ? false : newState;
  }
}

exports.BaseFilter = BaseFilter;
exports.BlockAllFilter = BlockAllFilter;
exports.HighPassFilter = HighPassFilter;
exports.LowPassFilter = LowPassFilter;
exports.NameFilter = NameFilter;
exports.ValueFilter = ValueFilter;
