# t-motion-detector
A NodeJS Motion detector, initially aimed for Raspberry Pi

* v 0.1.4: Started adding functionality for Raspberry Pi PIR sensor.Decided to include that in the base library because that was why this package was initially created for in the first place.
* v 0.1.3: Added abstract function to Environment called IsActive which should be overriden by the extender classes, depending on the particularities of their context. Exported also Entities so that these can be extended. Added "name" attribute on Environment.
* v 0.1.2: Added more tests, binded Notifiers, Environment and Motion detectors together.
* v 0.1.1: Adding BaseNotifier classes on the main module so that we can start using this package. Fixed issues with adding event listeners. Environment can now bind and unbind movement sensors.  
** Added a few more unit tests  
** Can add and remove notifiers  
** When starting motion senting (via Start) notifications from all notifiers should be pushed;  
** When removing a motion sensor a final notification should come from that notifier;  
* v 0.1.0: Initial version with internal Environment and Motion Detector objects and unit tests;
