import { deepEqual } from 'assert'
import { Rules, getRule } from '../rule'
import { Options } from '../options'

// Result items can be array, object or null.
// Flatten results to array of objects.
function sanitizeResults (mayResults) {
  const results = mayResults
    .map(result => Array.isArray(result) ? result : [result])
    .reduce((a, b) => [...a, ...b], [])
    .filter(result => !!result)
  return results
}

// Validate node with possible struct provided in rules.
function validateNode (node, struct) {
  if (!struct) return
  try { struct(node) } catch (e) {
    const nodeStr = JSON.stringify(node, null, 2)
    throw new Error(`Invalid node:\n${e}\nNode:\n${nodeStr}`)
  }
}

// Result can be array, object or null. Unify its shape to result struct.
function resolveResult (node, result, struct, childKey) {
  if (!result) {
    return { action: 'stop', newNode: null }
  } else if (Array.isArray(result)) {
    validateNode(node, struct)
    return {
      action: 'next',
      newNode: { ...node, [childKey]: sanitizeResults(result) }
    }
  } else {
    // Provide default action.
    const { action = 'next', node } = result
    validateNode(node, struct)
    return { action, newNode: node }
  }
}

function bumpChildren (node, rules, options, bumpFn, resolve, reject) {
  const { childKey } = options
  // Outlet for leaf node.
  if (!node || !node[childKey]) {
    resolve({ ...node })
    return
  }

  const children = node[childKey] || []
  const childPromises = children.map(bumpFn)
  const bumpAll = Promise.all(childPromises)
  bumpAll.then(results => {
    resolve({ ...node, [childKey]: sanitizeResults(results) })
  }).catch(reject)
}

function bumpIgnoredNode (node, rule, options, bumpFn, resolve, reject) {
  const { childKey } = options
  // Resolve null if the ignored node is leaf.
  if (!node || !node[childKey]) {
    resolve(null)
    return
  }
  // Resolve array of results.
  const children = node[childKey] || []
  const childPromises = children.map(bumpFn)
  const bumpAll = Promise.all(childPromises)
  bumpAll.then(results => {
    resolve(sanitizeResults(results))
  }).catch(reject)
}

function bumpRoot (node, options, bumpFn, resolve, reject) {
  const { childKey, serializer, defaultValue } = options
  if (!node) {
    resolve(defaultValue)
    return
  }
  const children = node[childKey] || []
  const childPromises = children.map(bumpFn)
  const bumpChildren = Promise.all(childPromises)
  bumpChildren.then(results => {
    const output = serializer({
      ...node,
      [childKey]: sanitizeResults(results)
    })
    resolve(output || defaultValue)
  }).catch(reject)
}

export class Bumpover {
  constructor (rules = [], options = {}) {
    this.rules = rules
    this.options = {
      defaultValue: null,
      ignoreUnknown: false,
      childKey: 'children',
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
    const rule = getRule(node, rules)
    // Keep or discard unknown node according to `ignoreUnknown` option.
    if (!rule) {
      const { ignoreUnknown } = options
      if (ignoreUnknown) {
        bumpIgnoredNode(node, rule, options, bumpNode, resolve, reject)
        return
      } else {
        // Keep current node shape and bump its children.
        bumpChildren(node, rules, options, bumpNode, resolve, reject)
        return
      }
    }

    rule.update(node).then(result => {
      const { childKey } = options
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
    try { Rules(rules) } catch (e) {
      reject(new Error(`Invalid rules:\n${e}`))
    }
    try { Options(options) } catch (e) {
      reject(new Error(`Invalid options:\n${e}`))
    }

    const { defaultValue, deserializer, ignoreUnknown } = options
    // Update root node with rules.
    const rootNode = deserializer(input)
    if (!rootNode) {
      resolve(defaultValue)
      return
    }

    const rule = getRule(rootNode, rules)
    // Resolve default value if root node is unknown.
    if (!rule) {
      if (ignoreUnknown) resolve(defaultValue)
      else bumpRoot(rootNode, options, bumpNode, resolve, reject)
    } else {
      rule.update(rootNode).then(result => {
        const { childKey, serializer, defaultValue } = options
        const { action, newNode } = resolveResult(
          rootNode, result, rule.struct, childKey
        )
        if (action === 'next') {
          bumpRoot(newNode, options, bumpNode, resolve, reject)
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
