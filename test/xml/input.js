import test from 'ava'
import { XMLBumpover } from '../../lib'

const connect = arr => arr.map(line => line.trim()).join('')

test('empty data', t => {
  const input = ''

  const expected = null

  const rules = [
    {
      match: (node) => false,
      update: (node) => new Promise((resolve, reject) => {
        resolve({ node })
      })
    }
  ]

  const bumper = new XMLBumpover(rules)

  return bumper.bump(input).then(actual => t.deepEqual(actual, expected))
})

test('namespace tags', t => {
  const input = connect([
    '<bump:demo foo="true">',
    '  <data>333</data>',
    '  <data>333</data>',
    '  <data>333</data>',
    '</bump:demo>'
  ])

  const expected = connect([
    '<bump:demo foo="false">',
    '  <data>666</data>',
    '  <data>666</data>',
    '  <data>666</data>',
    '</bump:demo>'
  ])

  const rules = [
    {
      match: (node) => node.name === 'bump:demo',
      update: (node) => new Promise((resolve, reject) => {
        resolve({
          node: {
            ...node, attributes: { foo: false } }
        })
      })
    },
    {
      match: (node) => node.name === 'data',
      update: (node) => new Promise((resolve, reject) => {
        const data = parseInt(node.elements[0].text)
        resolve({
          node: {
            ...node,
            elements: [{ type: 'text', text: data * 2 }]
          }
        })
      })
    }
  ]

  const bumper = new XMLBumpover(rules)

  return bumper.bump(input).then(actual => t.deepEqual(actual, expected))
})

test('CDATA', t => {
  const input = '<![CDATA[parseInt("666" + "666") >= 666666]]>'

  const expected = '<![CDATA[true]]>'

  const rules = [
    {
      match: (node) => node.type === 'cdata',
      update: (node) => new Promise((resolve, reject) => {
        resolve({
          node: {
            ...node,
            cdata: eval(node.cdata) // eslint-disable-line
          }
        })
      })
    }
  ]

  const bumper = new XMLBumpover(rules)

  return bumper.bump(input).then(actual => t.deepEqual(actual, expected))
})

test('stop action', t => {
  const input = connect([
    '<foo parsed="false">',
    '  <bar>',
    '    <foo parsed="false" />',
    '  </bar>',
    '</foo>'
  ])

  const expected = connect([
    '<foo parsed="true">',
    '  <bar>',
    '    <foo parsed="false"/>',
    '  </bar>',
    '</foo>'
  ])

  const rules = [
    {
      match: (node) => node.name === 'foo',
      update: (node) => new Promise((resolve, reject) => {
        resolve({
          node: {
            ...node, attributes: { parsed: true } }
        })
      })
    },
    {
      match: (node) => node.name === 'bar',
      update: (node) => new Promise((resolve, reject) => {
        resolve({
          action: 'stop',
          node
        })
      })
    }
  ]

  const bumper = new XMLBumpover(rules)

  return bumper.bump(input).then(actual => t.deepEqual(actual, expected))
})

test('ignore unknown', t => {
  const input = connect([
    '<foo>',
    '  <bar>',
    '    <baz/>',
    '  </bar>',
    '</foo>'
  ])

  const expected = '<foo><bar/></foo>'

  const rules = [
    {
      match: (node) => node.name !== 'baz',
      update: (node) => new Promise((resolve, reject) => {
        resolve({ node })
      })
    }
  ]

  const options = { ignoreUnknown: true }

  const bumper = new XMLBumpover(rules, options)

  return bumper.bump(input).then(actual => t.deepEqual(actual, expected))
})
