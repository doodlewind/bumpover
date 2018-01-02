import { struct } from 'superstruct'

export const Rule = struct({
  match: 'function',
  update: 'function',
  struct: 'object?'
})

export function getRule (node, rules) {

}
