import { getRule } from '../rules'

// Validate node with possible struct provided in rules.
function validateNode (node, struct) {
  if (!struct) return node
  try { return struct(node) } catch (e) { throw e }
}

// Result items can be array, object or null.
// Flatten results to array of objects.
export function sanitizeResults (maybeResults) {
  const results = maybeResults
    .map(result => Array.isArray(result) ? result : [result])
    .reduce((a, b) => [...a, ...b], [])
    .filter(result => !!result)
  return results
}

// Get child key by rules and options
export function getChildKey (node, rules, options) {
  const rule = getRule(node, rules)
  if (rule && rule.childKey) return rule.childKey
  else return options.childKey
}

// Result can be array, object or null. Unify its shape to result struct.
export function resolveResult (node, result, struct, childKey) {
  if (!result) {
    return { action: 'stop', newNode: null }
  } else if (Array.isArray(result)) {
    return {
      action: 'next',
      newNode: {
        ...validateNode(node, struct),
        [childKey]: sanitizeResults(result)
      }
    }
  } else {
    // Provide default action.
    const { action = 'next', node } = result
    const newNode = validateNode(node, struct)
    return { action, newNode }
  }
}
