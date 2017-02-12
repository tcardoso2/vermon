//Extensions which use the Base entities
//Collaborator: MotionDetector
var MotionDetector = require("./Entities.js").MotionDetector;
os = require("os");

//A concrete MotionDetector class which implements a Raspberry Pi PIR sensor detector
//Collaborator: Environment
class PIRMotionDetector extends MotionDetector{
  
  constructor(pin, callback){
    super();
    this.gpio = undefined;
    this.pir = undefined;

    if (!pin)
    {
      throw new Error('FATAL: You must provide a pin number for the Raspberry Pi where the PIR sensor signal is being read.');
    }
    if (this._isRPi()){
      this.gpio = require('onoff').Gpio;
      this.pir = new Gpio(pin, 'in', 'both');
    } else {
      console.error("This does not seem to be an Rpi. I'll continue, but I sure hope you know what you're doing...");
    }
  }
 
  //Private member: Used for determining if the current host is a Raspberry pi or not
  _isRPi()
  {
    //Not that perfect, work in progress...
    return os.arch() == "arm" && os.platform() == "linux";
  }
  
  //Starts monitoring any movement
  startMonitoring(){
    super.startMonitoring();
    if(this.pir){
      this.pir.m = this;
      this.pir.watch(function(err, value){
        if (err) this.Exit();
        console.log('Intruder was detected.');
        if (value == 1)
        {
          pir.m.Send(value);
          alert("Does not work! MotionDetector is of Environment type??!??!?!?!");
        }
      });
    }
  }

  exit()
  {
    pir.unexport;
    process.exit();
  }

  //TODO: Don't like this
  if (callback)
  {
    callback();
  }
}

//PIRMotionDetector.prototype.__proto__ = ent.MotionDetector.prototype;

exports.PIRMotionDetector = PIRMotionDetector;