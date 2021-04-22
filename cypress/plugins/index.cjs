import webpack from '@cypress/webpack-preprocessor';

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
            options: {configFile: 'aio/tsconfig.e2e.json'},
          },
        ],
      },
    ],
  },
};

export default async (on) => {
  on('file:preprocessor', webpack({webpackOptions}));
}
