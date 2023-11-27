import path from 'node:path'
import { defineConfig } from 'rollup'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import alias from '@rollup/plugin-alias'
import inject from '@rollup/plugin-inject'

/** @type {import('rollup').RollupOptions} */
export default defineConfig({
  input: [
    'dist/index.js',
    'dist/bindings/browser.js',
  ],
  output: {
    dir: 'esm',
    preserveModules: true,
    preserveModulesRoot: 'dist',
  },
  plugins: [
    replace({
      preventAssignment: true,
      values: {
        'process.env.NODE_DEBUG': 'false',
      },
    }),
    nodeResolve({
      browser: true,
      preferBuiltins: false,
    }),
    commonjs(),
    alias({
      entries: [
        { find: 'path', replacement: 'path-browserify' },
        { find: 'stream', replacement: 'web-streams-polyfill/ponyfill/es2018' },
      ],
    }),
    inject({
      Buffer: [path.resolve('buffer-interop.js'), 'Buffer'],
    }),
  ],
})
