//TODO: Add custom messages here instead of main.js

class MissingConfigError extends Error {
  constructor(message) {
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