import test from 'ava'
import { Bumpover } from '../../lib'

test('empty rule', t => {
  const input = { children: [] }
  const expected = { children: [] }
  const rules = []
  const bumper = new Bumpover(rules)
  return bumper
    .bump(input)
    .then(actual => t.deepEqual(actual, expected))
})

test('undefined rule', async t => {
  const input = { children: [] }
  const bumper = new Bumpover()
  await t.notThrows(bumper.bump(input))
})
