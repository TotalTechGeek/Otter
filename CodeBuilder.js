const jsdoc = require('json-schema-to-jsdoc')
const { Project, IndentationText } = require('ts-morph')
const name = require('./name')
const standard = require('standard')
const crypto = require('crypto')

// todo: combine these 4
const models = {}
const structures = []
const names = new Set()
const lookup = {}

const project = new Project({
  compilerOptions: {
    allowJs: true
  },
  manipulationSettings: {
    indentationText: IndentationText.TwoSpaces,
    insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: true
  }
})

function addLookup (schema, name) {
  lookup[hashSchema(schema)] = name
}

function hashSchema (schema) {
  return crypto.createHash('sha256').update(JSON.stringify({ ...schema, title: null, $tracked: null, $jsdoc: null })).digest('base64')
}

function createAnonymousModel (schema) {
  if (lookup[hashSchema(schema)]) {
    return lookup[hashSchema(schema)]
  }
  const title = schema.title || `${name.name}Obj${structures.length}`
  if (names.has(title)) throw new Error(`JSDoc model name: ${title} used twice`)
  names.add(title)
  models[title] = { ...schema, title }
  structures.push(jsdoc({ ...schema, title }))
  addLookup(schema, title)
  return title
}

function addModel (schema, backupName) {
  if (schema.toJSON) schema = schema.toJSON()
  const title = schema.title || backupName
  if (names.has(title)) throw new Error(`JSDoc model name: ${title} used twice`)
  names.add(title)
  models[title] = { ...schema, title, $tracked: true }
  structures.push(schema.$jsdoc || jsdoc({ ...schema, title }))
  addLookup(schema, title)
  return title
}

function convertType (schema, required) {
  if (!required) {
    return `${convertType(schema, true)}?`
  }
  if (typeof schema === 'string') return schema
  if (schema.toJSON) schema = schema.toJSON()
  if (schema.$tracked) return schema.title
  const TypeToType = {
    number: 'Number',
    integer: 'Number',
    string: 'String',
    array: 'Array',
    boolean: 'Boolean'
  }

  if (schema.type === 'object') {
    return createAnonymousModel(schema)
  }

  return TypeToType[schema.type] || 'any'
}

function addOrUpdateFunction (file, name, parameters, { statements, isAsync, description } = { isAsync: false }) {
  const isTs = !file.getBaseName().endsWith('.js')

  const func = file.getFunction(name) || (file.addFunction({ name, isAsync, statements }) && file.getFunction(name))

  func.setIsAsync(Boolean(isAsync))
  func.getParameters().forEach(i => i.remove())
  func.getJsDocs().forEach(i => i.remove())

  Object.keys(parameters).forEach(parameter => {
    func.addParameter({
      name: parameter,
      type: isTs ? `${convertType(parameters[parameter], true)}` : null
    })
  })

  func.replaceWithText(standard.lintTextSync(func.getText(), { fix: true }).results[0].output.trim())
  func.addJsDoc({
    description,
    tags: Object.keys(parameters).map(param => {
      const end = parameters[param].description ? ' - ' + parameters[param].description : ''
      let type = convertType(parameters[param].schema || parameters[param], true)
      if (type.endsWith('?')) {
        type = type.substring(0, type.length - 1)
        param = `[${param}]`
      }
      return {
        tagName: 'param',
        text: `{${type.schema || type}} ${parameters[param].documented || param}${end}`
      }
    })
  })
}

function combineParameters (params, required = []) {
  const written = `{${Object.keys(params).join(', ')}}`
  const documented = `${Object.keys(params).join('_')}`
  const result = {
    [written]: {
      schema: `{ ${Object.keys(params).map(i => {
        return `${i}${required.includes(i) ? '' : '?'}: ${convertType(params[i], true)}`
    }).join(', ')} }`,
      documented
    }
  }

  return result
}

function updateExports (file, arr) {
  const exports = file.getStatements().filter(i => i.constructor.name === 'ExpressionStatement' && i.getText().trim().startsWith('module.exports ='))
  if (exports.length) {
    exports.forEach(i => i.replaceWithText(`module.exports = { \n${arr.join(',\n')}\n }`).formatText())
  } else {
    file.addStatements(`module.exports = { \n${arr.join(',\n')}\n }`).forEach(i => i.formatText())
  }
}

function modifyEnd (file) {
  file.replaceWithText(file.getFullText().trim() + '\n')
}

module.exports = {
  combineParameters,
  project,
  structures,
  models,
  addOrUpdateFunction,
  updateExports,
  modifyEnd,
  addModel
}
