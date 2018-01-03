import test from 'ava'
import { Bumpover } from '../../lib'

test('empty node', t => {
  const input = { children: [] }
  const expected = { children: [] }
  const rules = [
    {
      match: (node) => false,
      update: (node) => new Promise((resolve, reject) => {
        resolve({ node })
      })
    }
  ]
  const bumper = new Bumpover(rules)
  return bumper
    .bump(input)
    .then(actual => t.deepEqual(actual, expected))
})
