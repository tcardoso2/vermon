# t-motion-detector
A NodeJS Motion detector, initially aimed for Raspberry Pi.
The Motion Detectors detect changes in the Environment and the Notifiers receive the Motion Detectors' event changes.  
Author: Tiago Cardoso
NOTE: this code has only been tested in the following Linux OS:
- Raspbian: works only for ARM7 processors, meaning old Rpis won't work
- OSX: Tests and code runs / works where no real sensors are involved
***
Code snippet (to programatically set events, detectors and notifiers):  
````
var main = require('t-motion-detector');
var ent = main.Entities;

var n = new ent.BaseNotifier();
  n.on('pushedNotification', function(message, text){
      console.log("A new notification has arrived!", message, text);
  })

  main.Start({
    environment: new ent.Environment(),
    initialNotifier: n,
    initialMotionDetector: new ent.MotionDetector()
  });

e.AddChange(10);
````
If you want to override the notification message do (example with SlackNotifier):
````
var main = require('t-motion-detector');
var ent = main.Entities;

var n = new main.Extensions.SlackNotifier("My Slack", "https://hooks.slack.com/services/<Your_Slack_URL_Should_Go_Here>");
var e = new ent.Environment();
var m = new ent.MotionDetector();
m.name = "My mock detector";
n.on('pushedNotification', function(message, text){
  console.log("A new notification has arrived!", message, text);
})

main.Start({
  environment: e,
  initialMotionDetector: m
});
main.AddNotifier(n, `Received notification from: ${m.name}`);
e.AddChange(10);
````

NEW: From version 0.3.10 onwards you can apply filters so that you are not spammed with new incoming messages from the notifiers. Code snippet below:
````
var md = require('t-motion-detector');
var filters = md.Filters;
md.StartWithConfig(new md.Config("config.js")); //This is relative to your current workind durectory

...
let e = main.GetEnvironment();
e.applyFilters(
  new filters.HighPassFilter(10);
);

e.addChange(5);   //Will not notify
e.addChange(15);  //Will notify

````
See full list of Filters on Change log. 
You can also apply filters to individual Motion detectors instead of the Environment using the same function:
````
myMotionDetector.applyFilter(new LowPassFilter(5));
````
Differences with the previous approach are:
* Obviously the filter applies to only specific Motion Detectors instead of all Motion Detectors inside the environment;
* Important: The value passed to the filter is the currentState + change whereas on the previous case, the value passed to the filter is just the actual change;


You can also extend your on Filter, by inheriting filters.BaseFilter class and override the filter() method like so:
````
let filters = require('t-motion-detector').filters;

class MyCustomFilter extends filters.BaseFilter{

  constructor(val){
    super(val); //val is required it is the cut-off value which is used for your filter (below)
  }

  //If returning true, means the value will be filtered - filters values = 100
  filter(newState, env, detector){
    return newState == 100;
  }
}
````

From version 0.3.7 onwards there is a simpler way to call the API, using your own config file, which does a similar job as the one above:
````
var md = require('t-motion-detector');
md.StartWithConfig(new md.Config("config.js")); //This is relative to your current workind durectory
````

If called via "StartWithConfig", method, the program expects your config file as such (below). Note
the key names are real names of objects, which means you can use dependency injection to configure
your entities. Make sure you also pass the start parameters for the constructor(s), if any:

````
profiles = {
  default: {
    Environment: {},
    PIRMotionDetector: {
      pin: 17
    },
    SlackNotifier: {
      name: "My Slack channel",
      key: "https://hooks.slack.com/services/<MySlackURL>"
    }
  }
}

exports.profiles = profiles;
exports.default = profiles.default;
````
To access your Motion Detectors and Notifiers, use:
````
var md = require('t-motion-detector');
let myEnvironment = md.GetEnvironment();
let myDetectors = md.GetMotionDetectors(); // returns array
let myNotifiers = md.GetNotifiers(); // returns array
````

From version 0.3.3 onwards, it is possible to attach a Notifier based on node-raspistill,
RaspistillNotifier, which means you can use your Raspberry pi camera to take pictures when
movement is detected. Here's an example which takes a snapshot once the Raspberry pi detects
movement via the PIRMotionDetector connected to pin 17 (requires a sensor like the Infrared 
motion sensor HC-SR501):
````
var md = require('t-motion-detector');

var env = new md.Entities.Environment();
initialMD = new md.Extensions.PIRMotionDetector(17);
md.Start({
	environment: env,
	initialMotionDetector: initialMD
});

camNotifier = new md.Extensions.RaspistillNotifier();
md.AddNotifier(camNotifier);
````

Static configuration (to be deprecated): To configure locally to be notified via Slack first update your hook URL file (I'm working on overriding this in a local.js file so that this does not have to be done on the config.js of the package itself (HINT: use the new way of configuring the module from version 0.3.7 onwards - this one below still works but will be deprecated)):  
````  
profiles = {
  default: {
	slack: {
	  hook: 'https://hooks.slack.com/services/<Your_Slack_URL_Should_Go_Here>'
	}
  },
}

exports.profiles = profiles;
exports.default = profiles.default;
````
***
Extend your own notifier: 
More info coming soon!

***
Extend your own motion detector: 
More info coming soon!

***
Events: 
More info coming soon!

***
Unit tests: 
t-motion-detector uses mocha unit tests to test the detector, notifier and environment classes. I'll be adding more on the go.


## Links
  - [ChangeLog](https://github.com/tcardoso2/t-motion-detector/blob/master/CHANGELOG.md)
