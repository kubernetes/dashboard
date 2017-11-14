// Copyright 2017 The Kubernetes Authors.
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
import fs from 'fs';
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
    bowerJson: JSON.parse(fs.readFileSync(path.join(conf.paths.base, 'package.json'))),
    directory: conf.paths.nodeModules,
    devDependencies: false,
    customDependencies: ['angular-mocks', 'google-closure-library'],
    onError: (msg) => {
      console.log(msg);
    },
  };

  return wiredep(wiredepOptions).js.concat([
    path.join(conf.paths.frontendTest, '**/*.json'),
    path.join(conf.paths.frontendTest, '**/*.js'),
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
    basePath: '.',

    files: getFileList(),

    logLevel: 'INFO',

    browserConsoleLogOptions: {terminal: true, level: ''},

    // Jasmine jquery is needed to allow angular to use JQuery in tests instead of JQLite.
    // This allows to get elements by selector(angular.element('body')), use find function to
    // search elements by class(element.find(class)) and the most important it allows to
    // directly test DOM changes on elements, f.e. changes of element width/height.
    frameworks: ['jasmine-jquery', 'jasmine', 'browserify', 'closure'],

    browserNoActivityTimeout: 5 * 60 * 1000,  // 5 minutes.

    reporters: ['dots', 'coverage'],

    coverageReporter: {
      dir: conf.paths.coverage,
      reporters: [
        {type: 'html', subdir: 'html'},
        {type: 'lcovonly', subdir: 'lcov'},
      ],
    },

    preprocessors: {},  // This field is filled with values later.

    // karma-browserify plugin config.
    browserify: {
      // Add source maps to output bundles.
      debug: true,
      // Make 'import ...' statements relative to the following paths.
      paths: [conf.paths.frontendSrc, conf.paths.frontendTest],
      transform: [
        // Transform ES2017 code into ES5 so that browsers can digest it.
        ['babelify'],
      ],
    },

    // karma-ng-html2js-preprocessor plugin config.
    ngHtml2JsPreprocessor: {
      stripPrefix: `${conf.paths.frontendSrc}/`,
      // Load all template related stuff under ng module as it's loaded with every module.
      moduleName: 'ng',
    },
  };

  // Use custom browser configuration when running on Travis CI.
  if (conf.test.useSauceLabs) {
    configuration.reporters.push('saucelabs');

    let testName;
    if (process.env.TRAVIS) {
      testName = `Karma tests ${process.env.TRAVIS_REPO_SLUG}, build ` +
          `${process.env.TRAVIS_BUILD_NUMBER}, job ${process.env.TRAVIS_JOB_NUMBER}`;
      if (process.env.TRAVIS_PULL_REQUEST !== 'false') {
        testName += `, PR: https://github.com/${process.env.TRAVIS_REPO_SLUG}/pull/` +
            `${process.env.TRAVIS_PULL_REQUEST}, job ${process.env.TRAVIS_JOB_NUMBER}`;
      }
    } else {
      testName = 'Local karma tests';
    }

    configuration.sauceLabs = {
      testName: testName,
      connectOptions: {port: 5757, logfile: 'sauce_connect.log'},
      public: 'public',
    },
    configuration.customLaunchers = {
      sl_firefox: {base: 'SauceLabs', browserName: 'firefox'},
      sl_ie: {base: 'SauceLabs', browserName: 'internet explorer'},
      // Chrome must be last to compute coverage correctly.
      sl_chrome: {base: 'SauceLabs', browserName: 'chrome'},
    };
    configuration.browsers = Object.keys(configuration.customLaunchers);

    // Set large capture timeout to prevent timeouts when executing on saucelabs.
    configuration.captureTimeout = 5 * 60 * 1000;  // 5 minutes.

    // Limit concurrency to not exhaust saucelabs resources for the CI user.
    configuration.concurrency = 1;
  } else {
    configuration.browsers = ['Chrome'];
  }

  // Convert all JS code written ES2017 with modules to ES5 bundles that browsers can digest.
  configuration.preprocessors[path.join(conf.paths.frontendTest, '**/*.js')] =
      ['browserify', 'closure', 'closure-iit'];
  configuration.preprocessors[path.join(
      conf.paths.nodeModules, 'google-closure-library/closure/goog/deps.js')] = ['closure-deps'];

  // Convert HTML templates into JS files that serve code through $templateCache.
  configuration.preprocessors[path.join(conf.paths.frontendSrc, '**/*.html')] = ['ng-html2js'];

  config.set(configuration);
};
