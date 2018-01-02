import { Rule } from '../rule'
import { Options } from '../options'

export class Bumpover {
  constructor (rules = [], options = {}) {
    this.rules = rules
    this.options = {
      defaultValue: null,
      ignoreUnknown: false,
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

      const childPromises = node[childrenKey].map(this.bumpNode)
      const bumpChildren = Promise.all(childPromises)
      bumpChildren.then(results => {
        resolve({ ...node, [childrenKey]: results })
      })
    })
  })

  bump = (str) => new Promise((resolve, reject) => {
    // Validate rules and options for once.
    this.rules.forEach(rule => {
      try { Rule(rule) } catch (e) {
        throw new Error(`Invalid rule:\n${e}`)
      }
    })
    try { Options(this.options) } catch (e) {
      throw new Error(`Invalid options:\n${e}`)
    }

    // TODO: Update root node with rules.
    const { childrenKey } = this.options
    const rootNode = this.options.deserializer(str)
    const childPromises = rootNode[childrenKey].map(this.bumpNode)
    const bumpChildren = Promise.all(childPromises)
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
