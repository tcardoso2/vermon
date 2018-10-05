//TODO: Add custom messages here instead of main.js

class MissingConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

class MissingPluginError extends Error {
  constructor(message = "vernon.use or (internal) AddPlugin requires a Plugin module as first argument.") {
    super(message);
    this.name = this.constructor.name;
  }
}

class TypeConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

exports.MissingConfigError = MissingConfigError;
exports.TypeConfigError = TypeConfigError;
exports.MissingPluginError = MissingPluginError;