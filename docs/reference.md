# API Reference

* [`Bumpover`](#bumpover)
  * [`Rules`](#rules)
    * [`match`](#match)
    * [`update`](#update)
    * [`struct`](#struct)
  * [`Options`](#options)
    * [`defaultValue`](#defaultvalue)
    * [`ignoreUnknown`](#ignoreunknown)
    * [`childKey`](#childkey)
    * [`serializer`](#serializer)
    * [`deserializer`](#deserializer)
* [`bumper`](#bumper)
  * [`bump`](#bump)
  * [`assert`](#assert)
  * [`test`](#test)
* [`JSONBumpover`](#jsonbumpover)
* [`XMLBumpover`](#xmlbumpover)

Bumpover exposes the following API:

``` js
import {
  Bumpover,
  JSONBumpover,
  XMLBumpover
} from 'bumpover'
```

## `Bumpover`
`Bumpover(rules: Array, options: Object) => bumper`

The `Bumpover` class receives `rules` validating and converting data, and optional `options` to customize bumping behaviors.

### Rules

``` js
const Rule = struct({
  match: 'function',
  update: 'function',
  struct: 'function?'
})

const Rules = struct([Rule])
```

Each rule should provide its `match` and `update` props, with an optional `struct`.

#### `match`
`(node: Node) => boolean`

Decide if a rule should be applied to current node. For each node, only the **first** rule matching it can be applied. So it makes sense putting the "universal" rules back in the rules array as fallback.

#### `update`
`(node: Node) => Promise<{ node: NewNode, action?: 'next'|'stop' }>`

Update the selected node into new shape inside promise, resolve your new node in the `node` field, with an optional `action` specifying whether continue traversing children of current node. If not, children of current node will be preserved by default.

#### `struct`
`Function`

Optional [struct](https://github.com/ianstormtaylor/superstruct/blob/master/docs/reference.md#struct) validating `NewNode`.

### Options

``` js
const Options = struct({
  defaultValue: 'any',
  ignoreUnknown: 'boolean',
  childKey: 'string',
  serializer: 'function',
  deserializer: 'function'
})
```

Following options are supported for bumping data.

#### `defaultValue`
Default value when `bumper.bump` resolves void data, `null` by default.

#### `ignoreUnknown`
Decide if current node should be ignored when no rule is matched, `false` by default.

#### `childKey`
Key string referencing children of a node. `'children'` by default.

> Providing wrong `childKey` may result in weird data shape.

#### `serializer`
Function serializing JSON data into your data structure. `(a) => a` by default.

#### `deserializer`
Function parsing your data structure into JSON. `(a) => a` by default.


## `bumper`
`Object`

Instance of `Bumpover` class.

### `bump`
`(input: any) => Promise<output: any>`

Bump `input` data into `output`.

### `assert`
`(input: any, expected: any) => Promise`

Compare whether `input` can be bumped into `expected`.

### `test`
`(input: any) => Promise`

Test if `input` can be bumped without rejection.


## `XMLBumpover`

Conform to same API as `Bumpover`, with its `bump` method receives and yields XML string.

> Please install `xml-js` to use `XMLBumpover`.


## `JSONBumpover`

Conform to same API as `Bumpover`, with `deserializer` and `serializer` replaced into `JSON.parse` and `JSON.stringify`.
