class Bumpover {
  constructor (rules = [], options = {}) {
    this.rules = rules
    this.options = {
      defaultValue: null,
      keepUnknown: false,
      silent: false,
      serializer: a => a,
      deserializer: a => a,
      ...options
    }
  }

  bump = (input) => new Promise((resolve, reject) => {
    resolve('TODO: rule runner')
  })

  assert = (input, expected) => {
    // WIP
    return true
  }

  test = (input) => {
    // WIP
    return true
  }
}

export default Bumpover
