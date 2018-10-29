profiles = {
  default: {
    SystemEnvironment: {
      command: 'ping -c 1 localhost'
    },
    RaspistillNotifier: {
      name: 'My Raspistill Notifier',
      fileName: 'image_' + Date.now()
    },
    FileDetector: {
      name: 'File Detector 16 - should notify',
      path: 'photos',
      sendOld: true
    },
    BaseDetector: [{
      name: 'MD 1'
    },
    {
      name: 'MD 2'
    }],
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
