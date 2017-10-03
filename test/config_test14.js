profiles = {
  default: {
    SystemEnvironment: {
      command: "echo t-motion",
      interval: 0
    },
    MotionDetector: {
      name: "MD 1",
    },
    BaseNotifier: {
    },
    SystemEnvironmentFilter: [
    {
      freeMemBelow: 1000,
      applyTo: "MD 1",
      stdoutMatchesRegex: "t-motion"
    }]
  }
}

exports.profiles = profiles;
exports.default = profiles.default;