import { XMLBumpover } from '../../src'
import { match, trace, trim } from '../utils'

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

const input = trim(`
<div>
  <div>demo</div>
</div>
`)

const expected = trim(`
<span>
  <span>demo</span>
</span>
`)

const bumper = new XMLBumpover(rules)
bumper.bump(input).then(match(expected)).catch(trace)
