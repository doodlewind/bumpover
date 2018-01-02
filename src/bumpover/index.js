import { Rules, getRule } from '../rule'
import { Options } from '../options'

// Result items can be array, object or null.
// Flatten results to array of objects.
function sanitizeResults (results) {
  const sanitizedResults = results
    .map(result => Array.isArray(result) ? result : [result])
    .reduce((a, b) => [...a, ...b], [])
    .filter(result => !!result)
  return sanitizedResults
}

// Result can be array, object or null. Unify its shape to result struct.
function resolveResult (node, result, childrenKey) {
  if (!result) {
    return { action: 'stop', newNode: null }
  } else if (Array.isArray(result)) {
    return {
      action: 'next',
      newNode: { ...node, [childrenKey]: sanitizeResults(result) }
    }
  } else {
    const { action, node } = result
    return { action, newNode: node }
  }
}

function bumpChildren (node, rules, options, bumpFn, resolve, reject) {
  const { childrenKey } = options
  // Outlet for leaf node.
  if (!node || !node[childrenKey]) {
    resolve({ ...node })
    return
  }

  const childPromises = node[childrenKey].map(bumpFn)
  const bumpAll = Promise.all(childPromises)
  bumpAll.then(results => {
    resolve({ ...node, [childrenKey]: sanitizeResults(results) })
  })
}

function bumpIgnoredNode (node, rule, options, bumpFn, resolve, reject) {
  const { childrenKey } = options
  // Resolve null if the ignored node is leaf.
  if (!node || !node[childrenKey]) {
    resolve(null)
    return
  }
  // Resolve array of results.
  const childPromises = node[childrenKey].map(bumpFn)
  const bumpAll = Promise.all(childPromises)
  bumpAll.then(results => {
    resolve(sanitizeResults(results))
  })
}

function bumpRoot (node, options, bumpFn, resolve, reject) {
  const { childrenKey, serializer } = options
  const childPromises = node[childrenKey].map(bumpFn)
  const bumpChildren = Promise.all(childPromises)
  bumpChildren.then(results => {
    const outputStr = serializer({ ...node, [childrenKey]: results })
    resolve(outputStr)
  })
}

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
    const { rules, options, bumpNode } = this
    const rule = getRule(node, rules)
    // Keep or discard unknown node according to `ignoreUnknown` option.
    if (!rule) {
      const { ignoreUnknown } = options
      if (ignoreUnknown) {
        bumpIgnoredNode(node, rule, options, resolve, reject)
        return
      } else {
        // Keep current node shape and bump its children.
        bumpChildren(node, rules, options, bumpNode, resolve, reject)
        return
      }
    }

    rule.update(node).then(result => {
      const { childrenKey } = options
      const { action, newNode } = resolveResult(node, result, childrenKey)
      if (action === 'next') {
        bumpChildren(newNode, rules, options, bumpNode, resolve, reject)
      } else if (action === 'stop') {
        resolve({ action, node: newNode })
      } else reject(new Error(`Unknown action:\n${action}`))
    })
  })

  bump = (input) => new Promise((resolve, reject) => {
    const { options, rules, bumpNode } = this
    // Validate rules and options for once.
    try { Rules(rules) } catch (e) {
      reject(new Error(`Invalid rules:\n${e}`))
    }
    try { Options(options) } catch (e) {
      reject(new Error(`Invalid options:\n${e}`))
    }

    // Update root node with rules.
    const root = this.options.deserializer(input)
    const rule = getRule(root, rules)
    // Root node shouldn't be ignored.
    if (!rule) {
      bumpRoot(root, options, bumpNode, resolve, reject)
    } else {
      rule.update(root).then(result => {
        const { childrenKey, serializer } = options
        const { action, newNode } = resolveResult(root, result, childrenKey)
        if (action === 'next') {
          bumpRoot(newNode, options, bumpNode, resolve, reject)
        } else if (action === 'stop') {
          resolve(serializer(newNode))
        } else reject(new Error(`Unknown action:\n${action}`))
      })
    }
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
