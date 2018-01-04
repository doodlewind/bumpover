import { struct } from 'superstruct'

export const Options = struct({
  defaultValue: 'any',
  ignoreUnknown: 'boolean',
  childKey: 'string',
  serializer: 'function',
  deserializer: 'function'
})
