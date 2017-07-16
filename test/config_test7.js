profiles = {
  default: {
    TestEnvironment: {
      params: {
        name: "My Test Environment"
      }
    },
    MotionDetector: {
      name: "MD 2"
    },
    //Unfortunately, the configuration still does not allow 2 entities of the same type,
    //as that repeates the key in the key-value dictionary, for now this is a constraint.
    PIRMotionDetector: {
      pin: 17,
      name: "MD 1"
    },
    BaseNotifier: {
    },
    HighPassFilter: {
      val : 8
    }  
  }
}

exports.profiles = profiles;
exports.default = profiles.default;