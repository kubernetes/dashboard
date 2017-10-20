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
 * @fileoverview Configuration file for Protractor test runner.
 *
 * TODO(bryk): Start using ES6 modules in this file when supported.
 */
/* eslint strict: [0] */
'use strict';
require('babel-core/register');
const conf = require('./conf').default;
const path = require('path');

/**
 * Schema can be found here: https://github.com/angular/protractor/blob/master/docs/referenceConf.js
 * @return {!Object}
 */
function createConfig() {
  const config = {
    baseUrl: `http://localhost:${conf.frontend.serverPort}`,

    framework: 'jasmine',

    specs: [path.join(conf.paths.integrationTest, '**/*.js')],
  };

  if (conf.test.useSauceLabs) {
    let name = `Integration tests ${process.env.TRAVIS_REPO_SLUG}, build ` +
        `${process.env.TRAVIS_BUILD_NUMBER}, job ${process.env.TRAVIS_JOB_NUMBER}`;
    if (process.env.TRAVIS_PULL_REQUEST !== 'false') {
      name += `, PR: https://github.com/${process.env.TRAVIS_REPO_SLUG}/pull/` +
          `${process.env.TRAVIS_PULL_REQUEST}, job ${process.env.TRAVIS_JOB_NUMBER}`;
    }

    config.sauceUser = process.env.SAUCE_USERNAME;
    config.sauceKey = process.env.SAUCE_ACCESS_KEY;
    config.multiCapabilities = [
      {
        'browserName': 'chrome',
        'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
        'name': name,
      },
      {
        'browserName': 'firefox',
        'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
        'name': name,
      },
      // {
      //    TODO: disable for now until IE compatibility issues are fixed
      //    'browserName': 'internet explorer',
      //    'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
      //    'name': name,
      // },
    ];

    // Limit concurrency to not exhaust saucelabs resources for the CI user.
    config.maxSessions = 1;

  } else {
    config.capabilities = {'browserName': 'chrome'};
  }

  return config;
}

/**
 * Exported protractor config required by the framework.
 */
exports.config = createConfig();
