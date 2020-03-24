const { Collection, Item, Url } = require('postman-collection')
const jsf = require('json-schema-faker')
const fs = require('fs-extra')
class CollectionBuilder {
  constructor (file) {
    if (file && fs.existsSync(file)) {
      this.collection = new Collection(JSON.parse(fs.readFileSync(file)))
    } else {
      this.collection = new Collection()
    }

    this.init()
  }

  init () {
    this.initHost()
  }

  initHost () {
    if (!this.collection.variables.one('host')) {
      this.collection.variables.add({ id: 'host', name: 'host', value: 'http://localhost:3000' })
    }
  }

  addFolder (folder) {
    if (!this.collection.items.one(folder)) {
      this.collection.items.add({
        item: [],
        name: folder,
        id: folder
      })
      return this
    }
  }

  addRequest (folder, action, endpoint, domainRoute) {
    // request must have name, method, url
    const request = {
      id: `${folder}-${action}`,
      name: action,
      request: {
        url: Url.parse(`{{host}}${domainRoute}${endpoint.route || ''}`),
        method: endpoint.method
      }
    }

    if (endpoint.validate) {
      if (endpoint.validate.body) {
        try {
          const body = {
            mode: 'raw',
            raw: JSON.stringify(jsf.generate(endpoint.validate.body)),
            options: {
              raw: {
                language: 'json'
              }
            }
          }

          request.request.body = body
        } catch (err) {
          console.error(err)
        }
      }

      if (endpoint.validate.query) {
        request.request.url.query = Object.keys(endpoint.validate.query).map(name => ({ id: name, key: name, value: '' }))
      }

      if (endpoint.validate.params) {
        request.request.url.variable = Object.keys(endpoint.validate.params).map(name => ({ id: name, key: name, value: '', type: endpoint.validate.params[name].type }))
      }
    }

    if (!this.collection.items.one(folder).items.one(request.id)) {
      this.collection.items.one(folder).items.add(new Item(request))
    } else {
      this.collection.items.one(folder).items.one(request.id).request.url.update(request.request.url)
    }

    return this
  }

  toJSON () {
    return this.collection.toJSON()
  }
}

module.exports = CollectionBuilder
