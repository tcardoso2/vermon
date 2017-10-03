profiles = {
  default: {
    SystemEnvironment: {
      command: "ping -c 1 localhost"
    },
    BaseNotifier: {
      name: "My Notifier"
    },
    MotionDetector: [{
      name: "MD 3"
    },
    {
      name: "MD 4"
    }],
    SystemEnvironmentFilter: [
    {
      freeMemBelow: 300000,
      applyTo: ["MD 3", "MD 4"],
      stdoutMatchesRegex: "Will never match this value"
    }]
  }
}

exports.profiles = profiles;
exports.default = profiles.default;