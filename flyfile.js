const Fly = require("fly")
const babel = require('rollup-plugin-babel')
const nodeResolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
const json = require('rollup-plugin-json')
// const svelte = require('rollup-plugin-svelte')
const print = console.log.bind(console)


const src = {
  js: 'src/**/js/index.js',
  css: 'src/**/css/index.css'
}

const dest = 'pub'

exports.clean = function*(fly) {
    yield fly.clear([dest]);
}

exports.js = function*(fly) {
  yield fly.source(src.js).rollup({
    rollup: {
      plugins: [
        nodeResolve({ jsnext: true, main: true, browser: true, preferBuiltins: false }),
        commonjs({ include: 'node_modules/**' }),
        json(),
        babel({
          exclude: [
            'node_modules/**',
            '*.json'
          ],
        }),
        // svelte({
        //   // By default, all .html and .svelte files are compiled
        //   // extensions: [ '.my-custom-extension' ],

        //   // You can restrict which files are compiled
        //   // using `include` and `exclude`
        //   include: 'src/components/**/*.html',

        //   // By default, the client-side compiler is used. You
        //   // can also use the server-side rendering compiler
        //   generate: 'ssr',

        //   // If you're doing server-side rendering, you may want
        //   // to prevent the client-side compiler from duplicating CSS
        //   css: false
        // }),
      ]
    },
    bundle: {
      format: 'iife',
      sourceMap: true,
      moduleName: 'window'
    }
  }).target(dest);
}

exports.default = async function(fly) {
  await fly.serial(['js'])
}

// const fly = new Fly(module.exports)

// fly.start('js')
// .then(print)
// .catch(print)
