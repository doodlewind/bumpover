import { struct } from 'superstruct'
import { Bumpover } from '../../src'

const Node = struct({
  tag: struct.enum(['span', 'div']),
  children: 'array'
})

const rules = [
  {
    match: node => node.tag === 'div',
    update: node => new Promise((resolve, reject) => {
      resolve({
        node: { ...node, tag: 'span' }
      })
    }),
    struct: Node
  }
]

const input = {
  tag: 'div',
  children: [
    { tag: 'div', children: [] }
  ]
}

const bumper = new Bumpover(rules)
bumper.bump(input).then(console.log)
