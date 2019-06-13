import {AngularCompilerPlugin} from '@ngtools/webpack'
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import path from 'path';

const postcssUrl = require('postcss-url');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const customProperties = require('postcss-custom-properties');

const projectRoot = path.resolve(__dirname, '../');
const deployUrl = '';
const baseHref = '';
const minimizeCss = false;

const postcssPlugins = () => {
  // safe settings based on: https://github.com/ben-eb/cssnano/issues/358#issuecomment-283696193
  const importantCommentRe = /@preserve|@licen[cs]e|[@#]\s*source(?:Mapping)?URL|^!/i;
  const minimizeOptions = {
    autoprefixer: false,
    safe: true,
    mergeLonghand: false,
    discardComments: {remove: (comment) => !importantCommentRe.test(comment)}
  };
  return [
    postcssUrl({
      filter: ({url}) => url.startsWith('~'),
      url: ({url}) => path.join(projectRoot, 'node_modules', url.substr(1)),
    }),
    postcssUrl([
      {
        // Only convert root relative URLs, which CSS-Loader won't process into require().
        filter: ({url}) => url.startsWith('/') && !url.startsWith('//'),
        url: ({url}) => {
          if (deployUrl.match(/:\/\//) || deployUrl.startsWith('/')) {
            // If deployUrl is absolute or root relative, ignore baseHref & use deployUrl as is.
            return `${deployUrl.replace(/\/$/, '')}${url}`;
          } else if (baseHref.match(/:\/\//)) {
            // If baseHref contains a scheme, include it as is.
            return baseHref.replace(/\/$/, '') + `/${deployUrl}/${url}`.replace(/\/\/+/g, '/');
          } else {
            // Join together base-href, deploy-url and the original URL.
            // Also dedupe multiple slashes into single ones.
            return `/${baseHref}/${deployUrl}/${url}`.replace(/\/\/+/g, '/');
          }
        }
      },
      {
        filter: (asset) => !asset.hash && !asset.absolutePath.endsWith('.cur'),
        url: 'inline',
        maxSize: 10
      }
    ]),
    autoprefixer(), customProperties({preserve: true})
  ].concat(minimizeCss ? [cssnano(minimizeOptions)] : []);
};

module.exports = {
  context: __dirname,

  entry: {
    'main': [
      path.resolve(__dirname, '../src/app/frontend/main.aot.ts'),
    ],
    'polyfills': [
      path.resolve(__dirname, '../src/app/frontend/polyfills.ts'),
    ],
    'styles': [
      '../node_modules/material-design-icons/iconfont/material-icons.css',
      '../node_modules/roboto-fontface/css/roboto/roboto-fontface.css',
      '../src/app/frontend/styles.scss'
    ],
  },

  resolve: {
    extensions: ['.ts', '.js'],
    modules: ['../node_modules'],
  },

  output: {
    path: path.resolve(__dirname, '../.tmp'),
    filename: '[name].bundle.js',
    chunkFilename: '[id].chunk.js',
    crossOriginLoading: false,
  },

  module: {
    rules: [
      {
        'exclude': [
          path.join(
              process.cwd(), '../node_modules/material-design-icons/iconfont/material-icons.css'),
          path.join(
              process.cwd(), '../node_modules/roboto-fontface/css/roboto/roboto-fontface.css'),
          path.join(process.cwd(), '../src/app/frontend/styles.scss')
        ],
        'test': /\.css$/,
        'use': [
          'exports-loader?module.exports.toString()',
          {'loader': 'css-loader', 'options': {'sourceMap': false, 'importLoaders': 1}}, {
            'loader': 'postcss-loader',
            'options': {'ident': 'postcss', 'plugins': postcssPlugins, 'sourceMap': false}
          }
        ]
      },
      {
        'include': [
          path.join(
              process.cwd(), '../node_modules/material-design-icons/iconfont/material-icons.css'),
          path.join(
              process.cwd(), '../node_modules/roboto-fontface/css/roboto/roboto-fontface.css'),
          path.join(process.cwd(), '../src/app/frontend/styles.scss')
        ],
        'test': /\.css$/,
        'use': [
          'style-loader',
          {'loader': 'css-loader', 'options': {'sourceMap': false, 'importLoaders': 1}}, {
            'loader': 'postcss-loader',
            'options': {'ident': 'postcss', 'plugins': postcssPlugins, 'sourceMap': false}
          }
        ]
      },
      {
        'exclude': [
          path.join(
              process.cwd(), '../node_modules/material-design-icons/iconfont/material-icons.css'),
          path.join(
              process.cwd(), '../node_modules/roboto-fontface/css/roboto/roboto-fontface.css'),
          path.join(process.cwd(), '../src/app/frontend/styles.scss')
        ],
        'test': /\.scss$|\.sass$/,
        'use': [
          'exports-loader?module.exports.toString()',
          {'loader': 'css-loader', 'options': {'sourceMap': false, 'importLoaders': 1}}, {
            'loader': 'postcss-loader',
            'options': {'ident': 'postcss', 'plugins': postcssPlugins, 'sourceMap': false}
          },
          {
            'loader': 'sass-loader',
            'options': {'sourceMap': false, 'precision': 8, 'includePaths': []}
          }
        ]
      },
      {
        'include': [
          path.join(
              process.cwd(), '../node_modules/material-design-icons/iconfont/material-icons.css'),
          path.join(
              process.cwd(), '../node_modules/roboto-fontface/css/roboto/roboto-fontface.css'),
          path.join(process.cwd(), '../src/app/frontend/styles.scss')
        ],
        'test': /\.scss$|\.sass$/,
        'use': [
          'style-loader',
          {'loader': 'css-loader', 'options': {'sourceMap': false, 'importLoaders': 1}}, {
            'loader': 'postcss-loader',
            'options': {'ident': 'postcss', 'plugins': postcssPlugins, 'sourceMap': false}
          },
          {
            'loader': 'sass-loader',
            'options': {'sourceMap': false, 'precision': 8, 'includePaths': []}
          }
        ]
      },
      {
        test: /\.(html)$/,
        loader: 'raw-loader',
      },
      {
        'test': /\.(eot|svg|cur)$/,
        'loader': 'file-loader',
        'options': {'name': '[name].[hash:20].[ext]', 'limit': 10000}
      },
      {
        'test': /\.(jpg|png|webp|gif|otf|ttf|woff|woff2|ani)$/,
        'loader': 'url-loader',
        'options': {'name': '[name].[hash:20].[ext]', 'limit': 10000}
      },
      {test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/, use: ['@ngtools/webpack']}
    ]
  },

  plugins: [
    new AngularCompilerPlugin({
      tsConfigPath: 'src/app/frontend/tsconfig.aot.json',
      sourceMap: true,
    }),
    new ExtractTextPlugin('styles.css'),
  ]
};
