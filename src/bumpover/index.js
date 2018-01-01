import { Rule } from '../rule'

export class Bumpover {
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

  bumpNode = (node) => new Promise((resolve, reject) => {
    const rule = this.rules[0]
    try { Rule(rule) } catch (e) {
      reject(new Error(`Invalid rule:\n${e}`))
    }

    rule.update(node).then(result => {
      const { node } = result
      const { childrenKey } = this.options
      if (!node[childrenKey]) return resolve({ ...node })

      const bumpChildren = Promise.all(node[childrenKey].map(this.bumpNode))
      bumpChildren.then(results => {
        resolve({ ...node, [childrenKey]: results })
      })
    })
  })

  bump = (str) => new Promise((resolve, reject) => {
    // TODO: Update root node with rules.
    const { childrenKey } = this.options
    const rootNode = this.options.deserializer(str)
    const bumpChildren = Promise.all(rootNode[childrenKey].map(this.bumpNode))
    bumpChildren.then(results => {
      const resultStr = this.options.serializer(
        { ...rootNode, [childrenKey]: results }
      )
      resolve(resultStr)
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
