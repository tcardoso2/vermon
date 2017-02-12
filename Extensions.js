//Extensions which use the Base entities
//Collaborator: MotionDetector
var ent = require("./Entities.js");
os = require("os");

//A concrete MotionDetector class which implements a Raspberry Pi PIR sensor detector
//Collaborator: Environment
function PIRMotionDetector(pin){
  
  //Gets the status of the Motion detector, 0 is not active
  var isActive = false;
  var count;
  var currentIntensity;
  var Gpio;
  var pir;

  //Private member: Used for determining if the current host is a Raspberry pi or not
  __IsRPi = function()
  {
    //Not that perfect, work in progress...
    return os.arch() == "arm" && os.platform() == "linux";
  }
  
  if (!pin)
  {
    throw new Error('FATAL: You must provide a pin number for the Raspberry Pi where the PIR sensor signal is being read.');
  }
  if (__IsRPi()){
    Gpio = require('onoff').Gpio;
    pir = new Gpio(pin, 'in', 'both');
  } else {
    console.error("This does not seem to be an Rpi. I'll continue, but I sure hope you know what you're doing...");
  }

  //Starts monitoring any movement
  this.StartMonitoring = function(){
    if(pir){
      pir.watch(function(err, value){
        if (err) this.Exit();
        console.log('Intruder was detected.');
        if (value == 1)
        {
          this.AddChange(value);
        }
      });
    }
    isActive = true;
    count = 0;
  }

  this.Exit = function()
  {
    pir.unexport;
    process.exit();
  }
}

PIRMotionDetector.prototype.__proto__ = ent.MotionDetector.prototype;

exports.PIRMotionDetector = PIRMotionDetector;