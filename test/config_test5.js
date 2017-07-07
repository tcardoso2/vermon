profiles = {
  default: {
    TestEnvironment: {
      params: {
        name: "My Test Environment"
      }
    },
    MotionDetector: {
      name: "MD 1"
    },
    BaseNotifier: {
    }
  }
}

exports.profiles = profiles;
exports.default = profiles.default;