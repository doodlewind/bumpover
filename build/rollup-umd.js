import config from './rollup'

config.output = {
  file: './lib/bumpover.js',
  format: 'umd',
  name: 'Bumpover',
  sourcemap: true,
  globals: {
    'superstruct': 'Superstruct'
  }
}

export default config
