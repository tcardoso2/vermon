profiles = {
  default: {
    NodeEnvironment: {
    },
    //Workaround: A Dummy Motion detector seems to be always required
    //            for the NodeEnvironment to be able to create detectors
    MotionDetector: [{
      name: 'MD 1'
    }]
  }
}

exports.profiles = profiles
exports.default = profiles.default
