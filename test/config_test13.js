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
      freeMemBelow: 300000000,
      applyTo: "MD 1",
    }]
  }
}

exports.profiles = profiles;
exports.default = profiles.default;