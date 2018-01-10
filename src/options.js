import { struct } from 'superstruct'

export const Options = struct({
  defaultValue: 'any',
  ignoreUnknown: 'boolean',
  childKey: 'string',
  beforeMatch: 'function',
  onUnmatch: 'function',
  serializer: 'function',
  deserializer: 'function'
})
