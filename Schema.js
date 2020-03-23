const cloneDeep = require('lodash/cloneDeep')
const merge = require('lodash/merge')

class SchemaObject {
  constructor (type, properties) {
    this.data = { type, properties }
    this.meta = {}

    if (type === 'object') {
      this.allowAdditional(false)
    }

    if (this.data.properties) {
      Object.keys(this.data.properties).forEach(property => {
        if (this.data.properties[property] instanceof SchemaObject || this.data.properties[property] instanceof SchemaJoin) {
          this.data.properties[property].parent = this
          this.data.properties[property].propName = property
          this.data.properties[property].title = property

          if (this.data.properties[property].meta.required) {
            this.addRequired(property)
          }
        } else if (this.data.properties[property] instanceof Function && COMMON[this.data.properties[property].name]) {
          this.data.properties[property] = COMMON[this.data.properties[property].name].clone()
          this.data.properties[property].parent = this
          this.data.properties[property].propName = property
          this.data.properties[property].title = property
          this.data.properties[property].meta.required = true
          this.addRequired(property)
        }
      })
    }
  }

  addRequired (x) {
    if (!this.data.required) this.data.required = []
    this.data.required.push(x)
    return this
  }

  allowAdditional (x) {
    if (this.data.type === 'object') {
      this.data.additionalProperties = x
      return this
    }

    this.data.additionalItems = x
    return this
  }

  description (x) {
    this.data.description = x
    return this
  }

  optional () {
    return this
  }

  required () {
    if (this.parent) {
      this.parent.addRequired(this.propName)
    }
    this.meta.required = true
    return this
  }

  min (x) {
    if (this.data.type === 'array') {
      this.data.minItems = x
      return this
    }
    if (this.data.type === 'string') {
      this.data.minLength = x
      return this
    }

    if (this.data.type === 'object') {
      this.data.minProperties = x
      return this
    }

    this.data.minimum = x
    return this
  }

  max (x) {
    if (this.data.type === 'array') {
      this.data.maxItems = x
      return this
    }

    if (this.data.type === 'string') {
      this.data.maxLength = x
      return this
    }

    if (this.data.type === 'object') {
      this.data.maxProperties = x
      return this
    }

    this.data.maximum = x
    return this
  }

  pattern (x) {
    this.data.pattern = x
    return this
  }

  length (x) {
    if (this.data.type === 'array') {
      this.data.minItems = x
      this.data.maxItems = x
      return this
    }

    if (this.data.type === 'string') {
      this.data.minLength = x
      this.data.maxLength = x
      return this
    }

    if (this.data.type === 'object') {
      this.data.minProperties = x
      this.data.maxProperties = x
      return this
    }

    this.data.length = x
    return this
  }

  title (x) {
    this.data.title = x
    return this
  }

  definitions (x) {
    this.data.definitions = x
    return this
  }

  attr (x, y) {
    this.data[x] = y
    return this
  }

  items (schema) {
    if (Array.isArray(schema)) {
      this.data.items = schema
      this.allowAdditional(false)
    } else {
      this.data.items = [schema]
      this.allowAdditional(true)
    }

    this.data.items = this.data.items.map(item => {
      return module.exports.convert(item) || item
    })

    return this
  }

  clone () {
    return merge(new SchemaObject(), cloneDeep(this))
  }

  toJSON (cloned) {
    if (this.data.properties || this.data.items) {
      if (!cloned) {
        return this.clone().toJSON(true)
      }

      if (this.data.properties) {
        Object.keys(this.data.properties).forEach(property => {
          if (this.data.properties[property].toJSON) { this.data.properties[property] = this.data.properties[property].toJSON() }
        })
      }

      if (this.data.items) {
        Object.keys(this.data.items).forEach(item => {
          if (this.data.items[item].toJSON) { this.data.items[item] = this.data.items[item].toJSON() }
        })
      }
    }

    return { ...this.data }
  }
}

class SchemaJoin {
  constructor (type, arr) {
    this.data = {}
    this.meta = {}
    this.type = type
    this.arr = arr
  }

  optional () {
    return this
  }

  required () {
    if (this.parent) {
      this.parent.addRequired(this.propName)
    }
    this.meta.required = true
    return this
  }

  toJSON () {
    return { [this.type]: this.arr.map(i => i.toJSON ? i.toJSON() : i), ...this.data }
  }
}

class Schema {
  number () {
    return new SchemaObject('number')
  }

  object (properties) {
    return new SchemaObject('object', properties)
  }

  boolean () {
    return new SchemaObject('boolean')
  }

  array (arr) {
    const res = new SchemaObject('array')
    if (arr) res.items(arr)
    return res
  }

  convert (x) {
    if (COMMON_CONVERSIONS[x]) return COMMON_CONVERSIONS[x].clone()
  }

  permissiveNumber () {
    return this.anyOf([this.number(), this.string().pattern('^[0-9]+$')])
  }

  integer () {
    return new SchemaObject('integer')
  }

  anyOf (arr) {
    return new SchemaJoin('anyOf', arr)
  }

  string () {
    return new SchemaObject('string')
  }
}

const COMMON_CONVERSIONS = {
  [Number]: new SchemaObject('number'),
  [String]: new SchemaObject('string'),
  [Boolean]: new SchemaObject('boolean'),
  [Object]: new SchemaObject('object')
}

const COMMON = {
  Object: new SchemaObject('object'),
  String: new SchemaObject('string'),
  Number: new SchemaObject('number'),
  Boolean: new SchemaObject('boolean')
}

module.exports = new Schema()
