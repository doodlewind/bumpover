import test from 'ava'
import { Bumpover } from '../../lib'

test('invalid option', t => {
  const input = { children: [] }

  const expected = input

  const rules = [
    {
      match: (node) => false,
      update: (node) => new Promise((resolve, reject) => {
        resolve({ node })
      })
    }
  ]

  const options = null

  const bumper = new Bumpover(rules, options)

  return bumper.bump(input).then(actual => t.deepEqual(actual, expected))
})
