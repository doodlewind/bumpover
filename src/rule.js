import { struct } from 'superstruct'

const Rule = struct({
  match: 'function',
  update: 'function',
  struct: 'object?'
})

export default Rule
