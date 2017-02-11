//Extensions which use the Base entities
//Collaborator: MotionDetector
var ent = require("./Entities.js");

//A concrete MotionDetector class which implements a Raspberry Pi PIR sensor detector
//Collaborator: Environment
function PIRMotionDetector(pin){
  
  //Gets the status of the Motion detector, 0 is not active
  var isActive = false;
  var count;
  var currentIntensity;

  if (!pin)
  {
    throw new Error('FATAL: You must provide a pin number for the Raspberry Pi where the PIR sensor signal is being read.');
  }
  var Gpio = require('onoff').Gpio
  var pin = new Gpio(pin, 'in', 'both'); 

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

PIRMotionDetector.prototype.__proto__ = ent.MotionDetector.prototype;

exports.PIRMotionDetector = PIRMotionDetector;