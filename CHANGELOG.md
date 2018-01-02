# Changelog
This document maintains a list of changes to the `bumpover` package with each new version. Until `1.0.0` is released, breaking changes will be added as minor version bumps, and smaller changes and fixes won't be detailed.


---


### `0.2.0` - January 2, 2017

###### NEW
- **Added `XMLBumpover` and `JSONBumpover`.** These classes provides parsing support out of the box. And user can easily extends the core `Bumpover` with custom parsers.

###### BREAKING
- **Bumpover is exported as ES Module.** This avoids the conflict importing with the confusing `.default` keyword.

- **`bumper.bump` recieves raw content instead of structured node.** This enables users to customize serializer and deserializer for their own data format.


---


### `0.1.0` - January 2, 2017

🎉
