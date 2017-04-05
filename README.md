# t-motion-detector
A NodeJS Motion detector, initially aimed for Raspberry Pi.
The Motion Detectors detect changes in the environment and the Notifiers receive the Motion Detectors's event changes.  
Author: Tiago Cardoso
***
Code snippet:  

    var n = new ent.BaseNotifier();
    var e = new ent.Environment();
    var m = new ent.MotionDetector();
    n.on('pushedNotification', function(message, text){
        console.log("A new notification has arrived!", message, text);
    })
    var result = false;
    main.Start({
      environment: e,
      initialNotifier: n,
      initialMotionDetector: m
    });

    e.AddChange(10);

To be notified via Slack first update your hook URL file (I'm working on overriding this in a local.js file so that this does not have to be done on the config.js of the package itself (I know it is uglyish for now):  
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
