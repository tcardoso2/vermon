# t-motion-detector
A NodeJS Motion detector, initially aimed for Raspberry Pi

* v 0.1.2: Added more tests, binded Notifiers, Environment and Motion detectors together.
* v 0.1.1: Adding BaseNotifier classes on the main module so that we can start using this package. Fixed issues with adding event listeners. Environment can now bind and unbind movement sensors.  
** Added a few more unit tests  
** Can add and remove notifiers  
** When starting motion senting (via Start) notifications from all notifiers should be pushed;  
** When removing a motion sensor a final notification should come from that notifier;  
* v 0.1.0: Initial version with internal Environment and Motion Detector objects and unit tests;
