//Extensions which use the Base entities
//Collaborator: MotionDetector
var ent = require("./Entities.js");
var MotionDetector = ent.MotionDetector;
var BaseNotifier = ent.BaseNotifier;
var Slack = require('slack-node');
os = require("os");
const Raspistill = require('node-raspistill').Raspistill;

//A concrete MotionDetector class which implements a Raspberry Pi PIR sensor detector
//Collaborator: Environment
class PIRMotionDetector extends MotionDetector{
  
  constructor(pin, callback){
    super("PIR Motion detector");
    this.log = require("./main.js").Log;
    var Gpio = undefined;
    this.pir = undefined;

    if (!pin)
    {
      throw new Error('FATAL: You must provide a pin number for the Raspberry Pi where the PIR sensor signal is being read.');
    }
    if (this._isRPi()){
      Gpio = require('onoff').Gpio;
      this.pir = new Gpio(pin, 'in', 'both');
      this.log.info("Pin was set to: ", pin);
    } else {
      this.log.error("This does not seem to be an Rpi. I'll continue, but I sure hope you know what you're doing...");
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
      var m = this;
      this.pir.watch(function(err, value){
        if (err) this.exit();
        m.log.info('Intruder was detected.');
        if (value == 1)
        {
          m.send(value);
        }
      });
    }
  }

  exit()
  {
    super.exit();
    pir.unexport;
    process.exit();
  }

  //TODO: Don't like this
  if (callback)
  {
    callback();
  }
}

class SlackNotifier extends BaseNotifier{
  
  constructor(name, key){
    if (!key){
      throw new Error("'key' is a required argument, which should contain the Slack hook URL.");
    }
    super(name);
    this.slack = new Slack();
    this.slack.setWebhook(key);
    this.key = key;
  }

  hasInternalObj()
  {
    return this.slack !== undefined;
  }

  notify(some_text, oldState, newState, detector){
    this.lastMessage = some_text;
    this.data = {
          "oldState": oldState,
          "newState": newState,
          "detector": detector
        };
    let _this = this;
    this.slack.webhook({
      channel: '#general',
      text: some_text,
      username: this.name
    }, function(err, response){
      if (!err)
      {
        _this.emit('pushedNotification', _this.name, _this.lastMessage, _this.data);
      }
      else
      {
        new Error(err);
      } 
    });
  }
}

class RaspistillNotifier extends BaseNotifier{
  
  constructor(name, options){
    super(name);
    this.options = options;
    this.internalObj = new Raspistill(this.options);
  }

  notify(some_text, oldState, newState, detector){
    this.lastMessage = some_text;
    this.data = {
          "oldState": oldState,
          "newState": newState,
          "detector": detector
        };
    let _this = this;
    this.internalObj.takePhoto()
        .then((photo) => {
            console.log('took photo', photo);
            _this.emit('pushedNotification', _this.name, _this.lastMessage, _this.data);
        })
        .catch((error) => {
            //_this.emit('pushedNotification', _this.name, 'something bad happened', error);
      });
  }
}

//Extending Factory methods

//Extending Entities Factory
const classes = { PIRMotionDetector, SlackNotifier, RaspistillNotifier};

new ent.EntitiesFactory().extend(classes);

exports.PIRMotionDetector = PIRMotionDetector;
exports.SlackNotifier = SlackNotifier;
exports.RaspistillNotifier = RaspistillNotifier;
