const Fly = require("fly")
const babel = require('rollup-plugin-babel')
const nodeResolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
const json = require('rollup-plugin-json')
const replace = require('rollup-plugin-replace')
const print = console.log.bind(console)


const src = {
  js: 'src/**/js/index.js',
  css: 'src/**/css/*.css',
  img: 'src/**/img/*'
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
        // REF: https://github.com/rollup/rollup/issues/487
        replace({
          'process.env.NODE_ENV': JSON.stringify('development')
        }),
        babel({
          exclude: [
            'node_modules/**',
            '*.json'
          ],
        })
      ]
    },
    bundle: {
      format: 'iife',
      sourceMap: true,
      moduleName: 'window'
    }
  }).target(dest)
}

exports.css = function*(fly) {
  yield fly.source(src.css).target(dest)
}

exports.img = function*(fly) {
  yield fly.source(src.img).target(dest)
}

exports.default = function*(fly) {
  yield fly.serial(['js', 'css', 'img'])
}


if (require && require.main === module) {
  print('oi')
  const fly = new Fly({
    tasks: module.exports,
    plugins: [
      require('fly-clear'),
      require('fly-rollup')
    ]
  })

  fly.start('js')
    .then(res => print(res))
    .catch(err => {
      console.error(err)
    })
}
