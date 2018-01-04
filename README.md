<p align="center">
  <a href="#"><img src="./docs/images/banner.png" /></a>
</p>

<p align="center">
  Controllable toolkit bumping data structure.
</p>

<br/>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#why">Why</a> •
  <a href="#usage">Usage</a> •
  <a href="#examples">Examples</a> •
  <a href="#documentation">Documentation</a>
</p>

<p align="center">
  <a href="https://travis-ci.org/doodlewind/bumpover">
    <img src="https://travis-ci.org/doodlewind/bumpover.svg?branch=master">
  </a>
  <a href="https://coveralls.io/github/doodlewind/bumpover?branch=master">
    <img src="https://img.shields.io/coveralls/doodlewind/bumpover/master.svg?style=flat">
  </a>
  <a href="./package.json">
    <img src="https://img.shields.io/npm/v/bumpover.svg?maxAge=300&label=version&colorB=007ec6&maxAge=300">
  </a>
  <a href="./LICENSE">
    <img src="https://img.shields.io/npm/l/bumpover.svg?maxAge=300">
  </a>
  <a href="https://standardjs.com">
    <img src="https://img.shields.io/badge/code_style-standard-brightgreen.svg">
  </a>
</p>

Bumpover helps you writing data validation & migration script in a controllable and reliable way, which can be tedious and leaky with your bare arms.

By utilizing type annotation powered by [superstruct](https://github.com/ianstormtaylor/superstruct), it's super straightforward to define your own complex data types, leaving bumpover deal with your data at runtime. Besides XML and JSON support out of the box, you can even customize bumpover with your own parser, bumping any data format interchangeable with JSON.


## Features

* Declarative XML/JSON data validating and upgrading.
* Friendly type annotation with recursive data shape support.
* Promise-based async node upgrading, handy for external or linked data shape. e.g., grab image by link defined in XML node, upload it to your cloud storage, then update new node's `src` on response ends.
* Configurable traversing mechanism, e.g., whether returning beforehand or filtering out unknown nodes.
* Pluggable serializer and deserializer, supporting new data format in merely tens of lines.


## Why

Stable data structure is essential for a robust app, while during continual iteration, data structure **always** changes frequently. One common approach for compatibility is introducing more COMPAT code in business logic, which works but quickly stales codebase, sometimes with incompatible versions of data this is even not possible (Think about `.doc` and `.docx`). So here comes the necessity of data migration.

With modern web, it's trivial to ensure latest version of app code deployed on client. While for user data stored in DB, the difficulty upgrading them with script is pretty underestimated. Especially for data serialized and stored as string, parsing and migrating them can be formidable. Writing script transforming `'<p>123</p>'` to `{ paragraph: 123 }` is one thing, ensuring validity for gigabytes of data is another - And this is what bumpover is designed to handle.

Another scenario utilizing bumpover is sanitizing. Say you're working with a rich content editor whose data model supports nesting, it's essential to ensure valid data structure after each user input event, e.g., pasting and dragging. Generally you'll want to write declarative rules normalizing data, and this is also what bumpover offers.

For cases mentioned above, there are existing **runtime** data validation tools that helps, while they're not really popularized when compared with **compile time** type analysis tools, e.g., [TypeScript](https://www.typescriptlang.org/docs/handbook/basic-types.html) and [Flow](https://flow.org/en/docs/types/). Runtime data validation tools generally offers heavier API without much customizability, making them less friendly to work with. As an alternative, [superstruct](https://github.com/ianstormtaylor/superstruct) provides precise runtime data validation with a grammar closer to pure type annotations, making it powerful to express complex data types. Since bumpover relies deeply on it, it takes the advantage of superstruct to express your custom types and rules.


## Usage

> Before getting started, remember to install dependencies:

```
npm install --save bumpover superstruct
```

Then you can import them into your code base:

``` js
import { Bumpover } from 'bumpover'
import { struct } from 'superstruct'
```

With superstruct you can define your own data schema. Say you'd like to verify a node in virtual DOM tree with such shape:

``` js
const maybeNode = {
  name: 'div',
  props: { background: 'red' },
  children: []
}
```

We can define a struct validating this structure:

``` js
import { struct } from 'superstruct'

const Node = struct({
  name: 'string',
  props: 'object?',
  children: 'array'
})
```

Now we can use `Node` struct to validate data. You can simply call it as a function:

``` js
Node(maybeNode)
```

Detailed error will be thrown if data doesn't conform to the `Node` shape, or return the validated data when validation succeeds.

Now suppose we'd like to transform the virtual DOM data above by replacing all `div` tags with `span` tags, keeping all other nodes intact. How do we handle this with reliability? You can manually traverse data, or, simply define `rules`:

``` js
import { Bumpover } from 'bumpover'

const rules = [
  {
    match: node => node.name === 'div',
    update: node => new Promise((resolve, reject) => {
      resolve({
        node: { ...node, name: 'span' }
      })
    })
  }
]

const bumper = new Bumpover(rules)
bumper.bump(data).then(console.log)

// Receive new node data.
```

Simply providing rules converting nodes, then bumpover will walk and transform data for you. Several points:

* Rules are the single source of truth implementing your transform logic.
* Use `rule.match` to match the node you'd like to transform.
* Use `rule.update` to update node inside promise, which allows async updating.
* Wrap new node inside `node` field to be resoveld.


## Examples

More examples can be found in the [walkthrough](./docs/walkthrough.md) guide.

- [Bumping With Struct Validation](./docs/walkthrough.md#bumping-with-struct-validation)
- [Bumping XML String](./docs/walkthrough.md#bumping-xml-string)
- [Bumping Custom Data Format](./docs/walkthrough.md#bumping-custom-data-format)
- [Async Data Bumping](./docs/walkthrough.md#async-data-bumping)
- [Return Beforehand](./docs/walkthrough.md#return-beforehand)
- [Keep or Discard Unknown Nodes](./docs/walkthrough.md#keep-or-discard-unknown-nodes)


See [examples](./examples) for more working examples (WIP).


## Documentation

Check out [API reference](./docs/reference.md) for more details.


## Contribution

Issues and pull requests are welcomed! This project is still in its very early age, all kinds of help are precious and appreciated.


## License

This package is [MIT-licensed](./LICENSE).
