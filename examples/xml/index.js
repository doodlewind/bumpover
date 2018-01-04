import { XMLBumpover } from '../../src'

const rules = [
  {
    match: node => node.name === 'div',
    update: node => new Promise((resolve, reject) => {
      resolve({
        node: { ...node, name: 'span' }
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
