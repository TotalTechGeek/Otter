const { Handler, ValidationError } = require('./ValidationHandler')
const ErrorHandler = require('./ErrorHandler')
const fs = require('fs-extra')
class OtterHandler {
  /**
     *
     * @param {Object} configuration
     * @param {Object} obj
     */
  wrap (configuration, obj) {
    Handler.wrap(configuration, obj)
    ErrorHandler.wrap(obj)
    return obj
  }

  wrapUnenumerable (configuration, obj) {
    Handler.wrapUnenumerable(configuration, obj)
    ErrorHandler.wrapUnenumerable(obj)
    return obj
  }

  wrapLoad (configurationFile, obj) {
    const configuration = JSON.parse(fs.readFileSync(`${configurationFile}.json`).toString())
    return this.wrap(configuration, obj)
  }
}

module.exports = new OtterHandler()
module.exports.ValidationError = ValidationError
