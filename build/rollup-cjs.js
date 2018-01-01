import config from './rollup'

config.output = {
  file: './lib/index.js',
  format: 'cjs',
  name: 'Bumpover',
  sourcemap: true
}

export default config
