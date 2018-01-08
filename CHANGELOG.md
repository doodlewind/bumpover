# Changelog
This document maintains a list of changes to the `bumpover` package with each new version. Until `1.0.0` is released, breaking changes will be added as minor version bumps, and smaller changes and fixes won't be detailed.


---


### `0.5.0` - January 8, 2018

###### NEW
- **Add `options.onUnmatch` handler.** This handler is called when a node is matched without rules and `ignoredUnknown` is false, which allows more control on unknown nodes.

- **Add `rule.childKey` props.** This allows custom child key for different types of nodes.

###### BREAKING
- **When struct validation fails, `StructError` is thrown instead of plain error.** This should not affect custom rules for now. Unifying errors thrown by superstruct allows for more accruate operations on specific errors.


---


### `0.4.0` - January 4, 2018

###### NEW
- **Actions now have `'next'` value by default.** This simplifies resolving API in promise, splitting the `action` boilerplate out.

- **Support UMD build.** This enables quick prototyping via `<script>` tag inside browser, .e.g., JSFiddle. For now `XMLBumpover` and `bumper.assert` are not supported with UMD version. As a workaround, you can [extend your own bumpover class](./docs/walkthrough.md#bumping-custom-data-format) parsing XML with UMD build.

###### BREAKING
- **`options.childrenKey` is renamed as `options.childKey`.** This is more consistent with the `childNodes` API in DOM.


---


### `0.3.0` - January 2, 2018

###### NEW
- **Added `bumper.test` and `bumper.assert` methods.** These methods are borrowed from superstruct.

- **Support `rule.struct` for validating nodes.** This makes validating bumped node easier, which is optional.

- **Added `options.defaultValue`.** This value is provided if promise is resolved with a "void" result.

###### BREAKING
- **`options.silent` is removed.** Silently swallowing errors will make debugging much harder.


---


### `0.2.0` - January 2, 2018

###### NEW
- **Added `XMLBumpover` and `JSONBumpover`.** These classes provide parsing support out of the box, and user can easily extends the core `Bumpover` with custom parsers.

###### BREAKING
- **Bumpover is exported as ES Module.** This avoids the conflict importing with the confusing `.default` keyword.

- **`bumper.bump` receives raw content instead of structured node.** This enables users customizing serializer and deserializer for their own data format.


---


### `0.1.0` - January 2, 2018

🎉
