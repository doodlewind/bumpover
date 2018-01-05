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

test('ignore unknown on root', t => {
  const input = {
    name: 'div',
    props: {},
    children: [
      {
        name: 'span',
        props: {},
        children: [
          { name: 'div', props: {}, children: [] },
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
        name: 'div',
        props: { background: 'red' },
        children: []
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
    }
  ]

  const options = { ignoreUnknown: true }

  const bumper = new Bumpover(rules, options)

  return bumper.bump(input).then(actual => t.deepEqual(actual, expected))
})

test('ignore unknown on node', t => {
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
    props: {},
    children: [
      {
        name: 'span',
        props: {},
        children: [
          { name: 'span', props: {}, children: [] },
          { name: 'span', props: {}, children: [] }
        ]
      }
    ]
  }

  const rules = [
    {
      match: ({ name }) => name === 'div',
      update: (node) => new Promise((resolve, reject) => {
        resolve({ node })
      })
    },
    {
      match: ({ name }) => name === 'span',
      update: (node) => new Promise((resolve, reject) => {
        resolve({ node })
      })
    }
  ]

  const options = { ignoreUnknown: true }

  const bumper = new Bumpover(rules, options)

  return bumper.bump(input).then(actual => t.deepEqual(actual, expected))
})

test('default value bumping root', t => {
  const input = ''

  const expected = 123

  const rules = [
    {
      match: (node) => true,
      update: (node) => new Promise((resolve, reject) => {
        resolve({ node })
      })
    }
  ]

  const options = { defaultValue: 123 }

  const bumper = new Bumpover(rules, options)

  return bumper.bump(input).then(actual => t.deepEqual(actual, expected))
})

test('default value for unknown root', t => {
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

  const expected = 123

  const rules = [
    {
      match: (node) => false,
      update: (node) => new Promise((resolve, reject) => {
        resolve({ node })
      })
    }
  ]

  const options = {
    ignoreUnknown: true,
    defaultValue: 123
  }

  const bumper = new Bumpover(rules, options)

  return bumper.bump(input).then(actual => t.deepEqual(actual, expected))
})

test('default value with invalid node, stop action bumping root', t => {
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

  const expected = 123

  const rules = [
    {
      match: (node) => true,
      update: (node) => new Promise((resolve, reject) => {
        resolve({
          action: 'stop',
          node: null
        })
      })
    }
  ]

  const options = { defaultValue: 123 }

  const bumper = new Bumpover(rules, options)

  return bumper.bump(input).then(actual => t.deepEqual(actual, expected))
})

test('default value with void serializer result', t => {
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

  const expected = 123

  const rules = [
    {
      match: (node) => true,
      update: (node) => new Promise((resolve, reject) => {
        resolve({ node })
      })
    }
  ]

  const options = { defaultValue: 123 }

  class TestBumpover extends Bumpover {
    constructor (rules = [], options = []) {
      super(rules, options)
      this.options = {
        ...this.options,
        serializer: () => ''
      }
    }
  }

  const bumper = new TestBumpover(rules, options)

  return bumper.bump(input).then(actual => t.deepEqual(actual, expected))
})

test('invalid child key on root', t => {
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
      match: (node) => true,
      update: (node) => new Promise((resolve, reject) => {
        resolve({ node })
      })
    }
  ]

  const options = { childKey: 'foo' }

  const bumper = new Bumpover(rules, options)

  return bumper.bump(input).then(actual => t.deepEqual(actual, expected))
})
