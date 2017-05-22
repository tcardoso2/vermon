# t-motion-detector
A NodeJS Motion detector, initially aimed for Raspberry Pi.
The Motion Detectors detect changes in the Environment and the Notifiers receive the Motion Detectors' event changes.  
Author: Tiago Cardoso
NOTE: this code has only been tested in the following Linux OS:
- Raspbian: works only for ARM7 processors, meaning old Rpis won't work
- OSX: Tests and code runs / works where no real sensors are involved
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


## Links
  - [ChangeLog](https://github.com/tcardoso2/t-motion-detector/blob/master/CHANGELOG.md)
