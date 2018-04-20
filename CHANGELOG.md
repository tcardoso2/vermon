# Change log:

***  
* v 0.5.31 :Bug fixes;  
* v 0.5.30 :Now possible to instantiate MultiEnvironment from config file; Added handling of circular references; 
* v 0.5.29 :WIP: Testing / Adding capability of calling a MultiEnvironemnt via config file;    
* v 0.5.28 :Plugins: Bug fixes, improve logs on Adding Detectors;  
* v 0.5.27 :Plugins: Bug fixes;  
* v 0.5.26 :Plugins: added a requirement for plugins to have a "ShouldStart" function which returns true if the plugin should start when StartWithConfig is called;  
* v 0.5.25 :Adding function for getting Sub-Environments and Adding Detectors / Notifiers to main or sub-environments;  
* v 0.5.24 :Validating arguments of MultiEnvironment constructor (WIP);  
* v 0.5.23 :WIP: Allow adding sub-environment as argument of MultiEnvironment constructor, adding unit tests first;  
* v 0.5.22 :WIP: Continuing Unit tests on MultiEnvronment, Adding Detectors and Notifiers to specific sub-environments;  
* v 0.5.21 :WIP: Working on MultiEnvironment;   
* v 0.5.20: Added check to see if detector exists in case AddDetector = false (safeguard);  
* v 0.5.19: Substituted log module with tracer which provides better output (colors and file location);  
* v 0.5.18: main.Entities.GetExtensions() now returs all the classes which have been extended by the EntitiesFactory class;  
* v 0.5.17: Created originalIntensity for Detectors, an immutable value, similar to "originalState" for Environment classes;  
* v 0.5.16: If "state" is passed as a member of the Entities object, then stores it in the currentState. Created also originalState / getOriginalState (immutable);  
* v 0.5.14 and 0.5.15:Small bug fix on Filters, was crashing when source was not defined.  
* v 0.5.13:Fix, added commander as dependency, adding additional info sent on SlackNotifier by default (newState)  
* v 0.5.12:Exposed "commander", from main._.Cli, so program can be used as a basic CLI tool as well.  
* v 0.5.11:Exposed "node-cmd", from main._.Cmd, so that Plugin extensions can use command line.  
* v 0.5.10:Updated main console.log by log.info on main.js. Reset also calls Reset method of plugins.  
* v 0.5.9: Added Start Plugin code which gets called when StartWithConfig is called. Fixes required for Plugins to work properly.  
* v 0.5.8: Environment: Added "currentState" as part of serialized JSON.  
* v 0.5.7: Small fixes.  
* v 0.5.6: Modified README with images, made imprevements to SystemEnvironment, added KillAfter argument which allows stoping the interval command after x iterations   
* v 0.5.5: Fixing a bug which did not allow File detector to save files if there is a SystemEnvironment Filter applied to it (WIP)  
* v 0.5.4: Updated to BSD-2-Clause license. "applyTo" member in Filters can take an array of names of detectors to filter from.  
* v 0.5.3: Added lastState to SystemEnvironment.  
* v 0.5.2: Added unit test # badge  
* v 0.5.1: Update of readme information. WIP on FileDetector to not send old files by default (WIP, adding a new argument to the constructor). Added Roadmap (WIP) page. Fix AddDetector force=true was not propagating correctly. Created Notificator.unbindFromDetector (needed for main.Reset()). Bug Fixes.  
* v 0.5.0: Implemented badges, Travis build status and dependency status (david-dm.org)  
* v 0.4.15: Implemented SystemEnvironmentFilter propagating changes in case memory falls below certain values or when a command matches a certain regex (must be a simple command, meaning requiring no user input after issued).  
* v 0.4.14: Removed post-install script  
* v 0.4.13: Creating SystemEnvironmentFilter entity for only trigering notifications if a certain Environment value changes (WIP), eliminating post script question, plan is to instead use basic cli options. 
* v 0.4.12: Adding new unit tests for a new environment, SystemEnvironment which allows specifying simple commands and add change if there are differences in state.  
* v 0.4.11: Minor change, allowing to define if Detector Entities in config should forcibly be added even if not of the correct instance of the Entity required, where possible. This was done because it seems the system does not recognize the type as being the same of the t-motion-detector Entities used by the Plugins.
* v 0.4.10: Very minor change, allowing to define if the Config constructor should prepend cwd to the file name or not. Adding modules.exports to PreAddPlugin and PostRemovePlugin functions
* v 0.4.9 :Created basic support for extending the t-motion-detector library. Till now the extension points are not well defined. The intention is to have clear steps for extending (e.g. will affect other
existing packages t-motion-detector-433 and t-motion-detector-cli). Added documentation on it (WIP). See t-motion-detector-cli package to see how that plugin is created.
* v 0.4.8 :Function SaveAllToConfig now allows saving configuration to disk, added unit tests and documentation.
* v 0.4.7 :Worked on saving config to disk. Adding documentation. Added one more test to assert that a callback is called after starting main program, sending as args the Environment, Motion Detectors and Notifiers. Attached code of conduct. Passed first tests on Save Config function (WIP);
* v 0.4.6 :Added new unit tests for saving new config file into disk, with force option.  
* v 0.4.5 :Possible to now add on config more items of the same instance in the form of Filters  
* v 0.4.4 :WIP on documentation (need to add details on config for Filters). Added ActivateMotionDetector and
DeactivateMotionDetector functions (by MD name);  
* v 0.4.3 :Working on Filter configuration, to be able to add filters to either MotionDetectors or the whole
Environment via the Configuration file (Dependency Injection). Created a callback after the StartWithConfig
function, to make sure configuration is properly initialized. Although older tests do not use it, future tests
should be build using it.  
* v 0.4.2 :Added small test for macking sure the Environment mocking works  
* v 0.4.1 :Added flag force = true to allow adding Detectors and/or Notifiers even if application does not recognize as being of the same instance. This is to workaround the fact of other detectors (like 433 detector) which is built in another package, but node still does not acknowledge is of the same instance. Use at your own risk  
* v 0.4.0 :Corrected some unit tests which were conflicting. It's now possible to send Raspistill images to Slack, making the application now possible to detect movement and send a picture of the intruder!
* v 0.3.11:Adding capability of declaring filters via Config. WIP code for FileDetector for detecting new files in folder (from RaspistillNotifier)
* v 0.3.10:Introduction of filters. Filters are entities which filter signals either: 
** Between individual Motion detectors and notifiers; 
** Apply to the environment and all its Motion detectors meaning will filter all signals even before the Motion detectors do.  
  ** In-Built filters:  
    *** BaseFilter (does nothing, you should inherit from it to implement your own);  
    *** BlockAllFilter: Filters all values;  
    *** ValueFilter: Filters only for the specified value in the constructor;  
    *** HighPassFilter: Filters only for values above the specified value in the constructor;  
    *** LowPassFilter: Filters only for the values below the specified value in the contructor;  
* v 0.3.9: function Config.isFallback() now allows to know if the requested configuration file is not found (it does not throw any Exception so this is the way to know the configuration file you requested is not found, and that the fallback default configuration file is used instead). function mapToFile now prepends process.cwd() to the filename provided. Change: main.Config("config_file.js") now uses the current working directory to get the configuration file.  
* v 0.3.8: Continuing on setup script (post-install) - for now answer always option (3) - WIP  
* v 0.3.7: Integration tests on Raspberry pi for the new configuration mode (simpler) for setting up detectors and notifiers (Added to readme.md)  
* v 0.3.6: Started (WIP) creating setup initial script to setup t-motion-detector via console. Added pre-install script for installing only on permitted OS. Separated Change log from README file.  
* v 0.3.5: Created a Factory to dynamically instanciate classes (via dependency injection) in Entities.  
* v 0.3.4: Implementing dependency injection with config.js (WIP), setting up t-motion from config without requiring hard-coding. Allowing Config object to receive alternate (mock) config file name. Replaced vars
in the main file by 'let'. Started implementation of automatic instances of Environment / Notifier / 
MotionDetectors via StartWithConfig() function (WIP), added extra checks when adding notifiers or detectors;  
* v 0.3.3: first version for the RaspistillNotifier - based on raspistill node module for capturing photos  
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
  ** Added a few more unit tests  
  ** Can add and remove notifiers  
  ** When starting motion senting (via Start) notifications from all notifiers should be pushed;  
  ** When removing a motion sensor a final notification should come from that notifier;  
* v 0.1.0: Initial version with internal Environment and Motion Detector objects and unit tests;