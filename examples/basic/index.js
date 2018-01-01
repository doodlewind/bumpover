import { Bumpover } from '../../src'

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

const bumper = new Bumpover(rules)
bumper.bump(input).then(console.log)
