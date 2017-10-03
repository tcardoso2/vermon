[![NPM info](https://nodei.co/npm/t-motion-detector.png?downloads=true)](https://nodei.co/npm/t-motion-detector.png?downloads=true)

[![Travis build status](https://travis-ci.org/tcardoso2/t-motion-detector.png?branch=master)](https://travis-ci.org/tcardoso2/t-motion-detector)
[![dependencies](https://david-dm.org/tcardoso2/t-motion-detector.svg)](https://david-dm.org/tcardoso2/t-motion-detector.svg)


[![Unit tests](https://github.com/tcardoso2/t-motion-detector/blob/master/badge.svg)](https://github.com/tcardoso2/t-motion-detector/blob/master/badge.svg) 

# t-motion-detector
A NodeJS Motion detector, initially aimed for Raspberry Pi.
The Motion Detectors detect changes in the Environment and the Notifiers receive the Motion Detectors' event changes.  
NOTE: this code has only been tested in the following Linux OS:
- Raspbian: using Node ARMv7
- OSX: Tests and code runs / works where no real sensors are involved
***
* STEP 1 : Create your config.js file and define the default profile of your app:  
````
profiles = {
  default: {
    Environment: {},
    PIRMotionDetector: {
      pin: 17
    },
    MotionDetector: [{
      name: "MD 1"
    },
    {
      name: "MD 2"
    }],
    SlackNotifier: {
      name: "My Slack channel",
      key: "https://hooks.slack.com/services/<MySlackURL>"
    },
    HighPassFilter: [{
      val : 8,
      applyTo: "MD 1"
    },
    {
      val : 5,
      applyTo: "MD 2"
    }]    
  }
}

exports.profiles = profiles;
exports.default = profiles.default;
````
* STEP 2 : Add your main file  
````
let md = require('t-motion-detector');
let config = new md.Config(__dirname + '/config.js', false);

md.StartWithConfig(config, (e,d,n,f)=>{
  console.log(`Good to go! My environment is ${e}, detectors are ${d}, notifiers ${n} and filters ${f}`);
});
````
### Featured detectors:  
#### PIRMotionDetector  
<img src="files/pir_wiring.png" alt="PIRMotionDetector" width="480"/>  

````
//Sends a Slack message if the PIR sensor detects movement
profiles = {
  default: {
    Environment: {},
    PIRMotionDetector: {
      pin: 4
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
#### FileDetector  
<img src="files/icons-files.jpg" alt="FileDetector" width="80"/>
````
//Sends a Slack message if any file is added, removed or changed in the "photos" folder
profiles = {
  default: {
    Environment: {},
    FileDetector: {
      name: "File Detector",
      path: "photos",
      sendOld: false
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

From version 0.3.3 onwards, it is possible to attach a Notifier based on node-raspistill,
RaspistillNotifier, which means you can use your Raspberry pi camera to take pictures when
movement is detected. Here's an example which takes a snapshot once the Raspberry pi detects
movement via the PIRMotionDetector connected to pin 17 (requires a sensor like the Infrared 
motion sensor HC-SR501):
````
let md = require('t-motion-detector');

let env = new md.Entities.Environment();
initialMD = new md.Extensions.PIRMotionDetector(17); //Rpi listens on pin 17 for incoming signals from the PIR sensor
md.Start({
	environment: env,
	initialMotionDetector: initialMD
});

camNotifier = new md.Extensions.RaspistillNotifier();
md.AddNotifier(camNotifier); //Rpi will take a picture if the PIR sensor detects movement
````

***
Unit tests: 
t-motion-detector uses mocha unit tests to test the detector, notifier and environment classes. I'll be adding more on the go. to test use "npm test"

## Links
  - [ChangeLog](https://github.com/tcardoso2/t-motion-detector/blob/master/CHANGELOG.md)  
  - [Documentation](https://github.com/tcardoso2/t-motion-detector/blob/master/DOCUMENTATION.md) 
  - [Code of Conduct](https://github.com/tcardoso2/t-motion-detector/blob/master/CODE_OF_CONDUCT.md)   
  - [Related Packages](https://www.npmjs.com/package/t-motion-detector-433)  
  - [Roadmap (Work in Progress)](https://github.com/tcardoso2/t-motion-detector/blob/master/ROADMAP.md) 
