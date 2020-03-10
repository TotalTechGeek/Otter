const ValidationHandler = require('./ValidationHandler')
const ErrorHandler = require('./ErrorHandler')
const OtterHandler = require('./OtterHandler')
const OtterExtraction = require('./OtterExtraction')
const OtterRouting = require('./RouteBuilder')
const Schema = require('./Schema')
const Crawler = require('./Crawler')
const ProjectBuilder = require('./ProjectBuilder')
const Store = require('./Store')
const Events = require('./Events')
module.exports = {
  Routes: {
    $: OtterRouting.$,
    EndpointNotValidatedError: OtterRouting.EndpointNotValidatedError,
    ExtractionUndefinedError: OtterRouting.ExtractionUndefinedError,
    OtterRouter: OtterRouting.OtterRouter
  },
  Store,
  Schema: Schema,
  Handler: OtterHandler,
  Validations: {
    Handler: ValidationHandler.Handler,
    ValidationError: ValidationHandler.ValidationError
  },
  ErrorHandler: ErrorHandler,
  Extract: OtterExtraction,
  Crawler: Crawler,
  Builder: ProjectBuilder,
  Events
}
