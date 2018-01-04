import test from 'ava'
import { JSONBumpover } from '../../lib'

test('empty data', async t => {
  const input = JSON.stringify

  const rules = []

  const bumper = new JSONBumpover(rules)

  await t.throws(bumper.bump(input))
})

test('empty data', async t => {
  const input = '{"id":1,"children":[{"id":2,"children":[{"id":3,"children":[{"id":4,"children":[]},{"id":5,"children":[]},{"id":6,"children":[]}]}]}]}'

  const expected = '{"id":2,"children":[{"id":3,"children":[{"id":4,"children":[{"id":5,"children":[]},{"id":6,"children":[]},{"id":7,"children":[]}]}]}]}'

  const rules = [
    {
      match: (node) => true,
      update: (node) => new Promise((resolve, reject) => {
        resolve({
          node: { ...node, id: node.id + 1 }
        })
      })
    }
  ]

  const bumper = new JSONBumpover(rules)

  return bumper.bump(input).then(actual => t.deepEqual(actual, expected))
})
