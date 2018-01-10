import { deepEqual } from 'assert'
import { Rules, getRule } from '../rules'
import { Options } from '../options'
import {
  bumpChildren,
  bumpIgnoredNode,
  bumpRoot
} from './traverse'
import {
  getChildKey,
  resolveResult
} from './utils'

export class Bumpover {
  constructor (rules = [], options = {}) {
    this.rules = rules
    this.options = {
      defaultValue: null,
      ignoreUnknown: false,
      childKey: 'children',
      beforeMatch: node => {},
      onUnmatch: node => {},
      serializer: a => a,
      deserializer: a => a,
      ...options
    }
  }

  // Bump node into result wrapped in promise.
  // Resolves new node.
  bumpNode = (node) => new Promise((resolve, reject) => {
    if (!node) {
      resolve(null)
      return
    }
    const { rules, options, bumpNode } = this
    const { ignoreUnknown, onUnmatch, beforeMatch } = options
    beforeMatch(node)
    const rule = getRule(node, rules)
    // Keep or discard unknown node according to `ignoreUnknown` option.
    if (!rule) {
      if (ignoreUnknown) {
        bumpIgnoredNode(node, options, bumpNode, resolve, reject)
        return
      } else {
        onUnmatch(node)
        // Keep current node shape and bump its children.
        bumpChildren(node, rules, options, bumpNode, resolve, reject)
        return
      }
    }

    rule.update(node).then(result => {
      const childKey = getChildKey(node, rules, options)
      const { action, newNode } = resolveResult(
        node, result, rule.struct, childKey
      )
      if (action === 'next') {
        bumpChildren(newNode, rules, options, bumpNode, resolve, reject)
      } else if (action === 'stop') {
        resolve(newNode)
      } else reject(new Error(`Unknown action:\n${action}`))
    }).catch(reject)
  })

  // Bump unserialized input into serizlized result wrapped in promise.
  bump = (input) => new Promise((resolve, reject) => {
    const { options, rules, bumpNode } = this
    // Validate rules and options for once.
    try { Rules(rules) } catch (e) { reject(e) }
    try { Options(options) } catch (e) { reject(e) }

    const {
      defaultValue, deserializer, ignoreUnknown, beforeMatch, onUnmatch
    } = options
    // Update root node with rules.
    const rootNode = deserializer(input)
    if (!rootNode) {
      resolve(defaultValue)
      return
    }
    beforeMatch(rootNode)
    const rule = getRule(rootNode, rules)
    // Resolve default value if root node is unknown.
    if (!rule) {
      if (ignoreUnknown) resolve(defaultValue)
      else {
        onUnmatch(rootNode)
        bumpRoot(rootNode, [], options, bumpNode, resolve, reject)
      }
    } else {
      rule.update(rootNode).then(result => {
        const { serializer, defaultValue } = options
        const childKey = getChildKey(rootNode, rules, options)
        const { action, newNode } = resolveResult(
          rootNode, result, rule.struct, childKey
        )
        if (action === 'next') {
          bumpRoot(newNode, rules, options, bumpNode, resolve, reject)
        } else if (action === 'stop') {
          resolve(serializer(newNode) || defaultValue)
        } else reject(new Error(`Unknown action:\n${action}`))
      }).catch(reject)
    }
  })

  // Assert unserialized input can be bumped into expected format.
  assert = (input, expected) => new Promise((resolve, reject) => {
    this.bump(input).then(actual => {
      try {
        deepEqual(actual, expected)
        resolve()
      } catch (e) {
        reject(e)
      }
    }).catch(reject)
  })

  // Test if unserialized input can bumped without exception.
  test = (input) => new Promise((resolve, reject) => {
    this.bump(input).then(resolve).catch(reject)
  })
}
