import { struct } from 'superstruct'

export const Options = struct({
  defaultValue: 'any',
  ignoreUnknown: 'boolean',
  childKey: 'string',
  onUnmatch: 'function',
  serializer: 'function',
  deserializer: 'function'
})
