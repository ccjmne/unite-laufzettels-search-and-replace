const path = require('path')

const webpack = require('webpack')

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
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new webpack.BannerPlugin({
      raw: true,
      entryOnly: true,
      banner: `
      // ==UserScript==
      // @name         Replace text in Laufzettels
      // @namespace    http://tampermonkey.net/
      // @version      1.0
      // @author       Eric NICOLAS <eric.nicolas@unite.eu>
      // @match        https://backoffice.intern.mercateo.com/prototype.tgui.server/
      // @icon         https://www.google.com/s2/favicons?sz=64&domain=mercateo.com
      // @grant        none
      // ==/UserScript==`,
    }),
  ],
}
