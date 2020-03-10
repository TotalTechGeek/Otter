const Ajv = require('ajv')
const cloneDeep = require('lodash/cloneDeep')
const ajvCompiler = new Ajv()
const Schema = require('./Schema')

class ValidationError extends Error {
  constructor (errors, functionName, actual) {
    super()
    this.functionName = functionName
    this.name = 'ValidationError'
    this.errors = errors
    this.message = JSON.stringify(errors)
    this.actual = actual
    this.response = { name: this.name, errors: this.errors, stack: this.stack, functionName, actual: this.actual }
  }
}

function outputValidator (outputValidation, result, func) {
  if (result && result.then) {
    return result.then(result => outputValidator(outputValidation, result, func))
  }

  if (outputValidation(result)) {
    return result
  }

  throw new ValidationError(cloneDeep(outputValidation.errors), func.name, result)
}

class Handler {
  /**
     * @param {Object} schema
     * @param {Function} func
     */
  wrapFunction (schema, func) {
    let { input, output } = schema
    if (!input && !output) input = schema

    if (output) {
      if (!output.type) {
        output = Schema.convert(output) || output
      }

      if (output.toJSON) {
        output = output.toJSON()
      }
    }

    if (input) {
      // if(!input.type) input = Schema.convert(input) || input
      if (input.toJSON) input = input.toJSON()

      if (input.type !== 'array') {
        input = Schema.array().items(input).toJSON()
      }

      const inputValidation = ajvCompiler.compile(input)

      if (output) {
        const outputValidation = ajvCompiler.compile(output)
        return function () {
          const args = [...arguments]
          if (inputValidation(args)) {
            const result = func.apply(this, arguments)
            return outputValidator(outputValidation, result, func)
          }

          throw new ValidationError(cloneDeep(inputValidation.errors), func.name, args)
        }
      }

      return function () {
        const args = [...arguments]
        if (inputValidation(args)) {
          return func.apply(this, arguments)
        }

        throw new ValidationError(cloneDeep(inputValidation.errors), func.name, args)
      }
    } else if (output) {
      const outputValidation = ajvCompiler.compile(output)

      return function () {
        const result = func.apply(this, arguments)
        return outputValidator(outputValidation, result, func)
      }
    }

    return func
  }

  /**
     *
     * @param {Object} configuration
     * @param {Object} obj
     */
  wrapUnenumerable (configuration, obj) {
    Object.getOwnPropertyNames(obj).forEach(item => {
      if (typeof obj[item] === 'function' && Object.prototype.hasOwnProperty.call(configuration, item)) {
        obj[item] = this.wrapFunction(configuration[item], obj[item])
      }
    })
  }

  /**
     *
     * @param {Object} configuration
     * @param {Object} obj
     */
  wrap (configuration, obj) {
    Object.keys(obj).forEach(item => {
      if (typeof obj[item] === 'function' && Object.prototype.hasOwnProperty.call(configuration, item)) {
        obj[item] = this.wrapFunction(configuration[item], obj[item])
      }
    })
  }
}

module.exports = { Handler: new Handler(), ValidationError }
