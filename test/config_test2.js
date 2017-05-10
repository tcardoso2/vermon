profiles = {
  default: {
  	Environment: {},
  	MotionDetector: {},
	SlackNofitier: {
	  name: "My Slack channel",
	  key: "https://hooks.slack.com/services/<MySlackURL>"
	}
  }
}

exports.profiles = profiles;
exports.default = profiles.default;