profiles = {
  default: {
    Environment: {},
    MotionDetector: {
      name: 'MD 1'
    },
    BaseNotifier: {
    },
    HighPassFilter: [
      {
        val: 10,
        applyTo: 'MD 1'
      }]
  }
}

exports.profiles = profiles
exports.default = profiles.default
