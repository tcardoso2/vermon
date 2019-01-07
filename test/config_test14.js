profiles = {
  default: {
    SystemEnvironment: {
      command: 'echo We Are Vermon!'
    },
    MotionDetector: {
      name: 'MD 1'
    },
    BaseNotifier: {
    },
    SystemEnvironmentFilter: [
      {
        freeMemBelow: 1000,
        applyTo: 'MD 1',
        stdoutMatchesRegex: 'We Are Vermon!'
      }]
  }
}

exports.profiles = profiles
exports.default = profiles.default
