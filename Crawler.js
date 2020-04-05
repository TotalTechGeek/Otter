const {
  JSONPath
} = require('jsonpath-plus')
const jsonpath = require('jsonpath')
const _ = require('lodash')

class Crawler {
  modify (data, queries, modifier) {
    const modified = _.cloneDeep(data)

    const paths = this.lookup(data, queries)

    paths.forEach(path => {
      const last = path.pop()
      let current = modified
      path.forEach(step => {
        current = current[step]
      })

      if (typeof modifier === 'function') {
        current[last] = modifier(current[last])
      } else {
        let value = modifier

        if (typeof modifier === 'object') {
          value = _.cloneDeep(modifier)
        }

        current[last] = value
      }
    })

    return modified
  }

  modifyProperty (data, queries, property, modifier) {
    const modified = _.cloneDeep(data)

    const paths = this.lookup(data, queries)

    paths.forEach(path => {
      let current = modified
      path.forEach(step => {
        if (step) { current = current[step] }
      })

      if (typeof modifier === 'function') {
        current[property] = modifier(current[property], current)
      } else {
        let value = modifier

        if (typeof modifier === 'object') {
          value = _.cloneDeep(modifier)
        }

        current[property] = value
      }
    })

    return modified
  }

  _fetch (obj, paths) {
    if (!Array.isArray(paths)) paths = [paths]
    paths = paths.flatMap(path => {
      const pathString = JSONPath.toPathString(['$', ...path])

      if (pathString.indexOf('^') === -1) {
        return jsonpath.query(obj, pathString)
      }

      return JSONPath({
        path: pathString,
        json: obj,
        resultType: 'value'
      })
    })
    return _.cloneDeep(paths)
  }

  fixQueries (queries) {
    if (typeof queries === 'string') {
      return queries.replace(/\.\.\[/g, '...[').replace(/\.\[/g, '[')
    } else {
      return queries.map(this.fixQueries)
    }
  }

  fetch (obj, queries) {
    if (typeof queries === 'string' && queries.indexOf('^') === -1) {
      queries = this.fixQueries(queries)
      return _.cloneDeep(jsonpath.query(obj, queries))
    }

    return this._fetch(obj, this.lookup(obj, queries))
  }

  lookup (obj, queries) {
    queries = this.fixQueries(queries)

    if (!Array.isArray(queries)) {
      queries = [queries]
    }

    if (queries.length === 1 && queries[0].indexOf('^^') !== -1) {
      queries = queries.flatMap(query => {
        return query.split('^').flatMap(i => {
          if (!i.startsWith('$')) return [`$${i}`, '^']
          return [i, '^']
        })
      })

      if (queries.length) {
        queries.pop()
      }
    }
    const query = queries.shift()

    queries = queries.filter(i => i !== '$')

    let paths

    if (query.indexOf('^') !== -1) {
      paths = JSONPath({
        path: query,
        json: obj,
        resultType: 'pointer'
      })
    } else {
      paths = jsonpath.paths(obj, query).map(JSONPath.toPointer)
    }

    paths = paths.map(i => i.indexOf('/') === -1 ? [i] : i.split('/').filter(x => x))

    queries.forEach(query => {
      let newPaths = []

      paths.forEach(path => {
        if (query === '^') {
          path.pop()
          newPaths.push(path)
        } else {
          const arr = jsonpath.parse(query).map(i => i.expression.value)

          arr.shift()

          const pathString = JSONPath.toPathString(['$', ...path, ...arr])

          if (pathString.indexOf('^') !== -1) {
            path = JSONPath({
              path: pathString,
              json: obj,
              resultType: 'pointer'
            })
          } else {
            path = jsonpath.paths(obj, pathString).map(JSONPath.toPointer)
          }

          path = path.map(i => i.split('/').filter(x => x))

          newPaths = newPaths.concat(path)
        }
      })

      paths = newPaths
    })

    const results = _.uniqBy(paths, (a) => a.join(','))

    return results
  }
}

module.exports = new Crawler()
