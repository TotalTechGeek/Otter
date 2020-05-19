const Schema = require('./Schema')
const yaml = require('json-to-pretty-yaml')

function toJson (x) {
  if (Schema.convert(x)) return Schema.convert(x).data // ?
  if (x.toJSON) return x.toJSON()
  return x
}

function getEndpoints (config) {
  return Object.keys(config.domains).flatMap(key => {
    return Object.keys(config.domains[key]).map(key2 => {
      if (config.domains[key][key2].endpoint) {
        const endpoint = config.domains[key][key2].endpoint
        let route = endpoint.route
        const endpointDocument = {}
        if (route) {
          if (route.includes(':')) {
            const match = route.match(/:[a-zA-Z]+\/?/g)
            if (match && match.length) {
              const matchesFiltered = match.map(i => i.replace(/\//g, ''))
              matchesFiltered.forEach(i => {
                route = route.replace(i, `{${i.substring(1)}}`)
              })
            }
          }
        }

        if (endpoint.validate) {
          if (endpoint.validate.params) {
            const params = endpoint.validate.params
            endpointDocument.parameters = Object.keys(params).map(i => {
              const json = toJson(params[i])
              console.log(route, json)
              return {
                name: i,
                in: 'path',
                required: true,
                schema: json // ?
              }
            })
          }

          if (endpoint.validate.query) {
            const params = endpoint.validate.query // ?'
            const requiredCheck = Schema.object(endpoint.validate.query).toJSON() // ?

            endpointDocument.parameters = (endpointDocument.parameters || []).concat(Object.keys(params).map(i => {
              const json = toJson(params[i])
              return {
                name: i,
                in: 'query',
                required: requiredCheck.required.includes(i),
                schema: json
              }
            }))
          }

          if (endpoint.validate.body) {
            const body = Schema.object(endpoint.validate.body).toJSON() // ?
            endpointDocument.requestBody = { content: { 'application/json': { schema: body } } }
          }
        }

        endpointDocument.responses = [{
          200: {
            description: 'a successful call'
          }
        }].reduce((accum, i) => Object.assign(accum, i), {})

        endpointDocument.route = (config.domains[key].route || '') + (route || '/')
        if (endpointDocument.route.endsWith('/')) endpointDocument.route = endpointDocument.route.substring(0, endpointDocument.route.length - 1)
        endpointDocument.method = endpoint.method || 'GET'
        return endpointDocument
      }
    })
  }).filter(i => i)
}

function getEndpoints2 (config) {
  return getEndpoints(config).reduce((accum, i) => {
    accum[i.route] = Object.assign(accum[i.route] || {}, {
      [i.method.toLowerCase()]: {
        parameters: i.parameters,
        responses: i.responses,
        requestBody: i.requestBody
      }
    })
    return accum
  }, {})
}

function convertSwagger (config) {
  const paths = getEndpoints2(config)

  return yaml.stringify({ info: { title: config.title, version: config.version }, paths, openapi: '3.0.3' })
}

module.exports = { convertSwagger }
