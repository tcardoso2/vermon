//Extensions which use the Base entities
//Collaborator: MotionDetector
let ent = require("./Entities.js");
let MotionDetector = ent.MotionDetector;
let BaseNotifier = ent.BaseNotifier;
var Slack = require('slack-node');
let path = require('path');
Slack.Upload = require('node-slack-upload');
let fs = require('fs');
let os = require("os");
const Raspistill = require('node-raspistill').Raspistill;
let chokidar = require('chokidar');
let node_cmd = require('node-cmd');
let moment = require('moment');

/**
 * A Simple Command line wrapper, it executes the command mentioned after a change in the Environment
 * and propagates the stdout result to the notifier. It uses node-cmd under the hood. Also provides
 * System additional info such as memory used, free memory and cpu usage
 * @param {String} command is a command to execute
 * @param {int} an interval in seconds to execute the commands
 */
class SystemEnvironment extends ent.Environment {
  constructor(command, interval = 0){
    super();
    if (!command){
      throw new Error("ERROR: You must provide a command as the first argument.");
    }
    this.command = command;
    this.interval = interval;
    this.currentState = { stdout: undefined, cpus: -1, totalmem: -1, freemem: -1 };
    let m = this;
    this.i = setInterval(() => {
      // This is executed after about x milliseconds.
      m.getValues((m)=>{
        m.addChange(m.lastState);
        if (m.interval == 0) {
          clearInterval(m.i);
        }
      });
    }, this.interval < 500 ? 500 : this.interval); //interval is never below 500 millisecond for performance reasons
  }

  getValues(callback){
    let m = this;
    node_cmd.get(
      m.command,
      function(err, data, stderr){
        m.lastState = {
          stdout: {"err": err, "data" : data, "stderr": stderr},
          cpus: os.cpus(),
          totalmem: os.totalmem(),
          freemem: os.freemem(),
          timestamp: new Date()
        }
        callback(m);
      }
    );
  }

  exit(){
    super.exit();
    clearInterval(this.i);
  }
}

//A concrete MotionDetector for detecting files in a folder
class FileDetector extends MotionDetector{
  
  constructor(name, filePath, sendOld = false){
    super(name);
    this.watcher = chokidar.watch(filePath, {
      ignored: /[\/\\]\./, persistent: true
    });
    this.path = filePath;
    this.sendOld = sendOld;
  }
  startMonitoring(){
    super.startMonitoring();
    let m = this;
    this.watcher
      .on('add', (path)=> {
        fs.stat(path, (err, stats)=> {
          if(!err)
          {
            if (!m.sendOld){
              //Checks if should send old files
              let ft = moment(stats.ctime);
              if (ft.isBefore(moment().subtract(5, 'seconds')))
              {
                console.log('Ignoring old file: ', path);
                return;
              }
              else {
                console.log('>>>>>>> File', path, 'has been added'); 
                m.send(path, m);
              }
            } else {
              m.send(path, m);
            }
          }
        });
      })
      .on('change', function(path) {
        fs.stat(path, (err, stats)=> {
          console.log('>>>>>>> File', path, 'has been changed');
          m.send(path, m);
        })
      });
  }

  send(data, from){
    //Only sends if the signal was detected from self and not Environment
    if (from == this){
      super.send(data);//Ignores signals sent from Environment
    }
  }
}

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
      throw new Error('ERROR: You must provide a pin number for the Raspberry Pi where the PIR sensor signal is being read.');
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
      let m = this;
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
  
  constructor(name, key, auth){
    if (!key){
      throw new Error("'key' is a required argument, which should contain the Slack hook URL.");
    }
    super(name);
    this.slack = new Slack();
    this.slack.setWebhook(key);
    this.slackUpload = new Slack.Upload(auth);

    this.key = key;
  }

  hasInternalObj()
  {
    return this.slack !== undefined;
  }

  notify(some_text, oldState, newState, environment, detector){
    this.lastMessage = some_text;
    this.data = {
          "oldState": oldState,
          "newState": newState,
          "detector": detector,
          "environment": environment,
          "notifier": this
        };
    let _this = this;
    if (!(detector instanceof FileDetector))
    {
      this.slack.webhook({
        channel: '#general',
        icon_emoji: ":ghost:",
        text: some_text,
        username: this.name,
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
    else
    {
      if((typeof newState) != "string"){
        console.log(`'${newState}' not a valid path, ignoring slack upload.`);
        return;
      }
      console.log("Uploading ", newState);
      //The slack API token needs to be there: https://api.slack.com/web
      this.slackUpload.uploadFile({
        file: fs.createReadStream(newState), //path.join(__dirname, '.', newState)),
        //content: 'My file contents!',
        filetype: path.extname(newState), 
        title: 'FILE',
        initialComment: 'my comment',
        channels: '#general'
      }, function(err, data) {
        if (err) {
            console.error(err);
        }
        else {
          _this.data.file = data; 
          console.log('Uploaded file details: ', data);
          _this.emit('pushedNotification', _this.name, _this.lastMessage, _this.data);;
        }
      });
    }
  }
}

class RaspistillNotifier extends BaseNotifier{
  
  constructor(name, fileName, options){
    super(name);
    this.options = options;
    this.fileName = fileName === undefined ? "NoName" : fileName;
    this.internalObj = new Raspistill(this.options);
  }

  notify(some_text, oldState, newState, environment, detector){
    this.lastMessage = some_text;
    this.data = {
          "oldState": oldState,
          "newState": newState,
          "detector": detector,
          "environment": environment
        };
    let _this = this;
    this.internalObj.takePhoto(this.fileName)
      .then((photo) => {
        console.log('took photo', photo);
        _this.data.photo = photo;
        //Will propagate to this if the pushNotification is not well handled.
        _this.emit('pushedNotification', _this.name, _this.lastMessage, _this.data); 
      })
      .catch((error) => {
        //It seems that sometimes errors are triggered but the component still takes the picture
        //console.log('Some error happened while taking the photo', error);
        _this.lastMessage = error.message;
        _this.data.error = error;
        _this.emit('pushedNotification', _this.name, _this.lastMessage, _this.data);
      }); 
  }
}

//Extending Factory methods

//Extending Entities Factory
const classes = { FileDetector, PIRMotionDetector, SystemEnvironment, SlackNotifier, RaspistillNotifier }

new ent.EntitiesFactory().extend(classes);

exports.FileDetector = FileDetector;
exports.PIRMotionDetector = PIRMotionDetector;
exports.SlackNotifier = SlackNotifier;
exports.RaspistillNotifier = RaspistillNotifier;
exports.SystemEnvironment = SystemEnvironment;
