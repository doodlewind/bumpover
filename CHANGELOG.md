# Changelog
This document maintains a list of changes to the `bumpover` package with each new version. Until `1.0.0` is released, breaking changes will be added as minor version bumps, and smaller changes and fixes won't be detailed.


---


### `0.3.0` - January 2, 2017

###### NEW
- **Added `bumper.test` and `bumper.assert` methods.** These methods are borrowed from superstruct.

- **Support `rule.struct` for validating nodes.** This makes validating bumped node easier, which is optional.

###### BREAKING
- **`options.silent` is removed.** Silently swallowing errors will make debugging much harder.


---


### `0.2.0` - January 2, 2017

###### NEW
- **Added `XMLBumpover` and `JSONBumpover`.** These classes provide parsing support out of the box, and user can easily extends the core `Bumpover` with custom parsers.

###### BREAKING
- **Bumpover is exported as ES Module.** This avoids the conflict importing with the confusing `.default` keyword.

- **`bumper.bump` recieves raw content instead of structured node.** This enables users customizing serializer and deserializer for their own data format.


---


### `0.1.0` - January 2, 2017

🎉
