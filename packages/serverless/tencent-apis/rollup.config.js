import path from 'path'
import { defineConfig } from 'rollup'
import { terser } from 'rollup-plugin-terser'

import { getPackagesSync } from '@lerna/project'
import alias from '@rollup/plugin-alias'
import { babel } from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import { nodeResolve } from '@rollup/plugin-node-resolve'

const pkgs = getPackagesSync()

const plugins = [
  alias({
    entries: pkgs.reduce((entries, pkg) => {
      entries[pkg.name] = path.resolve(pkg.location, './src')
      return entries
    }, {})
  }),

  babel({
    babelHelpers: 'bundled',
    extensions: ['.js', '.ts'],
    presets: [
      ['@babel/preset-env', { targets: { node: 'current' } }],
      ['@babel/preset-typescript']
    ]
  }),

  nodeResolve({
    extensions: ['.js', '.ts'],
    preferBuiltins: true
  }),

  json(),
  commonjs(),
  terser()
]

export default defineConfig({
  input: './src/index.ts',

  output: [
    {
      file: './dist/index.js',
      format: 'cjs',
      name: 'BoxappTencentApis'
    }
  ],

  external: [
    '@grammyjs/menu',
    '@grammyjs/stateless-question',
    '@koa/router',
    'axios',
    'axios-cookiejar-support',
    'currency.js',
    'express',
    'grammy',
    'koa',
    'koa-json',
    'koa-mount',
    'tough-cookie'
  ],

  plugins
})
