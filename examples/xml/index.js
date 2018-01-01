import { XMLBumpover } from '../../src'

const rules = [
  {
    match: node => node.tag === 'div',
    update: node => new Promise((resolve, reject) => {
      resolve({
        action: 'next',
        node: {
          ...node,
          name: 'span'
        }
      })
    })
  }
]

const input = `
<div>
  <div>demo</div>
</div>
`

const bumper = new XMLBumpover(rules)
bumper.bump(input).then(console.log)
