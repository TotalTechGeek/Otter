const cloneDeep = require('lodash/cloneDeep')
// eslint-disable-next-line no-unused-vars
const fs = require('fs-extra')
const CollectionBuilder = require('./CollectionBuilder')
const Schema = require('./Schema')
const { RequestExtraction } = require('./Extraction')
const ProjectFileStructure = require('./ProjectFileStructure')
const CodeBuilder = require('./CodeBuilder')
const { convertSwagger } = require('./SwaggerBuilder')
const Name = require('./name')

function replaceModels (i) {
  if (i && i.$model) {
    return { ...CodeBuilder.models[i.$model], meta: { ...CodeBuilder.models[i.$model].meta, required: i.required } }
  }
  return i
}

function toJson (i) {
  if (i && i.toJSON) return i.toJSON()
  return i
}

function traverse (obj, mutator, pre) {
  if (pre) obj = pre(obj)
  if (obj && typeof obj === 'object') {
    Object.keys(obj).forEach(key => {
      if (obj[key] && typeof obj[key] === 'object') {
        if (Array.isArray(obj[key])) {
          obj[key].forEach(i => traverse(i, mutator, pre))
        } else {
          traverse(obj[key], mutator, pre)
        }
      }
      obj[key] = mutator(obj[key])
    })
    return mutator(obj)
  } else {
    return mutator(obj)
  }
}

module.exports = function (config) {
  const TypeToType = {
    number: 'Number',
    integer: 'Number',
    string: 'String',
    array: 'Array',
    object: 'Object',
    boolean: 'Boolean'
  }

  ProjectFileStructure.init()

  const collection = new CollectionBuilder('./collection.json')

  Object.keys(config.models || {}).forEach(model => {
    if (config.models[model].toJSON) config.models[model] = config.models[model].toJSON()

    if (typeof config.models[model] === 'object') {
      CodeBuilder.addModel(traverse(config.models[model], replaceModels), model)
    }
  })

  if (!fs.existsSync('./swagger.yaml')) {
    try {
      fs.writeFileSync('./swagger.yaml', convertSwagger(traverse(config, replaceModels, toJson)))
    } catch (ex) {
      console.error(ex)
    }
  }
  Object.keys(config.domains || {}).forEach(domain => {
    if (typeof config.domains[domain] === 'object') {
      ProjectFileStructure.createDomain(domain)

      const actionValidation = {}
      const endpoints = {}

      endpoints.route = config.domains[domain].route

      const actions = Object.keys(config.domains[domain]).filter(i => typeof config.domains[domain][i] === 'object')
      const tree = CodeBuilder.project.addSourceFileAtPath(ProjectFileStructure.getDomainActionTree(domain))
      const extractionTree = CodeBuilder.project.addSourceFileAtPath(ProjectFileStructure.getDomainTree(domain, 'extractions.js'))
      const authorizationTree = CodeBuilder.project.addSourceFileAtPath(ProjectFileStructure.getDomainTree(domain, 'authorizations.js'))
      const afterTree = CodeBuilder.project.addSourceFileAtPath(ProjectFileStructure.getDomainTree(domain, 'after.js'))

      const extractions = []
      const authorizations = []
      const after = []

      collection.addFolder(domain)

      actions.forEach(action => {
        const input = traverse(config.domains[domain][action].input, replaceModels, toJson)

        const actionSchema = Schema.object(input).toJSON()

        if (config.domains[domain][action].endpoint) {
          const endpoint = cloneDeep(config.domains[domain][action].endpoint)

          if (endpoint.extract) {
            // todo: deprecate Extract
            Object.keys(endpoint.extract).forEach(key => {
              // switch it to use the json-path model instead
              if (endpoint.extract[key] instanceof RequestExtraction) {
                endpoint.extract[key] = `$.${endpoint.extract[key].data.from}.${endpoint.extract[key].data.item || key}`
                console.warn(`The extract interface is deprecated, use: "${endpoint.extract[key]}" on field "${key}" under ${domain}/${action}`)
              }

              // if the key uses commas, spread it out
              if (key.includes(',')) {
                const value = endpoint.extract[key]
                delete endpoint.extract[key]
                key.split(',').forEach(key => {
                  endpoint.extract[key] = `${value}.${key}`
                })
              }
            })
          }

          CodeBuilder.addOrUpdateFunction(extractionTree, action, {
            req: 'any',
            res: 'any',
            data: 'any'
          }, {
            isAsync: true,
            statements: ['return data'],
            description: config.domains[domain][action].description
          })

          extractions.push(action)

          if (endpoint.authorize) {
            authorizations.push(action)
            CodeBuilder.addOrUpdateFunction(authorizationTree, action, {
              req: 'any',
              res: 'any',
              data: CodeBuilder.combineParameters(actionSchema.properties)
            }, {
              isAsync: true,
              statements: ['return true'],
              description: config.domains[domain][action].description
            })
          }

          if (endpoint.after) {
            after.push(action)
            CodeBuilder.addOrUpdateFunction(afterTree, action, {
              req: 'any',
              res: 'any',
              data: 'any'
            }, {
              isAsync: true,
              statements: ['return data'],
              description: config.domains[domain][action].description
            })
          }

          if (endpoint.validate) {
            Object.keys(endpoint.validate).forEach(part => {
              let skipRecommendation = false
              if (endpoint.validate[part] === '!input') {
                endpoint.validate[part] = config.domains[domain][action].input
                skipRecommendation = true
              }

              if (endpoint.validate[part].$model) skipRecommendation = true

              const schema = traverse(endpoint.validate[part], replaceModels, toJson)
              if (schema.type) {
                endpoint.validate[part] = toJson(schema)
              } else {
                endpoint.validate[part] = Schema.object(schema).toJSON()
              }

              if (!skipRecommendation && JSON.stringify(actionSchema) === JSON.stringify(endpoint.validate[part])) {
                console.warn(`Redundancy detected, use {"${part}": "!input"} as a shorthand for the validation under ${domain}/${action}`)
              }
            })
          }

          collection.addRequest(domain, action, endpoint, endpoints.route || '')
          endpoints[action] = endpoint
        }

        let output = traverse(config.domains[domain][action].output, replaceModels, toJson)
        output = Schema.convert(output) || output
        const actionOutputSchema = output ? output.toJSON ? output.toJSON() : output : null
        actionValidation[action] = { input: actionSchema, output: actionOutputSchema }

        const commentValues = {}
        Object.keys(actionSchema.properties).forEach(prop => {
          commentValues[prop] = TypeToType[actionSchema.properties[prop].type] || '*'
        })

        CodeBuilder.addOrUpdateFunction(tree, action, CodeBuilder.combineParameters(actionSchema.properties, actionSchema.required), {
          isAsync: true,
          description: config.domains[domain][action].description
        })
      })

      CodeBuilder.updateExports(tree, actions)
      CodeBuilder.updateExports(extractionTree, extractions)
      CodeBuilder.updateExports(authorizationTree, authorizations)
      CodeBuilder.updateExports(afterTree, after)

      CodeBuilder.modifyEnd(tree)
      CodeBuilder.modifyEnd(extractionTree)
      CodeBuilder.modifyEnd(authorizationTree)
      CodeBuilder.modifyEnd(afterTree)

      tree.saveSync()
      extractionTree.saveSync()
      authorizationTree.saveSync()
      afterTree.saveSync()

      ProjectFileStructure.saveDomainRoutesExport(domain)

      ProjectFileStructure.writeDomainConfig(domain, 'actionValidations.json', JSON.stringify(actionValidation, undefined, 2))
      ProjectFileStructure.writeDomainConfig(domain, 'endpoints.json', JSON.stringify(endpoints, undefined, 2))
    }
  })
  ProjectFileStructure.saveActionsExport(Object.keys(config.domains))
  ProjectFileStructure.saveRoutesExport(Object.keys(config.domains))

  Object.keys(config.externals || {}).forEach(domain => {
    if (typeof config.externals[domain] === 'object') {
      ProjectFileStructure.createExternal(domain)

      const actions = Object.keys(config.externals[domain]).filter(i => typeof config.externals[domain][i] === 'object')
      const tree = CodeBuilder.project.addSourceFileAtPath(ProjectFileStructure.getActualExternalTree(domain))
      const tree2 = CodeBuilder.project.addSourceFileAtPath(ProjectFileStructure.getMockExternalTree(domain))
      const actionValidation = {}

      actions.forEach(action => {
        const input = traverse(config.externals[domain][action].input, replaceModels, toJson)
        let output = traverse(config.externals[domain][action].output, replaceModels, toJson)
        const actionSchema = Schema.object(input).toJSON()
        output = Schema.convert(output) || output
        const actionOutputSchema = output ? output.toJSON ? output.toJSON() : output : null
        actionValidation[action] = { input: actionSchema, output: actionOutputSchema }

        const commentValues = {}
        Object.keys(actionSchema.properties || {}).forEach(prop => {
          commentValues[prop] = TypeToType[actionSchema.properties[prop].type] || '*'
        })

        CodeBuilder.addOrUpdateFunction(tree, action, CodeBuilder.combineParameters(actionSchema.properties, actionSchema.required), {
          isAsync: true
        })

        CodeBuilder.addOrUpdateFunction(tree2, action, CodeBuilder.combineParameters(actionSchema.properties, actionSchema.required), {
          isAsync: true
        })
      })

      CodeBuilder.updateExports(tree, actions)
      CodeBuilder.updateExports(tree2, actions)

      ProjectFileStructure.writeExternalConfig(`${domain}Validations`, JSON.stringify(actionValidation, undefined, 2))

      tree.saveSync()
      tree2.saveSync()
    }
  })

  ProjectFileStructure.saveActualExternalsExport(Object.keys(config.externals || {}))
  ProjectFileStructure.saveMockExternalsExport(Object.keys(config.externals || {}))

  ;(config.plugins || []).forEach(plugin => {
    ProjectFileStructure.createPlugin(plugin)
  })

  fs.writeFileSync(`./models.${Name.name.toLowerCase()}.js`, CodeBuilder.structures.join('\n'))
  fs.writeJSONSync('./collection.json', collection.toJSON())
}
