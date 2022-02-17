const Events = require('./Events')

class Handler {
  /**
     *
     * @param {Function} func

     */
  wrapFunction (func) {
    return async function () {
      try {
        const result = await func.apply(this, arguments)
        return result
      } catch (err) {
        Events.emit('Error', err)
        if (err.handler && typeof err.handler === 'function') {
          return err.handler()
        }
        Events.emit('UnhandledError', err)
        throw err
      }
    }
  }

  wrap (obj) {
    Object.keys(obj).forEach(item => {
      if (typeof obj[item] === 'function') {
        obj[item] = this.wrapFunction(obj[item])
      }
    })
  }

  wrapUnenumerable (obj) {
    Object.getOwnPropertyNames(obj).forEach(item => {
      if (typeof obj[item] === 'function') {
        obj[item] = this.wrapFunction(obj[item])
      }
    })
  }

  wrapArr (arr) {
    return arr.map(item => {
      if (typeof item === 'function') {
        return this.wrapFunction(item)
      }
    })
  }
}

module.exports = new Handler()
