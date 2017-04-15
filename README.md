# t-motion-detector
A NodeJS Motion detector, initially aimed for Raspberry Pi.
The Motion Detectors detect changes in the Environment and the Notifiers receive the Motion Detectors's event changes.  
Author: Tiago Cardoso
***
Code snippet:  

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

If you want to override the notification message do (example with SlackNotifier):

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

From version 0.3.3 onwards, it is possible to attach a Notifier based on node-raspistill,
RaspistillNotifier, which means you can use your Raspberry pi camera to take pictures when
movement is detected. Here's an example which takes a snapshot once the Raspberry pi detects
movement via the PIRMotionDetector connected to pin 17 (requires a sensor like the Infrared 
motion sensor HC-SR501):

	var md = require('t-motion-detector');
	var mdr = require('t-motion-detector-433');

	var env = new md.Entities.Environment();
	initialMD = new md.Extensions.PIRMotionDetector(17);
	md.Start({
		environment: env,
		initialMotionDetector: initialMD
	});

	camNotifier = new md.Extensions.RaspistillNotifier();
	md.AddNotifier(camNotifier);

To configure locally to be notified via Slack first update your hook URL file (I'm working on overriding this in a local.js file so that this does not have to be done on the config.js of the package itself (I know it is uglyish for now)):  
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

***
* v 0.3.3: first version for the RaspistillNotifier
* v 0.3.2: Adding node-raspistill as RaspistillNotifier wrapper into Extensions classes. Will allow to take
A snapshot picture if movement is detected using a properly configured raspberry camera and the
node-raspistill library. Adding unit test (WIP).
* v 0.3.1: Update on the README file, noticed example code had bugs in it.
* v 0.3.0: Added capability to customize the notification message, minor fixes.
* v 0.2.12:Bug fixes on loging inside pir detection event.
* v 0.2.11:Changed console log to proper logging (saves a file into local disk) 
* v 0.2.10:Fixed a bug whereby a Detector added after starting the main function was not binded with the Notifiers.
* v 0.2.9: Updated/improved the readme.md file to get users up and running with example code.
* v 0.2.8: Implementing fallback from local.js to config.js (WIP)
* v 0.2.7: Fixing a local test to use the config Slack hook key instead of hard-coded one
* v 0.2.6: Minor bug fixes
* v 0.2.5: Binded Detectors and notifiers
* v 0.2.4: Added slack-node to packages.js dependencies
* v 0.2.3: Created SlackNotifier and internal tests
* v 0.2.2: Moved BaseNotifier from main into Entities.js
* v 0.2.1: Converted BaseNotifier to a ES6 class (WIP);
* v 0.2: Converted classes to new Ecmascript 6 syntax, to real classes that is.
* v 0.1.5: Added a wip function to detect if the gost is an Rpi, StartMonitoring now monitors any PIR changes.
* v 0.1.4: Started adding functionality for Raspberry Pi PIR sensor.Decided to include that in the base library because that was why this package was initially created for in the first place.
* v 0.1.3: Added abstract function to Environment called IsActive which should be overriden by the extender classes, depending on the particularities of their context. Exported also Entities so that these can be extended. Added "name" attribute on Environment.
* v 0.1.2: Added more tests, binded Notifiers, Environment and Motion detectors together.
* v 0.1.1: Adding BaseNotifier classes on the main module so that we can start using this package. Fixed issues with adding event listeners. Environment can now bind and unbind movement sensors.
  * Added a few more unit tests  
  * Can add and remove notifiers  
  * When starting motion senting (via Start) notifications from all notifiers should be pushed;  
  * When removing a motion sensor a final notification should come from that notifier;  
* v 0.1.0: Initial version with internal Environment and Motion Detector objects and unit tests;
