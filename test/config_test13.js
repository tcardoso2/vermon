profiles = {
  default: {
    SystemEnvironment: {
      command: "pwd",
      interval: 500
    },
    MotionDetector: {
      name: "MD 1",
    },
    BaseNotifier: {
    },
    SystemEnvironmentFilter: [
    {
      applyTo: "MD 1",
      freeMemBelow: 300000,
      stdoutMatchesRegex: ""
    }]
  }
}

exports.profiles = profiles;
exports.default = profiles.default;