const cloneDeep = require('lodash/cloneDeep')
// eslint-disable-next-line no-unused-vars
const fs = require('fs-extra')
const CollectionBuilder = require('./CollectionBuilder')
const Schema = require('./Schema')
const ProjectFileStructure = require('./ProjectFileStructure')
const CodeBuilder = require('./CodeBuilder')
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

  Object.keys(config.domains || {}).forEach(domain => {
    if (typeof config.domains[domain] === 'object') {
      ProjectFileStructure.createDomain(domain)

      const actionValidation = {}
      const endpoints = {}

      endpoints.route = config.domains[domain].route

      const actions = Object.keys(config.domains[domain]).filter(i => typeof config.domains[domain][i] === 'object')
      let tree = ProjectFileStructure.getDomainActionTree(domain)
      let extractionTree = ProjectFileStructure.getDomainTree(domain, 'extractions.js')
      let authorizationTree = ProjectFileStructure.getDomainTree(domain, 'authorizations.js')
      let afterTree = ProjectFileStructure.getDomainTree(domain, 'after.js')

      const extractions = []
      const authorizations = []
      const after = []

      collection.addFolder(domain)

      actions.forEach(action => {
        if (config.domains[domain][action].endpoint) {
          const endpoint = cloneDeep(config.domains[domain][action].endpoint)

          extractionTree = CodeBuilder.addExtractionFunction(extractionTree, action)
          extractions.push(action)

          if (endpoint.authorize) {
            authorizations.push(action)
            authorizationTree = CodeBuilder.addAuthorizationFunction(authorizationTree, action)
          }

          if (endpoint.after) {
            after.push(action)
            afterTree = CodeBuilder.addExtractionFunction(afterTree, action)
          }

          if (endpoint.extract) {
            Object.keys(endpoint.extract).forEach(extract => {
              endpoint.extract[extract] = endpoint.extract[extract].toJSON ? endpoint.extract[extract].toJSON() : endpoint.extract[extract]
            })
          }

          if (endpoint.validate) {
            Object.keys(endpoint.validate).forEach(part => {
              endpoint.validate[part] = Schema.object(endpoint.validate[part]).toJSON()
            })
          }

          collection.addRequest(domain, action, endpoint, endpoints.route || '')

          endpoints[action] = endpoint
        }

        const input = config.domains[domain][action].input
        let output = config.domains[domain][action].output
        const actionSchema = Schema.object(input).toJSON()
        output = Schema.convert(output) || output
        const actionOutputSchema = output ? output.toJSON ? output.toJSON() : output : null
        actionValidation[action] = { input: actionSchema, output: actionOutputSchema }

        const commentValues = {}
        Object.keys(actionSchema.properties).forEach(prop => {
          commentValues[prop] = TypeToType[actionSchema.properties[prop].type] || '*'
        })

        tree = CodeBuilder.updateOrAddFunction(tree, action, {
          params: [CodeBuilder.createObjectParam(Object.keys(actionSchema.properties))],
          leadingComments: [
            CodeBuilder.generateComment(commentValues)
          ]
        })
      })

      if (!CodeBuilder.checkIfExportIsPlugin(tree)) { tree = CodeBuilder.updateExports(tree, actions) }
      if (!CodeBuilder.checkIfExportIsPlugin(authorizationTree)) { authorizationTree = CodeBuilder.updateExports(authorizationTree, authorizations) }
      if (!CodeBuilder.checkIfExportIsPlugin(extractionTree)) { extractionTree = CodeBuilder.updateExports(extractionTree, extractions) }
      if (!CodeBuilder.checkIfExportIsPlugin(afterTree)) { afterTree = CodeBuilder.updateExports(afterTree, after) }

      ProjectFileStructure.saveDomainTree(domain, 'authorizations.js', authorizationTree)
      ProjectFileStructure.saveDomainTree(domain, 'extractions.js', extractionTree)
      ProjectFileStructure.saveDomainTree(domain, 'after.js', afterTree)

      ProjectFileStructure.saveDomainRoutesExport(domain)

      ProjectFileStructure.writeDomainConfig(domain, 'actionValidations.json', JSON.stringify(actionValidation))
      ProjectFileStructure.writeDomainConfig(domain, 'endpoints.json', JSON.stringify(endpoints))

      ProjectFileStructure.saveDomainActionTree(domain, tree)
    }
  })
  ProjectFileStructure.saveActionsExport(Object.keys(config.domains))
  ProjectFileStructure.saveRoutesExport(Object.keys(config.domains))

  Object.keys(config.externals || {}).forEach(domain => {
    if (typeof config.externals[domain] === 'object') {
      ProjectFileStructure.createExternal(domain)

      const actions = Object.keys(config.externals[domain]).filter(i => typeof config.externals[domain][i] === 'object')
      let tree = ProjectFileStructure.getActualExternalTree(domain)
      let tree2 = ProjectFileStructure.getMockExternalTree(domain)
      const actionValidation = {}

      actions.forEach(action => {
        const input = config.externals[domain][action].input
        let output = config.externals[domain][action].output
        const actionSchema = Schema.object(input).toJSON()
        output = Schema.convert(output) || output
        const actionOutputSchema = output ? output.toJSON ? output.toJSON() : output : null
        actionValidation[action] = { input: actionSchema, output: actionOutputSchema }

        const commentValues = {}
        Object.keys(actionSchema.properties || {}).forEach(prop => {
          commentValues[prop] = TypeToType[actionSchema.properties[prop].type] || '*'
        })

        tree = CodeBuilder.updateOrAddFunction(tree, action, {
          params: [CodeBuilder.createObjectParam(Object.keys(actionSchema.properties || {}))],
          leadingComments: [
            CodeBuilder.generateComment(commentValues)
          ]
        })

        tree2 = CodeBuilder.updateOrAddFunction(tree2, action, {
          params: [CodeBuilder.createObjectParam(Object.keys(actionSchema.properties || {}))],
          leadingComments: [
            CodeBuilder.generateComment(commentValues)
          ]
        })
      })

      tree = CodeBuilder.updateExports(tree, actions)
      tree2 = CodeBuilder.updateExports(tree2, actions)

      ProjectFileStructure.writeExternalConfig(`${domain}Validations`, JSON.stringify(actionValidation))

      ProjectFileStructure.saveActualExternalTree(domain, tree)
      ProjectFileStructure.saveMockExternalTree(domain, tree2)
    }
  })

  ProjectFileStructure.saveActualExternalsExport(Object.keys(config.externals || {}))
  ProjectFileStructure.saveMockExternalsExport(Object.keys(config.externals || {}))

  ;(config.plugins || []).forEach(plugin => {
    ProjectFileStructure.createPlugin(plugin)
  })

  fs.writeJSONSync('./collection.json', collection.toJSON())
}
