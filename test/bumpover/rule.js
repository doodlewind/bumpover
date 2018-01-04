import test from 'ava'
import { Bumpover } from '../../lib'

test('empty rule', t => {
  const input = { children: [] }

  const expected = { children: [] }

  const rules = []

  const bumper = new Bumpover(rules)

  return bumper.bump(input).then(actual => t.deepEqual(actual, expected))
})

test('undefined rule', async t => {
  const input = { children: [] }

  const bumper = new Bumpover()

  await t.notThrows(bumper.bump(input))
})

test('nested input, single rule', t => {
  const input = {
    id: 1,
    children: [
      {
        id: 2,
        children: [
          {
            id: 3,
            children: [
              { id: 4, children: [] },
              { id: 5, children: [] },
              { id: 6, children: [] }
            ]
          }
        ]
      }
    ]
  }

  const expected = {
    id: 2,
    children: [
      {
        id: 3,
        children: [
          {
            id: 4,
            children: [
              { id: 5, children: [] },
              { id: 6, children: [] },
              { id: 7, children: [] }
            ]
          }
        ]
      }
    ]
  }

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

  const bumper = new Bumpover(rules)

  return bumper.bump(input).then(actual => t.deepEqual(actual, expected))
})

test('nest input, async rule', async t => {
  const input = {
    id: 1,
    children: [
      {
        id: 2,
        children: [
          {
            id: 3,
            children: [
              { id: 4, children: [] },
              { id: 5, children: [] },
              { id: 6, children: [] }
            ]
          }
        ]
      }
    ]
  }

  const expected = {
    id: 2,
    children: [
      {
        id: 3,
        children: [
          {
            id: 4,
            children: [
              { id: 5, children: [] },
              { id: 6, children: [] },
              { id: 7, children: [] }
            ]
          }
        ]
      }
    ]
  }

  const rules = [
    {
      match: (node) => true,
      update: (node) => new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve({
            node: { ...node, id: node.id + 1 }
          })
        }, 10)
      })
    }
  ]

  const bumper = new Bumpover(rules)

  return bumper.bump(input).then(actual => t.deepEqual(actual, expected))
})

test('nested input, multi rules', t => {
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
        props: {},
        children: [
          { name: 'span', props: {}, children: [] },
          {
            name: 'small',
            props: { fontSize: '16px' },
            children: []
          },
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
