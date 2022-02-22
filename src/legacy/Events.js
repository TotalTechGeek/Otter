const EventEmitter = require('events')
const util = require('util')
module.exports = new EventEmitter()

const oldOn = module.exports.on
const oldOnce = module.exports.once

module.exports.on = function (event, func) {
  if (util.types.isAsyncFunction(func)) {
    oldOn.apply(module.exports, [event, function () {
      setImmediate(() => {
        func.apply(null, arguments)
      })
    }])
  } else {
    oldOn.apply(module.exports, arguments)
  }
}

module.exports.once = function (event, func) {
  if (util.types.isAsyncFunction(func)) {
    oldOnce.apply(module.exports, [event, function () {
      setImmediate(() => {
        func.apply(null, arguments)
      })
    }])
  } else {
    oldOnce.apply(module.exports, arguments)
  }
}
