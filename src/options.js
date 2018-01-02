import { struct } from 'superstruct'

export const Options = struct({
  defaultValue: 'any',
  ignoreUnknown: 'boolean',
  childrenKey: 'string',
  serializer: 'function',
  deserializer: 'function'
})
