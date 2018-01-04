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

test('stop action on root', t => {
  const input = {
    name: 'div',
    props: {},
    children: [
      {
        name: 'span',
        props: {},
        children: [
          { name: 'span', props: {}, children: [] },
          { name: 'div', props: {}, children: [] },
          { name: 'span', props: {}, children: [] }
        ]
      }
    ]
  }

  const expected = {
    name: 'div',
    props: { background: 'red' },
    children: [
      {
        name: 'span',
        props: {},
        children: [
          { name: 'span', props: {}, children: [] },
          { name: 'div', props: {}, children: [] },
          { name: 'span', props: {}, children: [] }
        ]
      }
    ]
  }

  const rules = [
    {
      match: ({ name }) => name === 'div',
      update: (node) => new Promise((resolve, reject) => {
        resolve({
          action: 'stop',
          node: { ...node, props: { background: 'red' } }
        })
      })
    },
    {
      match: ({ name }) => name === 'small',
      update: (node) => new Promise((resolve, reject) => {
        resolve({
          node: { ...node, props: { fontSize: '16px' } }
        })
      })
    }
  ]

  const bumper = new Bumpover(rules)

  return bumper.bump(input).then(actual => t.deepEqual(actual, expected))
})

test('stop action on node', t => {
  const input = {
    name: 'div',
    props: {},
    children: [
      {
        name: 'span',
        props: {},
        children: [
          { name: 'span', props: {}, children: [] },
          { name: 'small', props: {}, children: [] },
          { name: 'span', props: {}, children: [] }
        ]
      }
    ]
  }

  const expected = {
    name: 'div',
    props: { background: 'red' },
    children: [
      {
        name: 'span',
        props: { fontSize: '16px' },
        children: [
          { name: 'span', props: {}, children: [] },
          { name: 'small', props: {}, children: [] },
          { name: 'span', props: {}, children: [] }
        ]
      }
    ]
  }

  const rules = [
    {
      match: ({ name }) => name === 'div',
      update: (node) => new Promise((resolve, reject) => {
        resolve({
          node: { ...node, props: { background: 'red' } }
        })
      })
    },
    {
      match: ({ name }) => name === 'span',
      update: (node) => new Promise((resolve, reject) => {
        resolve({
          action: 'stop',
          node: { ...node, props: { fontSize: '16px' } }
        })
      })
    }
  ]

  const bumper = new Bumpover(rules)

  return bumper.bump(input).then(actual => t.deepEqual(actual, expected))
})

test('invalid action on root', async t => {
  const input = {
    name: 'div',
    props: {},
    children: [
      {
        name: 'span',
        props: {},
        children: [
          { name: 'span', props: {}, children: [] },
          { name: 'small', props: {}, children: [] },
          { name: 'span', props: {}, children: [] }
        ]
      }
    ]
  }

  const rules = [
    {
      match: ({ name }) => name === 'div',
      update: (node) => new Promise((resolve, reject) => {
        resolve({
          action: 'nothing',
          node: { ...node, props: { background: 'red' } }
        })
      })
    }
  ]

  const bumper = new Bumpover(rules)

  await t.throws(bumper.bump(input))
})

test('invalid action on node', async t => {
  const input = {
    name: 'div',
    props: {},
    children: [
      {
        name: 'span',
        props: {},
        children: [
          { name: 'span', props: {}, children: [] },
          { name: 'small', props: {}, children: [] },
          { name: 'span', props: {}, children: [] }
        ]
      }
    ]
  }

  const rules = [
    {
      match: ({ name }) => name === 'span',
      update: (node) => new Promise((resolve, reject) => {
        resolve({
          action: 'nothing',
          node: { ...node, props: { fontSize: '16px' } }
        })
      })
    }
  ]

  const bumper = new Bumpover(rules)

  await t.throws(bumper.bump(input))
})
