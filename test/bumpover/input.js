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

  return bumper.bump(input).then(actual => t.deepEqual(actual, expected))
})

test('undefined node', t => {
  let input

  const expected = null

  const rules = [
    {
      match: (node) => false,
      update: (node) => new Promise((resolve, reject) => {
        resolve({ node })
      })
    }
  ]

  const bumper = new Bumpover(rules)

  return bumper.bump(input).then(actual => t.deepEqual(actual, expected))
})

test('root without childKey', t => {
  const input = { name: 'foo' }

  const expected = { name: 'foo' }

  const rules = [
    {
      match: (node) => true,
      update: (node) => new Promise((resolve, reject) => {
        resolve({ node })
      })
    }
  ]

  const bumper = new Bumpover(rules)

  return bumper.bump(input).then(actual => t.deepEqual(actual, expected))
})

test('node without childKey', t => {
  const input = {
    name: 'foo',
    children: [
      {
        name: 'foo',
        children: [
          {
            name: 'foo',
            children: [
              { name: 'foo', children: [] },
              { name: 'foo', children: [] },
              { name: 'foo' }
            ]
          }
        ]
      },
      { name: 'foo', children: [] },
      { name: 'foo' }
    ]
  }

  const expected = input

  const rules = [
    {
      match: (node) => true,
      update: (node) => new Promise((resolve, reject) => {
        resolve({ node })
      })
    }
  ]

  const bumper = new Bumpover(rules)

  return bumper.bump(input).then(actual => t.deepEqual(actual, expected))
})

test('root with wrong childKey', t => {
  const input = { name: 'foo', children: 123 }

  const expected = { name: 'foo', children: 123 }

  const rules = [
    {
      match: (node) => true,
      update: (node) => new Promise((resolve, reject) => {
        resolve({ node })
      })
    }
  ]

  const bumper = new Bumpover(rules)

  return bumper.bump(input).then(actual => t.deepEqual(actual, expected))
})

test('node with wrong childKey', t => {
  const input = {
    name: 'foo',
    children: [
      { name: 'bar', children: 123 },
      { name: 'bar', children: 123 }
    ]
  }

  const expected = input

  const rules = [
    {
      match: (node) => true,
      update: (node) => new Promise((resolve, reject) => {
        resolve({ node })
      })
    }
  ]

  const bumper = new Bumpover(rules)

  return bumper.bump(input).then(actual => t.deepEqual(actual, expected))
})
