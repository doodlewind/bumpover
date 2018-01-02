import { Bumpover } from '../../src'
import { match, trace } from '../utils'

const rules = [
  {
    match: node => node.tag === 'div',
    update: node => new Promise((resolve, reject) => {
      resolve({
        action: 'next',
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
  children: []
}

const expected = {
  tag: 'span',
  children: []
}

const bumper = new Bumpover(rules)
bumper.bump(input).then(match(expected)).catch(trace)
