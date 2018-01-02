import cjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'
import node from 'rollup-plugin-node-resolve'

export default {
  input: './src/index.js',
  output: {
    file: './lib/index.es.js',
    format: 'es',
    sourcemap: true
  },
  plugins: [
    babel({
      // Default `.babelrc` is used for babel-node running test cases.
      // Use external-helpers specifically for rollup.
      babelrc: false,
      exclude: 'node_modules/**',
      presets: [
        [
          'env',
          { 'targets': { 'chrome': 60 }, 'modules': false }
        ],
        'stage-0'
      ],
      plugins: ['external-helpers'],
      sourceMap: true
    }),
    cjs({
      sourceMap: true
    }),
    node()
  ],
  external: ['superstruct', 'xml-js', 'assert']
}
