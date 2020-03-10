const fs = require('fs-extra')
const { Router } = require('express')

const OtterHandler = require('./OtterHandler')
const Schema = require('./Schema')
const Events = require('./Events')
const process = require('process')

const { JSONPath } = require('jsonpath-plus')
const Ajv = require('ajv')

const validationCompiler = new Ajv()

function $ (func) {
  return async function (req, res, next) {
    try {
      await func(req, res, next)
    } catch (err) {
      Events.emit('RouteError', { req, res, err, ...req.otter })
      if (err.response) {
        let response = err.response
        if (typeof err.response === 'function') {
          response = err.response()
        }
        response = await response

        return res.status(response.status || 400).json(response)
      }
      return res.status(400).json({ name: 'UnknownError', message: 'An error has occurred.', status: 400, stack: err.stack })
    }
  }
}

class OtterExtraction {
  static extract (extractions, req, res) {
    const data = {}

    Object.keys(extractions).forEach(extract => {
      const extractConfig = extractions[extract]
      if (extractConfig.type === 'request') {
        if (extractConfig.from.startsWith('$')) {
          data[extract] = JSONPath({
            path: extractConfig.from,
            resultType: 'value',
            json: req
          })[0]
        } else {
          data[extract] = (req[extractConfig.from] || {})[extractConfig.item || extract]
        }
      }
    })

    return data
  }
}

class EndpointNotValidatedError extends Error {
  constructor (route, name, errors, part) {
    super()
    this.name = 'EndpointNotValidatedError'
    this.message = `Validation for route: '${route}', action: '${name}' fails.`
    this.errors = errors
    this.part = part
    this.status = 400
    this.response = { name: this.name, message: this.message, errors: this.errors, part: this.part, status: 400 }
  }
}

class ExtractionUndefinedError extends Error {
  constructor (route, name) {
    super()
    this.name = 'ExtractionUndefinedError'
    this.message = `Extraction for route: '${route}', action: '${name}' does not return a data object`
    this.status = 400
    this.response = { name: this.name, message: this.message, status: this.status }
  }
}

class UnauthorizedError extends Error {
  constructor (route, name) {
    super()
    this.name = 'UnauthorizedError'
    this.status = 403
    this.message = `User does not have access to this endpoint ("${route}", action "${name}").`
    this.response = { name: this.name, status: this.status, message: this.message }
  }
}

class OtterRouter {
  constructor (actions) {
    this.router = Router()
    this.actions = actions
    this.extractions = {}
    this.authorizations = {}
    this.after = {}
  }

  /**
     *
     * @param {Array<String>} domains
     */
  composeFrom (domains) {
    domains.forEach(domain => {
      const endpoints = JSON.parse(fs.readFileSync(`${domain}/endpoints.json`).toString())
      this.router.use(endpoints.route || '', require(`${domain}/routes`))
    })
  }

  injectRoutes (routes) {
    Object.keys(routes).forEach(route => {
      if (typeof routes[route] === 'object') {
        routes[route].name = route
        this.inject(routes[route])
      }
    })
  }

  setExtractions (extractions) {
    this.extractions = extractions
  }

  inject (route) {
    let validations = {
      body: null,
      params: null,
      query: null
    }

    const looseNumberHandler = {
      params: [],
      query: []
    }

    if (route.validate) {
      Object.keys(validations).forEach(v => {
        if (route.validate[v]) {
          const schema = route.validate[v]

          if (v === 'query' || v === 'params') {
            Object.keys(schema.properties).forEach(prop => {
              const property = schema.properties[prop]
              if (property.type === 'number') {
                looseNumberHandler[v].push(prop)
              }
            })
          }

          validations[v] = validationCompiler.compile(schema)
          return
        }

        delete validations[v]
      })
    } else {
      validations = {}
    }

    this.router[(route.method || 'GET').toLowerCase()](route.route || '/', $(async (req, res, next) => {
      req.otter = req.otter || {}
      req.otter.data = {}
      req.otter.action = route.name
      req.otter.route = route.route
      req.otter.start = process.hrtime()

      Events.emit('EndpointCalled', { req, res, action: req.otter.action, route: req.otter.route })

      Object.keys(looseNumberHandler).forEach(reqPart => {
        looseNumberHandler[reqPart].forEach(prop => {
          if (!isNaN(req[reqPart][prop])) req[reqPart][prop] = parseFloat(req[reqPart][prop])
        })
      })

      if (route.extract) {
        req.otter.data = OtterExtraction.extract(route.extract, req, res)
      }

      Object.keys(validations).forEach(v => {
        const verified = validations[v](req[v])
        if (!verified) throw new EndpointNotValidatedError(route.route, route.name, validations[v].errors, v)
      })

      Events.emit('EndpointReady', { req, res, data: req.otter.data, action: req.otter.action, route: req.otter.route })

      if (this.extractions[route.name]) {
        req.otter.data = await this.extractions[route.name](req, res, req.otter.data)
        if (typeof req.otter.data === 'undefined') throw new ExtractionUndefinedError(route.route, route.name)
      }

      if (this.authorizations[route.name]) {
        const allowed = await this.authorizations[route.name](req, res, req.otter.data)
        if (!allowed) throw new UnauthorizedError(route.route, route.name)
      }

      const result = await this.actions[route.name](req.otter.data || {})

      if (this.after[route.name]) {
        const afterResult = await this.after[route.name](req, res, result)
        if (typeof afterResult !== 'undefined') { res.json(afterResult) }
        return
      }

      Events.emit('EndpointExecuted', { req, res, data: req.otter.data, action: req.otter.action, route: req.otter.route, result, executionTime: process.hrtime(req.otter.start) })

      res.json(result)
    }))
  }

  injectLoad (str) {
    const file = JSON.parse(fs.readFileSync(str).toString())
    return this.injectRoutes(file)
  }
}

OtterHandler.wrapUnenumerable({
  injectLoad: Schema.array([Schema.string()]),
  inject: Schema.object({
    method: Schema.string().pattern('GET|POST|PUT|PATCH|DELETE').optional(),
    extract: Schema.object({}).allowAdditional(true),
    route: Schema.string(),
    name: Schema.string().required()
  }).allowAdditional(true)
}, OtterRouter.prototype)

module.exports = { OtterRouter, $, EndpointNotValidatedError, ExtractionUndefinedError }
