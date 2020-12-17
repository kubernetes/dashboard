module.exports = {
  mode: 'development',
  // Webpack will transpile TypeScript and JavaScript files.
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        // Every time Webpack sees a TypeScript file (except for node_modules)
        // it will use ts-loader to transpile it to JavaScript.
        test: /\.ts$/,
        exclude: [/node_modules/],
        use: [
          {
            loader: 'ts-loader',
            options: {
              // Skip typechecking to make the process quicker.
              transpileOnly: true
            }
          }
        ]
      }
    ]
  }
}
