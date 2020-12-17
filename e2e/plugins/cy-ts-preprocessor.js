const wp = require('@cypress/webpack-preprocessor');

const webpackOptions = {
  resolve: {extensions: ['.ts', '.js']},
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: [/node_modules/],
        use: [
          {
            loader: 'ts-loader',
            options: {configFile: 'ui/e2e/tsconfig.e2e.json'},
          },
        ],
      },
    ],
  },
};

const options = {webpackOptions};
module.exports = wp(options);
