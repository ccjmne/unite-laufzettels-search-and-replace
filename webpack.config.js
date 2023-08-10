/* eslint-disable */
const path = require('path')

const webpack = require('webpack')

const { version } = require('./package.json')

// The built-in webpack.BannerPlugin somehow doesn't output the banner in production mode.
// See https://github.com/webpack/webpack/issues/6630
// Credit: https://github.com/webpack/webpack-cli/issues/312#issuecomment-732749280
class BannerPlugin {

  constructor(options) {
    this.banner = options.banner
  }

  apply(compiler) {
    compiler.hooks.emit.tapAsync('FileListPlugin', (compilation, callback) => {
      compilation.chunks.forEach(chunk => {
        chunk.files.forEach(filename => {
          const asset = compilation.assets[filename]
          asset._value = this.banner + asset._value
        })
      })

      callback()
    })
  }

}

/* eslint-enable */

module.exports = {
  entry: './max-len.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'search-and-replace.user.js',
    path: path.resolve(__dirname, 'userscripts'),
  },
  plugins: [
    new BannerPlugin({
      raw: true,
      entryOnly: true,
      banner: `
        // ==UserScript==
        // @name         Replace text in Laufzettels
        // @namespace    http://tampermonkey.net/
        // @version      ${version}
        // @author       Eric NICOLAS (ccjmne) <ccjmne@gmail.com>
        // @match        https://backoffice.intern.mercateo.com/prototype.tgui.server/
        // @icon         https://www.google.com/s2/favicons?sz=64&domain=mercateo.com
        // @grant        none
        // ==/UserScript==
      `.replace(/^\s+/gm, ''),
    }),
  ],
}
