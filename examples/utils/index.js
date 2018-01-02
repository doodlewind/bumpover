import { deepEqual } from 'assert'

export const trim = str => str.replace(/\s/g, '')

export const match = (expected) => {
  return (output) => deepEqual(output, expected)
}

export const trace = e => {
  console.error(e)
  process.exit(1)
}
