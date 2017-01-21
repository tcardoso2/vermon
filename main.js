var events = require("events");

notifiers = [];
//A Base Notifier object for sending notifications
function BaseNotifier(){

  this.name = "Default Base Notifier";

  events.EventEmitter.call(this);

  this.Notify = function(text){
    this.emit('pushedNotification', this.name, text);
  }
}

function AddNotifier(notifier){
  notifiers.push(notifier);
}

function RemoveNotifier(notifier){
  var index = notifiers.indexOf(notifier);
  if (index > -1) {
  	notifiers[index].Notify("Removing Notifier...");
  	notifiers.splice(index, 1)
  }
}

//Will start the motion detector
function Start(){
  for (n in notifiers){
    notifiers[n].Notify("Started");
  }
}

BaseNotifier.prototype.__proto__ = events.EventEmitter.prototype;

exports.count = 0;
exports.BaseNotifier = BaseNotifier;
exports.AddNotifier = AddNotifier;
exports.RemoveNotifier = RemoveNotifier;
exports.Start = Start;