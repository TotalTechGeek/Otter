const fs = require('fs-extra')
const DOMAINS = './domains'
const EXTERNALS = './externals'
const standard = require('standard')
const { packageName, name: variableName } = require('./name')

class ProjectFileStructure {
  createFolder (folder) {
    if (!fs.existsSync(folder)) { fs.mkdirSync(folder) }
  }

  createFile (file, defaultText) {
    if (!fs.existsSync(file)) { fs.writeFileSync(file, defaultText || '') }
  }

  createDomains () {
    this.createFolder(DOMAINS)
  }

  getDomainTree (domain, name) {
    return (`${DOMAINS}/${domain}/${name}`)
  }

  getDomainActionTree (name) {
    return this.getDomainTree(name, 'actions.js')
  }

  getMockExternalTree (name) {
    return (`${EXTERNALS}/mock/${name}.js`)
  }

  saveActionsExport (domains) {
    const head = domains.map(domain => {
      return `const ${domain} = require('./${domain}/actions.js')\n`
    }).join('')

    const exportText = `\nmodule.exports = { ${domains.join(', ')} }`

    fs.writeFileSync(`${DOMAINS}/actions.js`, this.fixCode(head + exportText))
  }

  saveRoutesExport (domains) {
    const code = `const ${variableName} = require('${packageName}')
        const path = require('path')
        const router = new ${variableName}.Routes.Router()
        router.composeFrom([${domains.map(i => `path.resolve('./domains/${i}')`).join(', ')}])
        module.exports = router.router`
    fs.writeFileSync(`${DOMAINS}/routes.js`, this.fixCode(code))
  }

  saveDomainRoutesExport (domain) {
    const code = `const ${variableName} = require('${packageName}')
        const router = new ${variableName}.Routes.Router()

        router.injectLoad('${DOMAINS}/${domain}/endpoints.json')
        router.extractions = require('./extractions')
        router.actions = require('./actions')
        router.authorizations = require('./authorizations')
        router.after = require('./after')


        module.exports = router.router`
    fs.writeFileSync(`${DOMAINS}/${domain}/routes.js`, this.fixCode(code))
  }

  saveMockExternalsExport (domains) {
    const head = domains.map(domain => {
      return `const ${domain} = require('./${domain}');\n`
    }).join('')

    const exportText = `\nmodule.exports = { ${domains.join(', ')} }`

    fs.writeFileSync(`${EXTERNALS}/mock/externals.js`, this.fixCode(head + exportText))
  }

  saveActualExternalsExport (domains) {
    const head = domains.map(domain => {
      return `const ${domain} = require('./${domain}');\n`
    }).join('')

    const exportText = `\nmodule.exports = { ${domains.join(', ')} }`

    fs.writeFileSync(`${EXTERNALS}/actual/externals.js`, this.fixCode(head + exportText))
  }

  saveExternalsExport () {
    fs.writeFileSync(`${EXTERNALS}/externals.js`, 'if(!process.env.MOCK) module.exports = require(\'./actual/externals\')\nelse module.exports = require(\'./mock/externals\')\n')
  }

  getActualExternalTree (name) {
    return (`${EXTERNALS}/actual/${name}.js`)
  }

  saveActualExternalTree (name, tree) {
    return this.saveTree(`${EXTERNALS}/actual/${name}.js`, tree)
  }

  saveMockExternalTree (name, tree) {
    return this.saveTree(`${EXTERNALS}/mock/${name}.js`, tree)
  }

  fixCode (code) {
    return standard.lintTextSync(code, { fix: true }).results[0].output
  }

  init () {
    if (!fs.existsSync('.eslintrc')) {
      fs.writeFileSync('.eslintrc', `{
                "extends": "standard",
                "parserOptions": {
                    "ecmaVersion": 2020
                },
                "env": {
                    "es6": true
                }
            }`)
    }
    this.createDomains()
    this.createExternals()
    this.createPlugins()
  }

  createPlugins () {
    this.createFolder('plugins')
  }

  createPlugin (name) {
    this.createFile(`plugins/${name}.js`, this.fixCode(`// eslint-disable-next-line no-unused-vars\nconst externals = require('../../externals/externals');\nconst ${variableName} = require('${packageName}');\nmodule.exports = {};\n${variableName}.Handler.wrapLoad('${DOMAINS}/${name}/actionValidations', module.exports)`))
  }

  saveDomainActionTree (domain, tree) {
    return this.saveDomainTree(domain, 'actions.js', tree)
  }

  createDomain (name) {
    this.createDomains()
    this.createFolder(`${DOMAINS}/${name}`)
    this.createFile(`${DOMAINS}/${name}/steps.js`, '// used for implementing Cucumber\n\n')

    this.createFile(`${DOMAINS}/${name}/actions.js`, this.fixCode(`// eslint-disable-next-line no-unused-vars\nconst externals = require('../../externals/externals');\nconst ${variableName} = require('${packageName}');\nmodule.exports = {};\n${variableName}.Handler.wrapLoad('${DOMAINS}/${name}/actionValidations', module.exports)`))
    this.createFile(`${DOMAINS}/${name}/extractions.js`, this.fixCode(`const ${variableName} = require('${packageName}');
// eslint-disable-next-line no-unused-vars
const externals = require('../../externals/externals');
module.exports = {};
${variableName}.ErrorHandler.wrap(module.exports);
`))
    this.createFile(`${DOMAINS}/${name}/after.js`, this.fixCode(`const ${variableName} = require('${packageName}');
// eslint-disable-next-line no-unused-vars
const externals = require('../../externals/externals');
module.exports = {};
${variableName}.ErrorHandler.wrap(module.exports);
`))
    this.createFile(`${DOMAINS}/${name}/authorizations.js`, this.fixCode(`const ${variableName} = require('${packageName}');
// eslint-disable-next-line no-unused-vars
const externals = require('../../externals/externals');
module.exports = {};
${variableName}.ErrorHandler.wrap(module.exports);
`))
  }

  writeDomainConfig (domain, name, data) {
    fs.writeFileSync(`${DOMAINS}/${domain}/${name}`, data)
  }

  writeExternalConfig (name, data) {
    fs.writeFileSync(`${EXTERNALS}/actual/${name}.json`, data)
    fs.writeFileSync(`${EXTERNALS}/mock/${name}.json`, data)
  }

  createExternals () {
    this.createFolder(EXTERNALS)
    this.createFolder(`${EXTERNALS}/mock`)
    this.createFolder(`${EXTERNALS}/actual`)
    this.saveExternalsExport()
    this.createFile(`${EXTERNALS}/mock/externals.js`)
    this.createFile(`${EXTERNALS}/actual/externals.js`)
  }

  createExternal (name) {
    this.createExternals()
    this.createFile(`${EXTERNALS}/mock/${name}.js`, this.fixCode(`const ${variableName} = require('${packageName}');\nmodule.exports = {};\n${variableName}.Handler.wrapLoad('${EXTERNALS}/mock/${name}Validations', module.exports);`))
    this.createFile(`${EXTERNALS}/actual/${name}.js`, this.fixCode(`const ${variableName} = require('${packageName}');\nmodule.exports = {};\n${variableName}.Handler.wrapLoad('${EXTERNALS}/actual/${name}Validations', module.exports);`))
  }
}

module.exports = new ProjectFileStructure()
