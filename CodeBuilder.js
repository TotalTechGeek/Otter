const crawler = require('./Crawler')
const espree = require('espree')

function generateComment (func, start, end) {
  function generateCommentText (func) {
    let comment = '*\n *\n * @param {Object} obj'
    Object.keys(func).forEach(attr => {
      comment += `\n * @param {${func[attr]}} obj.${attr}`
    })
    return comment + '\n'
  }

  const value = generateCommentText(func)
  return {
    type: 'Block',
    value
  }
}

function updateOrAddFunction (tree, functionName, {
  params,
  start,
  end,
  leadingComments
}) {
  if (crawler.lookup(tree, `$.body.[?(@.type === 'FunctionDeclaration')]..[?(@.name === "${functionName}")]^`).length) {
    return updateFunctionParams(tree, functionName, {
      params,
      start,
      end,
      leadingComments
    })
  } else {
    return injectIntoBody(tree, generateStubFunction(functionName, {
      params,
      start,
      end,
      leadingComments
    }))
  }
}

function addExtractionFunction (tree, functionName) {
  if (!crawler.lookup(tree, `$.body.[?(@.type === 'FunctionDeclaration')]..[?(@.name === "${functionName}")]^`).length) {
    return injectIntoBody(tree, generateExtractionFunction(functionName))
  }
  return tree
}

function addAuthorizationFunction (tree, functionName) {
  if (!crawler.lookup(tree, `$.body.[?(@.type === 'FunctionDeclaration')]..[?(@.name === "${functionName}")]^`).length) {
    return injectIntoBody(tree, generateAuthorizationFunction(functionName))
  }
  return tree
}

function injectIntoBody (tree, ast) {
  tree.body = tree.body.concat([ast].flat())
  return tree
}

function espreeParseText (text) {
  return espree.parse(text, {
    ecmaVersion: 2019
  }).body
}

function updateFunctionParams (tree, functionName, {
  params,
  start,
  end,
  leadingComments
}) {
  return crawler.modify(tree, `$.body.[?(@.type === 'FunctionDeclaration')]..[?(@.name === "${functionName}")]^`, (item) => {
    if (item.type !== 'FunctionDeclaration') return item
    item.params = params
    if (leadingComments) item.leadingComments = leadingComments
    if (start) item.start = start
    if (end) item.end = end
    return item
  })
}

function createNameProperty (name) {
  return {
    type: 'Property',
    shorthand: true,
    method: false,
    computed: false,
    key: {
      type: 'Identifier',
      name: name
    },

    kind: 'init',
    value: {
      type: 'Identifier',
      name: name
    }
  }
}

function createProperty (identifierName, identifierValue) {
  if (typeof identifierValue === 'object') {
    return {
      type: 'Property',

      key: {
        type: 'Identifier',
        name: identifierName
      },
      value: identifierValue,
      kind: 'init'
    }
  }

  return {
    type: 'Property',

    key: {
      type: 'Identifier',
      name: identifierName
    },
    value: {
      type: 'Literal',
      value: identifierValue,
      raw: JSON.stringify(identifierValue)
    },
    kind: 'init'
  }
}

function updateOrAddProperty (props, identifierName, identifierValue) {
  const prop = props.find(i => i.key.name === identifierName)
  if (prop) {
    prop.value.value = identifierValue
    prop.value.raw = JSON.stringify(identifierValue)
  } else {
    props.push(createProperty(identifierName, identifierValue))
  }
}

function modifyFunctionCallProperties (tree, functionName, invokerName, properties) {
  return crawler.modify(tree, `$..[?(@.name==='${functionName}')]^.arguments.[?(@.type==='Identifier' && @.name === 'name')]^.[?(@.value=='${invokerName}')]^^`, (item) => {
    Object.keys(properties).forEach(property => {
      updateOrAddProperty(item, property, properties[property])
    })
    return item
  })
}

function createObjectParam (params) {
  return {
    type: 'ObjectPattern',

    properties: params.map(createNameProperty)
  }
}

function createObjectExpression (props) {
  return {
    type: 'ObjectExpression',
    properties: props
  }
}

function convertToAST (func) {
  return espree.parse(func.toString(), {
    ecmaVersion: 2019
  }).body[0]
}

function generateArrowFunction (params, isExpression, isAsync) {
  if (typeof isAsync === 'undefined') isAsync = true

  return {
    type: 'ArrowFunctionExpression',
    id: null,
    expression: isExpression,
    generator: false,
    async: true,

    params: params,
    body: {
      type: 'BlockStatement',
      body: []
    }
  }
}

function generateExtractionFunction (name) {
  return {
    type: 'FunctionDeclaration',
    id: {
      type: 'Identifier',
      name: name
    },
    expression: false,
    generator: false,
    async: true,
    params: [{
      type: 'Identifier',
      name: 'req'
    }, {
      type: 'Identifier',
      name: 'res'
    }, {
      type: 'Identifier',
      name: 'data'
    }],
    body: {
      type: 'BlockStatement',
      body: [{
        type: 'ReturnStatement',
        argument: {
          type: 'Identifier',
          name: 'data'
        }
      }]
    }
  }
}

function generateAuthorizationFunction (name) {
  return {
    type: 'FunctionDeclaration',
    id: {
      type: 'Identifier',
      name: name
    },
    expression: false,
    generator: false,
    async: true,
    params: [{
      type: 'Identifier',
      name: 'req'
    }, {
      type: 'Identifier',
      name: 'res'
    }, {
      type: 'Identifier',
      name: 'data'
    }],
    body: {
      type: 'BlockStatement',
      body: [{
        type: 'ReturnStatement',
        argument: {
          type: 'Identifier',
          name: 'true'
        }
      }]
    }
  }
}

function generateStubFunction (name, {
  params,
  start,
  end,
  leadingComments
}, isExpression, isAsync) {
  if (typeof isAsync === 'undefined') isAsync = true
  return {
    type: 'FunctionDeclaration',
    id: {
      type: 'Identifier',
      name: name
    },
    start: start,
    leadingComments: leadingComments,
    end: end,
    expression: isExpression,
    generator: false,
    async: isAsync,
    params: params,
    body: {
      type: 'BlockStatement',
      body: []
    }
  }
}

function updateExports (tree, funcs) {
  let modified = false

  tree = crawler.modify(tree, '$..[?(@.type === \'AssignmentExpression\')].left.object[?(@ === \'module\')]^^^..right', objectAssignment => {
    modified = true
    return createObjectExpression(funcs.map(createNameProperty))
  })

  if (!modified) {
    return injectIntoBody(tree, {
      type: 'ExpressionStatement',
      expression: {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: {
            type: 'Identifier',
            name: 'module'
          },
          property: {
            type: 'Identifier',
            name: 'exports'
          },
          computed: false
        },
        right: createObjectExpression(funcs.map(createNameProperty))
      }
    })
  }
  return tree
}

module.exports = {
  updateExports,
  generateArrowFunction,
  generateComment,
  generateStubFunction,
  convertToAST,
  createNameProperty,
  createObjectExpression,
  createObjectParam,
  createProperty,
  updateFunctionParams,
  updateOrAddFunction,
  updateOrAddProperty,
  espreeParseText,
  modifyFunctionCallProperties,
  generateExtractionFunction,
  addExtractionFunction,
  generateAuthorizationFunction,
  addAuthorizationFunction
}
