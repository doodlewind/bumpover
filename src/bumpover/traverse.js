import {
  getChildKey,
  sanitizeResults
} from './utils'

// Recursively bump node.
export function bumpChildren (node, rules, options, bumpFn, resolve, reject) {
  const childKey = getChildKey(node, rules, options)
  // Outlet for leaf node.
  if (!node) {
    resolve(null)
    return
  }

  if (!Array.isArray(node[childKey])) {
    resolve(node)
    return
  }

  const children = node[childKey]
  const childPromises = children.map(bumpFn)
  const bumpAll = Promise.all(childPromises)
  bumpAll.then(results => {
    resolve({ ...node, [childKey]: sanitizeResults(results) })
  }).catch(reject)
}

// Recursively bump node. Since ignored nodes doesn't have their `rules`,
// we don't pass in `rules` here, other args remains the same.
export function bumpIgnoredNode (node, options, bumpFn, resolve, reject) {
  const childKey = getChildKey(node, [], options)
  // Resolve null if the ignored node is leaf.
  if (!node || !node[childKey]) {
    resolve(null)
    return
  }
  // Resolve array of results.
  const children = node[childKey]
  const childPromises = children.map(bumpFn)
  const bumpAll = Promise.all(childPromises)
  bumpAll.then(results => {
    resolve(sanitizeResults(results))
  }).catch(reject)
}

// Recursively bump root node.
export function bumpRoot (node, rules, options, bumpFn, resolve, reject) {
  const { serializer, defaultValue } = options
  const childKey = getChildKey(node, rules, options)
  if (!node) {
    resolve(defaultValue)
    return
  }

  if (!Array.isArray(node[childKey])) {
    resolve(serializer(node) || defaultValue)
    return
  }

  const children = node[childKey]
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
