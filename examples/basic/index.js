import { Bumpover } from '../../src'
import { match, trace } from '../utils'

const rules = [
  {
    match: node => node.tag === 'div',
    update: node => new Promise((resolve, reject) => {
      resolve({
        action: 'stop',
        node: {
          ...node,
          tag: 'span'
        }
      })
    })
  }
]

const input = {
  tag: 'div',
  children: [
    { tag: 'div', children: [] }
  ]
}

const expected = {
  tag: 'span',
  children: [
    { tag: 'div', children: [] }
  ]
}

const bumper = new Bumpover(rules)
bumper.bump(input).then(match(expected)).catch(trace)
