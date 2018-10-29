profiles = {
  default: {
    TestEnvironment: {
      params: {
        name: 'My Test Environment'
      }
    },
    MotionDetector: {
      name: 'MD 1'
    },
    BaseNotifier: {
    },
    HighPassFilter: {
      val: 8,
      applyTo: 'MD 1'
    }
  }
}

exports.profiles = profiles
exports.default = profiles.default
