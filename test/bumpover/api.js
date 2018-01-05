import test from 'ava'
import { Bumpover } from '../../lib'

test('bumper.bump', t => {
  const input = null

  const expected = input

  const rules = []

  const bumper = new Bumpover(rules)

  return bumper.bump(input).then(actual => t.deepEqual(actual, expected))
})

test('successful bumper.assert', async t => {
  const input = { children: [] }

  const expected = input

  const rules = []

  const bumper = new Bumpover(rules)

  await t.notThrows(bumper.assert(input, expected))
})

test('failed bumper.assert', async t => {
  const input = { children: [] }

  const expected = null

  const rules = []

  const bumper = new Bumpover(rules)

  await t.throws(bumper.assert(input, expected))
})

test('successful bumper.test', async t => {
  const input = { children: [] }

  const rules = [
    {
      match: (node) => true,
      update: (node) => new Promise((resolve, reject) => {
        resolve({ node })
      })
    }
  ]

  const bumper = new Bumpover(rules)

  await t.notThrows(bumper.test(input))
})

test('failed bumper.test', async t => {
  const input = { children: 123 }

  const rules = [
    {
      match: (node) => true,
      update: (node) => new Promise((resolve, reject) => {
        reject(new Error('failed test'))
      })
    }
  ]

  const bumper = new Bumpover(rules)

  await t.throws(bumper.test(input))
})
