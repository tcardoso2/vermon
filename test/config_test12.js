profiles = {
  default: {
    SystemEnvironment: {
      command: 'pwd',
      interval: 100
    },
    MotionDetector: {
      name: 'MD 1'
    },
    BaseNotifier: {
    }
  }
}

exports.profiles = profiles
exports.default = profiles.default
