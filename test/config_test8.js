profiles = {
  default: {
    TestEnvironment: {
      params: {
        name: 'My Test Environment'
      }
    },
    MotionDetector: [
      {
        name: 'MD 2'
      },
      {
        name: 'MD 1'
      }],
    BaseNotifier: {},
    HighPassFilter: [
      {
        val: 8,
        applyTo: 'MD 1'
      },
      {
        val: 4,
        applyTo: 'MD 2'
      }]
  }
}

exports.profiles = profiles
exports.default = profiles.default
