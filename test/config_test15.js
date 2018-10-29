profiles = {
  default: {
    SystemEnvironment: {
      command: 'ping -c 1 localhost'
    },
    BaseNotifier: {
      name: 'My Base Notifier'
    },
    MotionDetector: {
      name: 'This detector 15 will notify'
    },
    FileDetector: {
      name: 'File Detector 15 - should not notify',
      path: 'photos',
      sendOld: false
    },
    SystemEnvironmentFilter: [
      {
        freeMemBelow: 300000,
        applyTo: 'MD 1',
        stdoutMatchesRegex: '1 packets transmitted, 1 packets received, 0.0% packet loss'
      }]
  }
}

exports.profiles = profiles
exports.default = profiles.default
