import test from 'ava'
import { Bumpover } from '../../lib'
import { struct } from 'superstruct'

test('undefined rule', async t => {
  const input = { children: [] }
  const bumper = new Bumpover()
  await t.notThrows(bumper.bump(input))
})

test('invalid struct', async t => {
  const input = {
    id: 1,
    children: [
      { id: 2, children: [] }
    ]
  }

  const InvalidNode = struct({
    id: 'string',
    children: 'array'
  })

  const rules = [
    {
      match: (node) => true,
      update: (node) => new Promise((resolve, reject) => {
        resolve({ node })
      }),
      struct: InvalidNode
    }
  ]

  const bumper = new Bumpover(rules)

  await t.throws(bumper.bump(input))
})

test('single rule struct', t => {
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

  const Node = struct({
    id: 'number',
    children: 'array'
  })

  const rules = [
    {
      match: (node) => true,
      update: (node) => new Promise((resolve, reject) => {
        resolve({
          node: { ...node, id: node.id + 1 }
        })
      }),
      struct: Node
    }
  ]

  const bumper = new Bumpover(rules)

  return bumper.bump(input).then(actual => t.deepEqual(actual, expected))
})

test('multi rule structs', t => {
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

  const NewProps = struct({
    fontSize: 'string?',
    background: 'string?'
  })

  const DivTag = struct({
    name: struct.enum(['div']),
    props: NewProps,
    children: 'array'
  })

  const SmallTag = struct({
    name: struct.enum(['small']),
    props: NewProps,
    children: 'array'
  })

  const rules = [
    {
      match: ({ name }) => name === 'div',
      update: (node) => new Promise((resolve, reject) => {
        resolve({
          node: { ...node, props: { background: 'red' } }
        })
      }),
      struct: DivTag
    },
    {
      match: ({ name }) => name === 'small',
      update: (node) => new Promise((resolve, reject) => {
        resolve({
          node: { ...node, props: { fontSize: '16px' } }
        })
      }),
      struct: SmallTag
    }
  ]

  const bumper = new Bumpover(rules)

  return bumper.bump(input).then(actual => t.deepEqual(actual, expected))
})
