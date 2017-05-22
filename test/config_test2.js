profiles = {
  default: {
  	Environment: {},
  	PIRMotionDetector: {
          pin: 17
        },
	SlackNotifier: {
	  name: "My Slack channel",
	  key: "https://hooks.slack.com/services/<MySlackURL>"
	}
  }
}

exports.profiles = profiles;
exports.default = profiles.default;
