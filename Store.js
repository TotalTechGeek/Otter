// This is not meant to be anything fancy.

const jsonpath = require('jsonpath')
const cloneDeep = require('lodash/cloneDeep')
const fs = require('fs-extra')
const Notation = require('notation')

const Crawler = require('./Crawler')

const store = {}

function fixPath (queries) {
  if (typeof queries === 'string') {
    return queries.replace(/\.\.\[/g, '...[').replace(/\.\[/g, '[')
  } else {
    return queries.map(this.fixQueries)
  }
}

function allowUp (x) {
  return x.replace(/\^/g, '["^"]')
}

function allowUp2 (x) {
  return x.replace(/\["\^"\]/g, '^')
}

function flatten (obj, specific, result = {}, str = '') {
  Object.keys(obj).forEach(key => {
    if (typeof obj[key] === 'object' && !Array.isArray(obj[key]) && (!specific || specific[key])) {
      return flatten(obj[key], undefined, result, str + key + '.')
    }
    result[str + key] = obj[key]
  })

  return result
}

// used to allow easy JSON persisting and linking sequences to the store.
const sequenceLink = {}

class Sequence {
  constructor (count, store) {
    this.count = count || 0
    sequenceLink[this] = store
  }

  next () {
    const count = ++this.count
    if (sequenceLink[this]) sequenceLink[this].save()
    return count
  }
}

class Store {
  constructor (name, options) {
    if (!options) options = {}

    this.name = name
    this.options = options
    if (!store[this.name]) store[this.name] = { $meta: { sequences: {} } }
    this.load()
  }

  save () {
    if (this.options.persist) {
      const data = JSON.stringify(store[this.name])
      fs.writeFileSync(this.options.persist.fileName, data)
    }
  }

  load () {
    if (this.options.persist && fs.existsSync(this.options.persist.fileName)) {
      const json = JSON.parse(fs.readFileSync(this.options.persist.fileName).toString())
      this.ingest(json)
    }
  }

  dump () {
    return cloneDeep(store[this.name])
  }

  ingest (data) {
    store[this.name] = cloneDeep(data)
  }

  /**
   * Creates a counter that is used to track ID incrementing ;)
   * @param {String} name
   * @returns {Sequence}
   */
  sequence (name) {
    if (!store[this.name].$meta) store[this.name].$meta = {}
    if (!store[this.name].$meta.sequences) store[this.name].$meta.sequences = {}
    if (!store[this.name].$meta.sequences[name]) {
      store[this.name].$meta.sequences[name] = new Sequence(0, this)
    }

    if (!(store[this.name].$meta.sequences[name] instanceof Sequence)) {
      store[this.name].$meta.sequences[name] = new Sequence(store[this.name].$meta.sequences[name].count, this)
    }

    return store[this.name].$meta.sequences[name]
  }

  /**
   * Searches all of the returned objects.
   *
   * Clarification: If you're searching an array,
   * like $.users is [], you should use
   * "$.users.*"
   *
   * @param {String} path
   * @param {Object} params
   */
  search (path, params) {
    const arr = this.fetch(path)

    if (typeof params === 'function') {
      return arr.filter(params)
    }

    params = flatten(params)

    return arr.filter(item => {
      item = flatten(item)
      return Object.keys(params).every(key => {
        if (Array.isArray(params[key])) {
          return params[key].some(param => item[key] === param)
        }
        return item[key] === params[key]
      })
    })
  }

  /**
   * Upserts an object in an array.
   *
   * Only works on the first returned instance, so only use
   * this in situations where it can be safely assumed
   * that only one object will match your query.
   *
   * @param {*} path
   * @param {*} obj
   */
  upsert (path, obj) {
    const item = this.fetch(path)[0]
    if (item) {
      this.modify(path, obj)
    } else {
      path = allowUp(fixPath(path))
      const pathArray = jsonpath.parse(path)
      pathArray.pop()
      const strippedPath = allowUp2(jsonpath.stringify(pathArray))
      this.push(strippedPath, obj)
    }
  }

  /**
     * Push to an array.
     * @param {String} path
     * @param {*} obj
     */
  push (path, obj) {
    const result = this.modify(path, data => {
      if (typeof obj === 'function') {
        data.push(obj())
      } else {
        data.push(obj)
      }
      return data
    })
    this.save()
    return result
  }

  /**
     * Modifies an object / array / property.
     * Use modify if you want to make heavy changes (pushing a lot of items to an array, changing multiple properties)
     * @param {String} path
     * @param {*} modifier
     */
  set (path, modifier) {
    path = allowUp(fixPath(path))
    const pathArray = jsonpath.parse(path)
    const property = pathArray.pop().expression.value
    const strippedPath = allowUp2(jsonpath.stringify(pathArray))
    store[this.name] = Crawler.modifyProperty(store[this.name], strippedPath, property, modifier)
    this.save()
  }

  /**
     * Modify an object, use if you're going to make heavy changes to an object.
     * Set is usually better for smaller tweaks.
     * @param {String} path
     * @param {*} modifier
     */
  modify (path, modifier) {
    store[this.name] = Crawler.modify(store[this.name], path, modifier)
    this.save()
  }

  /**
     * Lookup valid paths in the store
     * @param {String} path
     */
  lookup (path) {
    return Crawler.lookup(store[this.name], path)
  }

  /**
     * Use to remove an entry from an array.
     * @param {String} path
     */
  remove (path) {
    const removed = this.lookup(path)
    removed.sort((a, b) => b[b.length - 1] - a[a.length - 1])
    removed.forEach(items => {
      const el = items.pop()
      let current = store[this.name]

      items.forEach(item => {
        current = current[item]
      })

      current.splice(el, 1)
    })
    this.save()
  }

  /**
     * Use to delete a property from an object
     * @param {String} path
     */
  delete (path) {
    path = allowUp(fixPath(path))
    const pathArray = jsonpath.parse(path)
    const property = pathArray.pop().expression.value
    const strippedPath = allowUp2(jsonpath.stringify(pathArray))
    this.modify(strippedPath, data => {
      delete data[property]
      return data
    })
    this.save()
  }

  /**
     * Used to get a count of how many results would be returned
     * @param {String} path
     */
  count (path) {
    return this.lookup(path).length
  }

  /**
     * Fetch the data from the store
     * @param {String} path
     */
  fetch (path, filter) {
    const items = Crawler.fetch(store[this.name], path)

    if (filter) {
      if (Array.isArray(filter)) {
        return items.map(item => {
          const notation = new Notation(item)
          return notation.filter(filter).value
        })
      } else {
        return items.map(item => {
          Object.keys(filter).forEach(path => {
            if (path.startsWith('[')) {
              // just used to detect
              Crawler.modify([item], `$${path}`, data => {
                const notation = new Notation(item)
                item = notation.filter(filter[path]).value
              })
            } else if (path === '$') {
              const notation = new Notation(item)
              item = notation.filter(filter[path]).value
            } else {
              item = Crawler.modify(item, path, data => {
                const notation = new Notation(data)
                return notation.filter(filter[path]).value
              })
            }
          })
          return item
        })
      }
    }

    return items
  }

  /**
     * Reduce from the store.
     * @param {String} path
     * @param {*} reducer
     * @param {*} defaultValue
     */
  reduce (path, reducer, defaultValue) {
    const args = [reducer]
    if (typeof defaultValue !== 'undefined') args.push(defaultValue)
    return Array.prototype.reduce.apply(this.fetch(path), args)
  }

  /**
     * Map over values from the store
     * @param {String} path
     * @param {*} map
     */
  map (path, map) {
    return this.fetch(path).map(map)
  }
}

module.exports = Store
