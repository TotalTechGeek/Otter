class RequestExtraction {
  constructor () {
    this.data = { type: 'request' }
  }

  static body () {
    return new RequestExtraction().from('body')
  }

  static params () {
    return new RequestExtraction().from('params')
  }

  static query () {
    return new RequestExtraction().from('query')
  }

  body () {
    return this.from('body')
  }

  query () {
    return this.from('query')
  }

  params () {
    return this.from('params')
  }

  from (area) {
    this.data.from = area
    return this
  }

  item (area) {
    this.data.item = area
    return this
  }

  toJSON () {
    return this.data
  }
}

class ExtractionSchema {
  constructor () {
    this.req = () => new RequestExtraction()
  }
}

module.exports = new ExtractionSchema()
