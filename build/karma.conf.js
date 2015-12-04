// Copyright 2015 Google Inc. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Configuration file for Karma test runner.
 *
 * Specification of Karma config file can be found at:
 * http://karma-runner.github.io/latest/config/configuration-file.html
 */
import path from 'path';
import wiredep from 'wiredep';

import conf from './conf';

/**
 * Returns an array of files required by Karma to run the tests.
 *
 * @return {!Array<string>}
 */
function getFileList() {
  // All app dependencies are required for tests. Include them.
  let wiredepOptions = {
    dependencies: true,
    devDependencies: true,
  };

  return wiredep(wiredepOptions).js.concat([
    path.join(conf.paths.frontendTest, '**/*.js'),
    path.join(conf.paths.frontendSrc, '**/*.js'),
    path.join(conf.paths.frontendSrc, '**/*.html'),
  ]);
}

/**
 * Exported default function which sets Karma configuration. Required by the framework.
 *
 * @param {!Object} config
 */
module.exports = function(config) {
  let configuration = {
    basePath: conf.paths.base,

    files: getFileList(),

    logLevel: 'WARN',

    frameworks: ['jasmine', 'browserify'],

    browsers: ['Chrome'],

    customLaunchers: {
      // Custom launcher for Travis CI. It is required because Travis environment cannot use
      // sandbox.
      chromeTravis: {
        base: 'Chrome',
        flags: ['--no-sandbox'],
      },
    },

    reporters: ['progress'],

    preprocessors: {},  // This field is filled with values later.

    plugins: [
      'karma-chrome-launcher',
      'karma-jasmine',
      'karma-ng-html2js-preprocessor',
      'karma-sourcemap-loader',
      'karma-browserify',
    ],

    // karma-browserify plugin config.
    browserify: {
      // Add source maps to outpus bundles.
      debug: true,
      // Make 'import ...' statements relative to the following paths.
      paths: [conf.paths.frontendSrc, conf.paths.frontendTest],
      transform: [
        // Transform ES6 code into ES5 so that browsers can digest it.
        ['babelify', {'presets': ['es2015']}],
      ],
    },

    // karma-ng-html2js-preprocessor plugin config.
    ngHtml2JsPreprocessor: {
      stripPrefix: `${conf.paths.frontendSrc}/`,
      moduleName: conf.frontend.moduleName,
    },
  };

  // Use custom browser configuration when running on Travis CI.
  if (process.env.TRAVIS) {
    configuration.browsers = ['chromeTravis'];
  }

  // Convert all JS code written ES6 with modules to ES5 bundles that browsers can digest.
  configuration.preprocessors[path.join(conf.paths.frontendTest, '**/*.js')] = ['browserify'];
  configuration.preprocessors[path.join(conf.paths.frontendSrc, '**/*.js')] = ['browserify'];

  // Convert HTML templates into JS files that serve code through $templateCache.
  configuration.preprocessors[path.join(conf.paths.frontendSrc, '**/*.html')] = ['ng-html2js'];

  config.set(configuration);
};
