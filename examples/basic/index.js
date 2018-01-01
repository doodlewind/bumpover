import Bumpover from '../../src'

const rules = [
  {
    match: node => node.tag === 'div',
    bump: node => new Promise((resolve, reject) => {
      resolve({
        action: 'next',
        node: {
          tag: 'span',
          ...node
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
