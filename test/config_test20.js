profiles = {
  default: {
    MultiEnvironment: {
      params: {
        name: 'My MultiEnvironment',
        state: [
          {
            $new$Environment: {
              params: {
                name: 'Environment 1',
                state: 1
              }
            },
            $detectors$: {
              MotionDetector: {
                name: 'My detector'
              }
            }
          },
          {
            $new$Environment: {
              params: {
                name: 'Environment 2',
                state: 3
              }
            }
          }
        ]
      }
    }
  }
}

exports.profiles = profiles
exports.default = profiles.default
