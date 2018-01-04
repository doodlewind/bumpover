# Walkthrough

Here are some snippets utilizing bumpover to validate and convert data.

- [Installing Bumpover](#installing-bumpover)
- [Validating Plain Object](#validating-plain-object)
- [Bumping Plain Object](#bumping-plain-object)
- [Bumping With Struct Validation](#bumping-with-struct-validation)
- [Bumping XML String](#bumping-xml-string)
- [Bumping Custom Data Format](#bumping-custom-data-format)
- [Async Data Bumping](#async-data-bumping)
- [Return Beforehand](#return-beforehand)
- [Keep or Discard Unknown Nodes](#keep-or-discard-unknown-nodes)


## Installing Bumpover

Bumpover has superstruct as peer dependency. So for installation simply:

```
npm install --save bumpover superstruct
```

Then you can import them into your code base:

``` js
import { Bumpover } from 'bumpover'
import { struct } from 'superstruct'
```


## Validating Plain Object

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

This has few to do with bumpover itself, while this approach is widely used in following examples. For more information, checkout [superstruct docs](https://github.com/ianstormtaylor/superstruct/blob/master/docs/guide.md).


## Bumping Plain Object

Say we'd like to transform the virtual DOM data above by replacing all `div` tags with `span` tags, keeping all other nodes intact. How do we handle it with reliability? You can traversing data yourself, or, simply defining `rules`:

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


## Bumping With Struct Validation

How to ensure the data is transformed as expected? Here comes the `rule.struct` field that helps. Suppose we're now migrating the `node.name` field to `node.tag` field, the data shape is changed. So we'll define a new struct:

``` js
const NewNode = struct({
  tag: 'string',
  props: 'object?',
  children: 'array'
})
```

Putting the `NewNode` into our rules, and bumpover will recursively check each new node conforms to our new shape:

``` js
const rules = [
  {
    match: node => 'name' in node,
    update: node => new Promise((resolve, reject) => {
      const { name, props, children } = node
      resolve({
        node: { tag: name, props, children }
      })
    })
    struct: NewNode
  }
]
```

This allows easier data validity checking with rules.


## Bumping XML String

Besides plain JavaScript object, transforming XML string is also trivial for bumpover. To do this we'll add dependency first:

```
npm install --save xml-js
```

> `xml-js` is not a peer dependency of bumpover, but it's required when bumping XML.

Then import `XMLBumpover`, which extends `Bumpover` under the hood.

``` js
import { XMLBumpover } from 'bumpover'
```

Now what if we'd still like to transform all `<div>` tags with `<span>`? Providing same rules is enough:

``` js
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

const input = `
<div>
  <div>demo</div>
</div>
`

const bumper = new XMLBumpover(rules)
bumper.bump(input).then(console.log)

// '<span><span>demo</span></span>'
```


## Bumping Custom Data Format

By default bumpover ships with three types of bumpers:

* `Bumpover` for bumping plain objects.
* `XMLBumpover` for bumping XML string.
* `JSONBumpover` for bumping JSON string.

So what if you have your own data or markup format? As long as you have its parser from & to JSON, you can bump it with your own bumpover! To prove this, let's see the source code of `JSONBumpover`:

``` js
import { Bumpover } from 'bumpover'

export class JSONBumpover extends Bumpover {
  constructor (rules, options) {
    super(rules, options)
    this.options = {
      ...this.options,
      serializer: JSON.stringify,
      deserializer: JSON.parse
    }
  }
}
```

Got it? By providing `serializer` and `deserializer`, you can manipulate **any** data format interchangeable with JSON.


## Async Data Bumping

Most of data validator is implemented in a synchronized way. This is generally terser with better performance, while for data migration, there are certain cases for async node transform:

Say you're transforming data of a legacy rich content editor, whose XML string has inlined external resources like `<img src="//example.com/demo.jpg">`. Migrating such `<img>` node requires fetching legacy image data, uploading it to your cloud storage, and filling new image node's `src` on upload ends. Since `rule.update` returns `Promise` instead node data, we can easily handle this case:

``` js
async function imageOps (node, resolve) {
  const image = await fetch(node.src)
  const newSrc = await uploadImage(image)
  resolve({
    node: { ...node, src: newSrc }
  })
}

const rules = [
  {
    match: node => node.name === 'img',
    update: node => new Promise((resolve, reject) => {
      imageOps(node, resolve, reject)
    })
  }
]
```


## Return Beforehand

By default bumpover walks through the entire node tree. While for some scenarios you may not want this. Take this data structure as an example:

``` html
<video width="320" height="240" controls>
  <source src="forrest_gump.mp4" type="video/mp4">
  <source src="forrest_gump.ogg" type="video/ogg">
  <track src="subtitles_en.vtt" kind="subtitles" srclang="en" label="English">
  <track src="subtitles_no.vtt" kind="subtitles" srclang="no" label="Norwegian">
</video>
```

The `<video>` tag is filled with unfamiliar content. During data migration, you may simply want to keep these content intact without writing too many boilerplate rules. Since these tags are contained by `<video>`, so one solution is to **keep `<video>`'s content with original shape**. We have `action` field resolved together with `node` for this case:

``` js
const rules = [
  {
    match: node => node.name === 'video',
    update: node => new Promise((resolve, reject) => {
      resolve({ action: 'stop', node })
    })
  }
]
```

Still can we transform the attributes of the outmost video tag, while since the `'stop'` action is provided, the content remains its shape.


## Keep or Discard Unknown Nodes

Another flexibility that bumpover provides is the `ignoreUnknown` option. Imagine two different scenarios migrating data:

1. For **incompatible** data migration, we only allow known nodes bumped into new version via rules.
2. For **compatible** data migration, most nodes can be kept, we only update certain nodes.

Case 1 happens when you paste content into rich text editor. Say you're pasting such content into an rich text editor that does not support editing images or quotes:

``` html
<quote>
  <img src="//example.com/demo.jpg">
  <p>demo</p>
</quote>
```

The data fragment will be normalized into such format, discarding `<quote>` and `<img>` nodes:

``` html
<p>demo</p>
```

This is the case when we need to ignore unknown nodes. While for data migration, you may only want to provide **one** rule that [updates image src](#async-data-bumping). With such config, new data may look like this:

``` html
<img src="//example.com/new-demo.jpg">
```

While the expected output shape is below:

``` html
<quote>
  <img src="//example.com/new-demo.jpg">
  <p>demo</p>
</quote>
```

To handle both scenarios, you can provide an `ignoreUnknown` option to bumpover, specifying the approach you want:

``` js
// Ignore unknown nodes.
const bumper = new Bumpover(rules, { ignoreUnknown: true })
```

For more information, please checkout [API reference](./reference.md).
