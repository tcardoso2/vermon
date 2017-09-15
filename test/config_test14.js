profiles = {
  default: {
    SystemEnvironment: {
      command: "ping -c 1 localhost",
      interval: 0
    },
    MotionDetector: {
      name: "MD 1",
    },
    BaseNotifier: {
    },
    SystemEnvironmentFilter: [
    {
      freeMemBelow: 0,
      applyTo: "MD 1",
      stdoutMatchesRegex: "1 packets transmitted, 1 packets received, 0.0% packet loss"
    }]
  }
}

exports.profiles = profiles;
exports.default = profiles.default;