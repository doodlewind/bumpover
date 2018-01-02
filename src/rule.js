import { struct } from 'superstruct'

export const Rule = struct({
  match: 'function',
  update: 'function',
  struct: 'function?'
})

export const Rules = struct([Rule])

export function getRule (node, rules) {
  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i]
    if (rule.match(node)) return rule
  }
  return null
}
