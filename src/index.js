class Bumpover {
  constructor (rules = [], options = {}) {
    this.rules = rules
    this.options = {
      defaultValue: null,
      keepUnknown: false,
      silent: false,
      childrenKey: 'children',
      serializer: a => a,
      deserializer: a => a,
      ...options
    }
  }

  bump = (node) => new Promise((resolve, reject) => {
    const rule = this.rules[0]

    rule.update(node).then(result => {
      const { node } = result
      const { childrenKey } = this.options
      const bumpChildren = Promise.all(node[childrenKey].map(this.bump))
      bumpChildren.then(results => {
        resolve({ ...node, [childrenKey]: results })
      })
    })
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
